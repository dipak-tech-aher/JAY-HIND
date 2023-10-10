module.exports = function (sequelize, DataType) {
    const ProductBenefit = sequelize.define('ProductBenefit', {
        productBenefitId: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        prodBenefit: {
            type: DataType.STRING
        }
    }, {
        timestamps: false,
        underscored: true,
        tableName: 'product_benefit_mst'
    })

    ProductBenefit.associate = function (models) { }
    return ProductBenefit
}
