import { v4 as uuidv4 } from 'uuid';

export const AgentWiseColumns = [
    {
        Header: "Helpdesk No",
        accessor: "helpdeskNo",
        disableFilters: true,
        id: "helpdeskNo",
        uid: uuidv4()
    },
    {
        Header: "Agent Name",
        accessor: "assignedAgentDetails",
        disableFilters: true,
        id: "assignedAgentDetails",
        uid: uuidv4()
    },
    {
        Header: "Email",
        accessor: "mailId",
        disableFilters: true,
        id: "mailId",
        uid: uuidv4()
    },
    {
        Header: "Source",
        accessor: "helpdeskSourceDesc.description",
        disableFilters: true,
        id: "helpdeskSourceDesc",
        uid: uuidv4()
    },
    {
        Header: "Project",
        accessor: "projectDesc.description",
        disableFilters: true,
        id: "projectDesc",
        uid: uuidv4()
    },
    {
        Header: "Severity",
        accessor: "severityDesc.description",
        disableFilters: true,
        id: "severityDesc",
        uid: uuidv4()
    },
    {
        Header: "Current User",
        accessor: "assignedAgentDetails",
        disableFilters: true,
        id: "currUser",
        uid: uuidv4()
    },
    {
        Header: "Status",
        accessor: "statusDesc.description",
        disableFilters: true,
        id: "statusDesc",
        uid: uuidv4()
    },
    {
        Header: "Actioned Date",
        accessor: "statusChngDate",
        disableFilters: true,
        id: "createdAt",
        uid: uuidv4()
    },
    // {
    //     Header: "Content",
    //     accessor: "helpdeskContent",
    //     disableFilters: true,
    //     id: "helpdeskContent",
    //     uid: uuidv4()
    // }
];

export const ProjectWiseColumns = [
    {
        Header: "Helpdesk No",
        accessor: "helpdeskNo",
        disableFilters: true,
        id: "helpdeskNo",
        uid: uuidv4(),
        disableFilters: false
    },
    {
        Header: "Email",
        accessor: "mailId",
        disableFilters: true,
        id: "mailId",
        uid: uuidv4(),
        disableFilters: false
    },
    {
        Header: "Source",
        accessor: "helpdeskSourceDesc.description",
        disableFilters: true,
        id: "helpdeskSourceDesc",
        uid: uuidv4(),
        disableFilters: false
    },
    {
        Header: "Project",
        accessor: "projectDesc.description",
        disableFilters: true,
        id: "projectDesc",
        uid: uuidv4(),
        disableFilters: false
    },
    {
        Header: "Severity",
        accessor: "severityDesc.description",
        disableFilters: true,
        id: "severityDesc",
        uid: uuidv4(),
        disableFilters: false
    },
    {
        Header: "Current User",
        accessor: "assignedAgentDetails",
        disableFilters: true,
        id: "currUser",
        uid: uuidv4(),
        disableFilters: true
    },
    {
        Header: "Status",
        accessor: "statusDesc.description",
        disableFilters: true,
        id: "statusDesc",
        uid: uuidv4(),
        disableFilters: true
    },
    {
        Header: "Actioned Date",
        accessor: "statusChngDate",
        disableFilters: true,
        id: "createdAt",
        uid: uuidv4(),
        disableFilters: true
    }
];

