module.exports = function (sequelize, DataType) {
    const RosterDtl = sequelize.define('RosterDtl', {
        rosterDtlId: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        rosterId: {
            type: DataType.INTEGER
        },
        status: {
            type: DataType.STRING
        },
        rosterDate: {
            type: DataType.DATEONLY
        },
        rosterStartTime: {
            type: DataType.TIME
        },
        rosterEndTime: {
            type: DataType.TIME
        },
        userId: {
            type: DataType.INTEGER
        },
        rosterDtlUuid: {
            type: DataType.STRING
        },
        rosterUuid: {
            type: DataType.STRING
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
        tableName: 'roster_dtl'
    })
    RosterDtl.associate = function (models) {
     models.RosterDtl.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'userDetails'
    })
  }
    return RosterDtl
}
