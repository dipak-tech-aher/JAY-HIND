module.exports = function (sequelize, DataType) {
  const MonthlyContract = sequelize.define('MonthlyContract', {
    monthlyContractId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    contractId: {
      type: DataType.INTEGER
    },
    contractName: {
      type: DataType.STRING
    },
    customerId: {
      type: DataType.INTEGER
    },
    customerUuid: {
      type: DataType.STRING
    },
    accountId: {
      type: DataType.INTEGER
    },
    accountUuid: {
      type: DataType.STRING
    },
    billRefNo: {
      type: DataType.STRING
    },
    plannedStartDate: {
      type: DataType.DATEONLY
    },
    actualStartDate: {
      type: DataType.DATEONLY
    },
    actualEndDate: {
      type: DataType.DATEONLY
    },
    plannedEndDate: {
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
      defaultValue: 'UNBILLED',
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    contractPeriod: {
      type: DataType.STRING
    },
    billMonth: {
      type: DataType.INTEGER
    },
    billYear: {
      type: DataType.INTEGER
    },
    billCycle: {
      type: DataType.INTEGER
    },
    isNew: {
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
    soId: {
      type: DataType.INTEGER
    },
    isAdvanceAllowed: {
      type: DataType.STRING
    },
    advAllocationPercent: {
      type: DataType.INTEGER
    },
    noOfBillings: {
      type: DataType.INTEGER
    },
    onHoldDate: {
      type: DataType.DATE
    },
    isOnhold: {
      type: DataType.STRING
    },
    onUnholdCount: {
      type: DataType.INTEGER
    },
    isSplit: {
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
    }
  }, {
    tableName: 'monthly_contract_hdr',
    timestamps: true,
    underscored: true
  })
  MonthlyContract.associate = function (models) {
    models.MonthlyContract.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.MonthlyContract.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    models.MonthlyContract.belongsTo(models.Customer, {
      foreignKey: 'customerId',
      as: 'customer'
    })
    models.MonthlyContract.belongsTo(models.CustAccounts, {
      foreignKey: 'accountId',
      as: 'account'
    })
    models.MonthlyContract.hasMany(models.MonthlyContractDtl, {
      sourceKey: 'monthlyContractId',
      foreignKey: 'monthlyContractId',
      as: 'monthlyContractDtl'
    })
    // models.MonthlyContract.hasOne(models.Invoice, {
    //   sourceKey: 'monthlyContractId',
    //   foreignKey: 'monthlyContractId',
    //   as: 'invoiceDetails'
    // })
    models.MonthlyContract.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    // models.MonthlyContract.belongsTo(models.SaleOrders, {
    //   foreignKey: 'soId',
    //   as: 'soDetails'
    // })
  }

  return MonthlyContract
}
