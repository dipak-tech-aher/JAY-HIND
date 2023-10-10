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
            type: DataType.STRING
        },
        shiftId: {
            type: DataType.STRING
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

  }
    return AppointmentDtl
}
