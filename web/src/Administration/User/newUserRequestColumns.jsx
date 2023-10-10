export const NewUserRequestCols = [
    {
        Header: "Action",
        accessor: "action",
        disableFilters: true
    },
    {
        Header: "Id",
        accessor: "userId",
        disableFilters: false
    },
    {
        Header: "First Name",
        accessor: "firstName",
        disableFilters: false
    },
    {
        Header: "Last Name",
        accessor: "lastName",
        disableFilters: false
    },
    {
        Header: "Gender",
        accessor: "gender",
        disableFilters: true
    },
    {
        Header: "Country",
        accessor: "country",
        disableFilters: true
    },
    {
        Header: "Contact Number",
        accessor: "contactNo",
        disableFilters: false
    },
    {
        Header: "Email",
        accessor: "email",
        disableFilters: false
    },
    {
        Header: "Type",
        accessor: "userType",
        disableFilters: true
    },
    {
        Header: "Location",
        accessor: "locationDesc.description",
        disableFilters: true
    },
    // {
    //     Header: "Status",
    //     accessor: "status.description",
    //     disableFilters: true
    // }   
];

export const RoleTableHiddenColumns = [
];