module.exports = function (sequelize, DataType) {
  const Contract = sequelize.define('Contract', {
    contractId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    contractNo: {
      type: DataType.STRING
    },
    contractName: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    plannedStartDate: {
      type: DataType.DATE
    },
    plannedEndDate: {
      type: DataType.DATE
    },
    actualStartDate: {
      type: DataType.DATE
    },
    actualEndDate: {
      type: DataType.DATE
    },
    rcAmount: {
      type: DataType.FLOAT
    },
    otcAmount: {
      type: DataType.FLOAT
    },
    usageAmount: {
      type: DataType.FLOAT
    },
    creditAdjAmount: {
      type: DataType.FLOAT
    },
    debitAdjAmount: {
      type: DataType.FLOAT
    },
    lastBillPeriod: {
      type: DataType.DATEONLY
    },
    nextBillPeriod: {
      type: DataType.DATEONLY
    },
    isAdvanceAllowed: {
      type: DataType.STRING
    },
    advAllocationPercent: {
      type: DataType.FLOAT
    },
    customerId: {
      type: DataType.STRING
    },
    accountId: {
      type: DataType.STRING
    },
    serviceId: {
      type: DataType.STRING
    },
    soId: {
      type: DataType.INTEGER
    },
    contractUuid: {
      type: DataType.STRING
    },
    customerUuid: {
      type: DataType.STRING
    },
    accountUuid: {
      type: DataType.STRING
    },
    serviceUuid: {
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
    tableName: 'contract_hdr',
    timestamps: true,
    underscored: true
  })
  Contract.associate = function (models) {
    // models.Contract.belongsTo(models.User, {
    //   foreignKey: 'createdBy',
    //   as: 'createdByName'
    // })
    // models.Contract.belongsTo(models.User, {
    //   foreignKey: 'updatedBy',
    //   as: 'updatedByName'
    // })
    // models.Contract.belongsTo(models.Customer, {
    //   foreignKey: 'customerId',
    //   as: 'customer'
    // })
    // models.Contract.belongsTo(models.CustAccounts, {
    //   foreignKey: 'accountId',
    //   as: 'account'
    // })
    // models.Contract.hasMany(models.ContractDtl, {
    //   foreignKey: 'contractId',
    //   as: 'contractDetail'
    // })
    models.Contract.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    // models.Contract.belongsTo(models.SaleOrders, {
    //   foreignKey: 'soId',
    //   as: 'soDetails'
    // })
  }

  return Contract
}
