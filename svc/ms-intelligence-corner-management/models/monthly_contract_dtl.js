module.exports = function (sequelize, DataType) {
    const MonthlyContractDtl = sequelize.define('MonthlyContractDtl', {
        contractDtlId: {
            type: DataType.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        monthlyContractDtlId: {
            type: DataType.INTEGER
        },
        contractId: {
            type: DataType.INTEGER
        },
        itemId: {
            type: DataType.INTEGER
        },
        itemName: {
            type: DataType.STRING
        },
        actualStartDate: {
            type: DataType.DATE
        },
        actualEndDate: {
            type: DataType.DATE
        },
        endDate: {
            type: DataType.DATE
        },
        chargeId: {
            type: DataType.INTEGER
        },
        chargeAmt: {
            type: DataType.NUMBER
        },
        frequency: {
            type: DataType.STRING
        },
        prorated: {
            type: DataType.CHAR
        },
        creditAdjAmount: {
            type: DataType.FLOAT
        },
        debitAdjAmount: {
            type: DataType.FLOAT
        },
        lastBillPeriod: {
            type: DataType.DATE
        },
        nextBillPeriod: {
            type: DataType.DATE
        },
        status: {
            type: DataType.STRING
        },
        contractPeriod: {
            type: DataType.STRING
        },
        contractDtlId: {
            type: DataType.INTEGER
        },
        connectionId: {
            type: DataType.INTEGER
        },
        chargeName: {
            type: DataType.STRING
        },
        chargeType: {
            type: DataType.STRING
        },
        identificationNo: {
            type: DataType.STRING
        },
        contractType: {
            type: DataType.STRING
        },
        monthlyContractId: {
            type: DataType.INTEGER
        },
        upfrontPayment: {
            type: DataType.STRING
        },
        quantity: {
            type: DataType.NUMBER
        },
        durationMonth: {
            type: DataType.INTEGER
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
        soId: {
            type: DataType.INTEGER
        },
        soNumber: {
            type: DataType.STRING
        },
        isSplit: {
            type: DataType.STRING
        },
        mappingPayload: {
            type: DataType.STRING
        },
        isMigrated: {
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
            tableName: 'monthly_contract_dtl'
        }
    )
    MonthlyContractDtl.associate = function (models) {
        // 
    }
    return MonthlyContractDtl
}
