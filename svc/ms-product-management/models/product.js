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
    productBenefit: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? this.getDataValue('productBenefit') ? JSON.parse(this.getDataValue('productBenefit')) : this.getDataValue('productBenefit') : this.getDataValue('productBenefit')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('productBenefit', JSON.stringify(value)) : this.setDataValue('productBenefit', value)
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
    productSubType: {
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
    },
    isAppointRequired: {
      type: DataType.STRING
    },
    uomCategory: {
      type: DataType.STRING
    },
    productClass: {
      type: DataType.STRING
    },
    serviceClass: {
      type: DataType.STRING
    },
    contractInMonths:{
      type: DataType.STRING
    },
    contractFlag:{
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
    termsList: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? this.getDataValue('termsList') ? JSON.parse(this.getDataValue('termsList')) : this.getDataValue('termsList') : this.getDataValue('termsList')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('termsList', JSON.stringify(value)) : this.setDataValue('termsList', value)
      }
    },
    metaAttributes: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? this.getDataValue('metaAttributes') ? JSON.parse(this.getDataValue('metaAttributes')) : this.getDataValue('metaAttributes') : this.getDataValue('metaAttributes')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('metaAttributes', JSON.stringify(value)) : this.setDataValue('metaAttributes', value)
      }
    }
  }, {
    tableName: 'product_mst',
    timestamps: true,
    underscored: true
  })

  Product.associate = function (models) {
    models.Product.belongsToMany(models.ProductBenefit, {
      through: models.ProductBenefitMap,
      as: "productBenefits",
      foreignKey: 'productId', // replaces `categoryId`
      otherKey: 'productBenefitId', // replaces `productId`
      timestamps: false
    })
    models.Product.hasMany(models.ProductCharge, {
      sourceKey: 'productId',
      foreignKey: 'productId',
      as: 'productChargesList'
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
    models.Product.belongsTo(models.BusinessEntity, {
      foreignKey: 'uomCategory',
      as: 'uomCategoryDesc'
    })
    models.Product.belongsTo(models.BusinessEntity, {
      foreignKey: 'productClass',
      as: 'productClassDesc'
    })
    models.Product.belongsTo(models.BusinessEntity, {
      foreignKey: 'serviceClass',
      as: 'serviceClassDesc'
    })
    models.Product.belongsTo(models.BusinessEntity, {
      foreignKey: 'provisioningType',
      as: 'provisioningTypeDesc'
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
