export const config = {
  secret: process.env.APP_SECRET,
  algorithm: process.env.ENCRYPTION_ALGORITH,
  hashAlgorithm: process.env.HASH_ALGORITHM,
  domainURL: process.env.DOMAIN_URL,
  systemUserId: process.env.SYSTEM_USER_ID,
  systemRoleId: process.env.SYSTEM_ROLE_ID,
  sessionTimeOut: process.env.SESSION_TIMEOUT | 0,
  iv: process.env.IV,
  dbProperties: {
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
    schema: process.env.DB_SCHEMA,
    dialectOptions: {
      statement_timeout: 5000,
      idle_in_transaction_session_timeout: 10000,
      useUTC: false
    }
  },
  roleProperties: {
    role: {
      unitId: 36,
      unitName: 'Customer'
    },
    dept: {
      unitId: 'CUSTOMER_SERVICE_DEPARTMENT_.SERVICE_PROVIDER',
      unitName: 'Customer service Department'
    }
  },
  bcae: {
    host: process.env.SERVICE_HOST,
    port: process.env.REPORT_SERVICE_PORT
  },
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: process.env.KAFKA_BROKERS.split(','),
    userGroup: 'auth_group',
    userTopic: 'auth_topic'
  },
  bi: {
    endPoint: 'https://dtworks-ext.comquest-brunei.com:15443',
    login: '/api/v1/security/login',
    guestToken: '/api/v1/security/guest_token'
  }
}
