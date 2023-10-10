module.exports = function (sequelize, DataTypes) {
  const AssetCharge = sequelize.define('AssetCharge', {
    assetChargeId: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    assetId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    chargeId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    chargeAmount: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    frequency: {
      type: DataTypes.STRING,
      allowNull: true
    },
    prorated: {
      type: DataTypes.STRING,
      allowNull: true
    },
    billingEffective: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    advanceCharge: {
      type: DataTypes.STRING,
      allowNull: true
    },
    chargeUpfront: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    changesApplied: {
      type: DataTypes.CHAR(2),
      allowNull: false
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    remarks: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {

    tableName: 'asset_charge',
    timestamps: true,
    underscored: true

  })
  AssetCharge.associate = function (models) {
    models.AssetCharge.belongsTo(models.Charge, {
      foreignKey: 'chargeId',
      as: 'chargeDetails'
    })
    models.AssetCharge.belongsTo(models.BusinessEntity, {
      foreignKey: 'frequency',
      as: 'frequencyDesc'
    })
  }
  return AssetCharge
}
