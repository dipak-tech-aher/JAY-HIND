export const CustomerTemplateColumns = [
    {
        Header: "Customer Reference No",
        accessor: "customerRefNo",
        disableFilters: true,
    },
    {
        Header: "First Name",
        accessor: "firstName",
        disableFilters: true,
    },
    {
        Header: "Last Name",
        accessor: "lastName",
        disableFilters: true,
    },
    {
        Header: "Title",
        accessor: "title",
        disableFilters: true,
    },
    {
        Header: "Status",
        accessor: "Status",
        disableFilters: true,
    },
    {
        Header: "Customer Category",
        accessor: "customerCategory",
        disableFilters: true,
    },
    {
        Header: "Customer Class",
        accessor: "customerClass",
        disableFilters: true,
    },
    {
        Header: "Martial Status",
        accessor: "customerMaritalStatus",
        disableFilters: true,
    },
    {
        Header: "Occupation",
        accessor: "occupation",
        disableFilters: true,
    },
    {
        Header: "Gender",
        accessor: "gender",
        disableFilters: true,
    },
    {
        Header: "Email ID",
        accessor: "emailId",
        disableFilters: true,
    },
    {
        Header: "Mobile Prefix",
        accessor: "mobilePrefix",
        disableFilters: true,
    },
    {
        Header: "Mobile No",
        accessor: "mobileNo",
        disableFilters: true,
    },
    {
        Header: "DOB",
        accessor: "birthDate",
        disableFilters: true,
    },
    {
        Header: "ID Type",
        accessor: "idType",
        disableFilters: true,
    },
    {
        Header: "ID Value",
        accessor: "idValue",
        disableFilters: true,
    },
    {
        Header: "Nationality",
        accessor: "nationality",
        disableFilters: true,
    },
    {
        Header: "Contact Preferences",
        accessor: "contactPreference",
        disableFilters: true,
    },
    {
        Header: "Department",
        accessor: "department",
        disableFilters: true,
    },
    {
        Header: "Projects",
        accessor: "projects",
        disableFilters: true,
    },
    {
        Header: "Registeration No",
        accessor: "registeredNo",
        disableFilters: true,
    },
    {
        Header: "Registeration Date",
        accessor: "registeredDate",
        disableFilters: true,
    },
    {
        Header: "Address Type",
        accessor: "addressType",
        disableFilters: true,
    },
    {
        Header: "Address 1",
        accessor: "address1",
        disableFilters: true,
    },
    {
        Header: "Address 2",
        accessor: "address2",
        disableFilters: true,
    },
    {
        Header: "Address 3",
        accessor: "address3",
        disableFilters: true,
    },
    {
        Header: "City",
        accessor: "city",
        disableFilters: true,
    },
    {
        Header: "District",
        accessor: "district",
        disableFilters: true,
    },
    {
        Header: "State",
        accessor: "state",
        disableFilters: true,
    },
    {
        Header: "Country",
        accessor: "country",
        disableFilters: true,
    },
    {
        Header: "Post code",
        accessor: "postcode",
        disableFilters: true,
    },
    {
        Header: "Latitude",
        accessor: "latitude",
        disableFilters: true,
    },
    {
        Header: "Longitude",
        accessor: "longitude",
        disableFilters: true,
    },
    {
        Header: "Telephone No Prefix",
        accessor: "telephonePrefix",
        disableFilters: true,
    },
    {
        Header: "Telephone No",
        accessor: "telephoneNo",
        disableFilters: true,
    },
    {
        Header: "WhatsApp No Prefix",
        accessor: "whatsappNoPrefix",
        disableFilters: true,
    },
    {
        Header: "WhatsApp Number",
        accessor: "whatsappNo",
        disableFilters: true,
    },
    {
        Header: "FAX",
        accessor: "fax",
        disableFilters: true,
    },
    {
        Header: "Facebook Id",
        accessor: "facebookId",
        disableFilters: true,
    },
    {
        Header: "Instagram Id",
        accessor: "instagramId",
        disableFilters: true,
    },
    {
        Header: "Telegram Id",
        accessor: "telegramId",
        disableFilters: true,
    },
    {
        Header: "Validation Status",
        // accessor: "validationStatus",
        accessor: row => {
            try {
                if (row.validationStatus) {
                    return <span>{row.validationStatus}</span>;
                } else {
                    return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : 'FAILED'}</span>;
                }
            } catch (error) {
                console.error(error)
            }
        },
        disableFilters: true,
    },
    {
        Header: "Validation Remarks",
        accessor: row => {
            try {
                let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
                let remarks = validateRemark?.split("--sptr--")?.filter(x => x?.trim() !== "");
                if (remarks?.length === 1) {
                    return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
                } else if (remarks?.length > 1) {
                    return (
                        remarks?.map((remark, idx) => (
                            <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                        ))
                    )
                } else {
                    return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
                }
            } catch (error) {
                console.log(error);
            }
        },
        disableFilters: true
    }
]

// export const CustomerMandatoryColumns = [
//     ['Customer Number','Customer Name','Customer Type','Billable Ref Number','Status','Customer Email ID','Customer Contact Number','Address Line 1','Address Line 2','Address Line 3'],
//     ['District','Country','Post Code','Billable','Bill Group','Currency','Invoice Delivery Packs','Invoice Delivery','No of Copies','Invoice Type'],
//     ['Invoice Formats','Invoice Validation','Account Manager']
// ]

export const CustomerMandatoryColumns = [
    ['First Name', 'Last Name', 'Title', 'Email ID', 'Customer Category', 'Gender', 'DOB', 'Status', 'Department', 'Projects'],
    ['Mobile Prefix', 'Mobile No', 'ID Type', 'ID Value', 'Contact Preference', 'Registeration No', 'Registeration Date'],
    ['Address Type', 'Address 1', 'Address 2', 'District', 'State', 'Post code', 'Country'],
]


