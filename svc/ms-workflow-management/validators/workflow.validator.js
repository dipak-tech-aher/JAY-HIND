import { constantCode } from '../utils/constant'
const Joi = require('joi')

export const createUserValidator = Joi.object({
  interactionType: Joi.string().allow(null),
  productType: Joi.string().allow(null),
  workflowName: Joi.string().min(3).required(),
  status: Joi.string().required(constantCode.status.ACTIVE, constantCode.status.IN_ACTIVE, constantCode.status.TEMPORARY),
  wfDefinition: Joi.object().required()
})

export const updateWorkflowValidator = Joi.object({
  workflowId: Joi.number().required(),
  interactionType: Joi.string().allow(null),
  productType: Joi.string().allow(null),
  workflowName: Joi.string().required().min(3),
  status: Joi.string().required().valid(constantCode.status.ACTIVE, constantCode.status.IN_ACTIVE, constantCode.status.TEMPORARY),
  wfDefinition: Joi.object().required()
})

export const getWorkflowValidator = Joi.object({
  workflowId: Joi.number().required()
})

export const getWorkflowListValidator = Joi.object({
  limit: Joi.number().default(constantCode.common.lIMIT),
  page: Joi.number().default(constantCode.common.PAGE)
})

export const deleteWorkflowValidator = Joi.object({
  workflowId: Joi.number().required()
})

export const getWorkflowStatusValidator = Joi.object({
  id: Joi.number().required()
})

export const assignWorkflowToEntityValidator = Joi.object({
  entityId: Joi.number().required(),
  entity: Joi.string().required(),
  defnId: Joi.number().required()
})

export const getWorkflowStateValidator = Joi.object({
  entityId: Joi.string().required(),
  entity: Joi.string().required()
})

export const updateWorkflowStateValidator = Joi.object({
  deptId: Joi.string().required(),
  userId: Joi.number().required(),
  roleId: Joi.number().required(),
  status: Joi.string().required()
})

export const assignToSelfValidator = Joi.object({
  entityId: Joi.number().required(),
  entity: Joi.string().required(),
  status: Joi.string().required()
})

export const createWorkflowMappingValidator = Joi.object({
  workflowId: Joi.number().strict().required(),
  templateMapName: Joi.string().min(3).required(),
  module: Joi.string().min(3).required().valid(
    'ORDER',
    'HELPDESK',
    'INTXN',
    'ORDERS',
    'KnowledgeBaseMobileApp',
    'KnowledgeBase',
    'WHATSAPP',
    'KnowledgeBaseSelfCare'
  ),
  serviceType: Joi.string().min(3).required(),
  status: Joi.string().required(),
  interactionType: Joi.when('module', { is: 'INTXN', then: Joi.string().min(3).required(), otherwise: Joi.allow('') }),
  serviceCategory: Joi.when('module', { is: 'INTXN', then: Joi.string().min(3).required(), otherwise: Joi.allow('') }),
  interactionCategory: Joi.when('module', { is: 'INTXN', then: Joi.string().required(), otherwise: Joi.allow('') })
})

export const updatedMappedWorkflowValidator = Joi.object({
  workflowId: Joi.number().required(),
  mappingId: Joi.number().required()
})

export const deleteMappedWorkflowValidator = Joi.array().items(Joi.number().required())

export const unMappedWorkflowListValidator = Joi.object({
  editMapped: Joi.boolean().required(),
  module: Joi.when('editMapped', { is: false, then: Joi.string().min(3).valid('INTXN', 'HELPDESK', 'ORDER').required() }),
  serviceType: Joi.when('editMapped', { is: false, then: Joi.string().min(3).required() }),
  interactionType: Joi.when('module', { is: 'INTXN', then: Joi.string().min(3).required(), otherwise: Joi.allow('') }),
  serviceCategory: Joi.when('module', { is: 'INTXN', then: Joi.string().min(3).required(), otherwise: Joi.allow('') }),
  interactionCategory: Joi.when('module', { is: 'INTXN', then: Joi.string().required(), otherwise: Joi.allow('') })
})

export const paginationValidator = Joi.object({
  limit: Joi.number().default(constantCode.common.lIMIT),
  page: Joi.number().default(constantCode.common.PAGE)
})

export const listMappedWorkflowValidator = Joi.object({
  mappingName: Joi.string(),
  limit: Joi.number().default(constantCode.common.lIMIT),
  page: Joi.number().default(constantCode.common.PAGE)
})

export const updateResolutionValidator = Joi.object({
  conversationUid: Joi.string().required()
})
