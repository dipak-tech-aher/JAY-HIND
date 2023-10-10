module.exports = function (sequelize, DataType) {
  const ProductCharge = sequelize.define('ProductCharge', {
    productChargeMapId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    productId: {
      type: DataType.INTEGER
    },
    chargeId: {
      type: DataType.INTEGER
    },
    chargeAmount: {
      type: DataType.DOUBLE
    },
    frequency: {
      type: DataType.STRING
    },
    billingEffective: {
      type: DataType.INTEGER
    },
    advanceCharge: {
      type: DataType.STRING
    },
    chargeUpfront: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    startDate: {
      type: DataType.DATE
    },
    endDate: {
      type: DataType.DATE
    },
    changesApplied: {
      type: DataType.STRING
    },
    remarks: {
      type: DataType.STRING
    },
    prorated: {
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
    tableName: 'product_charge_map',
    timestamps: true,
    underscored: true
  })

  ProductCharge.associate = function (models) {
    // models.ProductCharge.hasOne(models.Charge, {
    //   sourceKey: 'chargeId',
    //   foreignKey: 'chargeId',
    //   as: 'chargeDetails'
    // })
	}

  return ProductCharge
}
