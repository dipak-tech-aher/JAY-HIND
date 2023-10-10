module.exports = function (sequelize, DataType) {
  const ContractDtl = sequelize.define('ContractDtl', {
    contractDtlId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    contractId: {
      type: DataType.INTEGER
    },
    contractType: {
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
    frequency: {
      type: DataType.STRING
    },
    prorated: {
      type: DataType.STRING
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
    durationMonth: {
      type: DataType.INTEGER
    },
    upfrontPayment: {
      type: DataType.STRING
    },
    balanceAmount: {
      type: DataType.FLOAT
    },
    minCommitment: {
      type: DataType.FLOAT
    },
    totalConsumption: {
      type: DataType.FLOAT
    },
    invoiceGroup: {
      type: DataType.INTEGER
    },
    productId: {
      type: DataType.INTEGER
    },
    prodBundleId: {
      type: DataType.INTEGER
    },
    quantity: {
      type: DataType.STRING
    },
    chargeId: {
      type: DataType.INTEGER
    },
    chargeAmt: {
      type: DataType.FLOAT
    },
    chargeType: {
      type: DataType.STRING
    },
    orderId: {
      type: DataType.INTEGER
    },
    orderDtlId: {
      type: DataType.INTEGER
    },
    soId: {
      type: DataType.INTEGER
    },
    contractUuid: {
      type: DataType.STRING
    },
    productUuid: {
      type: DataType.STRING
    },
    prodBundleUuid: {
      type: DataType.STRING
    },
    contractDtlUuid: {
      type: DataType.STRING
    },
    orderUuid: {
      type: DataType.STRING
    },
    orderDtlUuid: {
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
    tableName: 'contract_dtl',
    timestamps: true,
    underscored: true
  })
  ContractDtl.associate = function (models) {
    // models.ContractDtl.belongsTo(models.User, {
    //   foreignKey: 'createdBy',
    //   as: 'createdByName'
    // })
    // models.ContractDtl.belongsTo(models.User, {
    //   foreignKey: 'updatedBy',
    //   as: 'updatedByName'
    // })
    // models.ContractDtl.belongsTo(models.Charge, {
    //   foreignKey: 'chargeId',
    //   as: 'charge'
    // })
    models.ContractDtl.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    models.ContractDtl.belongsTo(models.BusinessEntity, {
      foreignKey: 'chargeType',
      as: 'chargeTypeDesc'
    })
    models.ContractDtl.belongsTo(models.BusinessEntity, {
      foreignKey: 'frequency',
      as: 'frequencyDesc'
    })
    models.ContractDtl.belongsTo(models.BusinessEntity, {
      foreignKey: 'contractType',
      as: 'contractTypeDesc'
    })
    models.ContractDtl.belongsTo(models.BusinessEntity, {
      foreignKey: 'upfrontPayment',
      as: 'upfrontPaymentDesc'
    })
    // models.ContractDtl.belongsTo(models.Product, {
    //   foreignKey: 'productId',
    //   as: 'prodDetails'
    // })
    // models.ContractDtl.hasMany(models.CustomerContract, {
    //   foreignKey: 'soId',
    //   sourceKey: 'soId',
    //   as: 'customerContractDetails'
    // })
  }

  return ContractDtl
}
