module.exports = function (sequelize, DataType) {
  const BulkRequestStatementTemp = sequelize.define('BulkRequestStatementTemp', {
    bulkReqStatId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bulkUploadId: {
      type: DataType.INTEGER
    },
    intxnStatement: {
      type: DataType.STRING
    },
    intxnCategory: {
      type: DataType.STRING
    },
    intxnType: {
      type: DataType.STRING
    },
    serviceCategory: {
      type: DataType.STRING
    },
    serviceType: {
      type: DataType.STRING
    },
    priority: {
      type: DataType.STRING
    },
    intxnStatCause: {
      type: DataType.STRING
    },
    intxnResolution: {
      type: DataType.STRING
    },
    createDate: {
      type: DataType.DATE
    },
    validationFlag: {
      type: DataType.STRING
    },
    validationRemarks: {
      type: DataType.STRING
    },
    uploadFlag: {
      type: DataType.STRING
    },
    uploadRemarks: {
      type: DataType.STRING
    },
    reqStatTranId: {
      type: DataType.STRING
    },
    reqStatCreatedDeptId: {
      type: DataType.STRING
    },
    reqStatCreatedRoleId: {
      type: DataType.INTEGER
    },
    reqStatCreateBy: {
      type: DataType.STRING
    },
    updatedAt: {
      type: DataType.DATE
    },
    reqStatementClass: {
      type: DataType.STRING
    },
    multiLang: {
      type: DataType.STRING
    },
    multiLangIntxnStatement: {
      type: DataType.STRING
    },
    multiLangIntxnResolution: {
      type: DataType.STRING
    },
    isAppointment: {
      type: DataType.STRING
    },
    isOrder: {
      type: DataType.STRING
    },
    orderCategory: {
      type: DataType.STRING
    },
    orderType: {
      type: DataType.STRING
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'bulk_request_statement_temp'
  })

  BulkRequestStatementTemp.associate = function (models) { }
  return BulkRequestStatementTemp
}
