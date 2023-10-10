module.exports = function (sequelize, DataType) {
  const BulkBusinessUnitTemp = sequelize.define('BulkBusinessUnitTemp', {
    bulkBuId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bulkUploadId: {
      type: DataType.INTEGER
    },
    unitName: {
      type: DataType.STRING
    },
    unitDesc: {
      type: DataType.STRING
    },
    unitType: {
      type: DataType.STRING
    },
    parentUnit: {
      type: DataType.STRING
    },
    roleName: {
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
    buTranId: {
      type: DataType.STRING
    },
    buCreatedDeptId: {
      type: DataType.STRING
    },
    buCreatedRoleId: {
      type: DataType.INTEGER
    },
    buCreatedBy: {
      type: DataType.STRING
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'bulk_business_unit_temp'
  })

  BulkBusinessUnitTemp.associate = function (models) { }
  return BulkBusinessUnitTemp
}
