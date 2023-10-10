import { logger } from '@utils'
import axios from 'axios'
const qs = require('qs')

export const authentication = async (url, grantType, clientId, secret, scope) => {
  logger.info('Creating New access token')
  const request = qs.stringify({
    grant_type: grantType,
    client_id: clientId,
    client_secret: secret,
    scope
  })
  const { data } = await axios.post(url, request, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  })
  const { access_token: azureAccessToken } = data
  const accessToken = azureAccessToken
  return { accessToken }
}
