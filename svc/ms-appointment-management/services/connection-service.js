const { getNamespace } = require('continuation-local-storage')
const { db, config, sequelizeConn } = require('@models')
const CryptoJS = require('crypto-js')

let tenantMapping

const getConfig = (tenant) => {
  const {
    db_host: host, // optional, if we go for multiple schema possibilities
    db_port: port, // optional, if we go for multiple schema possibilities
    db_username: username, // optional, if we go for multiple schema possibilities
    db_name: database, // optional, if we go for multiple schema possibilities
    db_pwd: password, // optional, if we go for multiple schema possibilities
    db_schema_nm: schema // optional, if we go for multiple schema possibilities
  } = tenant

  return {
    ...config,
    host,
    port,
    database,
    username,
    password,
    schema,
    logging: false,
    dialectOptions: {   
      clientMinMessages: 'ignore', 
      keepDefaultTimezone: true
     },
    pool: {
      max: 50,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
}

const getConnection = () => getNamespace('tenants').get('connection')

const bootstrap = async () => {
  try {
    const tenants = await db.TenantDtl.findAll()
    tenantMapping = tenants.map((tenant) => {
      tenant.db_pwd = CryptoJS.AES.decrypt(tenant.db_pwd, tenant.uuid)
      tenant.db_pwd = tenant.db_pwd.toString(CryptoJS.enc.Utf8)
      return {
        uuid: tenant.uuid,
        connection: sequelizeConn(getConfig(tenant))
      }
    })
  } catch (error) {
    console.error(error, 'from bootstrap')
  }
}

const getTenantConnection = (uuid) => {
  const tenant = tenantMapping.find((tenant) => tenant.uuid === uuid)

  if (!tenant) return null

  return tenant.connection
}

module.exports = { bootstrap, getTenantConnection, getConnection }
