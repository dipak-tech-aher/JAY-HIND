import { camelCaseConversion, pickProperties } from '@utils'
import { get, each } from 'lodash'

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
  transformProductList (payload, businessEntityInfo) {
    let response = []
    if (Array.isArray(payload)) {
      response = []
      each(payload, (payload) => {
        response.push(this.transformProductList(payload, businessEntityInfo))
      })
    } else {
      if (payload) {
        response = {
          label: get(payload, 'productName', ''),
          value: get(payload, 'productUuid', ''),
          image: get(payload, 'productImage', ''),
          productId: get(payload, 'productId', ''),
          serviceCategory: get(payload, 'productSubTypeDesc', ''),
          serviceType: get(payload, 'serviceTypeDescription', ''),
          productClass: get(payload, 'productClass', ''),
          isButton: true,
          buttonProperties: [{
            label: 'Buy Now',
            value: 'BUY'
          }],
          isAppointmentRequired: get(payload, 'isAppointRequired', ''),
          quantity: 0,
          otherProperties: this.transformProductOtherDetailsList(get(payload, 'productChargesList', ''), businessEntityInfo) || null,
          productBenifits: this.transformProductBenefitDetails(get(payload, 'productBenefit.[0].benefits', []), businessEntityInfo) || null
        }
      }
    }
    return response
  },
  transformProductOtherDetailsList (payload, businessEntityInfo) {
    let response = []
    if (Array.isArray(payload)) {
      response = []
      each(payload, (payload) => {
        response.push(this.transformProductOtherDetailsList(payload, businessEntityInfo))
      })
    } else {
      if (payload) {
        response = {
          productName: get(payload, 'productName', ''),
          label: get(payload, 'chargeDetails.chargeName', ''),
          value: get(payload, 'chargeAmount', '') ? '$' + get(payload, 'chargeAmount', '') : ''
        }
      }
    }
    return response
  },
  transformChatMenuList (payload) {
    let response = []
    if (Array.isArray(payload)) {
      response = []
      each(payload, (payload) => {
        response.push(this.transformChatMenuList(payload))
      })
    } else {
      if (payload) {
        response = {
          label: get(payload, 'jsonString.label', ''),
          value: get(payload, 'jsonString.value', '')
        }
      }
    }
    return response
  },
  transformLookUpList (payload) {
    let response = []
    if (Array.isArray(payload)) {
      response = []
      each(payload, (payload) => {
        response.push(this.transformLookUpList(payload))
      })
    } else {
      if (payload) {
        response = {
          label: get(payload, 'description', ''),
          value: get(payload, 'code', '')
        }
      }
    }
    return response
  },
  transformProductBenefitDetails (payload, businessEntityInfo) {
    let response = []
    if (Array.isArray(payload)) {
      response = []
      each(payload, (payload) => {
        response.push(this.transformProductBenefitDetails(payload, businessEntityInfo))
      })
    } else {
      if (payload) {
        response = {
          description: get(payload, 'description', ''),
          selectedValue: this.getbusinessEntity(businessEntityInfo, get(payload, 'selectedValue', '')) || null
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
  }
}
