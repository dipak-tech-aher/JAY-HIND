module.exports = function (sequelize, DataType) {
  const BulkUserTemp = sequelize.define('BulkUserTemp', {
    bulkUsersId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bulkUploadId: {
      type: DataType.INTEGER
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
    emailId: {
      type: DataType.STRING
    },
    birthDate: {
      type: DataType.DATE
    },
    userCategory: {
      type: DataType.STRING
    },
    userType: {
      type: DataType.STRING
    },
    userFamily: {
      type: DataType.STRING
    },
    country: {
      type: DataType.STRING
    },
    mobilePrefix: {
      type: DataType.INTEGER
    },
    mobileNo: {
      type: DataType.INTEGER
    },
    userLocation: {
      type: DataType.STRING
    },
    managerEmail: {
      type: DataType.STRING
    },
    notificationType: {
      type: DataType.STRING
    },
    biAccess: {
      type: DataType.STRING
    },
    biAccessKey: {
      type: DataType.STRING
    },
    roleName: {
      type: DataType.STRING
    },
    department: {
      type: DataType.STRING
    },
    createdDate: {
      type: DataType.DATE
    },
    validationFlag: {
      type: DataType.STRING
    },
    validationRemarks: {
      type: DataType.STRING
    },
    uploadFlag: {
      type: DataType.STRING
    },
    uploadRemarks: {
      type: DataType.STRING
    },
    usersTranId: {
      type: DataType.STRING
    },
    usersCreatedDeptId: {
      type: DataType.STRING
    },
    usersCreatedRoleId: {
      type: DataType.INTEGER
    },
    usersCreatedBy: {
      type: DataType.STRING
    },
    usersUuid: {
      type: DataType.STRING
    },
    updatedAt: {
      type: DataType.DATE
    },
    tempPassword: {
      type: DataType.STRING
    },
    encryptedPassword: {
      type: DataType.STRING
    },
    expertiseOn: {
      type: DataType.STRING
    },
    userGroup: {
      type: DataType.STRING
    },
    inviteToken: {
      type: DataType.STRING
    },
    activationDate: {
      type: DataType.DATE
    },
    expiryDate: {
      type: DataType.DATE
    },
    projects: {
      type: DataType.STRING
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'bulk_users_temp'
  })

  BulkUserTemp.associate = function (models) { }
  return BulkUserTemp
}
