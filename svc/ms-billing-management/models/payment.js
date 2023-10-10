module.exports = function (sequelize, DataType) {
  const Payment = sequelize.define('Payment', {
    paymentId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    billRefNo: {
      type: DataType.STRING
    },
    allocationLevel: {
      type: DataType.STRING
    },
    currency: {
      type: DataType.STRING
    },
    paymentMode: {
      type: DataType.STRING
    },
    totalOutstanding: {
      type: DataType.INTEGER
    },
    dueOutstanding: {
      type: DataType.INTEGER
    },
    paymentAmount: {
      type: DataType.INTEGER
    },
    paymentLocation: {
      type: DataType.STRING
    },
    isOffline: {
      type: DataType.INTEGER
    },
    paymentRemark: {
      type: DataType.STRING
    },
    refNo: {
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
    refDate: {
      type: DataType.DATE
    },
    refName: {
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
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.INTEGER
    },
    tranId: {
      type: DataType.STRING
    }
  },
    {
      timestamps: true,
      underscored: true,
      tableName: 'payment_txn'
    }
  )

  Payment.associate = function (models) {
    // models.Payment.belongsTo(models.Customer, {
    //   foreignKey: 'customerUuid',
    //   as: 'customerDetails'
    // })
    models.Payment.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.Payment.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    models.Payment.belongsTo(models.BusinessEntity, {
      foreignKey: 'currency',
      as: 'currencyDesc'
    })
    models.Payment.belongsTo(models.BusinessEntity, {
      foreignKey: 'paymentMode',
      as: 'paymentModeDesc'
    })
    models.Payment.belongsTo(models.Customer, {
      foreignKey: 'billRefNo',
      targetKey: 'customerNo'
      // through:  { models.Customer, sourceKey: 'customerId', targetKey: 'customerId' }
    })
    // models.Account.belongsTo(models.Customer, {
    //   foreignKey: 'customerId',
    //   targetKey: 'customerId'
    // })
    models.Payment.hasMany(models.PaymentInvoiceTxn, {
      foreignKey: 'paymentId',
      as: 'paymentTxnDetails'
    })
    models.Payment.hasMany(models.CustServices, {
      sourceKey: 'serviceUuid',
      foreignKey: 'serviceUuid',
      as: 'servicePayments'
    })
  }

  return Payment
}
