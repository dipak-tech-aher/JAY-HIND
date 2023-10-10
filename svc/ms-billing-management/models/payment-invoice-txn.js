module.exports = function (sequelize, DataType) {
  const PaymentInvoiceTxn = sequelize.define('PaymentInvoiceTxn', {
    invPayId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    invoiceId: {
      type: DataType.INTEGER
    },
    paymentAmount: {
      type: DataType.INTEGER
    },
    invoiceAmount: {
      type: DataType.INTEGER
    },
    invoiceDtlId: {
      type: DataType.INTEGER
    },
    billRefNo: {
      type: DataType.INTEGER
    },
    invOsAmt: {
      type: DataType.INTEGER
    },
    balanceAmt: {
      type: DataType.INTEGER
    },
    status: {
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
    tableName: 'payment_invoice_txn'
  }
  )

  PaymentInvoiceTxn.associate = function (models) {
    models.PaymentInvoiceTxn.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.PaymentInvoiceTxn.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
  }

  return PaymentInvoiceTxn
}
