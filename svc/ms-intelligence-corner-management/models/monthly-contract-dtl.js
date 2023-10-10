module.exports = function (sequelize, DataType) {
  const MonthlyContractDtl = sequelize.define('MonthlyContractDtl', {
    monthlyContractDtlId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    monthlyContractId: {
      type: DataType.INTEGER
    },
    contractDtlId: {
      type: DataType.INTEGER
    },
    contractId: {
      type: DataType.INTEGER
    },
    // itemId: {
    //   type: DataType.INTEGER
    // },
    // itemName: {
    //   type: DataType.STRING
    // },
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
    plannedEndDate: {
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
      defaultValue: 'UNBILLED',
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    contractPeriod: {
      type: DataType.STRING
    },
    // connectionId: {
    //   type: DataType.INTEGER
    // },
    // chargeName: {
    //   type: DataType.STRING
    // },
    chargeType: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    identificationNo: {
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
    },
    isSplit: {
      type: DataType.STRING
    },
    soId: {
      type: DataType.INTEGER
    },
    // soNumber: {
    //   type: DataType.STRING
    // },
    mappingPayload: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? this.getDataValue('mappingPayload') ? JSON.parse(this.getDataValue('mappingPayload')) : this.getDataValue('mappingPayload') : this.getDataValue('mappingPayload')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('mappingPayload', JSON.stringify(value)) : this.setDataValue('mappingPayload', value)
      }
    },
    // isMigrated: {
    //   type: DataType.STRING
    // }
  }, {
    tableName: 'monthly_contract_dtl',
    timestamps: true,
    underscored: true
  })
  MonthlyContractDtl.associate = function (models) {
    models.MonthlyContractDtl.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.MonthlyContractDtl.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    // models.MonthlyContractDtl.belongsTo(models.Charge, {
    //   foreignKey: 'chargeId',
    //   as: 'charge'
    // })
    models.MonthlyContractDtl.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    models.MonthlyContractDtl.belongsTo(models.BusinessEntity, {
      foreignKey: 'frequency',
      as: 'frequencyDesc'
    })
    models.MonthlyContractDtl.belongsTo(models.BusinessEntity, {
      foreignKey: 'chargeType',
      as: 'chargeTypeDesc'
    })
    models.MonthlyContractDtl.belongsTo(models.BusinessEntity, {
      foreignKey: 'contractType',
      as: 'contractTypeDesc'
    })
    models.MonthlyContractDtl.belongsTo(models.BusinessEntity, {
      foreignKey: 'upfrontPayment',
      as: 'upfrontPaymentDesc'
    })
    // models.MonthlyContractDtl.belongsTo(models.Plan, {
    //   foreignKey: 'itemId',
    //   as: 'prodDetails'
    // })
    // models.MonthlyContractDtl.hasMany(models.CustomerContract, {
    //   foreignKey: 'soId',
    //   sourceKey: 'soId',
    //   as: 'customerContractDetails'
    // })
  }

  return MonthlyContractDtl
}
