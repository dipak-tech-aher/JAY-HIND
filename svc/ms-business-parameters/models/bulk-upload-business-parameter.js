module.exports = function (sequelize, DataType) {
  const BulkUploadBusinessEntity = sequelize.define('BulkUploadBusinessEntity', {
    bulkuploadId: {
      type: DataType.INTEGER
    },
    code: {
      type: DataType.STRING
    },
    description: {
      type: DataType.STRING
    },
    codeType: {
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
    tableName: 'bulk_upload_business_entity'
  }
  )
  // BulkUploadBusinessEntity.associate = function (models) {
  //   models.BulkUploadBusinessEntity.belongsTo(models.User, {
  //     foreignKey: 'createdBy',
  //     as: 'createdByName'
  //   })
  // }
  BulkUploadBusinessEntity.removeAttribute('id')
  return BulkUploadBusinessEntity
}
