module.exports = function (sequelize, DataType) {
  const UserSkillMap = sequelize.define(
    "UserSkillMap",
    {
      userSkillMapId: {
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      skillId: {
        type: DataType.INTEGER,
      },
      userId: {
        type: DataType.INTEGER,
      },
      status: {
        type: DataType.STRING,
      },
      createdBy: {
        type: DataType.INTEGER,
      },
      createdAt: {
        type: DataType.DATE,
      },
      updatedBy: {
        type: DataType.INTEGER,
      },
      updatedAt: {
        type: DataType.DATE,
      },
      tranId: {
        type: DataType.STRING,
        allowNull: false,
      },
      createdDeptId: {
        type: DataType.STRING,
      },
      createdRoleId: {
        type: DataType.INTEGER,
      },
    },
    {
      timestamps: true,
      underscored: true,
      tableName: "user_skill_map",
    }
  );
  UserSkillMap.associate = function (models) {
    models.UserSkillMap.belongsTo(models.BusinessEntity, {
      foreignKey: "status",
      as: "statusDesc",
    });
    models.UserSkillMap.belongsTo(models.User, {
      foreignKey: "userId",
      as: "userDet",
    });
    models.UserSkillMap.belongsTo(models.User, {
      foreignKey: "createdBy",
      as: "createdByName",
    });
    models.UserSkillMap.belongsTo(models.User, {
      foreignKey: "updatedBy",
      as: "updatedByName",
    });
  };
  return UserSkillMap;
};
