module.exports = function (sequelize, DataType) {
  const BulkCustomerTemp = sequelize.define('BulkCustomerTemp', {
    bulkCustomerId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bulkUploadId: {
      type: DataType.INTEGER
    },
    customerRefNo: {
      type: DataType.STRING
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
    title: {
      type: DataType.STRING
    },
    customerCategory: {
      type: DataType.STRING
    },
    customerClass: {
      type: DataType.STRING
    },
    customerMaritalStatus: {
      type: DataType.STRING
    },
    occupation: {
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
      type: DataType.DATEONLY
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
      type: DataType.DATEONLY
    },
    nationality: {
      type: DataType.STRING
    },
    contactPreference: {
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
    country: {
      type: DataType.STRING
    },
    state: {
      type: DataType.STRING
    },
    postcode: {
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
    createDate: {
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
    customerTranId: {
      type: DataType.STRING
    },
    customerCreatedDeptId: {
      type: DataType.STRING
    },
    customerCreatedRoleId: {
      type: DataType.STRING
    },
    customerCreateBy: {
      type: DataType.STRING
    },
    customerUuid: {
      type: DataType.STRING
    },
    createdAt: {
      type: DataType.DATE
    },
    updatedAt: {
      type: DataType.DATE
    },
    department: {
      type: DataType.STRING
    },
    projects: {
      type: DataType.STRING
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'bulk_customer_temp'
  }
  )

  BulkCustomerTemp.associate = function (models) {
  }
  return BulkCustomerTemp
}
