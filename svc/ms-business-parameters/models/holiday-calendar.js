module.exports = function (sequelize, DataType) {
  const HolidayMaster = sequelize.define('HolidayMaster', {
    holidayId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    calendarId: {
      type: DataType.INTEGER
    },
    calendarUuid: {
      type: DataType.STRING
    },
    holidayNo: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    holidayDate: {
      type: DataType.DATEONLY
    },
    holidayDayName: {
      type: DataType.STRING
    },
    holidayDescription: {
      type: DataType.STRING
    },
    holidayType: {
      type: DataType.STRING
    },
    holidayComment: {
      type: DataType.STRING
    },
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.INTEGER
    },
    tranId: {
      type: DataType.STRING
    },
    holidayUuid: {
      type: DataType.STRING
    },
    createdBy: {
      type: DataType.INTEGER,
      references: {
        model: 'User',
        key: 'code'
      }
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
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'holiday_calendar'
  }
  )

  HolidayMaster.associate = function (models) {
    models.HolidayMaster.belongsTo(models.BusinessUnit, {
      foreignKey: 'status',
      as: 'statusDesc'
    })

    models.HolidayMaster.belongsTo(models.BusinessEntity, {
      foreignKey: 'holidayDayName',
      as: 'holidayDayNameDesc'
    })

    models.HolidayMaster.belongsTo(models.CalendarMaster, {
      foreignKey: 'calendarId',
      as: 'calendarDet'
    })
  }
  return HolidayMaster
}
