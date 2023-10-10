module.exports = function (sequelize, DataType) {
  const BulkChargeTemp = sequelize.define('BulkChargeTemp', {
    bulkChargeId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bulkUploadId: {
      type: DataType.INTEGER
    },
    chargeName: {
      type: DataType.STRING
    },
    chargeAmount: {
      type: DataType.STRING
    },
    chargeCategory: {
      type: DataType.STRING
    },
    serviceType: {
      type: DataType.STRING
    },
    currency: {
      type: DataType.STRING
    },
    startDate: {
      type: DataType.DATE
    },
    endDate: {
      type: DataType.DATE
    },
    glCode: {
      type: DataType.STRING
    },
    advanceCharge: {
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
    chargeTranId: {
      type: DataType.STRING
    },
    chargeCreatedDeptId: {
      type: DataType.STRING
    },
    chargeCreatedRoleId: {
      type: DataType.INTEGER
    },
    chargeCreatedBy: {
      type: DataType.STRING
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'bulk_charge_temp'
  })

  BulkChargeTemp.associate = function (models) { }
  return BulkChargeTemp
}
