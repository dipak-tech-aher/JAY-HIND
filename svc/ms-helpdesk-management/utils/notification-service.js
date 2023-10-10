import { constantCode, statusCodeConstants } from '@utils'
import { logger } from './logger'
const ST = require('stjs')

export async function createEmailNotification (templateName, email, referenceId, source, payload, userId, t, conn) {
  try {
    logger.info('Creating Email Notification')

    const template = await conn.NotificationTemplate.findOne({
      where: {
        templateName,
        templateType: constantCode.source.EMAIL
      }
    })
    if (template) {
      const body = ST.select(payload).transformWith(template.body).root()

      const reqBody = {
        email,
        body,
        referenceId,
        source,
        subject: template.subject,
        status: constantCode.status.NEW,
        notificationType: constantCode.source.EMAIL,
        createdBy: userId
      }

      await conn.Notification.create(reqBody, { transaction: t })
      logger.debug('Notification created successfully')
      return {
        status: statusCodeConstants.SUCCESS,
        message: 'Notification created successfully'
      }
    } else {
      logger.warn('Notification template is not found')
      return {
        status: statusCodeConstants.ERROR,
        message: 'Notification template is not found'
      }
    }
  } catch (error) {
    logger.error(error)
    return {
      status: statusCodeConstants.ERROR,
      message: 'Internal server error'
    }
  }
}
