import { camelCaseConversion, pickProperties } from '@utils'
import { each, get } from 'lodash'

module.exports = {
  // single transformation
  Transform (user) {
    const requiredProperties = []

    return pickProperties(camelCaseConversion(user), requiredProperties)
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
  // array transformation
  transformCollection (users) {
    const self = this
    const data = []
    for (let i = 0; i <= users.length; i++) {
      data.push(self.transform(users[i]))
    }
    return data
  },

  transformServiceEvents (payload, businessEntityInfo) {
    let response = []
    if (Array.isArray(payload)) {
      response = []
      each(payload, (payload) => {
        response.push(this.transformServiceEvents(payload, businessEntityInfo))
      })
    } else {
      if (payload && businessEntityInfo) {
        response = {
          serviceNo: get(payload, 'serviceNo', ''),
          serviceName: get(payload, 'serviceName', ''),
          status: this.getbusinessEntity(businessEntityInfo, get(payload, 'status', '')) || null,
          serviceCategory: this.getbusinessEntity(businessEntityInfo, get(payload, 'serviceCategory', '')) || null,
          serviceType: this.getbusinessEntity(businessEntityInfo, get(payload, 'serviceType', '')) || null,
          serviceClass: this.getbusinessEntity(businessEntityInfo, get(payload, 'serviceClass', '')) || null,
          activationDate: get(payload, 'activationDate', ''),
          expiryDate: get(payload, 'expiryDate', '')
        }
      }
    }
    return response
  },

  transformContractEvents (payload, businessEntityInfo) {
    let response = []
    if (Array.isArray(payload)) {
      response = []
      each(payload, (payload) => {
        response.push(this.transformContractEvents(payload, businessEntityInfo))
      })
    } else {
      if (payload && businessEntityInfo) {
        response = {
          contractNo: get(payload, 'contractNo', ''),
          contractName: get(payload, 'contractName', ''),
          status: this.getbusinessEntity(businessEntityInfo, get(payload, 'status', '')) || null,
          rcAmount: get(payload, 'rcAmount', ''),
          otcAmount: get(payload, 'otcAmount', ''),
          actualStartDate: get(payload, 'actualStartDate', ''),
          actualEndDate: get(payload, 'actualEndDate', ''),
          lastBillPeriod: get(payload, 'lastBillPeriod', ''),
          nextBillPeriod: get(payload, 'nextBillPeriod', ''),
          serviceNo: get(payload, 'customerServiceContract.serviceNo', ''),
          serviceName: get(payload, 'customerServiceContract.serviceName', ''),
          serviceCategory: this.getbusinessEntity(businessEntityInfo, get(payload, 'customerServiceContract.serviceCategory', '')) || null,
          serviceType: this.getbusinessEntity(businessEntityInfo, get(payload, 'customerServiceContract.serviceType', '')) || null,
          serviceClass: this.getbusinessEntity(businessEntityInfo, get(payload, 'customerServiceContract.serviceClass', '')) || null
        }
      }
    }
    return response
  },
  transformInteractionEvents (payload, businessEntityInfo) {
    let response = []
    if (Array.isArray(payload)) {
      response = []
      each(payload, (payload) => {
        response.push(this.transformInteractionEvents(payload, businessEntityInfo))
      })
    } else {
      if (payload && businessEntityInfo) {
        response = {
          intxnNo: get(payload, 'intxnNo', ''),
          intxnStatus: this.getbusinessEntity(businessEntityInfo, get(payload, 'intxnStatus', '')) || null,
          intxnCategory: this.getbusinessEntity(businessEntityInfo, get(payload, 'intxnCategory', '')) || null,
          intxnType: this.getbusinessEntity(businessEntityInfo, get(payload, 'intxnType', '')) || null,
          serviceCategory: this.getbusinessEntity(businessEntityInfo, get(payload, 'serviceCategory', '')) || null,
          serviceType: this.getbusinessEntity(businessEntityInfo, get(payload, 'serviceType', '')) || null,
          requestStatement: get(payload, 'requestStatement', ''),
          intxnPriority: this.getbusinessEntity(businessEntityInfo, get(payload, 'intxnPriority', '')) || null,
          intxnChannel: this.getbusinessEntity(businessEntityInfo, get(payload, 'intxnChannel', '')) || null,
          createdAt: get(payload, 'createdAt', '')
        }
      }
    }
    return response
  },
  transformOrderEvents (payload, businessEntityInfo) {
    let response = []
    if (Array.isArray(payload)) {
      response = []
      each(payload, (payload) => {
        response.push(this.transformOrderEvents(payload, businessEntityInfo))
      })
    } else {
      if (payload && businessEntityInfo) {
        response = {
          orderNo: get(payload, 'orderNo', ''),
          orderStatus: this.getbusinessEntity(businessEntityInfo, get(payload, 'orderStatus', '')) || null,
          orderCategory: this.getbusinessEntity(businessEntityInfo, get(payload, 'orderCategory', '')) || null,
          orderType: this.getbusinessEntity(businessEntityInfo, get(payload, 'orderType', '')) || null,
          orderChannel: this.getbusinessEntity(businessEntityInfo, get(payload, 'orderChannel', '')) || null,
          orderPriority: this.getbusinessEntity(businessEntityInfo, get(payload, 'orderPriority', '')) || null,
          serviceType: this.getbusinessEntity(businessEntityInfo, get(payload, 'serviceType', '')) || null,
          createdAt: get(payload, 'createdAt', '')
        }
      }
    }
    return response
  }
}
