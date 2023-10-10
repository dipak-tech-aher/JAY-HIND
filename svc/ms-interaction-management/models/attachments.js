module.exports = function (sequelize, DataType) {
  const Attachments = sequelize.define('Attachments', {
    attachmentId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    attachmentUuid: {
      type: DataType.STRING
    },
    fileName: {
      type: DataType.STRING
    },
    fileType: {
      type: DataType.STRING
    },
    entityType: {
      type: DataType.STRING
    },
    entityId: {
      type: DataType.STRING
    },
    attachedContent: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    tranId: {
      type: DataType.STRING
    },
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.INTEGER
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
    timestamps: true,
    underscored: true,
    tableName: 'attachments'
  })
  return Attachments
}
