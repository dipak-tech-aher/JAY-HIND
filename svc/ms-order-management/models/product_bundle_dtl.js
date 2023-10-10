module.exports = function (sequelize, DataType) {
    const ProductBundleDtl = sequelize.define('ProductBundleDtl', {
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
        },
        chargeList: {
            type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
            get: function () {
                return sequelize.options.dialect === 'mssql' ? this.getDataValue('chargeList') ? JSON.parse(this.getDataValue('chargeList')) : this.getDataValue('chargeList') : this.getDataValue('chargeList')
            },
            set: function (value) {
                return sequelize.options.dialect === 'mssql' ? this.setDataValue('chargeList', JSON.stringify(value)) : this.setDataValue('chargeList', value)
            }
        },
        termsList: {
            type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
            get: function () {
                return sequelize.options.dialect === 'mssql' ? this.getDataValue('termsList') ? JSON.parse(this.getDataValue('termsList')) : this.getDataValue('termsList') : this.getDataValue('termsList')
            },
            set: function (value) {
                return sequelize.options.dialect === 'mssql' ? this.setDataValue('termsList', JSON.stringify(value)) : this.setDataValue('termsList', value)
            }
        },
        useExistingCharge: {
            type: DataType.BOOLEAN
        },
        useExistingTerm: {
            type: DataType.BOOLEAN
        },
        totalCharge: {
            type: DataType.INTEGER
        }
    }, {
        tableName: 'product_bundle_dtl',
        timestamps: true,
        underscored: true
    })

    ProductBundleDtl.associate = function (models) {
        models.ProductBundleDtl.belongsTo(models.ProductBundleHdr, {
            sourceKey: 'prodBundleId',
            foreignKey: 'prodBundleId',
            as: 'productBundleHdr'
        })
        models.ProductBundleDtl.belongsTo(models.Product, {
            sourceKey: 'productId',
            foreignKey: 'productId',
            as: 'productDtl'
        })
    }

    return ProductBundleDtl
}
