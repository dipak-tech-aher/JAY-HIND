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
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? this.getDataValue('notificationType') ? JSON.parse(this.getDataValue('notificationType')) : this.getDataValue('notificationType') : this.getDataValue('notificationType')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('notificationType', JSON.stringify(value)) : this.setDataValue('notificationType', value)
      }
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
    refernceSubId: {
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
    }
  },
  {
    timestamps: false,
    underscored: true,
    tableName: 'cc_notifications'
  }
  )

  return Notification
}
