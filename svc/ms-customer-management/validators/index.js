const Joi = require('joi').extend(require('@joi/date'))

export const getCustomerValidator = Joi.object({
  customerUuid: Joi.string().allow(null).label('Customer uuid'),
  checkIsPrimary: Joi.boolean().allow(null),
  customerName: Joi.string().allow(null, '').label('Customer name'),
  emailId: Joi.string().email().allow(null, '').label('Email Id'),
  mobileNo: Joi.number().allow(null, '').label('Mobile no'),
  contactNo: Joi.number().allow(null, '').label('Contact no'),
  customerRefNo: Joi.string().allow(null, '').label('Customer Reference No'),
  customerNo: Joi.string().allow(null, '').label('Customer No'),
  // customerRefNo: Joi.string().allow(null, '').label('Customer reference no'),
  idType: Joi.string().allow().label('Id type'),
  idValue: Joi.string().allow().label('Id value'),
  status: Joi.array().items(Joi.string().allow()).label('Status'),
  filters: Joi.array().items({
    value: Joi.string().required(),
    id: Joi.string().required(),
    filter: Joi.string().required()
  }),
  limit: Joi.number().required().label('Limit'),
  page: Joi.number().required().label('Page')
})

export const recentActivitiesValidator = Joi.object({
  customerUuid: Joi.string().allow(null).label('Customer uuid')
})

export const registerCustomerValidator = Joi.object({
  customerCategory: Joi.string().allow(null),
  accountType: Joi.any().valid('personal', 'existing').required().label('Account type'),
  title: Joi.when('accountType', { is: 'personal', then: Joi.string() }).label('Title'),
  firstName: Joi.when('accountType', { is: 'personal', then: Joi.string().required() }).label('First name'),
  lastName: Joi.when('accountType', { is: 'personal', then: Joi.string().required() }).label('Last name'),
  gender: Joi.when('accountType', { is: 'personal', then: Joi.string().valid('NC', 'M', 'F', 'TG', 'NR').required() }).label('Gender'),
  emailId: Joi.string().email().required().label('Email'),
  extNo: Joi.number().required().label('Extension'),
  mobileNo: Joi.number().min(7).required().label('Mobile no'),
  idType: Joi.string().required().label('ID type'),
  idValue: Joi.string().required().label('Id value'),
  userFamily: Joi.string().required().label('User Family'),
  userSource: Joi.string().required().label('User Source'),
  userGroup: Joi.string().allow(null),
  customerPhoto: Joi.string().label('Customer Photo'),
  registerFrom: Joi.string().label('Register from'),
  otp: Joi.string().label('OTP'),
  address: Joi.when('accountType', {
    is: 'personal',
    then: Joi.object().keys({
      addressType: Joi.string().required().label('Address type'),
      address1: Joi.string().required().label('Address line 1'),
      address2: Joi.string().label('Address line 2'),
      address3: Joi.string().allow(null, '').label('Address line 3'),
      city: Joi.string().required().label('City'),
      state: Joi.string().required().label('State'),
      district: Joi.string().required().label('District'),
      country: Joi.string().required().label('Country'),
      postcode: Joi.string().required().label('Postal code'),
      latitude: Joi.string().label('Latitude').allow(null, ''),
      longitude: Joi.string().label('Longitude').allow(null, '')
    }).required()
  }).label('Address'),
  customerNo: Joi.when('accountType', { is: 'existing', then: Joi.string().required() }).label('Customer ID'),
  birthDate: Joi.date().required().less('now').label('Date of birth'),
  isVerified: Joi.boolean().required().label('Verify status'),
  password: Joi.when('isVerified', { is: true, then: Joi.string().min(3).max(15).required() }).label('Password'),
  confirmPassword: Joi.when('isVerified', {
    is: true,
    then: Joi.any().equal(Joi.ref('password')).required().messages({ 'any.only': '{{#label}} does not match' })
  }).label('Confirm password')
})

