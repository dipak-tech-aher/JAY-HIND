module.exports = function (sequelize, DataType) {
  const TaskMst = sequelize.define('TaskMst', {
    taskId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    taskNo: {
      type: DataType.STRING
    },
    taskName: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    taskOptions: {
      type: DataType.JSONB
    },
    isMandatoryFla: {
      type: DataType.STRING
    },
    taskUuid: {
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
    tableName: 'task_mst'
  }
  )
  TaskMst.associate = function (models) {
    // models.TaskMst.belongsTo(models.BusinessEntity, {
    //     foreignKey: 'gender',
    //     as: 'genderDesc'
    // })
    // models.TaskMst.belongsTo(models.BusinessEntity, {
    //     foreignKey: 'idType',
    //     as: 'idTypeDesc'
    // })
    // models.TaskMst.belongsTo(models.BusinessEntity, {
    //     foreignKey: 'status',
    //     as: 'statusDesc'
    // })
    // models.TaskMst.belongsTo(models.BusinessEntity, {
    //     foreignKey: 'customerCategory',
    //     as: 'customerCatDesc'
    // })
    // models.TaskMst.belongsTo(models.BusinessEntity, {
    //     foreignKey: 'customerClass',
    //     as: 'customerClassDesc'
    // })
    // models.TaskMst.belongsTo(models.User, {
    //     foreignKey: 'createdBy',
    //     as: 'createdByName'
    // })
    // models.TaskMst.belongsTo(models.User, {
    //     foreignKey: 'updatedBy',
    //     as: 'updatedByName'
    // })
    // models.TaskMst.hasMany(models.Contact, {
    //     sourceKey: 'customerNo',
    //     foreignKey: 'contactCategoryValue',
    //     as: 'customerContact'
    // })
  }
  return TaskMst
}
