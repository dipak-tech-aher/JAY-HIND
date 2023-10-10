module.exports = function (sequelize, DataType) {
  const PortalSetting = sequelize.define('PortalSetting', {
    settingId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    settingType: {
      type: DataType.STRING
    },
    mappingPayload: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? this.getDataValue('mappingPayload') ? JSON.parse(this.getDataValue('mappingPayload')) : this.getDataValue('mappingPayload') : this.getDataValue('mappingPayload')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('mappingPayload', JSON.stringify(value)) : this.setDataValue('mappingPayload', value)
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
    tableName: 'meta_portal_settings'
  })

  PortalSetting.associate = function (models) {
    models.PortalSetting.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.PortalSetting.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
  }
  return PortalSetting
}
