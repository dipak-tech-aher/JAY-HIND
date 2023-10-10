module.exports = function (sequelize, DataType) {
    const BulkEntityTransactionMappingTemp = sequelize.define('BulkEntityTransactionMappingTemp', {
        bulkTxnId: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        bulkUploadId: {
            type: DataType.INTEGER
        },
        operationalUnit: {
            type: DataType.STRING
        },
        department: {
            type: DataType.STRING
        },
        roleName: {
            type: DataType.STRING
        },
        productFamily: {
            type: DataType.STRING
        },
        productType: {
            type: DataType.STRING
        },
        productSubType: {
            type: DataType.STRING
        },
        serviceType: {
            type: DataType.STRING
        },
        entityType: {
            type: DataType.STRING
        },
        transactionCategory: {
            type: DataType.STRING
        },
        transactionType: {
            type: DataType.STRING
        },
        createdDate: {
            type: DataType.DATE
        },
        validationFlag: {
            type: DataType.STRING
        },
        validationRemarks: {
            type: DataType.TEXT
        },
        uploadFlag: {
            type: DataType.STRING
        },
        uploadRemarks: {
            type: DataType.TEXT
        },
        txnTranId: {
            type: DataType.STRING
        },
        txn: {
            type: DataType.STRING
        },
        txnCreatedDeptId: {
            type: DataType.STRING
        },
        txnCreatedRoleId: {
            type: DataType.INTEGER
        },
        txnCreatedBy: {
            type: DataType.INTEGER
        },
        txnUuid: {
            type: DataType.STRING
        },
        createdAt: {
            type: DataType.DATE
        },
        updatedAt: {
            type: DataType.DATE
        }
    }, {
        timestamps: true,
        underscored: true,
        tableName: 'bulk_entity_transaction_mapping_temp'
    })

    BulkEntityTransactionMappingTemp.associate = function (models) { }
    return BulkEntityTransactionMappingTemp
}
