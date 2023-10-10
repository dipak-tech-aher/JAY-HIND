module.exports = function (sequelize, DataType) {
  const AssetMst = sequelize.define('AssetMst', {
    assetId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    assetName: {
      type: DataType.STRING,
      allowNull: false
    },
    status: {
      type: DataType.STRING,
      allowNull: false
    },
    serviceType: {
      type: DataType.STRING,
      allowNull: false
    },
    startDate: {
      type: DataType.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataType.DATEONLY,
      allowNull: true
    },
    volumeAllowed: {
      type: DataType.INTEGER,
      allowNull: true
    },
    multipleSelection: {
      type: DataType.STRING,
      allowNull: true
    },
    assetType: {
      type: DataType.STRING,
      allowNull: true
    },
    assetStatus: {
      type: DataType.STRING,
      allowNull: true
    },
    assetSegment: {
      type: DataType.STRING,
      allowNull: true
    },
    assetManufacturer: {
      type: DataType.STRING,
      allowNull: true
    },
    assetModel: {
      type: DataType.STRING,
      allowNull: true
    },
    assetWarrantyPeriod: {
      type: DataType.STRING,
      allowNull: true
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
      type: DataType.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    },
    createdAt: {
      type: DataType.DATE,
      allowNull: false
    },
    updatedBy: {
      type: DataType.INTEGER,
      allowNull: true
    },
    updatedAt: {
      type: DataType.DATE,
      allowNull: true
    },
    remarks: {
      type: DataType.STRING,
      allowNull: true
    }
  }, {
    tableName: 'asset_mst',
    timestamps: true,
    underscored: true
  })

  AssetMst.associate = function (models) {
    models.AssetMst.hasMany(models.AssetCharge, {
      foreignKey: 'assetId',
      as: 'assetCharges'
    })
    models.AssetMst.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    models.AssetMst.belongsTo(models.BusinessEntity, {
      foreignKey: 'assetStatus',
      as: 'assetStatusDesc'
    })
    models.AssetMst.belongsTo(models.BusinessEntity, {
      foreignKey: 'assetSegment',
      as: 'assetSegDesc'
    })
    models.AssetMst.belongsTo(models.BusinessEntity, {
      foreignKey: 'assetManufacturer',
      as: 'assetManuDesc'
    })
    models.AssetMst.belongsTo(models.BusinessEntity, {
      foreignKey: 'serviceType',
      as: 'serviceTypeDesc'
    })
    models.AssetMst.belongsTo(models.BusinessEntity, {
      foreignKey: 'multipleSelection',
      as: 'multipleSelectionDesc'
    })
    models.AssetMst.belongsTo(models.BusinessEntity, {
      foreignKey: 'volumeAllowed',
      as: 'volumeAllowedDesc'
    })
    models.AssetMst.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByUser'
    })
    models.AssetMst.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByUser'
    })
  }
  return AssetMst
}
