module.exports = function (sequelize, DataType) {
  const BulkUploadRole = sequelize.define('BulkUploadRole', {
    bulkuploadId: {
      type: DataType.INTEGER
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
    status: {
      type: DataType.STRING,
      defaultValue: 'AC'
    }

  },
  {
    timestamps: false,
    underscored: true,
    tableName: 'bulk_upload_role'
  }
  )

  BulkUploadRole.removeAttribute('id')
  return BulkUploadRole
}
