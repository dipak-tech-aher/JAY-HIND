module.exports = function (sequelize, DataType) {
  const BusinessUnit = sequelize.define('BusinessUnit', {
    unitId: {
      type: DataType.STRING,
      primaryKey: true
    },
    unitName: {
      type: DataType.STRING
    },
    unitDesc: {
      type: DataType.STRING
    },
    unitType: {
      type: DataType.STRING
    },
    parentUnit: {
      type: DataType.STRING
    },
    contactId: {
      type: DataType.INTEGER
    },
    mappingPayload: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? JSON.parse(this.getDataValue('mappingPayload')) : this.getDataValue('mappingPayload')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('mappingPayload', JSON.stringify(value)) : this.setDataValue('mappingPayload', value)
      }
    },
    addressId: {
      type: DataType.INTEGER
    },
    status: {
      type: DataType.STRING,
      defaultValue: 'AC'
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
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'business_units'
  }
  )

  // BusinessUnit.associate = function (models) {
  //   models.BusinessUnit.belongsTo(models.Address, {
  //     foreignKey: 'addressId',
  //     as: 'address'
  //   })
  //   models.BusinessUnit.belongsTo(models.Contact, {
  //     foreignKey: 'contactId',
  //     as: 'contact'
  //   })
  // }
  return BusinessUnit
}
