import { authentication } from '@config/azure.config'
import { config } from '@config/env.config'
import { constantCode, logger, statusCodeConstants } from '@utils'
import axios from 'axios'
import { isEmpty } from 'lodash'
import { Op } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import Got from 'got'

const { convert } = require('html-to-text')
const ST = require('stjs')
const { systemUserId, systemDeptId, systemRoleId, tenantId } = config
const { getTenantConnection } = require('@services/connection-service')

export const processFetchingHelpdeskMails = async () => {
  const conn = await getTenantConnection(tenantId)
  logger.debug('Processing fetch recodrs from Helpdesk mail box')

  const t = await conn.sequelize.transaction()

  try {
    let azureDetails = await conn.BcaeAppConfig.findOne({
      attribute: ['portalSetupPayload'],
      where: {
        status: constantCode.status.ACTIVE
      }
    })
    azureDetails = azureDetails.dataValues?.portalSetupPayload ? azureDetails.dataValues?.portalSetupPayload : azureDetails?.portalSetupPayload
    const getAccessToken = await authentication(azureDetails.emailPortalSetting.url, azureDetails.emailPortalSetting.grantType, azureDetails.emailPortalSetting.clientId, azureDetails.emailPortalSetting.secret, azureDetails.emailPortalSetting.scope)
    const { accessToken } = getAccessToken
    logger.debug('Fetching unread mails from the Inbox')
    const url = azureDetails.emailPortalSetting.inboxUrl + '/mailFolders/Inbox/messages?$filter=isRead ne true'
    let unReadMessages = await axios.get(url, {
      headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + accessToken }
    })
    unReadMessages = unReadMessages?.data

    logger.debug('Count of unread Emails: ' + unReadMessages.value.length)
    if (unReadMessages && Array.isArray(unReadMessages.value) && !isEmpty(unReadMessages.value)) {
      for (const message of unReadMessages.value) {
        const messageId = message.id
        const email = message.sender.emailAddress.address
        const customerName = message.sender.emailAddress.name
        const content = convert(message.body.content, {
          wordwrap: 130
        })
        const receivedDateTime = message.receivedDateTime
        const subject = message.subject
        const helpdeskEmail = message.toRecipients?.[0]?.emailAddress?.address

        let helpdeskId
        let hasInteraction
        let isNewEmail = false
        let emailSubject = message.subject.split('Re: ')[1]
        if (!emailSubject) {
          emailSubject = message.subject.split('RE: ')[1]
          if (!emailSubject) {
            emailSubject = message.subject
            isNewEmail = true
          }
        }

        const hasHelpdesk = await conn.Helpdesk.findOne({
          where: {
            email: {
              [Op.and]: [
                conn.sequelize.where(conn.sequelize.fn('UPPER', conn.sequelize.col('Helpdesk.mail_id')),
                  { [Op.eq]: email.toUpperCase() }
                )]
            },
            title: {
              [Op.and]: [
                conn.sequelize.where(conn.sequelize.fn('UPPER', conn.sequelize.col('Helpdesk.helpdesk_subject')),
                  { [Op.eq]: emailSubject.toUpperCase() }
                )]
            },
            status: {
              [Op.or]: [constantCode.status.NEW, constantCode.status.HOLD, constantCode.status.CLOSED, constantCode.status.WIP, constantCode.status.CANCELLED, constantCode.status.ASSIGNED]
            }
          }
        })

        if (hasHelpdesk) {
          helpdeskId = hasHelpdesk?.dataValues?.helpdeskId ? hasHelpdesk?.dataValues?.helpdeskId : hasHelpdesk?.helpdeskId
          hasInteraction = await conn.Interaction.findOne({
            where: { helpdeskId }
          })
        }

        const commonAttris = {
          tranId: uuidv4(),
          createdDeptId: systemDeptId,
          createdRoleId: systemRoleId,
          createdBy: systemUserId,
          updatedBy: systemUserId
        }

        if (!hasHelpdesk && !hasInteraction && isNewEmail) {
          const helpdesk = await createHelpdesk(messageId, content, email, customerName, receivedDateTime, subject, helpdeskEmail, commonAttris, conn, t)
          helpdeskId = helpdesk.helpdeskId
          await createHelpdeskTxn(helpdeskId, messageId, constantCode.status.NEW, content, constantCode.helpdesk.CREATED, email, receivedDateTime, commonAttris, conn, t)
          await markAsRead(messageId, azureDetails, accessToken)
          await acknowledgeCustomer(email, customerName, messageId, helpdeskId, accessToken, constantCode.status.NEW, azureDetails, conn)
        } else if (hasHelpdesk && (hasHelpdesk.status === constantCode.status.NEW || hasHelpdesk.status === constantCode.status.WIP ||
            hasHelpdesk.status === constantCode.status.HOLD || hasHelpdesk.status === constantCode.status.ASSIGNED) && !hasInteraction && (!isNewEmail || isNewEmail)) {
          await createNotification(email, subject, helpdeskId, commonAttris, conn, t)
          await createHelpdeskTxn(helpdeskId, messageId, hasHelpdesk.status, content, constantCode.helpdesk.FOLLOW_UP, email, receivedDateTime, commonAttris, conn, t)
          await markAsRead(messageId, azureDetails, accessToken)
          await acknowledgeCustomer(email, customerName, messageId, helpdeskId, accessToken, constantCode.status.WIP, azureDetails, conn)
        } else if (hasHelpdesk && (hasHelpdesk.status === constantCode.status.CLOSED || hasHelpdesk.status === constantCode.status.CANCELLED) && !hasInteraction && !isNewEmail) {
          await markAsRead(messageId, azureDetails, accessToken)
          await acknowledgeCustomer(email, customerName, messageId, helpdeskId, accessToken, constantCode.status.CLOSED, azureDetails, conn)
        } else if (hasHelpdesk && (hasHelpdesk.status === constantCode.status.CLOSED || hasHelpdesk.status === constantCode.status.CANCELLED) && hasInteraction && hasInteraction.currStatus !== constantCode.status.CLOSED && !isNewEmail) {
          await createNotification(email, subject, helpdeskId, commonAttris, conn, t)
          await createHelpdeskTxn(helpdeskId, messageId, hasHelpdesk.status, content, constantCode.helpdesk.FOLLOW_UP, email, receivedDateTime, commonAttris, conn, t)
          await markAsRead(messageId, azureDetails, accessToken)
          await acknowledgeCustomer(email, customerName, messageId, helpdeskId, accessToken, constantCode.status.WIP, azureDetails, conn)
        } else if (hasHelpdesk && (hasHelpdesk.status === constantCode.status.CLOSED || hasHelpdesk.status === constantCode.status.CANCELLED) && hasInteraction && hasInteraction.currStatus === constantCode.status.CLOSED && !isNewEmail) {
          await markAsRead(messageId, azureDetails, accessToken)
          await acknowledgeCustomer(email, customerName, messageId, helpdeskId, accessToken, constantCode.status.CLOSED, azureDetails, conn)
        }

        // Need to check for attachment

        if (message.hasAttachments) {
          // await createAttachments(azureDetails, messageId, accessToken, helpdeskId, conn, t)
        }
      }
    }
    await t.commit()
  } catch (error) {
    logger.error(error, 'Error while creating help desk ticket')
  } finally {
    if (t && !t.finished) {
      await t.rollback()
    }
  }
}

