module.exports = function (sequelize, DataType) {
  const RoleFamily = sequelize.define('RoleFamily', {
    roleFamilyId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    roleFamilyName: {
      type: DataType.STRING
    },
    roleFamilyCode: {
      type: DataType.STRING
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
    tableName: 'ad_roles_family'
  }
  )

  return RoleFamily
}
