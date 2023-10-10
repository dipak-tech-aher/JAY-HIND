// # get the reference of EventEmitter class of events module
import { startWorkFlowEngineManual } from '@services/workflow.service'
import { EmailHelper, SMSHelper, defaultMessage, defaultStatus, entityCategory, logger, statusCodeConstants, interactionFlowAction } from '@utils'
import { Op, QueryTypes } from 'sequelize'
import { config } from '@config/env.config'
const https = require('https')

/* create an object of EventEmitter class by using above reference */
const events = require('events')
const em = new events.EventEmitter()
const { getConnection } = require('@services/connection-service')
const ST = require('stjs')

const { webUrl } = config

em.on('SEND_INTERACTION_NOTIFICATION', async (notificationData) => {
  try {
    // const conn = await getConnection()

    console.log("notificationData ==> ", notificationData);

    const { consumerUser, businessUser, notifiationSource, referenceId, referenceSubId, customerId, departmentId, roleId, userId, channel, contactPreference, conn } = notificationData

    const notifyTypes = {
      TC_EMAIL: {
        key: 'Email'
      },
      TC_SMS: {
        key: 'SMS'
      },
      TC_WHATSAPP: {
        key: 'WhatsApp'
      }
    }

    const templateHdrs = await conn.TemplateHdr.findAll({
      where: {
        templateCategory: ['TC_EMAIL', 'TC_SMS', 'TC_WHATSAPP'],
        entity: 'TMC_INTERACTION',
        eventType: notificationData.eventType,
        status: defaultStatus.TPLACTIVE
      },
      raw: true
    })
    // console.log('templateHdrs ===> ', templateHdrs)
    // const mappedTemplates = await conn.TemplateMapping.findAll({
    //   where: {
    //     templateId: templateHdrs.map(x => x.templateId),
    //     status: defaultStatus.TPLACTIVE
    //   },
    //   raw: true
    // })

    // console.log(notificationData)

    const emailTemplates = templateHdrs.filter(x => {
      let condition = x.templateCategory == 'TC_EMAIL'
      // condition = condition && mappedTemplates.filter(y =>
      //   y.templateId == x.templateId &&
      //   y.mapCategory == notificationData.mapCategory &&
      //   y.tranCategory == notificationData.tranCategory &&
      //   y.tranType == notificationData.tranType &&
      //   y.serviceCategory == notificationData.serviceCategory &&
      //   y.serviceType == notificationData.serviceType
      // ).length > 0
      return condition
    })

    console.log('emailTemplates', emailTemplates)

    const smsTemplates = templateHdrs.filter(x => {
      let condition = x.templateCategory == 'TC_SMS'
      // condition = condition && mappedTemplates.filter(y =>
      //   y.templateId == x.templateId &&
      //   y.mapCategory == notificationData.mapCategory &&
      //   y.tranCategory == notificationData.tranCategory &&
      //   y.tranType == notificationData.tranType &&
      //   y.serviceCategory == notificationData.serviceCategory &&
      //   y.serviceType == notificationData.serviceType
      // ).length > 0
      return condition
    })

    console.log('smsTemplates', smsTemplates)

    const whatsappTemplates = templateHdrs.filter(x => {
      let condition = x.templateCategory == 'TC_WHATSAPP'
      // condition = condition && mappedTemplates.filter(y =>
      //   y.templateId == x.templateId &&
      //   y.mapCategory == notificationData.mapCategory &&
      //   y.tranCategory == notificationData.tranCategory &&
      //   y.tranType == notificationData.tranType &&
      //   y.serviceCategory == notificationData.serviceCategory &&
      //   y.serviceType == notificationData.serviceType
      // ).length > 0
      return condition
    })

    console.log('whatsappTemplates', whatsappTemplates)

    // template header entity - event type
    const allTemplates = await conn.NotificationTemplate.findAll({
      where: {
        templateHdrId: [
          ...emailTemplates.map(x => x.templateId),
          ...smsTemplates.map(x => x.templateId),
          ...whatsappTemplates.map(x => x.templateId)
        ]
      }
    })
    // console.log('email notify called... 4')
    // if (!allTemplates.length) {
    //   return {
    //     status: statusCodeConstants.VALIDATION_ERROR,
    //     message: 'Email template not found, Please create template'
    //   }
    // }

    // console.log('contactPreference ===>', contactPreference)
    if (contactPreference === 'CNT_PREF_WHATSAPP') {
      contactPreference?.push('CNT_PREF_WHATSAPP')
    }

    // console.log('contactPreference ===xx===>', contactPreference)

    if ((consumerUser?.email || businessUser?.email) && emailTemplates?.length > 0 && (contactPreference?.includes('CNT_PREF_EMAIL') || contactPreference?.includes('CNT_PREF_ANY'))) {
      // console.log('email contact preference there...')
      const emailHelper = new EmailHelper()
      const templates = allTemplates.filter(x => x.templateType === 'TC_EMAIL')
      for (let index = 0; index < templates.length; index++) {
        const notificationTemplate = templates[index]
        const userGroup = templateHdrs.find(x => x.templateId == notificationTemplate.templateHdrId)?.userGroup;
        console.log({ userGroup });
        const email = userGroup == 'UG_CONSUMER' ? consumerUser?.email : businessUser?.email
        const querySql = `SELECT * FROM ${notificationTemplate.dataSource} WHERE "intxnNo" = '${referenceId}';`;
        const data = await conn.sequelize.query(querySql, { type: QueryTypes.SELECT })
        // console.log('data for email ==> ', data)
        data[0].webUrl = webUrl
        const htmlContent = ST.select(data[0]).transformWith(notificationTemplate?.body).root()
        const subjectContent = ST.select(data[0]).transformWith(notificationTemplate?.subject).root()
        console.log("email ===> ", email)
        console.log("subjectContent ===> ", subjectContent)
        const response = await emailHelper.sendMail({
          to: [email],
          subject: subjectContent,
          message: htmlContent
        })
        // await notificationLog(notifyTypes[notificationTemplate?.templateType].key, notifiationSource, channel, referenceId, referenceSubId, userId, response.status, notificationTemplate.subject,
        //   htmlContent, email, customerId, departmentId, roleId, conn)
      }
    }

    const contactNoAvailable = (consumerUser?.contactNo && consumerUser?.contactNoPfx) || (businessUser?.contactNo && businessUser?.contactNoPfx)

    if (contactNoAvailable && smsTemplates?.length > 0 && (contactPreference?.includes('CNT_PREF_SMS') || contactPreference?.includes('CNT_PREF_ANY'))) {
      // console.log('sms contact preference there...')
      const smsHelper = new SMSHelper()
      const templates = allTemplates.filter(x => x.templateType === 'TC_SMS')
      for (let index = 0; index < templates.length; index++) {
        const notificationTemplate = templates[index]
        const data = await conn.sequelize.query(`SELECT * FROM ${notificationTemplate.dataSource} WHERE "intxnNo" = '${referenceId}';`, { type: QueryTypes.SELECT })
        // console.log('data for sms ==> ', data)
        data[0].webUrl = webUrl;
        const htmlContent = ST.select(data[0]).transformWith(notificationTemplate?.body).root()
        const userGroup = templateHdrs.find(x => x.templateId == notificationTemplate.templateHdrId)?.userGroup
        console.log({ userGroup });
        const contactNo = userGroup == 'UG_CONSUMER' ? consumerUser?.contactNo : businessUser?.contactNo
        const contactNoPfx = userGroup == 'UG_CONSUMER' ? consumerUser?.contactNoPfx : businessUser?.contactNoPfx
        const response = await smsHelper.sendSMS({
          to: contactNo,
          extn: contactNoPfx,
          subject: notificationTemplate?.subject,
          message: htmlContent
        })
        // await notificationLog('SMS', notifiationSource, channel, referenceId, referenceSubId, userId, response?.status, notificationTemplate.subject,
        //   htmlContent, null, contactNo, customerId, departmentId, roleId, conn)
      }
    }

    // console.log('contactPreference-------->', contactPreference)
    if (contactNoAvailable && (contactPreference?.includes('CNT_PREF_WHATSAPP') || contactPreference.includes('CNT_PREF_ANY'))) {
      try {
        logger.info('Sending whatsapp notification')
        const configResponse = await conn.BcaeAppConfig.findOne({
          attributes: ['notificationSetupPayload'],
          where: {
            status: defaultStatus.ACTIVE
          }
        })
        const notificationSetupPayload = configResponse?.dataValues ? configResponse?.dataValues?.notificationSetupPayload : configResponse?.notificationSetupPayload
        const notificationWhatsappSetting = notificationSetupPayload?.notificationWhatsappSetting
        const templates = allTemplates.filter(x => x.templateType === 'TC_WHATSAPP')
        for (let index = 0; index < templates.length; index++) {
          const notificationTemplate = templates[index]
          const data = await conn.sequelize.query(`SELECT * FROM ${notificationTemplate.dataSource} WHERE "intxnNo" = '${referenceId}';`, { type: QueryTypes.SELECT })
          data[0].webUrl = webUrl
          // console.log('data for sms ==> ', data)
          const htmlContent = ST.select(data[0]).transformWith(notificationTemplate?.body).root()
          const userGroup = templateHdrs.find(x => x.templateId == notificationTemplate.templateHdrId)?.userGroup
          console.log({ userGroup });
          const contactNo = userGroup == 'UG_CONSUMER' ? consumerUser?.contactNo : businessUser?.contactNo
          const contactNoPfx = userGroup == 'UG_CONSUMER' ? consumerUser?.contactNoPfx : businessUser?.contactNoPfx
          const json = {
            messaging_product: 'whatsapp',
            to: `${contactNoPfx}${contactNo}`,
            type: 'text',
            text: { body: htmlContent }
          }

          const whatsappPayload = JSON.stringify(json)
          const path = '/' + notificationWhatsappSetting?.version + '/' + notificationWhatsappSetting?.phoneNumberId + '/messages?access_token=' + notificationWhatsappSetting?.token
          // console.log('path:', path)
          const options = {
            host: 'graph.facebook.com',
            path,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          }
          const callback = (response) => {
            let str = ''
            response.on('data', (chunk) => {
              str += chunk
            })
            response.on('end', () => {
            })
          }
          const req = https.request(options, callback)
          req.on('error', (e) => {
            logger.info('Error occurred while sending whatsapp notification')
          })
          req.write(whatsappPayload)
          req.end()
          logger.info('Successfully sent whatsapp notification')
        }
      } catch (error) {
        logger.error(error, 'Error while sending whatsapp notification')
      }
    }
  } catch (error) {
    logger.error(error)
  }
})

