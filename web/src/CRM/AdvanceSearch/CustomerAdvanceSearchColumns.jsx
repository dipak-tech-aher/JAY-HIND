export const CustomerAdvanceSearchColumns = [
    
    {
        Header: "Customer Number",
        accessor: "customerNo",
        disableFilters: false,
        id: 'customerNo'
    },
    {
        Header: "Customer Number",
        accessor: "customerUuid",
        disableFilters: false,
        id: 'customerUuid'
    },
    {
        Header: "First Name",
        accessor: "firstName",
        disableFilters: false,
        id: 'firstName'
    },
    {
        Header: "Last Name",
        accessor: "lastName",
        disableFilters: false,
        id: 'lastName'
    },
    {
        Header: "Customer Type",
        id: "customerCatDesc",
        accessor: data => {
            return data.customerCatDesc?.description
        },
        disableFilters: true,
    },
    {
        Header: "Primary Contact Number",
        accessor: data => {
            let primaryContact = data.customerContact?.find(x => x.isPrimary);
            return primaryContact ? `+${primaryContact.mobilePrefix} ${primaryContact.mobileNo}` : ''
        },
        disableFilters: false,
        id: 'contactDetails'
    },
    {
        Header: "ID Number",
        accessor: "idValue",
        disableFilters: false,
        id: 'idNo'
    },
    {
        Header: "Customer Status",
        id: 'statusDesc',
        accessor: data => {
            return data.statusDesc?.description
        },
        disableFilters: false
    },
    {
        Header: "Action",
        accessor: "action",
        disableFilters: true
    }
]

export const SalesOrderSearchColumns = [
    {
        Header: "Service ID",
        accessor: "soNumber",
        disableFilters: false,
        id: 'soNumber'
    },
    {
        Header: "Customer Number",
        accessor: "customerNo",
        disableFilters: false,
        id: 'customerNo'
    },
    {
        Header: "Customer Name",
        accessor: "customerName",
        disableFilters: false,
        id: 'customerName'
    },
    {
        Header: "Customer Type",
        accessor: "customerTypeDesc",
        disableFilters: true,
    },
    {
        Header: "Primary Contact Number",
        accessor: "contactNo",
        disableFilters: false,
        id: 'contactNo'
    },
    {
        Header: "Customer Status",
        accessor: "customerStatus",
        disableFilters: false
    }
]

// accessor names
export const CustomerAdvanceSearchHiddenColumns = [
    'customerUuid'    
]




export const SearchCustomerColumns = [
    {
        Header: "Customer ID",
        accessor: "crmCustomerNo",
        disableFilters: false,
        id: 'customerNumber'
    },
    {
        Header: "Account Id",
        accessor: "accountId",
        disableFilters: false,
        id:"accountId"
    },
    {
        Header: "Customer Name",
        accessor: "customerName",
        disableFilters: false,
        id: 'customerName'
    },
    {
        Header: "Customer Type",
        accessor: "customerTypeDesc.description",
        disableFilters: false,
        id: 'customerType'
    },
    {
        Header: "Primary Contact Number",
        accessor: "contact.contactNo",
        disableFilters: false,
        id: 'contactNo'
    },
    {
        Header: "Customer Email",
        accessor: "contact.email",
        disableFilters: false,
        id: "email"
    },
    {
        Header: "Customer Status",
        accessor: "statusDesc.description",
        disableFilters: false,
        id: "customerStatus",
    },
    {
        Header: "Created By",
        accessor: "createdBy",
        disableFilters: true,
    },
    {
        Header: "Created At",
        accessor: "createdAt",
        disableFilters: true,
    },
    {
        Header: "Updated By",
        accessor: "updatedBy",
        disableFilters: true,
    },
    {
        Header: "Updated At",
        accessor: "updatedAt",
        disableFilters: true,
    }
]

export const CustomerSearchHiddenColumns = [
   "accountId"
]


export const OrderAdvanceSearchColumns = [
    {
        Header: "Order Number",
        accessor: "orderNo",
        disableFilters: true
    },
    {
        Header: "Customer Number",
        accessor: "customerDetails.customerNo",
        disableFilters: true
    },
    {
        Header: "Customer Name",
        accessor: "firstName",
        disableFilters: true
    }
]

export const InteractionAdvanceSearchColumns = [
    {
        Header: "Interaction Number",
        accessor: "intxnNo",
        disableFilters: true
    },
    {
        Header: "Customer Email",
        accessor: "customerDetails.customerContact[0].emailId",
        disableFilters: true
    },
    {
        Header: "Customer Contact",
        accessor: "customerDetails.customerContact[0].mobileNo",
        disableFilters: true
    },
    {
        Header: "Customer Name",
        accessor: "firstName",
        disableFilters: true
    }
]