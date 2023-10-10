module.exports = function (sequelize, DataType) {
  const ServiceCharge = sequelize.define('ServiceCharge', {
    serviceChargeId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    serviceId: {
      type: DataType.INTEGER
    },
    chargeId: {
      type: DataType.INTEGER
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
    tableName: 'service_charge'
  }
  )

  ServiceCharge.associate = function (models) {
    models.ServiceCharge.belongsTo(models.BusinessEntity, {
      foreignKey: 'frequency',
      as: 'frequencyDesc'
    })
    models.ServiceCharge.belongsTo(models.Charge, {
      foreignKey: 'chargeId',
      as: 'chargeDetails'
    })
  }
  return ServiceCharge
}
