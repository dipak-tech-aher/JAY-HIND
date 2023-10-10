module.exports = function (sequelize, DataType) {
  const BulkOrderTemp = sequelize.define('BulkOrderTemp', {
    bulkOrderId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bulkUploadId: {
      type: DataType.INTEGER
    },
    orderRefNo: {
      type: DataType.STRING
    },
    orderDate: {
      type: DataType.DATE
    },
    customerName: {
      type: DataType.STRING
    },
    serviceName: {
      type: DataType.STRING
    },
    emailId: {
      type: DataType.STRING
    },
    orderCategory: {
      type: DataType.STRING
    },
    customerRefNo: {
      type: DataType.STRING
    },
    serviceRefNo: {
      type: DataType.STRING
    },
    orderType: {
      type: DataType.STRING
    },
    orderSource: {
      type: DataType.STRING
    },
    orderChannel: {
      type: DataType.STRING
    },
    orderStatus: {
      type: DataType.STRING
    },
    orderFamily: {
      type: DataType.STRING
    },
    orderMode: {
      type: DataType.STRING
    },
    orderDeliveryMode: {
      type: DataType.STRING
    },
    serviceCategory: {
      type: DataType.STRING
    },
    serviceType: {
      type: DataType.STRING
    },
    orderCause: {
      type: DataType.STRING
    },
    orderPriority: {
      type: DataType.STRING
    },
    orderDescription: {
      type: DataType.STRING
    },
    productName: {
      type: DataType.STRING
    },
    productQuantity: {
      type: DataType.INTEGER
    },
    billAmount: {
      type: DataType.INTEGER
    },
    productRefNo: {
      type: DataType.STRING
    },
    deliveryLocation: {
      type: DataType.STRING
    },
    edoc: {
      type: DataType.DATE
    },
    contactPreference: {
      type: DataType.STRING
    },
    createdDept: {
      type: DataType.STRING
    },
    currDept: {
      type: DataType.STRING
    },
    createdRole: {
      type: DataType.STRING
    },
    currRole: {
      type: DataType.STRING
    },
    currUser: {
      type: DataType.STRING
    },
    createdBy: {
      type: DataType.STRING
    },
    requestStatement: {
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
    latitude: {
      type: DataType.STRING
    },
    longitude: {
      type: DataType.STRING
    },
    validationFlag: {
      type: DataType.STRING
    },
    uploadFlag: {
      type: DataType.STRING
    },
    advanceCharge: {
      type: DataType.STRING
    },
    upfrontCharge: {
      type: DataType.STRING
    },
    prorated: {
      type: DataType.STRING
    },
    validationRemarks: {
      type: DataType.STRING
    },
    uploadRemarks: {
      type: DataType.STRING
    },
    orderTranId: {
      type: DataType.STRING
    }
  },
  {
    timestamps: false,
    underscored: true,
    tableName: 'bulk_order_temp'
  })

  BulkOrderTemp.associate = function (models) { }
  return BulkOrderTemp
}
