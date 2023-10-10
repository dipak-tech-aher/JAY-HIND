export const config = {
  systemUserId: process.env.SYSTEM_USER_ID,
  secret: process.env.APP_SECRET,
  algorithm: process.env.ENCRYPTION_ALGORITH,
  hashAlgorithm: process.env.HASH_ALGORITHM,
  iv: process.env.IV,
  domainURL: process.env.DOMAIN_URL,
  dbProperties: {
    database: process.env.DB_DATABASE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    port: process.env.DB_PORT,
    schema: process.env.DB_SCHEMA,
    dialectOptions: {
      statement_timeout: 120000,
      idle_in_transaction_session_timeout: 150000,
      useUTC: false
    }
  },
  bcae: {
    host: process.env.SERVICE_HOST,
    port: process.env.BULKUPLOAD_SERVICE_PORT
  },
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: process.env.KAFKA_BROKERS.split(','),
    userGroup: 'plan_group',
    userTopic: 'plan_topic'
  }
}
