export const InteractionSearchColumns = [
    {
        Header: "Interaction No",
        accessor: "intxnNo",
        disableFilters: true,
        click: true,
        id: "intxnNo",

    },
    {
        Header: "Interaction Type",
        accessor: "intxnType.description",
        disableFilters: true,
        id: 'intxnType.description'
    },
    {
        Header: "Status",
        accessor: "intxnStatus.description",
        disableFilters: true,
        id: "intxnStatus.description"
    },
    {
        Header: "Customer Name",
        id:"customerName",
        accessor: "customerDetails.firstName",
        disableFilters: true,
    }, {
        Header: "Service Type",
        accessor: "serviceType.description",
        disableFilters: true,
        id: "serviceType.description"
    },
    {
        Header: "Assigned",
        accessor: "currentUser.description.firstName",
        disableFilters: true,
        id: "currentUser"
    },
    {
        Header: "Created Date",
        accessor: "createdAt",
        disableFilters: true
    },
    {
        Header: "Created By",
        accessor: "createdBy.firstName",
        disableFilters: true
    },
   
    // {
    //     Header: "Interaction Category Type",
    //     accessor: "ticketTypeDesc",
    //     disableFilters: false,
    // },
    // {
    //     Header: "Work Order Type",
    //     accessor: "woTypeDescription",
    //     disableFilters: false,
    //     id: "woType"
    // },
    // {
    //     Header: "Subscription ID",
    //     accessor: "accessNbr",
    //     disableFilters: false,
    //     id: "serviceNumber"
    // },
   
  
  
    // {
    //     Header: "Customer Number",
    //     accessor: "customerDetails.idValue",
    //     disableFilters: true,
    // },
    // {
    //     Header: "Account Name",
    //     accessor: "accountName",
    //     disableFilters: true,
    // },
    // {
    //     Header: "Account ID",
    //     accessor: "accountNo",
    //     disableFilters: true,
    // },
    // {
    //     Header: "Contact Number",
    //     accessor: "contactNo",
    //     disableFilters: true,
    // },
    
    // {
    //     Header: "Product/Services",
    //     accessor: "",
    //     disableFilters: true
    // },
    // {
    //     Header: "Action",
    //     accessor: "action",
    //     disableFilters: true
    // },
    // {
    //     Header: "Customer Id",
    //     accessor: "customerId",
    //     disableFilters: false,
    // },
    // {
    //     Header: "Service Id",
    //     accessor: "serviceId",
    //     disableFilters: false,
    // },
    // {
    //     Header: "Interaction Type",
    //     accessor: "intxnType",
    //     disableFilters: false
    // },
    // {
    //     Header: "Account Id",
    //     accessor: "accountId",
    //     disableFilters: false
    // },
    // {
    //     Header: "External System",
    //     accessor: "externalRefSys1",
    //     disableFilters: true
    // },
    // {
    //     Header: "External Reference",
    //     accessor: "externalRefNo1",
    //     disableFilters: true
    // }
]

// accessor names
export const InteractionSearchHiddenColumns = [
    'customerId',
    'serviceId',
    'intxnType',
    'accountId',
    'prodType',
    'externalRefSys1',
    'externalRefNo1',
    'ticketTypeDesc'
]
