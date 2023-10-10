module.exports = function (sequelize, DataType) {
  const InteractionTxn = sequelize.define('InteractionTxn', {
    intxnTxnId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    intxnTxnNo: {
      type: DataType.STRING
    },
    intxnId: {
      type: DataType.INTEGER
    },
    intxnTxnStatus: {
      type: DataType.STRING
    },
    intxnFlow: {
      type: DataType.STRING
    },
    fromEntityId: {
      type: DataType.STRING
    },
    fromRoleId: {
      type: DataType.INTEGER
    },
    fromUserId: {
      type: DataType.INTEGER
    },
    toEntityId: {
      type: DataType.STRING
    },
    toRoleId: {
      type: DataType.INTEGER
    },
    toUserId: {
      type: DataType.INTEGER
    },
    intxnCreatedDate: {
      type: DataType.DATE
    },
    intxnCreatedBy: {
      type: DataType.INTEGER
    },
    intxnType: {
      type: DataType.STRING
    },
    serviceCategory: {
      type: DataType.STRING
    },
    serviceType: {
      type: DataType.STRING
    },
    intxnPriority: {
      type: DataType.STRING
    },
    intxnChannel: {
      type: DataType.STRING
    },
    intxnTxnSlaCode: {
      type: DataType.STRING
    },
    intxnTxnEdoc: {
      type: DataType.DATE
    },
    slaLastAlertDate: {
      type: DataType.DATE
    },
    contactPreference: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('contactPreference')) : this.getDataValue('contactPreference')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('contactPreference', JSON.stringify(value)) : this.setDataValue('contactPreference', value)
      }
    },
    isFollowup: {
      type: DataType.STRING
    },
    remarks: {
      type: DataType.STRING
    },
    tranId: {
      type: DataType.STRING
    },
    intxnUuid: {
      type: DataType.STRING
    },
    intxnTxnUuid: {
      type: DataType.STRING
    },
    createdBy: {
      type: DataType.INTEGER,
      references: {
        model: 'User',
        key: 'code'
      }
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
    tableName: 'interaction_txn'
  }
  )

  InteractionTxn.associate = function (models) {
    // models.InteractionTxn.belongsTo(models.BusinessUnit, {
    //   foreignKey: 'fromEntityId',
    //   as: 'fromEntityName'
    // })
    // models.InteractionTxn.belongsTo(models.User, {
    //   foreignKey: 'fromUserId',
    //   as: 'fromUserName'
    // })
    // models.InteractionTxn.belongsTo(models.Role, {
    //   foreignKey: 'fromRoleId',
    //   as: 'fromRoleName'
    // })
    // models.InteractionTxn.belongsTo(models.BusinessUnit, {
    //   foreignKey: 'toEntityId',
    //   as: 'toEntityName'
    // })
    // models.InteractionTxn.belongsTo(models.Role, {
    //   foreignKey: 'toRoleId',
    //   as: 'toRoleName'
    // })
    // models.InteractionTxn.belongsTo(models.User, {
    //   foreignKey: 'toUserId',
    //   as: 'toUserName'
    // })
    // models.InteractionTxn.belongsTo(models.User, {
    //   foreignKey: 'intxnCreatedBy',
    //   as: 'flwCreatedby'
    // })
    // models.InteractionTxn.belongsTo(models.BusinessEntity, {
    //   foreignKey: 'intxnTxnStatus',
    //   as: 'statusDescription'
    // })
    // models.InteractionTxn.belongsTo(models.BusinessEntity, {
    //   foreignKey: 'intxnPriority',
    //   as: 'priorityCodeDesc'
    // })
    // models.InteractionTxn.belongsTo(models.BusinessEntity, {
    //   foreignKey: 'intxnChannel',
    //   as: 'channelDesc'
    // })
    // models.InteractionTxn.belongsTo(models.BusinessEntity, {
    //   foreignKey: 'intxnFlow',
    //   as: 'flowActionDesc'
    // })
    // models.InteractionTxn.hasOne(models.Interaction, {
    //   sourceKey: 'intxnId',
    //   foreignKey: 'intxnId',
    //   as: 'intxnDetails'
    // })
  }
  return InteractionTxn
}
