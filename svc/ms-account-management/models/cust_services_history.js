module.exports = function (sequelize, DataType) {
  const CustServicesHistory = sequelize.define('CustServicesHistory', {
    historyId: {
      autoIncrement: true,
      autoIncrementIdentity: true,
      type: DataType.BIGINT,
      primaryKey: true
    },
    historyInsertedDate: {
      type: DataType.DATE
    },
    serviceId: {
      type: DataType.BIGINT
    },
    serviceNo: {
      type: DataType.STRING
    },
    serviceName: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    customerId: {
      type: DataType.INTEGER
    },
    accountId: {
      type: DataType.INTEGER
    },
    serviceCategory: {
      type: DataType.STRING
    },
    serviceType: {
      type: DataType.STRING
    },
    serviceClass: {
      type: DataType.STRING
    },
    planPayload: {
      type: DataType.JSONB
    },
    quantity: {
      type: DataType.INTEGER
    },
    activationDate: {
      type: DataType.DATEONLY
    },
    expiryDate: {
      type: DataType.DATEONLY
    },
    notificationPreference: {
      type: DataType.STRING
    },
    serviceAgreement: {
      type: DataType.BLOB
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
    customerUuid: {
      type: DataType.STRING
    },
    accountUuid: {
      type: DataType.STRING
    },
    serviceUuid: {
      type: DataType.STRING
    },
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.INTEGER
    },
    tranId: {
      type: DataType.STRING
    },
    createdBy: {
      type: DataType.STRING
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
      type: DataType.INTEGER
    }
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'cust_services_history'
  })

  CustServicesHistory.associate = function (models) {
    models.CustServices.hasMany(models.Address, {
      sourceKey: 'serviceNo',
      foreignKey: 'addressCategoryValue',
      as: 'serviceHistoryAddress'
    })
  }
  return CustServicesHistory
}
