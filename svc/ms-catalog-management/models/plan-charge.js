module.exports = function (sequelize, DataType) {
  const PlanCharge = sequelize.define('PlanCharge', {
    planChargeId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    planId: {
      type: DataType.INTEGER
    },
    chargeId: {
      type: DataType.INTEGER
    },
    startDate: {
      type: DataType.DATE
    },
    endDate: {
      type: DataType.DATE
    },
    status: {
      type: DataType.STRING
    },
    chargeAmount: {
      type: DataType.NUMBER
    },
    frequency: {
      type: DataType.STRING
    },
    prorated: {
      type: DataType.STRING,
      allowNull: true
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
    changesApplied: {
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
    },
    remarks: {
      type: DataType.STRING
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'plan_charge'
  }
  )

  PlanCharge.associate = function (models) {
    models.PlanCharge.belongsTo(models.BusinessEntity, {
      foreignKey: 'frequency',
      as: 'frequencyDesc'
    })
    models.PlanCharge.belongsTo(models.Charge, {
      foreignKey: 'chargeId',
      as: 'chargeDetails'
    })
  }
  return PlanCharge
}
