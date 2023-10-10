const { getNamespace } = require('continuation-local-storage')
const { db, config, sequelizeConn } = require('@models')

let tenantMapping

const getConfig = (tenant) => {
  const {
    db_host: host,
    db_port: port,
    db_username: username, // optional, if we go for multiple schema possibilities
    db_name: database, // optional, if we go for multiple schema possibilities
    db_password: password, // optional, if we go for multiple schema possibilities
    schema
  } = tenant

  return {
    ...config,
    host,
    port,
    database,
    username,
    password,
    schema,
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

const getConnection = () => getNamespace('tenants').get('connection') || null

const bootstrap = async () => {
  try {
    const tenants = await db.tenants.findAll()

    tenantMapping = tenants.map((tenant) => ({
      uuid: tenant.uuid,
      connection: sequelizeConn(getConfig(tenant))
    }))
  } catch (error) {
    console.error(error)
  }
}

const getTenantConnection = (uuid) => {
  const tenant = tenantMapping.find((tenant) => tenant.uuid === uuid)

  if (!tenant) return null

  return tenant.connection
}

module.exports = { bootstrap, getTenantConnection, getConnection }
