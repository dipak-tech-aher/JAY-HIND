export const AccountAdvanceSearchColumns = [
    
    {
        Header: "Account Number",
        accessor: "accountNo",
        disableFilters: false,
        id: 'accountNo'
    },
    {
        Header: "Account Uuid",
        accessor: "accountUuid",
        disableFilters: false,
        id: 'accountUuid',
        hidden: true
    },
    {
        Header: "First Name",
        accessor: "firstName",
        disableFilters: false,
        id: 'firstName'
    },
    {
        Header: "Last Name",
        accessor: "lastName",
        disableFilters: false,
        id: 'lastName'
    },
    {
        Header: "Account Type",
        accessor: "accountTypeDesc.description",
        disableFilters: true,
    },
    {
        Header: "Account Contact Number",
        accessor: "accountContact[0].contactNo",
        disableFilters: false,
        id: 'contactNo'
    },
    {
        Header: "Account Status",
        accessor: "customerStatus",
        disableFilters: false
    },   
    {
        Header: "Action",
        accessor: "action",
        disableFilters: true
    }
]

// accessor names
export const AccountAdvanceSearchHiddenColumns = [
    'customerUuid',
    'accountUuid'
]

