const Joi = require('joi').extend(require('@joi/date'))

export const getInvoicesValidator = Joi.object({
  invoiceStartDate: Joi.date().format('YYYY-MM-DD').allow(null),
  invoiceEndDate: Joi.date().format('YYYY-MM-DD').allow(null),
  invoiceNo: Joi.string().allow(null),
  invoiceId: Joi.string().allow(null),
  billRefNo: Joi.string().allow(null),
  customerUuid: Joi.string().allow(null),
  customerId: Joi.number().allow(null),
  billYear: Joi.string().allow(null),
  billCycle: Joi.string().allow(null)
  // limit: Joi.number().required(),
  // page: Joi.number().required()
})
