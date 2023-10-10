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
export const defaultStatus = {
  requestStatus: {
    PENDING: 'REQ_PENDING',
    APPROVED: 'REQ_APPROVED',
    CANCELLED: 'REQ_CANCELLED'
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
  SCHEDULED: 'AS_SCHED'
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
  NO_CONTENT: 'No content found',
  FAILED:'FAILED'
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
    PASSWORD_LENGTH: 8
  }
}

export const customerStatus = {
  ACTIVE: 'CS_ACTIVE',
  IN_ACTIVE: 'CS_INACTIVE',
  PENDING: 'CS_PEND',
  TEMPORARY: 'CS_TEMP',
  PROSPECT: 'CS_PROSPECT',
  SUSPENDED: 'CS_SUSP'
}

export const serviceStatus = {
  ACTIVE: 'SS_AC',
  IN_ACTIVE: 'SS_IN',
  SUSPENDED: 'SS_SUS',
  TEMPORARY: 'SS_TEMP',
  TEMPORARY_OUT_OF_SERVICE: 'SS_TOS',
  PROSPECT: 'SS_PROSPECT',
  PENDING: 'SS_PEND'
}

export const defaultCode = {
  YES: 'Y',
  NO: 'N',
  lIMIT: 10,
  PAGE: 0,
  RESOLVED_BY_BOT: 'IRB_BOT',
  RESOLVED_BY_MANUAL: 'IRB_MANUAL',
  MANUAL: 'MANUAL',
  TASK: 'TASK',
  INTERACTION_LIMIT: 10,
  ROWS: 'ROWS',
  COUNT: 'COUNTS',
  INSIGHTS_COUNT: 'INSIGHTS_COUNT',
  INSIGHTS: 'INSIGHTS'
}


export const interactionFlowAction = {
  CREATED: 'INTXN_NEW',
  FOLLOWUP: 'INTXN_FOLLOWUP',
  ASSIGN: 'INTXN_ASSIGN_TO_SELF',
  REASSIGN: 'INTXN_REASSIGN',
  UPDATE: 'INTXN_UPDATED',
  CANCEL: 'INTXN_CANCEL',
  HELPDESK_UPDATE: 'HELPDESK_UPDATE'
}
export const DEFAULT_LOCALE = 'en'

export const USER_ACC_PWD_EXP_DAYS = 'user_acc_pwd_exp_days';
export const USER_ACC_PWD_EXP_REMINDER = 'user_acc_pwd_exp_reminder';
export const USER_PASSWORD_EXPIRED = 'user_password_expired';