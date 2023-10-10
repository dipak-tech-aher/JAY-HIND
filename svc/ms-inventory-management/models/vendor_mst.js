module.exports = function (sequelize, DataType) {
  const VendorMst = sequelize.define('VendorMst', {
    vendorId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    vendorNo: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    vendorName: {
      type: DataType.STRING
    },
    vendorFamily: {
      type: DataType.STRING
    },
    vendorCategory: {
      type: DataType.STRING
    },
    vendorSubCategory: {
      type: DataType.STRING
    },
    vendorType: {
      type: DataType.STRING
    },
    vendorSubType: {
      type: DataType.STRING
    },
    serviceType: {
      type: DataType.STRING
    },
    vendorImage: {
      type: DataType.STRING
    },
    vendorVariant: {
      type: DataType.STRING
    },
    provisioningType: {
      type: DataType.STRING
    },
    vendorLine: {
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
    vendorLocation: {
      type: DataType.STRING
    },
    vendorUuid: {
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
    uomCategory: {
      type: DataType.STRING
    },
    vendorClass: {
      type: DataType.STRING
    },

  }, {
    tableName: 'vendor_mst',
    timestamps: true,
    underscored: true
  })

  VendorMst.associate = function (models) {
    
    models.VendorMst.belongsTo(models.BusinessEntity, {
      foreignKey: 'serviceType',
      as: 'serviceTypeDescription'
    })
    models.VendorMst.belongsTo(models.BusinessEntity, {
      foreignKey: 'vendorType',
      as: 'vendorTypeDescription'
    })
    models.VendorMst.belongsTo(models.BusinessEntity, {
      foreignKey: 'vendorSubType',
      as: 'vendorSubTypeDesc'
    })
    models.VendorMst.belongsTo(models.BusinessEntity, {
      foreignKey: 'vendorCategory',
      as: 'vendorCategoryDesc'
    })
    models.VendorMst.belongsTo(models.BusinessEntity, {
      foreignKey: 'vendorSubCategory',
      as: 'vendorSubCategoryDesc'
    })
    models.VendorMst.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    models.VendorMst.belongsTo(models.BusinessEntity, {
      foreignKey: 'uomCategory',
      as: 'uomCategoryDesc'
    })
    models.VendorMst.belongsTo(models.BusinessEntity, {
      foreignKey: 'vendorClass',
      as: 'vendorClassDesc'
    })
    models.VendorMst.belongsTo(models.BusinessEntity, {
      foreignKey: 'serviceClass',
      as: 'serviceClassDesc'
    })
    models.VendorMst.belongsTo(models.BusinessEntity, {
      foreignKey: 'provisioningType',
      as: 'provisioningTypeDesc'
    })
    models.VendorMst.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByUser'
    })
    models.VendorMst.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByUser'
    })
  }

  return VendorMst
}
