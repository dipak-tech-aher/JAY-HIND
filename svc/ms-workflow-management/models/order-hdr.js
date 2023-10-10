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
    tableName: 'order_hdr'
  })

  return Orders
}
