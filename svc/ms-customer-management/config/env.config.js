
export const config = {
  tenantId: process.env.DB_TENANT_ID,
  secret: process.env.APP_SECRET,
  algorithm: process.env.ENCRYPTION_ALGORITH,
  hashAlgorithm: process.env.HASH_ALGORITHM,
  domainURL: process.env.DOMAIN_URL,
  systemUserId: process.env.SYSTEM_USER_ID,
  systemRoleId: process.env.SYSTEM_ROLE_ID,
  systemDeptId: process.env.SYSTEM_DEPT_ID,
  sessionTimeOut: process.env.SESSION_TIMEOUT | 0,
  iv: process.env.IV,
  webSelfCareURL: process.env.WEB_SELF_CARE_URL,
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
    port: process.env.CUSTOMER_SERVICE_PORT,
    gatewayPort: process.env.API_GATEWAY_SERVICE_PORT
  },
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: process.env.KAFKA_BROKERS.split(','),
    userGroup: 'auth_group',
    userTopic: 'auth_topic'
  }
}
