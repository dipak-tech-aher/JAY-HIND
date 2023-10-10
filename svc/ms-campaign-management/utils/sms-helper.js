import { logger, sendTwilioSMS } from '@utils'
import { PortalSetting } from '@models'

export class SMSHelper {
  async sendSMS (options) {
    try {
      logger.debug('Sending sms to user')
      const { to, message, extn } = options
      const smsInfo = await PortalSetting.findOne({ where: { settingType: 'SMS' } })
      let response = await sendTwilioSMS(smsInfo.mappingPayload.u, smsInfo.mappingPayload.h, message, '+15017122661', '+' + extn + to)
      // response = JSON.parse(response.body)
      logger.debug('Successfully send sms')
      return response
    } catch (error) {
      // logger.error('Error while sending sms ', error)
      console.log('error', error)
    }
  }
}
