module.exports = function (sequelize, DataType) {
  const SaleOrders = sequelize.define('SaleOrders', {
    soId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    soNumber: {
      type: DataType.STRING
    },
    customerName: {
      type: DataType.STRING
    },
    emailId: {
      type: DataType.STRING
    },
    contactNo: {
      type: DataType.STRING
    },
    salesRepName: {
      type: DataType.STRING
    },
    soCreatedAt: {
      type: DataType.DATE
    },
    soStatus: {
      type: DataType.STRING
    },
    soStatusReason: {
      type: DataType.STRING
    },
    soType: {
      type: DataType.STRING
    },
    contractDuration: {
      type: DataType.INTEGER
    },
    contractStatusReason: {
      type: DataType.STRING
    },
    paymentTerms: {
      type: DataType.STRING
    },
    soClosureAt: {
      type: DataType.DATE
    },
    soDescription: {
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
    customerId: {
      type: DataType.INTEGER
    },
    billRefNo: {
      type: DataType.STRING
    },
    crmSoId: {
      type: DataType.STRING
    },
    totalAmount: {
      type: DataType.INTEGER
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'sale_orders'
  })
  SaleOrders.associate = function (models) {
    models.SaleOrders.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.SaleOrders.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    models.SaleOrders.belongsTo(models.BusinessEntity, {
      foreignKey: 'soStatus',
      as: 'soStatusDes'
    })
    models.SaleOrders.belongsTo(models.BusinessEntity, {
      foreignKey: 'soStatusReason',
      as: 'soStatReasonDes'
    })
    models.SaleOrders.belongsTo(models.BusinessEntity, {
      foreignKey: 'soType',
      as: 'soTypeDes'
    })
    models.SaleOrders.belongsTo(models.BusinessEntity, {
      foreignKey: 'contractStatusReason',
      as: 'contStatReasonDes'
    })
    models.SaleOrders.belongsTo(models.BusinessEntity, {
      foreignKey: 'paymentTerms',
      as: 'paymentTermsDes'
    })
    models.SaleOrders.hasMany(models.SalesOrderDtl, {
      sourceKey: 'soId',
      foreignKey: 'soId',
      as: 'salesOrderDtl'
    })
  }
  return SaleOrders
}
