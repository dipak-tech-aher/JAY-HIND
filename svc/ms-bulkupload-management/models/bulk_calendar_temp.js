module.exports = function (sequelize, DataType) {
  const BulkCalendarTemp = sequelize.define('BulkCalendarTemp', {
    bulkCalendarId: {
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
    calendarName: {
      type: DataType.STRING
    },
    calendarDescription: {
      type: DataType.STRING
    },
    startDate: {
      type: DataType.DATE
    },
    endDate: {
      type: DataType.DATE
    },
    calendarUuid: {
      type: DataType.STRING
    },
    calendarTranId: {
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
    calendarCreatedDeptId: {
      type: DataType.STRING
    },
    calendarCreatedRoleId: {
      type: DataType.INTEGER
    },
    calendarCreatedBy: {
      type: DataType.STRING
    }
  },
  {
    timestamps: false,
    underscored: true,
    tableName: 'bulk_calendar_temp'
  })

  BulkCalendarTemp.associate = function (models) { }
  return BulkCalendarTemp
}
