export const config = {
  secret: process.env.APP_SECRET,
  algorithm: process.env.ENCRYPTION_ALGORITH,
  hashAlgorithm: process.env.HASH_ALGORITHM,
  domainURL: process.env.DOMAIN_URL,
  systemUserId: process.env.SYSTEM_USER_ID,
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
      statement_timeout: 5000,
      idle_in_transaction_session_timeout: 10000,
      useUTC: false
    }
  },
  bcae: {
    host: process.env.SERVICE_HOST,
    port: process.env.ORG_SERVICE_PORT
  },
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: process.env.KAFKA_BROKERS.split(','),
    groupId: 'organization_group',
    user_register: 'organization_topic'
  }
}