em.on('INTERACTION_WORFKFLOW_ENGINE', async (interactionData) => {
  const conn = await getConnection()
  const startworklow = await startWorkFlowEngineManual(interactionData.intxnId, conn)
  logger.debug(startworklow)
})

em.on('SEND_INTERACTION_NOTIFICATION_DEPT', async (notificationData) => {
  try {
    const conn = await getConnection()
    const { email, notifiationSource, referenceId, referenceSubId, customerId, departmentId, roleId, userId, channel, type, interactionDescription, serviceType, intxnCause, status, priority, customerName, primaryContact } = notificationData
    const emailHelper = new EmailHelper()
    const notificationTemplate = await getNotificationTemplate(type, 'CHWEB', 'TC_EMAIL', conn)
    if (notificationTemplate.status === 'SUCCESS') {
      const data = {
        ticketId: referenceId,
        interactionDescription,
        serviceType,
        intxnCause,
        status,
        priority,
        customerName,
        primaryContact,
        assignedTo: ''
      }
      const htmlContent = ST.select(data).transformWith(notificationTemplate.data.body).root()
      const response = await emailHelper.sendMail({
        to: [email],
        subject: notificationTemplate.data.subject,
        message: htmlContent
      })
      // await notificationLog('Email', notifiationSource, channel, referenceId, referenceSubId, userId, response.status, notificationTemplate.data.subject,
      //   htmlContent, email, customerId, departmentId, roleId, conn)
    } else {
      logger.debug(notificationTemplate?.message)
      logger.error(`Error while sending Email Notification for Interaction Id: ${referenceId}`)
    }
  } catch (error) {
    logger.error(error)
  }
})

