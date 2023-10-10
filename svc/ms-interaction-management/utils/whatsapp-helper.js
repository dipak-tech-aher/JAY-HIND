import { logger } from '@utils'
import axios from 'axios'
import { isObjectWithProperties } from './type-guard'
const { getConnection } = require('@services/connection-service')

export class WhastsAppHelper {
  async sendWhatsappMessage (options) {
    try {
      const { to, message, type } = options
      if (!to && !message && !type) {
        return {
          status: 'ERROR',
          message: 'Whatsapp reception details not found'
        }
      }
      const conn = await getConnection()
      const whatsAppInfo = await conn.PortalSetting.findOne({ where: { settingType: 'WHATSAPP' } })

      if (!whatsAppInfo && !isObjectWithProperties(whatsAppInfo, ['host', 'path', 'accessToken', 'phoneNumberId', 'method', 'contentType'])) {
        return {
          status: 'ERROR',
          message: 'Whatsapp Configuration details not found'
        }
      }

      const { host, path, accessToken, phoneNumberId, method, contentType } = whatsAppInfo
      let requestObject = {}
      if (type === 'TEXT') {
        requestObject = {
          messaging_product: 'whatsapp',
          to,
          text: { body: message }
        }
      } else {
        requestObject = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type,
          [type]: { id: message }
        }
      }
      const requestBody = JSON.stringify(requestObject)
      const config = {
        method,
        url: `${host}/${path}/${phoneNumberId}/messages`,
        headers: {
          'Content-Type': contentType,
          Authorization: `Bearer ${accessToken}`
        },
        data: requestBody
      }
      let response = {}
      axios.config(config).then((resp) => {
        if (resp.status === 200) {
          response = {
            status: 'SUCCESS',
            message: 'Whatsapp message send successfuly'
          }
        }
      })
      return response
    } catch (error) {
      logger.error(error)
      return {
        status: 'ERROR',
        message: 'Internal Server Error'
      }
    }
  }
}
