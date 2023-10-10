module.exports = function (sequelize, DataType) {
  const BulkShiftTemp = sequelize.define('BulkShiftTemp', {
    bulkShiftId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bulkUploadId: {
      type: DataType.INTEGER
    },
    status: {
      type: DataType.STRING
    },
    shiftShortName: {
      type: DataType.STRING
    },
    shiftDescription: {
      type: DataType.STRING
    },
    shiftStartTime: {
      type: DataType.TIME
    },
    shiftEndTime: {
      type: DataType.TIME
    },
    shiftUuid: {
      type: DataType.STRING
    },
    shiftTranId: {
      type: DataType.STRING
    },
    calendarName:{
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
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.INTEGER
    },
    createdBy: {
      type: DataType.STRING
    },
    createdAt:{
      type: DataType.DATE
    }
  },
  {
    timestamps: false,
    underscored: true,
    tableName: 'bulk_shift_temp'
  })

  BulkShiftTemp.associate = function (models) { }
  return BulkShiftTemp
}
