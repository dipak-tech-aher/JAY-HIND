module.exports = function (sequelize, DataTypes) {
  const AddonCharge = sequelize.define('AddonCharge', {
    addonChargeId: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    addonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'addon_mst',
        key: 'addonId'
      }
    },
    chargeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'charge_mst',
        key: 'chargeId'
      }
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
        model: 'business_entity',
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
      allowNull: false,
      references: {
        model: 'users',
        key: 'userId'
      }
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
    underscored: true,
    tableName: 'addon_charge',
    timestamps: true,
    indexes: [
      {
        name: 'addonCharge_pk',
        unique: true,
        fields: [
          { name: 'addon_charge_id' }
        ]
      }
    ]
  })
  AddonCharge.associate = function (models) {
    models.AddonCharge.belongsTo(models.Charge, {
      foreignKey: 'chargeId',
      as: 'chargeDetails'
    })
    models.AddonCharge.belongsTo(models.BusinessEntity, {
      foreignKey: 'frequency',
      as: 'frequencyDesc'
    })
  }

  return AddonCharge
}