em.on('UPDATE_CREATE_POPUP_NOTIFICATION', async (notificationData) => {
  const conn = await getConnection()
  const t = await conn.sequelize.transaction()
  try {
    const {
      notificationType, subject, channel, body, intxnId, userId, roleId, departmentId, interactionNumber,
      status, intxnPriority, customerNo, assignedUserId, assignedDepartmentId, assignedRoleId, intxnStatus, userList, type, notificationSource
    } = notificationData

    if (type !== interactionFlowAction.FOLLOWUP) {
      const checkExistingPopUpIds = await conn.Notification.findAll({
        attributes: ['notificationId'],
        include: [{
          model: conn.NotificationUserEvents,
          as: 'notificationEvents',
          attributes: [],
          where: { isRead: false }
        }],
        where: {
          referenceNo: interactionNumber
        },
        distinct: true
      })

      if (checkExistingPopUpIds?.length > 0) {
        const Ids = checkExistingPopUpIds.map(item => item.notificationId)
        await conn.NotificationUserEvents.update({ isRead: true }, {
          where: {
            notificationId: Ids
          },
          transaction: t
        })
      }
    }
    if (intxnStatus !== 'CLOSED') {
      const notificationObj = {
        notificationType,
        subject,
        channel,
        body,
        userId: assignedUserId,
        roleId: assignedRoleId || roleId,
        departmentId: assignedDepartmentId || departmentId,
        referenceId: intxnId,
        notificationSource: notificationSource || entityCategory.INTERACTION,
        sentAt: new Date(),
        status,
        createdBy: userId,
        payload: {
          entity: {
            entityId: interactionNumber,
            priority: intxnPriority,
            customerNo
          }
        },
        referenceNo: interactionNumber,
        createdDeptId: departmentId,
        createdRoleId: roleId
      }
      const createNotification = await conn.Notification.create(notificationObj, { transaction: t })
      const notificationId = createNotification?.dataValues?.notificationId ?? createNotification?.notificationId
      const notificationEventArray = []
      if (userList && assignedUserId && Array.isArray(userList) && userList.length > 0) {
        userList.forEach(e => {
          notificationEventArray.push({
            notificationId,
            userId: e.userId,
            isRead: false,
            isPinned: false,
            createdDeptId: departmentId,
            createdRoleId: roleId,
            createdBy: userId
          })
        })
      } else {
        notificationEventArray.push({
          notificationId,
          userId: assignedUserId || userId,
          isRead: false,
          isPinned: false,
          createdDeptId: departmentId,
          createdRoleId: roleId,
          createdBy: userId
        })
      }
      await conn.NotificationUserEvents.bulkCreate(notificationEventArray, { transaction: t })
    }
    t.commit()
  } catch (error) {
    logger.error(error)
  } finally {
    if (t && !t.finished) {
      await t.rollback()
    }
  }
})

