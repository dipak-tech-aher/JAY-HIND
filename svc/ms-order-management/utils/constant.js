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
  ORDER: 'ORDER',
  APPOINTMENT: 'APPOINTMENT'
}

export const orderFlowAction = {
  CREATED: 'ORDER_NEW',
  FOLLOWUP: 'ORDER_FOLLOWUP',
  ASSIGN: 'ODR_ASSIGN_TO_SELF',
  REASSIGN: 'ORDER_REASSIGN',
  UPDATE: 'ORDER_UPDATED',
  CANCEL: 'ORDER_CANCEL'
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

export const orderType = {
  signUp: 'OT_SU',
  upgrade: 'OT_UGD',
  downgrade: 'OT_DWNG',
  terminate: 'OT_SO'
}

export const constantCode = {
  status: {
    ACTIVE: 'AC',
    IN_ACTIVE: 'IN',
    PENDING: 'SS_PEND',
    TEMPORARY: 'TEMP',
    NEW: 'NEWORD',
    ASSIGNED: 'ASSIGNED',
    CLOSED: 'CLS',
    CANCELLED: 'CNCLED',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    CREATED: 'CREATED',
    DONE: 'DONE',
    USER_WAIT: 'USER_WAIT',
    INPROCESS: 'INP'
  },
  common: {
    YES: 'Y',
    NO: 'N',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    lIMIT: 10,
    PAGE: 0,
    PASSWORD_LENGTH: 8,
    MANUAL: 'MANUAL',
    TASK: 'TASK',
    POPUP: 'POPUP'
  },
  customerStatus: {
    ACTIVE: 'CS_ACTIVE',
    IN_ACTIVE: 'CS_INACTIVE',
    SUSPENDED: 'CS_SUSP',
    PENDING: 'CS_PEND',
    PROSPECT: 'CS_PROSPECT',
    TEMP: 'CS_TEMP'
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
  contractStatus: {
    CLOSED: 'CONTR_ST_CLOSED',
    OPEN: 'CONTR_ST_OPEN',
    UNBILLED: 'CONTR_ST_UB',
    BILLED: 'CONTR_ST_BILLED'
  },
  businessEntityCodeType: {
    ORD_STATUS_REASON: 'ORD_STATUS_REASON'
  }
}

export const DEFAULT_LOCALE = 'en'

export const productFields = ['productQuantity', 'billAmount', 'productAddedDate', 'edof', 'productRefNo', 'productSerialNo']
