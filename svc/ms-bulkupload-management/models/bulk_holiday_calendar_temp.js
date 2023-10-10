module.exports = function (sequelize, DataType) {
  const BulkHolidayCalendarTemp = sequelize.define('BulkHolidayCalendarTemp', {
    bulkHolidayId: {
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
    holidayDate:{
      type: DataType.DATE
    },
    holidayDayName: {
      type: DataType.STRING
    },
    holidayDescription : {
      type: DataType.STRING
    },
    holidayType: {
      type: DataType.STRING
    },
    holidayComment: {
      type: DataType.STRING
    },
    holidayTranId: {
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
    tableName: 'bulk_holiday_calendar_temp'
  })

  BulkHolidayCalendarTemp.associate = function (models) { }
  return BulkHolidayCalendarTemp
}
