const Joi = require('joi').extend(require('@joi/date'))

export const getAccountsValidator = Joi.object({
  accountUuid: Joi.string().allow(null),
  customerUuid: Joi.string().allow(null),
  accountNo: Joi.number().allow(null),
  // serviceNo: Joi.number().allow(null),
  accountName: Joi.string().allow(null),
  status: Joi.string().allow(),
  limit: Joi.number(),
  page: Joi.number()
})

export const updateAccountValidator = Joi.object({
  details: Joi.object().keys({
    action: Joi.string().valid('ADD', 'REMOVE', 'UPDATE').required(),
    firstName: Joi.string().required().label('First name'),
    lastName: Joi.string().required().label('Last name'),
    idType: Joi.string().required(),
    idValue: Joi.string().required(),
    gender: Joi.string().allow('').label('Gender'),
    accountType: Joi.string().allow('').label('Account type').allow(null),
    accountCategory: Joi.string().allow('').label('Account Category'),
    accountClass: Joi.string().allow('').label('Account class'),
    accountLevel: Joi.string().allow('').label('Account level'),
    expiryDate: Joi.string().allow('').label('Expiry date'),
    registeredNo: Joi.string().allow('').label('Registered no'),
    registeredDate: Joi.string().allow('').label('Registered date'),
    notificationPreference: Joi.array().items().allow(null).label('Notification preference'),
    accountPriority: Joi.string().allow('').label('Account priority'),
    creditLimit: Joi.string().allow('').label('Credit limit'),
    accountBalance: Joi.string().label('Account balance'),
    accountOutstanding: Joi.string().label('Account outstanding'),
    accountStatusReason: Joi.string().label('Status reason'),
    currency: Joi.string().label('Currency'),
    billLanguage: Joi.string().label('Bill language')
  }).label('Account details'),
  address: Joi.object().keys({
    isPrimary: Joi.boolean().required().label('Primary'),
    addressNo: Joi.string().label('Address No'),
    addressType: Joi.string().label('Address type').allow(null),
    address1: Joi.string().label('Address line 1'),
    address2: Joi.string().label('Address line 2'),
    address3: Joi.string().label('Address line 3'),
    addrZone: Joi.string().label('Address zone'),
    city: Joi.string().required().label('City'),
    district: Joi.string().required().label('District'),
    state: Joi.string().required().label('State'),
    postcode: Joi.string().required().label('Postcode'),
    country: Joi.string().required().label('Country'),
    latitude: Joi.string().label('Latitude').allow(null, ''),
    longitude: Joi.string().label('Longitude').allow(null, '')
  }).label('Address Details'),
  contact: Joi.object().keys({
    isPrimary: Joi.boolean().required().label('Primary'),
    contactNo: Joi.string().label('Contact No'),
    contactType: Joi.string().label('Contact type').allow(null),
    // title: Joi.string().label('Title'),
    firstName: Joi.string().required().label('First name'),
    lastName: Joi.string().required().label('Last name'),
    emailId: Joi.string().email().required().label('Email id'),
    mobilePrefix: Joi.string().required().label('Mobile no prefix'),
    mobileNo: Joi.number().required().label('Mobile no'),
    telephonePrefix: Joi.string().label('Telephone prefix'),
    telephoneNo: Joi.number().label('Telephone no'),
    whatsappNoPrefix: Joi.string().label('Whatsapp no prefix'),
    whatsappNo: Joi.number().label('Whatsapp no'),
    fax: Joi.string().label('Fax'),
    facebookId: Joi.string().label('Facebook ID'),
    instagramId: Joi.string().label('Instagram ID'),
    telegramId: Joi.string().label('Telegram ID'),
    secondaryEmail: Joi.string().email().label('Secondary email'),
    secondaryContactNo: Joi.number().label('Secondary contact no')
  }).label('Contact details')
}).or('details', 'address', 'contact')

