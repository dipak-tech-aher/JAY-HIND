export const ContractSerachCols = [
    {
        Header: "Edit",
        accessor: "edit",
        disableFilters: true
    },
    {
        Header: "Select",
        accessor: "select",
        disableFilters: true
    },
    {
        Header: "Unbilled Contract Id",
        accessor: "monthlyContractId",
        disableFilters: true,
        id: "monthlyContractId"
    },
    {
        Header: "Contract Id",
        accessor: "contractId",
        disableFilters: true,
        id: "contractId"
    },
    // {
    //     Header: "Service ID",
    //     accessor: "soNumber",
    //     disableFilters: true
    // },
    {
        Header: "Customer Number",
        accessor: "customer",
        disableFilters: true,
        id: "customerNumber"
    },
    {
        Header: "Customer Name",
        accessor: "customerName",
        disableFilters: true,
        id: "customerName"
    },
    // {
    //     Header: "Billable Reference Number",
    //     accessor: "billRefNo",
    //     disableFilters: true,
    //     id: "billRefNo",
    // },
    // {
    //     Header: "Service Number",
    //     accessor: "serviceNo",
    //     disableFilters: true,
    // },
    // {
    //     Header: "Contract Reference ID",
    //     accessor: "contractRefId",
    //     disableFilters: true,
    // },
    {
        Header: "Contract Name",
        accessor: "contractName",
        disableFilters: true,
    },
    {
        Header: "Contract Start Date",
        accessor: "actualStartDate",
        disableFilters: true
    },
    {
        Header: "Contract End Date",
        accessor: "actualEndDate",
        disableFilters: true
    },
    // {
    //     Header: "Actual Contract Start Date",
    //     accessor: "startDate",
    //     disableFilters: true
    // },
    // {
    //     Header: "Contract Start Date",
    //     accessor: "contractStartDate",
    //     disableFilters: true
    // },
    // {
    //     Header: "Actual Contract End Date",
    //     accessor: "actualEndDate",
    //     disableFilters: true
    // },
    // {
    //     Header: "Contract End Date",
    //     accessor: "endDate",
    //     disableFilters: true
    // },
    /*{
        Header: "Charge Name",
        accessor: "chargeName",
        disableFilters: true,
        id: "chargeName"
    },*/
    {
        Header: "Status",
        accessor: "status",
        disableFilters: true,
        id: "cstatus"
    },
    {
        Header: "RC",
        accessor: "rcAmount",
        disableFilters: true
    },
    {
        Header: "OTC",
        accessor: "otcAmount",
        disableFilters: true
    },
    {
        Header: "Usage",
        accessor: "usageAmount",
        disableFilters: true
    },
    {
        Header: "Credit Adjustment",
        accessor: "creditAdjAmount",
        disableFilters: true
    },
    {
        Header: "Debit Adjustment",
        accessor: "debitAdjAmount",
        disableFilters: true
    },
    {
        Header: "Total Charge",
        accessor: "totalCharge",
        disableFilters: true
    },
    {
        Header: "Last Bill Period",
        accessor: "lastBillPeriod",
        disableFilters: true,
        id: "lastBillPeriod"
    },
    {
        Header: "Next Bill Period",
        accessor: "nextBillPeriod",
        disableFilters: true
    },
    {
        Header: "Advance Payment Allocation",
        accessor: "isAdvanceAllowed",
        disableFilters: true
    },
    {
        Header: "Allocation Percentage",
        accessor: "advAllocationPercent",
        disableFilters: true
    },
    {
        Header: "Bill Period",
        accessor: "billPeriod",
        disableFilters: true,
        id: "billPeriod"
    },
    {
        Header: "Created By",
        accessor: "createdByName",
        disableFilters: true,
        id: "createdBy"
    },
    {
        Header: "Created At Date and Time",
        accessor: "createdAt",
        disableFilters: true,
        id: "createdAt"
    },
    {
        Header: "Updated By",
        accessor: "updatedBy",
        disableFilters: true,
        id: "updatedBy"
    },
    {
        Header: "Updated At Date and Time",
        accessor: "updatedAt",
        disableFilters: true,
        id: "updatedAt"
    }
]


