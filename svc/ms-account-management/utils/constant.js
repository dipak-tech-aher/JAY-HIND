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
  NEW: 'NEW',
  ACTIVE: 'AC',
  IN_ACTIVE: 'IN',
  PENDING: 'PENDING',
  TEMPORARY: 'TEMP',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
}
export const constantCode = {
  status: {
    ACTIVE: 'AC',
    IN_ACTIVE: 'IN',
    PENDING: 'PENDING',
    TEMPORARY: 'TEMP'
  },
  customerStatus: {
    ACTIVE: 'CS_ACTIVE',
    IN_ACTIVE: 'CS_INACTIVE',
    SUSPENDED: 'CS_SUSP',
    PENDING: 'CS_PEND',
    PROSPECT: 'CS_PROSPECT'
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
    PASSWORD_LENGTH: 8
  },
  businessEntity: {
    ACCOUNTCATEGORY: 'accountCategory'
  },

}

export const orderConstanst = {
  orderType: {
    SUSPENT: 'OT_SSP',
    CANCEL: 'OT_CNCL',
    SIGNOUT: 'SIGN_OUT',
    UPGRADE: 'OT_UGD',
    DOWNGRADE: 'OT_DWNG',
    SIGNUP: 'OT_SU',
    EXCHNAGE: 'OT_EXCNG',
    DEACTIVE: 'OT_DACTV',
    ACTIVATE: 'OT_ACTVT'
  },
  orderStatus: {
    CLOSED: 'CLS',
    CANCELLED: 'CNCLED',
    RETURN: 'RJTD'
  }
}

export const defaultCode = {
  YES: 'Y',
  NO: 'N',
  lIMIT: 10,
  PAGE: 0
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

export const accountFields = [
  'customerUuid', 'firstName', 'lastName', 'gender', 'accountType', 'accountClass', 'accountLevel',
  'expiryDate', 'registeredNo', 'registeredDate', 'notificationPreference', 'accountPriority', 'creditLimit',
  'accountBalance', 'accountOutstanding', 'accountStatusReason', 'currency', 'billLanguage'
]

export const contactFields = [
  'contactType', 'title', 'firstName', 'lastName', 'emailId', 'mobilePrefix', 'mobileNo', 'telephonePrefix',
  'telephoneNo', 'whatsappNoPrefix', 'whatsappNo', 'fax', 'facebookId', 'instagramId', 'telegramId',
  'secondaryEmail', 'secondaryContactNo'
]

export const serviceFields = [
  'serviceName', 'accountId', 'serviceCategory', 'serviceType', 'serviceClass', 'planPayload', 'serviceAgreement',
  'accountUuid', 'quantity', 'notificationPreference', 'prodBundleId', 'promoCode', 'contractMonths',
  'promoContractMonths', 'actualContractMonths', 'serviceLimit', 'promoServiceLimit', 'actualServiceLimit', 'productBenefit',
  'promoBenefit', 'actualProductBenefit', 'advanceCharge', 'upfrontCharge'
]
