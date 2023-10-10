export const statusCodeConstants = {
  NOT_AUTHORIZED: 401,
  SUCCESS: 200,
  ERROR: 500,
  NO_CONTENT: 203,
  ACCESS_FORBIDDEN: 403,
  VALIDATION_ERROR: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UN_PROCESSIBLE_ENTITY: 422,
  RESOURCE_CREATED: 201
}

export const defaultMessage = {
  NOT_AUTHORIZED: 'User not authorized',
  UN_HANDLED: 'Oops something went wrong',
  ERROR: 'Error while accessing resource',
  SUCCESS: 'Service request was successful',
  ACCESS_FORBIDDEN: 'Not authorized to perform this action',
  VALIDATION_ERROR: 'Error validating data',
  NOT_FOUND: 'Resource not found',
  CONFLICT: 'Resource already exist',
  NOT_AUTHORIZED_EXCEPTION: 'NotAuthorizedException',
  USERNAME_EXIST_EXCEPTION: 'UsernameExistsException',
  TOKEN_VALIDATION_ERROR: 'Error while validating token',
  MANDATORY_FIELDS_MISSING: 'Mandatory fields are missing',
  USER_ALREADY_EXIST: 'User already exits',
  UN_PROCESSIBLE_ENTITY: 'Un processible entity',
  NOT_RECORDS_FOUND: 'No records found',
  NO_CONTENT: 'No content found'
}

export const defaultStatus = {
  ACTIVE: 'AC',
  IN_ACTIVE: 'IN',
  PENDING: 'PENDING',
  TEMPORARY: 'TEMP',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  NEW: 'NEW',
  ASSIGNED: 'ASSIGNED'
}

export const defaultCode = {
  YES: 'Y',
  NO: 'N',
  lIMIT: 10,
  PAGE: 0
}

export const constantCode = {
  status: {
    ACTIVE: 'AC',
    IN_ACTIVE: 'IN',
    PENDING: 'PENDING',
    TEMPORARY: 'TEMP',
    FINAL: 'FINAL',
    PROSPECT: 'PROSPECT'
  },
  customerStatus: {
    ACTIVE: 'CS_ACTIVE',
    IN_ACTIVE: 'CS_INACTIVE',
    PENDING: 'CS_PEND',
    TEMPORARY: 'CS_TEMP',
    PROSPECT: 'CS_PROSPECT',
    SUSPENDED: 'CS_SUSP'
  },
  serviceStatus: {
    ACTIVE: 'SS_AC',
    IN_ACTIVE: 'SS_IN',
    SUSPENDED: 'SS_SUS',
    TEMPORARY: 'SS_TEMP',
    TEMPORARY_OUT_OF_SERVICE: 'SS_TOS',
    PROSPECT: 'SS_PROSPECT',
    PENDING: 'SS_PEND'
  },
  common: {
    YES: 'Y',
    NO: 'N',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    lIMIT: 10,
    PAGE: 0,
    PASSWORD_LENGTH: 8,
    INTERACTION_LIMIT: 10,
    PERSONAL: 'personal',
    EXISTING: 'existing'
  }
}

export const entityCategory = {
  CUSTOMER: 'CUSTOMER',
  SERVICE: 'SERVICE',
  PROFILE: 'PROFILE',
  USER: 'USER',
  INTERACTION: 'INTERACTION',
  ACCOUNT: 'ACCOUNT',
  ORDER: 'ORDER'
}

export const DEFAULT_LOCALE = 'en'

export const addressFields = [
  'addressType', 'isPrimary', 'address1', 'address2', 'address3', 'addrZone', 'city', 'district',
  'state', 'postcode', 'country', 'latitude', 'longitude'
]

export const customerFields = [
  'title', 'firstName', 'lastName', 'gender', 'birthDate', 'occupation', 'nationality', 'idType', 'idValue',
  'customerCategory', 'customerClass', 'registerNo', 'registerDate', 'customerPhoto', 'taxNo', 'contactPreferences',
  'projectMapping', 'businessName', 'customerMaritalStatus'
]

export const contactFields = [
  'contactType', 'isPrimary', 'title', 'firstName', 'lastName', 'emailId', 'mobilePrefix', 'mobileNo', 'telephonePrefix',
  'telephoneNo', 'whatsappNoPrefix', 'whatsappNo', 'fax', 'facebookId', 'instagramId', 'telegramId',
  'secondaryEmail', 'secondaryContactNo'
]

export const customerInteractionEmoji = [{
  code: 'GRIEVANCE',
  emoji: 'rage',
  percentage: '1'
}, {
  code: 'REQUEST',
  emoji: 'neutral_face',
  percentage: '2.5'
}, {
  code: 'PURCHASE',
  emoji: 'smiley',
  percentage: '5'
}, {
  code: 'GENERAL',
  emoji: 'neutral_face',
  percentage: '2.5'
}, {
  code: 'APPEALS',
  emoji: 'worried',
  percentage: '1.5'
}, {
  code: 'RECOMMENDATION',
  emoji: 'neutral_face',
  percentage: '2.5'
}, {
  code: 'INTEREST',
  emoji: 'smiley',
  percentage: '5'
}, {
  code: 'SUGGESTION',
  emoji: 'neutral_face',
  percentage: '2.5'
}]