export const ProductTemplateColumns = [
    {
        Header: "Product Name",
        accessor: "productName",
        disableFilters: true,
    },
    {
        Header: "Product Family",
        accessor: "productFamily",
        disableFilters: true,
    },
    {
        Header: "Product Category",
        accessor: "productCategory",
        disableFilters: true,
    },
    {
        Header: "Product Sub Category",
        accessor: "productSubCategory",
        disableFilters: true,
    },
    {
        Header: "Product Type",
        accessor: "productType",
        disableFilters: true,
    },
    {
        Header: "Service Class",
        accessor: "serviceClass",
        disableFilters: true,
    },
    {
        Header: "Product Sub Type",
        accessor: "productSubType",
        disableFilters: true,
    },
    {
        Header: "Service Type",
        accessor: "serviceType",
        disableFilters: true,
    },
    {
        Header: "Provisioning Type",
        accessor: "provisioningType",
        disableFilters: true,
    },
    {
        Header: "Product Class",
        accessor: "productClass",
        disableFilters: true,
    },
    {
        Header: "Bundle Name",
        accessor: "prodBundleName",
        disableFilters: true,
    },
    {
        Header: "Charge Name",
        accessor: "chargeName",
        disableFilters: true,
    },
    // {
    //     Header: "Charge Type",
    //     accessor: "chargeType",
    //     disableFilters: true,
    // },
    // {
    //     Header: "Charge Amount",
    //     accessor: "chargeAmount",
    //     disableFilters: true,
    // },
    // {
    //     Header: "Advance Charge",
    //     accessor: "advanceCharge",
    //     disableFilters: true,
    // },
    // {
    //     Header: "Upfront Charge",
    //     accessor: "chargeUpfront",
    //     disableFilters: true,
    // },
    {
        Header: "Frequency",
        accessor: "frequency",
        disableFilters: true,
    },
    // {
    //     Header: "Prorated",
    //     accessor: "prorated",
    //     disableFilters: true,
    // },
    // {
    //     Header: "Currency",
    //     accessor: "currency",
    //     disableFilters: true,
    // },
    {
        Header: "Contract Availability",
        accessor: "contractFlag",
        disableFilters: true,
    },
    {
        Header: "Contract Duration",
        accessor: "contractInMonths",
        disableFilters: true,
    },
    {
        Header: "UOM",
        accessor: "uomCategory",
        disableFilters: true,
    },
    // {
    //     Header: "GL Code",
    //     accessor: "glcode",
    //     disableFilters: true,
    // },
    {
        Header: "Activation Date",
        accessor: "activationDate",
        disableFilters: true,
    },
    {
        Header: "Expiry Date",
        accessor: "expiryDate",
        disableFilters: true,
    },
    {
        Header: "Is Appointment Required",
        accessor: "isAppointRequired",
        disableFilters: true,
    },
    {
        Header: "Product Benefits",
        accessor: row => {
            try {
                let benefits = row.productBenefits?.split(";")?.filter(x => x?.trim() !== "");
                if (benefits?.length === 1) {
                    return <span style={{ textAlign: 'left', display: 'block' }}>{benefits[0]?.trim()}</span>;
                } else if (benefits?.length > 1) {
                    return (
                        benefits?.map((benefit, idx) => (
                            <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${benefit}`}<br /></span>
                        ))
                    )
                } else {
                    return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
                }
            } catch (error) {
                console.log(error);
            }
        },
        disableFilters: true,
    },
    {
        Header: "Validation Status",
        // accessor: "validationStatus",
        accessor: row => {
            try {
                if (row.validationStatus) {
                    return <span>{row.validationStatus}</span>;
                } else {
                    return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : 'FAILED'}</span>;
                }
            } catch (error) {
                console.error(error)
            }
        },
        disableFilters: true,
    },
    {
        Header: "Validation Remarks",
        accessor: row => {
            try {
                let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
                let remarks = validateRemark?.split("-")?.filter(x => x?.trim() !== "");
                if (remarks?.length === 1) {
                    return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
                } else if (remarks?.length > 1) {
                    return (
                        remarks?.map((remark, idx) => (
                            <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                        ))
                    )
                } else {
                    return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
                }
            } catch (error) {
                console.log(error);
            }
        },
        disableFilters: true,
    }
]
export const ProductMandatoryColumns = [
    ['Product Name', 'Product Family', 'Product Category', 'Product Sub Category', 'Product Type'],
    ['Service Class', 'Product Sub Type', 'Service Type', 'Provisioning Type', 'Product Class', 'Charge Name'],
    ['Frequency', 'UOM', 'Activation Date', 'Is Appointment Required']
]
export const BillingContractTemplateColumns = [
    {
        Header: "Contract Reference No",
        accessor: "contractRefNo",
        disableFilters: true,
    },
    {
        Header: "Contract Start Date",
        accessor: "contractStartDate",
        disableFilters: true,
    },
    {
        Header: "Contract End Date",
        accessor: "contractEndDate",
        disableFilters: true,
    },

    {
        Header: "Contract Status",
        accessor: "contractstatus",
        disableFilters: true,
    },

    {
        Header: "Product Name",
        accessor: "productName",
        disableFilters: true,
    },
    {
        Header: "Service Reference No",
        accessor: "serviceRefNo",
        disableFilters: true,
    },
    {
        Header: "Product Start Date",
        accessor: "productStartDate",
        disableFilters: true,
    },
    {
        Header: "Product End Date",
        accessor: "productEndDate",
        disableFilters: true,
    },
    {
        Header: "Charge Name",
        accessor: "chargeName",
        disableFilters: true,
    },
    {
        Header: "Charge Type",
        accessor: "chargeType",
        disableFilters: true,
    },
    {
        Header: "Charge Amount",
        accessor: "chargeAmount",
        disableFilters: true,
    },
    {
        Header: "Frequency",
        accessor: "frequency",
        disableFilters: true,
    },
    {
        Header: "Prorated",
        accessor: "prorated",
        disableFilters: true,
    },
    {
        Header: "Credit Adjustment Amount",
        accessor: "creditAdjAmt",
        disableFilters: true,
    },
    {
        Header: "Debit Adjustment Amount",
        accessor: "debitAdjAmt",
        disableFilters: true,
    },

    {
        Header: "Last Bill Period",
        accessor: "lastBillPeriod",
        disableFilters: true,
    },
    {
        Header: "Next Bill Period",
        accessor: "nextBillPeriod",
        disableFilters: true,
    },
    {
        Header: "Status",
        accessor: "status",
        disableFilters: true,
    },

    {
        Header: "Validation Status",
        // accessor: "validationStatus",
        accessor: row => {
            try {
                if (row.validationStatus) {
                    return <span>{row.validationStatus}</span>;
                } else {
                    return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : 'FAILED'}</span>;
                }
            } catch (error) {
                console.error(error)
            }
        },
        disableFilters: true,
    },
    {
        Header: "Validation Remarks",
        accessor: row => {
            try {
                let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
                let remarks = validateRemark?.split("-")?.filter(x => x?.trim() !== "");
                if (remarks?.length === 1) {
                    return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
                } else if (remarks?.length > 1) {
                    return (
                        remarks?.map((remark, idx) => (
                            <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                        ))
                    )
                } else {
                    return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
                }
            } catch (error) {
                console.log(error);
            }
        },
        disableFilters: true,
    }
]

export const BillingContractMandatoryColumns = [
    ['Contract Reference No', 'Contract Start Date', 'Contract End Date', 'Contract Status'],
    ['Product Name', 'Product Start Date', 'Product End Date', 'Status'],

]

export const CustomerContractTemplateColumns = [
    {
        Header: "Customer Contract Ref Number",
        accessor: "custContRefNo",
        disableFilters: true,
    },
    {
        Header: "SO Number",
        accessor: "soNo",
        disableFilters: true,
    },
    {
        Header: "Contract Category",
        accessor: "contCategory",
        disableFilters: true,
    },
    {
        Header: "Charge Type",
        accessor: "chargeType",
        disableFilters: true,
    },
    {
        Header: "Contract Start Date",
        accessor: "contStartDate",
        disableFilters: true,
    },
    {
        Header: "Contract End Date",
        accessor: "contEndDate",
        disableFilters: true,
    },
    {
        Header: "Contract Status",
        accessor: "contStatus",
        disableFilters: true,
    },
    {
        Header: "Contract Total Amount",
        accessor: "contTotalAmt",
        disableFilters: true,
    },
    {
        Header: "Product Name",
        accessor: "prodName",
        disableFilters: true,
    },
    {
        Header: "Prod Desc",
        accessor: "prodDesc",
        disableFilters: true,
    },
    {
        Header: "Qty",
        accessor: "quantity",
        disableFilters: true,
    },
    {
        Header: "Product Start Date",
        accessor: "prodStartDate",
        disableFilters: true,
    },
    {
        Header: "Product End Date",
        accessor: "prodEndDate",
        disableFilters: true,
    },
    {
        Header: "Product Total Amount",
        accessor: "prodTotalAmt",
        disableFilters: true,
    },
    {
        Header: "Unit Amount",
        accessor: "unitAmt",
        disableFilters: true,
    },
    {
        Header: "Duration",
        accessor: "duration",
        disableFilters: true,
    },
    {
        Header: "Line Item Status",
        accessor: "lineItemStatus",
        disableFilters: true,
    },
    {
        Header: "Contract Renewal Date",
        accessor: "contRenewalDate",
        disableFilters: true,
    },
    {
        Header: "Allocation Percentage",
        accessor: "allocationPercent",
        disableFilters: true,
    },
    {
        Header: "Is Contract Evergreen",
        accessor: "isContEvergreen",
        disableFilters: true,
    },
    {
        Header: "Advance Flag",
        accessor: "advFlag",
        disableFilters: true,
    },
    {
        Header: "Validation Status",
        // accessor: "validationStatus",
        accessor: row => {
            try {
                if (row.validationStatus) {
                    return <span>{row.validationStatus}</span>;
                } else {
                    return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : 'FAILED'}</span>;
                }
            } catch (error) {
                console.error(error)
            }
        },
        disableFilters: true,
    },
    {
        Header: "Validation Remarks",
        accessor: row => {
            try {
                let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
                let remarks = validateRemark?.split("-")?.filter(x => x?.trim() !== "");
                if (remarks?.length === 1) {
                    return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
                } else if (remarks?.length > 1) {
                    return (
                        remarks?.map((remark, idx) => (
                            <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                        ))
                    )
                } else {
                    return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
                }
            } catch (error) {
                console.log(error);
            }
        },
        disableFilters: true,
    }
]

export const CustomerContractMandatoryColumns = [
    ['Customer Contract Ref Number', 'SO Number', 'Contract Category', 'Charge Type', 'Contract Start Date', 'Contract End Date', 'Contract Status'],
    ['Contract Total Amount', 'Product Name', 'Prod Desc', 'Qty', 'Product Start Date', 'Product End Date', 'Product Total Amount',],
    ['Unit Amount', 'Duration', 'Line Item Status', 'Is Contract Evergreen', 'Advance Flag']
]

export const SalesOrderTemplateColumns = [
    {
        Header: "Customer No",
        accessor: "custNo",
        disableFilters: true,
    },
    {
        Header: "Sales Order No",
        accessor: "soNo",
        disableFilters: true,
    },
    {
        Header: "SO Type",
        accessor: "soType",
        disableFilters: true,
    },
    {
        Header: "Validation Status",
        // accessor: "validationStatus",
        accessor: row => {
            try {
                if (row.validationStatus) {
                    return <span>{row.validationStatus}</span>;
                } else {
                    return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : 'FAILED'}</span>;
                }
            } catch (error) {
                console.error(error)
            }
        },
        disableFilters: true,
    },
    {
        Header: "Validation Remarks",
        accessor: row => {
            try {
                let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
                let remarks = validateRemark?.split("-")?.filter(x => x?.trim() !== "");
                if (remarks?.length === 1) {
                    return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
                } else if (remarks?.length > 1) {
                    return (
                        remarks?.map((remark, idx) => (
                            <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                        ))
                    )
                } else {
                    return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
                }
            } catch (error) {
                console.log(error);
            }
        },
        disableFilters: true,
    }
]

export const SalesOrderMandatoryColumns = [
    ['Customer No', 'Sales Order No', 'SO Type']
]

export const IncidentTemplateColumns = [
    {
        Header: "Customer No",
        accessor: "custNo",
        disableFilters: true,
    },
    {
        Header: "HPSM Ref Number",
        accessor: "hpsmRefNo",
        disableFilters: true,
    },
    {
        Header: "Validation Status",
        // accessor: "validationStatus",
        accessor: row => {
            try {
                if (row.validationStatus) {
                    return <span>{row.validationStatus}</span>;
                } else {
                    return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : 'FAILED'}</span>;
                }
            } catch (error) {
                console.error(error)
            }
        },
        disableFilters: true,
    },
    {
        Header: "Validation Remarks",
        accessor: row => {
            try {
                let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
                let remarks = validateRemark?.split("-")?.filter(x => x?.trim() !== "");
                if (remarks?.length === 1) {
                    return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
                } else if (remarks?.length > 1) {
                    return (
                        remarks?.map((remark, idx) => (
                            <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                        ))
                    )
                } else {
                    return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
                }
            } catch (error) {
                console.log(error);
            }
        },
        disableFilters: true,
    }
]

export const IncidentMandatoryColumns = [
    ['Customer No', 'HPSM Ref Number']
]
export const RecordExtractorColumns = [
    {
        Header: "Process ID",
        accessor: "bulkUploadId",
        disableFilters: true,
    },
    {
        Header: "Upload Type",
        accessor: "uploadTableName",
        disableFilters: true,
    },
    {
        Header: "Upload File Name",
        accessor: "uploadFileName",
        disableFilters: true,
    },
    {
        Header: "Upload Status",
        accessor: "uploadStatus",
        disableFilters: true,
    },
    {
        Header: "Uploaded By",
        accessor: "createdByName",
        disableFilters: true,
    },
    {
        Header: "Uploaded Date and Time",
        accessor: "createdAt",
        disableFilters: true,
    },
    {
        Header: "Action",
        accessor: "action",
        disableFilters: true,
    }
]

export const UserColumns = [
    {
        Header: "First Name",
        accessor: "firstName",
        disableFilters: true,
        id: "firstName",
    },
    {
        Header: "Last Name",
        accessor: "lastName",
        disableFilters: true,
        id: "lastName",
    },
    {
        Header: "Gender",
        accessor: "gender",
        disableFilters: true,
        id: "gender",
    },

    {
        Header: "Email",
        accessor: "emailId",
        disableFilters: true,
        id: "emailId",
    },
    {
        Header: "Date of Birth",
        accessor: "birthDate",
        disableFilters: true,
        id: "birthDate",
    },
    {
        Header: "User Category",
        accessor: "userCategory",
        disableFilters: true,
        id: "userCategory",
    },
    {
        Header: "User Type",
        accessor: "userType",
        disableFilters: true,
        id: "userType",
    },

    {
        Header: "User Family",
        accessor: "userFamily",
        disableFilters: true,
        id: "userFamily",
    },

    {
        Header: "Country",
        accessor: "country",
        disableFilters: true,
        id: "country",
    },
    {
        Header: "Contact Prefix",
        accessor: "mobilePrefix",
        disableFilters: true,
        id: "mobile_prefix",
    },

    {
        Header: "Contact Number",
        accessor: "mobileNo",
        disableFilters: true,
        id: "mobileNo",
    },
    {
        Header: "Location",
        accessor: "userLocation",
        disableFilters: true,
        id: "userLocation",
    },
    {
        Header: "Manager Email",
        accessor: "managerEmail",
        disableFilters: true,
        id: "managerEmail",
    },
    {
        Header: "Notification Type",
        accessor: "notificationType",
        disableFilters: true,
        id: "notificationType",
    },
    {
        Header: "BI Access Key",
        accessor: "biAccessKey",
        disableFilters: true,
        id: "biAccessKey",
    },
    {
        Header: "BI Access",
        accessor: "biAccess",
        disableFilters: true,
        id: "biAccess",
    },
    {
        Header: "Projects",
        accessor: "projects",
        disableFilters: true,
        id: "projects",
    },
    {
        Header: "Role Name",
        accessor: "roleName",
        disableFilters: true,
        id: "roleName",
    },
    {
        Header: "Department Name",
        accessor: "department",
        disableFilters: true,
        id: "department"
    },
    // {
    //     Header: "User Group",
    //     accessor: "userGroup",
    //     disableFilters: true,
    //     id: "userGroup"
    // },
    {
        Header: "Activation Date",
        accessor: "activationDate",
        disableFilters: true,
        id: "activationDate"

    }, {
        Header: "Expiry Date",
        accessor: "expiryDate",
        disableFilters: true,
        id: "expiryDate"
    },
    {
        Header: "Expertise On",
        accessor: "expertiseOn",
        disableFilters: true,
        id: "expertiseOn",
    },
    {
        Header: "Validation Status",
        // accessor: "validationStatus",
        accessor: row => {
            try {
                if (row.validationStatus) {
                    return <span>{row.validationStatus}</span>;
                } else {
                    return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : 'FAILED'}</span>;
                }
            } catch (error) {
                console.error(error)
            }
        },
        disableFilters: true,
    },
    {
        Header: "Validation Remarks",
        accessor: row => {
            try {
                let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
                let remarks = validateRemark?.split("--sptr--")?.filter(x => x?.trim() !== "");
                if (remarks?.length === 1) {
                    return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
                } else if (remarks?.length > 1) {
                    return (
                        remarks?.map((remark, idx) => (
                            <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                        ))
                    )
                } else {
                    return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
                }
            } catch (error) {
                console.log(error);
            }
        },
        disableFilters: true,
    }
];

export const UserMandatoryColumns = [
    ['First Name', 'Last Name', 'Gender', 'Email', 'Date of Birth'],
    ['User Category', 'User Type', 'User Family', 'Country', 'Contact Prefix'],
    ['Contact Number', 'Location', 'Manager Email', 'Role Name', 'Department Name', 'Projects'],
    ['Activation Date', 'Expiry Date (When User Type is "Contract")']
];

export const BusinessEntityColumns = [
    {
        Header: "Code",
        accessor: "code",
        disableFilters: true,
        id: "code",
    },
    {
        Header: "Description",
        accessor: "description",
        disableFilters: true,
        id: "description",
    },
    {
        Header: "Code Type",
        accessor: "codeType",
        disableFilters: true,
        id: "codeType",
    },
    {
        Header: "Status",
        accessor: "status",
        disableFilters: true,
        id: "status",
    },
    {
        Header: "Validation Status",
        // accessor: "validationStatus",
        accessor: row => {
            try {
                if (row.validationStatus) {
                    return <span>{row.validationStatus}</span>;
                } else {
                    return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : 'FAILED'}</span>;
                }
            } catch (error) {
                console.error(error)
            }
        },
        disableFilters: true,
    },
    {
        Header: "Validation Remarks",
        accessor: row => {
            try {
                let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
                let remarks = validateRemark?.split("-")?.filter(x => x?.trim() !== "");
                if (remarks?.length === 1) {
                    return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
                } else if (remarks?.length > 1) {
                    return (
                        remarks?.map((remark, idx) => (
                            <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                        ))
                    )
                } else {
                    return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
                }
            } catch (error) {
                console.log(error);
            }
        },
        disableFilters: true,
    }

];

export const BusinessEntityMandatoryCols = [
    ['Code', 'Description'], ['Code Type', 'Status'],
];


export const RoleColumns = [
    {
        Header: "Role Name",
        accessor: "roleName",
        disableFilters: true,
        id: "roleName",
    },
    {
        Header: "Role Description",
        accessor: "roleDescription",
        disableFilters: true,
        id: "roleDescription",
    },
    {
        Header: "Is Admin",
        accessor: "isAdmin",
        disableFilters: true,
        id: "isAdmin",
    },

    {
        Header: "Status",
        accessor: "status",
        disableFilters: true,
        id: "status",
    },
    {
        Header: "Validation Status",
        // accessor: "validationStatus",
        accessor: row => {
            try {
                if (row.validationStatus) {
                    return <span>{row.validationStatus}</span>;
                } else {
                    return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : 'FAILED'}</span>;
                }
            } catch (error) {
                console.error(error)
            }
        },
        disableFilters: true,
    },
    {
        Header: "Validation Remarks",
        accessor: row => {
            try {
                let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
                let remarks = validateRemark?.split("-")?.filter(x => x?.trim() !== "");
                if (remarks?.length === 1) {
                    return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
                } else if (remarks?.length > 1) {
                    return (
                        remarks?.map((remark, idx) => (
                            <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                        ))
                    )
                } else {
                    return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
                }
            } catch (error) {
                console.log(error);
            }
        },
        disableFilters: true,
    }

];
export const RolesMandatoryCols = [
    ['Role Name', 'Role Description'], ['Is Admin', 'Status'],
];

export const UserRoleColumns = [
    {
        Header: "Email",

        disableFilters: true,
        id: "roleName",
    },

    {
        Header: "Department Description",
        accessor: "departmentDescription",
        disableFilters: true,
        id: "departmentDescription",
    },
    {
        Header: "Role Description",
        accessor: "roleDescription",
        disableFilters: true,
        id: "roleDescription",
    },

    {
        Header: "Validation Status",
        // accessor: "validationStatus",
        accessor: row => {
            try {
                if (row.validationStatus) {
                    return <span>{row.validationStatus}</span>;
                } else {
                    return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : 'FAILED'}</span>;
                }
            } catch (error) {
                console.error(error)
            }
        },
        disableFilters: true,
    },
    {
        Header: "Validation Remarks",
        accessor: row => {
            try {
                let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
                let remarks = validateRemark?.split("-")?.filter(x => x?.trim() !== "");
                if (remarks?.length === 1) {
                    return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
                } else if (remarks?.length > 1) {
                    return (
                        remarks?.map((remark, idx) => (
                            <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                        ))
                    )
                } else {
                    return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
                }
            } catch (error) {
                console.log(error);
            }
        },
        disableFilters: true,
    }

];
export const UserRoleMandatoryCols = [
    ['Email', 'Department Description', 'Role Description']
];

export const RequestStatementColumns = [
    {
        Header: "Interaction statement",
        accessor: "intxnStatement",
        disableFilters: true,
        id: "intxnStatement",
    },
    {
        Header: "Interaction Category",
        accessor: "intxnCategory",
        disableFilters: true,
        id: "intxnCategory",
    },
    {
        Header: "Interaction Type",
        accessor: "intxnType",
        disableFilters: true,
        id: "intxnType",
    },
    {
        Header: "Service Category",
        accessor: "serviceCategory",
        disableFilters: true,
        id: "serviceCategory",
    },
    {
        Header: "Service type",
        accessor: "serviceType",
        disableFilters: true,
        id: "serviceType",
    },
    {
        Header: "Priority",
        accessor: "priority",
        disableFilters: true,
        id: "priority",
    },
    {
        Header: "Interaction Statement Class",
        accessor: "reqStatementClass",
        disableFilters: true,
        id: "reqStatementClass",
    },
    // {
    //     Header: "Interaction Statement Cause",
    //     accessor: "intxnStatCause",
    //     disableFilters: true,
    //     id: "intxnStatCause",
    // },
    {
        Header: "Interaction Resolution",
        accessor: "intxnResolution",
        disableFilters: true,
        id: "intxnResolution",
    }, {
        Header: "Multi Language",
        accessor: "multiLang",
        disableFilters: true,
        id: "multiLang",
    }, {
        Header: "Multi Language Interaction Statement",
        accessor: "multiLangIntxnStatement",
        disableFilters: true,
        id: "multiLangIntxnStatement",
    }, {
        Header: "Multi Language Interaction Resolution",
        accessor: "multiLangIntxnResolution",
        disableFilters: true,
        id: "multiLangIntxnResolution",
    }, {
        Header: "Is Appointment Required",
        accessor: "isAppointment",
        disableFilters: true,
        id: "isAppointment",
    }, {
        Header: "Order Convertion Required",
        accessor: "isOrder",
        disableFilters: true,
        id: "isOrder",
    }, {
        Header: "Order Category",
        accessor: "orderCategory",
        disableFilters: true,
        id: "orderCategory",
    }, {
        Header: "Order Type",
        accessor: "orderType",
        disableFilters: true,
        id: "orderType",
    },
    {
        Header: "Validation Status",
        // accessor: "validationStatus",
        accessor: row => {
            try {
                if (row.validationStatus) {
                    return <span>{row.validationStatus}</span>;
                } else {
                    return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : 'FAILED'}</span>;
                }
            } catch (error) {
                console.error(error)
            }
        },
        disableFilters: true,
    },
    {
        Header: "Validation Remarks",
        accessor: row => {
            try {
                let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
                let remarks = validateRemark?.split("-")?.filter(x => x?.trim() !== "");
                if (remarks?.length === 1) {
                    return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
                } else if (remarks?.length > 1) {
                    return (
                        remarks?.map((remark, idx) => (
                            <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                        ))
                    )
                } else {
                    return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
                }
            } catch (error) {
                console.log(error);
            }
        },
        disableFilters: true,
    }
];
export const RequestStatementMandatoryCols = [
    ['Interaction statement', 'Interaction Category', 'Interaction Type'],
    ['Service Category', 'Service type', 'Priority']
];


export const OrderTemplateColumns = [
    {
        Header: "Order Reference No",
        accessor: "orderRefNo",
        disableFilters: true,
        id: "orderRefNo",
    },
    {
        Header: "Order Date",
        accessor: "orderDate",
        disableFilters: true,
        id: "orderDate",
    },
    {
        Header: "Customer Name",
        accessor: "customerName",
        disableFilters: true,
        id: "customerName",
    },
    {
        Header: "Service Name",
        accessor: "serviceName",
        disableFilters: true,
        id: "serviceName",
    },
    {
        Header: "Email ID",
        accessor: "emailId",
        disableFilters: true,
        id: "emailId",
    },
    {
        Header: "Order Category",
        accessor: "orderCategory",
        disableFilters: true,
        id: "orderCategory",
    },
    {
        Header: "Order Type",
        accessor: "orderType",
        disableFilters: true,
        id: "orderType",
    },
    {
        Header: "Order Source",
        accessor: "orderSource",
        disableFilters: true,
        id: "orderSource",
    },
    {
        Header: "Order Channel",
        accessor: "orderChannel",
        disableFilters: true,
        id: "orderChannel",
    },
    {
        Header: "Order Status",
        accessor: "orderStatus",
        disableFilters: true,
        id: "orderStatus",
    },
    {
        Header: "Order Family",
        accessor: "orderFamily",
        disableFilters: true,
        id: "orderFamily",
    },
    {
        Header: "Order Mode Type",
        accessor: "orderMode",
        disableFilters: true,
        id: "orderMode",
    },
    {
        Header: "Order Delivery Mode",
        accessor: "orderDeliveryMode",
        disableFilters: true,
        id: "orderDeliveryMode",
    },
    {
        Header: "Service Category",
        accessor: "serviceCategory",
        disableFilters: true,
        id: "serviceCategory",
    },
    {
        Header: "Service Type",
        accessor: "serviceType",
        disableFilters: true,
        id: "serviceType",
    },
    {
        Header: "Order Priority",
        accessor: "orderPriority",
        disableFilters: true,
        id: "orderPriority",
    },
    {
        Header: "Order Description",
        accessor: "orderDescription",
        disableFilters: true,
        id: "orderDescription",
    },
    {
        Header: "Product Name",
        accessor: "productName",
        disableFilters: true,
        id: "productName",
    },
    {
        Header: "Quantity",
        accessor: "productQuantity",
        disableFilters: true,
        id: "productQuantity",
    },
    {
        Header: "Bill Amount",
        accessor: "billAmount",
        disableFilters: true,
        id: "billAmount",
    },
    {
        Header: "Product Reference No",
        accessor: "productRefNo",
        disableFilters: true,
        id: "productRefNo",
    },
    {
        Header: "Delivery Location",
        accessor: "deliveryLocation",
        disableFilters: true,
        id: "deliveryLocation",
    },
    {
        Header: "EDOC",
        accessor: "edoc",
        disableFilters: true,
        id: "edoc",
    },
    {
        Header: "Contact Preference",
        accessor: "contactPreference",
        disableFilters: true,
        id: "contactPreference",
    }, {
        Header: "EDOC",
        accessor: "reason",
        disableFilters: true,
        id: "reason",
    },
    {
        Header: "Created Department",
        accessor: "createdDept",
        disableFilters: true,
        id: "createdDept",
    },
    {
        Header: "Current Department",
        accessor: "currDept",
        disableFilters: true,
        id: "currDept",
    },
    {
        Header: "Created Role",
        accessor: "createdRole",
        disableFilters: true,
        id: "createdRole",
    },
    {
        Header: "Current Role",
        accessor: "currRole",
        disableFilters: true,
        id: "currRole",
    },
    {
        Header: "Current User",
        accessor: "currUser",
        disableFilters: true,
        id: "currUser",
    },
    {
        Header: "Request Statement",
        accessor: "requestStatement",
        disableFilters: true,
        id: "requestStatement",
    },
    {
        Header: "Address Type",
        accessor: "addressType",
        disableFilters: true,
        id: "addressType",
    },
    {
        Header: "Address 1",
        accessor: "address1",
        disableFilters: true,
        id: "address1",
    },
    {
        Header: "Address 2",
        accessor: "address2",
        disableFilters: true,
        id: "address2",
    },
    {
        Header: "Address 3",
        accessor: "address3",
        disableFilters: true,
        id: "address3",
    },
    {
        Header: "City",
        accessor: "city",
        disableFilters: true,
        id: "city",
    },
    {
        Header: "District",
        accessor: "district",
        disableFilters: true,
        id: "district",
    },
    {
        Header: "State",
        accessor: "state",
        disableFilters: true,
        id: "state",
    },
    {
        Header: "Post code",
        accessor: "postcode",
        disableFilters: true,
        id: "postcode",
    },
    {
        Header: "Country",
        accessor: "country",
        disableFilters: true,
        id: "country",
    },
    {
        Header: "Latitude",
        accessor: "latitude",
        disableFilters: true,
        id: "latitude",
    },
    {
        Header: "Longitude",
        accessor: "longitude",
        disableFilters: true,
        id: "longitude",
    }, {
        Header: "Advance Charge",
        accessor: "advanceCharge",
        disableFilters: true,
        id: "advanceCharge",
    }, {
        Header: "Upfront Charge",
        accessor: "upfrontCharge",
        disableFilters: true,
        id: "upfrontCharge",
    }, {
        Header: "Prorated",
        accessor: "prorated",
        disableFilters: true,
        id: "prorated",
    },
    {
        Header: "Validation Status",
        // accessor: "validationStatus",
        accessor: row => {
            try {
                if (row.validationStatus) {
                    return <span>{row.validationStatus}</span>;
                } else {
                    return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : 'FAILED'}</span>;
                }
            } catch (error) {
                console.error(error)
            }
        },
        disableFilters: true,
    },
    {
        Header: "Validation Remarks",
        accessor: row => {
            try {
                let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
                let remarks = validateRemark?.split("-")?.filter(x => x?.trim() !== "");
                if (remarks?.length === 1) {
                    return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
                } else if (remarks?.length > 1) {
                    return (
                        remarks?.map((remark, idx) => (
                            <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                        ))
                    )
                } else {
                    return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
                }
            } catch (error) {
                console.log(error);
            }
        },
        disableFilters: true,
    }

];
export const OrderMandatoryColumns = [
    ['Order Reference No', 'Order Date', 'Customer Name', 'Service Name', 'Email ID', 'Order Category', 'Order Type', 'Order Source', 'Order Channel', 'Order Status', 'Order Family'],
    ['Service Category', 'Service Type', 'Order Priority', 'Order Description', 'Product Name', 'Quantity', 'Bill Amount', 'Contact Preference', 'Reason', 'Created Department'],
    ['Current Department', 'Created Role', 'Current Role', 'Address Type', 'Address 1', 'Address 2', 'District', 'State', 'Post code', 'Country', 'Advance Charge', 'Upfront Charge', 'Prorated']
];

export const ProfileTemplateColumns = [
    {
        Header: "First Name",
        accessor: "firstName",
        disableFilters: true,
        id: "firstName",
    },
    {
        Header: "Last Name",
        accessor: "lastName",
        disableFilters: true,
        id: "lastName",
    },
    {
        Header: "Profile Category",
        accessor: "profileCategory",
        disableFilters: true,
        id: "profileCategory",
    },
    {
        Header: "Gender",
        accessor: "gender",
        disableFilters: true,
        id: "gender",
    },

    {
        Header: "Email Id",
        accessor: "emailId",
        disableFilters: true,
        id: "email",
    },
    {
        Header: "Mobile Prefix",
        accessor: "mobilePrefix",
        disableFilters: true,
        id: "mobilePrefix",
    },
    {
        Header: "Mobile No",
        accessor: "mobileNo",
        disableFilters: true,
        id: "mobileNo",
    },
    {
        Header: "DOB",
        accessor: "birthDate",
        disableFilters: true,
        id: "birthDate",
    },

    {
        Header: "ID Type",
        accessor: "idType",
        disableFilters: true,
        id: "idType",
    },
    {
        Header: "ID Value",
        accessor: "idValue",
        disableFilters: true,
        id: "idValue",
    },
    {
        Header: "Registeration No",
        accessor: "registeredNo",
        disableFilters: true,
        id: "registeredNo",
    },
    {
        Header: "Registeration Date",
        accessor: "registeredDate",
        disableFilters: true,
        id: "registeredDate",
    },
    {
        Header: "Nationality",
        accessor: "nationality",
        disableFilters: true,
        id: "nationality",
    },
    {
        Header: "Contact Preferences",
        accessor: "contactPreferences",
        disableFilters: true,
        id: "contactPreferences",
    },

    {
        Header: "Address Type",
        accessor: "addressType",
        disableFilters: true,
        id: "addressType",
    },
    {
        Header: "Address 1",
        accessor: "address1",
        disableFilters: true,
        id: "address1",
    },
    {
        Header: "Address 2",
        accessor: "address2",
        disableFilters: true,
        id: "address2",
    },
    {
        Header: "Address 3",
        accessor: "address3",
        disableFilters: true,
        id: "address3",
    },
    {
        Header: "City",
        accessor: "city",
        disableFilters: true,
        id: "city",
    },
    {
        Header: "District",
        accessor: "district",
        disableFilters: true,
        id: "district",
    },
    {
        Header: "State",
        accessor: "state",
        disableFilters: true,
        id: "state",
    },
    {
        Header: "Post code",
        accessor: "postcode",
        disableFilters: true,
        id: "postcode",
    },
    {
        Header: "Country",
        accessor: "country",
        disableFilters: true,
        id: "country",
    },
    // {
    //     Header: "City",
    //     accessor: "city",
    //     disableFilters: true,
    //     id: "city",
    // },
    // {
    //     Header: "City",
    //     accessor: "city",
    //     disableFilters: true,
    //     id: "city",
    // },
    {
        Header: "Telephone No Prefix",
        accessor: "telephonePrefix",
        disableFilters: true,
        id: "telephonePrefix",
    },

    {
        Header: "Telephone No",
        accessor: "telephoneNo",
        disableFilters: true,
        id: "telephoneNo",
    },
    {
        Header: "WhatsApp No Prefix",
        accessor: "whatsappNoPrefix",
        disableFilters: true,
        id: "whatsappNoPrefix",
    },
    {
        Header: "WhatsApp Number",
        accessor: "whatsappNo",
        disableFilters: true,
        id: "whatsappNo",
    },
    {
        Header: "FAX",
        accessor: "fax",
        disableFilters: true,
        id: "fax",
    },
    {
        Header: "Facebook Id",
        accessor: "facebookId",
        disableFilters: true,
        id: "facebookId",
    },
    {
        Header: "Instagram Id",
        accessor: "instagramId",
        disableFilters: true,
        id: "instagramId",
    },
    {
        Header: "Telegram Id",
        accessor: "telegramId",
        disableFilters: true,
        id: "telegramId",
    },
    {
        Header: "Project",
        accessor: "project",
        disableFilters: true,
        id: "project",
    },
    {
        Header: "Validation Status",
        // accessor: "validationStatus",
        accessor: row => {
            try {
                if (row.validationStatus) {
                    return <span>{row.validationStatus}</span>;
                } else {
                    return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : 'FAILED'}</span>;
                }
            } catch (error) {
                console.error(error)
            }
        },
        disableFilters: true,
    },
    {
        Header: "Validation Remarks",
        accessor: row => {
            try {
                let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
                let remarks = validateRemark?.split("-")?.filter(x => x?.trim() !== "");
                if (remarks?.length === 1) {
                    return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
                } else if (remarks?.length > 1) {
                    return (
                        remarks?.map((remark, idx) => (
                            <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                        ))
                    )
                } else {
                    return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
                }
            } catch (error) {
                console.log(error);
            }
        },
        disableFilters: true,
    }
];
export const ProfileMandatoryColumns = [
    ['First Name', 'Last Name', 'Profile Category', 'Gender'],
    ['Email ID', 'Mobile Prefix', 'Mobile No',],
];

export const ServiceTemplateColumns = [

    {
        Header: "Customer Reference No",
        accessor: "customerRefNo",
        disableFilters: true,
        id: "customerRefNo",
    },
    {
        Header: "Account Reference No",
        accessor: "accountRefNo",
        disableFilters: true,
        id: "accountRefNo",
    },
    {
        Header: "Service Reference No",
        accessor: "serviceRefNo",
        disableFilters: true,
        id: "serviceRefNo",
    },
    {
        Header: "Account Category",
        accessor: "accountCategory",
        disableFilters: true,
        id: "accountCategory",
    },
    {
        Header: "Account Type",
        accessor: "accountType",
        disableFilters: true,
        id: "accountType",
    },
    {
        Header: "First Name",
        accessor: "firstName",
        disableFilters: true,
        id: "firstName",
    },
    {
        Header: "Last Name",
        accessor: "lastName",
        disableFilters: true,
        id: "lastName",
    },
    {
        Header: "Email ID",
        accessor: "emailId",
        disableFilters: true,
        id: "email",
    }, {
        Header: "Mobile No",
        accessor: "mobileNo",
        disableFilters: true,
        id: "mobileNo",
    },
    {
        Header: "Service Name",
        accessor: "serviceName",
        disableFilters: true,
        id: "serviceName",
    },
    {
        Header: "Service Category",
        accessor: "serviceCategory",
        disableFilters: true,
        id: "serviceCategory",
    },
    {
        Header: " Service Type",
        accessor: "serviceType",
        disableFilters: true,
        id: "serviceType",
    },
    {
        Header: "Service Status",
        accessor: "status",
        disableFilters: true,
        id: "status",
    },
    {
        Header: "Service Class",
        accessor: "serviceClass",
        disableFilters: true,
        id: "serviceClass",
    },
    {
        Header: "Currency",
        accessor: "accountCurreny",
        disableFilters: true,
        id: "accountCurreny",
    },
    {
        Header: "Bill Language",
        accessor: "accountBillLanguage",
        disableFilters: true,
        id: "accountBillLanguage",
    }, {
        Header: "Plan Reference No",
        accessor: "planReferenceNo",
        disableFilters: true,
        id: "planReferenceNo",
    },
    {
        Header: "Plan Name",
        accessor: "productName",
        disableFilters: true,
        id: "productName",
    },
    {
        Header: "Quantity",
        accessor: "quantity",
        disableFilters: true,
        id: "quantity",
    },
    {
        Header: "Activation Date",
        accessor: "activationDate",
        disableFilters: true,
        id: "activationDate",
    },
    {
        Header: "Expiry Date",
        accessor: "expiryDate",
        disableFilters: true,
        id: "expiryDate",
    },
    {
        Header: "Notification Preference",
        accessor: "notificationPreference",
        disableFilters: true,
        id: "notificationPreference",
    },
    {
        Header: "Service Agreement",
        accessor: "serviceAgreement",
        disableFilters: true,
        id: "serviceAgreement",
    },
    {
        Header: "Service Limit",
        accessor: "serviceLimit",
        disableFilters: true,
        id: "serviceLimit",
    },
    {
        Header: "Service Usage",
        accessor: "serviceUsage",
        disableFilters: true,
        id: "serviceUsage",
    },
    {
        Header: "Service Balance",
        accessor: "serviceBalance",
        disableFilters: true,
        id: "serviceBalance",
    },
    {
        Header: "Service Provisioning Type",
        accessor: "serviceProvisioningType",
        disableFilters: true,
        id: "serviceProvisioningType",
    },
    {
        Header: "Payment Method",
        accessor: "paymentMethod",
        disableFilters: true,
        id: "paymentMethod",
    },
    {
        Header: "Address Type",
        accessor: "addressType",
        disableFilters: true,
        id: "addressType",
    },
    {
        Header: "Address 1",
        accessor: "address1",
        disableFilters: true,
        id: "address1",
    },
    {
        Header: "Address 2",
        accessor: "address2",
        disableFilters: true,
        id: "address2",
    },
    {
        Header: "Address 3",
        accessor: "address3",
        disableFilters: true,
        id: "address3",
    },
    {
        Header: "City",
        accessor: "city",
        disableFilters: true,
        id: "city",
    },
    {
        Header: "District",
        accessor: "district",
        disableFilters: true,
        id: "district",
    },
    {
        Header: "State",
        accessor: "state",
        disableFilters: true,
        id: "state",
    },
    {
        Header: "Post code",
        accessor: "postcode",
        disableFilters: true,
        id: "postcode",
    },
    {
        Header: "Country",
        accessor: "country",
        disableFilters: true,
        id: "country",
    },
    {
        Header: "Latitude",
        accessor: "latitude",
        disableFilters: true,
        id: "latitude",
    },
    {
        Header: "Longitude",
        accessor: "longitude",
        disableFilters: true,
        id: "longitude",
    },
    {
        Header: "Telephone No Prefix",
        accessor: "telephonePrefix",
        disableFilters: true,
        id: "telephonePrefix",
    },
    {
        Header: "Telephone No",
        accessor: "telephoneNo",
        disableFilters: true,
        id: "telephoneNo",
    },
    {
        Header: "WhatsApp No Prefix",
        accessor: "whatsappNoPrefix",
        disableFilters: true,
        id: "whatsappNoPrefix",
    },
    {
        Header: "WhatsApp Number",
        accessor: "whatsappNo",
        disableFilters: true,
        id: "whatsappNo",
    },
    {
        Header: "FAX",
        accessor: "fax",
        disableFilters: true,
        id: "fax",
    },
    {
        Header: "Facebook Id",
        accessor: "facebookId",
        disableFilters: true,
        id: "facebookId",
    },
    {
        Header: "Instagram Id",
        accessor: "instagramId",
        disableFilters: true,
        id: "instagramId",
    },
    {
        Header: "Telegram Id",
        accessor: "telegramId",
        disableFilters: true,
        id: "telegramId",
    },
    {
        Header: "Validation Status",
        // accessor: "validationStatus",
        accessor: row => {
            try {
                if (row.validationStatus) {
                    return <span>{row.validationStatus}</span>;
                } else {
                    return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : 'FAILED'}</span>;
                }
            } catch (error) {
                console.error(error)
            }
        },
        disableFilters: true,
    },
    {
        Header: "Validation Remarks",
        accessor: row => {
            try {
                let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
                let remarks = validateRemark?.split("-")?.filter(x => x?.trim() !== "");
                if (remarks?.length === 1) {
                    return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
                } else if (remarks?.length > 1) {
                    return (
                        remarks?.map((remark, idx) => (
                            <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                        ))
                    )
                } else {
                    return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
                }
            } catch (error) {
                console.log(error);
            }
        },
        disableFilters: true,
    }
];
export const ServiceMandatoryColumns = [
    ["Customer Reference No", "Account Reference No", "Service Reference No", "Account Category", "Account Type", "First Name", "Last Name", "Email ID", "Mobile No"],
    ["Service Name", "Service Category", "Service Type", "Service Status", "Service Class", "Currency", "Bill Language", "Plan Reference No", "Plan Name", "Notification Preference"],
    ["Service Provisioning Type", "Address Type", "Address 1", "Address 2", "City", "District", "State", "Post code", "Country"]
];

export const InteractionTemplateColumns = [
    {
        Header: "Interaction Reference No",
        accessor: "intxnRefNo",
        disableFilters: true,
        id: "intxnRefNo",
    },
    {
        Header: "Customer Name",
        accessor: "customerName",
        disableFilters: true,
        id: "customerName",
    },
    {
        Header: "Service Name",
        accessor: "serviceName",
        disableFilters: true,
        id: "serviceName",
    },
    {
        Header: "Service Ref No",
        accessor: "serviceRefNo",
        disableFilters: true,
        id: "serviceRefNo",
    },
    {
        Header: "Product Name",
        accessor: "productName",
        disableFilters: true,
        id: "productName",
    },
    {
        Header: "Email ID",
        accessor: "emailid",
        disableFilters: true,
        id: "emailid",
    },
    {
        Header: "Mobile No",
        accessor: "mobileNo",
        disableFilters: true,
        id: "mobileNo",
    },
    {
        Header: "Interaction Category",
        accessor: "intxnCategory",
        disableFilters: true,
        id: "intxnCategory",
    },
    {
        Header: "Interaction Type",
        accessor: "intxnType",
        disableFilters: true,
        id: "intxnType",
    },
    {
        Header: "Service Category",
        accessor: "serviceCategory",
        disableFilters: true,
        id: "serviceCategory",
    },
    {
        Header: "Service Type",
        accessor: "serviceType",
        disableFilters: true,
        id: "serviceType",
    },
    // {
    //     Header: "Interaction Cause",
    //     accessor: "intxnCause",
    //     disableFilters: true,
    //     id: "intxnCause",
    // },
    {
        Header: "Interaction Status",
        accessor: "intxnStatus",
        disableFilters: true,
        id: "intxnStatus",
    },
    {
        Header: "Created Department",
        accessor: "createdEntity",
        disableFilters: true,
        id: "createdEntity",
    },
    {
        Header: "Current Department",
        accessor: "currEntity",
        disableFilters: true,
        id: "currEntity",
    },
    {
        Header: "Created Role",
        accessor: "createdRole",
        disableFilters: true,
        id: "createdRole",
    },
    {
        Header: "Current Role",
        accessor: "currRole",
        disableFilters: true,
        id: "currRole",
    },
    {
        Header: "Reason",
        accessor: "status_reason",
        disableFilters: true,
        id: "status_reason",
    },
    {
        Header: "Interaction Workflow Sequence",
        accessor: "intxnWorkflowSeq",
        disableFilters: true,
        id: "intxnWorkflowSeq",
    },
    {
        Header: "Interaction  Workflow Status",
        accessor: "intxnWorkflowStatus",
        disableFilters: true,
        id: "intxnWorkflowStatus",
    },
    {
        Header: "From Department",
        accessor: "fromEntity",
        disableFilters: true,
        id: "fromEntity",
    },
    {
        Header: "From Role",
        accessor: "fromRole",
        disableFilters: true,
        id: "fromRole",
    },
    {
        Header: "From User",
        accessor: "fromUser",
        disableFilters: true,
        id: "fromUser",
    },
    {
        Header: "To Department",
        accessor: "toEntity",
        disableFilters: true,
        id: "toEntity",
    },
    {
        Header: "To Role",
        accessor: "toRole",
        disableFilters: true,
        id: "toRole",
    },
    {
        Header: "Interaction Priority",
        accessor: "intxnPriority",
        disableFilters: true,
        id: "intxnPriority",
    },
    {
        Header: "Interaction Channel",
        accessor: "intxnChannel",
        disableFilters: true,
        id: "intxnChannel",
    },
    {
        Header: "Created Date",
        accessor: "intxnCreatedDate",
        disableFilters: true,
        id: "intxnCreatedDate",
    },
    {
        Header: "Assigned Date",
        accessor: "assignedDate",
        disableFilters: true,
        id: "assignedDate",
    },
    {
        Header: "Workflow Created Date",
        accessor: "flwCreatedAt",
        disableFilters: true,
        id: "flwCreatedAt",
    },
    {
        Header: "Interaction Description",
        accessor: "intxnDescription",
        disableFilters: true,
        id: "intxnDescription",
    },
    {
        Header: "Response Resolution",
        accessor: "responseSolution",
        disableFilters: true,
        id: "responseSolution",
    },
    {
        Header: "Address Type",
        accessor: "addressType",
        disableFilters: true,
        id: "addressType",
    },
    {
        Header: "Address 1",
        accessor: "address1",
        disableFilters: true,
        id: "address1",
    },
    {
        Header: "Address 2",
        accessor: "address2",
        disableFilters: true,
        id: "address2",
    },
    {
        Header: "Address 3",
        accessor: "address3",
        disableFilters: true,
        id: "address3",
    },
    {
        Header: "City",
        accessor: "city",
        disableFilters: true,
        id: "city",
    },
    {
        Header: "District",
        accessor: "district",
        disableFilters: true,
        id: "district",
    },
    {
        Header: "State",
        accessor: "state",
        disableFilters: true,
        id: "state",
    },
    {
        Header: "Post code",
        accessor: "postcode",
        disableFilters: true,
        id: "postcode",
    },
    {
        Header: "Country",
        accessor: "country",
        disableFilters: true,
        id: "country",
    },

    {
        Header: "Current User",
        accessor: "currUser",
        disableFilters: true,
        id: "currUser",
    },
    {
        Header: "To User",
        accessor: "toUser",
        disableFilters: true,
        id: "toUser",
    },
    {
        Header: "Contact Preference",
        accessor: "contactPreference",
        disableFilters: true,
        id: "contactPreference",
    },
    {
        Header: "Request Statement",
        accessor: "requestStatement",
        disableFilters: true,
        id: "requestStatement",
    },
    {
        Header: "Is Followup",
        accessor: "isFollowup",
        disableFilters: true,
        id: "isFollowup",
    },
    {
        Header: "Remarks",
        accessor: "remarks",
        disableFilters: true,
        id: "remarks",
    },
    {
        Header: "Latitude",
        accessor: "latitude",
        disableFilters: true,
        id: "latitude",
    },
    {
        Header: "Longitude",
        accessor: "longitude",
        disableFilters: true,
        id: "longitude",
    },
    {
        Header: "Validation Status",
        // accessor: "validationStatus",
        accessor: row => {
            try {
                if (row.validationStatus) {
                    return <span>{row.validationStatus}</span>;
                } else {
                    return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : 'FAILED'}</span>;
                }
            } catch (error) {
                console.error(error)
            }
        },
        disableFilters: true,
    },
    {
        Header: "Validation Remarks",
        accessor: row => {
            try {
                let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
                let remarks = validateRemark?.split("-")?.filter(x => x?.trim() !== "");
                if (remarks?.length === 1) {
                    return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
                } else if (remarks?.length > 1) {
                    return (
                        remarks?.map((remark, idx) => (
                            <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                        ))
                    )
                } else {
                    return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
                }
            } catch (error) {
                console.log(error);
            }
        },
        disableFilters: true,
    }
];
export const InteractionMandatoryColumns = [
    ["Interaction Reference No", "Customer Name", "Service Name", "Service Ref No", "Product Name", "Email ID", "Mobile No", "Interaction Category", "Interaction Type", "Service Category"],
    ["Service Type", "Interaction Status", "Created Department", "Current Department", "Created Role", "Current Role", "Interaction Workflow Sequence", "Interaction  Workflow Status", "From Department"],
    ["From Role", "From User", "To Department", "To Role", "Interaction Priority", "Interaction Channel", "Created Date", "Assigned Date", "Workflow Created Date", "Interaction Description"],
    ["Response Resolution", "Address Type", "Address 1", "Address 2", "City", "District", "State", "Post code", "Country"],
];

export const ChargeTemplateColumns = [
    {
        Header: "Charge Name",
        accessor: "chargeName",
        disableFilters: true,
        id: "Charge Name",
    },
    {
        Header: "Charge Category",
        accessor: "chargeCategory",
        disableFilters: true,
        id: "chargeCategory",
    },
    {
        Header: "Service Type",
        accessor: "serviceType",
        disableFilters: true,
        id: "serviceType",
    },
    {
        Header: "Charge Amount",
        accessor: "chargeAmount",
        disableFilters: true,
        id: "chargeAmount",
    },
    {
        Header: "Currency",
        accessor: "currency",
        disableFilters: true,
    },
    // {
    //     Header: "Advance Charge",
    //     accessor: "advanceCharge",
    //     disableFilters: true,
    //     id: "advanceCharge",
    // },
    {
        Header: "GL Code",
        accessor: "glCode",
        disableFilters: true,
        id: "glCode",
    },
    {
        Header: "Start Date",
        accessor: "startDate",
        disableFilters: true,
        id: "startDate",
    },
    {
        Header: "End Date",
        accessor: "endDate",
        disableFilters: true,
        id: "endDate",
    },
    {
        Header: "Validation Status",
        // accessor: "validationStatus",
        accessor: row => {
            try {
                if (row.validationStatus) {
                    return <span>{row.validationStatus}</span>;
                } else {
                    return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : 'FAILED'}</span>;
                }
            } catch (error) {
                console.error(error)
            }
        },
        disableFilters: true,
    },
    {
        Header: "Validation Remarks",
        accessor: row => {
            try {
                let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
                let remarks = validateRemark?.split("-")?.filter(x => x?.trim() !== "");
                if (remarks?.length === 1) {
                    return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
                } else if (remarks?.length > 1) {
                    return (
                        remarks?.map((remark, idx) => (
                            <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                        ))
                    )
                } else {
                    return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
                }
            } catch (error) {
                console.log(error);
            }
        },
        disableFilters: true,
    }

];
export const ChargeMandatoryColumns = [
    ["Charge Name", "Charge Category", "Service Type"],
    ["Charge Amount", "Currency", "GL Code", "Start Date"]
];

export const EntityTransactionMappingMandatoryColumns = [
    ["Operational Unit", "Department", "Role Name", "Product Family", "Product Type"],
    ["Product Sub Type", "Service Type", "Entity Type", "Transaction Category", "Transaction Type"]
]

export const EntityTransactionMappingTemplateColumns = [
    {
        Header: "Operational Unit",
        accessor: "operationalUnit",
        disableFilters: true,
        id: "operationalUnit"
    },
    {
        Header: "Department",
        accessor: "department",
        disableFilters: true,
        id: "department"
    },
    {
        Header: "Role Name",
        accessor: "roleName",
        disableFilters: true,
        id: "roleName"
    },
    {
        Header: "Product Family",
        accessor: "productFamily",
        disableFilters: true,
        id: "productFamily"
    },
    {
        Header: "Product Type",
        accessor: "productType",
        disableFilters: true,
        id: "productType"
    },
    {
        Header: "Product Sub Type",
        accessor: "productSubType",
        disableFilters: true,
        id: "productSubType"
    },
    {
        Header: "Service Type",
        accessor: "serviceType",
        disableFilters: true,
        id: "serviceType"
    },
    {
        Header: "Entity Type",
        accessor: "entityType",
        disableFilters: true,
        id: "entityType"
    },
    {
        Header: "Transaction Category",
        accessor: "transactionCategory",
        disableFilters: true,
        id: "transactionCategory"
    },
    {
        Header: "Transaction Type",
        accessor: "transactionType",
        disableFilters: true,
        id: "transactionType"
    },
    {
        Header: "Validation Status",
        // accessor: "validationStatus",
        accessor: row => {
            try {
                if (row.validationStatus) {
                    return <span>{row.validationStatus}</span>;
                } else {
                    return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : 'FAILED'}</span>;
                }
            } catch (error) {
                console.error(error)
            }
        },
        disableFilters: true,
    },
    {
        Header: "Validation Remarks",
        accessor: row => {
            try {
                let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
                let remarks = validateRemark?.split("-")?.filter(x => x?.trim() !== "");
                if (remarks?.length === 1) {
                    return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
                } else if (remarks?.length > 1) {
                    return (
                        remarks?.map((remark, idx) => (
                            <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                        ))
                    )
                } else {
                    return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
                }
            } catch (error) {
                console.log(error);
            }
        },
        disableFilters: true,
    }
]

export const BusinessUnitsMandatoryColumns = [
    ["Unit Name", "Unit Description", "Unit Type", "Parent Unit Name (Required when Unit Type is OU or DEPT)", "Role Name (Required when Unit Type is OU or DEPT)"]
]

export const BusinessUnitsTemplateColumns = [
    {
        Header: "Unit Name",
        accessor: "unitName",
        disableFilters: true,
        id: "unitName"
    },
    {
        Header: "Unit Description",
        accessor: "unitDesc",
        disableFilters: true,
        id: "unitDesc"

    }, {
        Header: "Unit Type",
        accessor: "unitType",
        disableFilters: true,
        id: "unitType"
    }, {
        Header: "Parent Unit Name",
        accessor: "parentUnit",
        disableFilters: true,
        id: "parentUnit"
    }, {
        Header: "Role Name",
        accessor: "roleName",
        disableFilters: true,
        id: "roleName"
    },
    {
        Header: "Validation Status",
        // accessor: "validationStatus",
        accessor: row => {
            try {
                if (row.validationStatus) {
                    return <span>{row.validationStatus}</span>;
                } else {
                    return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : 'FAILED'}</span>;
                }
            } catch (error) {
                console.error(error)
            }
        },
        disableFilters: true,
    },
    {
        Header: "Validation Remarks",
        accessor: "validationRemark",
        disableFilters: true,
    }
]


export const CalenderMandatoryColumns = [["Calendar Name", "Calendar Description", "Start Date", "End Date", "Status"]]

export const CalenderTemplateColumns = [{
    Header: "Calendar Name",
    accessor: "calendarName",
    disableFilters: true,
    id: "calendarName"
}, {
    Header: "Calendar Description",
    accessor: "calendarDescription",
    disableFilters: true,
    id: "calendarDescription"
}, {
    Header: "Start Date",
    accessor: "startDate",
    disableFilters: true,
    id: "startDate"
}, {
    Header: "End Date",
    accessor: "endDate",
    disableFilters: true,
    id: "endDate"
}, {
    Header: "Status",
    accessor: "status",
    disableFilters: true,
    id: "Status"
}, {
    Header: "Validation Status",
    // accessor: "validationStatus",
    accessor: row => {
        try {
            if (row.validationStatus) {
                return <span>{row.validationStatus}</span>;
            } else {
                return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : ''}</span>;
            }
        } catch (error) {
            console.error(error)
        }
    },
    disableFilters: true,
},
{
    Header: "Validation Remarks",
    accessor: row => {
        try {
            let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
            let remarks = validateRemark?.split("-")?.filter(x => x?.trim() !== "");
            if (remarks?.length === 1) {
                return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
            } else if (remarks?.length > 1) {
                return (
                    remarks?.map((remark, idx) => (
                        <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                    ))
                )
            } else {
                return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
            }
        } catch (error) {
            console.log(error);
        }
    },
    disableFilters: true,
}]

export const ShiftMandatoryColumns = [["Shift Short Name", "Shift Description", "Start Time", "End Time", "Status", "Calendar Name"]]

export const ShiftTemplateColumns = [
    {
        Header: "Shift Short Name",
        accessor: "shiftShortName",
        disableFilters: true,
        id: "shiftShortName"
    }, {
        Header: "Shift Description",
        accessor: "shiftDescription",
        disableFilters: true,
        id: "shiftDescription"
    }, {
        Header: "Start Time",
        accessor: "shiftStartTime",
        disableFilters: true,
        id: "startTime"
    }, {
        Header: "End Time",
        accessor: "shiftEndTime",
        disableFilters: true,
        id: "endTime"
    }, {
        Header: "Status",
        accessor: "status",
        disableFilters: true,
        id: "status"
    }, {
        Header: "Calendar Name",
        accessor: "calendarName",
        disableFilters: true,
        id: "calendarName"
    }, {
        Header: "Validation Status",
        // accessor: "validationStatus",
        accessor: row => {
            try {
                if (row.validationStatus) {
                    return <span>{row.validationStatus}</span>;
                } else {
                    return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : ''}</span>;
                }
            } catch (error) {
                console.error(error)
            }
        },
        disableFilters: true,
    }, {
        Header: "Validation Remarks",
        accessor: row => {
            try {
                let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
                let remarks = validateRemark?.split("--sptr--")?.filter(x => x?.trim() !== "");
                if (remarks?.length === 1) {
                    return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
                } else if (remarks?.length > 1) {
                    return (
                        remarks?.map((remark, idx) => (
                            <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                        ))
                    )
                } else {
                    return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
                }
            } catch (error) {
                console.log(error);
            }
        },
        disableFilters: true,
    }]

export const SkillTemplateColumns = [
    {
        Header: "Skill Description",
        accessor: "skillDescription",
        disableFilters: true,
        id: "skillDescription",
    },
    {
        Header: "Service Category",
        accessor: "serviceCategory",
        disableFilters: true,
        id: "serviceCategory",
    },
    {
        Header: "Service Type",
        accessor: "serviceType",
        disableFilters: true,
        id: "serviceType",
    },
    {
        Header: "Entity Name",
        accessor: "entityName",
        disableFilters: true,
        id: "entityName",
    },

    {
        Header: "Entity Category",
        accessor: "entityCategory",
        disableFilters: true,
        id: "entityCategory",
    },
    {
        Header: "Entity Type",
        accessor: "entityType",
        disableFilters: true,
        id: "entityType",
    },
    {
        Header: "Validation Status",
        // accessor: "validationStatus",
        accessor: row => {
            try {
                if (row.validationStatus) {
                    return <span>{row.validationStatus}</span>;
                } else {
                    return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : 'FAILED'}</span>;
                }
            } catch (error) {
                console.error(error)
            }
        },
        disableFilters: true,
    },
    {
        Header: "Validation Remarks",
        accessor: row => {
            try {
                let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
                let remarks = validateRemark?.split("--sptr--")?.filter(x => x?.trim() !== "");
                if (remarks?.length === 1) {
                    return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
                } else if (remarks?.length > 1) {
                    return (
                        remarks?.map((remark, idx) => (
                            <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                        ))
                    )
                } else {
                    return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
                }
            } catch (error) {
                console.log(error);
            }
        },
        disableFilters: true,
    }
];
export const SkillMandatoryColumns = [
    ['Skill Description', 'Service Category', 'Service Type'],
    ['Entity Name', 'Entity Category', 'Entity Type'],
];

export const HolidayCalenderMandatoryColumns = [["Calendar Name", "Holiday Day Name", "Holiday Description", "Holiday Date", "Holiday Type"]]

export const HolidayCalenderTemplateColumns = [
    {
        Header: "Calendar Name",
        accessor: "calendarName",
        disableFilters: true,
        id: "calendarName"
    },
    {
        Header: "Holiday Day Name",
        accessor: "holidayDayName",
        disableFilters: true,
        id: "holidayDayName"
    },
    {
        Header: "Holiday Description",
        accessor: "holidayDescription",
        disableFilters: true,
        id: "holidayDescription"
    }, {
        Header: "Holiday Date",
        accessor: "holidayDate",
        disableFilters: true,
        id: "holidayDate"
    },
    {
        Header: "Holiday Type",
        accessor: "holidayType",
        disableFilters: true,
        id: "holidayType"
    },
    {
        Header: "Validation Status",
        accessor: row => {
            try {
                if (row.validationStatus) {
                    return <span>{row.validationStatus}</span>;
                } else {
                    return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESSSSS' : ''}</span>;
                }
            } catch (error) {
                console.error(error)
            }
        },
        disableFilters: true,
    },
    {
        Header: "Validation Remarks",
        accessor: row => {
            try {
                let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
                let remarks = validateRemark?.split("--sptr--")?.filter(x => x?.trim() !== "");
                if (remarks?.length === 1) {
                    return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
                } else if (remarks?.length > 1) {
                    return (
                        remarks?.map((remark, idx) => (
                            <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                        ))
                    )
                } else {
                    return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
                }
            } catch (error) {
                console.log(error);
            }
        },
        disableFilters: true,
    }]

export const UserSkillTemplateColumns = [
    {
        Header: "Skill Description",
        accessor: "skillDescription",
        disableFilters: true,
        id: "skillDescription",
    },
    {
        Header: "Email Id",
        accessor: "emailId",
        disableFilters: true,
        id: "emailId",
    },
    {
        Header: "Validation Status",
        accessor: row => {
            try {
                if (row.validationStatus) {
                    return <span>{row.validationStatus}</span>;
                } else {
                    return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : 'FAILED'}</span>;
                }
            } catch (error) {
                console.error(error)
            }
        },
        disableFilters: true,
    },
    {
        Header: "Validation Remarks",
        accessor: row => {
            try {
                let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
                let remarks = validateRemark?.split("--sptr--")?.filter(x => x?.trim() !== "");
                if (remarks?.length === 1) {
                    return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
                } else if (remarks?.length > 1) {
                    return (
                        remarks?.map((remark, idx) => (
                            <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                        ))
                    )
                } else {
                    return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
                }
            } catch (error) {
                console.log(error);
            }
        },
        disableFilters: true,
    }
];
export const UserSkillMandatoryColumns = [
    ['Skill Description', 'Email Id'],
];

export const AppointmentMandatoryColumns = [
    ["Appointment Name", "Appointment Type", "User Group", "Template Name", "Notification Name", "Calender Name"],
    ["Shift Name", "Working Type", "Appointment Date", "Appointment Start Time", "Appointment End Time", "User Email Id"]]

export const AppointmentTemplateColumns = [{
    Header: "Appointment Name",
    accessor: "appointmentName",
    disableFilters: true,
    id: "appointmentName",
}, {
    Header: "Appointment Type",
    accessor: "appointmentType",
    disableFilters: true,
    id: "appointmentType",
}, {
    Header: "User Group",
    accessor: "userGroup",
    disableFilters: true,
    id: "userGroup",
}, {
    Header: "Template Name",
    accessor: "templateName",
    disableFilters: true,
    id: "templateName",
}, {
    Header: "Event Type",
    accessor: "eventType",
    disableFilters: true,
    id: "eventType",
},
{
    Header: "Notification Name",
    accessor: "notificationName",
    disableFilters: true,
    id: "notificationName",
}, {
    Header: "Location",
    accessor: "locations",
    disableFilters: true,
    id: "locations",
}, {
    Header: "Calender Name",
    accessor: "calenderName",
    disableFilters: true,
    id: "calenderName",
}, {
    Header: "Shift Name",
    accessor: "shiftName",
    disableFilters: true,
    id: "shiftName",
}, {
    Header: "Working Type",
    accessor: "workingType",
    disableFilters: true,
    id: "workingType",
}, {
    Header: "Appointment Date",
    accessor: "appointmentDate",
    disableFilters: true,
    id: "appointmentDate",
}, {
    Header: "Appointment Start Time",
    accessor: "appointmentStartTime",
    disableFilters: true,
    id: "appointmentStartTime",
}, {
    Header: "Appointment End Time",
    accessor: "appointmentEndTime",
    disableFilters: true,
    id: "appointmentEndTime",
}, {
    Header: "User Name",
    accessor: "userName",
    disableFilters: true,
    id: "userName",
}, {
    Header: "User Email Id",
    accessor: "userEmailid",
    disableFilters: true,
    id: "userEmailid",
}, {
    Header: "Validation Status",
    // accessor: "validationStatus",
    accessor: row => {
        try {
            if (row.validationStatus) {
                return <span>{row.validationStatus}</span>;
            } else {
                return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : ''}</span>;
            }
        } catch (error) {
            console.error(error)
        }
    },
    disableFilters: true,
},
{
    Header: "Validation Remarks",
    accessor: row => {
        try {
            let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
            let remarks = validateRemark?.split("--sptr--")?.filter(x => x?.trim() !== "");
            if (remarks?.length === 1) {
                return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
            } else if (remarks?.length > 1) {
                return (
                    remarks?.map((remark, idx) => (
                        <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                    ))
                )
            } else {
                return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
            }
        } catch (error) {
            console.log(error);
        }
    },
    disableFilters: true,
}]

export const contractMandatoryColumns = [["Status", "Contract Start Date", "Product Name", "Product Description", "Billing Start Date", "Consumption Base Product", "Consumption Type", "Charge Type"],
["Unit Price", "Total Product Charge Amount", "Balance Amount", "Duration", "Frequency", "Quantity", "Advance Flag"]]

export const contractTemplateColumns = [{
    Header: "Billing Contract Ref Number",
    accessor: "billingContractRefNumber",
    disableFilters: true,
    id: "billingContractRefNumber",
}, {
    Header: "Order Number",
    accessor: "orderNumber",
    disableFilters: true,
    id: "orderNumber",
}, {
    Header: "Status",
    accessor: "status",
    disableFilters: true,
    id: "status",
}, {
    Header: "Reason",
    accessor: "reason",
    disableFilters: true,
    id: "reason",
}, {
    Header: "Contract Start Date",
    accessor: "contractStartDate",
    disableFilters: true,
    id: "contractStartDate",
}, {
    Header: "Product Name",
    accessor: "productName",
    disableFilters: true,
    id: "productName",
}, {
    Header: "Product Description",
    accessor: "productDescription",
    disableFilters: true,
    id: "productDescription",
}, {
    Header: "Billing Start Date",
    accessor: "billingStartDate",
    disableFilters: true,
    id: "billingStartDate",
}, {
    Header: "Consumption Base Product",
    accessor: "consumptionBaseProduct",
    disableFilters: true,
    id: "consumptionBaseProduct",
}, {
    Header: "Consumption Type",
    accessor: "consumptionType",
    disableFilters: true,
    id: "consumptionType",
}, {
    Header: "Charge Type",
    accessor: "chargeType",
    disableFilters: true,
    id: "chargeType",
}, {
    Header: "Geo Location",
    accessor: "geoLocation",
    disableFilters: true,
    id: "geoLocation",
}, {
    Header: "Unit Price",
    accessor: "unitPrice",
    disableFilters: true,
    id: "unitPrice",
}, {
    Header: "Total Product Charge Amount",
    accessor: "totalProductChargeAmount",
    disableFilters: true,
    id: "totalProductChargeAmount",
}, {
    Header: "Balance Amount",
    accessor: "balanceAmount",
    disableFilters: true,
    id: "balanceAmount",
}, {
    Header: "Duration",
    accessor: "duration",
    disableFilters: true,
    id: "duration",
}, {
    Header: "Frequency",
    accessor: "frequency",
    disableFilters: true,
    id: "frequency",
}, {
    Header: "Quantity",
    accessor: "quantity",
    disableFilters: true,
    id: "quantity",
}, {
    Header: "Advance Flag",
    accessor: "advanceFlag",
    disableFilters: true,
    id: "advanceFlag",
}, {
    Header: "Credit Adjustment Amount",
    accessor: "creditAdjustmentAmount",
    disableFilters: true,
    id: "creditAdjustmentAmount",
}, {
    Header: "Debit Adjustment Amount",
    accessor: "debitAdjustmentAmount",
    disableFilters: true,
    id: "appointmentType",
}, {
    Header: "Advance Payment Allocation",
    accessor: "advancePaymentAllocation",
    disableFilters: true,
    id: "advancePaymentAllocation",
}, {
    Header: "Allocation Percentage",
    accessor: "allocationPercentage",
    disableFilters: true,
    id: "allocationPercentage"
}, {
    Header: "Validation Status",
    // accessor: "validationStatus",
    accessor: row => {
        try {
            if (row.validationStatus) {
                return <span>{row.validationStatus}</span>;
            } else {
                return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : ''}</span>;
            }
        } catch (error) {
            console.error(error)
        }
    },
    disableFilters: true,
},
{
    Header: "Validation Remarks",
    accessor: row => {
        try {
            let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
            let remarks = validateRemark?.split("--sptr--")?.filter(x => x?.trim() !== "");
            if (remarks?.length === 1) {
                return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
            } else if (remarks?.length > 1) {
                return (
                    remarks?.map((remark, idx) => (
                        <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                    ))
                )
            } else {
                return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
            }
        } catch (error) {
            console.log(error);
        }
    },
    disableFilters: true,
}]

export const invoiceMandatoryColumns = [["Invoice Ref Number", "Invoice Detail Ref Number", "Invoice Date", "Due Date", "Status", "Customer Reference No", "Order Reference Number"],
["Contract Reference Number", "Product Name", "Invoice Details Start Date", "Invoice Details End Date", "Quantity", "Invoice Detail Amount", "Invoice Detail OS Amount"]]

export const invoiceTemplateColumns = [{
    Header: "Invoice Ref Number",
    accessor: "invoiceRefNumber",
    disableFilters: true,
    id: "invoiceRefNumber"
}, {
    Header: "Invoice Detail Ref Number",
    accessor: "invoiceDetailRefNumber",
    disableFilters: true,
    id: "invoiceDetailRefNumber"
}, {
    Header: "Invoice Date",
    accessor: "invoiceDate",
    disableFilters: true,
    id: "invoiceDate"
}, {
    Header: "Due Date",
    accessor: "dueDate",
    disableFilters: true,
    id: "dueDate"
}, {
    Header: "Status",
    accessor: "status",
    disableFilters: true,
    id: "status"
}, {
    Header: "Reason",
    accessor: "reason",
    disableFilters: true,
    id: "reason"
}, {
    Header: "Customer Reference No",
    accessor: "customerRefNo",
    disableFilters: true,
    id: "customerRefNo"
}, {
    Header: "Email ID",
    accessor: "emailid",
    disableFilters: true,
    id: "emailid"
}, {
    Header: "Order Reference Number",
    accessor: "orderRefNo",
    disableFilters: true,
    id: "orderRefNo"
}, {
    Header: "Contract Reference Number",
    accessor: "contractRefNo",
    disableFilters: true,
    id: "contractRefNo"
}, {
    Header: "Product Name",
    accessor: "productName",
    disableFilters: true,
    id: "productName"
}, {
    Header: "Product Description",
    accessor: "productDescription",
    disableFilters: true,
    id: "productDescription"
}, {
    Header: "Invoice Details Start Date",
    accessor: "invoiceDetailsStartDate",
    disableFilters: true,
    id: "invoiceDetailsStartDate"
}, {
    Header: "Invoice Details End Date",
    accessor: "invoiceDetailsEndDate",
    disableFilters: true,
    id: "invoiceDetailsEndDate"
}, {
    Header: "Quantity",
    accessor: "quantity",
    disableFilters: true,
    id: "quantity"
}, {
    Header: "Credit Adjustment",
    accessor: "creditAdjAmount",
    disableFilters: true,
    id: "creditAdjAmount"
}, {
    Header: "Debit Adjustment",
    accessor: "debitAdjAmount",
    disableFilters: true,
    id: "debitAdjAmount"
}, {
    Header: "Invoice Detail Amount",
    accessor: "invoiceDetailAmount",
    disableFilters: true,
    id: "invoiceDetailAmount"
}, {
    Header: "Invoice Detail OS Amount",
    accessor: "invoiceDetailOsAmount",
    disableFilters: true,
    id: "invoiceDetailOsAmount"
}, {
    Header: "Validation Status",
    // accessor: "validationStatus",
    accessor: row => {
        try {
            if (row.validationStatus) {
                return <span>{row.validationStatus}</span>;
            } else {
                return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : ''}</span>;
            }
        } catch (error) {
            console.error(error)
        }
    },
    disableFilters: true,
},
{
    Header: "Validation Remarks",
    accessor: row => {
        try {
            let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
            let remarks = validateRemark?.split("--sptr--")?.filter(x => x?.trim() !== "");
            if (remarks?.length === 1) {
                return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
            } else if (remarks?.length > 1) {
                return (
                    remarks?.map((remark, idx) => (
                        <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                    ))
                )
            } else {
                return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
            }
        } catch (error) {
            console.log(error);
        }
    },
    disableFilters: true,
}]

export const paymentMandatoryColumns = [["Payment Ref Number", "Customer Reference No", "Invoice Detail Ref Number", "Invoice Ref Number"],
["Status", "Payment Amount", "Payment Date", "Invoice Detail Amount"]]

export const paymentTemplateColumns = [{
    Header: "Payment Ref Number",
    accessor: "paymentRefNumber",
    disableFilters: true,
    id: "paymentRefNumber"
}, {
    Header: "Customer Reference No",
    accessor: "customerRefNumber",
    disableFilters: true,
    id: "customerRefNumber"
}, {
    Header: "Invoice Ref Number",
    accessor: "invoiceRefNumber",
    disableFilters: true,
    id: "invoiceRefNumber"
}, {
    Header: "Invoice Detail Ref Number",
    accessor: "invoiceDetailRefNumber",
    disableFilters: true,
    id: "invoiceDetailRefNumber"
}, {
    Header: "Status",
    accessor: "status",
    disableFilters: true,
    id: "status"
}, {
    Header: "Reason",
    accessor: "reason",
    disableFilters: true,
    id: "reason"
}, {
    Header: "Currency",
    accessor: "currency",
    disableFilters: true,
    id: "currency"
}, {
    Header: "Payment Mode",
    accessor: "paymentMode",
    disableFilters: true,
    id: "paymentMode"
}, {
    Header: "Payment Mode if Others",
    accessor: "paymentModeIfOth",
    disableFilters: true,
    id: "paymentModeIfOth"
}, {
    Header: "Payment Amount",
    accessor: "paymentAmount",
    disableFilters: true,
    id: "paymentAmount"
}, {
    Header: "Payment Date",
    accessor: "paymentDate",
    disableFilters: true,
    id: "paymentDate"
}, {
    Header: "Payment Location",
    accessor: "paymentLocation",
    disableFilters: true,
    id: "paymentLocation"
}, {
    Header: "Invoice Detail Amount",
    accessor: "invoiceDetailAmount",
    disableFilters: true,
    id: "invoiceDetailAmount"
}, {
    Header: "Validation Status",
    // accessor: "validationStatus",
    accessor: row => {
        try {
            if (row.validationStatus) {
                return <span>{row.validationStatus}</span>;
            } else {
                return <span>{row.validationFlag ? row.validationFlag === 'N' ? 'FAILED' : 'SUCCESS' : ''}</span>;
            }
        } catch (error) {
            console.error(error)
        }
    },
    disableFilters: true,
},
{
    Header: "Validation Remarks",
    accessor: row => {
        try {
            let validateRemark = row.validationRemark ? row.validationRemark : row.validationRemarks
            let remarks = validateRemark?.split("--sptr--")?.filter(x => x?.trim() !== "");
            if (remarks?.length === 1) {
                return <span style={{ textAlign: 'left', display: 'block' }}>{remarks[0]?.trim()}</span>;
            } else if (remarks?.length > 1) {
                return (
                    remarks?.map((remark, idx) => (
                        <span style={{ textAlign: 'left', display: 'block' }}>{`${idx + 1}.) ${remark}`}<br /></span>
                    ))
                )
            } else {
                return <span>{row.validationRemark ? row.validationRemark : row.validationRemarks}</span>;
            }
        } catch (error) {
            console.log(error);
        }
    },
    disableFilters: true,
}]