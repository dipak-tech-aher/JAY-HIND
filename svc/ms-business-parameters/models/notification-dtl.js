module.exports = function (sequelize, DataType) {
  const NotificationDtl = sequelize.define('NotificationDtl', {
    notifyDtlId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    notifyId: {
      type: DataType.INTEGER
    },
    toReceipents: {
      type: DataType.STRING
    },
    ccReceipents: {
      type: DataType.STRING
    },
    bccReceipents: {
      type: DataType.STRING
    },
    subject: {
      type: DataType.STRING
    },
    notifyContent: {
      type: DataType.STRING
    },
    status: {
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
    tranId: {
      type: DataType.STRING,
      allowNull: false
    },
    createdDeptId: {
        type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.INTEGER
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'notification_dtl'
  }
  )
  NotificationDtl.associate = function (models) {
    models.NotificationDtl.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    models.NotificationDtl.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.NotificationDtl.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    models.NotificationDtl.belongsTo(models.NotificationHdr, {
      foreignKey: 'notifyId',
      as: 'notificationHdr'
    })
  }
  return NotificationDtl
}
