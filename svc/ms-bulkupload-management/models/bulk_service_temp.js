module.exports = function (sequelize, DataType) {
  const BulkServiceTemp = sequelize.define('BulkServiceTemp', {
    bulkServiceId: {
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
    accountRefNo: {
      type: DataType.STRING
    },
    serviceRefNo: {
      type: DataType.STRING
    },
    mobileNo: {
      type: DataType.STRING
    },
    accountCategory: {
      type: DataType.STRING
    },
    accountType: {
      type: DataType.STRING
    },
    accountCurreny: {
      type: DataType.STRING
    },
    accountBillLanguage: {
      type: DataType.STRING
    },
    serviceName: {
      type: DataType.STRING
    },
    serviceCategory: {
      type: DataType.STRING
    },
    serviceType: {
      type: DataType.STRING
    },
    serviceClass: {
      type: DataType.INTEGER
    },
    productName: {
      type: DataType.INTEGER
    },
    quantity: {
      type: DataType.INTEGER
    },
    activationDate: {
      type: DataType.INTEGER
    },
    expiryDate: {
      type: DataType.DATE
    },
    notificationPreference: {
      type: DataType.STRING
    },
    serviceAgreement: {
      type: DataType.STRING
    },
    serviceLimit: {
      type: DataType.INTEGER
    },
    serviceUsage: {
      type: DataType.INTEGER
    },
    serviceBalance: {
      type: DataType.INTEGER
    },
    serviceStatusReason: {
      type: DataType.STRING
    },
    serviceProvisioningType: {
      type: DataType.STRING
    },
    paymentMethod: {
      type: DataType.STRING
    },
    firstName: {
      type: DataType.STRING
    },
    lastName: {
      type: DataType.STRING
    },
    emailId: {
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
    status: {
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
    serviceTranId: {
      type: DataType.STRING
    },
    serviceCreatedDeptId: {
      type: DataType.STRING
    },
    serviceCreatedRoleId: {
      type: DataType.INTEGER
    },
    serviceCreateBy: {
      type: DataType.STRING
    },
    serviceUnit: {
      type: DataType.STRING
    }
  },
  {
    timestamps: false,
    underscored: true,
    tableName: 'bulk_service_temp'
  })

  BulkServiceTemp.associate = function (models) { }
  return BulkServiceTemp
}
