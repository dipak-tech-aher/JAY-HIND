export const ViewContractColumnList = [
    {
        Header: "View",
        accessor: "view",
        disableFilters: true
    },
    {
        Header: "Contract Id",
        accessor: "contractId",
        disableFilters: true
    },
    // {
    //     Header: "Service ID",
    //     accessor: "serviceNo",
    //     disableFilters: true
    // },
    {
        Header: "Customer No",
        accessor: "customer.customerNo",
        disableFilters: true
    },
    {
        Header: "Customer Name",
        accessor: "customerName",
        disableFilters: true
    },
    // {
    //     Header: "Billable Ref No",
    //     accessor: "billRefNo",
    //     disableFilters: true
    // },
    {
        Header: "Service Number",
        accessor: "serviceNo",
        disableFilters: true
    },
    {
        Header: "Contract Name",
        accessor: "contractName",
        disableFilters: true
    },
    // {
    //     Header: "Billable Ref Name",
    //     accessor: "billRefName",
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
        Header: "Charge Name",
        accessor: "chargeName",
        disableFilters: true
    },
    {
        Header: "Charge Type",
        accessor: "chargeType",
        disableFilters: true
    },
    {
        Header: "Charge Amount",
        accessor: "chargeAmount",
        disableFilters: true
    },
    {
        Header: "Frequency",
        accessor: "frequency",
        disableFilters: true
    },
    {
        Header: "Prorated",
        accessor: "prorated",
        disableFilters: true
    },
    {
        Header: "Total RC",
        accessor: "rcAmount",
        disableFilters: true
    },
    {
        Header: "Total NRC",
        accessor: "otcAmount",
        disableFilters: true
    },
    {
        Header: "Total Usage",
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
    // {
    //     Header: "Wavier",
    //     accessor: "wavier",
    //     disableFilters: true
    // },
    {
        Header: "Total Charge",
        accessor: "totalCharge",
        disableFilters: true
    },
    {
        Header: "Last Bill Period",
        accessor: "lastBillPeriod",
        disableFilters: true
    },
    {
        Header: "Next Bill Period",
        accessor: "nextBillPeriod",
        disableFilters: true
    },
    {
        Header: "Ageing",
        accessor: "ageingDays",
        disableFilters: true
    },
    {
        Header: "Detail",
        accessor: "detail",
        disableFilters: true
    },
    /*{
        Header: "Action",
        accessor: "action",
        disableFilters: true
    },*/
]
export const ReviewContractColumnList = [
    {
        Header: "View",
        accessor: "view",
        disableFilters: true
    },
    // {
    //     Header: "Action",
    //     accessor: "hold",
    //     disableFilters: true
    // },
    // {
    //     Header: "Invoice Split",
    //     accessor: "isSplit",
    //     disableFilters: true,
    //     id: "select"
    // },
    {
        Header: "Contract Id",
        accessor: "contractId",
        disableFilters: true
    },
    {
        Header: "Customer No",
        accessor: "customer.customerNo",
        disableFilters: true
    },
    {
        Header: "Customer Name",
        accessor: "customerName",
        disableFilters: true
    },
    // {
    //     Header: "Billable Ref No",
    //     accessor: "billRefNo",
    //     disableFilters: true
    // },
    {
        Header: "Service Number",
        accessor: "serviceNo",
        disableFilters: true
    },
    {
        Header: "Contract Name",
        accessor: "contractName",
        disableFilters: true
    },
    // {
    //     Header: "Billable Ref Name",
    //     accessor: "billRefName",
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
        Header: "Charge Name",
        accessor: "chargeName",
        disableFilters: true
    },
    {
        Header: "Charge Type",
        accessor: "chargeType",
        disableFilters: true
    },
    {
        Header: "Charge Amount",
        accessor: "chargeAmount",
        disableFilters: true
    },
    {
        Header: "Frequency",
        accessor: "frequency",
        disableFilters: true
    },
    {
        Header: "Prorated",
        accessor: "prorated",
        disableFilters: true
    },
    {
        Header: "Total RC",
        accessor: "rcAmount",
        disableFilters: true
    },
    {
        Header: "Total NRC",
        accessor: "otcAmount",
        disableFilters: true
    },
    {
        Header: "Total Usage",
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
    // {
    //     Header: "Wavier",
    //     accessor: "wavier",
    //     disableFilters: true
    // },
    {
        Header: "Total Charge",
        accessor: "totalCharge",
        disableFilters: true
    },
    {
        Header: "Last Bill Period",
        accessor: "lastBillPeriod",
        disableFilters: true
    },
    {
        Header: "Next Bill Period",
        accessor: "nextBillPeriod",
        disableFilters: true
    },
    {
        Header: "Ageing",
        accessor: "ageingDays",
        disableFilters: true
    },
    {
        Header: "Detail",
        accessor: "detail",
        disableFilters: true
    },
    /*{
        Header: "Action",
        accessor: "action",
        disableFilters: true
    },*/
]
export const ViewContractHiddenColumns = [
    'serviceNo',
    'contractName',
    'chargeName',
    'chargeType',
    'chargeAmount',
    'frequency',
    'prorated',
    'lastBillPeriod',
    'nextBillPeriod',
    'detail',
    'action',
    'startDate',
    'endDate'
];

export const ViewContractModalHiddenColumns = [
    'accountId',
    'contractDesc',
    'contractPeriod',
    'createdAt',
    'createdBy',
    'customer',
    'customerId',
    'lastBillPeriod',
    'monthlyContractDtl',
    'monthlyContractId',
    'nextBillPeriod',
    'status',
    'updatedAt',
    'updatedBy',
    'charge'
];

export const EditContractModalHiddenColumns = [
    'accountId',
    'contractDesc',
    'contractPeriod',
    'createdAt',
    'createdBy',
    'customer',
    'customerId',
    'customer',
    'monthlyContractDtl',
    'monthlyContractId',
    'updatedAt',
    'updatedBy',
    'charge'
];

export const ViewContractDetailsModalHiddenColumns = [
    'actualStartDate',
    'actualEndDate',
    'chargeId',
    'contractDtlId',
    'contractPeriod',
    'createdAt',
    'createdBy',
    'itemId',
    'itemName',
    'lastBillPeriod',
    'monthlyContractDtlId',
    'nextBillPeriod',
    'updatedAt',
    'updatedBy',
    'charge'
];

export const EditContractDetailsModalHiddenColumns = [
    'contractDtlId',
    'chargeId',
    'createdAt',
    'createdBy',
    'frequency',
    'itemId',
    'itemName',
    'monthlyContractDtlId',
    'prorated',
    'updatedBy',
    'updatedAt',
    'charge'
];

