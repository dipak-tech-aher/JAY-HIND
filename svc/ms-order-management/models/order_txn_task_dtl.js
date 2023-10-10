module.exports = function (sequelize, DataType) {
  const OrderTxnTaskDtl = sequelize.define('OrderTxnTaskDtl', {
    ordWfTaskTxnId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    orderTxnHdrId: {
      type: DataType.INTEGER
    },
    orderTxnDtlId: {
      type: DataType.INTEGER
    },
    taskId: {
      type: DataType.INTEGER
    },
    isMandatoryFla: {
      type: DataType.STRING
    },
    taskResult: {
      type: DataType.STRING
    },
    status: {
      type: DataType.STRING
    },
    taskUuid: {
      type: DataType.STRING
    },
    orderTxnHdrUuid: {
      type: DataType.STRING
    },
    orderTxnDtlUuid: {
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
    timestamps: true,
    underscored: true,
    tableName: 'order_txn_task_dtl'
  }
  )
  OrderTxnTaskDtl.associate = function (models) {
    // models.OrderTxnTaskDtl.belongsTo(models.BusinessEntity, {
    //     foreignKey: 'gender',
    //     as: 'genderDesc'
    // })
    // models.OrderTxnTaskDtl.belongsTo(models.BusinessEntity, {
    //     foreignKey: 'idType',
    //     as: 'idTypeDesc'
    // })
    // models.OrderTxnTaskDtl.belongsTo(models.BusinessEntity, {
    //     foreignKey: 'status',
    //     as: 'statusDesc'
    // })
    // models.OrderTxnTaskDtl.belongsTo(models.BusinessEntity, {
    //     foreignKey: 'customerCategory',
    //     as: 'customerCatDesc'
    // })
    // models.OrderTxnTaskDtl.belongsTo(models.BusinessEntity, {
    //     foreignKey: 'customerClass',
    //     as: 'customerClassDesc'
    // })
    // models.OrderTxnTaskDtl.belongsTo(models.User, {
    //     foreignKey: 'createdBy',
    //     as: 'createdByName'
    // })
    // models.OrderTxnTaskDtl.belongsTo(models.User, {
    //     foreignKey: 'updatedBy',
    //     as: 'updatedByName'
    // })
    // models.OrderTxnTaskDtl.hasMany(models.Contact, {
    //     sourceKey: 'customerNo',
    //     foreignKey: 'contactCategoryValue',
    //     as: 'customerContact'
    // })
  }
  return OrderTxnTaskDtl
}
