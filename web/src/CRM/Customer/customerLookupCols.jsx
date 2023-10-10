export const CustomerLookupModalCols = [
    {
        Header: "Customer Number",
        accessor: "crmCustomerNo",
        disableFilters: true,
    },

    {
        Header: "Customer Name",
        accessor: "customerName",
        disableFilters: true,
    },
    {
        Header: "Customer Type",
        accessor: "customerTypeDesc.description",
        disableFilters: true,
    }
]