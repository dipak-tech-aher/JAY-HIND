import { logger, sendTwilioSMS, defaultStatus } from '@utils'
const { getConnection } = require('@services/connection-service')
import got from 'got'

export class SMSHelper {
  async sendSMS (options) {
    try {
      console.log("sms options ==> ", options);
      logger.debug('Sending sms to user')
      const { to, message, extn } = options
      const conn = await getConnection()

      let smsInfo = await conn.BcaeAppConfig.findOne({ where: { status: defaultStatus.ACTIVE } })
      smsInfo = smsInfo?.notificationSetupPayload?.notificationSmsSetting
      if (!smsInfo || !smsInfo?.user || !smsInfo?.password || !smsInfo?.host_no || !message || !extn || !to) {
        logger.info('SMS configuration is not available or in-active status')
        return false
      }

      let response;
      if (smsInfo?.provider === "TWILIO") {
        response = await sendTwilioSMS(smsInfo?.user, smsInfo?.password, message, smsInfo?.host_no, '+' + extn + to)
      } else {
        let response = await got.get({
          url: smsInfo?.url + '?app=' + smsInfo?.app + '&u=' + smsInfo?.user + '&h=' + smsInfo?.host_no + '&op=' +
          smsInfo?.password + '&to=' + extn + to + '&msg=' + encodeURI(message),
          retry: 0
        })
        response = JSON.parse(response.body)
      }
      
      console.log(response, "from twilio")
      // response = JSON.parse(response)
      logger.debug('Successfully send sms')
      return response
    } catch (error) {
      logger.error('Error while sending sms ', error)
      // console.log('error', error)
    }
  }
}
