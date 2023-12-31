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
  interaction: {
    status: {
      CLOSED: 'CLOSED'
    }
  },
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
    PAGE: 0
  },
  workflow: {
    hdr: {
      status: {
        CREATE: 'CREATED',
        DONE: 'DONE'
      }
    },
    txn: {
      status: {
        USERWAIT: 'USER_WAIT',
        DONE: 'DONE'
      }
    },
    task: {
      name: 'TASK',
      type: {
        MANUAL: 'MANUAL'
      }
    }
  }
}

export const DEFAULT_LOCALE = 'en'
