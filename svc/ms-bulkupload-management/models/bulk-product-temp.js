module.exports = function (sequelize, DataType) {
  const BulkProductTemp = sequelize.define('BulkProductTemp', {
    bulkProductId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bulkUploadId: {
      type: DataType.INTEGER
    },
    productName: {
      type: DataType.STRING
    },
    prodBundleName: {
      type: DataType.STRING
    },
    productFamily: {
      type: DataType.STRING
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
    serviceClass: {
      type: DataType.STRING
    },
    productSubType: {
      type: DataType.STRING
    },
    productClass: {
      type: DataType.STRING
    },
    provisioningType: {
      type: DataType.STRING
    },
    volumeAllowed: {
      type: DataType.INTEGER
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
    // chargeType: {
    //   type: DataType.STRING
    // },
    contractFlag: {
      type: DataType.STRING
    },
    contractInMonths: {
      type: DataType.STRING
    },
    isTaxable: {
      type: DataType.STRING
    },
    taxablePercentage: {
      type: DataType.STRING
    },
    warrantyPeriod: {
      type: DataType.STRING
    },
    productLocation: {
      type: DataType.STRING
    },
    uomCategory: {
      type: DataType.STRING
    },
    isAppointRequired: {
      type: DataType.STRING
    },
    taxNo: {
      type: DataType.STRING
    },
    chargeName: {
      type: DataType.STRING
    },
    // chargeAmount: {
    //   type: DataType.STRING
    // },
    // currency: {
    //   type: DataType.STRING
    // },
    glCode: {
      type: DataType.STRING
    },
    frequency: {
      type: DataType.STRING
    },
    advanceCharge: {
      type: DataType.STRING
    },
    chargeUpfront: {
      type: DataType.STRING
    },
    prorated: {
      type: DataType.STRING
    },
    createDate: {
      type: DataType.DATE
    },
    validationFlag: {
      type: DataType.STRING
    },
    validationRemarks: {
      type: DataType.STRING
    },
    uploadFlag: {
      type: DataType.STRING
    },
    uploadRemarks: {
      type: DataType.STRING
    },
    productBenefits: {
      type: DataType.TEXT
    },
    prodTranId: {
      type: DataType.STRING
    },
    prodCreatedDeptId: {
      type: DataType.STRING
    },
    prodCreatedRoleId: {
      type: DataType.INTEGER
    },
    prodCreatedBy: {
      type: DataType.STRING
    },
    productUuid: {
      type: DataType.STRING
    },
    createdAt: {
      type: DataType.DATE
    },
    updatedAt: {
      type: DataType.DATE
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'bulk_product_temp'
  })

  BulkProductTemp.associate = function (models) { }
  return BulkProductTemp
}
