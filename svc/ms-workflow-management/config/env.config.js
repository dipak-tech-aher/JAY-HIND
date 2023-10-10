export const config = {
  systemUserId: process.env.SYSTEM_USER_ID,
  secret: process.env.APP_SECRET,
  algorithm: process.env.ENCRYPTION_ALGORITH,
  iv: process.env.IV,
  hashAlgorithm: process.env.HASH_ALGORITHM,
  systemRoleId: process.env.SYSTEM_ROLE_ID,
  systemDeptId: process.env.SYSTEM_DEPT_ID,
  tenantId: process.env.DB_TENANT_ID || 'a89d6593-3aa8-437b-9629-9fcbaa201da8',
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
    port: process.env.WORKFLOW_SERVICE_PORT
  },
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: process.env.KAFKA_BROKERS.split(','),
    userGroup: 'workflow_group',
    userTopic: 'workflow_topic'
  }
}
