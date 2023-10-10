module.exports = function (sequelize, DataType) {
  const CustomerPayment = sequelize.define('CustomerPayment', {
    custPaymentId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    customerId: {
      type: DataType.INTEGER
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
    paymentType: {
      type: DataType.STRING
    },
    paymentMethod: {
      type: DataType.STRING
    },
    cardNumberDebitCredit: {
      type: DataType.STRING
    },
    cardExpiryDate: {
      type: DataType.STRING
    },
    cardHolderName: {
      type: DataType.STRING
    },
    cardCvv: {
      type: DataType.STRING
    },
    upiId: {
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
    createdRoleId: {
      type: DataType.INTEGER
    },
    createdDeptId: {
      type: DataType.STRING
    },
    tranId: {
      type: DataType.STRING
    },
    updatedAt: {
      type: DataType.DATE
    }
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'customer_payment'
  })
  CustomerPayment.associate = function (models) {
  }
  return CustomerPayment
}
