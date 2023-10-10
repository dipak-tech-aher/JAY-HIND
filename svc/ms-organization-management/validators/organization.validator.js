import { constantCode } from '@utils'
const Joi = require('joi')

export const createOrganizationValidator = Joi.object({
  unitId: Joi.string().required(),
  unitDesc: Joi.string().required(),
  unitType: Joi.string().valid(constantCode?.unitType?.DEPARTMENT, constantCode?.unitType?.ORGANISATION, constantCode?.unitType?.OPERTIONALUNIT).required(),
  unitName: Joi.string().required(),
  parentUnit: Joi.when('unitType', { is: constantCode?.unitType?.ORGANISATION, then: Joi.allow('', null), otherwise: Joi.string().required() }),
  mappingPayload: Joi.object({
    unitroleMapping: Joi.array().items(Joi.number())
  })
  // contact: Joi.object({
  //   title: Joi.string().required(),
  //   firstName: Joi.string().required(),
  //   lastName: Joi.string().required(),
  //   contactType: Joi.string().required(),
  //   contactNo: Joi.number().required()
  // }),
  // address: Joi.object({
  //   flatHouseUnitNo: Joi.string().required(),
  //   building: Joi.string().required(),
  //   street: Joi.string().required(),
  //   cityTown: Joi.string().required(),
  //   state: Joi.string().required(),
  //   district: Joi.string().required(),
  //   country: Joi.string().required(),
  //   postcode: Joi.string().required()
  // })
})

export const updateOrganizationValidator = Joi.object({
  unitId: Joi.string().required(),
  unitDesc: Joi.string().required(),
  unitType: Joi.string().required(),
  unitName: Joi.string().required(),
  status: Joi.string().allow('', null),
  parentUnit: Joi.when('unitType', { is: constantCode?.unitType?.ORGANISATION, then: Joi.allow(''), otherwise: Joi.string().required() }),
  mappingPayload: Joi.object({
    unitroleMapping: Joi.array().items(Joi.number())
  })
})
