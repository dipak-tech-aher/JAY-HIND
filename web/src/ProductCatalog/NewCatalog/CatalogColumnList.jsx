export const CatalogListColumns = [
    {
        Header: "Catalog Id",
        accessor: "catalogId",
        disableFilters: false
    },
    {
        Header: "Catalog Name",
        accessor: "catalogName",
        disableFilters: false
    },
    // {
    //     Header: "Product Category Id",
    //     accessor: "productCategoryId",
    //     disableFilters: true
    // },
    {
        Header: "Product Category",
        accessor: "serviceTypeDesc.description",
        disableFilters: false,
        id: 'productCategory'
    },
    {
        Header: "Plan",
        accessor: "plan",
        disableFilters: false
    },
    {
        Header: "Service Items",
        accessor: "serviceItems",
        disableFilters: false
    },
    {
        Header: "Asset Items",
        accessor: "assetItems",
        disableFilters: false
    },
    {
        Header: "Addon Items",
        accessor: "addonItems",
        disableFilters: false
    },
    {
        Header: "Status",
        accessor: "statusDesc.description",
        disableFilters: false,
        id: 'catalogStatus'
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
];