export const StatusWiseColumns = [
    {
        Header: "Helpdesk No",
        accessor: "oHelpdeskNo",
        disableFilters: true,
        id: "oHelpdeskNo",
        uid: uuidv4()
    },
    {
        Header: "Email",
        accessor: "oMailId",
        disableFilters: true,
        id: "oMailId",
        uid: uuidv4()
    },
    {
        Header: "User Name",
        accessor: "oUserName",
        disableFilters: true,
        id: "oUserName",
        uid: uuidv4()
    },
    {
        Header: "Source",
        accessor: "oHelpdeskSource",
        disableFilters: true,
        id: "oHelpdeskSource",
        uid: uuidv4()
    },
    {
        Header: "Severity",
        accessor: "oPriority",
        disableFilters: true,
        id: "priority",
        uid: uuidv4()
    },
    {
        Header: "Project",
        accessor: "oProject",
        disableFilters: true,
        id: "projectDesc",
        uid: uuidv4()
    },
    {
        Header: "Helpdesk Subject",
        accessor: "oHelpdeskSubject",
        disableFilters: true,
        id: "oHelpdeskSubject",
        uid: uuidv4()
    },
    {
        Header: "Current User",
        accessor: "oCurrUser",
        disableFilters: true,
        id: "oCurrUser",
        uid: uuidv4()
    },
    // {
    //     Header: "Current Dept",
    //     accessor: "oCurrDept",
    //     disableFilters: true,
    //     id: "oCurrDept",
    //     uid: uuidv4()
    // },
    // {
    //     Header: "Current Role",
    //     accessor: "oCurrRole",
    //     disableFilters: true,
    //     id: "oCurrRole",
    //     uid: uuidv4()
    // },
    {
        Header: "Status",
        accessor: "oStatus",
        disableFilters: true,
        id: "oStatus",
        uid: uuidv4()
    },
    {
        Header: "Actioned Date",
        accessor: "oCreatedAt",
        disableFilters: true,
        id: "createdAt",
        uid: uuidv4()
    }
];

export const AgeingWiseColumns = [
    {
        Header: "Helpdesk No",
        accessor: "helpdeskNo",
        disableFilters: true,
        id: "helpdeskNo",
        uid: uuidv4()
    },
    {
        Header: "Email",
        accessor: "mailId",
        disableFilters: true,
        id: "mailId",
        uid: uuidv4()
    },
    {
        Header: "User Name",
        accessor: "userName",
        disableFilters: true,
        id: "userName",
        uid: uuidv4()
    },
    {
        Header: "Source",
        accessor: "helpdesksourcedesc",
        disableFilters: true,
        id: "helpdesksourcedesc",
        uid: uuidv4()
    },
    {
        Header: "Helpdesk Type",
        accessor: "helpdesktypedesc",
        disableFilters: true,
        id: "helpdesktypedesc",
        uid: uuidv4()
    },
    {
        Header: "Severity",
        accessor: "severitydesc",
        disableFilters: true,
        id: "severitydesc",
        uid: uuidv4()
    },
    {
        Header: "Project",
        accessor: "projectdesc",
        disableFilters: true,
        id: "projectDesc",
        uid: uuidv4()
    },
    // {
    //     Header: "User Category",
    //     accessor: "userCategoryDesc",
    //     disableFilters: true,
    //     id: "userCategoryDesc",
    //     uid: uuidv4()
    // },
    {
        Header: "Current User",
        accessor: "currentUser",
        disableFilters: true,
        id: "currUser",
        uid: uuidv4()
    },
    // {
    //     Header: "Current Dept",
    //     accessor: "currDept.unitDesc",
    //     disableFilters: true,
    //     id: "currDept",
    //     uid: uuidv4()
    // },
    // {
    //     Header: "Current Role",
    //     accessor: "currRole.roleName",
    //     disableFilters: true,
    //     id: "currRole",
    //     uid: uuidv4()
    // },
    {
        Header: "Status",
        accessor: "statusdesc",
        disableFilters: true,
        id: "statusdesc",
        uid: uuidv4()
    },
    {
        Header: "Actioned Date",
        accessor: "statusChngDate",
        disableFilters: true,
        id: "createdAt",
        uid: uuidv4()
    },
    {
        Header: "Ageing",
        accessor: "statusChngDate",
        disableFilters: true,
        id: "Ageing",
        uid: uuidv4()
    },
    // {
    //     Header: "Content",
    //     accessor: "helpdeskContent",
    //     disableFilters: true,
    //     id: "helpdeskContent",
    //     uid: uuidv4()
    // }
];