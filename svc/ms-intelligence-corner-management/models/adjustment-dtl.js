module.exports = function (sequelize, DataType) {
  const AdjustmentDtl = sequelize.define('AdjustmentDtl', {
    adjustmentDtlId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    adjustmentId: {
      type: DataType.INTEGER
    },
    billRefNo: {
      type: DataType.INTEGER
    },
    contractId: {
      type: DataType.INTEGER
    },
    contractDtlId: {
      type: DataType.INTEGER
    },
    maxAdjAmount: {
      type: DataType.FLOAT
    },
    adjAmount: {
      type: DataType.FLOAT
    },
    adjustmentType: {
      type: DataType.STRING
    },
    adjustmentCat: {
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
    tableName: 'adjustment_dtl',
    timestamps: true,
    underscored: true
  })
  AdjustmentDtl.associate = function (models) {
    models.AdjustmentDtl.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })
    models.AdjustmentDtl.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })
    models.AdjustmentDtl.hasMany(models.Contract, {
      foreignKey: 'contractId',
      as: 'contract'
    })
    models.AdjustmentDtl.belongsTo(models.ContractDtl, {
      foreignKey: 'contractDtlId',
      as: 'contractDetails'
    })
    models.AdjustmentDtl.hasMany(models.Adjustment, {
      foreignKey: 'adjustmentId',
      as: 'adjustment'
    })
    models.AdjustmentDtl.belongsTo(models.BusinessEntity, {
      foreignKey: 'adjustmentType',
      as: 'adjustmentTypeDesc'
    })
    models.AdjustmentDtl.belongsTo(models.BusinessEntity, {
      foreignKey: 'adjustmentCat',
      as: 'adjustmentCatDesc'
    })
    models.AdjustmentDtl.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
  }

  return AdjustmentDtl
}
