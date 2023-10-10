module.exports = function (sequelize, DataType) {
  const Service = sequelize.define('Service', {
    serviceId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    serviceName: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    serviceType: {
      type: DataType.STRING
    },
    startDate: {
      type: DataType.DATE
    },
    endDate: {
      type: DataType.DATE
    },
    volumeAllowed: {
      type: DataType.INTEGER
    },
    multipleSelection: {
      type: DataType.STRING
    },
    property: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('property')) : this.getDataValue('property')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('property', JSON.stringify(value)) : this.setDataValue('property', value)
      }
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
    remarks: {
      type: DataType.STRING
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'service_mst'
  }
  )

  Service.associate = function (models) {
    models.Service.hasMany(models.ServiceCharge, {
      foreignKey: 'ServiceId',
      as: 'serviceCharges'
    })
    models.Service.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    models.Service.belongsTo(models.BusinessEntity, {
      foreignKey: 'serviceType',
      as: 'serviceTypeDesc'
    })
    models.Service.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.Service.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
  }
  return Service
}
