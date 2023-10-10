module.exports = function (sequelize, DataType) {
  const ContractHdr = sequelize.define('ContractHdr', {
    contractId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    contractNo: {
      type: DataType.STRING
    },
    contractName: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    plannedStartDate: {
      type: DataType.DATE
    },
    plannedEndDate: {
      type: DataType.DATE
    },
    actualStartDate: {
      type: DataType.DATE
    },
    actualEndDate: {
      type: DataType.DATE
    },
    rcAmount: {
      type: DataType.NUMBER
    },
    otcAmount: {
      type: DataType.NUMBER
    },
    usageAmount: {
      type: DataType.NUMBER
    },
    creditAdjAmount: {
      type: DataType.NUMBER
    },
    debitAdjAmount: {
      type: DataType.NUMBER
    },
    lastBillPeriod: {
      type: DataType.DATE
    },
    nextBillPeriod: {
      type: DataType.DATE
    },
    isAdvanceAllowed: {
      type: DataType.STRING
    },
    advAllocationPercent: {
      type: DataType.NUMBER
    },
    customerId: {
      type: DataType.STRING
    },
    accountId: {
      type: DataType.STRING
    },
    serviceId: {
      type: DataType.STRING
    },
    soId: {
      type: DataType.INTEGER
    },
    contractUuid: {
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
    tranId: {
      type: DataType.STRING
    },
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
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
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'contract_hdr'
  }
  )
  ContractHdr.associate = function (models) {
    models.ContractHdr.hasOne(models.CustServices, {
      sourceKey: 'serviceUuid',
      foreignKey: 'serviceUuid',
      as: 'customerServiceContract'
    })
  }
  return ContractHdr
}
