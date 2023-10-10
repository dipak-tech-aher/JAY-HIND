const { v4: uuidv4 } = require('uuid')

export const InteractionByChannelsColumns = [
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

export const AssignedOrdersColumns = [
    {
        Header: "#ID",
        accessor: "order_no",
        disableFilters: true,
        id: "oOrderNo-ID",
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
        accessor: "order_status",
        disableFilters: true,
        id: "order_status",
        uid: uuidv4()
    },
    {
        Header: "Order Category",
        accessor: "order_category",
        disableFilters: true,
        id: "order_category",
        uid: uuidv4()
    },
    {
        Header: "Order Type",
        accessor: "order_type",
        disableFilters: true,
        id: "order_type",
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
        accessor: "entity_no",
        disableFilters: true,
        id: "oOrderNo-ID",
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
        accessor: "entity_status",
        disableFilters: true,
        id: "order_status",
        uid: uuidv4()
    },
    {
        Header: "Category",
        accessor: "entity_category",
        disableFilters: true,
        id: "order_category",
        uid: uuidv4()
    },
    {
        Header: "Entity Type",
        accessor: "entity_type",
        disableFilters: true,
        id: "order_type",
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

export const AppointmentColumns = [
    {
        Header: "Customer Name",
        accessor: "customer_name",
        disableFilters: true,
        id: "CustomerName",
    },
    {
        Header: "Appointment Date",
        accessor: "appoint_date",
        disableFilters: true,
        id: "appointmentDate",
    },
    {
        Header: "Time",
        accessor: "appoint_time",
        disableFilters: true,
        id: "appointStartTime",
    },
    {
        Header: "Appointment Type",
        accessor: "appoint_mode",
        disableFilters: true,
        id: "appoinmentModeDesc",
    },
    {
        Header: "Category",
        accessor: "intxn_category",
        disableFilters: true,
        id: "intxn_category",
    },
    {
        Header: "Type",
        accessor: "intxn_type",
        disableFilters: true,
        id: "intxn_type",
    },
    {
        Header: "Status",
        accessor: "status",
        disableFilters: true,
        id: "status",
    },
    {
        Header: "Entity Type",
        accessor: "tran_category_type",
        disableFilters: true,
        id: "tranTypeDesc",
    },
    {
        Header: "Entity No",
        accessor: "tran_category_no",
        disableFilters: true,
        id: "tran_category_no",
    },

];

export const ProspectCustomerByChannelColumns = [
    {
        Header: "Customer Name",
        accessor: "customer_name",
        disableFilters: true,
        id: "CustomerName",
    },
    {
        Header: "Customer No",
        accessor: "customer_no",
        disableFilters: true,
        id: "customer_no",
    },
    {
        Header: "Category",
        accessor: "customer_category",
        disableFilters: true,
        id: "customer_category",
    },
    {
        Header: "Created Date",
        accessor: "created_at",
        disableFilters: true,
        id: "created_at",
    },
    {
        Header: "Status",
        accessor: "status",
        disableFilters: true,
        id: "status",
    },
    {
        Header: "Channel",
        accessor: "channel",
        disableFilters: true,
        id: "channel",
    }
];

export const LiveSupportColumns = [
    {
        Header: "Customer Name",
        accessor: "customer_name",
        disableFilters: true,
        id: "CustomerName",
    },
    {
        Header: "Contact No",
        accessor: "contact_no",
        disableFilters: true,
        id: "contact_no",
    },
    {
        Header: "Email",
        accessor: "email_id",
        disableFilters: true,
        id: "email_id",
    },
    {
        Header: "Created Date",
        accessor: "created_at",
        disableFilters: true,
        id: "created_at",
    },
    {
        Header: "Status",
        accessor: "status_desc",
        disableFilters: true,
        id: "status",
    },
    {
        Header: "Channel",
        accessor: "channel_desc",
        disableFilters: true,
        id: "channel",
    }
];