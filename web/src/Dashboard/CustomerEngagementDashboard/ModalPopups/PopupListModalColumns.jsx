const { v4: uuidv4 } = require('uuid')

export const IssueSolvedByColumns = [
    {
        Header: "#ID",
        accessor: "intxn_no",
        disableFilters: true,
        id: "intxn_no",
        uid: uuidv4()
    },
    {
        Header: "Name",
        accessor: "customer_name",
        disableFilters: true,
        id: "customer_name",
        uid: uuidv4()
    },
    {
        Header: "Status",
        accessor: "intxn_status",
        disableFilters: true,
        id: "intxn_status",
        uid: uuidv4()
    },
    {
        Header: "Type",
        accessor: "intxn_type",
        disableFilters: true,
        id: "intxn_type",
        uid: uuidv4()
    },
    {
        Header: "Category",
        accessor: "intxn_category",
        disableFilters: true,
        id: "intxn_category",
        uid: uuidv4()
    },
    {
        Header: "Service Type",
        accessor: "service_type",
        disableFilters: true,
        id: "service_type",
        uid: uuidv4()
    },
    {
        Header: "Service Category",
        accessor: "service_category",
        disableFilters: true,
        id: "service_category",
        uid: uuidv4()
    },
    {
        Header: "Channel",
        accessor: "channel",
        disableFilters: true,
        id: "channel",
        uid: uuidv4()
    },
    {
        Header: "Created At",
        accessor: "created_at",
        disableFilters: true,
        id: "created_at",
        uid: uuidv4()
    }
];

export const CommonColumns = [
    {
        Header: "#ID",
        accessor: "o_new_cont",
        disableFilters: true,
        id: "o_new_cont",
        uid: uuidv4()
    },
    {
        Header: "Name",
        accessor: "o_customer_name",
        disableFilters: true,
        id: "o_customer_name",
        uid: uuidv4()
    },
    {
        Header: "Status",
        accessor: "o_staus",
        disableFilters: true,
        id: "o_staus",
        uid: uuidv4()
    },
    {
        Header: "Category",
        accessor: "o_category",
        disableFilters: true,
        id: "o_category",
        uid: uuidv4()
    },
    {
        Header: "Entity Type",
        accessor: "o_type",
        disableFilters: true,
        id: "o_type",
        uid: uuidv4()
    },
    {
        Header: "Service Category",
        accessor: "o_service_category",
        disableFilters: true,
        id: "o_service_category",
        uid: uuidv4()
    },
    {
        Header: "Service Type",
        accessor: "o_service_type",
        disableFilters: true,
        id: "o_service_type",
        uid: uuidv4()
    },
    {
        Header: "Channel",
        accessor: "o_channel",
        disableFilters: true,
        id: "o_channel",
        uid: uuidv4()
    },
    {
        Header: "Created At",
        accessor: "o_created_date",
        disableFilters: true,
        id: "created_at",
        uid: uuidv4()
    }
];
