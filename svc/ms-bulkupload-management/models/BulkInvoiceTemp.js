module.exports = function (sequelize, DataType) {
  const BulkInvoiceTemp = sequelize.define('BulkInvoiceTemp', {
    bulkInvoiceId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bulkUploadId: {
      type: DataType.INTEGER
    },
    invoiceRefNumber: {
      type: DataType.STRING
    },
    invoiceDetailRefNumber: {
      type: DataType.STRING
    },
    invoiceDate: {
      type: DataType.DATEONLY
    },
    dueDate: {
      type: DataType.DATEONLY
    },
    status: {
      type: DataType.STRING
    },
    reason: {
      type: DataType.STRING
    },
    customerRefNo: {
      type: DataType.STRING
    },
    emailid: {
      type: DataType.STRING
    },
    orderRefNo: {
      type: DataType.STRING
    },
    contractRefNo: {
      type: DataType.STRING
    },
    productName: {
      type: DataType.STRING
    },
    productDescription: {
      type: DataType.STRING
    },
    invoiceDetailsStartDate: {
      type: DataType.DATEONLY
    },
    invoiceDetailsEndDate: {
      type: DataType.DATEONLY
    },
    quantity: {
      type: DataType.STRING
    },
    creditAdjAmount: {
      type: DataType.STRING
    },
    debitAdjAmount: {
      type: DataType.STRING
    },
    invoiceDetailAmount:{
      type: DataType.STRING
    },
    invoiceDetailOsAmount: {
      type: DataType.STRING
    },
    invoiceDetailUuid: {
      type: DataType.STRING
    },
    validationFlag: {
      type: DataType.STRING
    },
    uploadFlag: {
      type: DataType.STRING
    },
    validationRemarks: {
      type: DataType.STRING
    },
    uploadRemarks: {
      type: DataType.STRING
    },
    invoiceTranId: {
      type: DataType.STRING
    },
    invoiceCreatedDeptId: {
      type: DataType.INTEGER
    },
    invoiceCreatedRoleId: {
      type: DataType.INTEGER
    },
    invoiceCreatedBy: {
      type: DataType.STRING
    },
    createdAt: {
      type: DataType.DATE
    }
  },
  {
    timestamps: false,
    underscored: true,
    tableName: 'bulk_invoice_temp'
  })

  BulkInvoiceTemp.associate = function (models) { }
  return BulkInvoiceTemp
}
