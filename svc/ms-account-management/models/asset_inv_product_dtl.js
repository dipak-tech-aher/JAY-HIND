module.exports = function (sequelize, DataType) {
  const AssetInvProductDtl = sequelize.define('AssetInvProductDtl', {
    assetInvPrdDtlId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    assetInvPrdDtlNo: {
      type: DataType.STRING
    },
    assetInvPrdId: {
      type: DataType.INTEGER
    },
    assetInvId: {
      type: DataType.INTEGER
    },
    productNo: {
      type: DataType.STRING
    },
    productDesc: {
      type: DataType.STRING
    },
    assetUniqueRefNo: {
      type: DataType.STRING
    },
    assetInvPrdDtlStatus: {
      type: DataType.STRING
    },
    assetReturnFlag: {
      type: DataType.STRING
    },
    assetUnit: {
      type: DataType.STRING
    },
    assetDimension: {
      type: DataType.STRING
    },
    assetWeight: {
      type: DataType.INTEGER
    },
    poRefNo: {
      type: DataType.STRING
    },
    poDate: {
      type: DataType.DATE
    },
    supplierRefNo: {
      type: DataType.STRING
    },
    supplierName: {
      type: DataType.STRING
    },
    price: {
      type: DataType.INTEGER
    },
    warrentyExpiryDate: {
      type: DataType.DATE
    },
    manfactureDate: {
      type: DataType.DATE
    },
    amcDate: {
      type: DataType.DATE
    },
    statusChangeReason: {
      type: DataType.STRING
    },
    photoAttachment: {
      type: DataType.STRING
    },
    assignedProject: {
      type: DataType.STRING
    },
    assignedTo: {
      type: DataType.STRING
    },
    assignedDate: {
      type: DataType.DATE
    },
    assignReferNo: {
      type: DataType.STRING
    },
    assignReferType: {
      type: DataType.STRING
    },
    assetInvPrdDtlUuid: {
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
    tableName: 'asset_inv_product_dtl',
    timestamps: true,
    underscored: true
  })

  AssetInvProductDtl.associate = function (models) {
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

  return AssetInvProductDtl
}
