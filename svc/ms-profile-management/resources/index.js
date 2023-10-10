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
    oldRecord = oldRecord.dataValues ? oldRecord : oldRecord
    newRecord = newRecord.dataValues ? newRecord : newRecord
    // eslint-disable-next-line array-callback-return
    fields.some(field => {
      if (newRecord[field] && newRecord[field] !== oldRecord[field]) {
        isNotSame = true
      }
    })
    return isNotSame
  },
  transformProfileSearch (profileData, businessEntityInfo, businessUnitInfo) {
    let response = []
    if (Array.isArray(profileData)) {
      response = []
      each(profileData, (profileData) => {
        profileData = profileData?.dataValues ? profileData?.dataValues : profileData
        response.push(this.transformProfileSearch(profileData, businessEntityInfo, businessUnitInfo))
      })
    } else {
      response = {
        profileId: get(profileData, 'profileId', ''),
        profileUuid: get(profileData, 'profileUuid', ''),
        profileNo: get(profileData, 'profileNo', ''),
        customerId: get(profileData, 'customerId', ''),
        firstName: get(profileData, 'firstName', ''),
        lastName: get(profileData, 'lastName', ''),
        profileAge: get(profileData, 'profileAge', ''),
        birthDate: get(profileData, 'birthDate', ''),
        idValue: get(profileData, 'idValue', ''),
        registeredNo: get(profileData, 'registeredNo', ''),
        registeredDate: get(profileData, 'registeredDate', ''),
        nationality: get(profileData, 'nationality', ''),
        profilePhoto: get(profileData, 'profilePhoto', ''),
        taxNo: get(profileData, 'taxNo', ''),
        contactPreferences: get(profileData, 'contactPreferences', ''),
        status: this.getbusinessEntity(businessEntityInfo, get(profileData, 'status', '')) || null,
        gender: this.getbusinessEntity(businessEntityInfo, get(profileData, 'gender', '')) || null,
        idType: this.getbusinessEntity(businessEntityInfo, get(profileData, 'idType', '')) || null,
        projectMapping: get(profileData, 'projectMapping', ''),
        createdAt: get(profileData, 'createdAt', ''),
        updatedAt: get(profileData, 'updatedAt', ''),
        updatedBy: get(profileData, 'updatedBy', ''),
        createdBy: get(profileData, 'createdBy', ''),
        profileContact: this.getContactDetails(get(profileData, 'profileContact', ''), businessEntityInfo, []) || null,
        profileAddress: this.getAddressDetails(get(profileData, 'profileAddress', ''), businessEntityInfo, []) || null
      }
      return response
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
  getContactDetails (contactDetails, businessEntityInfo) {
    let contactResponse = []
    if (Array.isArray(contactDetails)) {
      contactResponse = []
      each(contactDetails, (contactDetails) => {
        contactDetails = contactDetails?.dataValues ? contactDetails?.dataValues : contactDetails
        contactResponse.push(this.getContactDetails(contactDetails, businessEntityInfo))
      })
    } else {
      contactResponse = {
        contactId: get(contactDetails, 'contactId', ''),
        contactNo: get(contactDetails, 'contactNo', ''),
        isPrimary: get(contactDetails, 'isPrimary', ''),
        title: get(contactDetails, 'title', ''),
        firstName: get(contactDetails, 'firstName', ''),
        lastName: get(contactDetails, 'lastName', ''),
        emailId: get(contactDetails, 'emailId', ''),
        mobileNo: get(contactDetails, 'mobileNo', ''),
        mobilePrefix: get(contactDetails, 'mobilePrefix', ''),
        telephoneNo: get(contactDetails, 'telephoneNo', ''),
        telephonePrefix: get(contactDetails, 'telephonePrefix', ''),
        whatsappNo: get(contactDetails, 'whatsappNo', ''),
        whatsappNoPrefix: get(contactDetails, 'whatsappNoPrefix', ''),
        facebookId: get(contactDetails, 'facebookId', ''),
        instagramId: get(contactDetails, 'instagramId', ''),
        telegramId: get(contactDetails, 'telegramId', ''),
        secondaryEmail: get(contactDetails, 'secondaryEmail', ''),
        secondaryContactNo: get(contactDetails, 'secondaryContactNo', ''),
        contactCategoryValue: get(contactDetails, 'contactCategoryValue', ''),
        status: this.getbusinessEntity(businessEntityInfo, get(contactDetails, 'status', '')) || null,
        contactCategory: this.getbusinessEntity(businessEntityInfo, get(contactDetails, 'contactCategory', '')) || null,
        contactType: this.getbusinessEntity(businessEntityInfo, get(contactDetails, 'contactType', '')) || null,
        createdAt: get(contactDetails, 'createdAt', ''),
        updatedAt: get(contactDetails, 'updatedAt', ''),
        updatedBy: get(contactDetails, 'updatedBy', ''),
        createdBy: get(contactDetails, 'createdBy', '')
      }
      return contactResponse
    }
    return contactResponse
  },
  getAddressDetails (addressDetails, businessEntityInfo) {
    let response = []
    if (Array.isArray(addressDetails)) {
      response = []
      each(addressDetails, (addressDetails) => {
        addressDetails = addressDetails?.dataValues ? addressDetails?.dataValues : addressDetails
        response.push(this.getAddressDetails(addressDetails, businessEntityInfo))
      })
    } else {
      response = {
        addressId: get(addressDetails, 'addressId', ''),
        addressNo: get(addressDetails, 'addressNo', ''),
        isPrimary: get(addressDetails, 'isPrimary', ''),
        status: this.getbusinessEntity(businessEntityInfo, get(addressDetails, 'status', '')) || null,
        addressCategory: this.getbusinessEntity(businessEntityInfo, get(addressDetails, 'addressCategory', '')) || null,
        addressCategoryValue: get(addressDetails, 'createdAt', ''),
        addressType: this.getbusinessEntity(businessEntityInfo, get(addressDetails, 'addressType', '')) || null,
        address1: get(addressDetails, 'address1', ''),
        address2: get(addressDetails, 'address2', ''),
        address3: get(addressDetails, 'address3', ''),
        city: get(addressDetails, 'city', ''),
        district: get(addressDetails, 'district', ''),
        state: get(addressDetails, 'state', ''),
        postcode: get(addressDetails, 'postcode', ''),
        country: get(addressDetails, 'country', ''),
        latitude: get(addressDetails, 'latitude', ''),
        longitude: get(addressDetails, 'longitude', ''),
        createdAt: get(addressDetails, 'createdAt', ''),
        updatedAt: get(addressDetails, 'updatedAt', ''),
        updatedBy: get(addressDetails, 'updatedBy', ''),
        createdBy: get(addressDetails, 'createdBy', '')
      }
      return response
    }
    return response
  }
}
