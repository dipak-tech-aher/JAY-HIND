module.exports = function (sequelize, DataType) {
    const OrderTaskHdr = sequelize.define('OrderTaskHdr', {
        orderTaskId: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        orderId: {
            type: DataType.INTEGER
        },
        productId: {
            type: DataType.INTEGER
        },
        taskId: {
            type: DataType.INTEGER
        },
        status: {
            type: DataType.STRING
        },
        comments: {
            type: DataType.STRING
        },
        taskUuid: {
            type: DataType.STRING
        },
        orderTaskHdrUuid: {
            type: DataType.STRING
        },
        productUuid: {
            type: DataType.STRING
        },
        orderUuid: {
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
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'order_task_hdr'
    })
    OrderTaskHdr.associate = function (models) {
        // models.OrderTaskHdr.belongsTo(models.BusinessEntity, {
        //     foreignKey: 'gender',
        //     as: 'genderDesc'
        // })
    }
    return OrderTaskHdr
}
