module.exports = function (sequelize, DataType) {
  const AssetInvProductHdr = sequelize.define('AssetInvProductHdr', {
    assetInvPrdId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    assetInvPrdNo: {
      type: DataType.STRING
    },
    assetInvId: {
      type: DataType.INTEGER
    },
    assetInvPrdStatus: {
      type: DataType.STRING
    },
    brandId: {
      type: DataType.STRING
    },
    modelId: {
      type: DataType.STRING
    },
    prodCategory: {
      type: DataType.STRING
    },
    prodType: {
      type: DataType.STRING
    },
    prodSubType: {
      type: DataType.STRING
    },
    productNo: {
      type: DataType.STRING
    },
    productName: {
      type: DataType.STRING
    },
    totalQuantity: {
      type: DataType.INTEGER
    },
    usedQuantity: {
      type: DataType.INTEGER
    },
    currentAvailQuantity: {
      type: DataType.INTEGER
    },
    holdQuantity: {
      type: DataType.INTEGER
    },
    assetInvPrdUuid: {
      type: DataType.STRING
    },
    assetInvUuid: {
      type: DataType.STRING
    },
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.INTEGER
    },
    createdBy: {
      type: DataType.INTEGER
    },
    updatedBy: {
      type: DataType.INTEGER
    },
    createdAt: {
      type: DataType.DATE
    },
    updatedAt: {
      type: DataType.DATE
    }
  }, {
    tableName: 'asset_inv_product_hdr',
    timestamps: true,
    underscored: true
  })

  AssetInvProductHdr.associate = function (models) {
    // models.Product.hasMany(models.ProductCharge, {
    //   sourceKey: 'productId',
    //   foreignKey: 'productId',
    //   as: 'productChargesList'
    // })

    // models.Product.belongsTo(models.BusinessEntity, {
    //   foreignKey: 'serviceType',
    //   as: 'serviceTypeDescription'
    // })

    // models.Product.belongsTo(models.BusinessEntity, {
    //   foreignKey: 'productType',
    //   as: 'productTypeDescription'
    // })

    // models.Product.belongsTo(models.BusinessEntity, {
    //   foreignKey: 'productSubType',
    //   as: 'productSubTypeDesc'
    // })

    // models.Product.belongsTo(models.BusinessEntity, {
    //   foreignKey: 'productCategory',
    //   as: 'productCategoryDesc'
    // })

    // models.Product.belongsTo(models.BusinessEntity, {
    //   foreignKey: 'productSubCategory',
    //   as: 'productSubCategoryDesc'
    // })

    // models.Product.belongsTo(models.BusinessEntity, {
    //   foreignKey: 'status',
    //   as: 'statusDesc'
    // })

    // models.Product.belongsTo(models.BusinessEntity, {
    //   foreignKey: 'uomCategory',
    //   as: 'uomCategoryDesc'
    // })

    // models.Product.belongsTo(models.BusinessEntity, {
    //   foreignKey: 'productClass',
    //   as: 'productClassDesc'
    // })

    // models.Product.belongsTo(models.BusinessEntity, {
    //   foreignKey: 'serviceClass',
    //   as: 'serviceClassDesc'
    // })

    // models.Product.belongsTo(models.BusinessEntity, {
    //   foreignKey: 'provisioningType',
    //   as: 'provisioningTypeDesc'
    // })
  }

  return AssetInvProductHdr
}
