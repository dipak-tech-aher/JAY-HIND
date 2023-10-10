import { defaultCode } from '@utils'
const Joi = require('joi')

export const createBusinessParameterValidator = Joi.object({
  // code: Joi.string().required(),
  description: Joi.string().required(),
  codeType: Joi.string().required(),
  status: Joi.string(),
  mappingPayload: Joi.object().keys().required()
})

export const updateBusinessParameterValidator = Joi.object({
  code: Joi.string().required(),
  description: Joi.string().required(),
  status: Joi.string(),
  codeType: Joi.string().required(),
  mappingPayload: Joi.object().keys().required()
})

export const getBusinessParameterListValidator = Joi.object({
  limit: Joi.number().positive().default(defaultCode.lIMIT).strict(),
  page: Joi.number().positive().default(defaultCode.PAGE).strict(),
  excel: Joi.boolean().default(false),
  code: Joi.string().allow(null, ''),
  name: Joi.string().allow(null, ''),
  all: Joi.boolean().default(false),
  filters: Joi.array().items({
    value: Joi.string().required(),
    id: Joi.string().required()
  }).allow(null, '')
})

export const getBusinessParameterLookupValidator = Joi.object({
  searchParam: Joi.string().required().valid('code', 'code_type').min(3),
  valueParam: Joi.string().required().min(3).strict(),
  isFormatted: Joi.string().allow(null, '')
})

export const getAddressLookupValidator = Joi.object({
  country: Joi.string().allow(null),
  postCode: Joi.string().allow(null),
  state: Joi.string().allow(),
  city: Joi.string().allow()
})

export const getBusinessParameterValidator = Joi.object({
  code: Joi.string().required().strict()
})

export const createBusinessParameterBulkValidator = Joi.object({
  list: Joi.array().items({
    code: Joi.string().required(),
    description: Joi.string().required(),
    codeType: Joi.string().required(),
    mappingPayload: Joi.object().keys({}).required()
  })
})

export const verifyBusinessParameterRecordsValidator = Joi.object({
  list: Joi.array().items({
    code: Joi.string().required()
  })
})

// export const createChannelSettingValidator = Joi.object({
//   settingType: Joi.string().required(),
//   mappingPayload: Joi.object().keys({}).required()
// })

// export const getChannelSettingByIdValidator = Joi.object({
//   id: Joi.number().required().strict(),
//   type: Joi.string().required()
// })
// export const createEmailTemplateValidator = Joi.object({
//   templateType: Joi.string().required(),
//   templateName: Joi.string().required(),
//   subject: Joi.string().required(),
//   body: Joi.string().required(),
//   mappingPayload: Joi.object().keys({}).required()
// })

export const updateOrCreateBusinessDetailsValidator = Joi.object({
  business_type: Joi.object().keys({
    location: Joi.string().required().label('Business location'),
    type: Joi.string().required().label('Business type')
  }),
  business_details: Joi.object().keys({
    business_name: Joi.string().required().label('Legal business name'),
    business_url: Joi.string().required().label('Business URL'),
    pan: Joi.string().required().label('Permanant Account Number'),
    gst: Joi.string().required().label('GST'),
    llp_id: Joi.string().required().label('Limited Liability Partner'),
    address_details: Joi.object().keys({
      addr_line_1: Joi.string().required().label('Address line 1'),
      addr_line_2: Joi.string().label('Address line 2'),
      addr_line_3: Joi.string().required().label('Address line 3'),
      city: Joi.string().required().label('City'),
      state: Joi.string().required().label('State'),
      country: Joi.string().required().label('Country'),
      postcode: Joi.string().required().label('PostCode')
    }).label('Address details'),
  }),
  business_representative: Joi.object().keys({
    first_name: Joi.string().required().label('Legal first name'),
    middle_name: Joi.string().label('Legal middle name'),
    last_name: Joi.string().required().label('Legal last name'),
    dob: Joi.string().required().label('Date Of Birth'),
    contact_no_pre: Joi.string().required().label('Contact prefix'),
    contact_no: Joi.string().required().label('Contact no'),
    email_id: Joi.string().required().label('Email id'),
  }),
  business_owners: Joi.array().items({
    first_name: Joi.string().required().label('Legal first name'),
    middle_name: Joi.string().label('Legal middle name'),
    last_name: Joi.string().required().label('Legal last name'),
    dob: Joi.string().required().label('Date Of Birth'),
    contact_no_pre: Joi.string().required().label('Contact prefix'),
    contact_no: Joi.string().required().label('Contact no'),
    email_id: Joi.string().required().label('Email id'),
  }),
  bank_details: Joi.object().keys({
    account_holder_name: Joi.string().required().label('Account holder name'),
    ifsc_code: Joi.string().required().label('IFSC code'),
    account_no: Joi.string().required().label('Account Number')
  }).label('Bank details'),
})