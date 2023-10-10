module.exports = function (sequelize, DataType) {
  const MetaBusinessConfig = sequelize.define('MetaBusinessConfig', {
    configId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    configCode: {
      type: DataType.STRING
    },
    configName: {
      type: DataType.STRING
    },
    configValue: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    createdAt: {
      type: DataType.DATE
    },
    createdBy: {
      type: DataType.BIGINT
    },
    modifiedAt: {
      type: DataType.DATE
    },
    modifiedBy: {
      type: DataType.BIGINT
    }
  }, {
    tableName: 'meta_business_config',
    timestamps: true,
    underscored: true
  })

  return MetaBusinessConfig
}
