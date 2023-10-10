module.exports = function (sequelize, DataType) {
  const SkillMaster = sequelize.define(
    "SkillMaster",
    {
      skillId: {
        type: DataType.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      skillDesc: {
        type: DataType.STRING,
      },
      serviceCategory: {
        type: DataType.STRING,
      },
      serviceType: {
        type: DataType.STRING,
      },
      mapCategory: {
        type: DataType.STRING,
      },
      tranType: {
        type: DataType.STRING,
      },
      tranCategory: {
        type: DataType.STRING,
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
      tableName: "skill_mst",
    }
  );
  SkillMaster.associate = function (models) {
    models.SkillMaster.belongsTo(models.BusinessEntity, {
      foreignKey: "status",
      as: "statusDesc",
    });
    models.SkillMaster.belongsTo(models.BusinessEntity, {
      foreignKey: "serviceCategory",
      as: "serviceCategoryDesc",
    });
    models.SkillMaster.belongsTo(models.BusinessEntity, {
      foreignKey: "serviceType",
      as: "serviceTypeDesc",
    });
    models.SkillMaster.belongsTo(models.BusinessEntity, {
      foreignKey: "tranType",
      as: "tranTypeDesc",
    });
    models.SkillMaster.belongsTo(models.BusinessEntity, {
      foreignKey: "tranCategory",
      as: "tranCategoryDesc",
    });
    models.SkillMaster.belongsTo(models.User, {
      foreignKey: "createdBy",
      as: "createdByName",
    });
    models.SkillMaster.belongsTo(models.User, {
      foreignKey: "updatedBy",
      as: "updatedByName",
    });
    models.SkillMaster.hasMany(models.UserSkillMap, {
      foreignKey: "skillId",
      as: "userSkill",
    });
  };
  return SkillMaster;
};
