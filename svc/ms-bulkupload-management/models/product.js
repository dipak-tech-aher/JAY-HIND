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
      type: DataType.TEXT
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
    }
  }, {
    tableName: 'product_mst',
    timestamps: true,
    underscored: true
  })

  Product.associate = function (models) {
    
  }

  return Product
}
