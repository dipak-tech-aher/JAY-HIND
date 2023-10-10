module.exports = function (sequelize, DataType) {
  const Tasks = sequelize.define('Tasks', {
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
    isMandatoryFla: {
      type: DataType.STRING
    },
    taskUuid: {
      type: DataType.STRING
    },
    taskOptions: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? this.getDataValue('taskOptions') ? JSON.parse(this.getDataValue('taskOptions')) : this.getDataValue('taskOptions') : this.getDataValue('taskOptions')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('taskOptions', JSON.stringify(value)) : this.setDataValue('taskOptions', value)
      }
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
    })

  Tasks.associate = function (models) { }
  return Tasks
}
