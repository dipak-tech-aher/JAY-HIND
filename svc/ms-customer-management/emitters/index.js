import { Op } from 'sequelize'
import { defaultMessage, EmailHelper, statusCodeConstants, logger, constantCode } from '@utils'
const events = require('events')
const ST = require('stjs')

// create an object of EventEmitter class by using above reference
const em = new events.EventEmitter()

em.on('USER_CREATED', async (user, conn) => {
  try {
    const { userId, loginId, firstName, domainURL, email, loginPassword, inviteToken, type, channel, notifiationSource, createdDeptId, createdRoleId, tranId, createdBy } = user
    if (email) {
      const emailHelper = new EmailHelper()
      const notificationTemplate = await getNotificationTemplate(type, channel, 'TC_EMAIL', conn)
      if (notificationTemplate.status === 'SUCCESS') {
        const data = {
          loginId,
          firstName,
          aisoDomainURL: domainURL,
          email,
          loginPassword,
          inviteToken
        }

        const htmlContent = ST.select(data).transformWith(notificationTemplate.data.body).root()

        const response = await emailHelper.sendMail({
          to: [user.email],
          subject: notificationTemplate.data.subject,
          message: htmlContent
        }, conn)
        await notificationLog('Email', notifiationSource, channel, userId, null, userId, response.status, notificationTemplate.data.subject,
          htmlContent, email, null, null, createdDeptId, createdRoleId, tranId, createdBy, conn)
      } else {
        logger.debug(notificationTemplate.message)
      }
    } else {
      logger.debug('The Email is not present for this user')
    }
  } catch (error) {
    logger.error(error)
    return {
      status: statusCodeConstants.ERROR,
      message: 'Error while sending Email'
    }
  }
})

module.exports = em

const getNotificationTemplate = async (type, channel, templateType, conn) => {
  if (!type && !templateType && !channel) {
    return {
      status: 'ERROR',
      message: defaultMessage.VALIDATION_ERROR
    }
  }
  const template = await conn.NotificationTemplate.findOne({
    where: {
      templateType,
      templateStatus: constantCode.status.ACTIVE,
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
