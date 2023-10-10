module.exports = function (sequelize, DataType) {
  const CalendarMaster = sequelize.define('CalendarMaster', {
    calendarId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    calendarNo: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    calendarShortName: {
      type: DataType.STRING
    },
    calendarDescription: {
      type: DataType.STRING
    },
    calendarStartDt: {
      type: DataType.DATEONLY
    },
    calendarEndDt: {
      type: DataType.DATEONLY
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
    calendarUuid: {
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
    tableName: 'calendar_mst'
  }
  )

  CalendarMaster.associate = function (models) {
    models.CalendarMaster.belongsTo(models.BusinessUnit, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    models.CalendarMaster.hasMany(models.HolidayMaster, {
      foreignKey: 'calendarId',
      as: 'holidayDet'
    })
  }
  return CalendarMaster
}
