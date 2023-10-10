import { camelCase, get, pick } from 'lodash'
import { CryptoHelper } from '@utils'
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

export const groupBy = (obj, key) => {
  return obj.reduce((v, x) => {
    (v[x[key]] = v[x[key]] || []).push(x)
    return v
  }, {})
}

export const getbusinessEntity = (obj, element, key, filter) => {
  const filtered = obj.find(e => e[filter] === element)
  return (get(filtered, key, ''))
}

export const groupByCount = (obj, key, isBusinessEntity, businessUnitInfo) => {
  const groupedValue = groupBy(obj, key)
  const groupedCount = []
  if (groupedValue) {
    for (const element in groupedValue) {
      if (groupedValue.hasOwnProperty(element)) {
        groupedCount.push({
          name: isBusinessEntity ? getbusinessEntity(businessUnitInfo, element, 'description', 'code') : element,
          value: groupedValue[element].length,
          element
        })
      }
    }
  }
  return groupedCount
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
