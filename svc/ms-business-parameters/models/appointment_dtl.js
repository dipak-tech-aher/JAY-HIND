module.exports = function (sequelize, DataType) {
    const AppointmentDtl = sequelize.define('AppointmentDtl', {
        appointDtlId: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        appointId: {
            type: DataType.INTEGER
        },
        status: {
            type: DataType.STRING
        },
        appointMode: {
            type: DataType.STRING
        },
        calenderId: {
            type: DataType.INTEGER
        },
        shiftId: {
            type: DataType.INTEGER
        },
        appointDate: {
            type: DataType.DATEONLY
        },
        workType: {
            type: DataType.STRING
        },
        appointInterval: {
            type: DataType.STRING
        },
        appointAgentsAvailability: {
            type: DataType.INTEGER
        },
        appointStartTime: {
            type: DataType.TIME
        },
        appointEndTime: {
            type: DataType.TIME
        },
        divId: {
            type: DataType.INTEGER
        },
        tranId: {
            type: DataType.STRING,
            allowNull: false
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
        updatedBy: {
            type: DataType.INTEGER
        },
        updatedAt: {
            type: DataType.DATE
        },
        userId: {
            type: DataType.INTEGER 
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'appointment_dtl'
    })
    AppointmentDtl.associate = function (models) {
    models.AppointmentDtl.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    models.AppointmentDtl.belongsTo(models.BusinessEntity, {
      foreignKey: 'appointMode',
      as: 'appointModeDesc'
    })
    models.AppointmentDtl.belongsTo(models.CalendarMaster, {
      foreignKey: 'calenderId',
      as: 'calendarDet'
    })
    models.AppointmentDtl.belongsTo(models.ShiftMst, {
      foreignKey: 'shiftId',
      as: 'shiftDet'
    })
    models.AppointmentDtl.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.AppointmentDtl.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    models.AppointmentDtl.belongsTo(models.AppointmentHdr, {
      foreignKey: 'appointId',
      as: 'appointmentHdr'
    })
    models.AppointmentDtl.hasMany(models.AppointmentTxn, {
        foreignKey: 'appointDtlId',
        sourceKey: 'appointDtlId',
        as: 'appointmentTxnDetails'
    })
  }
    return AppointmentDtl
}
