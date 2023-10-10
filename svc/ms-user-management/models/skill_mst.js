module.exports = function (sequelize, DataType) {
    const SkillMst = sequelize.define('SkillMst', {
        skillId: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        skillDesc: {
            type: DataType.TEXT
        },
        status: {
            type: DataType.STRING
        },
        serviceCategory: {
            type: DataType.STRING
        },
        serviceType: {
            type: DataType.STRING
        },
        validTill: {
            type: DataType.DATE
        },
        skillUuid: {
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
        mapCategory: {
            type: DataType.STRING
        },
        tranCategory: {
            type: DataType.STRING
        },
        tranType: {
            type: DataType.STRING
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'skill_mst'
    })

    SkillMst.associate = function (models) { }
    return SkillMst
}
