module.exports = function (sequelize, DataType) {
  const AccountDetailsHistory = sequelize.define('AccountDetailsHistory', {
    accountDetailsHistoryId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    accountId: {
      type: DataType.INTEGER
    },
    email: {
      type: DataType.STRING
    },
    title: {
      type: DataType.STRING
    },
    firstName: {
      type: DataType.STRING
    },
    lastName: {
      type: DataType.STRING
    },
    contactNo: {
      type: DataType.STRING
    },
    histInsertedDate: {
      type: DataType.DATE
    },
    tranId: {
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
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.INTEGER
    }
  },
  {
    timestamps: true,
    underscored: true,
    tableName: 'cust_account_details_history'
  }
  )
  AccountDetailsHistory.associate = function (models) {
    models.AccountDetailsHistory.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'modifiedBy'
    })
  }
  return AccountDetailsHistory
}
