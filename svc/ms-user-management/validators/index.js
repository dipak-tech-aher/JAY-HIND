const Joi = require('joi')

export const createUserValidator = Joi.object({
  title: Joi.string().allow(null),
  firstName: Joi.string().required().min(3).required(),
  lastName: Joi.string().min(1).required(),
  gender: Joi.string().valid('M', 'F', 'O').required(),
  email: Joi.string().email().required(),
  dob: Joi.date().required().less('now'),
  userType: Joi.string().required(),
  notificationType: Joi.array().items().allow(null),
  country: Joi.string().required(),
  loc: Joi.string().allow(null, ''),
  extn: Joi.string().required(),
  contactNo: Joi.number().min(7).required(),
  waAccess: Joi.string().default(false).allow(null),
  biAccess: Joi.string().default(false).allow(null),
  status: Joi.string().required(),
  activationDate: Joi.date().required(),
  expiryDate: Joi.date().allow(null),
  photo: Joi.string().allow(null),
  mappingPayload: Joi.object().keys({
    userDeptRoleMapping: Joi.array().items({
      roleId: Joi.array().items().required(),
      unitId: Joi.string().required()
    }).required()
  }).required(),
  userCategory: Joi.string().allow(null, ''),
  userGroup: Joi.string().required().allow(null, ''),
  userSource: Joi.string().allow(null, ''),
  userFamily: Joi.array().required().items(),
  userSkills: Joi.array().items(),
  userVerificationStatus: Joi.string().allow(null, ''),
  managerId: Joi.number().allow(null),
  biAccessKey: Joi.string().allow(null, '')
})

export const approveNewUserValidator = Joi.object({
  userId: Joi.number().required(),
  contactNo: Joi.number().required(),
  email: Joi.string().email().required(),
  userType: Joi.string().required(),
  photo: Joi.string().allow('', null),
  title: Joi.string().valid().allow(null),
  firstName: Joi.string().min(3).required(),
  lastName: Joi.string().min(1).required(),
  loginid: Joi.string().required(),
  gender: Joi.string().valid('M', 'F', 'O').required(),
  dob: Joi.date().less('now').required(),
  officeNo: Joi.number().min(3).allow('', null),
  extn: Joi.string().min(1),
  notificationType: Joi.array().items().allow(null),
  biAccess: Joi.string().allow(null),
  waAccess: Joi.string().allow(null),
  status: Joi.string().required(),
  loc: Joi.string().allow(null, ''),
  country: Joi.string().required(),
  profilePicture: Joi.string().base64().allow(null),
  adminRemark: Joi.string().allow(''),
  activationDate: Joi.date().required(),
  expiryDate: Joi.date().allow(null),
  mappingPayload: Joi.object().keys({
    userDeptRoleMapping: Joi.array().items({
      roleId: Joi.array().items().required(),
      unitId: Joi.string().required()
    }).required()
  }).required(),
  userCategory: Joi.string().allow(null, ''),
  userGroup: Joi.string().allow(null, ''),
  userSource: Joi.string().allow(null, ''),
  userFamily: Joi.array().items(),
  userSkills: Joi.array().items(),
  userVerificationStatus: Joi.string().allow(null, ''),
  managerId: Joi.number().allow(null),
  biAccessKey: Joi.string().allow(null, '')
})

export const getUserDepartmentAndRolesValidator = Joi.object({
  userId: Joi.number().required()
})

export const getUserListValidator = Joi.object({
  limit: Joi.number().default(10),
  page: Joi.number().default(10),
  newUserRequest: Joi.bool(),
  source: Joi.string().allow(null, ''),
  filters: Joi.array().items({
    value: Joi.string().required(),
    id: Joi.string().required(),
    filter: Joi.string().required()
  })
})

export const getUserValidator = Joi.object({
  userId: Joi.string().required()
})

export const updateUserValidator = Joi.object({
  userId: Joi.number().required().positive(),
  id: Joi.number().required().positive(),
  title: Joi.string().allow(null, ""),
  firstName: Joi.string().required().min(3),
  lastName: Joi.string().min(1).required(),
  gender: Joi.string().required(),
  email: Joi.string().email().required(),
  dob: Joi.date().required().less('now'),
  userType: Joi.string().required(),
  notificationType: Joi.array().items().allow(null),
  country: Joi.string().required(),
  loc: Joi.string().allow(null, ''),
  loginid: Joi.string().required(),
  extn: Joi.string().required(),
  officeNo: Joi.number().min(3).allow('', null),
  contactNo: Joi.number().min(7).required(),
  waAccess: Joi.string().default(false).allow(null),
  biAccess: Joi.string().default(false).allow(null),
  profilePicture: Joi.string().allow(null),
  photo: Joi.string().allow(null, ''),
  status: Joi.string().required(),
  activationDate: Joi.date().allow(null),
  expiryDate: Joi.date().greater('now').allow('', null),
  mappingPayload: Joi.object().keys({
    userDeptRoleMapping: Joi.array().items({
      roleId: Joi.array().items(Joi.number()).required(),
      unitId: Joi.string().required()
    }).required()
  }).required(),
  userCategory: Joi.string().allow(null, ''),
  userGroup: Joi.string().allow(null, ''),
  userSource: Joi.string().allow(null, ''),
  userFamily: Joi.array().items(),
  userSkills: Joi.array().items(),
  userVerificationStatus: Joi.string().allow(null, ''),
  managerId: Joi.number().allow(null),
  biAccessKey: Joi.string().allow(null, '')
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

export const getUsersRoleIdValidator = Joi.object({
  roleId: Joi.number().required(),
  deptId: Joi.string().required()
})
