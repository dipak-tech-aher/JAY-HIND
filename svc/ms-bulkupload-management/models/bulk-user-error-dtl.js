module.exports = function (sequelize, DataType) {
  const BulkUserErrorDtl = sequelize.define('BulkUserErrorDtl', {
    bulkUsersDtlId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bulkUsersId: {
      type: DataType.INTEGER
    },
    email: {
      type: DataType.STRING
    },
    usersUuid: {
      type: DataType.STRING
    },
    validationRemarks: {
      type: DataType.STRING
    },
    createdAt: {
      type: DataType.DATE
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'bulk_users_error_dtl'
  })

  BulkUserErrorDtl.associate = function (models) { }
  return BulkUserErrorDtl
}
