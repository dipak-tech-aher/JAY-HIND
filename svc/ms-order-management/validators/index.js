
const Joi = require('joi').extend(require('@joi/date'))

// export const createOrderValidator = Joi.object({
//   customerId: Joi.number().strict().required(),
//   customerUuid: Joi.string().required(),
//   accountId: Joi.number().strict().required(),
//   accountUuid: Joi.string().required(),
//   serviceId: Joi.number().strict().required(),
//   serviceUuid: Joi.string().required(),
//   orderCategory: Joi.string().required(),
//   orderSource: Joi.string().required(),
//   orderType: Joi.string().required(),
//   orderChannel: Joi.string().required(),
//   orderCause: Joi.string().required(),
//   orderPriority: Joi.string().required(),
//   billAmount: Joi.number().strict().precision(2).required(),
//   orderDescription: Joi.string().allow(),
//   intxnId: Joi.number().strict().allow(),
//   orderFamily: Joi.string().required(),
//   orderMode: Joi.string().required(),
//   contactPreference: Joi.array().items(Joi.string()).required(),
//   requestId: Joi.number().allow(),
//   requestStatement: Joi.string().allow(),
//   serviceType: Joi.string().required(),
//   orderDeliveryMode: Joi.string().required(),
//   product: Joi.array().items({
//     productId: Joi.number().strict().required(),
//     productQuantity: Joi.number().strict().required(),
//     productAddedDate: Joi.date().format('YYYY-MM-DD HH:mm:ss').required(),
//     billAmount: Joi.number().strict().precision(2).required(),
//     edof: Joi.date().format('YYYY-MM-DD').required(),
//     productSerialNo: Joi.string().required()
//   }).required()
// })

export const createOrderValidator = Joi.object({
  customerUuid: Joi.string().required(),
  orderCategory: Joi.string().required(),
  orderSource: Joi.string().required(),
  orderType: Joi.string().required(),
  orderChannel: Joi.string().required(),
  agreementDetail: Joi.object(),
  orderCause: Joi.string().allow(),
  orderPriority: Joi.string().required(),
  billAmount: Joi.number().strict().required(), // overall bill amount
  orderDescription: Joi.string().required(),
  requestId: Joi.string().allow(),
  requestStatement: Joi.string().allow(),
  appointmentList: Joi.array(),
  order: Joi.array().items({
    orderFamily: Joi.string().required(),
    orderMode: Joi.string().allow(),
    billAmount: Joi.number().strict().required(),
    orderDeliveryMode: Joi.string().allow(),
    orderDescription: Joi.string().required(),
    serviceType: Joi.string().required(),
    accountUuid: Joi.string().required(),
    serviceUuid: Joi.string().required(),
    productBenefit: Joi.array(),
    actualProductBenefit: Joi.array(),
    contactPreference: Joi.array().items(Joi.string()),
    rcAmount: Joi.number().allow(),
    nrcAmount: Joi.number().allow(),
    advanceCharge: Joi.string().allow(),
    upfrontCharge: Joi.string().allow(),
    isBundle: Joi.boolean().allow(null),
    isSplitOrder: Joi.boolean().allow(null),
    prorated: Joi.string().allow(),
    product: Joi.array().items({
      productId: Joi.number().strict().required(),
      productQuantity: Joi.number().strict().required(),
      productAddedDate: Joi.date().format('YYYY-MM-DD HH:mm:ss').required(),
      billAmount: Joi.number().strict().precision(2).required(),
      edof: Joi.date().format('YYYY-MM-DD').required(),
      productSerialNo: Joi.string().required(),
      contract: Joi.number().allow(null),
      bundleId: Joi.number().allow(null),
      isBundle: Joi.boolean().allow(null),
      rcAmount: Joi.number().allow(null),
      nrcAmount: Joi.number().allow(null),
    }).required()
  })
})

