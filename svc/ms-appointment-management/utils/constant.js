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
  ASSIGNED: 'ASSIGNED',
  TPLACTIVE: 'TPL_ACTIVE'
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
    COMPLETED: 'AS_COMP',
    CANCELLED: 'AS_CANCEL',
    RESCHEDULED: 'AS_RESCH',
    SCHEDULED: 'AS_SCHED',
    SUCCESSFULLY_CLOSED: 'AS_COMP_SUCCESS',
    UNSUCCESSFULLY_CLOSED: 'AS_COMP_UNSUCCESS'
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

export const orderStatus = {
  CLOSED: 'CLS'
}

export const interactionStatus = {
  CLOSED: 'CLOSED'
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
  'addressType', 'address1', 'address2', 'address3', 'addrZone', 'city', 'district',
  'state', 'postcode', 'country', 'latitude', 'longitude'
]

export const customerFields = [
  'firstName', 'lastName', 'gender', 'birthDate', 'occupation', 'nationality', 'idType', 'idValue'
]

export const contactFields = [
  'contactType', 'title', 'firstName', 'lastName', 'emailId', 'mobilePrefix', 'mobileNo', 'telephonePrefix',
  'telephoneNo', 'whatsappNoPrefix', 'whatsappNo', 'fax', 'facebookId', 'instagramId', 'telegramId',
  'secondaryEmail', 'secondaryContactNo'
]


export const POSITIVE_INTXN_TYPES = [
	"INTEREST", "PURCHASE"
]

export const NEGATIVE_INTXN_TYPES = [
	"APPEALS", "GRIEVANCE"
]

export const NEUTRAL_INTXN_TYPES = [
	"GENERAL", "SUGGESTION", "RECOMMENDATION", "REQUEST"
]
