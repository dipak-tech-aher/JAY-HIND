module.exports = function (sequelize, DataType) {
  const CatalogAddonMap = sequelize.define('CatalogAddonMap', {
    catalogAddonId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    catalogId: {
      type: DataType.INTEGER
    },
    addonId: {
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
    tableName: 'catalog_addon_map',
    timestamps: true,
    underscored: true
  })

  CatalogAddonMap.associate = function (models) {
    models.CatalogAddonMap.hasMany(models.AddonMst, {
      sourceKey: 'addonId',
      foreignKey: 'addonId',
      as: 'addonDetails'
    })
    models.CatalogAddonMap.hasMany(models.AddonCharge, {
      sourceKey: 'addonId',
      foreignKey: 'addonId',
      as: 'addonCharge'
    })
  }

  return CatalogAddonMap
}
