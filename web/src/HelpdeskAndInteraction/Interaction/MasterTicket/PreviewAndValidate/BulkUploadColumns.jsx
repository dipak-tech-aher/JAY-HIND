export const ChildTicketMandatoryColumns = [
    ['Interaction Id', 'Account Id', 'Account Name'],
    ['Problem Code', 'Status']
]

export const ChildTicketTemplateColumns = [
    {
        Header: "Interaction Id",
        accessor: "intxnId",
        disableFilters: true,
    },
    {
        Header: "Account Id",
        accessor: "accountId",
        disableFilters: true,
    },
    {
        Header: "Account Name",
        accessor: "AccountName",
        disableFilters: true,
    },
    {
        Header: "Problem Code",
        accessor: "problemCode",
        disableFilters: true,
    },
    {
        Header: "Status",
        accessor: "status",
        disableFilters: true,
    },
    {
        Header: "Validation Status",
        accessor: "validationStatus",
        disableFilters: true,
    },
    {
        Header: "Validation Remarks",
        accessor: "validationRemark",
        disableFilters: true,
    }
]