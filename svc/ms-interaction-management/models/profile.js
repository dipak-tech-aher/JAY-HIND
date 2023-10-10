module.exports = function (sequelize, DataType) {
  const Profile = sequelize.define('Profile', {
    profileId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    profileNo: {
      type: DataType.STRING
    },
    customerId: {
      type: DataType.INTEGER
    },
    status: {
      type: DataType.STRING
    },
    firstName: {
      type: DataType.STRING
    },
    lastName: {
      type: DataType.STRING
    },
    profileAge: {
      type: DataType.INTEGER
    },
    gender: {
      type: DataType.STRING
    },
    birthDate: {
      type: DataType.DATE
    },
    idType: {
      type: DataType.STRING
    },
    idValue: {
      type: DataType.STRING
    },
    profileCategory: {
      type: DataType.STRING
    },
    registeredNo: {
      type: DataType.STRING
    },
    registeredDate: {
      type: DataType.DATE
    },
    nationality: {
      type: DataType.STRING
    },
    profilePhoto: {
      type: DataType.STRING
    },
    taxNo: {
      type: DataType.STRING
    },
    contactPreferences: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        let value = this.getDataValue('contactPreferences');
        try {
          return JSON.parse(value);
        } catch(e) {
          return value;
        }
      },
      set: function (value) {
        value = typeof value == "object" ? JSON.stringify(value) : value;
        return this.setDataValue('contactPreferences', value);
      }
    },
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.INTEGER
    },
    profileUuid: {
      type: DataType.STRING
    },
    tranId: {
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
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'profile'
  })
  Profile.associate = function (models) {
    models.Profile.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })

    models.Profile.belongsTo(models.BusinessEntity, {
      foreignKey: 'gender',
      as: 'genderDesc'
    })

    models.Profile.belongsTo(models.BusinessEntity, {
      foreignKey: 'idType',
      as: 'idTypeDesc'
    })

    models.Profile.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByName'
    })

    models.Profile.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByName'
    })

    models.Profile.hasMany(models.Contact, {
      sourceKey: 'profileNo',
      foreignKey: 'contactCategoryValue',
      as: 'customerContact'
    })

    models.Profile.hasMany(models.Interaction, {
      sourceKey: 'profileId',
      foreignKey: 'customerId',
      as: 'interactionDetails'
    })

    // models.Profile.hasMany(models.Address, {
    //   sourceKey: 'profileNo',
    //   foreignKey: 'addressCategoryValue',
    //   as: 'profileAddress'
    // })
  }
  return Profile
}
