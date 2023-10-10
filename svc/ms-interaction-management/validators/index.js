import { defaultCode } from '@utils'
const Joi = require('joi').extend(require('@joi/date'))

export const createInteractionValidator = Joi.object({
  currentDeptId: Joi.string().allow(null, ''),
  currentRoleId: Joi.number().allow(null, ''),
  customerId: Joi.number().allow(null, ''),
  customerUuid: Joi.string().allow(null, ''),
  project: Joi.string().allow(null, ''),
  isResolvedBy: Joi.string().allow(null, ''),
  appointDtlId: Joi.number().allow(null),
  rosterId: Joi.number().allow(null),
  appointUserId: Joi.number().allow(null),
  appointAddress: Joi.object().allow(),
  profileId: Joi.when('customerId', { is: Joi.exist(), then: Joi.allow(null, ''), otherwise: Joi.number().strict().required() }),
  accountId: Joi.number().allow(null, ''),
  serviceId: Joi.number().allow(null, ''),
  helpdeskId: Joi.number().allow(null, ''),
  chatId: Joi.number().allow(null, ''),
  statement: Joi.string().allow(null, ''),
  statementId: Joi.number().allow(null, ''),
  statementSolution: Joi.string().allow(null, ''),
  interactionType: Joi.string().required(),
  ticketType: Joi.string().allow(null, ''),
  serviceType: Joi.string().required(),
  channel: Joi.string().required(),
  problemCause: Joi.string().allow(null, ''),
  priorityCode: Joi.string().required(),
  contactPreference: Joi.array().items(Joi.string()),
  remarks: Joi.string().allow(),
  interactionCategory: Joi.string().required(),
  serviceCategory: Joi.string().required(),
  rcResolution: Joi.string().allow(null, ''),
  attachments: Joi.array().items(Joi.string().allow(null, '')).allow(null),
  referenceId: Joi.string().allow(null, ''),
  formDetails: Joi.object().allow(null, ''),
  isManagerialAssign: Joi.string().allow(null, ''),
  slotIds: Joi.array().items(Joi.number()).allow(null),
  edoc: Joi.string().allow(null, ''),
  customerContactNo: Joi.string().allow(null, ''),
  customerNo: Joi.string().allow(null, '')
})

export const addFollowUpValidator = Joi.object({
  interactionNumber: Joi.string().required(),
  remarks: Joi.string().required(),
  priorityCode: Joi.string().required(),
  source: Joi.string().required(),
  attachment: Joi.array().items(Joi.string()).allow('')
})

export const assignInteractionValidator = Joi.object({
  interactionNumber: Joi.string().required(),
  type: Joi.string().valid('SELF', 'REASSIGN', 'REASSIGN_TO_SELF').required(),
  userId: Joi.string().allow(null, '')
})

export const recentInteractionValidator = Joi.object({
  customerId: Joi.string().required()
})

export const updateInteractionValidator = Joi.object({
  interactionNumber: Joi.string().required(),
  userId: Joi.number().allow(null, ''),
  roleId: Joi.number().strict().required(),
  departmentId: Joi.string().required(),
  status: Joi.string().required(),
  remarks: Joi.string().allow(null, ''),
  deployementDate: Joi.date().format('YYYY-MM-DD').allow(null, ''),
  techCompletionDate: Joi.date().format('YYYY-MM-DD').allow(null, ''),
  channel: Joi.string().allow(null, '')
})

