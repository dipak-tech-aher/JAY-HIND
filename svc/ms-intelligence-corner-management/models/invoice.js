module.exports = function (sequelize, DataType) {
  const Invoice = sequelize.define('Invoice', {
    invoiceId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    invNo: {
      type: DataType.INTEGER
    },
    customerId: {
      type: DataType.INTEGER
    },
    billRefNo: {
      type: DataType.STRING
    },
    invStartDate: {
      type: DataType.DATE
    },
    invEndDate: {
      type: DataType.DATE
    },
    invDate: {
      type: DataType.DATE
    },
    dueDate: {
      type: DataType.DATE
    },
    invOsAmt: {
      type: DataType.INTEGER
    },
    invAmt: {
      type: DataType.INTEGER
    },
    advAmount: {
      type: DataType.INTEGER
    },
    prevBalance: {
      type: DataType.INTEGER
    },
    billingStatus: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    invoiceStatus: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
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
    processId: {
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
    },
    // soNumber: {
    //   type: DataType.STRING
    // },
    contractId: {
      type: DataType.INTEGER
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
    tableName: 'invoice',
    timestamps: true,
    underscored: true
  })
  Invoice.associate = function (models) {
    models.Invoice.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.Invoice.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    models.Invoice.hasMany(models.Customer, {
      sourceKey: 'customerId',
      foreignKey: 'customerId',
      as: 'customer'
    })
    models.Invoice.hasMany(models.CustAccounts, {
      sourceKey: 'billRefNo',
      foreignKey: 'accountNo',
      as: 'accountDetail'
    })
    models.Invoice.hasMany(models.InvoiceDtl, {
      foreignKey: 'invoiceId',
      as: 'invoiceDetails'
    })
    models.Invoice.belongsTo(models.BusinessEntity, {
      foreignKey: 'billingStatus',
      as: 'billingStatusDesc'
    })
    models.Invoice.belongsTo(models.BusinessEntity, {
      foreignKey: 'invoiceStatus',
      as: 'invoiceStatusDesc'
    })
    models.Invoice.hasOne(models.CustServices, {
      sourceKey: 'serviceUuid',
      foreignKey: 'serviceUuid',
      as: 'serviceDataDesc'
    })
    models.Invoice.hasMany(models.AdvancePayment, {
      sourceKey: 'billRefNo',
      foreignKey: 'billRefNo',
      as: 'advancePayment'
    })
    models.Invoice.belongsTo(models.InvoiceProcessed, {
      foreignKey: 'processId',
      as: 'processData'
    })
    models.Invoice.belongsTo(models.ContractHdr, {
      foreignKey: 'contractId',
      as: 'contractDesc'
    })
    models.Invoice.hasMany(models.Adjustment, {
      sourceKey: 'billRefNo',
      foreignKey: 'billRefNo',
      as: 'postBillAdjustment'
    })
    models.Invoice.hasMany(models.Payment, {
      sourceKey: 'billRefNo',
      foreignKey: 'billRefNo',
      as: 'inovicePayment'
    })
    models.Invoice.hasMany(models.PaymentInvoiceTxn, {
      sourceKey: 'invoiceId',
      foreignKey: 'invoiceId',
      as: 'paymentDetail'
    })
  }

  return Invoice
}
