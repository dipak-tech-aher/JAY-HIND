import { constantCode } from '@utils'

const Joi = require('joi')

export const createRoleValidator = Joi.object({
  roleName: Joi.string().required(),
  roleDesc: Joi.string().required(),
  roleFamilyId: Joi.string().required(),
  isAdmin: Joi.boolean().allow(null),
  mappingPayload: Joi.object({
    permissions: Joi.array().items(
      Joi.object().pattern(Joi.string(), Joi.array().items({
        screenName: Joi.string().required(),
        accessType: Joi.string().required(),
        api: Joi.string().allow("")
        // method: Joi.string().required()
      }))
    )
  }).required(),
  status: Joi.string().required().default(constantCode.status.ACTIVE).valid(constantCode.status.ACTIVE)
})

export const updateRoleValidator = Joi.object({
  roleName: Joi.string().required(),
  roleDesc: Joi.string().required(),
  roleFamilyId: Joi.number().required(),
  isAdmin: Joi.boolean().allow(null),
  roleId: Joi.number().required().strict(),
  mappingPayload: Joi.object({
    permissions: Joi.array().items(
      Joi.object().pattern(Joi.string(), Joi.array().items({
        screenName: Joi.string().required(),
        accessType: Joi.string().required(),
        api: Joi.string().allow(''),
        method: Joi.string().allow('')
      }))
    )
  }).required(),
  status: Joi.string().required()
})

export const getRoleValidator = Joi.object({
  id: Joi.number().required()
})

export const verifyRolesValidator = Joi.object({
  list: Joi.array().items({
    indexId: Joi.number().required(),
    roleName: Joi.string().required(),
    roleDescription: Joi.string().required(),
    isAdmin: Joi.boolean().allow(null),
    parentRole: Joi.string().allow(null, ''),
    status: Joi.string().required(),
    validationRemark: Joi.string().allow(null, ''),
    validationStatus: Joi.string().required()
  })
})

export const bulkUploadRolesValidator = Joi.object({
  list: Joi.array().items({
    indexId: Joi.number().required(),
    roleName: Joi.string().required(),
    roleFamilyCode: Joi.string().required(),
    roleDescription: Joi.string().required(),
    isAdmin: Joi.string().allow(null),
    parentRole: Joi.string(),
    status: Joi.string().required(),
    validationRemark: Joi.string(),
    validationStatus: Joi.string().required()
  }),
  extraList: Joi.array(),
  counts: Joi.object({
    success: Joi.number().required(),
    failed: Joi.number().required(),
    total: Joi.number().required()
  }),
  type: Joi.string()
})
