import { defaultCode } from '@utils'
const Joi = require('joi')

export const createChargeValidator = Joi.object({
  chargeName: Joi.string().required(),
  chargeCat: Joi.string().required(),
  serviceType: Joi.string().required(),
  currency: Joi.string().required(),
  status: Joi.string().required(),
  startDate: Joi.date().greater('now'),
  endDate: Joi.when('chargeCat', { is: 'CC_NRC', then: Joi.allow(null, ''), otherwise: Joi.required() }),
  glcode: Joi.string().required()
})

export const getChargeByIdValidator = Joi.object({
  id: Joi.number().positive().greater(0).required()
})

export const getChargeByListValidator = Joi.object({
  limit: Joi.number().greater(0).positive().default(defaultCode.YES),
  page: Joi.number().default(defaultCode.PAGE),
  excel: Joi.boolean().default(false).valid(true, false).required(),
  name: Joi.string().allow(null, ''),
  filter: Joi.array().items({
    value: Joi.string().required(),
    id: Joi.string().required()
  }).allow(null)
})

export const updateChargeValidator = Joi.object({
  chargeId: Joi.number().positive().greater(0).required(),
  chargeName: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.when('chargeCat', { is: 'CC_NRC', then: Joi.allow(null, ''), otherwise: Joi.required() }),
  glcode: Joi.string().required(),
  chargeCat: Joi.string().required(),
  currency: Joi.string().required(),
  serviceType: Joi.string().required(),
  status: Joi.string().required()
})
