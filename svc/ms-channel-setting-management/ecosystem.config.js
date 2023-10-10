const ENV_VARIABLES = {
    APP_SECRET: "TybomcUDJmlkjK1bfZEBscyTFLZGnR2B",
    ENCRYPTION_ALGORITH: "aes256",
    DOMAIN_URL: "https://bcae-test.comquest-brunei.com:1443/bcae",

    // # ENCRYPTION TYPE
    HASH_ALGORITHM: "sha256",

    // # DATABASE CREDENTIALS
    DB_DATABASE: "bcae_tenant_catalog",
    DB_PORT: "5432",
    DB_HOST: "192.168.201.173",
    DB_USERNAME: "postgres",
    DB_PASSWORD: "postgres",
    DB_DIALECT: "postgres",
    DB_SCHEMA: "public",

    // # SERVICE CREDENTIALS
    SERVICE_HOST: "http://localhost",
    API_GATEWAY_SERVICE_PORT: "5000",
    USER_SERVICE_PORT: "4001",
    ORG_SERVICE_PORT: "4002",
    AUTH_SERVICE_PORT: "4003",
    BUSINESS_SERVICE_PORT: "4005",
    CUSTOMER_SERVICE_PORT: "4007",
    INTERACTION_SERVICE_PORT: "4006",
    ACCOUNT_SERVICE_PORT: "4008",
    SERVICES_SERVICE_PORT: "4009",
    INVOICE_SERVICE_PORT: "4010",
    DASH_SERVICE_PORT: "4020",
    WORKFLOW_SERVICE_PORT: "4012",
    COMMON_SERVICE_PORT: "4022",
    HELPDESK_SERVICE_PORT: "4013",
    PROFILE_SERVICE_PORT: "4014",
    APPOINTMENT_SERVICE_PORT: "4021",
    PRODUCT_SERVICE_PORT: "4023",
    ORDER_SERVICE_PORT: "4015",
    IC_SERVICE_PORT: "4017",
    BILLING_SERVICE_PORT: "4016",
    CONTRACT_SERVICE_PORT: "4011",
    REPORT_SERVICE_PORT: "4024",

    SYSTEM_USER_ID: "1",
    SYSTEM_ROLE_ID: "1",
    SYSTEM_DEPT_ID: "DEPT.OU.ORG",
    SESSION_TIMEOUT: "36000000",
    IV: "cxeF5YjtlyKZnLbZ",
    LOG_LEVEL: "debug",

    // # KAFKA DETAILS
    KAFKA_CLIENT_ID: "bcae-app",
    KAFKA_BROKERS: "localhost:9092",

    // # ID ANALYZER API KEY
    ID_ANALYZER_API_KEY: "x4pLmEzmUq928sKf6EkMvfTBlUxHe3cJ",
    ID_ANALYZER_API_SERVER: "US",

    // # ONEDRIVE BUCKET
    ONEDRIVE_BUCKET: "BCAE_2.0"
}
module.exports = {
    apps: [
        // {
        //     name: "BCAE - Common Services Management - Development",
        //     script: "./ms-common-service-management/start.js",
        //     watch: true,
        //     ignore_watch: ["node_modules"],
        //     env: ENV_VARIABLES
        // }
    ]
}