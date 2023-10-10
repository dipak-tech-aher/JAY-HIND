import { logger, constantCode } from '@utils'
const nodemailer = require('nodemailer')
const { getConnection } = require('@services/connection-service')

export class EmailHelper {
  async sendMail (options) {
    try {
      logger.debug('Sending mail to user')
      const { to, cc = [], message, subject } = options
      const conn = await getConnection()
      let smtpInfo = await conn.BcaeAppConfig.findOne({ where: { status: constantCode.status.ACTIVE } })
      smtpInfo = smtpInfo?.notificationSetupPayload?.notificationEmailSetting
      if (!smtpInfo) {
        logger.info('SMTP configuration is not available or in-active status')
        return false
      }
      const transporter = nodemailer.createTransport({
        host: smtpInfo?.host,
        port: Number(smtpInfo?.port),
        auth: {
          user: smtpInfo?.userName,
          pass: smtpInfo?.password
        }
      })
      let response = { status: 'SENT' }
      transporter.sendMail({
        from: smtpInfo?.fromEmailAddress,
        to,
        cc,
        subject,
        html: message
      }, (err, info) => {
        if (err) {
          response = { status: 'FAILED', message: err }
        } else {
          response = { status: 'SENT', message: info }
        }
      })
      transporter.close()
      logger.debug('Successfully send email')
      return response
    } catch (error) {
      logger.error('Error while sending email ', error)
    }
  }
}
