module.exports = function (sequelize, DataType) {
  const AppConfig = sequelize.define('AppConfig', {
    appId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    appName: {
      type: DataType.STRING
    },
    image: {
      type: DataType.TEXT
    },
    config: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('config')) : this.getDataValue('config')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('config', JSON.stringify(value)) : this.setDataValue('config', value)
      }
    },
    createdBy: {
      type: DataType.INTEGER
    },
    createdAt: {
      type: DataType.DATE
    },
    updatedBy: {
      type: DataType.INTEGER
    },
    updatedAt: {
      type: DataType.DATE
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'meta_app_config'
  })

  AppConfig.associate = function (models) { }
  return AppConfig
}
