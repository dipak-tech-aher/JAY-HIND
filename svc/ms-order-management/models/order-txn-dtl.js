module.exports = function (sequelize, DataType) {
  const OrdersTxnDtl = sequelize.define('OrdersTxnDtl', {
    orderTxnDtlId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderTxnId: {
      type: DataType.INTEGER
    },
    orderId: {
      type: DataType.INTEGER
    },
    productId: {
      type: DataType.INTEGER
    },
    productQuantity: {
      type: DataType.INTEGER
    },
    productStatus: {
      type: DataType.STRING
    },
    productAddedDate: {
      type: DataType.DATE
    },
    billAmount: {
      type: DataType.INTEGER
    },
    edof: {
      type: DataType.DATE
    },
    productRefNo: {
      type: DataType.STRING
    },
    productSerialNo: {
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
    orderTxnDtlUuid: {
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

  }, {
    timestamps: true,
    underscored: true,
    tableName: 'order_txn_dtl'
  })

  OrdersTxnDtl.associate = function (models) {
    models.OrdersTxnDtl.belongsTo(models.Orders, {
      foreignKey: 'orderId',
      as: 'orderDetails'
    })

    models.OrdersTxnDtl.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'productTxnDtls'
    })
  }
  return OrdersTxnDtl
}
