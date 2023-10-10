import { v4 as uuidv4 } from 'uuid';

export const InteractionHistoryColumns = [
    {
        Header: "#ID",
        accessor: "oIntxnId",
        disableFilters: true,
        id: "oIntxnId",
        uid: uuidv4()
    },
    {
        Header: "Interaction No",
        accessor: "oIntxnNo",
        disableFilters: true,
        id: "oIntxnNo",
        uid: uuidv4()
    },
    {
        Header: "Name",
        accessor: "oUserDesc",
        disableFilters: true,
        id: "oUserDesc",
        uid: uuidv4()
    },
    {
        Header: "Category",
        accessor: "oIntxnCategory",
        disableFilters: true,
        id: "oIntxnCategory",
        uid: uuidv4()
    },
    {
        Header: "Type",
        accessor: "oIntxnType",
        disableFilters: true,
        id: "oIntxnType",
        uid: uuidv4()
    },
    {
        Header: "Service Type",
        accessor: "oServiceType",
        disableFilters: true,
        id: "oServiceType",
        uid: uuidv4()
    },
    {
        Header: "Service Category",
        accessor: "oServiceCategory",
        disableFilters: true,
        id: "oServiceCategory",
        uid: uuidv4()
    },
    {
        Header: "Current User",
        accessor: "oCurrUser",
        disableFilters: true,
        id: "oCurrUser",
        uid: uuidv4()
    },
    {
        Header: "Status",
        accessor: "oIntxnStatus",
        disableFilters: true,
        id: "oIntxnStatus",
        uid: uuidv4()
    },
    {
        Header: "Current Dept",
        accessor: "oCurrEntity",
        disableFilters: true,
        id: "oCurrEntity",
        uid: uuidv4()
    },
    {
        Header: "Current Role",
        accessor: "oCurrRole",
        disableFilters: true,
        id: "oCurrRole",
        uid: uuidv4()
    },
    {
        Header: "Generated At",
        accessor: "oCreatedAt",
        disableFilters: true,
        id: "oCreatedAt",
        uid: uuidv4()
    }
];
export const AssignedOperationsColumns = [
    {
        Header: "Action",
        accessor: "oNo",
        disableFilters: true,
        id: "oNo-Action",
        uid: uuidv4()
    },
    {
        Header: "#ID",
        accessor: "oNo",
        disableFilters: true,
        id: "oNo-ID",
        uid: uuidv4()
    },
    {
        Header: "Name",
        accessor: "oCustomerName",
        disableFilters: true,
        id: "oCustomerName",
        uid: uuidv4()
    },
    {
        Header: "Status",
        accessor: "oIntxnStatusDesc",
        disableFilters: true,
        id: "oIntxnStatusDesc",
        uid: uuidv4()
    },
    {
        Header: "Priority",
        accessor: "oIntxnSeverityDesc",
        disableFilters: true,
        id: "oIntxnSeverityDesc",
        uid: uuidv4()
    },
    {
        Header: "Type",
        accessor: "oIntxnTypeDesc",
        disableFilters: true,
        id: "oIntxnTypeDesc",
        uid: uuidv4()
    },
    {
        Header: "Category",
        accessor: "oIntxnCategoryDesc",
        disableFilters: true,
        id: "oIntxnCategoryDesc",
        uid: uuidv4()
    },
    {
        Header: "Service Type",
        accessor: "oServiceTypeDesc",
        disableFilters: true,
        id: "oServiceTypeDesc",
        uid: uuidv4()
    },
    {
        Header: "Service Category",
        accessor: "oServiceCategoryDesc",
        disableFilters: true,
        id: "oServiceCategoryDesc",
        uid: uuidv4()
    },
    {
        Header: "Generated At",
        accessor: "oCreatedAt",
        disableFilters: true,
        id: "oCreatedAt",
        uid: uuidv4()
    }
];

