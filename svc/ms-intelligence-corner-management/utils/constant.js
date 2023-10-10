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

export const entityCategory = {
  CUSTOMER: 'CUSTOMER',
  SERVICE: 'SERVICE',
  PROFILE: 'PROFILE',
  USER: 'USER',
  INTERACTION: 'INTERACTION',
  ACCOUNT: 'ACCOUNT',
  ORDER: 'ORDER'
}

export const constantCode = {
  custServiceStatus:{
    ACTIVE:'SS_AC'
  },
  status: {
    ACTIVE: 'AC',
    IN_ACTIVE: 'IN',
    PENDING: 'PENDING',
    TEMPORARY: 'TEMP',
    SERVICE_ACTIVE: 'SS_AC',
    FINAL: 'FINAL',
    PROSPECT: 'PROSPECT'
  },
  customerStatus: {
    ACTIVE: 'CS_ACTIVE',
    IN_ACTIVE: 'CS_INACTIVE',
    PENDING: 'CS_PEND',
    TEMPORARY: 'CS_TEMP',
    PROSPECT: 'CS_PROSPECT'
  },
  common: {
    YES: 'Y',
    NO: 'N',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    lIMIT: 10,
    PAGE: 0,
    PASSWORD_LENGTH: 8
  }
}

export const DEFAULT_LOCALE = 'en'

export const POSITIVE_INTXN_TYPES = ['REQSR', 'INTEREST', 'PURCHASE']
export const NEGATIVE_INTXN_TYPES = ['REQCOMP', 'APPEALS', 'GRIEVANCE']
export const NEUTRAL_INTXN_TYPES = ['REQINQ', 'REQWO', 'GENERAL', 'SUGGESTION', 'RECOMMENDATION', 'REQUEST']
