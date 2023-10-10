/* eslint-disable array-callback-return */
import { camelCaseConversion, pickProperties } from '@utils'
import { each, get } from 'lodash'

module.exports = {
  // single transformation
  transform (user) {
    const requiredProperties = ['userId', 'contactNo', 'email', 'userType', 'photo', 'title', 'firstName', 'lastName', 'gender', 'dob', 'officeNo', 'status', 'profilePicture', 'location', 'country']

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
    oldRecord = oldRecord?.dataValues ? oldRecord.dataValues : oldRecord
    // eslint-disable-next-line array-callback-return
    fields.some(field => {
      if (newRecord?.hasOwnProperty(field) && (oldRecord?.hasOwnProperty(field) || oldRecord?.hasOwnProperty(field)) && newRecord[field] !== oldRecord[field]) {
        isNotSame = true
      }
    })

    return isNotSame
  },

  transformRecord (oldRecord, newRecord, fields) {
    const transformedObj = {}
    oldRecord = oldRecord?.dataValues ? oldRecord.dataValues : oldRecord
    fields.some(field => {
      if (oldRecord?.field !== newRecord[field]) {
        transformedObj[field] = get(oldRecord?.field, field, newRecord[field])
      }
    })
    return transformedObj
  },

  transformFollowup (payload, businessEntityInfo, businessUnitInfo, roleinfo, ) {
    let response = []
    if (Array.isArray(payload)) {
      response = []
      each(payload, (payload) => {
        response.push(this.transformFollowup(payload, businessEntityInfo, businessUnitInfo, roleinfo))
      })
    } else {
      if (payload) {
        response = {
          id: get(payload, 'intxnDetails.intxnNo', get(payload, 'orderDetails.orderNo', '')),
          status: this.getbusinessEntity(businessEntityInfo, get(payload, 'intxnTxnStatus', get(payload, 'orderId', ''))) || null,
          serviceCategory: this.getbusinessEntity(businessEntityInfo, get(payload, 'serviceCategory', get(payload, 'orderId', ''))) || null,
          type: this.getbusinessEntity(businessEntityInfo, get(payload, 'intxnType', get(payload, 'orderId', ''))) || null,
          serviceType: this.getbusinessEntity(businessEntityInfo, get(payload, 'serviceType', get(payload, 'orderId', ''))) || null,
          remarks: get(payload, 'remarks', get(payload, 'orderId', '')),
          createdDate: get(payload, 'intxnCreatedDate', get(payload, 'createdAt', ''))
        }
      }
    }
    return response
  },
  getbusinessEntity (businessEntityInfo, code) {
    let response = null
    if (Array.isArray(code)) {
      response = []
      each(code, (code) => {
        response.push(this.getbusinessEntity(businessEntityInfo, code))
      })
    } else {
      response = businessEntityInfo.find(e => e.code === code)
      if (response) {
        response = {
          code: get(response, 'code', ''),
          description: get(response, 'description', '')
        }
      }
    }
    return response
  },

  getbusinessUnit (businessUnitInfo, code) {
    let response = null
    if (businessUnitInfo && code) {
      response = businessUnitInfo.find(e => e.unitId === code)
      if (response) {
        response = {
          unitId: get(response, 'unitId', ''),
          unitName: get(response, 'unitName', ''),
          unitDesc: get(response, 'unitDesc', '')
        }
      }
    }
    return response
  },

  getrole (roleinfo, code) {
    let response = null
    if (roleinfo && code) {
      response = roleinfo.find(e => e.roleId === code)
      if (response) {
        response = {
          roleId: get(response, 'roleId', ''),
          roleName: get(response, 'roleName', ''),
          roleDesc: get(response, 'roleDesc', '')
        }
      }
    }
    return response
  }
}
