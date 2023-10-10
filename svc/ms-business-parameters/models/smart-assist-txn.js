module.exports = function (sequelize, DataType) {
  const smartAssist = sequelize.define('smartAssist', {
    smartAssistTxnId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    smartAssistConversationId: {
      type: DataType.STRING
    },
    seqNo: {
      type: DataType.INTEGER
    },
    smartAssistType: {
      type: DataType.STRING
    },
    conversationActionType: {
      type: DataType.STRING
    },
    smartAssistValue: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? this.getDataValue('smartAssistValue') ? JSON.parse(this.getDataValue('smartAssistValue')) : this.getDataValue('smartAssistValue') : this.getDataValue('smartAssistValue')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('smartAssistValue', JSON.stringify(value)) : this.setDataValue('smartAssistValue', value)
      }
    },
    smartAssistTxnUuid: {
      type: DataType.STRING
    },
    tranId: {
      type: DataType.STRING
    },
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.INTEGER
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
    tableName: 'bcae_smart_assist_txn'
  }
  )
  return smartAssist
}
