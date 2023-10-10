import { constantCode } from '@utils'
const Joi = require('joi')

export const getNotificationValidator = Joi.object({
  limit: Joi.number().required(),
  page: Joi.number().required(),
  type: Joi.string().allow(null),
  roleId: Joi.number().allow(null),
  departmentId: Joi.string().allow(null),
  category: Joi.string().required().valid('SELF', 'POOL'),
  isRead: Joi.boolean().required().default(false),
  entity: Joi.string().allow(null),
  userId: Joi.number().when('category', { is: 'SELF', then: Joi.required(), otherwise: Joi.allow(null) }),
  sortBy: Joi.string().required().valid(constantCode.common.DATEDESC, constantCode.common.DATEASC)
})

export const getNotificationCountValidator = Joi.object({
  type: Joi.string().allow(null),
  roleId: Joi.number().allow(null),
  departmentId: Joi.string().allow(null),
  category: Joi.string().required().valid('SELF', 'POOL'),
  userId: Joi.number().when('category', { is: 'SELF', then: Joi.required(), otherwise: Joi.allow(null) }),
  isRead: Joi.boolean().required()
})

export const updateNotificationSeenValidator = Joi.object({
  userId: Joi.number().required(),
  notificationId: Joi.number().allow(null),
  departmentId: Joi.string().allow(null),
  roleId: Joi.number().allow(null),
  notificationStatus: Joi.string().required().valid('read', 'unread'),
  category: Joi.string().allow(null).valid('SELF', 'POOL')
})

export const updateNotificationPinnedValidator = Joi.object({
  notificationId: Joi.number().required(),
  userId: Joi.number().required(),
  notificationPinned: Joi.string().required().valid('pin', 'unPin')
})
