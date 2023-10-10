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

    fields.every(field => {
      if (newRecord[field] && newRecord[field] !== oldRecord[field]) {
        isNotSame = true
      }
    })
    return isNotSame
  },

  transformRecord (oldRecord, newRecord, fields) {
    return fields.reduce((a, v) => ({ ...a, [v]: get(oldRecord[v], v, newRecord[v]) }), {})
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

  transformAppointment (inputData, businessEntityInfo) {
    let response = []
    if (Array.isArray(inputData)) {
      response = []
      each(inputData, (inputData) => {
        response.push(this.transformAppointment(inputData, businessEntityInfo))
      })
    } else {
      if (inputData) {
        return {
          appointTxnId: get(inputData, 'appointTxnId', ''),
          appointDtlId: get(inputData, 'appointDtlId', ''),
          appointId: get(inputData, 'appointId', ''),
          appointDate: get(inputData, 'appointDate', ''),
          status: this.getbusinessEntity(businessEntityInfo, get(inputData, 'status', '')) || null,
          appointUserCategory: this.getbusinessEntity(businessEntityInfo, get(inputData, 'appointUserCategory', '')) || null,
          appointUserId: get(inputData, 'appointUserId', ''),
          appointAgentId: get(inputData, 'appointAgentId', ''),
          appointmentAgent: get(inputData, 'appointmentAgent', ''),
          appointMode: this.getbusinessEntity(businessEntityInfo, get(inputData, 'appointMode', '')) || null,
          appointModeValue: this.getbusinessEntity(businessEntityInfo, get(inputData, 'appointModeValue', '')) || get(inputData, 'appointModeValue', ''),
          appointStartTime: get(inputData, 'appointStartTime', ''),
          appointEndTime: get(inputData, 'appointEndTime', ''),
          tranCategoryType: this.getbusinessEntity(businessEntityInfo, get(inputData, 'tranCategoryType', '')) || null,
          tranCategoryNo: get(inputData, 'tranCategoryNo', ''),
          appointmentCustomer: get(inputData, 'appointmentCustomer', '')
        }
      }
    }
    return response
  },

  transformTopPerformance (inputData) {
    // console.log('inputData, ', inputData)
    let response = []
    if (Array.isArray(inputData)) {
      response = []
      each(inputData, (inputData) => {
        response.push(this.transformTopPerformance(inputData))
      })
    } else {
      if (inputData) {
        return {
          firstName: get(inputData, 'firstName', ''),
          lastName: get(inputData, 'lastName', ''),
          alias: get(inputData, 'alias', ''),
          profile: get(inputData, 'profilePicture', ''),
          rating: get(inputData, 'rating', '')
        }
      }
    }
    return response
  },

  transformPastHistory (inputData) {
    // console.log('inputData, ', inputData)
    let response = []
    if (Array.isArray(inputData)) {
      response = []
      each(inputData, (inputData) => {
        response.push(this.transformPastHistory(inputData))
      })
    } else {
      if (inputData) {
        return {
          appointTxnId: get(inputData, 'appointTxnId', ''),
          appointDtlId: get(inputData, 'appointDtlId', ''),
          appointId: get(inputData, 'appointId', ''),
          appointDate: get(inputData, 'appointDate', ''),
          status: get(inputData, 'statusDesc.code', ''),
          statusDesc: get(inputData, 'statusDesc.description', ''),
          appointUserCategory: get(inputData, 'appointUserCategory', ''),
          appointUserId: get(inputData, 'appointUserId', ''),
          appointAgentId: get(inputData, 'appointAgentId', ''),
          appointMode: get(inputData, 'appoinmentModeDesc.code', ''),
          appointModeDesc: get(inputData, 'appoinmentModeDesc.description', ''),
          appointModeValue: get(inputData, 'appointModeValue', ''),
          appointStartTime: get(inputData, 'appointStartTime', ''),
          appointEndTime: get(inputData, 'appointEndTime', ''),
          tranCategoryType: get(inputData, 'tranCategoryType', ''),
          tranCategoryNo: get(inputData, 'tranCategoryNo', '')
        }
      }
    }
    return response
  }

}
