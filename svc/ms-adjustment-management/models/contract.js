module.exports = function (sequelize, DataType) {
  const Contract = sequelize.define('Contract', {
    contractId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    contractName: {
      type: DataType.STRING
    },
    customerId: {
      type: DataType.INTEGER
    },
    accountId: {
      type: DataType.INTEGER
    },
    billRefNo: {
      type: DataType.STRING
    },
    startDate: {
      type: DataType.DATEONLY
    },
    actualEndDate: {
      type: DataType.DATEONLY
    },
    endDate: {
      type: DataType.DATEONLY
    },
    rcAmount: {
      type: DataType.INTEGER
    },
    otcAmount: {
      type: DataType.INTEGER
    },
    usageAmount: {
      type: DataType.INTEGER
    },
    creditAdjAmount: {
      type: DataType.INTEGER
    },
    debitAdjAmount: {
      type: DataType.INTEGER
    },
    lastBillPeriod: {
      type: DataType.DATEONLY
    },
    nextBillPeriod: {
      type: DataType.DATEONLY
    },
    status: {
      type: DataType.STRING,
      defaultValue: 'ACTIVE',
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
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
    soId: {
      type: DataType.INTEGER
    },
    isAdvanceAllowed: {
      type: DataType.STRING
    },
    advAllocationPercent: {
      type: DataType.INTEGER
    },
    customerContractNo: {
      type: DataType.STRING
    },
    billContRefNo: {
      type: DataType.STRING
    },
    soNumber: {
      type: DataType.STRING
    },
    isMigrated: {
      type: DataType.STRING
    }
  }, {
    tableName: 'contract',
    timestamps: true,
    underscored: true
  })
  Contract.associate = function (models) {
    models.Contract.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.Contract.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    models.Contract.belongsTo(models.Customer, {
      foreignKey: 'customerId',
      as: 'customer'
    })
    models.Contract.belongsTo(models.CustAccounts, {
      foreignKey: 'accountId',
      as: 'account'
    })
    models.Contract.hasMany(models.ContractDtl, {
      foreignKey: 'contractId',
      as: 'contractDetail'
    })
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
