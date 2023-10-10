module.exports = function (sequelize, DataType) {
    const ProductBundle = sequelize.define('ProductBundle', {
        prodBundleDtlId: {
            autoIncrement: true,
            type: DataType.INTEGER,
            primaryKey: true
        },
        prodBundleId: {
            type: DataType.INTEGER
        },
        productId: {
            type: DataType.INTEGER
        },
        status: {
            type: DataType.STRING
        },
        parentProdFlag: {
            type: DataType.STRING
        },
        requiredQty: {
            type: DataType.INTEGER
        },
        prodBundleUuid: {
            type: DataType.STRING
        },
        productUuid: {
            type: DataType.STRING
        },
        prodBundleDtlUuid: {
            type: DataType.STRING
        },
        createdDeptId: {
            type: DataType.STRING
        },
        createdRoleId: {
            type: DataType.INTEGER
        },
        tranId: {
            type: DataType.STRING,
            allowNull: false
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
    }, {
        tableName: 'product_bundle_dtl',
        timestamps: true,
        underscored: true
    })

    ProductBundle.associate = function (models) {
        // models.ProductBundle.hasOne(models.ProductBundleHdr, {
        //     sourceKey: 'prodBundleId',
        //     foreignKey: 'prodBundleId',
        //     as: 'productBundleDetails'
        // })
    }

    return ProductBundle
}
