module.exports = function (sequelize, DataType) {
  const NotificationHdr = sequelize.define('NotificationHdr', {
    notifyId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    notifyName: {
      type: DataType.STRING
    },
    notifyType: {
      type: DataType.STRING
    },
    effectiveFrom: {
      type: DataType.DATEONLY
    },
    effectiveTo: {
      type: DataType.DATEONLY
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
    tableName: 'notification_hdr'
  }
  )
  NotificationHdr.associate = function (models) {
    models.NotificationHdr.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    models.NotificationHdr.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.NotificationHdr.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    models.NotificationHdr.hasMany(models.NotificationDtl, {
      foreignKey: 'notifyId',
      as: 'notificationDtl'
    })
  }
  return NotificationHdr
}
