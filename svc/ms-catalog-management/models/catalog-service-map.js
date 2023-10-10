module.exports = function (sequelize, DataType) {
  const CatalogServiceMap = sequelize.define('CatalogServiceMap', {
    catalogServiceId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    catalogId: {
      type: DataType.INTEGER
    },
    serviceId: {
      type: DataType.INTEGER
    },
    mandatory: {
      type: DataType.STRING
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
    remarks: {
      type: DataType.STRING
    }
  }, {
    tableName: 'catalog_service_map',
    timestamps: true,
    underscored: true
  })
  CatalogServiceMap.associate = function (models) {
    models.CatalogServiceMap.hasMany(models.ServiceCharge, {
      sourceKey: 'serviceId',
      foreignKey: 'serviceId',
      as: 'serviceCharge'
    })
    models.CatalogServiceMap.hasMany(models.Service, {
      sourceKey: 'serviceId',
      foreignKey: 'serviceId',
      as: 'serviceDetails'
    })
  }

  return CatalogServiceMap
}
