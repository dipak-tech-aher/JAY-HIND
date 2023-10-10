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
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    actualStartDate: {
      type: DataType.DATEONLY
    },
    actualEndDate: {
      type: DataType.DATEONLY
    },
    chargeId: {
      type: DataType.INTEGER
    },
    chargeAmt: {
      type: DataType.INTEGER
    },
    frequency: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    prorated: {
      type: DataType.STRING
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
    upfrontPayment: {
      type: DataType.STRING
    },
    quantity: {
      type: DataType.INTEGER
    },
    durationMonth: {
      type: DataType.INTEGER
    },
    balanceAmount: {
      type: DataType.INTEGER
    },
    minCommitment: {
      type: DataType.INTEGER
    },
    totalConsumption: {
      type: DataType.INTEGER
    },
    invoiceGroup: {
      type: DataType.INTEGER
    }
  }, {
    tableName: 'contract_dtl',
    timestamps: true,
    underscored: true
  })
  ContractDtl.associate = function (models) {
    models.ContractDtl.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.ContractDtl.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    models.ContractDtl.belongsTo(models.Charge, {
      foreignKey: 'chargeId',
      as: 'charge'
    })
    // models.ContractDtl.belongsTo(models.CustServices, {
    //   foreignKey: 'connectionId',
    //   as: 'services'
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
    //   foreignKey: 'itemId',
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
