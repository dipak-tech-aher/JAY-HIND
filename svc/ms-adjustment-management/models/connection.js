module.exports = function (sequelize, DataType) {
  const Connection = sequelize.define('Connection', {
    connectionId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    accountId: {
      type: DataType.INTEGER
    },
    connectionName: {
      type: DataType.STRING
    },
    connectionType: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    connectionGrp: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    exchngCode: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    dealership: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    identificationNo: {
      type: DataType.STRING
    },
    iccid: {
      type: DataType.STRING
    },
    imsi: {
      type: DataType.STRING
    },
    creditProf: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    isPorted: {
      type: DataType.STRING
    },
    donor: {
      type: DataType.STRING
    },
    charge: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    excludeReason: {
      type: DataType.STRING
    },
    paymentMethod: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    status: {
      type: DataType.STRING,
      defaultValue: 'ACTIVE',
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    connectionSelection: {
      type: DataType.STRING
    },
    deposit: {
      type: DataType.STRING
    },
    addressId: {
      type: DataType.INTEGER
    },
    mappingPayload: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('mappingPayload')) : this.getDataValue('mappingPayload')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('mappingPayload', JSON.stringify(value)) : this.setDataValue('mappingPayload', value)
      }
    },
    assignSimLater: {
      type: DataType.STRING
    },
    serviceStartDate: {
      type: DataType.DATE
    },
    serviceStopDate: {
      type: DataType.DATE
    },
    billRefNo: {
      type: DataType.STRING
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
    accountUuid: {
      type: DataType.STRING
    },
    connectionUuid: {
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
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'cust_connections'
  }
  )
  Connection.associate = function (models) {
    models.Connection.belongsTo(models.Address, {
      foreignKey: 'addressId',
      as: 'address'
    })
    // models.Connection.hasMany(models.ConnectionPlan, {
    //   foreignKey: 'connectionId',
    //   as: 'conn_plan'
    // })
    models.Connection.belongsTo(models.BusinessEntity, {
      foreignKey: 'charge',
      as: 'ChargeDesc'
    })
    models.Connection.belongsTo(models.BusinessEntity, {
      foreignKey: 'connection_grp',
      as: 'connectionGroupDesc'
    })
    models.Connection.belongsTo(models.BusinessEntity, {
      foreignKey: 'connection_type',
      as: 'connectionTypeDesc'
    })
    models.Connection.belongsTo(models.BusinessEntity, {
      foreignKey: 'credit_prof',
      as: 'creditProofDesc'
    })
    models.Connection.belongsTo(models.BusinessEntity, {
      foreignKey: 'dealership',
      as: 'dealershipDesc'
    })
    models.Connection.belongsTo(models.BusinessEntity, {
      foreignKey: 'exchng_code',
      as: 'exchangeCodeDesc'
    })
    models.Connection.belongsTo(models.BusinessEntity, {
      foreignKey: 'payment_method',
      as: 'paymentMethodDesc'
    })
    models.Connection.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'serviceStatus'
    })
  }
  return Connection
}
