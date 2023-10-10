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

export const constantCode = {
  status: {
    NEW: 'HS_NEW',
    WIP: 'HS_WIP',
    CLOSED: 'HS_CLS',
    HOLD: 'HS_HOLD',
    ASSIGNED: 'HS_ASSGN',
    CANCELLED: 'HS_CANCE',
    ACTIVE: 'AC',
    IN_ACTIVE: 'IN',
    PENDING: 'PENDING',
    TEMPORARY: 'TEMP',
    HELPDESK_REPLY: 'HELPDESK_REPLY',
  },
  common: {
    YES: 'Y',
    NO: 'N',
    ALL: 'ALL',
    AVAILABLE: 'AVAILABLE',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    FINAL: 'FINAL',
    REPLY: 'REPLY',
    lIMIT: 10,
    PAGE: 0,
    OUT: 'OUT',
    HELPDESK_EMAIL: 'AZURE'
  },
  source: {
    EMAIL: 'E-MAIL',
    IVR: 'IVR'
  },
  helpdesk: {
    UPDATE_RECORD: 'HELPDESK_UPDATE',
    CREATED: 'HELPDESK_CREATE',
    SELF_ASSIGNED: 'HELPDESK_ASSIGN_TO_SELF',
    REPLY: 'HELPDESK_REPLY_TO_CUSTOMER',
    FOLLOW_UP: 'HELPDESK_FOLLOWUP'
  },
  entityCategory: {
    CUSTOMER: 'CUSTOMER',
    SERVICE: 'SERVICE',
    PROFILE: 'PROFILE',
    USER: 'USER',
    INTERACTION: 'INTERACTION',
    ACCOUNT: 'ACCOUNT',
    ORDER: 'ORDER'
  }
}

export const DEFAULT_LOCALE = 'en'