export const updateCustomerValidator = Joi.object({
  details: Joi.object().keys({
    title: Joi.string().allow(null).label('Title'),
    customerNo: Joi.string().label('Cusomter Number'),
    firstName: Joi.string().label('First name'),
    lastName: Joi.string().label('Last name'),
    gender: Joi.string().allow('', null).label('Gender'),
    customerAge: Joi.number().allow(null).label('Customer Age'),
    birthDate: Joi.string().allow('', null).label('DOB'),
    occupation: Joi.string().allow(null, '').label('Occupation'),
    nationality: Joi.string().allow(null, '').label('Nationality'),
    billable: Joi.string().allow().label('billable'),
    idType: Joi.string().allow(null),
    idValue: Joi.string().allow(null),
    customerCategory: Joi.string().allow(null).label('Customer Category'),
    customerClass: Joi.string().allow(null).label('Customer Class'),
    registeredNo: Joi.string().allow(null, '').label('Register Number'),
    registeredDate: Joi.date().allow(null, '').label('Register Date'),
    businessName: Joi.string().allow(null, '').label('Business Name'),
    customerPhoto: Joi.string().allow(null, '').label('Customer Photo'),
    customerMaritalStatus: Joi.string().allow(null, '').label('Customer Marital Status'),
    taxNo: Joi.string().allow(null).label('Tax No'),
    contactPreferences: Joi.array().items(Joi.string().required()).label('Contact Preference'),
    projectMapping: Joi.array().allow(null).label('Project'),
    source: Joi.string().allow(null).label('source')
  }).label('Customer details'),
  address: Joi.object().keys({
    addressNo: Joi.string().label('Address No'),
    isPrimary: Joi.boolean().required().label('Primary'),
    addressType: Joi.string().label('Address type'),
    address1: Joi.string().label('Address line 1'),
    address2: Joi.string().label('Address line 2'),
    address3: Joi.string().allow(null, '').label('Address line 3'),
    addrZone: Joi.string().allow(null, '').label('Address zone'),
    city: Joi.string().required().label('City'),
    district: Joi.string().required().label('District'),
    state: Joi.string().required().label('State'),
    postcode: Joi.string().required().label('Postcode'),
    country: Joi.string().required().label('Country'),
    latitude: Joi.string().allow(null, '').label('Latitude'),
    longitude: Joi.string().allow(null, '').label('Longitude')
  }).label('Address Details'),
  contact: Joi.object().keys({
    contactNo: Joi.string().label('Contact No'),
    isPrimary: Joi.boolean().required().label('Primary'),
    contactType: Joi.string().label('Contact type'),
    title: Joi.string().label('Title'),
    firstName: Joi.string().required().label('First name'),
    lastName: Joi.string().required().label('Last name'),
    emailId: Joi.string().email().required().label('Email id'),
    mobilePrefix: Joi.string().required().label('Mobile no prefix'),
    mobileNo: Joi.number().required().label('Mobile no'),
    telephonePrefix: Joi.string().allow(null).label('Telephone prefix'),
    telephoneNo: Joi.number().allow(null).label('Telephone no'),
    whatsappNoPrefix: Joi.string().allow(null).label('Whatsapp no prefix'),
    whatsappNo: Joi.number().allow(null).label('Whatsapp no'),
    fax: Joi.string().allow(null).label('Fax'),
    facebookId: Joi.string().allow(null, '').label('Facebook ID'),
    instagramId: Joi.string().allow(null, '').label('Instagram ID'),
    telegramId: Joi.string().allow(null, '').label('Telegram ID'),
    secondaryEmail: Joi.string().allow(null, '').email().label('Secondary email'),
    secondaryContactNo: Joi.number().label('Secondary contact no')
  }).label('Contact details'),
  attachment: Joi.array().items(Joi.string().required()).label('Attachment')
}).or('details', 'address', 'contact')

export const deleteAddressContactValidator = Joi.object({
  address: Joi.object().keys({
    addressNo: Joi.string().label('Address No')
  }).label('Address Details'),
  contact: Joi.object().keys({
    contactNo: Joi.string().label('Contact No')
  }).label('Contact details')
}).or('details', 'address', 'contact')

