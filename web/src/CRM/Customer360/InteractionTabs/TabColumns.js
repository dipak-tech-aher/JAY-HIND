
export const InteractionListColumns = [
    {
        Header: "Interaction No",
        accessor: "intxnNo",
        disableFilters: true,
      },
      {
        Header: "Interaction Category",
        accessor: "intxnCategory.description",
        disableFilters: true,
      },
      {
        Header: "Interaction Type",
        accessor: "intxnType.description",
        disableFilters: true,
      },
      {
        Header: "Service Category",
        accessor: "serviceCategory.description",
        disableFilters: true,
      },
      {
        Header: "Service Type",
        accessor: "serviceType.description",
        disableFilters: true,
      },
      {
        Header: "Status",
        accessor: "intxnStatus.description",
        disableFilters: true,
      },
];

export const HelpdeskListColumns = [
    {
        Header: "Helpdesk ID",
        accessor: "helpdeskId",
        disableFilters: true
    },
    {
        Header: "Helpdesk Number",
        accessor: "helpdeskNo",
        disableFilters: true
    },
    {
        Header: "Email",
        accessor: "mailId",
        disableFilters: true
    },
    {
        Header: "Phone Number",
        accessor: "phoneNo",
        disableFilters: true
    },
    {
        Header: "Source",
        accessor: "helpdeskSource.description",
        disableFilters: true
    },
    {
        Header: "Created Date",
        accessor: "createdAt",
        disableFilters: true
    },
    // {
    //     Header: "Created By",
    //     accessor: "createdBy",
    //     disableFilters: true
    // },
    {
        Header: "Status",
        accessor: "status.description",
        disableFilters: true
    },
    // {
    //     Header: "Action",
    //     accessor: "action",
    //     disableFilters: true
    // },
];

export const WorkOrdersListColumns = [
    {
        Header: "Order No",
        accessor: "orderNo",
        disableFilters: true
    },
    {
        Header: "Customer Number",
        accessor: "customerDetails.customerNo",
        disableFilters: true
    },
    {
        Header: "Order Channel",
        accessor: "orderChannel.description",
        disableFilters: true
    },
    {
        Header: "Priority",
        accessor: "orderPriority.description",
        disableFilters: true
    },
    {
        Header: "Source",
        accessor: "orderSource.description",
        disableFilters: true
    },
    {
        Header: "Order Type",
        accessor: "orderType.description",
        disableFilters: true
    },
    {
        Header: "Order Category",
        accessor: "orderCategory.description",
        disableFilters: true
    },
    {
        Header: "Delivery Location",
        accessor: "deliveryLocation",
        disableFilters: true
    },
    {
        Header: "Created Date",
        accessor: "orderDate",
        disableFilters: true
    },
    {
        Header: "Created By",
        accessor: "createdBy",
        disableFilters: true
    },
    {
        Header: "Status",
        accessor: "orderStatus.description",
        disableFilters: true
    }
];

export const PaymentListColumns = [
    {
        Header: "Contract Id",
        accessor: "contractId",
        disableFilters: false,
        id: "contractId"
    },
    {
        Header: "Status",
        accessor: "status",
        disableFilters: false,
        id: "cstatus"
    }, 
    {
        Header: "RC",
        accessor: "rcAmount",
        disableFilters: true
    },
    {
        Header: "OTC",
        accessor: "otcAmount",
        disableFilters: true
    },
    {
        Header: "Usage",
        accessor: "usageAmount",
        disableFilters: true
    },
    {
        Header: "Total Charge",
        accessor: "totalCharge",
        disableFilters: true
    },   
    {
        Header: "Next Payment",
        accessor: "nextBillPeriod",
        disableFilters: true
    },
    {
        Header: "Advance Payment Allocation",
        accessor: "isAdvanceAllowed",
        disableFilters: true
    }
]

export const HiddenColumns = [
    // 'currStatus'
]