export const createAccountValidator = Joi.object({
  details: Joi.object().keys({
    customerUuid: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    // status: Joi.string().required(),
    gender: Joi.string().required(),
    accountCategory: Joi.string().allow(null),
    accountType: Joi.string().allow(null),
    accountClass: Joi.string()/* .required() */,
    accountLevel: Joi.string()/* .required() */,
    expiryDate: Joi.date().format('YYYY-MM-DD').allow(null),
    registeredNo: Joi.string().allow(null),
    registeredDate: Joi.date().allow(null),
    idType: Joi.string().required(),
    idValue: Joi.string().required(),
    notificationPreference: Joi.array().items().allow(null),
    accountPriority: Joi.string()/* .required() */,
    currency: Joi.string()/* .required() */,
    billLanguage: Joi.string()/* .required() */
  }),
  address: Joi.object({
    isPrimary: Joi.boolean().required().label('Primary'),
    addressType: Joi.string()/* .required() */.label('Address type'),
    address1: Joi.string().required().label('Address line 1'),
    address2: Joi.string().label('Address line 2'),
    address3: Joi.string().label('Address line 3'),
    city: Joi.string().required().label('City'),
    state: Joi.string().required().label('State'),
    district: Joi.string().required().label('District'),
    country: Joi.string().required().label('Country'),
    billFlag: Joi.string().valid('Y', 'N').default('N').allow(null),
    postcode: Joi.string().required().label('Postal code'),
    latitude: Joi.string().label('Latitude').allow(null, ''),
    longitude: Joi.string().label('Longitude').allow(null, '')
  }).label('Address Details'),
  contact: Joi.object().keys({
    isPrimary: Joi.boolean().required().label('Primary'),
    contactNo: Joi.string().label('Contact No'),
    contactType: Joi.string().label('Contact type'),
    // title: Joi.string().label('Title'),
    firstName: Joi.string().required().label('First name'),
    lastName: Joi.string().required().label('Last name'),
    emailId: Joi.string().email().required().label('Email id'),
    mobilePrefix: Joi.string().required().label('Mobile no prefix'),
    mobileNo: Joi.number().required().label('Mobile no'),
    telephonePrefix: Joi.string().label('Telephone prefix'),
    telephoneNo: Joi.number().label('Telephone no'),
    whatsappNoPrefix: Joi.string().label('Whatsapp no prefix'),
    whatsappNo: Joi.number().label('Whatsapp no'),
    fax: Joi.string().label('Fax'),
    facebookId: Joi.string().label('Facebook ID'),
    instagramId: Joi.string().label('Instagram ID'),
    telegramId: Joi.string().label('Telegram ID'),
    secondaryEmail: Joi.string().email().label('Secondary email'),
    secondaryContactNo: Joi.number().label('Secondary contact no')
  }).label('Contact details')
})

export const createServiceValidator = Joi.object({
  service: Joi.array().items({
    details: Joi.array().items({
      action: Joi.string().valid('ADD').required(),
      serviceName: Joi.string().required().label('Service Name'),
      serviceCategory: Joi.string().allow(null).label('Service Category'),
      serviceType: Joi.string().allow(null).label('Service Type'),
      serviceClass: Joi.string().allow(null).label('Service Class'),
      planPayload: Joi.object({
        productId: Joi.number(),
        productUuid: Joi.string(),
        bundleId: Joi.number().allow(null),
        contract: Joi.number().allow(null),
        actualContract: Joi.number().allow(null),
        promoContract: Joi.number().allow(null),
        serviceLimit: Joi.number().allow(null),
        promoServiceLimit: Joi.number().allow(null),
        actualServiceLimit: Joi.number().allow(null),
        promoCode: Joi.array().allow(null),
        productBenefit: Joi.array().allow(null),
        actualProductBenefit: Joi.array().allow(null),
        promoBenefit: Joi.array().allow(null),
        upfrontCharge: Joi.string().allow(null),
        advanceCharge: Joi.string().allow(null),
      }).required().label('Product Payload'),
      quantity: Joi.string().allow(null).label('Service Quantity'),
      notificationPreference: Joi.array().items().allow(null).label('Notification Preference'),
      serviceAgreement: Joi.string().label('Service Agreement'),
      customerUuid: Joi.string().required().label('Customer Uid'),
      currency: Joi.string().required(),
      billLanguage: Joi.string().required(),
      contractMonths: Joi.number().allow(null),
      prodBundleId: Joi.number().allow(null),
      promoId: Joi.number().allow(null)
    }),
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
      billFlag: Joi.string().valid('Y', 'N').default('N').allow(null),
      postcode: Joi.string().required().label('Postal code'),
      latitude: Joi.string().label('Latitude').allow(null, ''),
      longitude: Joi.string().label('Longitude').allow(null, '')
    })
  }).required()
})

