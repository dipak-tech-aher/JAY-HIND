module.exports = function (sequelize, DataType) {
  const BulkInteractionTemp = sequelize.define('BulkInteractionTemp', {
    bulkInteractionId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bulkUploadId: {
      type: DataType.STRING
    },
    intxnRefNo: {
      type: DataType.STRING
    },
    customerName: {
      type: DataType.STRING
    },
    serviceName: {
      type: DataType.STRING
    },
    serviceRefNo: {
      type: DataType.STRING
    },
    productName: {
      type: DataType.STRING
    },
    emailid: {
      type: DataType.STRING
    },
    mobileNo: {
      type: DataType.STRING
    },
    intxnCategory: {
      type: DataType.STRING
    },
    intxnType: {
      type: DataType.STRING
    },
    serviceCategory: {
      type: DataType.STRING
    },
    serviceType: {
      type: DataType.STRING
    },
    intxnCause: {
      type: DataType.STRING
    },
    intxnStatus: {
      type: DataType.STRING
    },
    statusReason: {
      type: DataType.STRING
    },
    createdEntity: {
      type: DataType.STRING
    },
    currEntity: {
      type: DataType.STRING
    },
    createdRole: {
      type: DataType.STRING
    },
    currRole: {
      type: DataType.STRING
    },
    intxnWorkflowSeq: {
      type: DataType.STRING
    },
    intxnWorkflowStatus: {
      type: DataType.STRING
    },
    fromEntity: {
      type: DataType.STRING
    },
    fromRole: {
      type: DataType.STRING
    },
    fromUser: {
      type: DataType.STRING
    },
    toEntity: {
      type: DataType.STRING
    },
    toRole: {
      type: DataType.STRING
    },
    toUser: {
      type: DataType.STRING
    },
    intxnChannel: {
      type: DataType.STRING
    },
    intxnPriority: {
      type: DataType.STRING
    },
    intxnCreatedDate: {
      type: DataType.DATE
    },
    assignedDate: {
      type: DataType.DATE
    },
    flwCreatedAt: {
      type: DataType.DATE
    },
    intxnDescription: {
      type: DataType.STRING
    },
    responseSolution: {
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
    currUser: {
      type: DataType.STRING
    },
    contactPreference: {
      type: DataType.STRING
    },
    requestStatement: {
      type: DataType.STRING
    },
    isFollowup: {
      type: DataType.STRING
    },
    remarks: {
      type: DataType.STRING
    },
    address3: {
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
    validationRemarks: {
      type: DataType.STRING
    },
    uploadRemarks: {
      type: DataType.STRING
    },
    createdBy: {
      type: DataType.INTEGER
    },
    createdAt: {
      type: DataType.DATE
    },
    updatedAt: {
      type: DataType.DATE
    },
    interactionTranId: {
      type: DataType.STRING
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'bulk_interaction_temp'
  })

  BulkInteractionTemp.associate = function (models) { }
  return BulkInteractionTemp
}
