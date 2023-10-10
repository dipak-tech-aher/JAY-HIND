module.exports = function (sequelize, DataType) {
  const ProductTaskMap = sequelize.define('ProductTaskMap', {
    prodTaskId: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    taskId: {
      type: DataType.INTEGER
    },
    productId: {
      type: DataType.INTEGER
    },
    status: {
      type: DataType.STRING
    },
    productUuid: {
      type: DataType.STRING
    },
    taskUuid: {
      type: DataType.STRING
    },
    prodTaskUuid: {
      type: DataType.STRING
    },
    taskSequence: {
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
  }, {
    tableName: 'product_task_map',
    timestamps: true,
    underscored: true
  })
  return ProductTaskMap
}
