module.exports = function (sequelize, DataType) {
  const TemplateMapping = sequelize.define('TemplateMapping', {
    templateMapId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    templateId: {
      type: DataType.INTEGER
    },
    templateMapName: {
      type: DataType.STRING
    },
    mapCategory: {
      type: DataType.STRING
    },
    serviceCategory: {
      type: DataType.STRING
    },
    serviceType: {
      type: DataType.STRING
    },
    customerClass: {
      type: DataType.STRING
    },
    customerCategory: {
      type: DataType.STRING
    },
    tranType: {
      type: DataType.STRING
    },
    tranCategory: {
      type: DataType.STRING
    },
    tranPriority: {
      type: DataType.STRING
    },
    status: {
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
    isPinned: {
      type: DataType.BOOLEAN
    },
    objectName: {
      type: DataType.STRING
    },
    objectReference: {
      type: DataType.INTEGER
    },
    tranEntity: {
      type: DataType.STRING
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'template_mapping'
  }
  )
  TemplateMapping.associate = function (models) {
    models.TemplateMapping.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    models.TemplateMapping.belongsTo(models.BusinessEntity, {
      foreignKey: 'serviceCategory',
      as: 'serviceCategoryDesc'
    })
    models.TemplateMapping.belongsTo(models.BusinessEntity, {
      foreignKey: 'serviceType',
      as: 'serviceTypeDesc'
    })
    models.TemplateMapping.belongsTo(models.BusinessEntity, {
      foreignKey: 'customerCategory',
      as: 'customerCategoryDesc'
    })
    models.TemplateMapping.belongsTo(models.BusinessEntity, {
      foreignKey: 'mapCategory',
      as: 'mapCategoryDesc'
    })
    models.TemplateMapping.belongsTo(models.BusinessEntity, {
      foreignKey: 'tranType',
      as: 'tranTypeDesc'
    })
    models.TemplateMapping.belongsTo(models.BusinessEntity, {
      foreignKey: 'tranCategory',
      as: 'tranCategoryDesc'
    })
    models.TemplateMapping.belongsTo(models.BusinessEntity, {
      foreignKey: 'tranPriority',
      as: 'tranPriorityDesc'
    })
    models.TemplateMapping.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.TemplateMapping.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    models.TemplateMapping.belongsTo(models.TemplateHdr, {
      foreignKey: 'templateId',
      as: 'templateMst'
    })
  }
  return TemplateMapping
}
