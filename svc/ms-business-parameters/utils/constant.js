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
  CUSTOMER_SERVICE: {
    ACTIVE: 'SS_AC'
  },
  ACTIVE: 'AC',
  IN_ACTIVE: 'IN',
  PENDING: 'PENDING',
  TEMPORARY: 'TEMP',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  template: {
    ACTIVE: "TPL_ACTIVE",
    IN_ACTIVE: "TPL_INACTIVE"
  }
}

export const defaultCode = {
  WEB_APPNAME:"WEB",
  WEBSELFCARE_APPNAME:"WEBSELFCARE",
  YES: 'Y',
  NO: 'N',
  lIMIT: 10,
  PAGE: 0,
  CUSTOMER_CATEGORY: 'REG'
}

export const entityCategory = {
  CUSTOMER: 'CUSTOMER',
  SERVICE: 'SERVICE',
  PROFILE: 'PROFILE',
  USER: 'USER',
  INTERACTION: 'INTERACTION',
  ACCOUNT: 'ACCOUNT',
  ORDER: 'ORDER',
  KB: 'KnowledgeBase',
  HELPDESK: 'HELPDESK'
}

export const POSITIVE_INTXN_TYPES = [
  'INTEREST', 'PURCHASE'
]

export const NEGATIVE_INTXN_TYPES = [
  'APPEALS', 'GRIEVANCE'
]

export const NEUTRAL_INTXN_TYPES = [
  'GENERAL', 'SUGGESTION', 'RECOMMENDATION', 'REQUEST'
]

export const DEFAULT_LOCALE = 'en'
