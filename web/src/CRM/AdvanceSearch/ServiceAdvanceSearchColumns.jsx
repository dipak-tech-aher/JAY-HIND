export const ServiceAdvanceSearchColumns = [
    
    {
        Header: "Service Number",
        accessor: "serviceNo",
        disableFilters: false,
        id: 'serviceNo'
    },
    {
        Header: "Service Uuid",
        accessor: "serviceUuid",
        disableFilters: false,
        id: 'serviceUuid',
        hidden: true
    },
    {
        Header: "Service Name",
        accessor: "serviceName",
        disableFilters: false,
        id: 'serviceName'
    },    
    {
        Header: "Service Type",
        accessor: "serviceTypeDesc.description",
        disableFilters: true,
    },
    {
        Header: "Activation Date",
        accessor: "activationDate",
        disableFilters: false,
        id: 'activationDate'
    },
    {
        Header: "Expiry Date",
        accessor: "expiryDate",
        disableFilters: false,
        id: 'expiryDate'
    },    
    {
        Header: "Service Status",
        accessor: "serviceStatus.description",
        disableFilters: false
    },   
    {
        Header: "Action",
        accessor: "action",
        disableFilters: true
    }
]

// accessor names
export const ServiceAdvanceSearchHiddenColumns = [
    'customerUuid',
    'accountUuid',
    'serviceUuid'
]