export const ContractDetailCols = [
    {
        Header: "Select",
        accessor: "select",
        disableFilters: true
    },
    /*{
        Header: "Contract Id",
        accessor: "contractId",
        disableFilters: true
    },
    {
        Header: "Billable Reference Number",
        accessor: "billRefNo",
        disableFilters: true
    },
    {
        Header: "Service Number",
        accessor: "serviceNumber",
        disableFilters: true
    },
    {
        Header: "Contract Reference ID",
        accessor: "contractRefId",
        disableFilters: true
    },*/
    {
        Header: "Order ID",
        accessor: "orderId",
        disableFilters: true
    },
    {
        Header: "Product Name",
        accessor: "prodDetails.productName",
        disableFilters: true
    },
    // {
    //     Header: "Product Description",
    //     accessor: "itemName",
    //     disableFilters: true
    // },
    /*{
        Header: "Product Type",
        accessor: "contractTypeDesc.description",
        disableFilters: true
    },*/
    // {
    //     Header: "Actual Start Date",
    //     accessor: "actualStartDate",
    //     disableFilters: true
    // },
    // {
    //     Header: "Actual End Date",
    //     accessor: "actualEndDate",
    //     disableFilters: true
    // },
    // {
    //     Header: "Contract Start Date",
    //     accessor: "contractStartDate",
    //     disableFilters: true
    // },
    // {
    //     Header: "Contract End Date",
    //     accessor: "contractEndDate",
    //     disableFilters: true
    // },
    // {
    //     Header: "End Date",
    //     accessor: "endDate",
    //     disableFilters: true
    // },
    {
        Header: "Contract Start Date",
        accessor: "actualStartDate",
        disableFilters: true
    },
    {
        Header: "Contract End Date",
        accessor: "actualEndDate",
        disableFilters: true
    },
    {
        Header: "Status",
        accessor: "status",
        disableFilters: true
    },
    /*{
        Header: "Charge Name",
        accessor: "charge.chargeName",
        disableFilters: true
    },*/
    {
        Header: "Total Amount",
        accessor: "chargeAmt",
        disableFilters: true
    },
    {
        Header: "Balance Amount",
        accessor: "balanceAmount",
        disableFilters: true
    },
    // {
    //     Header: "Minimum Commitment",
    //     accessor: "minCommitment",
    //     disableFilters: true
    // },
    // {
    //     Header: "Total Consumption",
    //     accessor: "totalConsumption",
    //     disableFilters: true
    // },
    // {
    //     Header: "Tier Type",
    //     accessor: "prodDetails.planUsage[0].isTierType",
    //     disableFilters: true,
    //     id: 'isTierType'
    // },
    /* {
         Header: "Additional Consumption upto 50 GB",
         accessor: "mappingPayload.addConsumption.addConsumption1",
         disableFilters: true,
         id: 'addConsumption1'
     },
     {
         Header: "Additional Consumption More than 50 TB",
         accessor: "mappingPayload.addConsumption.addConsumption2",
         disableFilters: true,
         id: 'addConsumption2'
     },
     {
         Header: "Additional Consumption More than 100 TB",
         accessor: "mappingPayload.addConsumption.addConsumption3",
         disableFilters: true,
         id: 'addConsumption3'
     },*/
    {
        Header: "Charge Type",
        accessor: "charge.chargeCatDesc.description",
        disableFilters: true
    },
    {
        Header: "Fee Type",
        accessor: "frequency",
        disableFilters: true
    },
    {
        Header: "Prorated",
        accessor: "prorated",
        disableFilters: true
    },
    // {
    //     Header: "Quantity",
    //     accessor: "quantity",
    //     disableFilters: true
    // },
    {
        Header: "Duration",
        accessor: "durationMonth",
        disableFilters: true
    },
    {
        Header: "Advance Flag",
        accessor: "upfrontPaymentDesc.description",
        disableFilters: true
    },
    {
        Header: "Credit Adjustment",
        accessor: "creditAdjAmount",
        disableFilters: true
    },
    {
        Header: "Debit Adjustment",
        accessor: "debitAdjAmount",
        disableFilters: true
    },
    {
        Header: "Last Bill Period",
        accessor: "lastBillPeriod",
        disableFilters: true,
        id: "lastBillPeriod",
    },
    {
        Header: "Next Bill Period",
        accessor: "nextBillPeriod",
        disableFilters: true
    },
    {
        Header: "Total Charge",
        accessor: "totalCharge",
        disableFilters: true
    },
    {
        Header: "Bill Period",
        accessor: "billPeriod",
        disableFilters: true,
        id: "billPeriod",
    },
    {
        Header: "Created By",
        accessor: "createdBy",
        disableFilters: true,
        id: "createdBy"
    },
    {
        Header: "Created At Date And Time",
        accessor: "createdAt",
        disableFilters: true,
        id: "createdAt"
    },
    {
        Header: "Updated By",
        accessor: "updatedBy",
        disableFilters: true,
        id: "updatedBy"
    },
    {
        Header: "Updated At Date And Time",
        accessor: "updatedAt",
        disableFilters: true,
        id: "updatedAt"
    },
    {
        Header: "Remove",
        accessor: "remove",
        disableFilters: true
    }
]




