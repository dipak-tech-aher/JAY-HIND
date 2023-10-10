const Joi = require('joi').extend(require('@joi/date'))

export const registerUserValidator = Joi.object({
  firstName: Joi.string().required().min(3).label('First name'),
  lastName: Joi.string().min(1).required().label('Last name'),
  gender: Joi.string().required().messages({
    'string.valid': 'Please provide valid gender'
  }).label('Gender'),
  email: Joi.string().email().required().label('Email'),
  dob: Joi.date().format('YYYY-MM-DD').required().label('Date of birth'),
  userType: Joi.string().required().label('User type'),
  userGroup: Joi.string().required().label('User group'),
  userSource: Joi.string().required().label('User source'),
  country: Joi.string().required().label('Country'),
  location: Joi.string().required().label('Location'),
  // notificationType: Joi.string().required(),
  extn: Joi.number().required().label('Mobile extension'),
  contactNo: Joi.number().min(7).required().label('Contact number')
})

export const registerUserViaMobileValidator = Joi.object({
  email: Joi.string().email().required(),
  contactNo: Joi.number().min(7).required()
})

export const sendOTPValidator = Joi.object({
  type: Joi.string().valid('mobile', 'email').required(),
  source: Joi.string().required(),
  userGroup: Joi.string().allow(null),
  firstName: Joi.when('source', {
    is: 'LOGIN',
    then: Joi.string()
  }),
  reference: Joi.when('type', {
    is: 'mobile',
    then: Joi.number().required(),
    otherwise: Joi.string().email().required()
  }),
  extn: Joi.when('type', {
    is: 'mobile',
    then: Joi.number().required()
  })
})

export const validateOTPValidator = Joi.object({
  type: Joi.string().valid('mobile', 'email').required(),
  reference: Joi.alternatives().conditional('type', {
    is: 'mobile',
    then: Joi.number().required(),
    otherwise: Joi.string().email().required()
  }),
  otp: Joi.number().required()
})

export const loginValidator = Joi.object({
  loginId: Joi.string().required(),
  password: Joi.string().required(),
  channel: Joi.string().required(),
  loginType: Joi.string().valid('OTP', 'PASSWORD'),
  deviceId: Joi.when('channel', {
    is: 'UAM_MOBILE',
    then: Joi.string().required()
  }),
  userGroup: Joi.when(
    'channel', {
      is: 'UAM_MOBILE',
      then: Joi.string().valid('UG_BUSINESS', 'UG_CONSUMER').required()
    })
})

export const logoutValidator = Joi.object({
  userId: Joi.number().required()
})

export const getUserByTokenValidator = Joi.object({
  inviteToken: Joi.string().required()
})

export const updateUserSessionValidator = Joi.object({
  userId: Joi.number().required(),
  currRole: Joi.string().required(),
  currDept: Joi.string().required(),
  currRoleId: Joi.number().required(),
  currDeptId: Joi.string().required(),
  currDeptDesc: Joi.string().required(),
  currRoleDesc: Joi.string().required()
})

export const resetPasswordValidator = Joi.object({
  password: Joi.string().min(8).max(20).required(),
  confirmPassword: Joi.any().valid(Joi.ref('password')).required().error(new Error('Confirm Password must be same as Password')),
  email: Joi.string().email().required(),
  oldPassword: Joi.string().required(),
  forceChangePwd: Joi.boolean().required()
})

export const forgotPasswordValidator = Joi.object({
  loginId: Joi.alternatives()
    .try(
      Joi.string()
        .lowercase()
        .email({
          minDomainSegments: 2,
          tlds: {
            allow: ['com', 'net', 'in', 'co']
          }
        }),
      Joi.string().min(3).max(30)
    ).required(),
  dob: Joi.when('loginId', { is: Joi.string().email(), then: Joi.allow(null, ''), otherwise: Joi.date().format('YYYY-MM-DD').required() }),
  lastName: Joi.when('loginId', { is: Joi.string().email(), then: Joi.allow(null, ''), otherwise: Joi.string().required() })
})

export const getAccessTokenValidator = Joi.object({
  refreshToken: Joi.string().required()
})
