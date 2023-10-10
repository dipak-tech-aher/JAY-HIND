module.exports = function (sequelize, DataType) {
  const HelpdeskTxn = sequelize.define('HelpdeskTxn', {
    helpdeskTxnId: {
      autoIncrement: true,
      type: DataType.INTEGER,
      primaryKey: true
    },
    helpdeskId: {
      type: DataType.INTEGER
    },
    status: {
      type: DataType.STRING
    },
    statusChngDate: {
      type: DataType.DATE
    },
    helpdeskContent: {
      type: DataType.STRING
    },
    cancelReason: {
      type: DataType.STRING
    },
    helpdeskActionRemark: {
      type: DataType.STRING
    },
    currDept: {
      type: DataType.STRING
    },
    currRole: {
      type: DataType.INTEGER
    },
    currUser: {
      type: DataType.INTEGER
    },
    referenceId: {
      type: DataType.STRING
    },
    helpdeskTxnUuid: {
      type: DataType.STRING
    },
    createdDeptId: {
      type: DataType.STRING
    },
    createdRoleId: {
      type: DataType.INTEGER
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
    }
  },
  {
    tableName: 'helpdesk_txn',
    timestamps: true,
    underscored: true
  })

  HelpdeskTxn.associate = function (models) {
    models.HelpdeskTxn.belongsTo(models.User, {
      foreignKey: 'createdBy',
      as: 'createdByDetails'
    })
    models.HelpdeskTxn.belongsTo(models.User, {
      foreignKey: 'updatedBy',
      as: 'updatedByDetails'
    })
  }
  return HelpdeskTxn
}