export const createWebSelfCareOrderValidator = Joi.object({
  paymentId: Joi.string().allow(null),
  customerUuid: Joi.string().required(),
  orderCategory: Joi.string().required(),
  orderSource: Joi.string().required(),
  orderType: Joi.string().required(),
  orderChannel: Joi.string().required(),
  agreementDetail: Joi.object(),
  orderCause: Joi.string().allow(),
  orderPriority: Joi.string().required(),
  billAmount: Joi.number().strict().required(),
  orderDescription: Joi.string().required(),
  requestId: Joi.string().allow(),
  requestStatement: Joi.string().allow(),
  appointmentList: Joi.array(),
  order: Joi.array().items({
    deliveryLocation: Joi.string().allow(null),
    orderFamily: Joi.string().required(),
    orderMode: Joi.string().allow(),
    billAmount: Joi.number().strict().required(),
    orderDeliveryMode: Joi.string().allow(),
    orderDescription: Joi.string().required(),
    serviceType: Joi.string().required(),
    accountUuid: Joi.string().required(),
    serviceUuid: Joi.string().required(),
    contactPreference: Joi.array().items(Joi.string()),
    rcAmount: Joi.number().allow(),
    nrcAmount: Joi.number().allow(),
    advanceCharge: Joi.string().allow(),
    upfrontCharge: Joi.string().allow(),
    isBundle: Joi.boolean().allow(null),
    isSplitOrder: Joi.boolean().allow(null),
    prorated: Joi.string().allow(),
    product: Joi.array().items({
      productId: Joi.number().strict().required(),
      productQuantity: Joi.number().strict().required(),
      productAddedDate: Joi.date().format('YYYY-MM-DD HH:mm:ss').required(),
      billAmount: Joi.number().strict().precision(2).required(),
      edof: Joi.date().format('YYYY-MM-DD').required(),
      productSerialNo: Joi.string().required(),
      contract: Joi.number().allow(null),
      bundleId: Joi.number().allow(null),
      isBundle: Joi.boolean().allow(null),
      rcAmount: Joi.number().allow(null),
      nrcAmount: Joi.number().allow(null),
    }).required()
  })
})


export const assignOrderValidator = Joi.object({
  order: Joi.array().items({
    orderNo: Joi.string().required(),
    type: Joi.string().valid('SELF', 'REASSIGN').required()
  })
})

export const getOrderHistoryValidator = Joi.object({
  orderNo: Joi.string().required(),
  getFollowUp: Joi.boolean().default(false)
})

export const searchOrderValidator = Joi.object({
  searchParams: Joi.object({
    orderNo: Joi.string().allow(),
    orderId: Joi.number().allow(null, ''),
    orderUuid: Joi.string().allow(null, ''),
    intxnId: Joi.string().allow(null, ''),
    customerName: Joi.string().allow(null, ''),
    customerNo: Joi.string().allow(null, ''),
    customerUuid: Joi.string().allow(null, ''),
    customerId: Joi.string().allow(null, '')
  }).required(),
  limit: Joi.number().required(),
  page: Joi.number().required()
})

export const editOrderValidator = Joi.object({
  orderNo: Joi.string().required(),
  userId: Joi.number().allow(null, ''),
  roleId: Joi.number().strict().required(),
  departmentId: Joi.when(
    'status',
    {
      is: 'CLS',
      then: Joi.string().allow(null, ''),
      otherwise: Joi.required()
    }
  ),
  tasks: Joi.array().items({
    orderTaskId: Joi.number(),
    taskNo: Joi.string().required(),
    type: Joi.string().required(),
    value: Joi.string().required(),
    comments: Joi.string().required()
  }),
  status: Joi.string().required(),
  remarks: Joi.string().allow(null, ''),
  payloads: Joi.array().items({
    action: Joi.string().required(),
    productId: Joi.number().strict().required(),
    productQuantity: Joi.number().strict().required(),
    productAddedDate: Joi.date().format('YYYY-MM-DD HH:mm:ss').required(),
    billAmount: Joi.number().strict().precision(2).required(),
    edof: Joi.date().format('YYYY-MM-DD').required(),
    productSerialNo: Joi.string().required()
  })
})

export const addFollowUpValidator = Joi.object({
  orderNo: Joi.string().required(),
  remarks: Joi.string().required(),
  priorityCode: Joi.string().required(),
  source: Joi.string().required()
})

export const getCountsValidator = Joi.object({
  startDate: Joi.date().format('YYYY-MM-DD').allow(null, ''),
  endDate: Joi.date().format('YYYY-MM-DD').allow(null, ''),
  customerUuid: Joi.string().allow(null, ''),
  isClosedOnly: Joi.string().allow(null, ''),
  currentStatus: Joi.when('isClosedOnly', { is: Joi.exist(), then: Joi.any().forbidden(), otherwise: Joi.string().allow(null, '') }),
  currentRole: Joi.number().allow(null, ''),
  currentDepartment: Joi.string().allow(null, ''),
  currentUserId: Joi.number().allow(null, ''),
  createdDepartment: Joi.string().allow(null, ''),
  createdRole: Joi.number().allow(null, ''),
  orderType: Joi.string().allow(null, '')
})

export const cancelOrderValidator = Joi.object({
  orderNo: Joi.string().required(),
  cancelReason: Joi.string().required().messages({ 'any.required': 'Cancellation Reason is Mandatory' })
})

export const getOrderFlowValidator = Joi.object({
  orderNo: Joi.string().required()
})

export const getCustomerOrderHistoryCountValidator = Joi.object({
  customerUid: Joi.string().required()
})

export const getCustomerOrderHistoryValidator = Joi.object({
  customerUid: Joi.string().required(),
  // type: Joi.string().allow(null, '').valid('ROWS', 'COUNT'),
  status: Joi.string().valid('OPEN', 'CLOSED', 'TOTAL'),
  limit: Joi.number().required(),
  page: Joi.number().required()
})
