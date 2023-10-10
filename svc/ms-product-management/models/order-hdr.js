module.exports = function (sequelize, DataType) {
  const Orders = sequelize.define('Orders', {
    orderId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderNo: {
      type: DataType.STRING
    },
    paymentId: {
      type: DataType.INTEGER
    },
    orderStatus: {
      type: DataType.STRING
    },
    currEntity: {
      type: DataType.STRING
    },
    currRole: {
      type: DataType.INTEGER
    },
    currUser: {
      type: DataType.INTEGER
    },
    orderDate: {
      type: DataType.DATE
    },
    orderCategory: {
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
    orderCause: {
      type: DataType.STRING
    },
    orderPriority: {
      type: DataType.STRING
    },
    assignedDate: {
      type: DataType.DATE
    },
    edof: {
      type: DataType.DATEONLY
    },
    deliveryLocation: {
      type: DataType.STRING
    },
    billAmount: {
      type: DataType.INTEGER
    },
    rcAmount: {
      type: DataType.INTEGER
    },
    nrcAmount: {
      type: DataType.INTEGER
    },
    orderDescription: {
      type: DataType.STRING
    },
    orderStatusReason: {
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
    serviceType: {
      type: DataType.STRING
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
    requestId: {
      type: DataType.INTEGER
    },
    requestStatement: {
      type: DataType.STRING
    },
    orderDeliveryMode: {
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
    orderUuid: {
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
    advanceCharge: {
      type: DataType.STRING
    },
    upfrontCharge: {
      type: DataType.STRING
    },
    prorated: {
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
    },
    isSplitOrder: {
      type: DataType.BOOLEAN
    },
    isBundleOrder: {
      type: DataType.BOOLEAN
    },
  },
    {
      timestamps: true,
      underscored: true,
      tableName: 'order_hdr'
    })

  Orders.associate = function (models) {
    // models.Orders.hasMany(models.OrdersDetails, {
    //   foreignKey: 'orderId',
    //   as: 'orderProductDtls'
    // })

    // models.Orders.hasMany(models.OrdersTxnHdr, {
    //   foreignKey: 'orderId',
    //   as: 'orderTxnDtls'
    // })

    // models.Orders.hasMany(models.OrderTaskHdr, {
    //   sourceKey: 'orderId',
    //   foreignKey: 'orderId',
    //   as: 'orderTasks'
    // })

    models.Orders.belongsTo(models.BusinessEntity, {
      foreignKey: 'orderStatus',
      as: 'orderStatusDesc'
    })

    models.Orders.belongsTo(models.BusinessEntity, {
      foreignKey: 'orderCategory',
      as: 'orderCategoryDesc'
    })

    models.Orders.belongsTo(models.BusinessEntity, {
      foreignKey: 'orderSource',
      as: 'orderSourceDesc'
    })

    models.Orders.belongsTo(models.BusinessEntity, {
      foreignKey: 'orderType',
      as: 'orderTypeDesc'
    })

    models.Orders.belongsTo(models.BusinessEntity, {
      foreignKey: 'orderChannel',
      as: 'orderChannelDesc'
    })

    models.Orders.belongsTo(models.BusinessEntity, {
      foreignKey: 'orderCause',
      as: 'orderCauseDesc'
    })

    models.Orders.belongsTo(models.BusinessEntity, {
      foreignKey: 'orderPriority',
      as: 'orderPriorityDesc'
    })

    models.Orders.belongsTo(models.BusinessEntity, {
      foreignKey: 'orderFamily',
      as: 'orderFamilyDesc'
    })

    models.Orders.belongsTo(models.BusinessEntity, {
      foreignKey: 'serviceType',
      as: 'serviceTypeDesc'
    })

    models.Orders.belongsTo(models.BusinessEntity, {
      foreignKey: 'orderMode',
      as: 'orderModeDesc'
    })

    // models.Orders.belongsTo(models.Role, {
    //   foreignKey: 'currRole',
    //   as: 'roleDetails'
    // })

    // models.Orders.belongsTo(models.KnowledgeBase, {
    //   foreignKey: 'requestId',
    //   as: 'statementDetails'
    // })

    // models.Orders.hasOne(models.Customer, {
    //   sourceKey: 'customerId',
    //   foreignKey: 'customerId',
    //   as: 'customerDetails'
    // })

    // models.Orders.hasOne(models.Customer, {
    //   sourceKey: 'customerId',
    //   foreignKey: 'customerId',
    //   as: 'childCustomerDetails'
    // })

    // models.Orders.belongsTo(models.User, {
    //   foreignKey: 'createdBy',
    //   as: 'userId'
    // })

    // models.Orders.belongsTo(models.User, {
    //   foreignKey: 'currUser',
    //   as: 'currUserDetails'
    // })

    // models.Orders.belongsTo(models.CustServices, {
    //   foreignKey: 'serviceId',
    //   as: 'serviceDetails'
    // })

    // models.Orders.hasMany(models.Orders, {
    //   sourceKey: 'orderUuid',
    //   foreignKey: 'parentOrderUuid',
    //   as: 'childOrder'
    // })
  }
  return Orders
}
