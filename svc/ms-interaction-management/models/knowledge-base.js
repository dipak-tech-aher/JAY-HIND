module.exports = function (sequelize, DataType) {
  const KnowledgeBase = sequelize.define('KnowledgeBase', {
    requestId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
    status: {
      type: DataType.STRING
    },
    requestStatement: {
      type: DataType.STRING
    },
    intxnResolution: {
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
    },
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.INTEGER
    },
    tranId: {
      type: DataType.STRING
    },
    metaAttributes: {
      type: DataType.JSONB
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'ad_request_assisted_dtl'
  })

  return KnowledgeBase
}
