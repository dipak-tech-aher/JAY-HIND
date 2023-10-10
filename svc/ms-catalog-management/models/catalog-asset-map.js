module.exports = function (sequelize, DataType) {
  const CatalogAssetMap = sequelize.define('CatalogAssetMap', {
    catalogAssetId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    catalogId: {
      type: DataType.INTEGER
    },
    assetId: {
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
    tableName: 'catalog_asset_map',
    timestamps: true,
    underscored: true
  })
  CatalogAssetMap.associate = function (models) {
    models.CatalogAssetMap.hasMany(models.AssetCharge, {
      sourceKey: 'assetId',
      foreignKey: 'assetId',
      as: 'assetCharge'
    })
    models.CatalogAssetMap.hasMany(models.AssetMst, {
      sourceKey: 'assetId',
      foreignKey: 'assetId',
      as: 'assetDetails'
    })
  }

  return CatalogAssetMap
}