export const PooledInteractionsColumns = [
    {
        Header: "Action",
        accessor: "oIntxnNo",
        disableFilters: true,
        id: "oIntxnNo-Action",
        uid: uuidv4()
    },
    {
        Header: "#ID",
        accessor: "oIntxnNo",
        disableFilters: true,
        id: "oIntxnNo-ID",
        uid: uuidv4()
    },
    {
        Header: "Name",
        accessor: "oCustomerName",
        disableFilters: true,
        id: "oCustomerName",
        uid: uuidv4()
    },
    {
        Header: "Status",
        accessor: "oIntxnStatusDesc",
        disableFilters: true,
        id: "oIntxnStatusDesc",
        uid: uuidv4()
    },
    {
        Header: "Type",
        accessor: "oIntxnTypeDesc",
        disableFilters: true,
        id: "oIntxnTypeDesc",
        uid: uuidv4()
    },
    {
        Header: "Category",
        accessor: "oIntxnCategoryDesc",
        disableFilters: true,
        id: "oIntxnCategoryDesc",
        uid: uuidv4()
    },
    {
        Header: "Service Type",
        accessor: "oServiceTypeDesc",
        disableFilters: true,
        id: "oServiceTypeDesc",
        uid: uuidv4()
    },
    {
        Header: "Service Category",
        accessor: "oServiceCategoryDesc",
        disableFilters: true,
        id: "oServiceCategoryDesc",
        uid: uuidv4()
    },
    {
        Header: "Assigned to",
        accessor: "oCurrUserDesc",
        disableFilters: true,
        id: "oCurrUserDesc",
        uid: uuidv4()
    },
    {
        Header: "Generated At",
        accessor: "oCreatedAt",
        disableFilters: true,
        id: "oCreatedAt",
        uid: uuidv4()
    }
];
export const AssignedInteractionsColumns = [
    {
        Header: "Action",
        accessor: "oIntxnNo",
        disableFilters: true,
        id: "oIntxnNo-Action",
        uid: uuidv4()
    },
    {
        Header: "#ID",
        accessor: "oIntxnNo",
        disableFilters: true,
        id: "oIntxnNo-ID",
        uid: uuidv4()
    },
    {
        Header: "Name",
        accessor: "oCustomerName",
        disableFilters: true,
        id: "oCustomerName",
        uid: uuidv4()
    },
    {
        Header: "Status",
        accessor: "oIntxnStatusDesc",
        disableFilters: true,
        id: "oIntxnStatusDesc",
        uid: uuidv4()
    },
    {
        Header: "Type",
        accessor: "oIntxnTypeDesc",
        disableFilters: true,
        id: "oIntxnTypeDesc",
        uid: uuidv4()
    },
    {
        Header: "Category",
        accessor: "oIntxnCategoryDesc",
        disableFilters: true,
        id: "oIntxnCategoryDesc",
        uid: uuidv4()
    },
    {
        Header: "Service Type",
        accessor: "oServiceTypeDesc",
        disableFilters: true,
        id: "oServiceTypeDesc",
        uid: uuidv4()
    },
    {
        Header: "Service Category",
        accessor: "oServiceCategoryDesc",
        disableFilters: true,
        id: "oServiceCategoryDesc",
        uid: uuidv4()
    },
    {
        Header: "Assigned to",
        accessor: "oCurrUserDesc",
        disableFilters: true,
        id: "oCurrUserDesc",
        uid: uuidv4()
    },
    {
        Header: "Generated At",
        accessor: "oCreatedAt",
        disableFilters: true,
        id: "oCreatedAt",
        uid: uuidv4()
    }
];

export const PooledOrdersColumns = [
    {
        Header: "Action",
        accessor: "oOrderNo",
        disableFilters: true,
        id: "oOrderNo-Action",
        uid: uuidv4()
    },
    {
        Header: "#ID",
        accessor: "oOrderNo",
        disableFilters: true,
        id: "oOrderNo-ID",
        uid: uuidv4()
    },
    {
        Header: "Name",
        accessor: "oCustomerName",
        disableFilters: true,
        id: "oCustomerName",
        uid: uuidv4()
    },
    {
        Header: "Status",
        accessor: "oOrderStatusDesc",
        disableFilters: true,
        id: "oOrderStatusDesc",
        uid: uuidv4()
    },
    {
        Header: "Order Category",
        accessor: "oOrderCategoryDesc",
        disableFilters: true,
        id: "oOrderCategoryDesc",
        uid: uuidv4()
    },
    {
        Header: "Order Type",
        accessor: "oOrderTypeDesc",
        disableFilters: true,
        id: "oOrderTypeDesc",
        uid: uuidv4()
    },
    {
        Header: "Service Category",
        accessor: "oServiceCategoryDesc",
        disableFilters: true,
        id: "oServiceCategoryDesc",
        uid: uuidv4()
    },
    {
        Header: "Service Type",
        accessor: "oServiceTypeDesc",
        disableFilters: true,
        id: "oServiceTypeDesc",
        uid: uuidv4()
    },
    {
        Header: "Assigned to",
        accessor: "oCurrUserDesc",
        disableFilters: true,
        id: "oCurrUserDesc",
        uid: uuidv4()
    },
    {
        Header: "Generated At",
        accessor: "oCreatedAt",
        disableFilters: true,
        id: "oCreatedAt",
        uid: uuidv4()
    }
];

