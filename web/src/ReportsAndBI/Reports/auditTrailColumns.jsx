const AuditTrailColumns = [
    {
        Header: "User ID",
        accessor: "userID",
        disableFilters: true,
        id: "userID"   
    },
    {
        Header: "User Name",
        accessor: "userName",
        disableFilters: true,
        id: "userName"   
    },
    {
        Header: "IP",
        accessor: "ip",
        disableFilters: true,
        id: "iP"   
    },
    {
        Header: "Date and Time",
        accessor: "dateTime",
        disableFilters: true,
        id: "dateTime"   
    },
    {
        Header: "Action",
        accessor: "action",
        disableFilters: true,
        id: "action"   
    },
    {
        Header: "Action Details",
        accessor: "actionDetails",
        disableFilters: true,
        id: "actionDetails"   
    }   
]
export default AuditTrailColumns;
