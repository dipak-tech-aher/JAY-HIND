module.exports = function (sequelize, DataType) {
    const PromoDtl = sequelize.define('PromoDtl', {
        promoDtlId: {
            autoIncrement: true,
            type: DataType.INTEGER,
            primaryKey: true
        },
        promoId: {
            type: DataType.INTEGER
        },
        productId: {
            type: DataType.INTEGER
        },
        status: {
            type: DataType.STRING
        },      
        promoUuid: {
            type: DataType.STRING
        },
        productUuid: {
            type: DataType.STRING
        },
        promoDtlUuid: {
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
        }
    }, {
        tableName: 'promo_dtl',
        timestamps: true,
        underscored: true
    })

    PromoDtl.associate = function (models) {
        models.PromoDtl.belongsTo(models.PromoHdr, {
            sourceKey: 'promoId',
            foreignKey: 'promoId',
            as: 'promoHdr'
        })
        models.PromoDtl.belongsTo(models.Product, {
            sourceKey: 'productId',
            foreignKey: 'productId',
            as: 'productDtl'
        })
    }

    return PromoDtl
}
