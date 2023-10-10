module.exports = function (sequelize, DataType) {
    const RosterHdr = sequelize.define('RosterHdr', {
        rosterId: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        rosterName: {
            type: DataType.STRING
        },
        status: {
            type: DataType.STRING
        },
        calendarId: {
            type: DataType.INTEGER
        },
        shiftId: {
            type: DataType.INTEGER
        },
        appointType: {
            type: DataType.STRING
        },
        appointLoc: {
            type: DataType.STRING
        },
        rosterUuid: {
            type: DataType.STRING,
        },
        tranId: {
            type: DataType.STRING,
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
        tableName: 'roster_hdr'
    })

    RosterHdr.associate = function (models) {

  }
    return RosterHdr
}
