module.exports = function (sequelize, DataType) {
  const AppointmentTxn = sequelize.define('AppointmentTxn', {
    appointTxnId: {
      type: DataType.BIGINT,
      primaryKey: true,
      autoIncrement: true
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
    medium: {
      type: DataType.STRING
    },
    mediumData: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('mediumData')) : this.getDataValue('mediumData')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('mediumData', JSON.stringify(value)) : this.setDataValue('mediumData', value)
      }

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
    tranCategoryType: {
      type: DataType.STRING
    },
    tranCategoryNo: {
      type: DataType.STRING
    },
    tranCategoryUuid: {
      type: DataType.STRING
    },
    tranId: {
      type: DataType.STRING,
      allowNull: false
    },
    appointStatusReason: {
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
    tableName: 'appointment_txn'
  })

  AppointmentTxn.associate = function (models) {
    models.AppointmentTxn.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    models.AppointmentTxn.belongsTo(models.BusinessEntity, {
      foreignKey: 'appointMode',
      as: 'appoinmentModeDesc'
    })
    models.AppointmentTxn.belongsTo(models.BusinessEntity, {
      foreignKey: 'appointModeValue',
      as: 'appointModeValueDesc'
    })
    models.AppointmentTxn.belongsTo(models.BusinessEntity, {
      foreignKey: 'tranCategoryType',
      as: 'tranCategoryTypeDesc'
    })
    models.AppointmentTxn.belongsTo(models.Customer, {
      foreignKey: 'appointUserId',
      as: 'appointmentCustomer'
    })
    models.AppointmentTxn.belongsTo(models.User, {
      foreignKey: 'appointAgentId',
      as: 'appointmentAgent'
    })

    models.AppointmentTxn.belongsTo(models.AppointmentHdr, {
      foreignKey: 'appointId',
      as: 'appointmentHdrDetails'
    })
  }

  return AppointmentTxn
}
