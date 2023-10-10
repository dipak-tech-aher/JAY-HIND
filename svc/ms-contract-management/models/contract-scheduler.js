module.exports = function (sequelize, DataType) {
  const ContractScheduler = sequelize.define('ContractScheduler', {
    schedulerId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    schedulerName: {
      type: DataType.STRING
    },
    scheduleDatetime: {
      type: DataType.DATEONLY
    },
    billPeriod: {
      type: DataType.STRING
    },
    scheduleStatus: {
      type: DataType.STRING
    },
    remarks: {
      type: DataType.STRING
    },
    soId: {
      type: DataType.INTEGER
    },
    contractId: {
      type: DataType.INTEGER
    },
    contractDtlId: {
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
    monthlyContractId: {
      type: DataType.INTEGER
    },
    monthlyContractDtlId: {
      type: DataType.INTEGER
    },
    tranId: {
      type: DataType.STRING
    },
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.INTEGER
    }
  }, {
    tableName: 'contract_scheduler',
    timestamps: true,
    underscored: true
  })
  return ContractScheduler
}
