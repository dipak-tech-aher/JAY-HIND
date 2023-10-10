module.exports = function (sequelize, DataType) {
  const NotificationUserEvents = sequelize.define('NotificationUserEvents', {
    notificationUserEventId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    notificationId: {
      type: DataType.INTEGER
    },
    userId: {
      type: DataType.INTEGER
    },
    isRead: {
      type: DataType.BOOLEAN
    },
    isPinned: {
      type: DataType.BOOLEAN
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
  },
  {
    timestamps: false,
    underscored: true,
    tableName: 'cc_notification_user_events'
  }
  )

  NotificationUserEvents.associate = function (models) {
    models.NotificationUserEvents.belongsTo(models.Notification, {
      foreignKey: 'notificationId',
      as: 'userEvents'
    })
  }

  return NotificationUserEvents
}