export const contractSearchHiddenColumn = ['billPeriod', 'contractStartDate', 'contractRefId', 'chargeName', 'totalCharge', 'itemName', 'serviceNumber', 'edit', 'select']

export const contractSearchViewHiddenColumn = ['billPeriod', 'contractStartDate', 'contractRefId', 'chargeName', 'totalCharge', 'itemName', 'serviceNumber', 'select']

export const contractDetailHiddenColumn = ['contractRefId', 'totalCharge', 'billPeriod', 'contractStartDate', 'contractEndDate', 'select']

export const unbilledContractSearchHiddenColumn = ['nextBillPeriod', 'lastBillPeriod', 'status', 'actualEndDate', 'startDate', 'contractRefId', 'chargeName', 'totalCharge', 'edit', 'itemName', 'serviceNumber', 'select']

export const unbilledContractSearchViewHiddenColumn = ['nextBillPeriod', 'lastBillPeriod', 'status', 'actualEndDate', 'startDate', 'contractRefId', 'chargeName', 'totalCharge', 'itemName', 'serviceNumber', 'select']

export const unbilledContractDetailHiddenColumn = ['lastBillPeriod', 'nextBillPeriod', 'contractRefId', 'totalCharge', 'status', 'actualStartDate', 'actualEndDate', 'endDate', 'select']

export const contractHistoryHiddenColumn = ['nextBillPeriod', 'lastBillPeriod', 'status', 'actualEndDate', 'startDate', 'edit', 'itemName', 'serviceNumber', 'select']

export const contractHistoryViewHiddenColumn = ['nextBillPeriod', 'lastBillPeriod', 'status', 'actualEndDate', 'startDate', 'edit', 'itemName', 'serviceNumber', 'select']

export const contractHistoryDetailHiddenColumn = ['billPeriod', 'totalCharge', 'status', 'contractRefId', 'actualStartDate', 'actualEndDate', 'endDate', 'remove', 'edit']

