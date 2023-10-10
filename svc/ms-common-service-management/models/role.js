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
    roleFamilyId: {
      type: DataType.INTEGER
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
    createdDeptId: {
      type: DataType.STRING
    },
    tranId: {
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
    tableName: 'ad_roles'
  }
  )

  // Role.associate = function (models) {
  //   models.Role.belongsTo(models.RoleFamily, {
  //     foreignKey: 'roleFamilyId',
  //     as: 'roleFamily'
  //   })
  // }
  return Role
}
