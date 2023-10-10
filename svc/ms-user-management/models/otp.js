module.exports = function (sequelize, DataType) {
  const Otp = sequelize.define('Otp', {
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    reference: {
      type: DataType.STRING
    },
    otp: {
      type: DataType.INTEGER
    },
    status: {
      type: DataType.STRING,
      defaultValue: 'AC'
    },
    sentAt: {
      type: DataType.DATE,
      defaultValue: new Date()
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
    tranId: {
      type: DataType.STRING

    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'otp'
  }
  )
  Otp.associate = function (models) { }
  return Otp
}
