module.exports = function (sequelize, DataType) {
  const CatalogPlanMap = sequelize.define('CatalogPlanMap', {
    catalogPlanId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    catalogId: {
      type: DataType.INTEGER
    },
    planId: {
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
    tableName: 'catalog_plan_map',
    timestamps: true,
    underscored: true
  })
  CatalogPlanMap.associate = function (models) {
    models.CatalogPlanMap.hasMany(models.PlanCharge, {
      sourceKey: 'planId',
      foreignKey: 'planId',
      as: 'planCharge'
    })
    models.CatalogPlanMap.hasMany(models.Plan, {
      sourceKey: 'planId',
      foreignKey: 'planId',
      as: 'planDetails'
    })
  }

  return CatalogPlanMap
}
