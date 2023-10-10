const openInteractionColumns = [
    {
        Header: "Interaction ID",
        accessor: "interactionNumber",
        disableFilters: true,
        id: "interaction No"   
    },
    {
        Header: "Interaction Type",
        accessor: "interactionType",
        disableFilters: true,
        id: "interaction Type"   
    },
    {
        Header: "Status",
        accessor: "interactionStatus",
        disableFilters: true,
        id: "status"   
    },
    {
        Header: "Customer No",
        accessor: "customerNumber",
        disableFilters: true,
        id: "customerNo "   
    },
    {
        Header: "Customer Name",
        accessor: "customerName",
        disableFilters: true,
        id: "CustomerName"   
    },
    {
        Header: "Customer Type",
        accessor: "customerCategory",
        disableFilters: true,
        id: "CustomerCategory"   
    },
    // {
    //     Header: "Service No",
    //     accessor: "serviceNo",
    //     disableFilters: true,
    //     id: "Service No"   
    // },
    {
        Header: "Service Type",
        accessor: "serviceType",
        disableFilters: true,
        id: "ServiceType"   
    },  
    {
        Header: "Problem Category",
        accessor: "interactionCategory",
        disableFilters: true,
        id: "interactionCategory"   
    },
    // {
    //     Header: "Problem Type",
    //     accessor: "problemType",
    //     disableFilters: true,
    //     id: "problemType"   
    // },
    // {
    //     Header: "Problem Cause",
    //     accessor: "interactionCause",
    //     disableFilters: true,
    //     id: "interactionCause"   
    // },
    {
        Header: "Ticket Channel",
        accessor: "interactionChannel",
        disableFilters: true,
        id: "interactionChannel"   
    },
    {
        Header: "Ticket Priority",
        accessor: "priority",
        disableFilters: true,
        id: "Priority"   
    },
    {
        Header: "Current Dept",
        accessor: "currentEntity",
        disableFilters: true,
        id: "CurrentEntity"   
    },
    {
        Header: "Current Role",
        accessor: "currentRole",
        disableFilters: true,
        id: "CurrentRole"   
    },
    {
        Header: "Contact No",
        accessor: "contactNo",
        disableFilters: true,
        id: "contactNo"   
    },
    {
        Header: "Contact Email",
        accessor: "contactEmail",
        disableFilters: true,
        id: "contactEmail"   
    },
    {
        Header: "Created By",
        accessor: "createdBy",
        disableFilters: true,
        id: "createdBy"   
    },
    {
        Header: "Created On",
        accessor: "createdAt",
        disableFilters: true,
        id: "createdAt"   
    },
    {
        Header: "Open Ageing Days",
        accessor: "openAgeingDays.minutes",
        disableFilters: true,
        id: "openAgeingDays"   
    }   
]
export default openInteractionColumns;