module.exports = em

const getNotificationTemplate = async (type, channel, templateType, conn) => {
  console.log('type---->', type)
  console.log('channel---->', channel)
  console.log('templateType---->', templateType)
  if (!type && !templateType && !channel) {
    return {
      status: 'ERROR',
      message: defaultMessage.VALIDATION_ERROR
    }
  }
  const template = await conn.NotificationTemplate.findOne({
    where: {
      templateType,
      templateStatus: defaultStatus.ACTIVE,
      [Op.and]: [conn.sequelize.literal(`mapping_payload->>'channel' =  '${channel}'`),
      conn.sequelize.literal(`mapping_payload->> 'type' = '${type}'`)
      ]
    }
  })
  if (!template) {
    return { status: 'ERROR', message: 'No Email Template found' }
  }
  return { status: 'SUCCESS', data: template }
}

const notificationLog = async (notificationType, notifiationSource, channel, referenceId, referenceSubId, userId, status, subject, body, ccEmail, contactNo, customerId, departmentId, roleId, conn) => {
  try {
    /** Adding Notification Log */
    const emailNotification = {
      notificationType,
      notifiationSource,
      channel,
      referenceId,
      referenceSubId,
      userId,
      status,
      subject,
      body,
      ccEmail,
      contactNo,
      sentAt: new Date(),
      customerId,
      departmentId,
      roleId,
      createdBy: userId
    }
    await conn.Notification.create(emailNotification)
  } catch (error) {
    console.log(error)
    return {
      status: 'ERROR',
      message: 'Internal server error'
    }
  }
}