const createHelpdesk = async (messageId, content, email, customerName, receivedDateTime, subject, helpdeskEmail, commonAttris, conn, t) => {
  logger.debug('Creating helpdesk record')

  let checkExistingContact = await getContactDetails(email, conn)
  if (checkExistingContact.status === 200) {
    checkExistingContact = checkExistingContact?.data?.dataValues ? checkExistingContact?.data?.dataValues : checkExistingContact?.data
  } else {
    checkExistingContact = null
  }

  const helpdesk = {
    status: constantCode.status.NEW,
    helpdeskSubject: subject,
    statusChngDate: new Date(),
    helpdeskSource: constantCode.source.EMAIL,
    mailId: email,
    contactId: checkExistingContact ? checkExistingContact.contactId : null,
    userCategory: checkExistingContact ? checkExistingContact.contactCategory : null,
    userCategoryValue: checkExistingContact ? checkExistingContact.contactCategoryValue : null,
    helpdeskContent: content,
    referenceId: messageId,
    helpdeskUuid: uuidv4(),
    messageDateTime: receivedDateTime,
    helpdeskEmail: helpdeskEmail || '',
    userName: customerName,
    ...commonAttris
  }
  const response = await conn.Helpdesk.create(helpdesk, { transaction: t })
  logger.debug('Successfully created helpdesk record')
  return response
}

const markAsRead = async (messageId, azureDetails, accessToken) => {
  logger.debug('Updating mail status as read')
  const updateUrl = azureDetails.emailPortalSetting.inboxUrl + '/mailFolders/Inbox/messages/' + messageId
  await axios.patch(updateUrl, { isRead: true }, {
    headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + accessToken },
    // url: updateUrl,
    retry: 0
  })
  logger.debug('Successfully updated mail status as read')
}

