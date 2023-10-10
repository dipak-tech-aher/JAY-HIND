const Joi = require('joi')

export const getEventsValidator = Joi.object({
  customerUuid: Joi.string().required(),
  for: Joi.string().valid('calendar')
})

export const getKnowledgeBaseValidator = Joi.object({
  conversationUid: Joi.string().allow(null)
  // requestId: Joi.number().required(),
  // customerUuid: Joi.string().allow(null,""),
  // actionCount: Joi.number(),
  // serviceUuid: Joi.string().allow(null),
  // accountUuid: Joi.string().allow(null)
})

export const getServiceCountValidator = Joi.object({
  serviceUuid: Joi.string().allow(null),
  customerUuid: Joi.string().allow(null),
  accountUuid: Joi.string().allow(null),
  conversationUid: Joi.string().allow(null)
})