export const updateServiceValidator = Joi.object({
  service: Joi.array().items({
    details: Joi.array().items({
      action: Joi.string().valid('ADD', 'REMOVE', 'UPDATE', 'UPGRADE').required(),
      serviceUuid: Joi.when('action', { is: 'ADD', then: Joi.allow(), otherwise: Joi.string().required().label('Service Uid') }),
      serviceName: Joi.when('action', {
        is: 'REMOVE',
        then: Joi.allow(),
        otherwise: Joi.string().required().label('Service Name')
      }),
      serviceCategory: Joi.when('action', {
        is: 'REMOVE',
        then: Joi.allow(),
        otherwise: Joi.string().required().label('Service Category')
      }),
      serviceType: Joi.when('action', {
        is: 'REMOVE',
        then: Joi.allow(),
        otherwise: Joi.string().required().label('Service Type')
      }),
      serviceClass: Joi.string().allow(null).label('Service Class'),
      planPayload: Joi.object({
        productId: Joi.number(),
        productUuid: Joi.string(),
        bundleId: Joi.number().allow(null),
        contract: Joi.number().allow(null),
        actualContract: Joi.number().allow(null),
        promoContract: Joi.number().allow(null),
        serviceLimit: Joi.number().allow(null),
        promoServiceLimit: Joi.number().allow(null),
        actualServiceLimit: Joi.number().allow(null),
        promoCode: Joi.array().allow(null),
        productBenefit: Joi.array().allow(null),
        actualProductBenefit: Joi.array().allow(null),
        promoBenefit: Joi.array().allow(null),
        upfrontCharge: Joi.string().allow(null),
        advanceCharge: Joi.string().allow(null),
      }).required().label('Product Payload'),
      quantity: Joi.string().allow(null).label('Service Quantity'),
      notificationPreference: Joi.string().allow(null).label('Notification Preference'),
      // serviceAgreement: Joi.string().required(),
      serviceAgreement: Joi.string()./* required(). */label('Service Agreement').allow(null),
      customerUuid: Joi.string().required().label('Customer Uid'),
      accountUuid: Joi.when('action', {
        is: 'ADD',
        then: Joi.allow(),
        otherwise: Joi.string().required().label('Account Uid')
      }),
      // accountId: Joi.number().required(),
      currency: Joi.string().required(),
      billLanguage: Joi.string().required(),
      contractMonths: Joi.number().allow(null),
      prodBundleId: Joi.number().allow(null),
      promoId: Joi.number().allow(null)
    }),
    address: Joi.object({
      isPrimary: Joi.boolean().required().label('Primary'),
      addressNo: Joi.string().allow(null),
      addressType: Joi.string()./* required(). */label('Address type').allow(null),
      address1: Joi.string().required().label('Address line 1'),
      address2: Joi.string().label('Address line 2').allow(null),
      address3: Joi.string().label('Address line 3').allow(null),
      city: Joi.string().required().label('City'),
      state: Joi.string().required().label('State'),
      district: Joi.string().required().label('District'),
      country: Joi.string().required().label('Country'),
      billFlag: Joi.string().valid('Y', 'N').default('N').allow(null),
      postcode: Joi.string().required().label('Postal code'),
      latitude: Joi.string().label('Latitude').allow(null, ''),
      longitude: Joi.string().label('Longitude').allow(null, '')
    })
  }).required()
})

export const getServicesValidator = Joi.object({
  limit: Joi.number().required(),
  page: Joi.string().required(),
  accountUuid: Joi.string().allow(null),
  customerUuid: Joi.string().allow(null),
  serviceUuid: Joi.string().allow(null),
  serviceNo: Joi.string().allow(null),
  serviceName: Joi.string().allow(null),
  status: Joi.array().items(Joi.string().required()).allow(null)
})

export const getAccountIdsValidator = Joi.object({
  accountUuid: Joi.string().allow(null),
  customerUuid: Joi.string().allow(null),
  accountNo: Joi.string().allow(null),
  accountName: Joi.string().allow(null)
})

export const getExpiryServicesValidator = Joi.object({
  accountUuid: Joi.string().allow(null),
  customerUuid: Joi.string().allow(null),
  serviceUuid: Joi.string().allow(null),
  serviceNo: Joi.string().allow(null),
  serviceName: Joi.string().allow(null),
  limit: Joi.number().required(),
  page: Joi.string().required()
})