const acknowledgeCustomer = async (address, name, messageId, ticketId, accessToken, source, azureDetails, conn) => {
  logger.debug('Acknowledgeing customer')
  let templateName
  if (source === constantCode.status.NEW) {
    templateName = 'Acknowledge New Ticket'
  } else if (source === constantCode.status.WIP) {
    templateName = 'Acknowledge WIP Ticket'
  } else if (source === constantCode.status.CLOSED) {
    templateName = 'Acknowledge Closed Ticket'
  }
  const template = await conn.NotificationTemplate.findOne({
    where: {
      templateName,
      templateType: 'TC_EMAIL'
    }
  })
  if (template) {
    const data = {
      name,
      ticketId
    }
    const body = ST.select(data).transformWith(template.body).root()
    const reqBody = {
      message: { toRecipients: [{ emailAddress: { address, name } }] },
      comment: body
    }
    const url = azureDetails.emailPortalSetting.inboxUrl + '/mailFolders/Inbox/messages/' + messageId + '/reply'
    await axios.post(url, reqBody, {
      headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + accessToken },
      // url,
      retry: 0
    })
  } else {
    logger.debug('Email template not found,Please create acknowledge template')
  }
  logger.debug('Successfully acknowledged customer')
}

const createNotification = async (email, subject, helpdeskId, commonAttris, conn, t) => {
  logger.debug('Helpdesk has already has record, creating Notification record')
  const reqBody = {
    notificationType: 'Email',
    channel: 'WEB',
    referenceId: helpdeskId,
    userId: systemUserId,
    status: 'SENT',
    subject,
    body: 'Duplicate helpdesk mail has raised by customer, Here is the helpdesk id: ' + helpdeskId,
    ccEmail: email,
    sentAt: new Date(),
    ...commonAttris
  }
  await conn.Notification.create(reqBody, { transaction: t })
  logger.debug('Successfully created notification record')
}

const createHelpdeskTxn = async (helpdeskId, messageId, status, content, helpdeskActionRemark, email, receivedDateTime, commonAttris, conn, t) => {
  logger.debug('Creating helpdesk txn record')
  const helpdeskTxn = {
    helpdeskId,
    status,
    statusChngDate: new Date(),
    helpdeskContent: content,
    helpdeskActionRemark,
    referenceId: messageId,
    helpdeskTxnUuid: uuidv4(),
    messageDateTime: receivedDateTime,
    ...commonAttris
  }
  await conn.HelpdeskTxn.create(helpdeskTxn, { transaction: t })
  logger.debug('Successfully created helpdesk txn record')
}

const getContactDetails = async (emailId, conn) => {
  try {
    if (!emailId) {
      return {
        status: statusCodeConstants.VALIDATION_ERROR,
        message: 'Please provide the email Id'
      }
    }

    const response = await conn.Contact.findOne({
      where: {
        emailId: conn.sequelize.where(conn.sequelize.fn('LOWER', conn.sequelize.col('email_id')), '=', emailId.toLowerCase()),
        contactCategory: [constantCode?.entityCategory?.CUSTOMER, constantCode?.entityCategory?.PROFILE]
      }
    })
    if (!response) {
      return {
        status: statusCodeConstants.NOT_FOUND,
        message: 'Email Id not found in the system'
      }
    }
    return {
      status: statusCodeConstants.SUCCESS,
      message: 'Contact details fetched successfully',
      data: response
    }
  } catch (error) {
    logger.error(error)
    return {
      status: statusCodeConstants.ERROR,
      message: 'Internal server error'
    }
  }
}

