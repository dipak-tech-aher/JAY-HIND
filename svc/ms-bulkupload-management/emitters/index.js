/* eslint-disable array-callback-return */
import { NotificationTemplate } from '@models'
import { config } from '@config/env.config'
import { EmailHelper, logger, defaultStatusCode, SMSHelper, defaultStatus, statusCodeConstants } from '@utils'
import { Op } from 'sequelize'
// get the reference of EventEmitter class of events module
const events = require('events')
const ST = require('stjs')

// create an object of EventEmitter class by using above reference
const em = new events.EventEmitter()
const { domainURL } = config

// Subscribe for USER_CREATED
em.on('USER_CREATED', async (user, conn) => {
  try {
    const { tranId, createdBy, createdDeptId, createdRoleId } = user
    const getUserList = await conn.User.findAll({
      where: {
        tranId
      }
    })

    const bulkUploadList = await conn.BulkUserTemp.findAll({
      where: {
        usersTranId: tranId,
        validationFlag: 'Y'
      }
    })
    // console.log('tempPassword', bulkUploadList)

    if (Array.isArray(getUserList) && (getUserList.length <= 0 || bulkUploadList.length <= 0)) {
      logger.debug('The user list is not available')
    } else {
      const finalList = getUserList.map(e => {
        const matchedObj = bulkUploadList.find(b => b.emailId === e.email)
        if (matchedObj) {
          return { ...e, loginPassword: matchedObj?.tempPassword }
        }
      })

      const emailHelper = new EmailHelper()
      const notificationTemplate = await getNotificationTemplate('CREATE-USER', 'WEB', 'Email', conn)
      if (notificationTemplate.status === 'SUCCESS') {
        console.log(finalList);
        finalList.forEach(async element => {
          const data = {
            loginId: element?.dataValues?.loginid,
            firstName: element?.dataValues?.firstName,
            aisoDomainURL: domainURL,
            email: element?.dataValues?.email,
            loginPassword: element?.loginPassword,
            inviteToken: element?.dataValues?.inviteToken
          }
          console.log(data);
          const htmlContent = ST.select(data).transformWith(notificationTemplate.data.body).root()

          const response = await emailHelper.sendMail({
            to: [data.email],
            subject: notificationTemplate.data.subject,
            message: htmlContent
          }, conn)
          await notificationLog('Email', '', 'WEB', element?.dataValues?.userId, null, element?.dataValues?.userId, response.status, notificationTemplate.data.subject,
            htmlContent, element?.dataValues?.email, null, null, createdDeptId, createdRoleId, tranId, createdBy, conn)
        })
      } else {
        logger.debug(notificationTemplate.message)
      }
    }
  } catch (error) {
    logger.error(error)
    return {
      status: statusCodeConstants.ERROR,
      message: 'Error while sending Email'
    }
  }
})

em.on('SEND_OTP', async (data) => {
  const emailHelper = new EmailHelper()
  const smsHelper = new SMSHelper()

  const template = await NotificationTemplate.findOne({
    where: {
      templateName: data?.type === 'email' ? 'Email OTP' : 'SMS To User',
      templateType: data?.type === 'email' ? 'TC_EMAIL' : 'TC_SMS'
    }
  })
  if (!template) {
    logger.debug('Email template not found,Please create template')
    return new Error('Email template not found,Please create template', { cause: { code: defaultStatusCode.VALIDATION_ERROR } })
  }
  const htmlContent = ST.select(data).transformWith(template.body).root()
  if (data?.type === 'email') {
    await emailHelper.sendMail({
      to: data?.reference,
      subject: template.subject.replace('{{OTP}}', data?.OTP),
      message: htmlContent
    })
  } else if (data?.type === 'mobile') {
    await smsHelper.sendSMS({
      to: data?.reference,
      extn: data?.extn,
      subject: template.subject.replace('{{OTP}}', data?.OTP),
      message: htmlContent
    })
  }
})

em.on('SEND_FORGOT_PASSWORD', async (data) => {
  const emailHelper = new EmailHelper()
  const { user, hashPassword, forgotPasswordToken, aisoDomainURL } = data

  const template = await NotificationTemplate.findOne({
    where: { templateName: 'Forgot Password', templateType: 'TC_EMAIL' }
  })
  if (!template) {
    logger.debug('Email template not found,Please create template')
    return new Error('Email template not found,Please create template', { cause: { code: defaultStatusCode.VALIDATION_ERROR } })
  }
  const emailData = {
    firstName: user.firstName,
    aisoDomainURL,
    email: user.email,
    hashPassword,
    forgotPasswordToken
  }

  const htmlContent = ST.select(emailData).transformWith(template.body).root()
  await emailHelper.sendMail({
    to: [user.email],
    subject: template.subject,
    message: htmlContent
  })
})

const getNotificationTemplate = async (type, channel, templateType, conn) => {
  // if (!type && !templateType && !channel) {
  //   return {
  //     status: 'ERROR',
  //     message: defaultMessage.VALIDATION_ERROR
  //   }
  // }
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

const notificationLog = async (notificationType, notifiationSource, channel, referenceId, referenceSubId, userId, status, subject, body, ccEmail, contactNo, customerId, createdDeptId, createdRoleId, tranId, createdBy, conn) => {
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
      createdDeptId,
      createdRoleId,
      tranId,
      createdBy
    }
    await conn.Notification.create(emailNotification)
  } catch (error) {
    return {
      status: 'ERROR',
      message: 'Internal server error'
    }
  }
}

module.exports = em
