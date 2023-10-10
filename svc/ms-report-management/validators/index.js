const Joi = require('joi').extend(require('@joi/date'))

export const getOpenInteractionsValidator = Joi.object({
  interactionId: Joi.string().allow(null),
  interactionType: Joi.string().allow(null),
  interactionStatus: Joi.string().allow(null),
  customerCategory: Joi.string().allow(null),
  customerNo: Joi.string().allow(null),
  customerName: Joi.string().allow(null),
  dateFrom: Joi.date().format('YYYY-MM-DD').required(),
  dateTo: Joi.date().format('YYYY-MM-DD').required(),
  excel: Joi.boolean().required(),
  limit: Joi.when('excel', { is: false, then: Joi.string().required(), otherwise: Joi.allow(null, '') }),
  page: Joi.when('excel', { is: false, then: Joi.string().required(), otherwise: Joi.allow(null, '') })
})

export const getClosedInteractionsValidator = Joi.object({
  interactionId: Joi.string().allow(null),
  interactionType: Joi.string().allow(null),
  interactionStatus: Joi.string().allow(null),
  customerCategory: Joi.string().allow(null),
  customerNo: Joi.string().allow(null),
  customerName: Joi.string().allow(null),
  dateFrom: Joi.date().format('YYYY-MM-DD').required(),
  dateTo: Joi.date().format('YYYY-MM-DD').required(),
  excel: Joi.boolean().required(),
  limit: Joi.when('excel', { is: false, then: Joi.string().required(), otherwise: Joi.allow(null, '') }),
  page: Joi.when('excel', { is: false, then: Joi.string().required(), otherwise: Joi.allow(null, '') })
})

export const getCreatedInteractionsValidator = Joi.object({
  interactionId: Joi.string().allow(null),
  interactionType: Joi.string().allow(null),
  interactionStatus: Joi.string().allow(null),
  customerCategory: Joi.string().allow(null),
  customerNo: Joi.string().allow(null),
  customerName: Joi.string().allow(null),
  dateFrom: Joi.date().format('YYYY-MM-DD').required(),
  dateTo: Joi.date().format('YYYY-MM-DD').required(),
  excel: Joi.boolean().required(),
  limit: Joi.when('excel', { is: false, then: Joi.string().required(), otherwise: Joi.allow(null, '') }),
  page: Joi.when('excel', { is: false, then: Joi.string().required(), otherwise: Joi.allow(null, '') })
})

export const getOpenOrdersValidator = Joi.object({
  orderNo: Joi.string().allow(null),
  orderStatus: Joi.string().allow(null),
  currEntity: Joi.string().allow(null),
  currRole: Joi.string().allow(null),
  currUser: Joi.string().allow(null),
  orderFamily: Joi.string().allow(null),
  orderCategory: Joi.string().allow(null),
  orderType: Joi.string().allow(null),
  serviceType: Joi.string().allow(null),
  orderPriority: Joi.string().allow(null),
  orderSource: Joi.string().allow(null),
  orderChannel: Joi.string().allow(null),
  dateFrom: Joi.date().format('YYYY-MM-DD').required(),
  dateTo: Joi.date().format('YYYY-MM-DD').required(),
  excel: Joi.boolean().required(),
  limit: Joi.when('excel', { is: false, then: Joi.string().required(), otherwise: Joi.allow(null, '') }),
  page: Joi.when('excel', { is: false, then: Joi.string().required(), otherwise: Joi.allow(null, '') })
})

export const getClosedOrdersValidator = Joi.object({
  orderNo: Joi.string().allow(null),
  orderStatus: Joi.string().allow(null),
  currEntity: Joi.string().allow(null),
  currRole: Joi.string().allow(null),
  currUser: Joi.string().allow(null),
  orderFamily: Joi.string().allow(null),
  orderCategory: Joi.string().allow(null),
  orderType: Joi.string().allow(null),
  serviceType: Joi.string().allow(null),
  orderPriority: Joi.string().allow(null),
  orderSource: Joi.string().allow(null),
  orderChannel: Joi.string().allow(null),
  dateFrom: Joi.date().format('YYYY-MM-DD').required(),
  dateTo: Joi.date().format('YYYY-MM-DD').required(),
  excel: Joi.boolean().required(),
  limit: Joi.when('excel', { is: false, then: Joi.string().required(), otherwise: Joi.allow(null, '') }),
  page: Joi.when('excel', { is: false, then: Joi.string().required(), otherwise: Joi.allow(null, '') })
})

export const getCreatedOrdersValidator = Joi.object({
  orderNo: Joi.string().allow(null),
  orderStatus: Joi.string().allow(null),
  currEntity: Joi.string().allow(null),
  currRole: Joi.string().allow(null),
  currUser: Joi.string().allow(null),
  orderFamily: Joi.string().allow(null),
  orderCategory: Joi.string().allow(null),
  orderType: Joi.string().allow(null),
  serviceType: Joi.string().allow(null),
  orderPriority: Joi.string().allow(null),
  orderSource: Joi.string().allow(null),
  orderChannel: Joi.string().allow(null),
  dateFrom: Joi.date().format('YYYY-MM-DD').required(),
  dateTo: Joi.date().format('YYYY-MM-DD').required(),
  excel: Joi.boolean().required(),
  limit: Joi.when('excel', { is: false, then: Joi.string().required(), otherwise: Joi.allow(null, '') }),
  page: Joi.when('excel', { is: false, then: Joi.string().required(), otherwise: Joi.allow(null, '') })
})

export const getCreatedCustomerValidator = Joi.object({
  customerNo: Joi.string().allow(null),
  idType: Joi.string().allow(null),
  customerCategory: Joi.string().allow(null),
  customerStatus: Joi.string().allow(null),
  dateFrom: Joi.date().format('YYYY-MM-DD').required(),
  dateTo: Joi.date().format('YYYY-MM-DD').required(),
  excel: Joi.boolean().required(),
  limit: Joi.when('excel', { is: false, then: Joi.string().required(), otherwise: Joi.allow(null, '') }),
  page: Joi.when('excel', { is: false, then: Joi.string().required(), otherwise: Joi.allow(null, '') })
})
