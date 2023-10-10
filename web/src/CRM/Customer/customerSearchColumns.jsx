export const CustomerSearchColumns = [
    {
        Header: "Customer ID",
        accessor: "customerUuid",
        id: 'customerUuid'
    },
    {
        Header: "Customer Number",
        accessor: "customerNo",
        id: 'customerNo'
    },
    // {
    //     Header: "Customer Reference Number",
    //     accessor: "customerRefNo",
    //     id: 'customerRefNo'
    // },
    {
        Header: "Customer Name",
        accessor: "firstName",
        disableFilters: false,
        id: 'customerName'
    },
    {
        Header: "Mobile Number",
        accessor: "customerContact[0].mobileNo",
        id: 'mobileNo',
        disableFilters: false,
    },
    {
        Header: "Email",
        accessor: "customerContact[0].emailId",
        disableFilters: true,
    },
    {
        Header: "Customer Status",
        accessor: "statusDesc.description",
        disableFilters: true,
        id: 'customerServiceStatus'
    },
    {
        Header: "Status Code",
        accessor: "status",
        disableFilters: true,
        id: 'status'
    }
]

export const CustomerSearchHiddenColumns = [
    'customerId',
    'accountId',
    'serviceId',
    'status',
    'customerUuid'
]

export const ComplaintCustomerSearchHiddenColumns = [
    'customerUuid',
    'accountId',
    'serviceId',
    'action',
    'status'
]
