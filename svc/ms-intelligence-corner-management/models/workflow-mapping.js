module.exports = function (sequelize, DataType) {
  const WorkflowMapping = sequelize.define('WorkflowMapping', {
    mappingId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    mappingName: {
      type: DataType.STRING
    },
    moduleName: {
      type: DataType.STRING
    },
    workflowId: {
      type: DataType.INTEGER
    },
    mappingPayload: {
      type: DataType.JSONB
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
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'workflow_mapping'
  })
  WorkflowMapping.associate = function (models) {
    models.WorkflowMapping.belongsTo(models.BusinessEntity, {
      foreignKey: 'moduleName',
      as: 'moduleDescription'
    })
    models.WorkflowMapping.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDescription'
    })
    models.WorkflowMapping.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
  }

  return WorkflowMapping
}
