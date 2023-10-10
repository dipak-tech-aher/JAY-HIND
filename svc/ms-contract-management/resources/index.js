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

  transformScheduledMonthlyContracts (payload) {
    let response = []
    if (Array.isArray(payload)) {
      response = []
      each(payload, (payload) => {
        response.push(this.transformScheduledMonthlyContracts(payload))
      })
    } else {
      if (payload) {
        return {
          contractName: get(payload, 'contractName', ''),
          contractStartDate: get(payload, 'actualStartDate', ''),
          contractEndDate: get(payload, 'actualEndDate', ''),
          status: get(payload, 'status', ''),
          rcAmount: get(payload, 'rcAmount', ''),
          otcAmount: get(payload, 'otcAmount', ''),
          billing: this.transformMonthlyContracts(get(payload, 'monthlyContractDetails', ''))
        }
      }
    }
    return response
  },

  transformMonthlyContracts (payload) {
    let response = []
    if (Array.isArray(payload)) {
      response = []
      each(payload, (payload) => {
        response.push(this.transformMonthlyContracts(payload))
      })
    } else {
      if (payload) {
        return {
          monthlyContractId: get(payload, 'monthlyContractId', ''),
          startDate: get(payload, 'actualStartDate', ''),
          endDate: get(payload, 'actualEndDate', ''),
          status: get(payload, 'statusDesc', ''),
          rcAmount: get(payload, 'rcAmount', ''),
          otcAmount: get(payload, 'otcAmount', ''),
          paymentPaid: !!get(payload, 'invoiceDetails.paymentDetail[0].status', '')
        }
      }
    }
    return response
  }
}
