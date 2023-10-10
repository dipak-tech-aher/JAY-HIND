export const config = {
  systemUserId: process.env.SYSTEM_USER_ID,
  systemDeptId: process.env.SYSTEM_DEPT_ID,
  systemRoleId: process.env.SYSTEM_ROLE_ID,
  secret: process.env.APP_SECRET,
  algorithm: process.env.ENCRYPTION_ALGORITH,
  iv: process.env.IV,
  tenantId: process.env.DB_TENANT_ID,
  hashAlgorithm: process.env.HASH_ALGORITHM,
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
  bcae: {
    host: process.env.SERVICE_HOST,
    port: process.env.HELPDESK_SERVICE_PORT
  },
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: process.env.KAFKA_BROKERS.split(','),
    helpdeskGroup: 'helpdesk_group',
    helpdeskTopic: 'helpdesk_topic'
  }
}
