export const ComplaintListColumns = [
    {
        Header : "Interaction ID",
        accessor : "intxnId",
        disableFilters : true
    },
    {
        Header : "Account Number",
        accessor : "accountDetails.accountNo",
        disableFilters : true
    },
    {
        Header : "Access Number",
        accessor : "Connection.identificationNo",
        disableFilters : true
    },
    {
        Header : "Problem Cause",
        accessor : "cmpProblemDesp.description",
        disableFilters : true
    },
    {
        Header : "Created Date",
        accessor : "createdAt",
        disableFilters : true
    },
    {
        Header : "Created By",
        accessor : "userId.userId",
        disableFilters : true
    },
    {
        Header : "Status",
        accessor : "currStatus",
        disableFilters : true
    },
    {
        Header : "Current Status",
        accessor : "currStatusDesc.description",
        disableFilters : true
    },
    {
        Header : "Action",
        accessor : "action",
        disableFilters : true
    },
];

export const ComplaintHiddenColumns = [
    'currStatus'
]
