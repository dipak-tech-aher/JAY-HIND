module.exports = function (sequelize, DataType) {
    const AppointmentHdr = sequelize.define('AppointmentHdr', {
        appointId: {
            type: DataType.INTEGER,
            primaryKey: true
        },
        appointName: {
            type: DataType.STRING
        },
        status: {
            type: DataType.STRING
        },
        templateId: {
            type: DataType.INTEGER
        },
        appointType: {
            type: DataType.STRING
        },
        userGroup: {
            type: DataType.DATE
        },
        location: {
            type: DataType.STRING
        },
        notifyId: {
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
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'appointment_hdr'
    })
    AppointmentHdr.associate = function (models) {
        models.AppointmentHdr.belongsTo(models.AppointmentDtl, {
            foreignKey: 'appointId',
            as: 'appoinmentDetails'
        })

        // models.AppointmentHdr.belongsTo(models.Customer, {
        //     foreignKey: 'appointUserId',
        //     as: 'appointmentCustomer'
        // })
        // models.AppointmentHdr.belongsTo(models.User, {
        //     foreignKey: 'appointAgentId',
        //     as: 'appointmentAgent'
        // })
    }
    return AppointmentHdr
}
