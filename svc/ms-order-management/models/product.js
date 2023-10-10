module.exports = function (sequelize, DataType) {
  const Product = sequelize.define('Product', {
    productId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    productNo: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    productName: {
      type: DataType.STRING
    },
    productFamily: {
      type: DataType.STRING
    },
    serviceClass: {
      type: DataType.STRING
    },
    productBenefit: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        const value = this.getDataValue('productBenefit')
        try {
          return JSON.parse(value)
        } catch (e) {
          return value
        }
      },
      set: function (value) {
        value = typeof value === 'object' ? JSON.stringify(value) : value
        return this.setDataValue('productBenefit', value)
      }
    },
    termsList: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        const value = this.getDataValue('termsList')
        try {
          return JSON.parse(value)
        } catch (e) {
          return value
        }
      },
      set: function (value) {
        value = typeof value === 'object' ? JSON.stringify(value) : value
        return this.setDataValue('termsList', value)
      }
    },
    productCategory: {
      type: DataType.STRING
    },
    productSubCategory: {
      type: DataType.STRING
    },
    productType: {
      type: DataType.STRING
    },
    serviceType: {
      type: DataType.STRING
    },
    productImage: {
      type: DataType.STRING
    },
    productVariant: {
      type: DataType.STRING
    },
    provisioningType: {
      type: DataType.STRING
    },
    productLine: {
      type: DataType.STRING
    },
    volumeAllowed: {
      type: DataType.INTEGER
    },
    multipleSelection: {
      type: DataType.STRING
    },
    revenueGlCode: {
      type: DataType.STRING
    },
    receivableGlCode: {
      type: DataType.STRING
    },
    activationDate: {
      type: DataType.DATE
    },
    expiryDate: {
      type: DataType.DATE
    },
    chargeType: {
      type: DataType.STRING
    },
    contractFlag: {
      type: DataType.STRING
    },
    contractInMonths: {
      type: DataType.STRING
    },
    isTaxable: {
      type: DataType.DATE
    },
    taxablePercentage: {
      type: DataType.DOUBLE
    },
    warrantyPeriod: {
      type: DataType.STRING
    },
    productLocation: {
      type: DataType.STRING
    },
    productUuid: {
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
    tableName: 'product_mst',
    timestamps: true,
    underscored: true
  })

  Product.associate = function (models) {
    models.Product.hasMany(models.ProductCharge, {
      sourceKey: 'productId',
      foreignKey: 'productId',
      as: 'productChargesList'
    })
    models.Product.belongsTo(models.BusinessEntity, {
      foreignKey: 'serviceClass',
      as: 'serviceClassDesc'
    })
    models.Product.belongsTo(models.BusinessEntity, {
      foreignKey: 'serviceType',
      as: 'serviceTypeDescription'
    })

    models.Product.belongsTo(models.BusinessEntity, {
      foreignKey: 'productType',
      as: 'productTypeDescription'
    })

    models.Product.belongsTo(models.BusinessEntity, {
      foreignKey: 'productSubType',
      as: 'productSubTypeDesc'
    })

    models.Product.belongsTo(models.BusinessEntity, {
      foreignKey: 'productCategory',
      as: 'productCategoryDesc'
    })

    models.Product.belongsTo(models.BusinessEntity, {
      foreignKey: 'productSubCategory',
      as: 'productSubCategoryDesc'
    })

    models.Product.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })

    models.Product.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByUser'
    })

    models.Product.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByUser'
    })
    models.Product.hasMany(models.TermsConditionsDtl, {
      sourceKey: 'productId',
      foreignKey: 'productId',
      as: 'termDtl'
  })

  }

  return Product
}
