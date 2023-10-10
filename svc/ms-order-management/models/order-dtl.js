module.exports = function (sequelize, DataType) {
  const OrdersDetails = sequelize.define('OrdersDetails', {
    orderDtlId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
      type: DataType.DATEONLY
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
    edof: {
      type: DataType.DATEONLY
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
    orderDtlUuid: {
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
    prodBundleId: {
      type: DataType.INTEGER
    },
    prodBundleUuid: {
      type: DataType.STRING
    },
    // rcAmount: {
    //   type: DataType.INTEGER
    // },
    // nrcAmount: {
    //   type: DataType.INTEGER
    // },
    contractMonths: {
      type: DataType.INTEGER
    },
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'order_dtl'
  })

  OrdersDetails.associate = function (models) {
    models.OrdersDetails.belongsTo(models.BusinessEntity, {
      foreignKey: 'productStatus',
      as: 'productStatusDesc'
    })

    models.OrdersDetails.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'userId'
    })

    models.OrdersDetails.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'productDetails'
    })
  }
  return OrdersDetails
}
