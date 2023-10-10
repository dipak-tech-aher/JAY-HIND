
module.exports = function (sequelize, DataType) {
    const AdvancePayment = sequelize.define('AdvancePayment', {
      advPaymId: {
        autoIncrement: true,
        type: DataType.INTEGER,
        primaryKey: true
      },
      paymentId: {
        type: DataType.INTEGER
      },
      advanceAmount: {
        type: DataType.INTEGER
      },
      advanceBalanceAmount: {
        type: DataType.INTEGER
      },
      billRefNo: {
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
      status: {
        type: DataType.STRING
      },
      remarks: {
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
      updatedAt: {
        type: DataType.DATE
      },
      appliedAmount: {
        type: DataType.INTEGER
      },
      createdDeptId: {
        type: DataType.STRING
      },
      createdRoleId: {
        type: DataType.INTEGER
      },
      tranId: {
        type: DataType.STRING
      }
    },
    {
      tableName: 'advance_payment',
      timestamps: true,
      underscored: true
    })
    return AdvancePayment
  }
  