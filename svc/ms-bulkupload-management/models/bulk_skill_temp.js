module.exports = function (sequelize, DataType) {
  const BulkSkillTemp = sequelize.define('BulkSkillTemp', {
    bulkSkillId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bulkUploadId: {
      type: DataType.INTEGER
    },
    skillDescription: {
      type: DataType.STRING
    },
    serviceCategory: {
      type: DataType.STRING
    },
    serviceType: {
      type: DataType.STRING
    },
    entityName: {
      type: DataType.STRING
    },
    entityCategory: {
      type: DataType.STRING
    },
    entityType: {
      type: DataType.STRING
    },
    validationFlag: {
      type: DataType.STRING
    },
    uploadFlag: {
      type: DataType.STRING
    },
    validationRemarks: {
      type: DataType.STRING
    },
    uploadRemarks: {
      type: DataType.STRING
    },
    skillTranId: {
      type: DataType.STRING
    },
    skillCreatedDeptId: {
      type: DataType.STRING
    },
    skillCreatedRoleId: {
      type: DataType.INTEGER
    },
    skillCreatedBy: {
      type: DataType.STRING
    },
    createdAt: {
      type: DataType.DATE
    },
    updatedAt: {
      type: DataType.DATE
    }

  },
    {
      timestamps: true,
      underscored: true,
      tableName: 'bulk_skill_mst_temp'
    })

  BulkSkillTemp.associate = function (models) { }
  return BulkSkillTemp
}
