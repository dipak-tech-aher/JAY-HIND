module.exports = function (sequelize, DataType) {
  const Address = sequelize.define('Address', {
    addressId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    addressNo: {
      type: DataType.STRING,
      unique: true
    },
    status: {
      type: DataType.STRING
    },
    isPrimary: {
      type: DataType.BOOLEAN
    },
    addressCategory: {
      type: DataType.STRING
    },
    addressCategoryValue: {
      type: DataType.STRING
    },
    addressType: {
      type: DataType.STRING
    },
    address1: {
      type: DataType.STRING
    },
    address2: {
      type: DataType.STRING
    },
    address3: {
      type: DataType.STRING
    },
    addrZone: {
      type: DataType.STRING
    },
    city: {
      type: DataType.STRING
    },
    district: {
      type: DataType.STRING
    },
    state: {
      type: DataType.STRING
    },
    postcode: {
      type: DataType.STRING
    },
    country: {
      type: DataType.STRING
    },
    latitude: {
      type: DataType.STRING
    },
    longitude: {
      type: DataType.STRING
    },
    addressRefNo: {
      type: DataType.STRING
    },
    billFlag: {
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
  },
    {
      timestamps: true,
      underscored: true,
      tableName: 'cmn_address'
    }
  )

  Address.associate = function (models) {
    models.Address.belongsTo(models.BusinessEntity, {
      foreignKey: 'district',
      as: 'districtDesc'
    })
    models.Address.belongsTo(models.BusinessEntity, {
      foreignKey: 'state',
      as: 'stateDesc'
    })
    models.Address.belongsTo(models.BusinessEntity, {
      foreignKey: 'country',
      as: 'countryDesc'
    })
    models.Address.belongsTo(models.BusinessEntity, {
      foreignKey: 'postcode',
      as: 'postCodeDesc'
    })
    models.Address.hasOne(models.Customer, {
      sourceKey: 'addressCategoryValue',
      foreignKey: 'customerNo',
      as: 'customerDetails'
    })
  }
  return Address
}
