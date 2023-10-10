import { camelCase, pick } from 'lodash'
import {CryptoHelper} from '@utils'
import { isAfter } from 'date-fns'

export const camelCaseConversion = (data) => {
  for (let index = 0; index < data.length; index++) {
    const obj = data[index]
    for (const key in obj) {
      const element = obj[key]
      delete obj[key]
      obj[camelCase(key)] = element
    }
  }
  return data
}

export const pickProperties = (obj, fields) => {
  return pick(obj, fields)
}

export function noOfDaysBetween2Dates (startDate, endDate) {
  const DifferenceInTime =
    new Date(endDate).getTime() - new Date(startDate).getTime()
  const DifferenceInDays = Math.round(DifferenceInTime / (1000 * 3600 * 24))
  return DifferenceInDays + 1
}

export const groupBy = (items, key) => items.reduce(
  (result, item) => ({
    ...result,
    [item[key]]: [
      ...(result[item[key]] || []),
      item
    ]
  }),
  {}
)

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