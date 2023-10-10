module.exports = function (sequelize, DataType) {
  const BulkUploadDetail = sequelize.define('BulkUploadDetail', {
    bulkUploadId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    uploadTableName: {
      type: DataType.STRING
    },
    uploadFileName: {
      type: DataType.STRING
    },
    uploadStatus: {
      type: DataType.STRING
    },
    createdBy: {
      type: DataType.INTEGER
    },
    createdAt: {
      type: DataType.DATE
    },
    updatedAt: {
      type: DataType.DATE
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'bulk_upload_detail'
  }
  )

  BulkUploadDetail.associate = function (models) {
    models.BulkUploadDetail.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByUser'
    })
  }
  return BulkUploadDetail
}
