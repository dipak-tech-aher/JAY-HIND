/* eslint-disable no-unused-vars */
import { defaultMessage, constantCode, EmailHelper, logger } from '@utils'
import { Op } from 'sequelize'

// get the reference of EventEmitter class of events module
const events = require('events')
const em = new events.EventEmitter()
const { getConnection } = require('@services/connection-service')
const ST = require('stjs')

em.on('SEND_HELPDESK_NOTIFICATION', async (notificationData) => {
  const conn = await getConnection()

  const { mailId, notifiationSource, referenceId, referenceSubId, customerId, departmentId, roleId, userId, channel, type, name, createdDeptmentId, createdRoleId, tranId } = notificationData
  if (mailId) {
    const emailHelper = new EmailHelper()
    const notificationTemplate = await getNotificationTemplate(type, channel, 'TC_EMAIL', conn)
    if (notificationTemplate.status === 'SUCCESS') {
      const data = {
        ticketId: referenceId,
        name
      }
      const htmlContent = ST.select(data).transformWith(notificationTemplate.data.body).root()
      const response = await emailHelper.sendMail({
        to: [mailId],
        subject: notificationTemplate.data.subject,
        message: htmlContent
      })
      await notificationLog('Email', notifiationSource, channel, referenceId, referenceSubId, userId, response.status, notificationTemplate.data.subject,
        htmlContent, mailId, null, customerId || null, departmentId, roleId, createdDeptmentId, createdRoleId, tranId, conn)
    } else {
      logger.error(`Error while sending Email Notification for Helpdesk Id: ${referenceId} due to email template not found`)
    }
  }
})

em.on('SEND_HELPDESK_REPLY', async (notificationData) => {
  try {
    const conn = await getConnection()
    const { mailId, notifiationSource, referenceId, referenceSubId, customerId, departmentId, roleId, userId, channel, type, name, createdDeptmentId, createdRoleId, tranId, helpdeskContent } = notificationData
    if (mailId) {
      await notificationLog('Email', notifiationSource, channel, referenceId, referenceSubId, userId, constantCode.status.HELPDESK_REPLY, helpdeskContent.subject,
        helpdeskContent.content, mailId, null, customerId || null, departmentId, roleId, createdDeptmentId, createdRoleId, tranId, conn)
    }
  } catch (error) {
    logger.error('Error while sending Helpdesk reply', error)
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

const notificationLog = async (notificationType, notifiationSource, channel, referenceId, referenceSubId, userId, status, subject, body, ccEmail, contactNo, customerId, departmentId, roleId, createdDeptmentId, createdRoleId, tranId, conn) => {
  try {
    /** Adding Notification Log */
    const emailNotification = {
      notificationType,
      notifiationSource,
      channel,
      referenceId,
      refernceSubId: referenceSubId,
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
      createdDeptmentId,
      createdRoleId,
      tranId,
      createdBy: userId
    }
    await conn.Notification.create(emailNotification)
  } catch (error) {
    logger.error(error)
    return {
      status: 'ERROR',
      message: 'Internal server error'
    }
  }
}
