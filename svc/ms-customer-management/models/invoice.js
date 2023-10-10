module.exports = function (sequelize, DataType) {
    const Invoice = sequelize.define('Invoice', {
      invoiceId: {
        autoIncrement: true,
        type: DataType.INTEGER,
        primaryKey: true
      },
      invNo: {
        type: DataType.INTEGER
      },
      customerId: {
        type: DataType.INTEGER
      },
      billRefNo: {
        type: DataType.STRING
      },
      invStartDate: {
        type: DataType.DATE
      },
      invEndDate: {
        type: DataType.DATE
      },
      invDate: {
        type: DataType.DATE
      },
      dueDate: {
        type: DataType.DATE
      },
      invOsAmt: {
        type: DataType.INTEGER
      },
      invAmt: {
        type: DataType.INTEGER
      },
      advAmount: {
        type: DataType.INTEGER
      },
      prevBalance: {
        type: DataType.INTEGER
      },
      billingStatus: {
        type: DataType.STRING,
        references: {
          model: 'BusinessEntity',
          key: 'code'
        }
      },
      invoiceStatus: {
        type: DataType.STRING,
        references: {
          model: 'BusinessEntity',
          key: 'code'
        }
      },
      billMonth: {
        type: DataType.INTEGER
      },
      billYear: {
        type: DataType.INTEGER
      },
      billCycle: {
        type: DataType.INTEGER
      },
      processId: {
        type: DataType.INTEGER
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
      // soNumber: {
      //   type: DataType.STRING
      // },
      contractId: {
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
      }
    }, {
      tableName: 'invoice',
      timestamps: true,
      underscored: true
    })
    Invoice.associate = function (models) {}
  
    return Invoice
  }
  