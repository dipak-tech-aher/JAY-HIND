const Joi = require('joi').extend(require('@joi/date'))

export const getUnbilledContractsValidator = Joi.object({
  customerUuid: Joi.string().allow(null),
  serviceUuid: Joi.string().allow(null),
  limit: Joi.number().required(),
  page: Joi.number().required(),
  soNumber: Joi.string().allow(null),
  contractId: Joi.string().allow(null),
  monthlyContractId: Joi.string().allow(null),
  customerNumber: Joi.string().allow(null),
  customerName: Joi.string().allow(null),
  startDate: Joi.date().format('YYYY-MM-DD').allow(null),
  endDate: Joi.date().format('YYYY-MM-DD').allow(null),
  billRefNo: Joi.string().allow(null),
  soId: Joi.string().allow(null)
})

export const getbilledContractsValidator = Joi.object({
  customerUuid: Joi.string().allow(null),
  serviceUuid: Joi.string().allow(null),
  limit: Joi.number().required(),
  page: Joi.number().required(),
  soNumber: Joi.string().allow(null),
  contractId: Joi.string().allow(null),
  monthlyContractId: Joi.string().allow(null),
  customerNumber: Joi.string().allow(null),
  customerName: Joi.string().allow(null),
  startDate: Joi.date().format('YYYY-MM-DD').allow(null),
  endDate: Joi.date().format('YYYY-MM-DD').allow(null),
  billRefNo: Joi.string().allow(null),
  soId: Joi.string().allow(null),
  billPeriod: Joi.string().allow(null),
  billYear: Joi.string().allow(null),
  billCycle: Joi.string().allow(null),
  billMonth: Joi.string().allow(null)
})