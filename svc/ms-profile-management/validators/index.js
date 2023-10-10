const Joi = require('joi').extend(require('@joi/date'))

export const createProfileValidator = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().allow(null, ''),
  profileAge: Joi.number().allow(null),
  gender: Joi.string().allow(null),
  birthDate: Joi.date().format('YYYY-MM-DD').allow(null),
  idType: Joi.string().allow(null),
  idValue: Joi.string().allow(null),
  contactPreferences: Joi.array().items(Joi.string().required()).label('Contact Preference'),
  projectMapping: Joi.array().items({
    entity: Joi.string().required(),
    project: Joi.array().items(Joi.string().required())
  }).label('Project'),
  helpdeskNo: Joi.string().allow(null, ''),
  address: Joi.object({
    isPrimary: Joi.boolean().required().label('Primary'),
    addressType: Joi.string().required().label('Address type'),
    address1: Joi.string().required().label('Address line 1'),
    address2: Joi.string().label('Address line 2'),
    address3: Joi.string().label('Address line 3'),
    city: Joi.string().required().label('City'),
    state: Joi.string().required().label('State'),
    district: Joi.string().required().label('District'),
    country: Joi.string().required().label('Country'),
    postcode: Joi.string().required().label('Postal code'),
    latitude: Joi.string().label('Latitude'),
    longitude: Joi.string().label('Longitude')
  }),
  contact: Joi.object({
    isPrimary: Joi.boolean().required().label('Primary'),
    contactType: Joi.string().required().label('Contact type'),
    title: Joi.string().label('Title'),
    firstName: Joi.string().required().label('First name'),
    lastName: Joi.string().allow(null, ''),
    emailId: Joi.string().email().required().label('Email id'),
    mobileNo: Joi.number().required().label('Mobile no'),
    mobilePrefix: Joi.string().required().label('Mobile no prefix'),
    telephoneNo: Joi.number().label('Telephone no'),
    telephonePrefix: Joi.when('telephoneNo', { is: Joi.exist(), then: Joi.string().required(), otherwise: Joi.allow(null) }).label('Telephone no prefix'),
    whatsappNo: Joi.number().label('Whatsapp no'),
    whatsappNoPrefix: Joi.when('whatsappNo', { is: Joi.exist(), then: Joi.string().required(), otherwise: Joi.allow(null) }).label('Whatsapp no prefix'),
    fax: Joi.string().label('Fax'),
    facebookId: Joi.string().label('Facebook ID'),
    instagramId: Joi.string().label('Instagram ID'),
    telegramId: Joi.string().label('Telegram ID'),
    secondaryEmail: Joi.string().email().label('Secondary email'),
    secondaryContactNo: Joi.number().label('Secondary contact no')
  }).required()
})

export const updateProfileValidator = Joi.object({
  profileNo: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().allow(null, ''),
  profileAge: Joi.number().allow(null),
  gender: Joi.string().allow(null),
  birthDate: Joi.date().format('YYYY-MM-DD').allow(null),
  idType: Joi.string().allow(null),
  idValue: Joi.string().allow(null),
  contactPreferences: Joi.array().items(Joi.string().required()).label('Contact Preference'),
  projectMapping: Joi.array().items({
    entity: Joi.string().required(),
    project: Joi.array().items(Joi.string().required())
  }).label('Project'),
  address: Joi.object({
    isPrimary: Joi.boolean().required().label('Primary'),
    addressNo: Joi.string().required().label('Address number'),
    addressType: Joi.string().required().label('Address type'),
    address1: Joi.string().required().label('Address line 1'),
    address2: Joi.string().label('Address line 2'),
    address3: Joi.string().label('Address line 3'),
    city: Joi.string().required().label('City'),
    state: Joi.string().required().label('State'),
    district: Joi.string().required().label('District'),
    country: Joi.string().required().label('Country'),
    postcode: Joi.string().required().label('Postal code'),
    latitude: Joi.string().label('Latitude'),
    longitude: Joi.string().label('Longitude')
  }),
  contact: Joi.object({
    isPrimary: Joi.boolean().required().label('Primary'),
    contactNo: Joi.string().required().label('Contact number'),
    contactType: Joi.string().required().label('Contact type'),
    title: Joi.string().label('Title'),
    firstName: Joi.string().required().label('First name'),
    lastName: Joi.string().allow(null, ''),
    emailId: Joi.string().email().required().label('Email id'),
    mobileNo: Joi.number().required().label('Mobile no'),
    mobilePrefix: Joi.string().required().label('Mobile no prefix'),
    telephoneNo: Joi.number().label('Telephone no'),
    telephonePrefix: Joi.when('telephoneNo', { is: Joi.exist(), then: Joi.string().required(), otherwise: Joi.allow(null) }).label('Telephone no prefix'),
    whatsappNo: Joi.number().label('Whatsapp no'),
    whatsappNoPrefix: Joi.when('whatsappNo', { is: Joi.exist(), then: Joi.string().required(), otherwise: Joi.allow(null) }).label('Whatsapp no prefix'),
    fax: Joi.string().label('Fax'),
    facebookId: Joi.string().label('Facebook ID'),
    instagramId: Joi.string().label('Instagram ID'),
    telegramId: Joi.string().label('Telegram ID'),
    secondaryEmail: Joi.string().email().label('Secondary email'),
    secondaryContactNo: Joi.number().label('Secondary contact no')
  }).required()
})

export const searchProfileValidator = Joi.object({
  profileId: Joi.number().allow(null),
  profileNo: Joi.string().allow(null),
  mobileNo: Joi.number().allow(),
  emailId: Joi.string().email().allow(null),
  status: Joi.string().allow(null)
})

export const helpdeskProfileValidator = Joi.object({
  profileNo: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  profileAge: Joi.number().allow(null),
  gender: Joi.string().allow(null),
  birthDate: Joi.date().format('YYYY-MM-DD').allow(null),
  idType: Joi.string().allow(null),
  idValue: Joi.string().allow(null),
  contactPreferences: Joi.array().items(Joi.string().required()).label('Contact Preference'),
  contact: Joi.object({
    isPrimary: Joi.boolean().allow().label('Primary'),
    contactType: Joi.string().allow().label('Contact type'),
    contactNo: Joi.string().allow().label('Contact Number'),
    title: Joi.string().label('Title'),
    firstName: Joi.string().allow().label('First name'),
    lastName: Joi.string().allow(null, ''),
    emailId: Joi.string().email().allow().label('Email id'),
    mobileNo: Joi.number().allow().label('Mobile no'),
    mobilePrefix: Joi.string().allow().label('Mobile no prefix'),
    telephoneNo: Joi.number().label('Telephone no'),
    telephonePrefix: Joi.when('telephoneNo', { is: Joi.exist(), then: Joi.string().allow(), otherwise: Joi.allow(null) }).label('Telephone no prefix'),
    whatsappNo: Joi.number().label('Whatsapp no'),
    whatsappNoPrefix: Joi.when('whatsappNo', { is: Joi.exist(), then: Joi.string().required(), otherwise: Joi.allow(null) }).label('Whatsapp no prefix'),
    fax: Joi.string().label('Fax'),
    facebookId: Joi.string().label('Facebook ID'),
    instagramId: Joi.string().label('Instagram ID'),
    telegramId: Joi.string().label('Telegram ID'),
    secondaryEmail: Joi.string().email().label('Secondary email'),
    secondaryContactNo: Joi.number().label('Secondary contact no')
  }).required()
})