export const searchInteractionValidator = Joi.object({
  limit: Joi.number().required(),
  page: Joi.number().required(),
  searchParams: Joi.object({
    interactionId: Joi.number().strict().allow(null, ''),
    interactionNumber: Joi.string().allow(null, ''),
    interactionType: Joi.string().allow(null, ''),
    customerNo: Joi.string().strict().allow(null, ''),
    customerId: Joi.number().strict().allow(null, ''),
    profileId: Joi.number().strict().allow(null, ''),
    contactNumber: Joi.number().strict().allow(null, ''),
    currentUserId: Joi.number().strict().allow(null, ''),
    emailId: Joi.string().email().allow(null, ''),
    status: Joi.string().allow(null, ''),
    customerName: Joi.string().allow(null, ''),
    startDate: Joi.date().format('YYYY-MM-DD').allow(null, ''),
    endDate: Joi.date().format('YYYY-MM-DD').allow(null, ''),
    currentRoleId: Joi.number().strict().allow(null, ''),
    currentDeptId: Joi.string().strict().allow(null, ''),
    selfDept: Joi.string().allow(null, ''),
    filters: Joi.array().items({
      filter: Joi.string().required(),
      id: Joi.string().required(),
      value: Joi.string().required()
    }).allow(null, ''),
    customerUuid: Joi.string().allow(null, ''),
    profileUuid: Joi.string().allow(null, '')
  })
})

export const getHistoryValidator = Joi.object({
  interactionNumber: Joi.string().required(),
  getFollowUp: Joi.boolean().default(false)
})

export const cancelInteractionValidator = Joi.object({
  interactionNumber: Joi.string().required(),
  cancelReason: Joi.string().required().messages({ 'any.required': 'Cancellation Reason is Mandatory' })
})

export const getCountsValidator = Joi.object({
  customerId: Joi.string().allow(null, ''),
  customerUuid: Joi.string().allow(null, ''),
  profileId: Joi.number().allow(null, ''),
  me: Joi.boolean().required(),
  currentStatus: Joi.string().allow(null, ''),
  currentRole: Joi.number().allow(null, ''),
  currentDepartment: Joi.string().allow(null, ''),
  currentUserId: Joi.when('me', { is: true, then: null, otherwise: Joi.number().allow(null, '') }),
  createdDepartment: Joi.string().allow(null, ''),
  createdRole: Joi.number().allow(null, ''),
  interactionType: Joi.string().allow(null, '')
})

export const frequentKnowledgeBaseValidator = Joi.object({
  customerUuid: Joi.string().allow(null, ''),
  profileUuid: Joi.string().allow(null, ''),
  st: Joi.string().allow(null, ''),
  serviceCategory: Joi.string().allow(null, ''),
  today: Joi.date().format('YYYY-MM-DD').allow(null, ''),
  limit: Joi.number().allow(null, '')
})

export const getCustomerInteractionHistoryCountValidator = Joi.object({
  customerUid: Joi.string().required()
})

export const getCustomerInteractionHistoryValidator = Joi.object({
  customerUid: Joi.string().required(),
  // type: Joi.string().allow(null, '').valid('ROWS', 'COUNT'),
  status: Joi.string().valid('OPEN', 'CLOSED', 'TOTAL'),
  limit: Joi.number().required(),
  page: Joi.number().required()
})

export const getInteractionFlowValidator = Joi.object({
  intxnNo: Joi.string().required()
})

export const getCustomerInteractionValidation = Joi.object({
  customerUuid: Joi.string().required()
})

export const getInteractionAppointmentValidator = Joi.object({
  interactionNumber: Joi.string().required()
})

export const getInteractionInsightValidator = Joi.object({
  type: Joi.string().required(),
  requestId: Joi.number().required(),
  intxnNo: Joi.string().allow(null),
  customerUuid: Joi.string().allow(null),
  limit: Joi.when('type', { is: defaultCode.INSIGHTS, then: Joi.number().required(), otherwise: Joi.number().allow() }),
  page: Joi.when('type', { is: defaultCode.INSIGHTS, then: Joi.number().required(), otherwise: Joi.number().allow() }),
  channel: Joi.string().allow(null, ''),
  customer: Joi.when('type', { is: defaultCode.INSIGHTS, then: Joi.boolean().required(), otherwise: Joi.boolean().allow() }),
  solutioned: Joi.boolean().allow(null, '')
})
