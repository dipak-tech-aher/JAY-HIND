module.exports = function Charge (sequelize, DataType) {
  const Charge = sequelize.define('Charge', {
    chargeId: {
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    chargeName: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    chargeCat: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    serviceType: {
      type: DataType.STRING,
      references: {
        model: 'BusinessEntity',
        key: 'code'
      }
    },
    currency: {
      type: DataType.STRING
    },
    startDate: {
      type: DataType.DATE
    },
    endDate: {
      type: DataType.DATE
    },
    glcode: {
      type: DataType.STRING
    },
    createdBy: {
      type: DataType.STRING
    },
    createdAt: {
      type: DataType.DATE
    },
    updatedBy: {
      type: DataType.STRING
    },
    updatedAt: {
      type: DataType.DATE
    }

  }, {
    timestamps: true,
    underscored: true,
    tableName: 'charge_mst'
  }
  )

  Charge.associate = function (models) {
    models.Charge.belongsTo(models.BusinessEntity, {
      foreignKey: 'chargeCat',
      as: 'chargeCatDesc'
    })
    models.Charge.belongsTo(models.BusinessEntity, {
      foreignKey: 'currency',
      as: 'currencyDesc'
    })
    models.Charge.belongsTo(models.BusinessEntity, {
      foreignKey: 'serviceType',
      as: 'serviceTypeDesc'
    })
    models.Charge.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })
    models.Charge.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByUser'
    })
    models.Charge.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByUser'
    })
  }

  return Charge
}
