import { config as envConfig } from '@config/env.config'
const Sequelize = require('sequelize')
const fs = require('fs')
const path = require('path')

const { dbProperties } = envConfig
const { database, username, password, dialect, host, port, schema } = dbProperties
const basename = path.basename(__filename)

Sequelize.DATE.prototype._stringify = function _stringify (date, options) {
  return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS')
}

const config = {
  database,
  schema,
  username,
  password,
  host,
  port,
  dialect,
  pool: {
    max: 25,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
}

const sequelizeConn = (config) => {
  const sequelize = new Sequelize(config)
  console.log('*******************************')
  console.log(`connect to database ${config.database} established`)
  console.log('*******************************')
  const db = {}

  db.Sequelize = Sequelize
  db.sequelize = sequelize

  fs
    .readdirSync(__dirname)
    .filter(file => {
      return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js')
    })
    .forEach(file => {
      const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
      db[model.name] = model
    })

  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db)
    }
  })

  return db
}

const db = sequelizeConn(config)

module.exports = { db, config, sequelizeConn }
