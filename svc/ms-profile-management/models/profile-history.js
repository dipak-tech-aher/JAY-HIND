module.exports = function (sequelize, DataType) {
  const ProfileHistory = sequelize.define('ProfileHistory', {
    historyId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    historyInsertedDate: {
      type: DataType.DATE
    },
    profileId: {
      type: DataType.INTEGER
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
    tableName: 'profile_history'
  })

  return ProfileHistory
}
