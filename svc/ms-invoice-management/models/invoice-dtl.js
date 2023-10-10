module.exports = function (sequelize, DataType) {
  const InvoiceDtl = sequelize.define('InvoiceDtl', {
    invoiceDtlId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    invoiceId: {
      type: DataType.INTEGER
    },
    serviceId: {
      type: DataType.INTEGER
    },
    contractId: {
      type: DataType.INTEGER
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
    chargeId: {
      type: DataType.INTEGER
    },
    chargeCategory: {
      type: DataType.STRING
    },
    chargeAmt: {
      type: DataType.INTEGER
    },
    creditAdj: {
      type: DataType.INTEGER
    },
    debitAdj: {
      type: DataType.INTEGER
    },
    billPeriod: {
      type: DataType.DATEONLY
    },
    paymentId: {
      type: DataType.INTEGER
    },
    paidAmount: {
      type: DataType.INTEGER
    },
    invoiceStatus: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    billingStatus: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    // status: {
    //   type: DataType.STRING,
    //   references: {
    //     model: 'BusinessEntity',
    //     key: 'code'
    //   }
    // },
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
    contractDtlId: {
      type: DataType.INTEGER
    },
    billRefNo: {
      type: DataType.STRING
    },
    processId: {
      type: DataType.INTEGER
    },
    // chargeName: {
    //   type: DataType.STRING
    // },
    // chargeType: {
    //   type: DataType.STRING,
    //   references: {
    //     model: 'BusinessEntity',
    //     key: 'code'
    //   }
    // },
    monthlyContractDtlId: {
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
    tableName: 'invoice_dtl',
    timestamps: true,
    underscored: true
  })
  InvoiceDtl.associate = function (models) {
    models.InvoiceDtl.belongsTo(models.CustServices, {
      foreignKey: 'serviceId',
      as: 'connectionDetails'
    })
    models.InvoiceDtl.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.InvoiceDtl.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    models.InvoiceDtl.belongsTo(models.Invoice, {
      foreignKey: 'invoiceId',
      as: 'invoice'
    })
    models.InvoiceDtl.belongsTo(models.Charge, {
      foreignKey: 'chargeId',
      as: 'charge'
    })
    // models.InvoiceDtl.belongsTo(models.BusinessEntity, {
    //   foreignKey: 'status',
    //   as: 'statusDesc'
    // })
    // models.InvoiceDtl.belongsTo(models.BusinessEntity, {
    //   foreignKey: 'chargeType',
    //   as: 'chargeTypeDescription'
    // })
    models.InvoiceDtl.belongsTo(models.BusinessEntity, {
      foreignKey: 'billingStatus',
      as: 'billingStatusDesc'
    })
    models.InvoiceDtl.belongsTo(models.BusinessEntity, {
      foreignKey: 'invoiceStatus',
      as: 'invoiceStatusDesc'
    })
    models.InvoiceDtl.belongsTo(models.Contract, {
      foreignKey: 'contractId',
      as: 'contractName'
    })
    models.InvoiceDtl.belongsTo(models.ContractDtl, {
      foreignKey: 'contractDtlId',
      as: 'contractDetail'
    })
    models.InvoiceDtl.belongsTo(models.MonthlyContractDtl, {
      foreignKey: 'monthlyContractDtlId',
      as: 'monthlyContractDet'
    })
    models.InvoiceDtl.hasMany(models.PaymentInvoiceTxn, {
      sourceKey: 'invoiceDtlId',
      foreignKey: 'invoiceDtlId',
      as: 'paymentDetail'
    })
  }

  return InvoiceDtl
}
