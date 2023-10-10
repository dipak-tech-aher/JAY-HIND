import { camelCaseConversion, pickProperties, constantCode } from '@utils'
import { each, get, isEmpty } from 'lodash'

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

  transformHelpdeskCount (helpdeskData, businessEntityInfo) {
    helpdeskData = helpdeskData.dataValues ? helpdeskData.dataValues : helpdeskData
    let response = []
    if (Array.isArray(helpdeskData)) {
      response = []
      each(helpdeskData, (helpdesk) => {
        response.push(this.transformHelpdeskCount(helpdesk, businessEntityInfo))
      })
    } else {
      response = {
        source: this.getbusinessEntity(businessEntityInfo, get(helpdeskData, 'source', '')) || null,
        count: get(helpdeskData, 'count', 0)
      }
    }
    return response
  },

  transformHelpdeskSearch (helpdeskData, businessEntityInfo) {
    helpdeskData = helpdeskData?.dataValues ? helpdeskData?.dataValues : helpdeskData
    let response = []
    if (Array.isArray(helpdeskData)) {
      response = []
      each(helpdeskData, (helpdesk) => {
        response.push(this.transformHelpdeskSearch(helpdesk, businessEntityInfo))
      })
    } else {
      if (helpdeskData) {
        response = {
          helpdeskId: get(helpdeskData, 'helpdeskId', ''),
          helpdeskNo: get(helpdeskData, 'helpdeskNo', ''),
          helpdeskSubject: get(helpdeskData, 'helpdeskSubject', ''),
          status: this.getbusinessEntity(businessEntityInfo, get(helpdeskData, 'status', '')) || null,
          statusChngDate: get(helpdeskData, 'statusChngDate', ''),
          helpdeskSource: this.getbusinessEntity(businessEntityInfo, get(helpdeskData, 'helpdeskSource', '')) || null,
          mailId: get(helpdeskData, 'mailId', ''),
          phoneNo: get(helpdeskData, 'phoneNo', ''),
          contactId: get(helpdeskData, 'contactId', ''),
          contactPreference: this.getbusinessEntity(businessEntityInfo, get(helpdeskData, 'contactPreference', '')) || null,
          helpdeskContent: get(helpdeskData, 'helpdeskContent', ''),
          currUser: get(helpdeskData, 'currUser', ''),
          ivrNo: get(helpdeskData, 'ivrNo', ''),
          helpdeskUuid: get(helpdeskData, 'helpdeskUuid', ''),
          project: this.getbusinessEntity(businessEntityInfo, get(helpdeskData, 'project', '')) || null,
          severity: this.getbusinessEntity(businessEntityInfo, get(helpdeskData, 'severity', '')) || null,
          helpdeskType: this.getbusinessEntity(businessEntityInfo, get(helpdeskData, 'helpdeskType', '')) || null,
          tranId: get(helpdeskData, 'tranId', ''),
          createdBy: get(helpdeskData, 'createdBy', ''),
          createdAt: get(helpdeskData, 'createdAt', ''),
          updatedBy: get(helpdeskData, 'updatedBy', ''),
          updatedAt: get(helpdeskData, 'updatedAt', ''),
          conversation: get(helpdeskData, 'txnDetails', []),
          customerDetails: !isEmpty(get(helpdeskData, 'contactDetails.customerDetails', '')) ? this.getCustomerDetails(get(helpdeskData, 'contactDetails.customerDetails', ''), businessEntityInfo, helpdeskData) : this.getCustomerDetails(get(helpdeskData, 'contactDetails.profileDetails', ''), businessEntityInfo, helpdeskData),
          interactionDetails: get(helpdeskData, 'contactDetails.customerDetails', '') ? this.getInteractionDetails(get(helpdeskData, 'contactDetails.customerDetails.customerIntxnDtls', ''), businessEntityInfo) : this.getInteractionDetails(get(helpdeskData, 'contactDetails.profileDetails.profileIntxnDtls', ''), businessEntityInfo)
        }
      } else {
        response = {}
      }
      return response
    }
    return response
  },

  getContactDetails (contactDetails, businessEntityInfo) {
    let response = []
    if (Array.isArray(contactDetails)) {
      response = []
      each(contactDetails, (contactDetails) => {
        response.push(this.getContactDetails(contactDetails, businessEntityInfo))
      })
    } else {
      if (contactDetails) {
        response = {
          contactId: get(contactDetails, 'contactId', ''),
          contactNo: get(contactDetails, 'contactNo', ''),
          isPrimary: get(contactDetails, 'isPrimary', ''),
          status: this.getbusinessEntity(businessEntityInfo, get(contactDetails, 'status', '')) || null,
          title: get(contactDetails, 'title', ''),
          firstName: get(contactDetails, 'firstName', ''),
          lastName: get(contactDetails, 'lastName', ''),
          contactType: this.getbusinessEntity(businessEntityInfo, get(contactDetails, 'contactType', '')) || null,
          emailId: get(contactDetails, 'emailId', ''),
          mobileNo: get(contactDetails, 'mobileNo', ''),
          mobilePrefix: get(contactDetails, 'mobilePrefix', ''),
          telephoneNo: get(contactDetails, 'telephoneNo', ''),
          telephonePrefix: get(contactDetails, 'telephonePrefix', ''),
          whatsappNo: get(contactDetails, 'whatsappNo', ''),
          whatsappNoPrefix: get(contactDetails, 'whatsappNoPrefix', ''),
          fax: get(contactDetails, 'fax', ''),
          facebookId: get(contactDetails, 'facebookId', ''),
          instagramId: get(contactDetails, 'instagramId', ''),
          telegramId: get(contactDetails, 'telegramId', ''),
          createdBy: get(contactDetails, 'createdBy', ''),
          createdAt: get(contactDetails, 'createdAt', ''),
          updatedBy: get(contactDetails, 'updatedBy', ''),
          updatedAt: get(contactDetails, 'updatedAt', '')
          //    customerDetails: get(contactDetails, 'customerDetails', '') ? this.getCustomerDetails(get(contactDetails, 'customerDetails', ''), businessEntityInfo) : this.getCustomerDetails(get(contactDetails, 'profileDetails', ''), businessEntityInfo)
        }
      } else {
        response = {}
      }

      return response
    }
    return response
  },

  getCustomerDetails (customerDetails, businessEntityInfo, helpdeskData) {
    let response = []
    if (Array.isArray(customerDetails)) {
      response = []
      each(customerDetails, (customerDetails) => {
        response.push(this.getCustomerDetails(customerDetails, businessEntityInfo, helpdeskData))
      })
    } else {
      if (customerDetails) {
        response = {
          profileId: get(customerDetails, 'profileId', get(customerDetails, 'customerId', '')),
          profileNo: get(customerDetails, 'profileNo', get(customerDetails, 'customerNo', '')),
          profileUuid: get(customerDetails, 'profileUuid', get(customerDetails, 'customerUuid')),
          status: this.getbusinessEntity(businessEntityInfo, get(customerDetails, 'status', '')) || null,
          firstName: get(customerDetails, 'firstName', ''),
          lastName: get(customerDetails, 'lastName', ''),
          gender: this.getbusinessEntity(businessEntityInfo, get(customerDetails, 'gender', '')) || null,
          profileCategory: get(customerDetails, 'profileCategory', '') ? this.getbusinessEntity(businessEntityInfo, get(customerDetails, 'profileCategory', '')) : this.getbusinessEntity(businessEntityInfo, get(customerDetails, 'customerCategory', '')),
          idType: this.getbusinessEntity(businessEntityInfo, get(customerDetails, 'idType', '')) || null,
          idValue: get(customerDetails, 'idValue', ''),
          contactPreferences: this.getbusinessEntity(businessEntityInfo, get(customerDetails, 'contactPreferences', '')) || null,
          projectMapping: get(customerDetails, 'dataValues.projectMapping', ''),
          source: get(customerDetails, 'profileId', '') ? constantCode?.entityCategory?.PROFILE : constantCode?.entityCategory?.CUSTOMER,
          createdBy: get(customerDetails, 'createdBy', ''),
          createdAt: get(customerDetails, 'createdAt', ''),
          updatedBy: get(customerDetails, 'updatedBy', ''),
          updatedAt: get(customerDetails, 'updatedAt', ''),
          contactDetails: this.getContactDetails(get(helpdeskData, 'contactDetails'), businessEntityInfo)
        }
        return response
      }
    }
    return response
  },

  getInteractionDetails (interactionData, businessEntityInfo) {
    let response = []
    if (Array.isArray(interactionData)) {
      response = []
      each(interactionData, (interactionData) => {
        response.push(this.getInteractionDetails(interactionData, businessEntityInfo))
      })
    } else {
      if (interactionData) {
        response = {
          intxnId: get(interactionData, 'intxnId', ''),
          intxnNo: get(interactionData, 'intxnNo', ''),
          helpdeskId: get(interactionData, 'helpdeskId', ''),
          chatId: get(interactionData, 'chatId', ''),
          customerId: get(interactionData, 'customerId', ''),
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
          createdBy: get(interactionData, 'userId', null),
          createdAt: get(interactionData, 'createdAt', null)
        }
      }
      return response
    }
    return response
  },

  getProfileContact (contactDetails, businessEntityInfo) {
    let response = []
    if (Array.isArray(contactDetails)) {
      response = []
      each(contactDetails, (contactDetails) => {
        response.push(this.getProfileContact(contactDetails, businessEntityInfo))
      })
    } else {
      if (contactDetails) {
        response = {
          contactId: get(contactDetails, 'contactId', ''),
          contactNo: get(contactDetails, 'contactNo', ''),
          isPrimary: get(contactDetails, 'isPrimary', ''),
          status: this.getbusinessEntity(businessEntityInfo, get(contactDetails, 'status', '')) || null,
          title: get(contactDetails, 'title', ''),
          firstName: get(contactDetails, 'firstName', ''),
          lastName: get(contactDetails, 'lastName', ''),
          contactType: this.getbusinessEntity(businessEntityInfo, get(contactDetails, 'contactType', '')) || null,
          emailId: get(contactDetails, 'emailId', ''),
          mobileNo: get(contactDetails, 'mobileNo', ''),
          mobilePrefix: get(contactDetails, 'mobilePrefix', ''),
          telephoneNo: get(contactDetails, 'telephoneNo', ''),
          telephonePrefix: get(contactDetails, 'telephonePrefix', ''),
          whatsappNo: get(contactDetails, 'whatsappNo', ''),
          whatsappNoPrefix: get(contactDetails, 'whatsappNoPrefix', ''),
          fax: get(contactDetails, 'fax', ''),
          facebookId: get(contactDetails, 'facebookId', ''),
          instagramId: get(contactDetails, 'instagramId', ''),
          telegramId: get(contactDetails, 'telegramId', ''),
          createdBy: get(contactDetails, 'createdBy', ''),
          createdAt: get(contactDetails, 'createdAt', ''),
          updatedBy: get(contactDetails, 'updatedBy', ''),
          updatedAt: get(contactDetails, 'updatedAt', ''),
          customerDetails: get(contactDetails, 'customerDetails', '') ? this.geprofileDetails(get(contactDetails, 'customerDetails', ''), businessEntityInfo) : this.geprofileDetails(get(contactDetails, 'profileDetails', ''), businessEntityInfo)
        }
      } else {
        response = {}
      }
    }
    return response
  },

  geprofileDetails (customerDetails, businessEntityInfo) {
    let response = []
    if (Array.isArray(customerDetails)) {
      response = []
      each(customerDetails, (customerDetails) => {
        response.push(this.geprofileDetails(customerDetails, businessEntityInfo))
      })
    } else {
      if (customerDetails) {
        response = {
          profileId: get(customerDetails, 'profileId', get(customerDetails, 'customerId', '')),
          profileNo: get(customerDetails, 'profileNo', get(customerDetails, 'customerNo', '')),
          profileUuid: get(customerDetails, 'profileUuid', get(customerDetails, 'customerUuid')),
          status: this.getbusinessEntity(businessEntityInfo, get(customerDetails, 'status', '')) || null,
          projectMapping: get(customerDetails, 'dataValues.projectMapping', ''),
          source: get(customerDetails, 'profileId', '') ? constantCode?.entityCategory?.PROFILE : constantCode?.entityCategory?.CUSTOMER,
          firstName: get(customerDetails, 'firstName', ''),
          lastName: get(customerDetails, 'lastName', ''),
          profileCategory: get(customerDetails, 'profileCategory', '') ? this.getbusinessEntity(businessEntityInfo, get(customerDetails, 'profileCategory', '')) : this.getbusinessEntity(businessEntityInfo, get(customerDetails, 'customerCategory', '')),
          gender: this.getbusinessEntity(businessEntityInfo, get(customerDetails, 'gender', '')) || null,
          idType: this.getbusinessEntity(businessEntityInfo, get(customerDetails, 'idType', '')) || null,
          idValue: get(customerDetails, 'idValue', ''),
          contactPreferences: this.getbusinessEntity(businessEntityInfo, get(customerDetails, 'contactPreferences', '')) || null,
          createdBy: get(customerDetails, 'createdBy', ''),
          createdAt: get(customerDetails, 'createdAt', ''),
          updatedBy: get(customerDetails, 'updatedBy', ''),
          updatedAt: get(customerDetails, 'updatedAt', '')
        }
      } else {
        response = {}
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
  }

}
