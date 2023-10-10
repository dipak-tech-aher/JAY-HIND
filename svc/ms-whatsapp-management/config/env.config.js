export const config = {
  secret: process.env.APP_SECRET,
  algorithm: process.env.ENCRYPTION_ALGORITH,
  hashAlgorithm: process.env.HASH_ALGORITHM,
  domainURL: process.env.DOMAIN_URL,
  systemDeptId: process.env.SYSTEM_DEPT_ID,
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
      statement_timeout: 1000,
      idle_in_transaction_session_timeout: 5000,
      useUTC: false
    }
  },
  bcae: {
    host: process.env.SERVICE_HOST,
    port: process.env.WHATSAPP_SERVICE_PORT,
    interactionPort: process.env.INTERACTION_SERVICE_PORT
  },
  kafka: {
    clientId: process.env.KAFKA_CLIENT_ID,
    brokers: process.env.KAFKA_BROKERS?.split(','),
    userGroup: 'user_group',
    userTopic: 'user_topic'
  },
  WHATSAPP: {
    WA_IHUB_VERIFY_TOKEN: process.env.WA_IHUB_VERIFY_TOKEN,
    WA_VERIFY_TOKEN: process.env.WA_VERIFY_TOKEN,

    FB_BASE_API_URL: process.env.FB_BASE_API_URL,

    WA_IHUB_TOKEN: process.env.WA_IHUB_TOKEN,
    WA_TOKEN: process.env.WA_TOKEN,

    WA_IHUB_NUMBER: process.env.WA_IHUB_NUMBER,
    WHATSAPP_NUMBER: process.env.WHATSAPP_NUMBER,

    WA_IHUB_PHONENUMBERID: process.env.WA_IHUB_PHONENUMBERID,
    WA_PHONENUMBERID: process.env.WA_PHONENUMBERID,

    WA_IHUB_WORKFLOW_ID: process.env.WA_IHUB_WORKFLOW_ID,//'42',
    WA_WORKFLOW_ID: process.env.WA_WORKFLOW_ID,//'47',
    WA_IHUB_VERSION: process.env.WA_IHUB_VERSION,//'v17.0',
    WA_VERSION: process.env.WA_VERSION,//'v16.0',
    ROLE_NAME: process.env.ROLE_NAME,//'BUSINESS-WHATSAPP',
    DEPARTMENT_NAME: process.env.DEPARTMENT_NAME//'BCAE DEPT'
  }
}
