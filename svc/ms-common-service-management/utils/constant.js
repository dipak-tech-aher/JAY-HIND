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
    ACTIVE: 'AC',
    IN_ACTIVE: 'IN',
    PENDING: 'PENDING',
    TEMPORARY: 'TEMP'
  },
  common: {
    YES: 'Y',
    NO: 'N',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    lIMIT: 10,
    PAGE: 0,
    PASSWORD_LENGTH: 8,
    AZURE_CREDENTIALS: 'AZURE',
    DATEDESC: 'DATE_DESC',
    DATEASC: 'DATE_ASC'
  },
  template:{
    ACTIVE: 'TPL_ACTIVE',
    INACTIVE: 'TPL_INACTIVE',
  }
}

export const entityCategory = {
  CUSTOMER: 'CUSTOMER',
  SERVICE: 'SERVICE',
  PROFILE: 'PROFILE',
  USER: 'USER',
  INTERACTION: 'INTERACTION',
  ACCOUNT: 'ACCOUNT',
  ORDER: 'ORDER',
  ENTITY_CATEGORY: 'ENTITY_CATEGORY'
}

export const defaultStatus = {
  requestStatus: {
    PENDING: 'REQ_PENDING',
    APPROVED: 'REQ_APPROVED',
    CANCELLED: 'REQ_CANCELLED',
    REJECTED: 'REQ_REJECTED'
  },
  ACTIVE: 'AC',
  IN_ACTIVE: 'IN',
  PENDING: 'PENDING',
  TEMPORARY: 'TEMP',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CREATED: 'CREATED',
  DONE: 'DONE',
  USER_WAIT: 'USER_WAIT',
  NEW: 'NEW',
  ASSIGNED: 'ASSIGNED',
  CLOSED: 'CLOSED',
  CANCELLED: 'CANCELLED',
  HELPDESK_CLOSED: 'HS_CLS',
  HELPDESK_ESCALATED: 'HS_ESCALATED',
  INPROCESS: 'INP',
  SCHEDULED: 'AS_SCHED',
  TPLACTIVE: 'TPL_ACTIVE'
}

export const DEFAULT_LOCALE = 'en'

export const addressFields = [
  'addressType', 'isPrimary', 'address1', 'address2', 'address3', 'addrZone', 'city', 'district',
  'state', 'postcode', 'country', 'latitude', 'longitude'
];

export const customerFields = [
  'firstName', 'lastName', 'gender', 'birthDate', 'occupation', 'nationality', 'idType', 'idValue'
];

export const contactFields = [
  'contactType', 'isPrimary', 'title', 'firstName', 'lastName', 'emailId', 'mobilePrefix', 'mobileNo', 'telephonePrefix',
  'telephoneNo', 'whatsappNoPrefix', 'whatsappNo', 'fax', 'facebookId', 'instagramId', 'telegramId', 
  'secondaryEmail', 'secondaryContactNo'
];