export const AssignedOrdersColumns = [
    {
        Header: "Action",
        accessor: "oOrderNo",
        disableFilters: true,
        id: "oOrderNo-Action",
        uid: uuidv4()
    },
    {
        Header: "#ID",
        accessor: "oOrderNo",
        disableFilters: true,
        id: "oOrderNo-ID",
        uid: uuidv4()
    },
    {
        Header: "#Child ID",
        accessor: "oChildOrderNo",
        disableFilters: true,
        id: "oChildOrderNo-ID",
        uid: uuidv4()
    },
    {
        Header: "Name",
        accessor: "oCustomerName",
        disableFilters: true,
        id: "oCustomerName",
        uid: uuidv4()
    },
    {
        Header: "Status",
        accessor: "oOrderStatusDesc",
        disableFilters: true,
        id: "oOrderStatusDesc",
        uid: uuidv4()
    },
    {
        Header: "Order Category",
        accessor: "oOrderCategoryDesc",
        disableFilters: true,
        id: "oOrderCategoryDesc",
        uid: uuidv4()
    },
    {
        Header: "Order Type",
        accessor: "oOrderTypeDesc",
        disableFilters: true,
        id: "oOrderTypeDesc",
        uid: uuidv4()
    },
    {
        Header: "Service Category",
        accessor: "oServiceCategoryDesc",
        disableFilters: true,
        id: "oServiceCategoryDesc",
        uid: uuidv4()
    },
    {
        Header: "Service Type",
        accessor: "oServiceTypeDesc",
        disableFilters: true,
        id: "oServiceTypeDesc",
        uid: uuidv4()
    },
    {
        Header: "Assigned to",
        accessor: "oCurrUserDesc",
        disableFilters: true,
        id: "oCurrUserDesc",
        uid: uuidv4()
    },
    {
        Header: "Generated At",
        accessor: "oCreatedAt",
        disableFilters: true,
        id: "oCreatedAt",
        uid: uuidv4()
    }
];

// export const UpcomingAppointmentColumns = [
//     {
//         Header: "#ID",
//         accessor: "oAppointId",
//         disableFilters: true,
//         id: "oAppointId-ID",
//     },
//     {
//         Header: "Name",
//         accessor: "oAppointName",
//         disableFilters: true,
//         id: "oAppointName",
//     },
//     {
//         Header: "Type",
//         accessor: "oAppointType",
//         disableFilters: true,
//         id: "oAppointType",
//     },
//     {
//         Header: "Meeting Point",
//         accessor: "oAppointModeValue",
//         disableFilters: true,
//         id: "oAppointModeValue",
//     },
//     {
//         Header: "Date",
//         accessor: "oAppointDate",
//         disableFilters: true,
//         id: "oAppointDate",
//     },
//     {
//         Header: "Time",
//         accessor: "oAppointStartTime",
//         disableFilters: true,
//         id: "oAppointStartTime",
//     },
//     {
//         Header: "Duration",
//         accessor: "oAppointIntervalDesc",
//         disableFilters: true,
//         id: "oAppointIntervalDesc",
//     },
//     {
//         Header: "Generated At",
//         accessor: "oCreatedAt",
//         disableFilters: true,
//         id: "oCreatedAt",
//     }
// ];

export const UpcomingAppointmentColumns = [
    {
        Header: "#ID",
        accessor: "appointTxnId",
        disableFilters: true,
        id: "appointTxnId-ID",
        uid: uuidv4()
    },
    {
        Header: "Name",
        accessor: "tranCategoryType",
        disableFilters: true,
        id: "tranCategoryType",
        uid: uuidv4()
    },
    {
        Header: "Type",
        accessor: "appointMode",
        disableFilters: true,
        id: "appointMode",
        uid: uuidv4()
    },
    {
        Header: "Meeting Point",
        accessor: "appointModeValue",
        disableFilters: true,
        id: "appointModeValue",
        uid: uuidv4()
    },
    {
        Header: "Date",
        accessor: "appointDate",
        disableFilters: true,
        id: "appointDate",
        uid: uuidv4()
    },
    {
        Header: "Time",
        accessor: "appointStartTime",
        disableFilters: true,
        id: "appointStartTime",
        uid: uuidv4()
    },
    {
        Header: "Duration",
        accessor: "appointStartTime",
        disableFilters: true,
        id: "duration",
        uid: uuidv4()
    },
    {
        Header: "Assigned to",
        accessor: row => `${row.appointAgentDesc?.firstName} ${row.appointAgentDesc?.lastName??row.appointAgentDesc?.lastName}`,
        disableFilters: true,
        id: "oCurrUserDesc",
        uid: uuidv4()
    },
    {
        Header: "Generated At",
        accessor: "createdAt",
        disableFilters: true,
        id: "createdAt",
        uid: uuidv4()
    }
];