module.exports = function (sequelize, DataType) {
    const AppointmentDtl = sequelize.define('AppointmentDtl', {
        appointDtlId: {
            type: DataType.INTEGER,
            primaryKey: true
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
            type: DataType.STRING
        },
        shiftId: {
            type: DataType.DATE
        },
        appointDate: {
            type: DataType.STRING
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
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'appointment_dtl'
    })
    AppointmentDtl.associate = function (models) {
        models.AppointmentDtl.belongsTo(models.BusinessEntity, {
            foreignKey: 'appointMode',
            as: 'appoinmentTypeDesc'
        })
        models.AppointmentDtl.belongsTo(models.AppointmentHdr, {
            foreignKey: 'appointId',
            as: 'appoinmentDesc'
        })
        // models.AppointmentDtl.belongsTo(models.Customer, {
        //     foreignKey: 'appointUserId',
        //     as: 'appointmentCustomer'
        // })
        // models.AppointmentDtl.belongsTo(models.User, {
        //     foreignKey: 'appointAgentId',
        //     as: 'appointmentAgent'
        // })
    }
    return AppointmentDtl
}
