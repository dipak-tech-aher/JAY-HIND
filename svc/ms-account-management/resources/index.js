import { camelCaseConversion, pickProperties } from '@utils'
import { each, get } from 'lodash'

module.exports = {
  // single transformation
  Transform (user) {
    const requiredProperties = []

    return pickProperties(camelCaseConversion(user), requiredProperties)
  },

  // array transformation
  transformCollection (users) {
    const self = this
    const data = []
    for (let i = 0; i <= users.length; i++) {
      data.push(self.transform(users[i]))
    }
    return data
  },

  compareRecords (oldRecord, newRecord, fields) {
    let isNotSame = false

    fields.some(field => {
      // console.log(field,'==========', oldRecord?.hasOwnProperty(field) , newRecord?.hasOwnProperty(field) , JSON.stringify(newRecord[field]) !== JSON.stringify(oldRecord[field]))
      // console.log(field,'==========', oldRecord?.hasOwnProperty(field) && newRecord?.hasOwnProperty(field) && newRecord[field] && JSON.stringify(newRecord[field]) !== JSON.stringify(oldRecord[field]))
      if (oldRecord?.hasOwnProperty(field) && newRecord?.hasOwnProperty(field) && newRecord[field] && JSON.stringify(newRecord[field]) !== JSON.stringify(oldRecord[field])) {
        isNotSame = true
      }
    })

    return isNotSame
  },

  transformRecord (oldRecord, newRecord, fields) {
    return fields.reduce((a, v) => ({ ...a, [v]: get(newRecord, v, oldRecord[v]) }), {})
  },

  createAccountTransform (accountdetails, businessEntityInfo) {
    let response = []
    if (Array.isArray(accountdetails)) {
      response = []
      each(accountdetails, (accountdetails) => {
        accountdetails = accountdetails?.dataValues ? accountdetails?.dataValues : accountdetails
        response.push(this.createAccountTransform(accountdetails, businessEntityInfo))
      })
    } else {
      response = {
        accountId: get(accountdetails, 'accountId', ''),
        accountNo: get(accountdetails, 'accountNo', '')
      }
      return response
    }
    return response
  }
}