export const ContractDetailEditCols = [
    {
        Header: "Edit",
        accessor: "edit",
        disableFilters: true
    },
    {
        Header: "Select",
        accessor: "select",
        disableFilters: true
    },
    /*{
        Header: "Contract Id",
        accessor: "contractId",
        disableFilters: true
    },
    {
        Header: "Billable Reference Number",
        accessor: "billRefNo",
        disableFilters: true
    },
   
    {
        Header: "Service Number",
        accessor: "serviceNumber",
        disableFilters: true
    },
    
    {
        Header: "Contract Reference ID",
        accessor: "contractRefId",
        disableFilters: true
    },*/
    // {
    //     Header: "Service ID",
    //     accessor: "soNumber",
    //     disableFilters: true
    // },
    // {
    //     Header: "Product Name",
    //     accessor: "prodDetails.planName",
    //     disableFilters: true
    // },
    // {
    //     Header: "Product Description",
    //     accessor: "itemName",
    //     disableFilters: true
    // },
    /*{
        Header: "Product Type",
        accessor: "contractTypeDesc.description",
        disableFilters: true
    },*/
    {
        Header: "Contract Start Date",
        accessor: "actualStartDate",
        disableFilters: true
    },
    {
        Header: "Contract End Date",
        accessor: "actualEndDate",
        disableFilters: true
    },
    // {
    //     Header: "Actual Start Date",
    //     accessor: "actualStartDate",
    //     disableFilters: true
    // },
    // {
    //     Header: "Actual End Date",
    //     accessor: "actualEndDate",
    //     disableFilters: true
    // },
    // {
    //     Header: "Start Date",
    //     accessor: "contractStartDate",
    //     disableFilters: true
    // },
    // {
    //     Header: "End Date",
    //     accessor: "endDate",
    //     disableFilters: true
    // },
    {
        Header: "Status",
        accessor: "status",
        disableFilters: true
    },
    /*{
        Header: "Charge Name",
        accessor: "charge.chargeName",
        disableFilters: true
    },*/
    {
        Header: "Total Amount",
        accessor: "chargeAmt",
        disableFilters: true
    },
    {
        Header: "Balance Amount",
        accessor: "balanceAmount",
        disableFilters: true
    },
    {
        Header: "Minimum Commitment",
        accessor: "minCommitment",
        disableFilters: true
    },
    {
        Header: "Total Consumption",
        accessor: "totalConsumption",
        disableFilters: true
    },
    {
        Header: "Tier Type",
        accessor: "prodDetails.planUsage[0].isTierType",
        disableFilters: true,
        id: 'isTierType'
    },
    /* {
         Header: "Additional Consumption upto 50 GB",
         accessor: "mappingPayload.addConsumption.addConsumption1",
         disableFilters: true,
         id: 'addConsumption1'
     },
     {
         Header: "Additional Consumption More than 50 TB",
         accessor: "mappingPayload.addConsumption.addConsumption2",
         disableFilters: true,
         id: 'addConsumption2'
     },
     {
         Header: "Additional Consumption More than 100 TB",
         accessor: "mappingPayload.addConsumption.addConsumption3",
         disableFilters: true,
         id: 'addConsumption3'
     },*/
    {
        Header: "Charge Type",
        accessor: "chargeTypeDesc.description",
        disableFilters: true
    },
    {
        Header: "Fee Type",
        accessor: "frequency",
        disableFilters: true
    },
    {
        Header: "Prorated",
        accessor: "prorated",
        disableFilters: true
    },
    {
        Header: "Quantity",
        accessor: "quantity",
        disableFilters: true
    },
    {
        Header: "Duration",
        accessor: "durationMonth",
        disableFilters: true
    },
    {
        Header: "Advance Flag",
        accessor: "upfrontPaymentDesc.description",
        disableFilters: true
    },
    {
        Header: "Credit Adjustment",
        accessor: "creditAdjAmount",
        disableFilters: true
    },
    {
        Header: "Debit Adjustment",
        accessor: "debitAdjAmount",
        disableFilters: true
    },
    // {
    //     Header: "Invoice Group",
    //     accessor: "invoiceGroup",
    //     disableFilters: true
    // },
    {
        Header: "Last Bill Period",
        accessor: "lastBillPeriod",
        disableFilters: true,
        id: "lastBillPeriod",
    },
    {
        Header: "Next Bill Period",
        accessor: "nextBillPeriod",
        disableFilters: true
    },
    {
        Header: "Total Charge",
        accessor: "chargeAmt",
        // accessor: "totalCharge",
        id:"total_charge",
        disableFilters: true
    },
    {
        Header: "Bill Period",
        accessor: "billPeriod",
        disableFilters: true,
        id: "billPeriod",
    },
    {
        Header: "Created By",
        accessor: "createdBy",
        disableFilters: true,
        id: "createdBy"
    },
    {
        Header: "Created At Date and Time",
        accessor: "createdAt",
        disableFilters: true,
        id: "createdAt"
    },
    {
        Header: "Updated By",
        accessor: "updatedBy",
        disableFilters: true,
        id: "updatedBy"
    },
    {
        Header: "Updated At Date and Time",
        accessor: "updatedAt",
        disableFilters: true,
        id: "updatedAt"
    },
    {
        Header: "Remove",
        accessor: "remove",
        disableFilters: true
    }
]

