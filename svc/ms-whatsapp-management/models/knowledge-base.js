module.exports = function (sequelize, DataType) {
  const KnowledgeBase = sequelize.define('KnowledgeBase', {
    requestId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    intxnCategory: {
      type: DataType.STRING
    },
    intxnType: {
      type: DataType.STRING
    },
    serviceCategory: {
      type: DataType.STRING
    },
    serviceType: {
      type: DataType.STRING
    },
    intxnCause: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    requestStatement: {
      type: DataType.STRING
    },
    intxnResolution: {
      type: DataType.STRING
    },
    priorityCode: {
      type: DataType.STRING
    },
    triggerType: {
      type: DataType.STRING
    },
    isAppointment: {
      type: DataType.STRING
    },
    statementClass: {
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
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.INTEGER
    },
    tranId: {
      type: DataType.STRING
    },
    metaAttributes: {
      type: DataType.JSONB
    },
    shortStatement: {
      type: DataType.STRING
    }
  },
    {
      timestamps: true,
      underscored: true,
      tableName: 'ad_request_assisted_dtl'
    })

  KnowledgeBase.associate = function (models) {
    models.KnowledgeBase.belongsTo(models.BusinessEntity, {
      foreignKey: 'intxnCategory',
      as: 'intxnCategoryDesc'
    })
    models.KnowledgeBase.belongsTo(models.BusinessEntity, {
      foreignKey: 'intxnType',
      as: 'intxnTypeDesc'
    })
    models.KnowledgeBase.belongsTo(models.BusinessEntity, {
      foreignKey: 'serviceType',
      as: 'serviceTypeDesc'
    })
    models.KnowledgeBase.belongsTo(models.BusinessEntity, {
      foreignKey: 'serviceCategory',
      as: 'serviceCategoryDesc'
    })
    models.KnowledgeBase.belongsTo(models.BusinessEntity, {
      foreignKey: 'intxnCause',
      as: 'intxnCauseDesc'
    })
    models.KnowledgeBase.belongsTo(models.BusinessEntity, {
      foreignKey: 'priorityCode',
      as: 'priorityCodeDesc'
    })
    models.KnowledgeBase.belongsTo(models.BusinessEntity, {
      foreignKey: 'intxnResolution',
      as: 'intxnResolutionDesc'
    })
  }
  return KnowledgeBase
}
