module.exports = function (sequelize, DataType) {
  const Role = sequelize.define('Role', {
    roleId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    roleName: {
      type: DataType.STRING
    },
    roleDesc: {
      type: DataType.STRING
    },
    isAdmin: {
      type: DataType.STRING
    },
    parentRole: {
      type: DataType.INTEGER
    },
    status: {
      type: DataType.STRING
    },
    mappingPayload: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('mappingPayload')) : this.getDataValue('mappingPayload')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('mappingPayload', JSON.stringify(value)) : this.setDataValue('mappingPayload', value)
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
    tableName: 'roles'
  }
  )

  Role.associate = function (models) { }
  return Role
}