module.exports = function (sequelize, DataType) {
    const ProductBundleHdr = sequelize.define('ProductBundleHdr', {
        prodBundleId: {
            autoIncrement: true,
            type: DataType.INTEGER,
            primaryKey: true
        },
        status: {
            type: DataType.STRING
        },
        prodBundleNo: {
            type: DataType.STRING
        },
        prodBundleName: {
            type: DataType.STRING
        },
        prodBundleUuid: {
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
        contractFlag: {
            type: DataType.STRING
        },
        contractList: {
            type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
            get: function () {
                return sequelize.options.dialect === 'mssql' ? this.getDataValue('contractList') ? JSON.parse(this.getDataValue('contractList')) : this.getDataValue('contractList') : this.getDataValue('contractList')
            },
            set: function (value) {
                return sequelize.options.dialect === 'mssql' ? this.setDataValue('contractList', JSON.stringify(value)) : this.setDataValue('contractList', value)
            }
        },
    }, {
        tableName: 'product_bundle_hdr',
        timestamps: true,
        underscored: true
    })

    ProductBundleHdr.associate = function (models) {
        models.ProductBundleHdr.hasMany(models.ProductBundleDtl, {
            sourceKey: 'prodBundleId',
            foreignKey: 'prodBundleId',
            as: 'productBundleDtl'
        })
    }

    return ProductBundleHdr
}
