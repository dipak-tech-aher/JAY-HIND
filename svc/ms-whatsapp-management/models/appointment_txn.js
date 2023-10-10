module.exports = function (sequelize, DataType) {
  const AppointmentTxn = sequelize.define('AppointmentTxn', {
    appointTxnId: {
      type: DataType.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    appointDtlId: {
      type: DataType.INTEGER
    },
    appointId: {
      type: DataType.INTEGER
    },
    appointDate: {
      type: DataType.DATE
    },
    status: {
      type: DataType.STRING
    },
    appointUserCategory: {
      type: DataType.STRING
    },
    appointUserId: {
      type: DataType.BIGINT
    },
    appointAgentId: {
      type: DataType.INTEGER
    },
    appointMode: {
      type: DataType.STRING
    },
    appointModeValue: {
      type: DataType.STRING
    },
    appointStartTime: {
      type: DataType.TIME
    },
    appointEndTime: {
      type: DataType.TIME
    },
    calenderId: {
      type: DataType.STRING
    },
    shiftId: {
      type: DataType.STRING
    },
    tranId: {
      type: DataType.STRING,
      allowNull: false
    },
    medium: {
      type: DataType.STRING
    },
    mediumData: {
      type: DataType.JSONB
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
    },
    tranCategoryType: {
      type: DataType.STRING
    },
    tranCategoryNo: {
      type: DataType.STRING
    },
    tranCategoryUuid: {
      type: DataType.STRING
    },
    appointmentTxnNo: {
      type: DataType.STRING
    }
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'appointment_txn'
  })

  AppointmentTxn.associate = function (models) {
    models.AppointmentTxn.belongsTo(models.BusinessEntity, {
      foreignKey: 'appointMode',
      as: 'appointModeDesc'
    })
    models.AppointmentTxn.belongsTo(models.BusinessEntity, {
      foreignKey: 'appointModeValue',
      as: 'appointModeValueDesc'
    })
    models.AppointmentTxn.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    models.AppointmentTxn.belongsTo(models.User, {
      foreignKey: 'appointAgentId',
      as: 'appointAgentDesc'
    })

    models.AppointmentTxn.hasOne(models.Interaction, {
      sourceKey: 'tranCategoryNo',
      foreignKey: 'intxnNo',
      as: 'interactionDetails'
    })
  }

  return AppointmentTxn
}
