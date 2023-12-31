module.exports = function (sequelize, DataType) {
  const Attachment = sequelize.define('Attachment', {
    attachmentId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
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
  return Attachment
}
