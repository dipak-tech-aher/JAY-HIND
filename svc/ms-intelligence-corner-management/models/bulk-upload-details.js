
module.exports = function (sequelize, DataType) {
  const BulkUploadDtl = sequelize.define('BulkUploadDtl', {
    uploadProcessId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    bulkUploadType: {
      type: DataType.STRING
    },
    noOfRecordsAttempted: {
      type: DataType.STRING
    },
    successfullyUploaded: {
      type: DataType.STRING
    },
    failed: {
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
  }, {
    tableName: 'bulk_upload_dtl',
    timestamps: true,
    underscored: true
  })
  BulkUploadDtl.associate = function (models) {
    models.BulkUploadDtl.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
  }

  return BulkUploadDtl
}
