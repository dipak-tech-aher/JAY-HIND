export const CustomerDetailsViewColumns = [
    {
        Header: "Interaction Number",
        accessor: "intxnNo",
        disableFilters: true
    },
    {
        Header: "Interaction Category",
        accessor: "intxnCategory.description",
        disableFilters: true
    },
    {
        Header: "Interaction Type",
        accessor: "intxnType.description",
        disableFilters: true
    },
    {
        Header: "About",
        accessor: "intxnCause.description",
        disableFilters: true
    },
    {
        Header: "Status",
        accessor: "intxnStatus.description",
        disableFilters: true
    },
    {
        Header: "Created On",
        accessor: "createdAt",
        disableFilters: true
    },
    {
        Header: "Updated On",
        accessor: "updatedAt",
        disableFilters: true
    }
]

export const CustomerDetailsInteractionViewColumns = [
    {
        Header: "Interaction Number",
        accessor: "intxnNo",
        disableFilters: true
    },
    {
        Header: "Interaction Category",
        accessor: "intxnCategory.description",
        disableFilters: true
    },
    {
        Header: "Interaction Type",
        accessor: "intxnType.description",
        disableFilters: true
    },
    {
        Header: "Service Type",
        accessor: "serviceType.description",
        disableFilters: true
    },
    {
        Header: "Status",
        accessor: "intxnStatus.description",
        disableFilters: true
    },
    {
        Header: "Created On",
        accessor: "createdAt",
        disableFilters: true
    },
    {
        Header: "Updated On",
        accessor: "updatedAt",
        disableFilters: true
    }
]