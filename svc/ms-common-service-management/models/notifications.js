module.exports = function (sequelize, DataType) {
  const Notification = sequelize.define('Notification', {
    notificationId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ccEmail: {
      type: DataType.STRING
    },
    contactNo: {
      type: DataType.INTEGER
    },
    notificationType: {
      type: DataType.STRING
    },
    subject: {
      type: DataType.STRING
    },
    channel: {
      type: DataType.STRING
    },
    body: {
      type: DataType.STRING
    },
    referenceId: {
      type: DataType.INTEGER
    },
    userId: {
      type: DataType.INTEGER
    },
    roleId: {
      type: DataType.INTEGER
    },
    // departmentId: {
    //   type: DataType.STRING
    // },
    notificationSource: {
      type: DataType.STRING
    },
    createdAt: {
      type: DataType.DATE,
      defaultValue: new Date()
    },
    sentAt: {
      type: DataType.DATE,
      defaultValue: new Date()
    },
    status: {
      type: DataType.STRING,
      defaultValue: 'NEW'
    },
    isViewed: {
      type: DataType.STRING,
      defaultValue: 'N'
    },
    retries: {
      type: DataType.INTEGER,
      defaultValue: 0
    },
    markedusers: {
      type: DataType.JSONB
    },
    createdBy: {
      type: DataType.INTEGER
    },
    category: {
      type: DataType.VIRTUAL,
      get () {
        return this.userId === null ? 'POOL' : 'SELF'
      },
      set (value) {
        throw new Error('Do not try to set the `category` value!')
      }
    },
    payload: {
      type: DataType.JSONB
    },
    referenceNo: {
      type: DataType.STRING
    }
  },
  {
    timestamps: false,
    underscored: true,
    tableName: 'cc_notifications'
  }
  )
  Notification.associate = function (models) {
    models.Notification.hasOne(models.NotificationUserEvents, {
      foreignKey: 'notificationId',
      as: 'notificationEvents'
    })

    models.Notification.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'userDetails'
    })

    models.Notification.belongsTo(models.Role, {
      foreignKey: 'roleId',
      as: 'roleDetails'
    })

    models.Notification.belongsTo(models.BusinessUnit, {
      foreignKey: 'departmentId',
      as: 'businessUnitDetails'
    })

    models.Notification.belongsTo(models.BusinessEntity, {
      foreignKey: 'notificationSource',
      as: 'notificationSourceDesc'
    })

    models.Notification.hasOne(models.Interaction, {
      sourceKey: 'referenceNo',
      foreignKey: 'intxnNo',
      as: 'interactionDetails'
    })

    models.Notification.hasOne(models.Orders, {
      sourceKey: 'referenceNo',
      foreignKey: 'orderNo',
      as: 'orderDetails'
    })

    models.Notification.hasOne(models.AppointmentTxn, {
      sourceKey: 'referenceNo',
      foreignKey: 'appointmentTxnNo',
      as: 'appointmentDetails'
    })

    models.Notification.hasOne(models.Request, {
      sourceKey: 'referenceNo',
      foreignKey: 'requestNo',
      as: 'requestDetails'
    })
  }

  return Notification
}
