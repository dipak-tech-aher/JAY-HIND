const Joi = require('joi').extend(require('@joi/date'))

export const searchKnowledgeBaseValidator = Joi.object({
  q: Joi.string().allow(),
  c: Joi.string().allow(),
  st: Joi.string().allow(null, ''),
  s: Joi.string().allow()
})

export const getKnowledgeBaseValidator = Joi.object({
  requestId: Joi.number().required(),
  customerId: Joi.string().allow(null, ''),
  customerUuid: Joi.string().allow(null, ''),
  actionCount: Joi.number(),
  serviceUuid: Joi.string().allow(null),
  accountUuid: Joi.string().allow(null),
  moduleName: Joi.string().allow(null, ''),
})

export const searchKnowledgeBaseByHelpdeskValidator = Joi.object({
  s: Joi.string().required(),
  st: Joi.string().allow()
})

export const AddRequestStatementValidator = Joi.object({
  intxnCategory: Joi.string().required(),
  intxnType: Joi.string().required(),
  serviceCategory: Joi.string().required(),
  serviceType: Joi.string().required(),
  requestStatement: Joi.string().required(),
  priorityCode: Joi.string().required()
})
