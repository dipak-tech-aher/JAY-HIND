export const AccountSearchColumns = [
    {
        Header: "Billable Reference Number",
        accessor: "billRefNo",
        disableFilters: false,
        id: 'billRefNo'
    },
    {
        Header: "Service ID",
        accessor: "soNumber",
        disableFilters: true,
       
    },
    {
        Header: "Customer Number",
        accessor: "customerNumber",
        disableFilters: false,
        id: 'customerNumber'
    },
    {
        Header: "Customer Name",
        accessor: "customerName",
        disableFilters: false,
        id: 'customerName'
    },
    // {
    //     Header: "Contract Type",
    //     accessor: "contractType",
    //     disableFilters: false,
    //     id: 'contractType'
    // },
    {
        Header: "Currency",
        accessor: "currency",
        disableFilters: true,
    },
    /* {
         Header: "Contract ID",
         accessor: "contractId",
         disableFilters: false,
         id: 'contractId'
     }*/
]

export const AccountSearchHiddenColumns = ["invoiceAction"]