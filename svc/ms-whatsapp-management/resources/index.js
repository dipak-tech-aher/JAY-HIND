
import { camelCaseConversion, pickProperties } from '@utils'
import { each, get } from 'lodash'

module.exports = {
  getStartAndEndDates (input) {
    const date = input?.split('-')
    const month = date[1]
    const year = date[0]
    let startDate = ''
    let endDate = ''
    if (month === '1' || month === '3' || month === '5' || month === '7' || month === '8' || month === '10' || month === '12') {
      startDate = `${year}-${month}-01`
      endDate = `${year}-${month}-31`
    } else if (month === '2') {
      startDate = `${year}-${month}-01`
      endDate = `${year}-${month}-28`
    } else if (month === '4' || month === '6' || month === '9' | month === '11') {
      startDate = `${year}-${month}-01`
      endDate = `${year}-${month}-31`
    }
    const response = {
      startDate,
      endDate
    }
    return response
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
        expectedDateofCompletion: get(interactionData, 'edoc', ''),
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
        customerDetails:  this.getCustomerDetails(get(interactionData, 'customerDetails', ''), businessEntityInfo),
        createdBy: get(interactionData, 'userId', null),
        createdAt: get(interactionData, 'createdAt', null)
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
        // customerContact: this.getcustomerContactDetails(get(customerData, 'customerContact', ''), businessEntityInfo),
        // customerAddress: this.getCustomerAddressDetails(get(customerData, 'customerAddress', ''), businessEntityInfo),
        customerPhoto: get(customerData, 'customerPhoto', ''),
        customerUuid: get(customerData, 'customerUuid', ''),
        birthDate: get(customerData, 'birthDate', '')
      }
    }
    return response
  },
}
