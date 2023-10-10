module.exports = function (sequelize, DataType) {
  const WhatsAppChatHistory = sequelize.define('WhatsAppChatHistory', {
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    reportId: {
      type: DataType.INTEGER
    },
    msgFrom: {
      type: DataType.STRING
    },
    msgTo: {
      type: DataType.STRING
    },
    message: {
      type: DataType.STRING
    },
    msgSource: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING,
      defaultValue: 'AC'
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
    tranId: {
      type: DataType.STRING
    },
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'whatsapp_chat_history'
  }
  )

  WhatsAppChatHistory.associate = function (models) {
    models.WhatsAppChatHistory.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.WhatsAppChatHistory.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    models.WhatsAppChatHistory.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
  }
  return WhatsAppChatHistory
}
