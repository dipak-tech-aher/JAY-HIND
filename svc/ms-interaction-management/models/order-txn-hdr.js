module.exports = function (sequelize, DataType) {
  const OrdersTxnHdr = sequelize.define('OrdersTxnHdr', {
    orderTxnId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderTxnNo: {
      type: DataType.STRING
    },
    orderId: {
      type: DataType.INTEGER
    },
    orderStatus: {
      type: DataType.STRING
    },
    orderFlow: {
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
    orderDate: {
      type: DataType.DATE
    },
    orderCategory: {
      type: DataType.STRING
    },
    serviceType: {
      type: DataType.STRING
    },
    orderSource: {
      type: DataType.STRING
    },
    orderType: {
      type: DataType.STRING
    },
    orderChannel: {
      type: DataType.STRING
    },
    orderPriority: {
      type: DataType.STRING
    },
    orderStatusReason: {
      type: DataType.STRING
    },
    assignedDate: {
      type: DataType.DATE
    },
    edof: {
      type: DataType.DATE
    },
    deliveryLocation: {
      type: DataType.STRING
    },
    billAmount: {
      type: DataType.INTEGER
    },
    orderDescription: {
      type: DataType.STRING
    },
    customerId: {
      type: DataType.INTEGER
    },
    accountId: {
      type: DataType.INTEGER
    },
    serviceId: {
      type: DataType.INTEGER
    },
    intxnId: {
      type: DataType.INTEGER
    },
    soId: {
      type: DataType.INTEGER
    },
    orderFamily: {
      type: DataType.STRING
    },
    orderMode: {
      type: DataType.STRING
    },
    orderRefNo: {
      type: DataType.STRING
    },
    slaCode: {
      type: DataType.STRING
    },
    slaLastAlertDate: {
      type: DataType.DATE
    },
    contactPreference: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? this.getDataValue('contactPreference') ? JSON.parse(this.getDataValue('contactPreference')) : this.getDataValue('contactPreference') : this.getDataValue('contactPreference')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('contactPreference', JSON.stringify(value)) : this.setDataValue('contactPreference', value)
      }
    },
    orderDeliveryMode: {
      type: DataType.STRING
    },
    isFollowup: {
      type: DataType.STRING
    },
    remarks: {
      type: DataType.STRING
    },
    parentFlag: {
      type: DataType.STRING
    },
    parentOrderId: {
      type: DataType.BIGINT
    },
    multiOrderFlag: {
      type: DataType.STRING
    },
    parentOrderUuid: {
      type: DataType.STRING
    },
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.INTEGER
    },
    tranId: {
      type: DataType.STRING
    },
    orderTxnUuid: {
      type: DataType.STRING
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
    tableName: 'order_txn_hdr'
  })
  OrdersTxnHdr.associate = function (models) {
    models.OrdersTxnHdr.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByDescription'
    })

    models.OrdersTxnHdr.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByDescription'
    })

    models.OrdersTxnHdr.belongsTo(models.User, {
      foreignKey: 'fromUserId',
      as: 'fromUserDescription'
    })

    models.OrdersTxnHdr.belongsTo(models.User, {
      foreignKey: 'toUserId',
      as: 'toUserDescription'
    })

    // models.OrdersTxnHdr.hasMany(models.OrdersTxnDtl, {
    //   foreignKey: 'orderTxnId',
    //   as: 'orderProductTxn'
    // })

    models.OrdersTxnHdr.belongsTo(models.BusinessEntity, {
      foreignKey: 'orderFlow',
      as: 'orderFlowDesc'
    })

    models.OrdersTxnHdr.belongsTo(models.BusinessEntity, {
      foreignKey: 'orderStatus',
      as: 'orderStatusDesc'
    })

    models.OrdersTxnHdr.belongsTo(models.BusinessUnit, {
      foreignKey: 'fromEntityId',
      as: 'fromEntityDesc'
    })

    models.OrdersTxnHdr.belongsTo(models.BusinessUnit, {
      foreignKey: 'toEntityId',
      as: 'toEntityDesc'
    })
  }

  return OrdersTxnHdr
}
