module.exports = function (sequelize, DataType) {
  const ProductBenefitMap = sequelize.define('ProductBenefitMap', {
    productBenefitMapId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    productBenefitId: {
      type: DataType.INTEGER
    },
    productId: {
      type: DataType.INTEGER
    }
  }, {
    timestamps: false,
    underscored: true,
    tableName: 'product_benefit_map'
  })

  ProductBenefitMap.associate = function (models) {
   
  }
  return ProductBenefitMap
}
