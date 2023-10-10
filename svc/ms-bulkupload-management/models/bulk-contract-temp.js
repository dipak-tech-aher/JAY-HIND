module.exports = function (sequelize, DataType) {
  const BulkContractTemp = sequelize.define('BulkContractTemp', {
    bulkContractId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bulkUploadId: {
      type: DataType.INTEGER
    },
    billingContractRefNumber: {
      type: DataType.STRING
    },
    orderNumber: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    reason: {
      type: DataType.STRING
    },
    contractStartDate: {
      type: DataType.DATEONLY
    },
    productName: {
      type: DataType.STRING
    },
    productDescription: {
      type: DataType.STRING
    },
    frequency:{
      type: DataType.STRING
    },
    billingStartDate: {
      type: DataType.DATEONLY
    },
    consumptionBaseProduct: {
      type: DataType.STRING
    },
    consumptionType: {
      type: DataType.STRING
    },
    chargeType: {
      type: DataType.STRING
    },
    geoLocation: {
      type: DataType.STRING
    },
    unitPrice: {
      type: DataType.STRING
    },
    totalProductChargeAmount: {
      type: DataType.STRING
    },
    balanceAmount: {
      type: DataType.STRING
    },
    quantity:{
      type: DataType.STRING
    },
    duration: {
      type: DataType.STRING
    },
    advanceFlag: {
      type: DataType.STRING
    },
    creditAdjustmentAmount: {
      type: DataType.STRING
    },
    debitAdjustmentAmount: {
      type: DataType.STRING
    },
    advancePaymentAllocation: {
      type: DataType.STRING
    },
    allocationPercentage: {
      type: DataType.STRING
    },
    validationFlag: {
      type: DataType.STRING
    },
    validationRemarks: {
      type: DataType.STRING
    },
    uploadFlag: {
      type: DataType.STRING
    },
    uploadRemarks: {
      type: DataType.STRING
    },
    contractTranId: {
      type: DataType.STRING
    },
    contractUuid: {
      type: DataType.STRING
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
    createdAt: {
      type: DataType.DATE
    },
    updatedAt: {
      type: DataType.DATE
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'bulk_contract_temp'
  })

  BulkContractTemp.associate = function (models) { }
  return BulkContractTemp
}
