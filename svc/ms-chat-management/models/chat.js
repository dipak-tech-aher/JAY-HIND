module.exports = function (sequelize, DataType) {
  const Chat = sequelize.define('Chat', {
    chatId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    helpdeskId: {
      type: DataType.INTEGER
    },
    socketId: {
      type: DataType.STRING
    },
    contactNo: {
      type: DataType.INTEGER
    },
    emailId: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING,
      defaultValue: 'NEW'
    },
    customerName: {
      type: DataType.STRING
    },
    startAt: {
      type: DataType.DATE
    },
    endAt: {
      type: DataType.DATE
    },
    customerCloseAt: {
      type: DataType.DATE
    },
    chatSource: {
      type: DataType.STRING
    },
    chatType: {
      type: DataType.STRING
    },
    category: {
      type: DataType.STRING
    },
    idValue: {
      type: DataType.STRING
    },
    accessNo: {
      type: DataType.STRING
    },
    customerInfo: {
      type: DataType.JSONB
    },  
    message: {
      type: DataType.JSONB
    },
    userId: {
      type: DataType.INTEGER
    },
    createdRoleId: {
      type: DataType.INTEGER
    },
    createdDeptId: {
      type: DataType.STRING
    },
    chatType: {
      type: DataType.STRING
    },
    createdAt: {
      type: DataType.DATE
    },
    updatedAt: {
      type: DataType.DATE
    },
    createdBy: {
      type: DataType.STRING
    },
    updatedBy: {
      type: DataType.STRING
    },
    botReq: {
      type: DataType.STRING
    },
    tranId: {
      type: DataType.STRING
    },
    remarks: {
      type: DataType.STRING
    },
    abandonedDate: {
      type: DataType.DATE
    },
    monitorId: {
      type: DataType.DATE
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'cc_chat'
  }
  )
  Chat.associate = function (models) {
    models.Chat.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    })
    models.Chat.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })

    models.Chat.belongsTo(models.BusinessEntity, {
      foreignKey: 'chatSource',
      as: 'chatSourceDesc'
    })
  }
  return Chat
}
