module.exports = function (sequelize, DataType) {
  const Charge = sequelize.define('Charge', {
    chargeId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    chargeName: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    chargeCat: {
      type: DataType.STRING
    },
    serviceType: {
      type: DataType.STRING
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
    tableName: 'charge_mst',
    timestamps: true,
    underscored: true
  })

  Charge.associate = function (models) {

    models.Charge.belongsTo(models.BusinessEntity, {
      foreignKey: 'chargeCat',
      as: 'chargeCatDesc'
    })

    models.Charge.belongsTo(models.BusinessEntity, {
      foreignKey: 'currency',
      as: 'currencyDesc'
    })
  }
  return Charge
}
