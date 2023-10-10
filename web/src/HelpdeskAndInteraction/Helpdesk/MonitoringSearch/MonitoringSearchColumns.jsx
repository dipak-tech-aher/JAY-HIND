export const MonitoringSearchColumns = [
    {
        Header: "Interaction ID",
        accessor: "helpdeskId",
        disableFilters: false,
        click: true,
        id: "helpdeskId",
    },
    {
        Header: "Channel",
        accessor: "source",
        disableFilters: false,
        id: 'source'
    },
    {
        Header: "Agent Name",
        accessor: "updatedByDetails.firstName",
        disableFilters: false,
        id: 'agent'
    },
    {
        Header: "Supervisor",
        accessor: "supervisor",
        disableFilters: false,
        id: "supervisor"
    },
    {
        Header: "Score",
        accessor: "weightage",
        disableFilters: false,
        id: "weightage"
    },
    {
        Header: "Start Date",
        accessor: "updatedAt",
        disableFilters: true,
        id: 'startDate'
    },
    {
        Header: "To Date",
        accessor: "createdAt",
        disableFilters: true,
        id: 'endDate'
    },
    {
        Header: "Customer Name",
        accessor: "customerName",
        disableFilters: false,
        id: "fullName"
    },
    {
        Header: "Call Duration",
        accessor: "difference",
        disableFilters: false,
        id: "callDuration"
    },
    {
        Header: "Helpdesk Status",
        accessor: "statusDesc.description",
        disableFilters: false,
        id: "status"
    },
    {
        Header: "Action",
        accessor: "action",
        disableFilters: true
    }
]


export const MonitoringSearchHiddenColumns = [
    'endDate'
]