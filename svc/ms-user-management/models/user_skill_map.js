module.exports = function (sequelize, DataType) {
    const UserSkillMap = sequelize.define('UserSkillMap', {
        userSkillMapId: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataType.INTEGER
        },
        skillId: {
            type: DataType.INTEGER
        },
        status: {
            type: DataType.STRING
        },
        userSkillMapUuid: {
            type: DataType.STRING
        },
        userUuid: {
            type: DataType.STRING
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
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'user_skill_map'
    })

    UserSkillMap.associate = function (models) { }
    return UserSkillMap
}
