module.exports = function (sequelize, DataType) {
  return sequelize.define('tenants', {
    uuid: {
      type: DataType.UUID(),
      primaryKey: true
    },
    db_host: {
      type: DataType.STRING
    },
    db_port: {
      type: DataType.STRING
    },
    db_name: {
      type: DataType.STRING
    },
    db_username: {
      type: DataType.STRING
    },
    db_password: {
      type: DataType.STRING
    },
    schema: {
      type: DataType.STRING
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'tenants'
  })
}
