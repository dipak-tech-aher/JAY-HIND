export const SLAListCols = [
    {
        Header: "SLA Id",
        accessor: "slaId",
        disableFilters: false,
        id: 'slaId'
    },

    {
        Header: "SLA Name",
        accessor: "slaName",
        disableFilters: false,
        id: 'slaName'
    },
    {
        Header: "SLA Schedule",
        accessor: "slaSchedule",
        disableFilters: true,
        id: 'slaSchedule'
    },
    {
        Header: "Time Zone",
        accessor: "timeZone",
        disableFilters: false,
        id: 'timeZone'
    },
    {
        Header: "SLA Settings",
        accessor: "slaSettings",
        disableFilters: false,
        id: "slaSettings"
    },
    {
        Header: "Notification Settings",
        accessor: "notificationSettings",
        disableFilters: false,
        id: "notificationSettings"
    },

    {
        Header: "Action",
        accessor: "action",
        disableFilters: true
    }
]
