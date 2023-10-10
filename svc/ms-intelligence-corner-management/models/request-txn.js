module.exports = function (sequelize, DataType) {
  const RequestTxn = sequelize.define('RequestTxn', {
    requestTxnId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    requestTxnNo: {
      type: DataType.STRING
    },
    requestId: {
      type: DataType.INTEGER
    },
    requestTxnStatus: {
      type: DataType.STRING
    },
    requestFlow: {
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
    requestCreatedDate: {
      type: DataType.DATE
    },
    requestCreatedBy: {
      type: DataType.INTEGER
    },
    requestType: {
      type: DataType.STRING
    },
    serviceCategory: {
      type: DataType.STRING
    },
    serviceType: {
      type: DataType.STRING
    },
    // requestCause: {
    //   type: DataType.STRING
    // },
    requestPriority: {
      type: DataType.STRING
    },
    requestChannel: {
      type: DataType.STRING
    },
    requestTxnSlaCode: {
      type: DataType.STRING
    },
    requestTxnEdoc: {
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
    tranId: {
      type: DataType.STRING
    },
    requestUuid: {
      type: DataType.STRING
    },
    requestTxnUuid: {
      type: DataType.STRING
    },
    requestTxnStatusReason: {
      type: DataType.STRING
    },
    // requestCategory: {
    //   type: DataType.STRING
    // },
    remarks: {
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
    tableName: 'request_txn'
  }
  )

  RequestTxn.associate = function (models) {
    models.RequestTxn.belongsTo(models.BusinessUnit, {
      foreignKey: 'fromEntityId',
      as: 'fromEntityName'
    })
    models.RequestTxn.belongsTo(models.User, {
      foreignKey: 'fromUserId',
      as: 'fromUserName'
    })
    models.RequestTxn.belongsTo(models.Role, {
      foreignKey: 'fromRoleId',
      as: 'fromRoleName'
    })
    models.RequestTxn.belongsTo(models.BusinessUnit, {
      foreignKey: 'toEntityId',
      as: 'toEntityName'
    })
    models.RequestTxn.belongsTo(models.Role, {
      foreignKey: 'toRoleId',
      as: 'toRoleName'
    })
    models.RequestTxn.belongsTo(models.User, {
      foreignKey: 'toUserId',
      as: 'toUserName'
    })
    models.RequestTxn.belongsTo(models.User, {
      foreignKey: 'requestCreatedBy',
      as: 'flwCreatedby'
    })
    models.RequestTxn.belongsTo(models.BusinessEntity, {
      foreignKey: 'requestTxnStatus',
      as: 'statusDescription'
    })
    models.RequestTxn.belongsTo(models.BusinessEntity, {
      foreignKey: 'requestPriority',
      as: 'priorityCodeDesc'
    })
    models.RequestTxn.belongsTo(models.BusinessEntity, {
      foreignKey: 'requestChannel',
      as: 'channelDesc'
    })
    models.RequestTxn.belongsTo(models.BusinessEntity, {
      foreignKey: 'requestFlow',
      as: 'flowActionDesc'
    })
  }
  return RequestTxn
}
