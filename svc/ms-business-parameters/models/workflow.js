module.exports = function (sequelize, DataType) {
  const Workflow = sequelize.define('Workflow', {
    workflowId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    intxnType: {
      type: DataType.STRING
    },
    intxnCategory: {
      type: DataType.STRING
    },
    wfDefinition: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('wfDefinition')) : this.getDataValue('wfDefinition')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('wfDefinition', JSON.stringify(value)) : this.setDataValue('wfDefinition', value)
      }
    },
    status: {
      type: DataType.STRING,
      defaultValue: 'AC'
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
    tableName: 'workflow_defn_new'
  }
  )

  Workflow.associate = function (models) { }
  return Workflow
}
