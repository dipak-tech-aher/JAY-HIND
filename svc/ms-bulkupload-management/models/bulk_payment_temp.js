module.exports = function (sequelize, DataType) {
  const BulkPaymentTemp = sequelize.define('BulkPaymentTemp', {
    bulkPaymentId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bulkUploadId: {
      type: DataType.INTEGER
    },
    paymentRefNumber: {
      type: DataType.STRING
    },
    customerRefNumber: {
      type: DataType.STRING
    },
    invoiceRefNumber: {
      type: DataType.STRING
    },
    invoiceDetailRefNumber: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    reason: {
      type: DataType.STRING
    },
    currency: {
      type: DataType.STRING
    },
    paymentMode: {
      type: DataType.STRING
    },
    paymentModeIfOth: {
      type: DataType.STRING
    },
    paymentAmount: {
      type: DataType.INTEGER
    },
    paymentDate: {
      type: DataType.DATE
    },
    paymentLocation: {
      type: DataType.STRING
    },
    invoiceDetailAmount: {
      type: DataType.INTEGER
    },
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.INTEGER
    },
    createdBy: {
      type: DataType.INTEGER
    },
    paymentTranId: {
      type: DataType.STRING
    },
    paymentUuid: {
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
    createdAt: {
      type: DataType.DATE
    }
  },
  {
    timestamps: false,
    underscored: true,
    tableName: 'bulk_payment_temp'
  })

  BulkPaymentTemp.associate = function (models) { }
  return BulkPaymentTemp
}
