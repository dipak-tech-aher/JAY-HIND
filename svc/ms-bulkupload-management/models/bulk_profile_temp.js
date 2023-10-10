module.exports = function (sequelize, DataType) {
  const BulkProfileTemp = sequelize.define('BulkProfileTemp', {
    bulkProfileId: {
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
    profileCategory: {
      type: DataType.STRING
    },
    gender: {
      type: DataType.STRING
    },
    emailId: {
      type: DataType.STRING
    },
    mobilePrefix: {
      type: DataType.STRING
    },
    mobileNo: {
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
    registeredNo: {
      type: DataType.STRING
    },
    registeredDate: {
      type: DataType.STRING
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
    telephonePrefix: {
      type: DataType.STRING
    },
    telephoneNo: {
      type: DataType.STRING
    },
    whatsappNoPrefix: {
      type: DataType.STRING
    },
    whatsappNo: {
      type: DataType.STRING
    },
    fax: {
      type: DataType.STRING
    },
    facebookId: {
      type: DataType.STRING
    },
    instagramId: {
      type: DataType.STRING
    },
    telegramId: {
      type: DataType.STRING
    },
    validationFlag: {
      type: DataType.STRING
    },
    uploadFlag: {
      type: DataType.STRING
    },
    validationRemarks: {
      type: DataType.STRING
    },
    uploadRemarks: {
      type: DataType.STRING
    },
    profTranId: {
      type: DataType.STRING
    },
    profCreatedDeptId: {
      type: DataType.STRING
    },
    profCreatedRoleId: {
      type: DataType.INTEGER
    },
    profCreateBy: {
      type: DataType.STRING
    }
  },
  {
    timestamps: false,
    underscored: true,
    tableName: 'bulk_profile_temp'
  })

  BulkProfileTemp.associate = function (models) { }
  return BulkProfileTemp
}
