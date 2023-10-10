module.exports = function (sequelize, DataType) {
    const ShiftMst = sequelize.define('ShiftMst', {
        shiftId: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        shiftNo: {
            type: DataType.STRING
        },
        shiftShortName: {
            type: DataType.STRING
        },
        shiftDescription: {
            type: DataType.STRING
        },
        status: {
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
        tranId: {
            type: DataType.STRING
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
    },
        {
            timestamps: true,
            underscored: true,
            tableName: 'shift_mst'
        }
    )
    return ShiftMst
}
