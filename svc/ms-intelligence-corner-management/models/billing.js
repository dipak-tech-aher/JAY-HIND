module.exports = function (sequelize, DataTypes) {
  const Billing = sequelize.define('Billing', {
    billId: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    billDate: {
      type: DataTypes.DATE
    },
    invoicePeriod: {
      type: DataTypes.STRING
    },
    totInvProcessed: {
      type: DataTypes.INTEGER
    },
    totSuccess: {
      type: DataTypes.INTEGER
    },
    totFailed: {
      type: DataTypes.INTEGER
    },
    totInvAmount: {
      type: DataTypes.FLOAT
    },
    totAdvAmt: {
      type: DataTypes.FLOAT
    },
    totPreBalAmt: {
      type: DataTypes.FLOAT
    },
    totOutstandAmt: {
      type: DataTypes.FLOAT
    },
    noOfContracts: {
      type: DataTypes.INTEGER
    },
    logLocation: {
      type: DataTypes.STRING
    },
    pdfLocation: {
      type: DataTypes.STRING
    },
    billMonth: {
      type: DataTypes.STRING
    },
    billYear: {
      type: DataTypes.INTEGER
    },
    billCycle: {
      type: DataTypes.INTEGER
    },
    remarks: {
      type: DataTypes.STRING
    },
    customerUuid: {
      type: DataTypes.STRING
    },
    accountUuid: {
      type: DataTypes.STRING
    },
    serviceUuid: {
      type: DataTypes.STRING
    },
    createdDeptId: {
      type: DataTypes.INTEGER
    },
    createdRoleId: {
      type: DataTypes.INTEGER
    },
    tranId: {
      type: DataTypes.STRING
    },
    createdBy: {
      type: DataTypes.INTEGER
    },
    createdAt: {
      type: DataTypes.DATE
    },
    updatedBy: {
      type: DataTypes.INTEGER
    },
    updatedAt: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'billing',
    timestamps: true,
    underscored: true
  })

  Billing.associate = function (models) {
    models.Billing.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByUser'
    })
    models.Billing.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByUser'
    })
    // models.Billing.belongsTo(models.BusinessEntity, {
    //   foreignKey: 'billingGroup',
    //   as: 'billGroupDesc'
    // })
    // models.Billing.belongsTo(models.BusinessEntity, {
    //   foreignKey: 'currency',
    //   as: 'currencyDesc'
    // })
  }
  return Billing
}
