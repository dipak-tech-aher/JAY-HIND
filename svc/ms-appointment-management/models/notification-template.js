module.exports = function (sequelize, DataType) {
  const NotificationTemplate = sequelize.define('NotificationTemplate', {
    templateId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    locale: {
      type: DataType.STRING,
      defaultValue: 'EN'
    },
    templateType: {
      type: DataType.STRING
    },
    templateName: {
      type: DataType.STRING
    },
    subject: {
      type: DataType.STRING
    },
    body: {
      type: DataType.TEXT
    },
    templateStatus: {
      type: DataType.STRING,
      defaultValue: 'ACTIVE',
      references: {
        model: 'BusinessEntity',
        key: 'code'
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
    },
    mappingPayload: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('mappingPayload')) : this.getDataValue('mappingPayload')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('mappingPayload', JSON.stringify(value)) : this.setDataValue('mappingPayload', value)
      }
    },
    dataSource: {
      type: DataType.STRING
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'meta_notification_template'
  })
  NotificationTemplate.associate = function (models) {
    models.NotificationTemplate.belongsTo(models.BusinessEntity, {
      foreignKey: 'templateStatus',
      as: 'statusDesc'
    })
    models.NotificationTemplate.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.NotificationTemplate.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
  }
  return NotificationTemplate
}
