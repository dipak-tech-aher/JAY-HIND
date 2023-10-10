import { Form } from 'react-bootstrap';

export const RequestColumns = [
    // {
    //     Header: "#",
    //     disableFilters: true,
    //     id: "selector"
    // },
    {
        Header: "ID",
        accessor: "requestNo",
        disableFilters: false,
        id: "requestNo"
    },
    {
        Header: "Subject",
        accessor: "requestDescription",
        disableFilters: false,
        id: "requestDescription",
    },
    {
        Header: "Category",
        accessor: "entityType",
        disableFilters: false,
        id: "entityType"
    },
    {
        Header: "Type",
        accessor: "requestType",
        disableFilters: false,
        id: "requestType"
    },
    {
        Header: "Priority",
        accessor: "requestPriority",
        disableFilters: false,
        id: "requestPriority"
    },
    {
        Header: "User Name",
        accessor: "userName",
        disableFilters: false,
        id: "userName",
    },
    {
        Header: "Role / Dept",
        accessor: "userRole",
        disableFilters: true,
        id: "userRoleDept",
    },
    {
        Header: "Date / Time",
        accessor: "dateTime",
        disableFilters: true,
        id: "dateTime",
    },
    {
        Header: "Status",
        accessor: "status",
        disableFilters: false,
        id: "status"
    },
    {
        Header: "Reason",
        accessor: "requestStatusReason",
        disableFilters: true,
        id: "requestStatusReason"
    },
    {
        Header: "Action",
        accessor: "",
        disableFilters: true,
        id: "action"
    }
];
