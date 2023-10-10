module.exports = function (sequelize, DataType) {
  const BcaeAppConfig = sequelize.define('BcaeAppConfig', {
    configId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    status: {
      type: DataType.STRING
    },
    appButtonColor: {
      type: DataType.STRING
    },
    appBarColor: {
      type: DataType.STRING
    },
    appRosterFlag: {
      type: DataType.BOOLEAN
    },
    appUserManual: {
      type: DataType.TEXT
    },
    appLogo: {
      type: DataType.TEXT
    },
    appPwdExpiryDays: {
      type: DataType.INTEGER
    },
    appPwdExpiryNotifyDays: {
      type: DataType.INTEGER
    },
    maxRolesLimit: {
      type: DataType.INTEGER
    },
    maxEntityLimit: {
      type: DataType.INTEGER
    },
    maxUserLimit: {
      type: DataType.INTEGER
    },
    maxSessionTimeout: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('maxSessionTimeout')) : this.getDataValue('maxSessionTimeout')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('maxSessionTimeout', JSON.stringify(value)) : this.setDataValue('maxSessionTimeout', value)
      }
    },
    maxPasswordRetry: {
      type: DataType.INTEGER
    },
    appFaq: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('appFaq')) : this.getDataValue('appFaq')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('appFaq', JSON.stringify(value)) : this.setDataValue('appFaq', value)
      }
    },
    businessSetup: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('businessSetup')) : this.getDataValue('businessSetup')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('businessSetup', JSON.stringify(value)) : this.setDataValue('businessSetup', value)
      }
    },
    userLimitPayload: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('userLimitPayload')) : this.getDataValue('userLimitPayload')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('userLimitPayload', JSON.stringify(value)) : this.setDataValue('userLimitPayload', value)
      }
    },
    moduleSetupPayload: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('moduleSetupPayload')) : this.getDataValue('moduleSetupPayload')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('moduleSetupPayload', JSON.stringify(value)) : this.setDataValue('moduleSetupPayload', value)
      }
    },
    channelSetupPayload: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('channelSetupPayload')) : this.getDataValue('channelSetupPayload')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('channelSetupPayload', JSON.stringify(value)) : this.setDataValue('channelSetupPayload', value)
      }
    },
    multiLangSetupPayload: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('multiLangSetupPayload')) : this.getDataValue('multiLangSetupPayload')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('multiLangSetupPayload', JSON.stringify(value)) : this.setDataValue('multiLangSetupPayload', value)
      }
    },
    portalSetupPayload: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('portalSetupPayload')) : this.getDataValue('portalSetupPayload')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('portalSetupPayload', JSON.stringify(value)) : this.setDataValue('portalSetupPayload', value)
      }
    },
    appointChannelSetupPayload: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('appointChannelSetupPayload')) : this.getDataValue('appointChannelSetupPayload')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('appointChannelSetupPayload', JSON.stringify(value)) : this.setDataValue('appointChannelSetupPayload', value)
      }
    },
    notificationSetupPayload: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('notificationSetupPayload')) : this.getDataValue('notificationSetupPayload')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('notificationSetupPayload', JSON.stringify(value)) : this.setDataValue('notificationSetupPayload', value)
      }
    },
    otpExpirationDuration: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('otpExpirationDuration')) : this.getDataValue('otpExpirationDuration')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('otpExpirationDuration', JSON.stringify(value)) : this.setDataValue('otpExpirationDuration', value)
      }
    },
    requestCycleSetupPayload: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('requestCycleSetupPayload')) : this.getDataValue('requestCycleSetupPayload')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('requestCycleSetupPayload', JSON.stringify(value)) : this.setDataValue('requestCycleSetupPayload', value)
      }
    },
    clientConfig: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('clientConfig')) : this.getDataValue('clientConfig')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('clientConfig', JSON.stringify(value)) : this.setDataValue('clientConfig', value)
      }
    },
    storageSetupPayload: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('storageSetupPayload')) : this.getDataValue('storageSetupPayload')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('storageSetupPayload', JSON.stringify(value)) : this.setDataValue('storageSetupPayload', value)
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
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'bcae_app_config'
  })
  BcaeAppConfig.associate = function (models) {
  }
  return BcaeAppConfig
}
