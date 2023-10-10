module.exports = function (sequelize, DataType) {
    const ContractDtl = sequelize.define('ContractDtl', {
        contractDtlId: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        contractId: {
            type: DataType.INTEGER
        },
        contractType: {
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
        frequency: {
            type: DataType.STRING
        },
        prorated: {
            type: DataType.CHAR
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
        durationMonth: {
            type: DataType.NUMBER
        },
        upfrontPayment: {
            type: DataType.STRING
        },
        balanceAmount: {
            type: DataType.NUMBER
        },
        minCommitment: {
            type: DataType.NUMBER
        },
        totalConsumption: {
            type: DataType.NUMBER
        },
        invoiceGroup: {
            type: DataType.INTEGER
        },
        productId: {
            type: DataType.INTEGER
        },
        prodBundleId: {
            type: DataType.INTEGER
        },
        quantity: {
            type: DataType.NUMBER
        },
        chargeId: {
            type: DataType.INTEGER
        },
        chargeAmt: {
            type: DataType.NUMBER
        },
        chargeType: {
            type: DataType.STRING
        },
        orderId: {
            type: DataType.INTEGER
        },
        orderDtlId: {
            type: DataType.INTEGER
        },
        soId: {
            type: DataType.INTEGER
        },
        contractUuid: {
            type: DataType.STRING
        },
        productUuid: {
            type: DataType.STRING
        },
        prodBundleUuid: {
            type: DataType.STRING
        },
        contractDtlUuid: {
            type: DataType.STRING
        },
        orderUuid: {
            type: DataType.STRING
        },
        orderDtlUuid: {
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
            tableName: 'contract_dtl'
        }
    )
    ContractDtl.associate = function (models) {
        // 
    }
    return ContractDtl
}