export const ContractEditSerachCols = [
    {
        Header: "Edit",
        accessor: "edit",
        disableFilters: true
    },
    {
        Header: "Unbilled Contract Id",
        accessor: "monthlyContractId",
        disableFilters: true,
        id: "monthlyContractId"
    },
    {
        Header: "Contract Id",
        accessor: "contractId",
        disableFilters: true,
    },
    {
        Header: "Customer Number",
        accessor: "customer.customerNo",
        disableFilters: true,
    },
    {
        Header: "Customer Name",
        accessor: "customerName",
        disableFilters: true,
    },
    // {
    //     Header: "Sales Order Number",
    //     accessor: "soDetails.soNumber",
    //     disableFilters: true
    // },
    // {
    //     Header: "Billable Reference Number",
    //     accessor: "billRefNo",
    //     disableFilters: true,
    // },
    {
        Header: "Service Number",
        accessor: "serviceNumber",
        disableFilters: true,
    },
    {
        Header: "Contract Reference ID",
        accessor: "contractRefId",
        disableFilters: true,
    },
    {
        Header: "Contract Name",
        accessor: "itemName",
        disableFilters: true,
    },
    {
        Header: "Contract Start Date",
        accessor: "startDate",
        disableFilters: true
    },
    {
        Header: "Contract End Date",
        accessor: "endDate",
        disableFilters: true
    },
    // {
    //     Header: "Actual Contract Start Date",
    //     accessor: "startDate",
    //     disableFilters: true
    // },
    // {
    //     Header: "Contract Start Date",
    //     accessor: "contractStartDate",
    //     disableFilters: true
    // },
    // {
    //     Header: "Actual Contract End Date",
    //     accessor: "actualEndDate",
    //     disableFilters: true
    // },
    // {
    //     Header: "Contract End Date",
    //     accessor: "endDate",
    //     disableFilters: true
    // },
    /*{
        Header: "Charge Name",
        accessor: "chargeName",
        disableFilters: true,
        id: "chargeName"
    },*/
    {
        Header: "Status",
        accessor: "status",
        disableFilters: true
    },
    {
        Header: "RC",
        accessor: "rcAmount",
        disableFilters: true
    },
    {
        Header: "OTC",
        accessor: "otcAmount",
        disableFilters: true
    },
    {
        Header: "Usage",
        accessor: "usageAmount",
        disableFilters: true
    },
    {
        Header: "Credit Adjustment",
        accessor: "creditAdjAmount",
        disableFilters: true
    },
    {
        Header: "Debit Adjustment",
        accessor: "debitAdjAmount",
        disableFilters: true
    },
    {
        Header: "Total Charge",
        accessor: "totalCharge",
        disableFilters: true
    },
    {
        Header: "Last Bill Period",
        accessor: "lastBillPeriod",
        disableFilters: true,
        id: "lastBillPeriod",
    },
    {
        Header: "Next Bill Period",
        accessor: "nextBillPeriod",
        disableFilters: true
    },
    {
        Header: "Advance Payment Allocation",
        accessor: "isAdvanceAllowed",
        disableFilters: true
    },
    {
        Header: "Allocation Percentage",
        accessor: "advAllocationPercent",
        disableFilters: true
    },
    {
        Header: "Bill Period",
        accessor: "billPeriod",
        disableFilters: true,
        id: "billPeriod",
    },
    {
        Header: "Created By",
        accessor: "createdBy",
        disableFilters: true,
        id: "createdBy"
    },
    {
        Header: "Created At Date and Time",
        accessor: "createdAt",
        disableFilters: true,
        id: "createdAt"
    },
    {
        Header: "Updated By",
        accessor: "updatedBy",
        disableFilters: true,
        id: "updatedBy"
    },
    {
        Header: "Updated At Date and Time",
        accessor: "updatedAt",
        disableFilters: true,
        id: "updatedAt"
    }
]


export const NewContractEditColumns = ['monthlyContractId', 'billPeriod', 'contractStartDate', 'contractRefId', 'chargeName', 'totalCharge', 'itemName', 'serviceNumber', 'select', 'isAdvanceAllowed', 'advAllocationPercent']