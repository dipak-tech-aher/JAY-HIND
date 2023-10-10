module.exports = function (sequelize, DataType) {
  const Billing = sequelize.define('Billing', {
    billId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    billDate: {
      type: DataType.DATE
    },
    invoicePeriod: {
      type: DataType.STRING
    },
    totInvProcessed: {
      type: DataType.INTEGER
    },
    totSuccess: {
      type: DataType.INTEGER
    },
    totFailed: {
      type: DataType.INTEGER
    },
    totInvAmount: {
      type: DataType.INTEGER
    },
    totAdvAmt: {
      type: DataType.INTEGER
    },
    totPreBalAmt: {
      type: DataType.INTEGER
    },
    totOutstandAmt: {
      type: DataType.INTEGER
    },
    noOfContracts: {
      type: DataType.INTEGER
    },
    logLocation: {
      type: DataType.STRING
    },
    pdfLocation: {
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
    billMonth: {
      type: DataType.STRING
    },
    billYear: {
      type: DataType.INTEGER
    },
    billCycle: {
      type: DataType.INTEGER
    },
    createdDeptId: {
      type: DataType.STRING
    },
    remarks: {
      type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.INTEGER
    },
    tranId: {
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
    }
  }, {
    tableName: 'billing',
    timestamps: true,
    underscored: true
  })
  Billing.associate = function (models) {
    models.Billing.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.Billing.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
  }

  return Billing
}
