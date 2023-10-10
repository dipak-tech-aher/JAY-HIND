export const InvoiceSearchColumns = [
    {
        Header: "Select",
        accessor: "select",
        disableFilters: true,
    },
    {
        Header: "Invoice No",
        accessor: "invoiceId",
        disableFilters: false,
        id: 'invoiceId'
    },
    // {
    //     Header: "Service ID",
    //     accessor: "soNumber",
    //     disableFilters: true,
    //     id: 'soNumber'
    // },
    {
        Header: "Customer Number",
        accessor: "customer[0].customerNo",
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
    //     Header: "Biilable Reference Number",
    //     accessor: "billRefNo",
    //     disableFilters: false,
    //     id: "billRefNo"
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
        Header: "Invoice Due Date",
        accessor: "dueDate",
        disableFilters: true
    },
    {
        Header: "Invoice Amount",
        accessor: "invAmt",
        disableFilters: true
    },
    {
        Header: "Invoice O/S Amount",
        accessor: "invOsAmt",
        disableFilters: true
    },
    {
        Header: "Invoice Status",
        accessor: "invoiceStatus",
        disableFilters: true
    },
    {
        Header: "Invoice PDF",
        accessor: "invoicePdf",
        disableFilters: true
    },
    /*{
        Header: "Usage",
        accessor: "usage",
        disableFilters: true
    }*/
]

export const InvoiceSearchHiddenColumns = ['select', 'usage', 'invoicePdf']

export const InvoicePaymentHiddenColumns = ['customerNo', 'customerName', 'invStartDate', 'invEndDate', 'invoiceStatus', 'invoicePdf', 'usage']

export const InvoiceDetailPaymentHiddenColumns = ['chargeAmt', 'frequency', 'prorated', 'creditAdj', 'debitAdj']


export const InvoiceChargeColumns = [
    {
        Header: "Invoice No",
        accessor: "invoiceId",
        disableFilters: true
    },
    {
        Header: "Biilable Reference Number",
        accessor: "billRefNo",
        disableFilters: true
    },
    // {
    //     Header: "Service Number",
    //     accessor: "serviceNumber",
    //     disableFilters: true
    // },
    {
        Header: "Contract Name",
        accessor: "contractName",
        disableFilters: true
    },
    {
        Header: "Start Date",
        accessor: "startDate",
        disableFilters: true
    },
    {
        Header: "End Date",
        accessor: "endDate",
        disableFilters: true
    },
    {
        Header: "Charge Date",
        accessor: "chargeDate",
        disableFilters: true
    },
    {
        Header: "Charge Amount",
        accessor: "chargeAmount",
        disableFilters: true
    }
]


export const InvoiceUsageChargeColumns = [
    {
        Header: "Date",
        accessor: "date",
        disableFilters: true
    },
    {
        Header: "Time",
        accessor: "time",
        disableFilters: true
    },
    {
        Header: "Service Number",
        accessor: "serviceNumber",
        disableFilters: true
    },
    {
        Header: "Charge Name",
        accessor: "chargeName",
        disableFilters: true
    },
    {
        Header: "Quantity",
        accessor: "quantity",
        disableFilters: true
    },
    {
        Header: "Rate (Per MB)",
        accessor: "rate",
        disableFilters: true
    },
    {
        Header: "Charges",
        accessor: "charges",
        disableFilters: true
    }
]