export const processReplyingEmail = async () => {
  const conn = await getTenantConnection(tenantId)
  logger.debug('Processing pending email replies...')
  let t
  try {
    const getAllHelpdeskReplies = await conn.Notification.findAll({
      where: {
        status: 'HELPDESK_REPLY'
      }
    })

    logger.debug('Count of emails to reply:', getAllHelpdeskReplies?.length)
    if (Array.isArray(getAllHelpdeskReplies) & !isEmpty(getAllHelpdeskReplies)) {
      for (const msg of getAllHelpdeskReplies) {
        try {
          const checkExistingHelpdesk = await conn.Helpdesk.findOne({
            where: {
              helpdeskId: msg.referenceId
            }
          })

          if (checkExistingHelpdesk) {
            // need to get Attachment
            let attachmentsInfo
            if (msg?.refernceSubId) {
              attachmentsInfo = await conn.Attachment.findAll({
                where: {
                  entityId: msg?.refernceSubId?.toString(),
                  entityType: 'HELPDESK'
                }
              })
            }

            const attachmentslength = attachmentsInfo?.length || 0
            const attachmentDetails = []
            if (Array.isArray(attachmentsInfo) & !isEmpty(attachmentsInfo)) {
              for (const attachment of attachmentsInfo) {
                attachmentDetails.push({
                  '@odata.type': '#microsoft.graph.fileAttachment',
                  name: attachment.fileName,
                  contentType: attachment?.fileType,
                  contentBytes: attachment.attachedContent
                })
              }
            }
            const reqBody = {
              message: {
                toRecipients: [
                  {
                    emailAddress: {
                      address: msg?.ccEmail
                    }
                  }
                ],
                attachments: attachmentslength > 0
                  ? [
                      ...attachmentDetails
                    ]
                  : []
              },
              comment: msg.body
            }

            // let azureDetails = await conn.PortalSetting.findOne({
            //   where: {
            //     settingType: constantCode.common.HELPDESK_EMAIL
            //   }
            // })
            // azureDetails = azureDetails.dataValues ? azureDetails.dataValues : azureDetails

            let azureDetails = await conn.BcaeAppConfig.findOne({
              attribute: ['portalSetupPayload'],
              where: {
                status: constantCode.status.ACTIVE
              }
            })
            azureDetails = azureDetails.dataValues?.portalSetupPayload ? azureDetails.dataValues?.portalSetupPayload : azureDetails?.portalSetupPayload
            const { accessToken } = await authentication(azureDetails.emailPortalSetting.url, azureDetails.emailPortalSetting.grantType, azureDetails.emailPortalSetting.clientId, azureDetails.emailPortalSetting.secret, azureDetails.emailPortalSetting.scope)
            logger.debug('Fetching unread mails from the Inbox')
            const url = azureDetails.emailPortalSetting.inboxUrl + '/mailFolders/Inbox/messages/' + checkExistingHelpdesk.referenceId + '/reply'
            // await axios.post(url, {
            //   headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + accessToken },
            //   body: JSON.stringify(reqBody),
            //   retry: 0
            // })

            const config = {
              method: 'post',
              maxBodyLength: Infinity,
              url,
              headers: {
                'content-type': 'application/json', Authorization: 'Bearer ' + accessToken
              },
              data: JSON.stringify(reqBody)
            }

            await axios.request(config)
              .catch((error) => {
                console.error(error)
              })

            t = await conn.sequelize.transaction()
            const data = {
              status: 'SENT',
              sentAt: new Date()
            }
            await conn.Notification.update(data, {
              where: {
                notificationId: msg.notificationId
              },
              transaction: t
            })
            await t.commit()
          }
        } catch (error) {
          logger.error(error, 'Unexpected error while sending email')
        }
      }
    }
    logger.debug('Finished processing pending email replies.')
  } catch (error) {
    logger.error(error, 'Error while processing reply emails')
  } finally {
    if (t && !t.finished) {
      await t.rollback()
    }
  }
}

const createAttachments = async (azureDetails, messageId, accessToken, helpdeskId, conn, t) => {
  try {
    logger.debug('Fetching attachments from mail')
    const attachmentUrl = azureDetails.emailPortalSetting.inboxUrl + '/mailFolders/Inbox/messages/' + messageId + '/attachments'
    let attachments = await Got.get({
      headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + accessToken },
      url: attachmentUrl,
      retry: 0
    })
    attachments = JSON.parse(attachments.body)
    logger.debug('Mail attachments count: ', attachments.value.length)
    if (attachments && Array.isArray(attachments.value) && !isEmpty(attachments.value)) {
      for (const attachment of attachments.value) {
        const attachmentData = {
          fileName: attachment.name,
          content: 'data:' + attachment.contentType + ';' + 'base64,' + attachment.contentBytes,
          fileType: attachment.contentType,
          entityId: helpdeskId,
          entityType: 'HELPDESK',
          status: 'FINAL',
          createdBy: systemUserId,
          updatedBy: systemUserId
        }
        logger.debug('Creating attachment record')
        await conn.Attachment.create(attachmentData, { transaction: t })
        logger.debug('Attachment created successfully ')
      }
    } 
  } catch (error) {
    console.log("from create attachment ==> ", error)
  }
}
