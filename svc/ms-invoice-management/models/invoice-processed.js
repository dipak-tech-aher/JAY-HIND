module.exports = function (sequelize, DataType) {
  const InvoiceProcessed = sequelize.define('InvoiceProcessed', {
    processId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    processDate: {
      type: DataType.DATE
    },
    invoiceStartDate: {
      type: DataType.DATE
    },
    invoiceEndDate: {
      type: DataType.DATE
    },
    processedBy: {
      type: DataType.INTEGER
    },
    totalProcessed: {
      type: DataType.INTEGER
    },
    successCount: {
      type: DataType.INTEGER
    },
    failureCount: {
      type: DataType.INTEGER
    },
    pdfLocation: {
      type: DataType.STRING
    },
    invoiceCycleNo: {
      type: DataType.INTEGER
    },
    invoiceRegenCnt: {
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
    tableName: 'invoice_processed',
    timestamps: true,
    underscored: true
  })
  InvoiceProcessed.associate = function (models) {
    models.InvoiceProcessed.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.InvoiceProcessed.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    models.InvoiceProcessed.hasMany(models.Invoice, {
      foreignKey: 'processId',
      as: 'invoices'
    })
  }

  return InvoiceProcessed
}
