import { logger } from '@utils'
import { PortalSetting } from '@models'
const nodemailer = require('nodemailer')

export class EmailHelper {
  async sendMail (options) {
    try {
      logger.debug('Sending mail to user')
      const { to, cc = [], message, subject } = options
      const smtpInfo = await PortalSetting.findOne({ where: { settingType: 'SMTP' } })
      const transporter = nodemailer.createTransport({
        host: smtpInfo.mappingPayload.host,
        port: Number(smtpInfo.mappingPayload.port),
        auth: {
          user: smtpInfo.mappingPayload.userName,
          pass: smtpInfo.mappingPayload.password
        }
      })
      const response = await transporter.sendMail({
        from: smtpInfo.mappingPayload.fromEmailAddress,
        to,
        cc,
        subject,
        html: message
      })
      logger.debug('Successfully send email')
      return response
    } catch (error) {
      logger.error('Error while sending email ', error)
    }
  }
}
