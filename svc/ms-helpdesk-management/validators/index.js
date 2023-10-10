import { constantCode } from '@utils'
const Joi = require('joi').extend(require('@joi/date'))

export const createHelpDeskTicketValidator = Joi.object({
  helpdeskSource: Joi.string().required(),
  mailId: Joi.when('helpdeskSource', { is: constantCode.source.EMAIL, then: Joi.string().email().required(), otherwise: Joi.allow('') }),
  content: Joi.string().required(),
  helpdeskSubject: Joi.string().required(),
  status: Joi.string().required(),
  helpdeskType: Joi.string().allow(),
  severity: Joi.string().allow(),
  referenceId: Joi.string().allow('', null),
  phoneNo: Joi.when('helpdeskSource', { is: constantCode.source.IVR, then: Joi.number().required(), otherwise: Joi.allow('') }),
  ivrNo: Joi.when('source', { is: constantCode.source.IVR, then: Joi.number().required(), otherwise: Joi.allow(null) })
})

export const updateHelpdeskTicketValidator = Joi.object({
  helpdeskId: Joi.number().required(),
  contactId: Joi.number().allow(null),
  cancelReason: Joi.string().allow(null),
  project: Joi.string().allow(null),
  status: Joi.string().required(),
  helpdeskType: Joi.string().allow(),
  severity: Joi.string().allow(),
})

export const getHelpdeskListValidator = Joi.object({
  from: Joi.string().allow(null),
  tktWithLoggedIn: Joi.boolean().allow(null),
  helpdeskId: Joi.number().allow(null),
  userCategoryValue: Joi.string().allow(null),
  helpdeskNo: Joi.string().allow(null),
  helpdeskSource: Joi.string().allow(null),
  assigned: Joi.boolean().allow(null),
  mailId: Joi.string().email().allow(null),
  phoneNo: Joi.number().allow(null),
  profileId: Joi.string().allow(null),
  profileName: Joi.string().allow(null),
  project: Joi.array().items(Joi.string().required()),
  limit: Joi.number().default(constantCode.common.lIMIT),
  page: Joi.number().default(constantCode.common.PAGE),
  excel: Joi.boolean(),
  sort: Joi.string().allow(null),
  startDate: Joi.date().format('YYYY-MM-DD').allow(null),
  endDate: Joi.date().format('YYYY-MM-DD').allow(null),
  contain: Joi.array().items(Joi.string()).allow(null)
})

export const assignTicketValidator = Joi.object({
  helpdeskId: Joi.number().required(),
  status: Joi.string().required()
})

export const replyHelpdeskTicketValidator = Joi.object({
  helpdeskId: Joi.number().required(),
  pending: Joi.string().allow(),
  complitionDate: Joi.string().allow(),
  contactId: Joi.number().allow(null),
  content: Joi.string().required(),
  status: Joi.string().required(),
  helpdeskType: Joi.string().allow(),
  severity: Joi.string().allow(),
  project: Joi.string().allow(),
  entityType: Joi.string().required(),
  cancelReason: Joi.string().allow(null),
  attachments: Joi.array().items(Joi.string())
})

export const countBySourceValidator = Joi.object({
  assign: Joi.string().valid(constantCode.status.ASSIGNED, constantCode.status.NEW, constantCode.common.AVAILABLE).allow(null),
  helpdeskSource: Joi.string().allow(null),
  project: Joi.array().items(Joi.string().required()).required()
})

export const helpdeskJobValidator = Joi.object({
  state: Joi.string().required().valid('start', 'stop')
})

export const getprofileContactValidator = Joi.object({
  searchParam: Joi.string().required()
})

export const mapHelpdeskCustomerValidator = Joi.object({
  helpdeskNo: Joi.string().required(),
  profileNo: Joi.string().required(),
  contactId: Joi.number().required(),
  profileType: Joi.string().required()
})
