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

  transformInteraction (interactionData, businessEntityInfo, businessUnitInfo, roleinfo) {
    let response = []
    if (Array.isArray(interactionData)) {
      response = []
      each(interactionData, (interaction) => {
        response.push(this.transformInteraction(interaction, businessEntityInfo, businessUnitInfo, roleinfo))
      })
    } else {
      response = {
        isResolvedBy: get(interactionData, 'isResolvedBy', ''),
        intxnId: get(interactionData, 'intxnId', ''),
        intxnNo: get(interactionData, 'intxnNo', ''),
        intxnUuid: get(interactionData, 'intxnUuid', ''),
        helpdeskId: get(interactionData, 'helpdeskId', ''),
        chatId: get(interactionData, 'chatId', ''),
        serviceId: get(interactionData, 'serviceId', ''),
        customerId: get(interactionData, 'customerId', ''),
        customerUid: get(interactionData, 'customerUuid', ''),
        requestId: get(interactionData, 'requestId', ''),
        requestStatement: get(interactionData, 'requestStatement', ''),
        intxnDescription: get(interactionData, 'intxnDescription', ''),
        intxnCategory: this.getbusinessEntity(businessEntityInfo, get(interactionData, 'intxnCategory', '')) || null,
        serviceCategory: this.getbusinessEntity(businessEntityInfo, get(interactionData, 'serviceCategory', '')) || null,
        intxnType: this.getbusinessEntity(businessEntityInfo, get(interactionData, 'intxnType', '')) || null,
        serviceType: this.getbusinessEntity(businessEntityInfo, get(interactionData, 'serviceType', '')) || null,
        intxnCause: this.getbusinessEntity(businessEntityInfo, get(interactionData, 'intxnCause', '')) || null,
        intxnPriority: this.getbusinessEntity(businessEntityInfo, get(interactionData, 'intxnPriority', '')) || null,
        intxnChannel: this.getbusinessEntity(businessEntityInfo, get(interactionData, 'intxnChannel', '')) || null,
        intxnStatus: this.getbusinessEntity(businessEntityInfo, get(interactionData, 'intxnStatus', '')) || null,
        contactPreference: this.getbusinessEntity(businessEntityInfo, get(interactionData, 'contactPreference', '')),
        currentDepartment: {
          code: get(interactionData, 'currEntity', ''),
          description: this.getbusinessUnit(businessUnitInfo, get(interactionData, 'currEntity', '')) || null
        },
        currentRole: {
          code: get(interactionData, 'currRole', ''),
          description: this.getrole(roleinfo, get(interactionData, 'currRole', '')) || null
        },
        currentUser: {
          code: get(interactionData, 'currUser', ''),
          description: get(interactionData, 'currUserDetails', null)
        },
        formDetails: get(interactionData, 'formDetails', {}),
        createdBy: get(interactionData, 'userId', null),
        createdAt: get(interactionData, 'createdAt', null),
        formAttributes: get(interactionData.statementDetails, 'metaAttributes', {}),
        customerDetails: get(interactionData, 'customerDetails', '')
          ? this.getCustomerDetails(get(interactionData, 'customerDetails', ''), businessEntityInfo)
          : this.getCustomerDetails(get(interactionData, 'profileDetails', ''), businessEntityInfo),
        intxnContact: this.getcustomerContactDetails(get(interactionData, 'intxnContact', ''), businessEntityInfo),
        intxnAddress: this.getCustomerAddressDetails(get(interactionData, 'intxnAddress', ''), businessEntityInfo),  
        edoc: get(interactionData, 'edoc', ''),

      }
    }
    return response
  },

  transformTopCatagory (topCatagory, businessEntityInfo) {
    let response = []
    if (Array.isArray(topCatagory)) {
      response = []
      each(topCatagory, (topCatagory) => {
        response.push(this.transformTopCatagory(topCatagory, businessEntityInfo))
      })
    } else {
      response = {
        intxnCategoryCount: get(topCatagory, 'dataValues.intxnCategoryCount', ''),
        intxnCategory: this.getbusinessEntity(businessEntityInfo, get(topCatagory, 'intxnCategory', '')) || null
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
  },

  getCustomerDetails (customerData, businessEntityInfo) {
    let response = {}
    if (customerData && businessEntityInfo) {
      response = {
        firstName: get(customerData, 'firstName', ''),
        lastName: get(customerData, 'lastName', ''),
        customerNo: get(customerData, 'customerNo', ''),
        gender: this.getbusinessEntity(businessEntityInfo, get(customerData, 'gender', '')) || null,
        idType: this.getbusinessEntity(businessEntityInfo, get(customerData, 'idType', '')) || null,
        customerCategory: get(customerData, 'customerCategory', ''),
        status: get(customerData, 'status', ''),
        customerCatDesc: this.getbusinessEntity(businessEntityInfo, get(customerData, 'customerCategory', '')) || null,
        statusDesc: this.getbusinessEntity(businessEntityInfo, get(customerData, 'status', '')) || null,
        idValue: get(customerData, 'customerId', ''),
        contactPreferences: get(customerData,'contactPreferences',''),
        customerContact: this.getcustomerContactDetails(get(customerData, 'customerContact', ''), businessEntityInfo),
        customerAddress: this.getCustomerAddressDetails(get(customerData, 'customerAddress', ''), businessEntityInfo),
        customerPhoto: get(customerData, 'customerPhoto', ''),
        customerUuid: get(customerData, 'customerUuid', ''),
        birthDate: get(customerData, 'birthDate', '')
      }
    }
    return response
  },

  getcustomerContactDetails (customerContact, businessEntityInfo) {
    let response = []
    if (Array.isArray(customerContact)) {
      response = []
      each(customerContact, (customerContact) => {
        response.push(this.getcustomerContactDetails(customerContact, businessEntityInfo))
      })
    } else {
      if (customerContact && businessEntityInfo) {
        response = {
          contactNo: get(customerContact, 'contactNo', ''),
          mobileNo: get(customerContact, 'mobileNo', ''),
          mobilePrefix: get(customerContact, 'mobilePrefix', ''),
          emailId: get(customerContact, 'emailId', ''),
          isPrimary: get(customerContact, 'isPrimary', '')
        }
      }
    }
    return response
  },

  getCustomerAddressDetails (inputData, businessEntityInfo) {
    let response = []
    if (Array.isArray(inputData)) {
      response = []
      each(inputData, (inputData) => {
        response.push(this.getCustomerAddressDetails(inputData, businessEntityInfo))
      })
    } else {
      if (inputData && businessEntityInfo) {
        response = {
          address1: get(inputData, 'address1', ''),
          isPrimary: get(inputData, 'isPrimary', ''),
          address2: get(inputData, 'address2', ''),
          address3: get(inputData, 'address3', ''),
          city: get(inputData, 'city', ''),
          state: get(inputData, 'state', ''),
          district: get(inputData, 'district', ''),
          postcode: get(inputData, 'postcode', ''),
          country: get(inputData, 'country', '')
        }
      }
    }
    return response
  },

  getMyInteractionHistoryGraphTransform (inputData) {
    let response = []
    if (Array.isArray(inputData)) {
      response = []
      each(inputData, (inputData) => {
        response.push(this.getMyInteractionHistoryGraphTransform(inputData))
      })
    } else {
      if (inputData) {
        return {
          intxnId: get(inputData, 'intxnId', ''),
          intxnNo: get(inputData, 'intxnNo', ''),
          requestStatement: get(inputData, 'requestStatement'),
          createdAt: get(inputData, 'createdAt', ''),
          currStatus: get(inputData, 'currStatusDesc.code', ''),
          currStatusDesc: get(inputData, 'currStatusDesc.description', ''),
          category: get(inputData, 'categoryDescription.code', ''),
          categoryDescription: get(inputData, 'categoryDescription.description', ''),
          serviceType: get(inputData, 'serviceTypeDesc.code', ''),
          serviceTypeDesc: get(inputData, 'serviceTypeDesc.description', ''),
          channel: get(inputData, 'channleDescription.code', ''),
          channelDesc: get(inputData, 'channleDescription.description', ''),
          priority: get(inputData, 'priorityDescription.code', ''),
          priorityDesc: get(inputData, 'priorityDescription.description', ''),
          intxnType: get(inputData, 'srType.code', ''),
          intxnTypeDesc: get(inputData, 'srType.description', ''),
          intxnCategory: get(inputData, 'intxnCategoryDesc.code', ''),
          intxnCategoryDesc: get(inputData, 'intxnCategoryDesc.description', '')
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
          appointMode: this.getbusinessEntity(businessEntityInfo, get(inputData, 'appointMode', '')) || null,
          appointModeValue: get(inputData, 'appointModeValue', ''),
          appointStartTime: get(inputData, 'appointStartTime', ''),
          appointEndTime: get(inputData, 'appointEndTime', ''),
          tranCategoryType: this.getbusinessEntity(businessEntityInfo, get(inputData, 'tranCategoryType', '')) || null,
          tranCategoryNo: get(inputData, 'tranCategoryNo', '')
        }
      }
    }
    return response
  },

  transformInteractionCategoryPermormance (inputData) {
    let response = []
    if (Array.isArray(inputData)) {
      response = []
      each(inputData, (inputData) => {
        response.push(this.transformInteractionCategoryPermormance(inputData))
      })
    } else {
      if (inputData) {
        return {
          type: get(inputData, 'oIntxnType', get(inputData, 'oIntxnCategory', '')),
          description: get(inputData, 'oIntxnTypeDesc', get(inputData, 'oIntxnCategoryDesc', '')),
          status: get(inputData, 'oIntxnTxnStatus', ''),
          count: get(inputData, 'oIntxnCnt', 0)
        }
      }
    }
    return response
  },

  transformGetOverallPerformance (inputData) {
    let response = []
    if (Array.isArray(inputData)) {
      response = []
      each(inputData, (inputData) => {
        response.push(this.transformGetOverallPerformance(inputData))
      })
    } else {
      if (inputData) {
        return {
          referenceId: get(inputData, 'intxnNo', get(inputData, 'orderNo', '')),
          source: get(inputData, 'intxnNo', undefined) ? 'Interaction' : 'order',
          // serviceCategory: get(inputData, 'oIntxnType', ''),
          serviceType: get(inputData, 'serviceTypeDesc.description', ''),
          channel: get(inputData, 'channleDescription.description', get(inputData, 'orderChannelDesc.description', ''))
        }
      }
    }
    return response
  },

  transformTopPerformance (inputData) {
    let response = []
    if (Array.isArray(inputData)) {
      response = []
      each(inputData, (inputData) => {
        response.push(this.transformTopPerformance(inputData))
      })
    } else {
      if (inputData) {
        response = {
          firstName: get(inputData, 'firstName', ''),
          lastName: get(inputData, 'lastName', ''),
          alias: get(inputData, 'alias', ''),
          profile: get(inputData, 'profilePicture', ''),
          rating: get(inputData, 'rating', '')
        }
      }
    }
    return response
  }
}
