module.exports = function (sequelize, DataType) {
  const SalesOrderDtl = sequelize.define('SalesOrderDtl', {
    soDetId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    soId: {
      type: DataType.INTEGER
    },
    crmProductId: {
      type: DataType.STRING
    },
    productName: {
      type: DataType.STRING
    },
    description: {
      type: DataType.STRING
    },
    soCreatedon: {
      type: DataType.DATE
    },
    productNumber: {
      type: DataType.STRING
    },
    pricePerUnit: {
      type: DataType.INTEGER
    },
    quantity: {
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
    },
    connectionId: {
      type: DataType.INTEGER
    },
    chargeType: {
      type: DataType.STRING
    },
    lineItemTotalAmt: {
      type: DataType.INTEGER
    },
    crmSoDtlId: {
      type: DataType.STRING
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'sales_order_details'
  })
  SalesOrderDtl.associate = function (models) {
    models.SalesOrderDtl.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.SalesOrderDtl.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
  }
  return SalesOrderDtl
}
