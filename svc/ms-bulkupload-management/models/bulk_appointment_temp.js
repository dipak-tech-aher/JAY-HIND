module.exports = function (sequelize, DataType) {
  const BulkAppointmentTemp = sequelize.define('BulkAppointmentTemp', {
    bulkAppointmentId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bulkUploadId: {
      type: DataType.INTEGER
    },
    appointmentName: {
      type: DataType.STRING
    },
    appointmentType: {
      type: DataType.STRING
    },
    userGroup: {
      type: DataType.STRING
    },
    templateName: {
      type: DataType.STRING
    },
    notificationName: {
      type: DataType.STRING
    },
    locations: {
      type: DataType.STRING
    },
    calenderName: {
      type: DataType.STRING
    },
    shiftName: {
      type: DataType.STRING
    },
    workingType: {
      type: DataType.STRING
    },
    appointmentDate: {
      type: DataType.DATEONLY
    },
    appointmentStartTime: {
      type: DataType.TIME
    },
    appointmentEndTime: {
      type: DataType.TIME
    },
    userName: {
      type: DataType.STRING
    },
    userEmailid: {
      type: DataType.STRING
    },
    eventType: {
      type: DataType.STRING
    },
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.INTEGER
    },
    createdBy: {
      type: DataType.STRING
    },
    appointmentTranId: {
      type: DataType.INTEGER
    },
    appointmentUuid: {
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
    }
  },
  {
    timestamps: false,
    underscored: true,
    tableName: 'bulk_appointment_temp'
  })

  BulkAppointmentTemp.associate = function (models) { }
  return BulkAppointmentTemp
}
