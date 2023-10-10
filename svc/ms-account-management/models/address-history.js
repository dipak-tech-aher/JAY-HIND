module.exports = function (sequelize, DataType) {
  const AddressHistory = sequelize.define('AddressHistory', {
    historyId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    historyInsertedDate: {
      type: DataType.DATE
    },
    addressId: {
      type: DataType.INTEGER
    },
    addressNo: {
      type: DataType.STRING,
      unique: true
    },
    status: {
      type: DataType.STRING
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
    },
    historyTranId: {
      type: DataType.STRING,
      allowNull: false
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'cmn_address_history'
  }
  )

  AddressHistory.associate = function (models) {
    models.AddressHistory.belongsTo(models.BusinessEntity, {
      foreignKey: 'district',
      as: 'districtDesc'
    })
    models.AddressHistory.belongsTo(models.BusinessEntity, {
      foreignKey: 'state',
      as: 'stateDesc'
    })
    models.AddressHistory.belongsTo(models.BusinessEntity, {
      foreignKey: 'country',
      as: 'countryDesc'
    })
    models.AddressHistory.belongsTo(models.BusinessEntity, {
      foreignKey: 'postcode',
      as: 'postCodeDesc'
    })
    models.AddressHistory.hasOne(models.Customer, {
      sourceKey: 'addressCategoryValue',
      foreignKey: 'customerNo',
      as: 'customerDetails'
    })

    models.AddressHistory.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'modifiedBy'
    })
  }
  return AddressHistory
}
