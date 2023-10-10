const Joi = require('joi')

export const createUserValidator = Joi.object({
  title: Joi.string().required().min(2).max(3),
  firstName: Joi.string().required().min(3).required(),
  lastName: Joi.string().min(3).required(),
  gender: Joi.string().valid('M', 'F', 'O').required(),
  email: Joi.string().email().required(),
  dob: Joi.date().required().less('now'),
  userType: Joi.string().required(),
  notificationType: Joi.string().required(),
  country: Joi.string().required(),
  loc: Joi.string().required(),
  extn: Joi.number().required(),
  contactNo: Joi.number().min(7).required(),
  whatsappAccess: Joi.boolean(),
  biAccess: Joi.boolean(),
  status: Joi.string().required(),
  activationDate: Joi.date().required(),
  mappingPayload: Joi.object().keys({
    userDeptRoleMapping: Joi.array().items({
      roleId: Joi.array().items().required(),
      unitId: Joi.string().required()
    }).required()
  }).required()
})

export const approveNewUserValidator = Joi.object({
  userId: Joi.number().required(),
  contactNo: Joi.number().required(),
  email: Joi.string().email().required(),
  userType: Joi.string().required(),
  photo: Joi.string().allow(''),
  title: Joi.string().valid().required(),
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(3).required(),
  gender: Joi.string().valid('M', 'F', 'O').required(),
  dob: Joi.date().less('now').required(),
  officeNo: Joi.number().min(3).allow(''),
  extn: Joi.number().min(1),
  notificationType: Joi.string().allow(''),
  biAccess: Joi.boolean().valid(true, false).default(false),
  waAccess: Joi.boolean().valid(true, false).default(false),
  status: Joi.string().required(),
  loc: Joi.string().allow(''),
  country: Joi.string().required(),
  profilePicture: Joi.string().base64(),
  adminRemark: Joi.string().allow(''),
  activationDate: Joi.date().greater('now').timestamp(),
  expiryDate: Joi.date().greater('now'),
  mappingPayload: Joi.object().keys({
    userDeptRoleMapping: Joi.array().items({
      roleId: Joi.array().items().required(),
      unitId: Joi.string().required()
    }).required()
  }).required()
})

export const getUserDepartmentAndRolesValidator = Joi.object({
  userId: Joi.number().required()
})

export const getUserListValidator = Joi.object({
  limit: Joi.number().default(10),
  page: Joi.number().default(10),
  source: Joi.string().allow(null, ''),
  filters: Joi.array().items({
    value: Joi.string().required(),
    id: Joi.string().required()
  })
})

export const getUserValidator = Joi.object({
  userId: Joi.string().required()
})

export const updateUserValidator = Joi.object({
  userId: Joi.number().required().positive(),
  id: Joi.number().required().positive(),
  title: Joi.string().required().min(2).max(3).required(),
  firstName: Joi.string().required().min(3).required(),
  lastName: Joi.string().min(3).required(),
  gender: Joi.string().valid('M', 'F', 'O').required(),
  email: Joi.string().email().required(),
  dob: Joi.date().required().less('now').required(),
  userType: Joi.string().required(),
  notificationType: Joi.string().required(),
  country: Joi.string().required(),
  loc: Joi.string().required(),
  extn: Joi.number().required(),
  officeNo: Joi.number().min(3).allow('', null),
  contactNo: Joi.number().min(7).required(),
  waAccess: Joi.boolean().required(),
  biAccess: Joi.boolean().required(),
  profilePicture: Joi.string().allow(null),
  status: Joi.string().required(),
  activationDate: Joi.date().required(),
  expiryDate: Joi.date().greater('now').allow('', null),
  mappingPayload: Joi.object().keys({
    userDeptRoleMapping: Joi.array().items({
      roleId: Joi.array().items(Joi.number()).required(),
      unitId: Joi.string().required()
    }).required()
  }).required()
})

export const verifyEmailsValidator = Joi.object({
  list: Joi.array().items({
    indexId: Joi.number().positive(),
    email: Joi.string().email().required(),
    roleDescription: Joi.string().email().required(),
    departmentDescription: Joi.string().email().required(),
    validationRemark: Joi.string().email().required(),
    validationStatus: Joi.string().email().required()
  })
})

export const verifyUsersValidator = Joi.object({
  list: Joi.array().items({
    indexId: Joi.number(),
    title: Joi.string().valid('Ms', 'Mr', 'Mrs'),
    firstName: Joi.string(),
    lastName: Joi.string(),
    gender: Joi.string().valid('Male', 'Female'),
    status: Joi.string(),
    email: Joi.string().email().required(),
    dob: Joi.date(),
    loc: Joi.string(),
    country: Joi.string(),
    userType: Joi.string(),
    notificationType: Joi.string(),
    contactNo: Joi.number(),
    activationDate: Joi.date(),
    expiryDate: Joi.date(),
    biAccess: Joi.boolean(),
    whatsappAccess: Joi.boolean(),
    validationRemark: Joi.string(),
    validationStatus: Joi.string()
  }).required()
})
