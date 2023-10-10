module.exports = function (sequelize, DataType) {
  const Catalog = sequelize.define('Catalog', {
    catalogId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    catalogName: {
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
    customerType: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('customerType')) : this.getDataValue('customerType')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('customerType', JSON.stringify(value)) : this.setDataValue('customerType', value)
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
  }, {
    tableName: 'catalog_mst',
    timestamps: true,
    underscored: true
  })
  Catalog.associate = function (models) {
    models.Catalog.hasMany(models.CatalogAddonMap, {
      foreignKey: 'catalogId',
      as: 'addonMap'
    })
    models.Catalog.hasMany(models.CatalogAssetMap, {
      foreignKey: 'catalogId',
      as: 'assetMap'
    })
    models.Catalog.hasMany(models.CatalogServiceMap, {
      foreignKey: 'catalogId',
      as: 'serviceMap'
    })
    models.Catalog.hasMany(models.CatalogPlanMap, {
      foreignKey: 'catalogId',
      as: 'planMap'
    })
    models.Catalog.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.Catalog.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    models.Catalog.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    models.Catalog.belongsTo(models.BusinessEntity, {
      foreignKey: 'serviceType',
      as: 'serviceTypeDesc'
    })
  }

  return Catalog
}
