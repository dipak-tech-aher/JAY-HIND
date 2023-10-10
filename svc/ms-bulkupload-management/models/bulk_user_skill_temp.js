module.exports = function (sequelize, DataType) {
  const BulkUserSkillTemp = sequelize.define('BulkUserSkillTemp', {
    bulkSkillMapId: {
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
    emailId: {
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
    skillMapTranId: {
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
    tableName: 'bulk_skill_mst_mapping_temp'
  })

  BulkUserSkillTemp.associate = function (models) { }
  return BulkUserSkillTemp
}
