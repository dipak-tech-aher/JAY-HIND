 const ApiListColumns = [
    {
        Header: "API Name",
        accessor: "apiName",
        disableFilters: false
    },
    {
        Header: "API Base URL",
        accessor: "apiBaseUrl",
        disableFilters: false
    },
    {
        Header: "Application Token/Site Key",
        accessor: "apiToken",
        disableFilters: false
    },
    {
        Header: "Secret Key",
        accessor: "apiKey",
        disableFilters: false
    },
    {
        Header: "Mode",
        accessor: "mode",
        disableFilters: false
    },
    {
        Header: "Status",
        accessor: "status",
        disableFilters: false
    },  {
        Header: "Updated By",
        accessor: "updatedBy",
        disableFilters: false
    },
    {
        Header: "Updated At",
        accessor: "updatedAt",
        disableFilters: true
    },
    {
        Header: "Created By",
        accessor: "createdBy",
        disableFilters: false
    },
    {
        Header: "Created At",
        accessor: "createdAt",
        disableFilters: true
    },
    {
        Header: "Action",
        accessor: "action",
        disableFilters: true
    }
]

export default ApiListColumns;