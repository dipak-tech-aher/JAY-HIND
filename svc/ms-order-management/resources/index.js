import { camelCaseConversion, pickProperties } from '@utils'
import { each, get, isEmpty } from 'lodash'

module.exports = {
  // single transformation
  Transform(user) {
    const requiredProperties = []

    return pickProperties(camelCaseConversion(user), requiredProperties)
  },

  // array transformation
  transformCollection(users) {
    const self = this
    const data = []
    for (let i = 0; i <= users.length; i++) {
      data.push(self.transform(users[i]))
    }
    return data
  },

  orderDetailsTransform(orderProductData, businessEntityInfo, businessUnitInfo, roleinfo) {
    let response = null
    if (Array.isArray(orderProductData)) {
      response = []
      each(orderProductData, (orderProductData) => {
        response.push(this.orderDetailsTransform(orderProductData, businessEntityInfo, businessUnitInfo, roleinfo))
      })
    } else {
      if (isEmpty(orderProductData)) {
        return {}
      }
      const response = {
        orderId: get(orderProductData, 'orderId', ''),
        serviceDetails: get(orderProductData, 'serviceDetails', ''),
        serviceId: get(orderProductData, 'serviceId', ''),
        accountId: get(orderProductData, 'accountId', ''),
        orderUuid: get(orderProductData, 'orderUuid', ''),
        orderNo: get(orderProductData, 'orderNo', ''),
        orderTasks: get(orderProductData, 'orderTasks', []),
        orderStatus: this.getbusinessEntity(businessEntityInfo, get(orderProductData, 'orderStatus', '')) || null,
        currEntity: this.getbusinessUnit(businessUnitInfo, get(orderProductData, 'currEntity', '')) || null,
        currRole: this.getrole(roleinfo, get(orderProductData, 'currRole', '')) || null,
        currUser: get(orderProductData, 'currUserDetails', '') || null,
        orderDate: get(orderProductData, 'orderDate', ''),
        orderCategory: this.getbusinessEntity(businessEntityInfo, get(orderProductData, 'orderCategory', '')) || null,
        orderSource: this.getbusinessEntity(businessEntityInfo, get(orderProductData, 'orderSource', '')) || null,
        orderType: this.getbusinessEntity(businessEntityInfo, get(orderProductData, 'orderType', '')) || null,
        orderChannel: this.getbusinessEntity(businessEntityInfo, get(orderProductData, 'orderChannel', '')) || null,
        orderCause: this.getbusinessEntity(businessEntityInfo, get(orderProductData, 'orderCause', '')) || null,
        orderPriority: this.getbusinessEntity(businessEntityInfo, get(orderProductData, 'orderPriority', '')) || null,
        deliveryLocation: this.getbusinessEntity(businessEntityInfo, get(orderProductData, 'deliveryLocation', '')) || null,
        billAmount: get(orderProductData, 'billAmount', ''),
        rcAmount: get(orderProductData, 'rcAmount', ''),
        nrcAmount: get(orderProductData, 'nrcAmount', ''),
        orderDescription: get(orderProductData, 'orderDescription', ''),
        orderStatusReason: this.getbusinessEntity(businessEntityInfo, get(orderProductData, 'orderStatusReason', '')) || null,
        serviceType: this.getbusinessEntity(businessEntityInfo, get(orderProductData, 'serviceType', '')) || null,
        intxnId: get(orderProductData, 'intxnId', ''),
        orderFamily: this.getbusinessEntity(businessEntityInfo, get(orderProductData, 'orderFamily', '')) || null,
        orderMode: this.getbusinessEntity(businessEntityInfo, get(orderProductData, 'orderMode', '')) || null,
        orderDeliveryMode: this.getbusinessEntity(businessEntityInfo, get(orderProductData, 'orderDeliveryMode', '')) || null,
        parentFlag: get(orderProductData, 'parentFlag', ''),
        parentOrderUuid: get(orderProductData, 'parentOrderUuid', ''),
        customerDetails: this.getCustomerDetails(businessEntityInfo, get(orderProductData, 'customerDetails', '')) || null,
        orderProductDetails: this.getOrderProductDetailsTransform(get(orderProductData, 'orderProductDtls', ''), businessEntityInfo),
        childOrder: !isEmpty(get(orderProductData, 'childOrder', [])) ? this.orderDetailsTransform(get(orderProductData, 'childOrder', ''), businessEntityInfo, businessUnitInfo, roleinfo) : []
        //    orderTranactionDetails: this.getorderTranactionDetailsTransform(get(orderProductData, 'orderTxnDtls', ''), businessEntityInfo, businessUnitInfo, roleinfo)
      }
      return response
    }
    return response
  },

  getOrderProductDetailsTransform(orderProductData, businessEntityInfo) {
    let response = null
    if (Array.isArray(orderProductData)) {
      response = []
      each(orderProductData, (orderProductData) => {
        response.push(this.getOrderProductDetailsTransform(orderProductData, businessEntityInfo))
      })
    } else {
      if (isEmpty(orderProductData)) {
        return {}
      }
      const response = {
        orderDtlUuid: get(orderProductData, 'orderDtlUuid', ''),
        orderDtlId: get(orderProductData, 'orderDtlId', ''),
        orderId: get(orderProductData, 'orderId', ''),
        productId: get(orderProductData, 'productId', ''),
        productQuantity: get(orderProductData, 'productQuantity', ''),
        productStatus: get(orderProductData, 'productStatus', ''),
        productAddedDate: get(orderProductData, 'productAddedDate', ''),
        billAmount: get(orderProductData, 'billAmount', ''),
        edof: get(orderProductData, 'edof', ''),
        productSerialNo: get(orderProductData, 'productSerialNo', ''),
        productDetails: this.getproductDetails(get(orderProductData, 'productDetails', ''), businessEntityInfo) || null,
        createdDeptId: get(orderProductData, 'createdDeptId', ''),
        createdRoleId: get(orderProductData, 'createdRoleId', ''),
        tranId: get(orderProductData, 'tranId', ''),
        createdBy: get(orderProductData, 'createdBy', ''),
        createdAt: get(orderProductData, 'createdAt', ''),
        updatedBy: get(orderProductData, 'updatedBy', ''),
        updatedAt: get(orderProductData, 'updatedAt', '')
      }
      return response
    }
    return response
  },

  getorderTranactionDetailsTransform(orderData, businessEntityInfo, businessUnitInfo, rolesDataInfo) {
    let response = null
    if (Array.isArray(orderData)) {
      response = []
      each(orderData, (orderData) => {
        response.push(this.getorderTranactionDetailsTransform(orderData, businessEntityInfo, businessUnitInfo, rolesDataInfo))
      })
    } else {
      const response = {
        // orderId: get(orderData, 'orderId', ''),
        orderTxnUuid: get(orderData, 'orderTxnUuid', ''),
        // orderTxnId: get(orderData, 'orderTxnId', ''),
        orderTxnNo: get(orderData, 'orderTxnNo', ''),
        orderStatus: this.getbusinessEntity(businessEntityInfo, get(orderData, 'orderStatus', '')) || null,
        orderFlow: this.getbusinessEntity(businessEntityInfo, get(orderData, 'orderFlow', '')) || null,
        fromEntityId: this.getbusinessUnit(businessUnitInfo, get(orderData, 'fromEntityId', '')) || null,
        fromRoleId: this.getrole(rolesDataInfo, get(orderData, 'fromRoleId', '')) || null,
        fromUserDescription: get(orderData, 'fromUserDescription', ''),
        toEntityId: this.getbusinessUnit(businessUnitInfo, get(orderData, 'toEntityId', '')) || null,
        toRoleId: this.getrole(rolesDataInfo, get(orderData, 'toRoleId', '')) || null,
        toUserDescription: get(orderData, 'toUserDescription', ''),
        orderDate: get(orderData, 'orderDate', ''),
        slaCode: get(orderData, 'slaCode', ''),
        slaLastAlertDate: get(orderData, 'slaLastAlertDate', ''),
        createdByDescription: get(orderData, 'createdByDescription', ''),
        createdAt: get(orderData, 'createdAt', ''),
        updatedByDescription: get(orderData, 'updatedByDescription', ''),
        updatedAt: get(orderData, 'updatedAt', ''),
        remarks: get(orderData, 'remarks', ''),
        orderProductTranaction: this.orderProductTranactionTransform(get(orderData, 'orderProductTxn', ''), businessEntityInfo)
      }
      return response
    }
    return response
  },

  orderProductTranactionTransform(orderProductData, businessEntityInfo) {
    let response = null
    if (Array.isArray(orderProductData)) {
      response = []
      each(orderProductData, (orderProductData) => {
        response.push(this.orderProductTranactionTransform(orderProductData, businessEntityInfo))
      })
    } else {
      const response = {
        orderTxnDtlUuid: get(orderProductData, 'orderTxnDtlUuid', ''),
        productId: get(orderProductData, 'productId', ''),
        productQuantity: get(orderProductData, 'productQuantity', ''),
        productStatus: get(orderProductData, 'productStatus', ''),
        productAddedDate: get(orderProductData, 'productAddedDate', ''),
        productTransactionDetails: this.getproductDetails(get(orderProductData, 'productTxnDtls', ''), businessEntityInfo) || {},
        billAmount: get(orderProductData, 'billAmount', ''),
        edof: get(orderProductData, 'edof', ''),
        productSerialNo: get(orderProductData, 'productSerialNo', ''),
        createdBy: get(orderProductData, 'createdBy', ''),
        createdAt: get(orderProductData, 'createdAt', ''),
        updatedBy: get(orderProductData, 'updatedBy', ''),
        updatedAt: get(orderProductData, 'updatedAt', '')
      }

      return response
    }
    return response
  },

  getproductDetails(orderProductData, businessEntityInfo) {
    let response = null
    if (Array.isArray(orderProductData)) {
      response = []
      each(orderProductData, (orderProductData) => {
        response.push(this.getproductDetails(orderProductData, businessEntityInfo))
      })
    } else {
      const response = {
        productImage: get(orderProductData, 'productImage', ''),
        productUuid: get(orderProductData, 'productUuid', ''),
        productId: get(orderProductData, 'productId', ''),
        productNo: get(orderProductData, 'productNo', ''),
        status: get(orderProductData, 'status', ''),
        productName: get(orderProductData, 'productName', ''),
        productFamily: this.getbusinessEntity(businessEntityInfo, get(orderProductData, 'productFamily', '')) || null,
        productCategory: this.getbusinessEntity(businessEntityInfo, get(orderProductData, 'productCategory', '')) || null,
        productSubCategory: this.getbusinessEntity(businessEntityInfo, get(orderProductData, 'productSubCategory', '')) || null,
        productType: this.getbusinessEntity(businessEntityInfo, get(orderProductData, 'productType', '')) || null,
        serviceType: this.getbusinessEntity(businessEntityInfo, get(orderProductData, 'serviceType', '')) || null,
        chargeType: this.getbusinessEntity(businessEntityInfo, get(orderProductData, 'chargeType', '')) || null,
        provisioningType: this.getbusinessEntity(businessEntityInfo, get(orderProductData, 'provisioningType', '')) || null,
        createdBy: get(orderProductData, 'createdBy', ''),
        createdAt: get(orderProductData, 'createdAt', ''),
        updatedBy: get(orderProductData, 'updatedBy', ''),
        updatedAt: get(orderProductData, 'updatedAt', '')
      }
      return response
    }
    return response
  },

  getCustomerDetails(businessEntityInfo, customerDetails) {
    let response = null
    if (Array.isArray(customerDetails)) {
      response = []
      each(customerDetails, (customerDetails) => {
        response.push(this.getCustomerDetails(businessEntityInfo, customerDetails))
      })
    } else {
      const response = {
        customerId: get(customerDetails, 'customerId', ''),
        customerUuid: get(customerDetails, 'customerUuid', ''),
        customerNo: get(customerDetails, 'customerNo', ''),
        customerClass: this.getbusinessEntity(businessEntityInfo, get(customerDetails, 'customerClass', '')) || null,
        firstName: get(customerDetails, 'firstName', ''),
        lastName: get(customerDetails, 'lastName', ''),
        gender: this.getbusinessEntity(businessEntityInfo, get(customerDetails, 'gender', '')) || null,
        birthDate: get(customerDetails, 'birthDate', ''),
        idType: this.getbusinessEntity(businessEntityInfo, get(customerDetails, 'idType', '')) || null,
        idValue: get(customerDetails, 'idValue', ''),
        customerCategory: this.getbusinessEntity(businessEntityInfo, get(customerDetails, 'customerCategory', '')) || null,
        status: this.getbusinessEntity(businessEntityInfo, get(customerDetails, 'status', '')) || null,
        currency: get(customerDetails, 'customerAccounts[0].currencyDesc', ''),
        customerAccounts: get(customerDetails, 'customerAccounts', ''),
        customerAddress: this.getCustomerAddress(businessEntityInfo, get(customerDetails, 'customerAddress', '')),
        customerContact: this.getCustomerContact(businessEntityInfo, get(customerDetails, 'customerContact', '')),
        customerPhoto: get(customerDetails, 'customerPhoto', '')
      }
      return response
    }
    return response
  },

  getCustomerAddress(businessEntityInfo, customerAddress) {
    let response = null
    if (Array.isArray(customerAddress)) {
      response = []
      each(customerAddress, (customerAddress) => {
        response.push(this.getCustomerAddress(businessEntityInfo, customerAddress))
      })
    } else {
      const response = {
        addressNo: get(customerAddress, 'addressNo', ''),
        addressUuid: get(customerAddress, 'addressUuid', ''),
        status: this.getbusinessEntity(businessEntityInfo, get(customerAddress, 'status', '')),
        isPrimary: get(customerAddress, 'isPrimary', ''),
        addressType: this.getbusinessEntity(businessEntityInfo, get(customerAddress, 'addressType', '')),
        address1: get(customerAddress, 'address1', ''),
        address2: get(customerAddress, 'address2', ''),
        address3: get(customerAddress, 'address3', ''),
        city: get(customerAddress, 'city', ''),
        district: get(customerAddress, 'district', ''),
        state: get(customerAddress, 'state', ''),
        postcode: get(customerAddress, 'postcode', ''),
        country: get(customerAddress, 'country', ''),
        latitude: get(customerAddress, 'latitude', ''),
        longitude: get(customerAddress, 'longitude', ''),
        billFlag: get(customerAddress, 'billFlag', '')
      }
      return response
    }
    return response
  },

  getCustomerContact(businessEntityInfo, customerContact) {
    let response = null
    if (Array.isArray(customerContact)) {
      response = []
      each(customerContact, (customerContact) => {
        response.push(this.getCustomerContact(businessEntityInfo, customerContact))
      })
    } else {
      const response = {
        contactNo: get(customerContact, 'contactNo', ''),
        status: get(customerContact, 'status', ''),
        isPrimary: get(customerContact, 'isPrimary', ''),
        contactType: get(customerContact, 'contactType', ''),
        firstName: get(customerContact, 'firstName', ''),
        lastName: get(customerContact, 'lastName', ''),
        emailId: get(customerContact, 'emailId', ''),
        mobilePrefix: get(customerContact, 'mobilePrefix', ''),
        mobileNo: get(customerContact, 'mobileNo', '')
      }
      return response
    }
    return response
  },

  getbusinessEntity(businessEntityInfo, code) {
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

  getbusinessUnit(businessUnitInfo, code) {
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

  getrole(roleinfo, code) {
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

  compareRecords(oldRecord, newRecord, fields) {
    let isNotSame = false

    // eslint-disable-next-line array-callback-return
    fields.some(field => {
      if (newRecord && oldRecord && newRecord?.hasOwnProperty(field) && oldRecord?.hasOwnProperty(field) &&
        newRecord[field] && oldRecord[field] && newRecord[field] !== oldRecord[field]) {
        isNotSame = true
      }
    })

    return isNotSame
  },

  transformRecord(oldRecord, newRecord, fields) {
    return fields.reduce((a, v) => ({ ...a, [v]: get(newRecord, v, oldRecord[v]) }), {})
  },
  getMyOrderHistoryGraphTransform(orderDetails) {
    let response = null
    if (Array.isArray(orderDetails)) {
      response = []
      each(orderDetails, (orderDetails) => {
        response.push(this.getMyOrderHistoryGraphTransform(orderDetails))
      })
    } else {
      const response = {
        orderId: get(orderDetails, 'orderId', ''),
        createdAt: get(orderDetails, 'createdAt', ''),
        orderNo: get(orderDetails, 'orderNo', ''),
        orderStatus: get(orderDetails, 'orderStatusDesc.code', ''),
        orderStatusDesc: get(orderDetails, 'orderStatusDesc.description', ''),
        serviceType: get(orderDetails, 'serviceTypeDesc.code', ''),
        serviceTypeDesc: get(orderDetails, 'serviceTypeDesc.description', ''),
        orderType: get(orderDetails, 'orderTypeDesc.code', ''),
        orderTypeDesc: get(orderDetails, 'orderTypeDesc.description', ''),
        orderCategory: get(orderDetails, 'orderCategoryDesc.code', ''),
        orderCategoryDesc: get(orderDetails, 'orderCategoryDesc.description', ''),
        orderSource: get(orderDetails, 'orderSourceDesc.code', ''),
        orderSourceDesc: get(orderDetails, 'orderSourceDesc.description', ''),
        orderChannel: get(orderDetails, 'orderChannelDesc.code', ''),
        orderChannelDesc: get(orderDetails, 'orderChannelDesc.description', ''),
        orderCause: get(orderDetails, 'orderCauseDesc.code', ''),
        orderCauseDesc: get(orderDetails, 'orderCauseDesc.description', ''),
        orderPriority: get(orderDetails, 'orderPriorityDesc.code', ''),
        orderPriorityDesc: get(orderDetails, 'orderPriorityDesc.description', ''),
        orderFamily: get(orderDetails, 'orderFamilyDesc.code', ''),
        orderFamilyDesc: get(orderDetails, 'orderFamilyDesc.description', '')
      }
      return response
    }
    return response
  },
  transformOrderCategoryPermormance(inputData) {
    let response = null
    if (Array.isArray(inputData)) {
      response = []
      each(inputData, (inputData) => {
        response.push(this.transformOrderCategoryPermormance(inputData))
      })
    } else {
      return {
        type: get(inputData, 'oOrderType', get(inputData, 'oOrderCategory', '')),
        description: get(inputData, 'oOrderTypeDesc', get(inputData, 'oOrderCategoryDesc', '')),
        status: get(inputData, 'oOrderStatusDesc', ''),
        count: get(inputData, 'oOrderCnt', 0)
      }
    }
    return response
  },

  transformTopPerformance(inputData) {
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
  }
}
