const BillingColumns = [
    {
        Header: "Customer Number",
        accessor: "customerNo",
        disableFilters: true,
        id: "customerNo"   
    },
    {
        Header: "Customer Name",
        accessor: "customerName",
        disableFilters: true,
        id: "customerName"   
    },
    {
        Header: "Customer Type",
        accessor: "customerType",
        disableFilters: true,
        id: "customerType"   
    },
    {
        Header: "Billable Ref Number",
        accessor: "billRefNumber",
        disableFilters: true,
        id: "billRefNumber"   
    },
    {
        Header: "Contract ID",
        accessor: "contractId",
        disableFilters: false,
        id: 'contractId'
    },
    {
        Header: "Service Number",
        accessor: "serviceNumber",
        disableFilters: false,
        id: 'serviceNumber'
    },
    {
        Header: "Contract Name",
        accessor: "contractName",
        disableFilters: true,
        id: "contractName"   
    },
    {
        Header: "Contract Start Date",
        accessor: "contractStartDate",
        disableFilters: true,
        id: "contractStartDate"   
    },
    {
        Header: "Contract End Date",
        accessor: "contractEndDate",
        disableFilters: true,
        id: "contractEndDate"   
    },
    {
        Header: "Contract Status",
        accessor: "contractStatus",
        disableFilters: true,
        id: "contractStatus"   
    },
    {
        Header: "Charge Name",
        accessor: "chargeName",
        disableFilters: true,
        id: "chargeName" 
    },
    {
        Header: "Charge Type",
        accessor: "chargeType",
        disableFilters: true,
        id: "chargeType"
    },
    {
        Header: "Charge Amount",
        accessor: "chargeAmount",
        disableFilters: true,
        id:"chargeAmount"
    },
    {
        Header: "Currency",
        accessor: "currency",
        disableFilters: true,
        id: "currency"
    },
    {
        Header: "Frequency",
        accessor: "frequency",
        disableFilters: true,
        id: "frequency"
    },
    {
        Header: "Prorated",
        accessor: "prorated",
        disableFilters: true,
        id: "prorated"
    },
    {
        Header: "Credit Adjustment",
        accessor: "creditAdjAmount",
        disableFilters: true,
        id: "creditAdjAmount"
    },
    {
        Header: "Debit Adjustment",
        accessor: "debitAdjAmount",
        disableFilters: true,
        id: "debitAdjAmount"
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
        disableFilters: true,
        id: "nextBillPeriod"
    }   
]
export default BillingColumns;
