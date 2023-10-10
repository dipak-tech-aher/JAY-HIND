import { camelCase, pick } from 'lodash'
import { CryptoHelper } from '@utils'
import { isAfter } from 'date-fns'

export const camelCaseConversion = (obj) => {
  for (const key in obj) {
    const element = obj[key]
    delete obj[key]
    obj[camelCase(key)] = element
  }
  return obj
}

export const pickProperties = (obj, fields) => {
  return pick(obj, fields)
}
export const checkSessionExpiry = async (accessToken) => {
  const cryptoHelper = new CryptoHelper()
  try {
    let decodedToken
    try {
      decodedToken = cryptoHelper.verifyJWT(accessToken)
    } catch (error) {
      console.error(error)
      return {
        status: 'EXPIRED',
        message: 'JWT Token signature error'
      }
    }

    const decryptedToken = cryptoHelper.decrypt(decodedToken)
    if (decryptedToken) {
      const date = new Date()
      const expireTime = new Date(decryptedToken.expiresIn)
      const currentTime = new Date(date.getTime())

      // const fiveMinutesAgo = new Date(expireTime.getTime() - 5000 * 60)
      if ((isAfter(expireTime, currentTime))) {
        return {
          status: 'NOT-EXPIRED',
          message: 'Session token not expired'
        }
      }
    }
    return {
      status: 'EXPIRED',
      message: 'Session token expired'
    }
  } catch (error) {
    return {
      status: 'EXPIRED',
      message: 'Internal server error'
    }
  }
}
