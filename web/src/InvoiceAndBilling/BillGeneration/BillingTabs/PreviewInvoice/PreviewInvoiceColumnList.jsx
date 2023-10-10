export const PreviewInvoiceColumnList = [
    {
        Header: "Invoice Id",
        accessor: "invoiceId",
        disableFilters: true
    },
    {
        Header: "Contract Id",
        accessor: "contractId",
        disableFilters: true
    },
    {
        Header: "Customer No",
        // accessor: "customer[0].customerNo",
        accessor: row =>{
            return row?.customer?.[0]?.customerNo || ''
        },
        disableFilters: true
    },
    {
        Header: "Customer Name",
        accessor: "customer[0].firstName",
        disableFilters: true
    },
    // {
    //     Header: "Billable Ref No",
    //     accessor: "billRefNo",
    //     disableFilters: true
    // },
    {
        Header: "Invoice Start Date",
        accessor: "invStartDate",
        disableFilters: true
    },
    {
        Header: "Invoice End Date",
        accessor: "invEndDate",
        disableFilters: true
    },
    {
        Header: "Invoice Date",
        accessor: "invDate",
        disableFilters: true
    },
    {
        Header: "Due Date",
        accessor: "dueDate",
        disableFilters: true
    },
    {
        Header: "Invoice Amount",
        accessor: "invAmt",
        disableFilters: true
    },
    {
        Header: "Advance Amount",
        accessor: "advanceAmount",
        disableFilters: true
    },
    {
        Header: "Previous Balance Amount",
        accessor: "previousBalanceAmount",
        disableFilters: true
    },
    {
        Header: "Total Outstanding",
        accessor: "totalOutstanding",
        disableFilters: true
    },
    {
        Header: "View Invoice Details",
        accessor: "viewInvoiceDetails",
        disableFilters: true
    },
    {
        Header: "View Invoice PDF",
        accessor: "viewInvoicePdf",
        disableFilters: true
    },
]