export const config = {
  secret: process.env.APP_SECRET,
  algorithm: process.env.ENCRYPTION_ALGORITH,
  hashAlgorithm: process.env.HASH_ALGORITHM,
  domainURL: process.env.DOMAIN_URL,
  systemUserId: process.env.SYSTEM_USER_ID,
  systemRoleId: process.env.SYSTEM_ROLE_ID,
  systemDeptId: process.env.SYSTEM_DEPT_ID,
  systemWebSelfCareRoleId: process.env.SYSTEM_WEB_SELFCARE_ROLE_ID,
  systemWebSelfCareDeptId: process.env.SYSTEM_WEB_SELFCARE_DEPT_ID,
  sessionTimeOut: process.env.SESSION_TIMEOUT,
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
      statement_timeout: 30000,
      idle_in_transaction_session_timeout: 60000,
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
    port: process.env.ORDER_SERVICE_PORT,
    gatewayPort: process.env.API_GATEWAY_SERVICE_PORT
  },
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: process.env.KAFKA_BROKERS.split(','),
    groupId: 'organization_group',
    user_register: 'organization_topic'
  }
}
