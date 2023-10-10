export const AssetListColumns = [
    {
        Header: "Asset Id",
        accessor: "assetId",
        disableFilters: false
    },
    {
        Header: "Asset Name",
        accessor: "assetName",
        disableFilters: false
    },
    {
        Header: "Service Type",
        accessor: "serviceTypeDes",
        disableFilters: false
    },
    {
        Header: "Charge Name",
        accessor: "chargeName",
        disableFilters: false
    },
    {
        Header: "Charge Amount",
        accessor: "chargeAmount",
        disableFilters: false
    },
    {
        Header: "Start Date",
        accessor: "startDate",
        disableFilters: true
    },
    {
        Header: "End Date",
        accessor: "endDate",
        disableFilters: true
    },
    {
        Header: "Updated By",
        accessor: "updatedUser",
        disableFilters: false
    },
    {
        Header: "Updated At",
        accessor: "updatedAt",
        disableFilters: true
    },
    {
        Header: "Created By",
        accessor: "createdUser",
        disableFilters: false
    },
    {
        Header: "Created At",
        accessor: "createdAt",
        disableFilters: true
    },
    {
        Header: "Status",
        accessor: "statusDes",
        disableFilters: false,
        id: "assetStatus"
    },
    {
        Header: "Volume Allowed",
        accessor: "volumeAllowed",
        disableFilters: false
    },
    {
        Header: "Multiple Selection",
        accessor: "multipleSelection",
        disableFilters: false
    },
    {
        Header: "Action",
        accessor: "action",
        disableFilters: true
    }
];