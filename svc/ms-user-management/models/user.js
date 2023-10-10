module.exports = function (sequelize, DataType) {
  const User = sequelize.define('User', {
    userId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    contactNo: {
      type: DataType.INTEGER
    },
    email: {
      type: DataType.STRING
    },
    userType: {
      type: DataType.STRING
    },
    userSource: {
      type: DataType.STRING
    },
    customerId: {
      type: DataType.STRING
    },
    customerUuid: {
      type: DataType.STRING
    },
    photo: {
      type: DataType.STRING
    },
    title: {
      type: DataType.STRING
    },
    firstName: {
      type: DataType.STRING
    },
    lastName: {
      type: DataType.STRING
    },
    gender: {
      type: DataType.STRING
    },
    dob: {
      type: DataType.DATEONLY
    },
    officeNo: {
      type: DataType.INTEGER
    },
    extn: {
      type: DataType.INTEGER
    },
    loginid: {
      type: DataType.STRING
    },
    notificationType: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? this.getDataValue('notificationType') ? JSON.parse(this.getDataValue('notificationType')) : this.getDataValue('notificationType') : this.getDataValue('notificationType')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('notificationType', JSON.stringify(value)) : this.setDataValue('notificationType', value)
      }
    },
    biAccess: {
      type: DataType.STRING
    },
    waAccess: {
      type: DataType.STRING
    },
    loginPassword: {
      type: DataType.STRING
    },
    loginAttempts: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    mappingPayload: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? this.getDataValue('mappingPayload') ? JSON.parse(this.getDataValue('mappingPayload')) : this.getDataValue('mappingPayload') : this.getDataValue('mappingPayload')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('mappingPayload', JSON.stringify(value)) : this.setDataValue('mappingPayload', value)
      }
    },
    inviteToken: {
      type: DataType.STRING
    },
    loc: {
      type: DataType.STRING
    },
    country: {
      type: DataType.STRING
    },
    icNumber: {
      type: DataType.STRING
    },
    profilePicture: {
      type: DataType.STRING
    },
    oneTimePassword: {
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
    activationDate: {
      type: DataType.DATEONLY
    },
    expiryDate: {
      type: DataType.DATEONLY
    },
    biAccessKey: {
      type: DataType.STRING
    },
    multipleSession: {
      type: DataType.STRING
    },
    userCategory: {
      type: DataType.STRING
    },
    userGroup: {
      type: DataType.STRING
    },
    userSource: {
      type: DataType.STRING
    },
    userFamily: {
      type: (sequelize.options.dialect === 'mssql') ? DataType.STRING : DataType.JSONB,
      get: function () {
        return sequelize.options.dialect === 'mssql' ? this.getDataValue('userFamily') ? JSON.parse(this.getDataValue('userFamily')) : this.getDataValue('userFamily') : this.getDataValue('userFamily')
      },
      set: function (value) {
        return sequelize.options.dialect === 'mssql' ? this.setDataValue('userFamily', JSON.stringify(value)) : this.setDataValue('userFamily', value)
      }
    },
    userVerificationStatus: {
      type: DataType.STRING
    },
    managerId: {
      type: DataType.STRING
    },
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.STRING
    },
    tranId: {
      type: DataType.STRING
    },
    pwdExpiryDate: {
      type: DataType.DATEONLY
    },
    userUuid: {
      type: DataType.STRING
    },
    userNo: {
      type: DataType.STRING
    },
    statusReason: {
      type: DataType.STRING
    }
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'ad_users'
  })

  User.associate = function (models) {
    models.User.belongsToMany(models.SkillMst, {
      through: models.UserSkillMap,
      as: "userSkills",
      foreignKey: 'userId',
      otherKey: 'skillId'
    })

    models.User.belongsTo(models.UserSession, {
      foreignKey: 'userId'
    })

    models.User.belongsTo(models.BusinessEntity, {
      foreignKey: 'status',
      as: 'statusDesc'
    })

    models.User.belongsTo(models.BusinessEntity, {
      foreignKey: 'gender',
      as: 'genderDesc'
    })

    models.User.belongsTo(models.BusinessEntity, {
      foreignKey: 'userGroup',
      as: 'userGroupDesc'
    })

    models.User.belongsTo(models.User, {
      foreignKey: 'managerId',
      as: 'managerDetail'
    })

  }
  return User
}
