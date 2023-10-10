module.exports = function (sequelize, DataType) {
  const Adjustment = sequelize.define('Adjustment', {
    adjustmentId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    adjustmentType: {
      type: DataType.STRING
    },
    adjustmentCat: {
      type: DataType.STRING
    },
    billRefNo: {
      type: DataType.INTEGER
    },
    adjustmentPeriod: {
      type: DataType.DATE
    },
    contractId: {
      type: DataType.INTEGER
    },
    maxAdjAmount: {
      type: DataType.FLOAT
    },
    totalAdjAmount: {
      type: DataType.FLOAT
    },
    reason: {
      type: DataType.STRING
    },
    remarks: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
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
    tableName: 'adjustment',
    timestamps: true,
    underscored: true
  })
  Adjustment.associate = function (models) {
    models.Adjustment.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.Adjustment.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    models.Adjustment.hasMany(models.Contract, {
      foreignKey: 'contractId',
      as: 'contract'
    })
    models.Adjustment.hasMany(models.ContractDtl, {
      foreignKey: 'contractDtlId',
      as: 'contractDetails'
    })
    models.Adjustment.hasMany(models.AdjustmentDtl, {
      foreignKey: 'adjustmentId',
      as: 'adjustmentDetails'
    })
    models.Adjustment.belongsTo(models.BusinessEntity, {
      foreignKey: 'adjustmentType',
      as: 'adjustmentTypeDesc'
    })
    models.Adjustment.belongsTo(models.BusinessEntity, {
      foreignKey: 'adjustmentCat',
      as: 'adjustmentCatDesc'
    })
    models.Adjustment.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
  }

  return Adjustment
}