export const createCustomerValidator = Joi.object({
  details: Joi.object().keys({
    customerRefNo: Joi.string().allow(null, '').label('Customer Ref No'),
    source: Joi.string().allow(null, ''),
    title: Joi.string().allow(null).label('Title'),
    firstName: Joi.string().label('First Name'),
    lastName: Joi.string().label('Last Name'),
    customerAge: Joi.number().allow(null).label('Customer Age'),
    gender: Joi.string().allow('', null).label('Gender'),
    birthDate: Joi.date().allow(null).format('YYYY-MM-DD').label('Date of Birth'),
    idType: Joi.string().required().label('Id Type'),
    idValue: Joi.string().required().label('Id Value'),
    customerCategory: Joi.string().allow(null).label('Customer Category'),
    customerClass: Joi.string().allow(null).label('Customer Class'),
    registeredNo: Joi.string().allow(null, '', ' ').label('Register Number'),
    businessName: Joi.string().allow(null, '').label('Business Name'),
    registeredDate: Joi.date().allow(null, '', ' ').label('Register Date'),
    nationality: Joi.string().allow(null).label('Nationality'),
    customerPhoto: Joi.string().allow(null).label('Customer Photo'),
    taxNo: Joi.string().allow(null).label('Tax No'),
    billable: Joi.string().valid('Y', 'N').label('Billable'),
    occupation: Joi.string().allow('').label('Occupation'),
    status: Joi.string().allow(null, "").label('Status'),
    customerMaritalStatus: Joi.string().allow('').label('Customer Marital Status'),
    contactPreferences: Joi.array().items(Joi.string().required()).label('Contact Preference')
  }).label('Customer details').required(),
  address: Joi.object({
    isPrimary: Joi.boolean().required().label('Primary'),
    addressType: Joi.string().label('Address type'),
    address1: Joi.string().allow(null).label('Address line 1'),
    address2: Joi.string().allow(null).label('Address line 2'),
    address3: Joi.string().allow(null, '').label('Address line 3'),
    addrZone: Joi.string().allow(null).label('Zone'),
    city: Joi.string().required().label('City'),
    state: Joi.string().required().label('State'),
    district: Joi.string().required().label('District'),
    country: Joi.string().required().label('Country'),
    postcode: Joi.string().required().label('Postal code'),
    latitude: Joi.string().label('Latitude').allow(null, ''),
    longitude: Joi.string().label('Longitude').allow(null, '')
  }),
  contact: Joi.object({
    contactType: Joi.string().label('Contact type'),
    isPrimary: Joi.boolean().required().label('Primary'),
    title: Joi.string().label('Title'),
    firstName: Joi.string().required().label('First name'),
    lastName: Joi.string().required().label('Last name'),
    emailId: Joi.string().email().required().label('Email id'),
    mobilePrefix: Joi.string().required().label('Mobile no prefix'),
    mobileNo: Joi.number().required().label('Mobile no'),
    telephonePrefix: Joi.when('telephoneNo', { is: Joi.exist(), then: Joi.string().label('Telephone prefix') }),
    telephoneNo: Joi.number().label('Telephone no'),
    whatsappNoPrefix: Joi.when('whatsappNo', { is: Joi.exist(), then: Joi.string().label('Whatsapp no prefix') }),
    whatsappNo: Joi.number().label('Whatsapp no'),
    fax: Joi.string().label('Fax'),
    facebookId: Joi.string().label('Facebook ID'),
    instagramId: Joi.string().label('Instagram ID'),
    telegramId: Joi.string().label('Telegram ID'),
    secondaryEmail: Joi.string().email().label('Secondary email'),
    secondaryContactNo: Joi.number().label('Secondary contact no')
  }),
  attachment: Joi.array().items(Joi.string().required()).label('Attachment')
})

export const updateStatusValidator = Joi.object({
  customerUuid: Joi.string().required(),
  service: Joi.array().items(Joi.string().required()),
  accountUuid: Joi.string(),
  getQuote: Joi.boolean().required()
})

export const getCustomerInteractionValidation = Joi.object({
  customerUuid: Joi.string().required()
})
