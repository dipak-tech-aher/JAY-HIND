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
  INSIGHTS: 'INSIGHTS',
  POPUP: 'POPUP',
  EMAIL: 'EMAIL'
}

export const businessEntity = {
  CHANNEL: 'TICKET_CHANNEL'
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

export const DEFAULT_LOCALE = 'en'

export const customerInteractionEmoji = [{
  code: 'OT_SU',
  emoji: 'smiley',
  symbol: '😃',
  name: 'HAHA',
  percentage: '5'
}, {
  code: 'GRIEVANCE',
  emoji: 'rage',
  symbol: '😡',
  name: 'ANGRY',
  percentage: '1'
}, {
  code: 'REQUEST',
  emoji: 'neutral_face',
  symbol: '😐',
  name: 'NEUTRAL',
  percentage: '2.5'
}, {
  code: 'PURCHASE',
  symbol: '😃',
  name: 'HAHA',
  emoji: 'smiley',
  percentage: '5'
}, {
  code: 'GENERAL',
  symbol: '😐',
  name: 'NEUTRAL',
  emoji: 'neutral_face',
  percentage: '2.5'
}, {
  code: 'APPEALS',
  symbol: '😟',
  name: 'SAD',
  emoji: 'worried',
  percentage: '1.5'
}, {
  code: 'RECOMMENDATION',
  symbol: '😐',
  name: 'NEUTRAL',
  emoji: 'neutral_face',
  percentage: '2.5'
}, {
  code: 'INTEREST',
  symbol: '😃',
  name: 'HAHA',
  emoji: 'smiley',
  percentage: '5'
}, {
  code: 'SUGGESTION',
  symbol: '😐',
  name: 'NEUTRAL',
  emoji: 'neutral_face',
  percentage: '2.5'
}]
