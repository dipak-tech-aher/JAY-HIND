export const config = {
  secret: process.env.APP_SECRET,
  algorithm: process.env.ENCRYPTION_ALGORITH,
  hashAlgorithm: process.env.HASH_ALGORITHM,
  domainURL: process.env.DOMAIN_URL,
  systemUserId: process.env.SYSTEM_USER_ID,
  sessionTimeOut: process.env.SESSION_TIMEOUT,
  iv: process.env.IV,
  dbProperties: {
    database: process.env.POSTGRES_DATABASE,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    dialect: process.env.DATABASE_DIALECT,
    port: process.env.DATABASE_PORT,
    dialectOptions: {
      statement_timeout: 5000
    }
  },
  bcae: {
    host: process.env.SERVICE_HOST,
    port: process.env.SERVICE_PORT
  },
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: process.env.KAFKA_BROKERS.split(','),
    userGroup: 'user_group',
    userTopic: 'user_topic'
  }
}
