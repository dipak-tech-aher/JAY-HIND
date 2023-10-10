export const AppointmentColumns = [
    {
        Header: "Customer Name",
        accessor: "first_name",
        disableFilters: true,
        id: "CustomerName",
    },
    {
        Header: "Date",
        accessor: "appoint_date",
        disableFilters: true,
        id: "appointmentDate",
    },
    {
        Header: "Time",
        accessor: "appoint_end_time",
        disableFilters: true,
        id: "appointStartTime",
    },
    {
        Header: "Appointment Type",
        accessor: "appoint_mode_description",
        disableFilters: true,
        id: "appoinmentModeDesc",
    },
    {
        Header: "Status",
        accessor: "status_description",
        disableFilters: true,
        id: "appointModeValue",
    },
    {
        Header: "Entity Type",
        accessor: "tran_category_type_description",
        disableFilters: true,
        id: "tranCategoryTypeDesc",
    },
    {
        Header: "Category",
        accessor: "category_details",
        disableFilters: true,
        id: "category_details",
    },
    {
        Header: "Type",
        accessor: "type_details",
        disableFilters: true,
        id: "type_details",
    },
    {
        Header: "Entity No",
        accessor: "tran_category_no",
        disableFilters: true,
        id: "tranCategoryNo",
    },
    
];

export const ClosedHistoryColumns = [
    {
        Header: "Customer Name",
        accessor: "first_name",
        disableFilters: true,
        id: "CustomerName",
    },
    {
        Header: "Appointment Status",
        accessor: "status_description",
        disableFilters: true,
        id: "appointmentStatus",
    },
    {
        Header: "Appointment Date",
        accessor: "appoint_date",
        disableFilters: true,
        id: "appointmentDate",
    },
    {
        Header: "Time",
        accessor: "appoint_start_time",
        disableFilters: true,
        id: "appointStartTime",
    },
    {
        Header: "Appointment Duration",
        accessor: "appoint_end_time",
        disableFilters: true,
        id: "appoinmentDuration",
    },
    {
        Header: "Entity Type",
        accessor: "tran_category_type_description",
        disableFilters: true,
        id: "tranCategoryTypeDesc",
    },
    {
        Header: "Category",
        accessor: "category_details",
        disableFilters: true,
        id: "category_details",
    },
    {
        Header: "Type",
        accessor: "type_details",
        disableFilters: true,
        id: "type_details",
    },
    {
        Header: "Entity No",
        accessor: "tran_category_no",
        disableFilters: true,
        id: "tranCategoryNo",
    },
    {
        Header: "Completed On",
        accessor: "updated_at",
        disableFilters: true,
        id: "updatedAt",
    }
];