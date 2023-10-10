import { camelCaseConversion, pickProperties } from '@utils'
import { each, get } from 'lodash'

module.exports = {
  // single transformation
  transform (user) {
    const requiredProperties = ['userId', 'contactNo', 'email', 'userType', 'photo', 'title', 'firstName', 'lastName', 'gender', 'dob', 'officeNo', 'status', 'profilePicture', 'country',
      'extn', 'loc', 'activationDate', 'expiryDate', 'notificationType', 'biAccess', 'waAccess', 'status', 'mappingPayload', 'statusDesc', 'genderDesc']

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
  transformUserSearch (userData, businessEntityInfo) {
    let response = []
    if (Array.isArray(userData)) {
      response = []
      each(userData, (userData) => {
        response.push(this.transformUserSearch(userData, businessEntityInfo))
      })
    } else {
      response = {
        userId: get(userData, 'userId', ''),
        contactNo: get(userData, 'contactNo', ''),
        email: get(userData, 'email', ''),
        photo: get(userData, 'photo', ''),
        title: get(userData, 'title', ''),
        firstName: get(userData, 'firstName', ''),
        lastName: get(userData, 'lastName', ''),
        gender: get(userData, 'gender', ''),
        dob: get(userData, 'dob', ''),
        loginid: get(userData, 'loginid', ''),
        officeNo: get(userData, 'officeNo', ''),
        extn: get(userData, 'extn', ''),
        profilePicture: get(userData, 'profilePicture', ''),
        country: get(userData, 'country', ''),
        loc: get(userData, 'loc', ''),
        locationDesc: this.getbusinessEntity(businessEntityInfo, get(userData, 'loc', '')) || null,
        activationDate: get(userData, 'activationDate', ''),
        expiryDate: get(userData, 'expiryDate', ''),
        notificationType: get(userData, 'notificationType', ''),
        biAccess: get(userData, 'biAccess', ''),
        waAccess: get(userData, 'waAccess', ''),
        managerId: get(userData, 'managerId', ''),
        status: get(userData, 'status', ''),
        statusDesc: this.getbusinessEntity(businessEntityInfo, get(userData, 'status', '')) || null,
        userType: get(userData, 'userType', ''),
        userTypeDesc: this.getbusinessEntity(businessEntityInfo, get(userData, 'userType', '')) || null,
        userGroup: get(userData, 'userGroup', ''),
        userGroupDesc: this.getbusinessEntity(businessEntityInfo, get(userData, 'userGroup', '')) || null,
        userSource: get(userData, 'userSource', ''),
        userSourceDesc: this.getbusinessEntity(businessEntityInfo, get(userData, 'userSource', '')) || null,
        userFamily: get(userData, 'userFamily', ''),
        userFamilyDesc: this.getbusinessEntity(businessEntityInfo, get(userData, 'userFamily', '')) || null,
        userCategory: get(userData, 'userCategory', ''),
        userCategoryDesc: this.getbusinessEntity(businessEntityInfo, get(userData, 'userCategory', '')) || null,
        mappingPayload: get(userData, 'mappingPayload', ''),
        userSkills: get(userData, 'userSkills', ''),
        createdBy: get(userData, 'createdBy', ''),
        createdAt: get(userData, 'createdAt', ''),
        updatedBy: get(userData, 'updatedBy', ''),
        updatedAt: get(userData, 'updatedAt', '')
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
  }
}
