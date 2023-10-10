import React, { useCallback, useEffect, useRef, useState } from 'react'
import { NumberFormatBase } from 'react-number-format';
import { hideSpinner, showSpinner } from '../../common/spinner';
import DynamicTable from '../../common/table/DynamicTable';
import { properties } from '../../properties';
import { post } from '../../common/util/restUtil';
import { validateNumber } from '../../common/util/validateUtil';
import { RecordExtractorColumns } from './BulkUploadColumns';
import moment from 'moment';
import { formFilterObject } from '../../common/util/util';
import { unstable_batchedUpdates } from 'react-dom';
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import SearchExcelViewUploadDataModal from './SearchExcelViewlUploadDataModal';
import { toast } from 'react-toastify';


const SearchBulkUpload = (props) => {

    const options = [
        { label: "Charge", value: "CHARGE" },
        { label: "Interaction", value: "INTERACTION" },
        { label: "Customer", value: "CUSTOMER" },
        { label: "Interaction", value: "INTERACTION" },
        { label: "Order", value: "ORDER" },
        { label: "Product", value: "PRODUCT" },
        { label: "Profile", value: "PROFILE" },
        { label: "Request Statement", value: "REQUEST_STATEMENT" },
        { label: "Service", value: "SERVICE" },
        { label: "User", value: "USERS" },
        { label: "Entity Transaction Mapping", value: "ENTITY_TRANSACTION_MAPPING" },
        { label: "Business Units", value: "BUSINESS_UNITS" },
        { label: "Calender", value: "CALENDAR" },
        { label: "Skill", value: "SKILL" },
        { label: "User Skill Mapping", value: "USER_SKILL" },
        { label: "Holiday Calender", value: "HOLIDAY_CALENDAR" },
        { label: "Appointment", value: "APPOINTMENT" },
        { label: "Contract", value: "CONTRACT" },
        { label: "Invoice", value: "INVOICE" },
        { label: "Payment", value: "PAYMENT" }

        // { label: "Customer Contract", value: "CUSTOMER CONTRACT" }, 
        // { label: "Billing Contract", value: "BILLING CONTRACT" },
        // { label: "Incident", value: "INCIDENT" }, 
        // { label: "Invoice", value: "INVOICE" }, 
        // { label: "Sales Order", value: "SALES ORDER" }
    ]


    const helperValues = {
        RecordExtractor: {
            title: 'Record Extractor',
            tableColumns: RecordExtractorColumns
        }
    }

    const initialValues = {
        processId: "",
        uploadType: "",
        uploadedBy: "",
        uploadedDate: ""
    };

    const [searchInputs, setSearchInputs] = useState(initialValues);
    const [entityTypes, setEntityTypes] = useState({
        uploadType: []
    });
    const [downloadRowData, setDownloadRowData] = useState([]);
    const [tableRowData, setTableRowData] = useState([]);
    const [displayForm, setDisplayForm] = useState(true);
    const [isOpen, setIsOpen] = useState(false);
    const modalViewData = useRef({});

    const isFirstRender = useRef(true);
    const [totalCount, setTotalCount] = useState(0);
    const [downloadTotalCount, setDownloadTotalCount] = useState(0);
    const [listSearch, setListSearch] = useState([]);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(true)

    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);

    const getEntityLookup = useCallback(() => {

    }, [])

    const getExtractedRecordList = useCallback(() => {
        showSpinner();
        const requestBody = {
            ...searchInputs,
            filters: formFilterObject(filters)
        }
        setListSearch(requestBody);

        post(`${properties.BULK_UPLOAD_API}/search?limit=${perPage}&page=${currentPage}`, requestBody)
            .then((response) => {
                const { status, data } = response;
                if (Number(response?.data?.count) > 0) {
                    if (status === 200) {
                        setTotalCount(data.count)
                        setTableRowData(data.rows);
                    }
                } else {
                    toast.error('Record Not Found')
                    // setFilters([])
                    // if (filters.length == 0) {
                    //     setAccountList([])
                    // }
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally(hideSpinner)
    }, [currentPage, filters, perPage])

    useEffect(() => {
        if (!isFirstRender.current) {
            getExtractedRecordList();
        }
        else {
            isFirstRender.current = false
            getEntityLookup();
        }
    }, [currentPage, perPage, getEntityLookup, getExtractedRecordList])

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Uploaded By") {
            return (<span>{`${cell?.row?.original?.createdByUser?.firstName || '-'} ${cell?.row?.original?.createdByUser?.lastName || '-'}`}</span>)
        }
        // else if (cell.column.Header === "Upload Type") {
        //     return (
        //         <span className="text-capitalize"> {row?.original?.bulkUploadTypeDescription?.description || row?.original?.bulkUploadType}</span>
        //     )
        // }
        else if (["Uploaded Date and Time", "Successfully Uploaded"].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>)
        }
        else if (cell.column.Header === "Action") {
            return (
                <>
                    <button type="button" className="skel-btn-submit" onClick={() => handleOnView(row?.original)}>
                        <i className="mdi mdi-eye  ml-0 mr-2 font-10 vertical-middle" />
                        View
                    </button>
                    <button type="button" className="btn btn-outline-primary waves-effect waves-light btn-sm" onClick={() => handleOnDownload(row?.original)}>
                        <i className={`mdi ${['CALL_COLLECTION'].includes(row?.original?.bulkUploadType) ? 'mdi-download-multiple' : 'mdi-download'}   ml-0 mr-2 font-10 vertical-middle`} />
                        Download
                    </button>
                </>
            )
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    const handleOnView = (row) => {
        console.log(row);
        modalViewData.current = row;
        console.log(modalViewData.current)
        setIsOpen(true);
    }

    const handleOnDownload = (row) => {
        try {
            const { uploadTableName, uploadFileName, bulkUploadId } = row;
            let requestBody = {
                bulkuploadId: bulkUploadId,
                type: uploadTableName,
            }
            post(`${properties.BULK_UPLOAD_API}/details`, requestBody)
                .then((response) => {
                    const { status, data } = response;
                    if (status === 200) {
                        setDownloadTotalCount(data.count)
                        setDownloadRowData(data.rows);
                    }
                }).catch(error => {
                    console.error(error);
                }).finally()
            showSpinner()
            let tableData1 = [];
            let tableData2 = [];
            if (uploadTableName === 'CHARGE') {
                downloadRowData?.forEach(element => {
                    let objConstruct = {}
                    objConstruct["Charge Name"] = element.chargeName
                    objConstruct["Charge Category"] = element.chargeCategory
                    objConstruct["Service Type"] = element.serviceType
                    objConstruct["currency"] = element.currency
                    objConstruct["Charge Amount"] = element.chargeAmount
                    // objConstruct["Advance Charge"] = element.advanceCharge
                    objConstruct["GL Code"] = element.glCode
                    objConstruct["Start Date"] = element.startDate
                    objConstruct["End Date"] = element.endDate

                    tableData1.push(objConstruct);
                })
                createExcel(`${uploadTableName}_Outstanding`, tableData1, uploadFileName)
            } else if (uploadTableName === 'USERS') {
                downloadRowData?.forEach(element => {
                    let objConstruct = {}
                    objConstruct["First Name"] = element.firstName
                    objConstruct["Last Name"] = element.lastName
                    objConstruct["Gender"] = element.gender
                    objConstruct["Email"] = element.emailId
                    objConstruct["Date of Birth"] = element.birthDate
                    objConstruct["User Category"] = element.userCategory
                    objConstruct["User Type"] = element.userType
                    objConstruct["User Family"] = element.userFamily
                    objConstruct["Country"] = element.country
                    objConstruct["Contact Prefix"] = element.mobilePrefix
                    objConstruct["Contact Number"] = element.mobileNo
                    objConstruct["Location"] = element.userLocation
                    objConstruct["Manager Email"] = element.managerEmail
                    objConstruct["Projects"] = element.projects
                    objConstruct["Notification Type"] = element.notificationType
                    objConstruct["BI Access Key"] = element.biAccessKey
                    objConstruct["BI Access"] = element.biAccess
                    objConstruct["Role Name"] = element.roleName
                    tableData1.push(objConstruct);
                })
                createExcel(`${uploadTableName}_Outstanding`, tableData1, uploadFileName)
            } else if (uploadTableName === 'CUSTOMER') {
                downloadRowData?.forEach(element => {
                    let objConstruct = {}
                    objConstruct["Customer Reference No"] = element.customerRefNo
                    objConstruct["First Name"] = element.firstName
                    objConstruct["Last Name"] = element.lastName
                    objConstruct["Title"] = element.title
                    objConstruct["Customer Category"] = element.customerCategory
                    objConstruct["Department"] = element.department
                    objConstruct["Projects"] = element.projects
                    objConstruct["Customer Class"] = element.customerClass
                    objConstruct["Martial Status"] = element.customerMaritalStatus
                    objConstruct["Occupation"] = element.occupation
                    objConstruct["Gender"] = element.gender
                    objConstruct["Email ID"] = element.emailId
                    objConstruct["Mobile Prefix"] = element.mobilePrefix
                    objConstruct["Mobile No"] = element.mobileNo
                    objConstruct["DOB"] = element.birthDate
                    objConstruct["ID Type"] = element.idType
                    objConstruct["ID Value"] = element.idValue
                    objConstruct["Nationality"] = element.nationality
                    objConstruct["Contact Preferences"] = element.contactPreference
                    objConstruct["Registeration No"] = element.registeredNo
                    objConstruct["Registeration Date"] = element.registeredDate
                    objConstruct["Address Type"] = element.addressType
                    objConstruct["Address 1"] = element.address1
                    objConstruct["Address 2"] = element.address2
                    objConstruct["Address 3"] = element.address3
                    objConstruct["City"] = element.city
                    objConstruct["District"] = element.district
                    objConstruct["State"] = element.state
                    objConstruct["Country"] = element.country
                    objConstruct["Post code"] = element.postcode
                    objConstruct["Latitude"] = element.latitude
                    objConstruct["Longitude"] = element.longitude
                    objConstruct["Telephone No Prefix"] = element.telephonePrefix
                    objConstruct["Telephone No"] = element.telephoneNo
                    objConstruct["WhatsApp No Prefix"] = element.whatsappNoPrefix
                    objConstruct["WhatsApp Number"] = element.whatsappNo
                    objConstruct["FAX"] = element.fax
                    objConstruct["Facebook Id"] = element.facebookId
                    objConstruct["Instagram Id"] = element.instagramId
                    objConstruct["Telegram Id"] = element.telegramId
                    objConstruct["Status"] = element?.status

                    tableData1.push(objConstruct);
                })
                createExcel(`${uploadTableName}_Outstanding`, tableData1, uploadFileName)
            } else if (uploadTableName === 'ORDER') {
                downloadRowData?.forEach(element => {
                    let objConstruct = {}
                    objConstruct["Order Reference No"] = element.orderRefNo
                    objConstruct["Order Date"] = element.orderDate
                    objConstruct["Customer Name"] = element.customerName
                    objConstruct["Service Name"] = element.serviceName
                    objConstruct["Email ID"] = element.emailId
                    objConstruct["Order Category"] = element.orderCategory
                    objConstruct["Order Source"] = element.orderSource
                    objConstruct["Order Channel"] = element.orderChannel
                    objConstruct["Order Family"] = element.orderFamily
                    objConstruct["Order Mode Type"] = element.orderMode
                    objConstruct["Order Delivery Mode"] = element.orderDeliveryMode
                    objConstruct["Service Category"] = element.serviceCategory
                    objConstruct["Service Type"] = element.serviceType
                    objConstruct["Order Priority"] = element.orderPriority
                    objConstruct["Order Description"] = element.orderDescription
                    objConstruct["Product Name"] = element.productName
                    objConstruct["Quantity"] = element.productQuantity
                    objConstruct["Bill Amount"] = element.billAmount
                    objConstruct["Product Reference No"] = element.productRefNo
                    objConstruct["Delivery Location"] = element.deliveryLocation
                    objConstruct["EDOC"] = element.edoc
                    objConstruct["Contact Preference"] = element.contactPreference
                    objConstruct["Created Department"] = element.createdDept
                    objConstruct["Current Department"] = element.currDept
                    objConstruct["Created Role"] = element.createdRole
                    objConstruct["Current Role"] = element.currRole
                    objConstruct["Current User"] = element.currUser
                    objConstruct["Request Statement"] = element.requestStatement
                    objConstruct["Address Type"] = element.addressType
                    objConstruct["Address 1"] = element.address1
                    objConstruct["Address 2"] = element.address2
                    objConstruct["Address 3"] = element.address3
                    objConstruct["City"] = element.city
                    objConstruct["District"] = element.district
                    objConstruct["State"] = element.state
                    objConstruct["Post code"] = element.postcode
                    objConstruct["Country"] = element.country
                    objConstruct["Latitude"] = element.latitude
                    tableData1.push(objConstruct);
                })
                createExcel(`${uploadTableName}_Outstanding`, tableData1, uploadFileName)
            } else if (uploadTableName === 'INTERACTION') {
                downloadRowData?.forEach(element => {
                    let objConstruct = {}
                    objConstruct["Interaction Reference No"] = element.intxnRefNo
                    objConstruct["Customer Name"] = element.customerName
                    objConstruct["Service Name"] = element.serviceName
                    objConstruct["Service Ref No"] = element.serviceRefNo
                    objConstruct["Product Name"] = element.productName
                    objConstruct["Email ID"] = element.emailid
                    objConstruct["Mobile No"] = element.mobileNo
                    objConstruct["Interaction Category"] = element.intxnCategory
                    objConstruct["Interaction Type"] = element.intxnType
                    objConstruct["Service Category"] = element.serviceCategory
                    objConstruct["Service Type"] = element.serviceType
                    // objConstruct["Interaction Cause"] = element.intxnCause
                    objConstruct["Interaction Status"] = element.intxnStatus
                    objConstruct["Created Department"] = element.createdEntity
                    objConstruct["Current Department"] = element.currEntity
                    objConstruct["Created Role"] = element.createdRole
                    objConstruct["Current Role"] = element.currRole
                    objConstruct["Reason"] = element.status_reason
                    objConstruct["Interaction Workflow Sequence"] = element.intxnWorkflowSeq
                    objConstruct["Interaction  Workflow Status"] = element.intxnWorkflowStatus
                    objConstruct["From Department"] = element.fromEntity
                    objConstruct["From Role"] = element.fromRole
                    objConstruct["From User"] = element.fromUser
                    objConstruct["To Department"] = element.toEntity
                    objConstruct["To Role"] = element.toRole
                    objConstruct["Interaction Priority"] = element.intxnPriority
                    objConstruct["Interaction Channel"] = element.intxnChannel
                    objConstruct["Created Date"] = element.intxnCreatedDate
                    objConstruct["Assigned Date"] = element.assignedDate
                    objConstruct["Workflow Created Date"] = element.flwCreatedAt
                    objConstruct["Interaction Description"] = element.intxnDescription
                    objConstruct["Response Resolution"] = element.responseSolution
                    objConstruct["Address Type"] = element.addressType
                    objConstruct["Address 1"] = element.address1
                    objConstruct["Address 2"] = element.address2
                    objConstruct["City"] = element.city
                    objConstruct["District"] = element.district
                    objConstruct["State"] = element.state
                    objConstruct["Post code"] = element.postcode
                    objConstruct["Country"] = element.country
                    objConstruct["Current User"] = element.currUser
                    objConstruct["To User"] = element.toUser
                    objConstruct["Contact Preference"] = element.contactPreference
                    objConstruct["Request Statement"] = element.requestStatement
                    objConstruct["Is Followup"] = element.isFollowup
                    objConstruct["Remarks"] = element.remarks
                    objConstruct["Address 3"] = element.address3
                    objConstruct["Latitude"] = element.latitude
                    objConstruct["Longitude"] = element.longitude
                    tableData1.push(objConstruct);
                })
                createExcel(`${uploadTableName}_Outstanding`, tableData1, uploadFileName)
            } else if (uploadTableName === 'REQUEST_STATEMENT') {
                downloadRowData?.forEach(element => {
                    let objConstruct = {}
                    objConstruct["Interaction statement"] = element.intxnStatement
                    objConstruct["Interaction Category"] = element.intxnCategory
                    objConstruct["Interaction Type"] = element.intxnType
                    objConstruct["Service Category"] = element.serviceCategory
                    objConstruct["Service type"] = element.serviceType
                    objConstruct["Priority"] = element.priority
                    objConstruct["Interaction Statement Cause"] = element.intxnStatCause
                    objConstruct["Interaction Resolution"] = element.intxnResolution

                    tableData1.push(objConstruct);
                })
                createExcel(`${uploadTableName}_Outstanding`, tableData1, uploadFileName)
            } else if (uploadTableName === 'PRODUCT') {
                downloadRowData?.forEach(element => {
                    let objConstruct = {}

                    objConstruct["Product Name"] = element.productName
                    objConstruct["Product Family"] = element.productFamily
                    objConstruct["Product Category"] = element.productCategory
                    objConstruct["Product Sub Category"] = element.productSubCategory
                    objConstruct["Product Type"] = element.productType
                    objConstruct["Service Class"] = element.serviceClass
                    objConstruct["Product Sub Type"] = element.productSubType
                    objConstruct["Service Type"] = element.serviceType
                    objConstruct["Provisioning Type"] = element.provisioningType
                    objConstruct["Product Class"] = element.productClass
                    objConstruct["Bundle Name"] = element.prodBundleName
                    objConstruct["Charge Name"] = element.chargeName
                    // objConstruct["Advance Charge"] = element.advanceCharge
                    // objConstruct["Upfront Charge"] = element.chargeUpfront
                    objConstruct["Frequency"] = element.frequency
                    // objConstruct["Prorated"] = element.prorated
                    objConstruct["Contract Availability"] = element.contractFlag
                    objConstruct["Contract Duration"] = element.contractInMonths
                    objConstruct["UOM"] = element.uomCategory
                    // objConstruct["GL Code"] = element.glcode
                    objConstruct["Activation Date"] = element.activationDate
                    objConstruct["Expiry Date"] = element.expiryDate
                    objConstruct["Is Appointment Required"] = element.isAppointRequired
                    objConstruct["Product Benefits"] = element.productBenefits

                    tableData1.push(objConstruct);
                })
                createExcel(`${uploadTableName}_Outstanding`, tableData1, uploadFileName)
            } else if (uploadTableName === 'PROFILE') {
                downloadRowData?.forEach(element => {
                    let objConstruct = {}
                    objConstruct["First Name"] = element.firstName
                    objConstruct["Last Name"] = element.lastName
                    objConstruct["Profile Category"] = element.profileCategory
                    objConstruct["Gender"] = element.gender
                    objConstruct["Email Id"] = element.emailId
                    objConstruct["Mobile Prefix"] = element.mobilePrefix
                    objConstruct["Mobile No"] = element.mobileNo
                    objConstruct["DOB"] = element.birthDate
                    objConstruct["ID Type"] = element.idType
                    objConstruct["ID Value"] = element.idValue
                    objConstruct["Registeration No"] = element.registeredNo
                    objConstruct["Registeration Date"] = element.registeredDate
                    objConstruct["Nationality"] = element.nationality
                    objConstruct["Contact Preferences"] = element.contactPreferences
                    objConstruct["Address Type"] = element.addressType
                    objConstruct["Address 1"] = element.address1
                    objConstruct["Address 2"] = element.address2
                    objConstruct["Address 3"] = element.address3
                    objConstruct["City"] = element.city
                    objConstruct["District"] = element.district
                    objConstruct["State"] = element.state
                    objConstruct["Post code"] = element.postcode
                    objConstruct["Country"] = element.country
                    objConstruct["Telephone No Prefix"] = element.telephonePrefix
                    objConstruct["Telephone No"] = element.telephoneNo
                    objConstruct["WhatsApp No Prefix"] = element.whatsappNoPrefix
                    objConstruct["WhatsApp Number"] = element.whatsappNo
                    objConstruct["FAX"] = element.fax
                    objConstruct["Facebook Id"] = element.facebookId
                    objConstruct["Instagram Id"] = element.instagramId
                    objConstruct["Telegram Id"] = element.telegramId
                    objConstruct["Project"] = element.project

                    tableData1.push(objConstruct);
                })
                createExcel(`${uploadTableName}_Outstanding`, tableData1, uploadFileName)
            } else if (uploadTableName === 'SERVICE') {
                downloadRowData?.forEach(element => {
                    let objConstruct = {}
                    objConstruct["Customer Reference No"] = element.customerRefNo
                    objConstruct["Account Reference No"] = element.accountRefNo
                    objConstruct["Service Reference No"] = element.serviceRefNo
                    objConstruct["Account Category"] = element.accountCategory
                    objConstruct["Account Type"] = element.accountType
                    objConstruct["First Name"] = element.firstName
                    objConstruct["Last Name"] = element.lastName
                    objConstruct["Email ID"] = element.emailId
                    objConstruct["Service Name"] = element.serviceName
                    objConstruct["Service Category"] = element.serviceCategory
                    objConstruct[" Service Type"] = element.serviceType
                    objConstruct["Mobile No"] = element.mobileNo
                    objConstruct["Service Status"] = element.status
                    objConstruct["Service Class"] = element.serviceClass
                    objConstruct["Currency"] = element.accountCurreny
                    objConstruct["Bill Language"] = element.accountBillLanguage
                    objConstruct["Plan Name"] = element.productName
                    objConstruct["Quantity"] = element.quantity
                    objConstruct["Activation Date"] = element.activationDate
                    objConstruct["Expiry Date"] = element.expiryDate
                    objConstruct["Notification Preference"] = element.notificationPreference
                    objConstruct["Service Agreement"] = element.serviceAgreement
                    objConstruct["Service Limit"] = element.serviceLimit
                    objConstruct["Service Usage"] = element.serviceUsage
                    objConstruct["Service Balance"] = element.serviceBalance
                    objConstruct["Service Provisioning Type"] = element.serviceProvisioningType
                    objConstruct["Payment Method"] = element.paymentMethod
                    objConstruct["Address Type"] = element.addressType
                    objConstruct["Address 1"] = element.address1
                    objConstruct["Address 2"] = element.address2
                    objConstruct["Address 3"] = element.address3
                    objConstruct["City"] = element.city
                    objConstruct["District"] = element.district
                    objConstruct["State"] = element.state
                    objConstruct["Post code"] = element.postcode
                    objConstruct["Country"] = element.country
                    objConstruct["Latitude"] = element.latitude
                    objConstruct["Longitude"] = element.longitude
                    objConstruct["Telephone No Prefix"] = element.telephonePrefix
                    objConstruct["Telephone No"] = element.telephoneNo
                    objConstruct["WhatsApp No Prefix"] = element.whatsappNoPrefix
                    objConstruct["WhatsApp Number"] = element.whatsappNo
                    objConstruct["FAX"] = element.fax
                    objConstruct["Facebook Id"] = element.facebookId
                    objConstruct["Instagram Id"] = element.instagramId
                    objConstruct["Telegram Id"] = element.telegramId
                    tableData1.push(objConstruct);
                })
                createExcel(`${uploadTableName}_Outstanding`, tableData1, uploadFileName)
            } else if (uploadTableName === 'ENTITY_TRANSACTION_MAPPING') {
                downloadRowData?.forEach(element => {
                    let objConstruct = {}
                    objConstruct["Operational Unit"] = element?.operationalUnit
                    objConstruct["Department"] = element?.department
                    objConstruct["Role Name"] = element?.roleName
                    objConstruct["Product Family"] = element?.productFamily
                    objConstruct["Product Type"] = element?.productType
                    objConstruct["Product Sub Type"] = element?.productSubType
                    objConstruct["Service Type"] = element?.serviceType
                    objConstruct["Entity Type"] = element?.entityType
                    objConstruct["Transaction Category"] = element?.transactionCategory
                    objConstruct["Transaction Type"] = element?.transactionType
                    tableData1.push(objConstruct);
                })
                createExcel(`${uploadTableName}_Outstanding`, tableData1, uploadFileName)
            } else if (uploadTableName === 'BUSINESS_UNITS') {
                downloadRowData?.forEach(element => {
                    let objConstruct = {}
                    objConstruct["Unit Name"] = element?.unitName
                    objConstruct["Unit Description"] = element?.unitDesc
                    objConstruct["Unit Type"] = element?.unitType
                    objConstruct["Parent Unit Name"] = element?.parentUnit
                    objConstruct["Role Name"] = element?.roleName
                    tableData1.push(objConstruct);
                })
                createExcel(`${uploadTableName}_Outstanding`, tableData1, uploadFileName)
            } else if (uploadTableName === 'CALENDAR') {
                downloadRowData?.forEach(element => {
                    let objConstruct = {}
                    objConstruct["Calendar Name"] = element?.calendarName
                    objConstruct["Calendar Description"] = element?.calendarDescription
                    objConstruct["Status"] = element?.status
                    objConstruct["Start Date"] = element?.startDate
                    objConstruct["End Date"] = element?.endDate
                    tableData1.push(objConstruct);
                })
                createExcel(`${uploadTableName}_Outstanding`, tableData1, uploadFileName)
            } else if (uploadFileName === 'SHIFT') {
                downloadRowData?.forEach(element => {
                    let objConstruct = {}
                    objConstruct["Shift Short Name"] = element?.shiftShortName
                    objConstruct["Shift Description"] = element?.shiftDescription
                    objConstruct["Start Time"] = element?.startTime
                    objConstruct["End Time"] = element?.endTime
                    objConstruct["Status"] = element?.status
                    objConstruct["Calendar Name"] = element?.calendarName
                    tableData1.push(objConstruct);
                })
                createExcel(`${uploadTableName}_Outstanding`, tableData1, uploadFileName)
            } else if (uploadTableName === 'HOLIDAY_CALENDAR') {
                downloadRowData?.forEach(element => {
                    let objConstruct = {}
                    objConstruct["Calendar Name"] = element?.calendarName
                    objConstruct["Holiday Day Name"] = element?.holidayDayName
                    objConstruct["Holiday Description"] = element?.holidayDescription
                    objConstruct["Holiday Type"] = element?.holidayType
                    objConstruct["Holiday Date"] = element?.holidayDate
                    tableData1.push(objConstruct);
                })
                createExcel(`${uploadTableName}_Outstanding`, tableData1, uploadFileName)
            } else if (uploadTableName === 'SKILL') {
                downloadRowData?.forEach(element => {
                    let objConstruct = {}
                    objConstruct["Skill Description"] = element.skillDescription
                    objConstruct["Service Category"] = element.serviceCategory
                    objConstruct["Service Type"] = element.serviceType
                    objConstruct["Entity Name"] = element.entityName
                    objConstruct["Entity Category"] = element.entityCategory
                    objConstruct["Entity Type"] = element.entityType
                    tableData1.push(objConstruct);
                })
                createExcel(`${uploadTableName}_Outstanding`, tableData1, uploadFileName)
            } else if (uploadTableName === 'USER_SKILL') {
                downloadRowData?.forEach(element => {
                    let objConstruct = {}
                    objConstruct["Skill Description"] = element.skillDescription
                    objConstruct["Email Id"] = element.emailId
                    tableData1.push(objConstruct);
                })
                createExcel(`${uploadTableName}_Outstanding`, tableData1, uploadFileName)
            } else if (uploadTableName === 'APPOINTMENT') {
                downloadRowData?.forEach(element => {
                    let objConstruct = {}
                    objConstruct["Appointment Name"] = element?.appointmentName
                    objConstruct["Appointment Type"] = element?.appointmentType
                    objConstruct["User Group"] = element?.userGroup
                    objConstruct["Template Name"] = element?.templateName
                    objConstruct["Notification Name"] = element?.notificationName
                    objConstruct["Location"] = element?.locations
                    objConstruct["Calender Name"] = element?.calenderName
                    objConstruct["Shift Name"] = element?.shiftName
                    objConstruct["Working Type"] = element?.workingType
                    objConstruct["Appointment Date"] = element?.appointmentDate
                    objConstruct["Appointment Start Time"] = element?.appointmentStartTime
                    objConstruct["Appointment End Time"] = element?.appointmentEndTime
                    objConstruct["User Name"] = element?.userName
                    objConstruct["User Email Id"] = element?.userEmailid
                    objConstruct["Event Type"] = element?.eventType

                })
                createExcel(`${uploadTableName}_Outstanding`, tableData1, uploadFileName)
            } else if (uploadTableName === 'CONTRACT') {
                downloadRowData?.forEach(element => {
                    let objConstruct = {}
                    objConstruct["Billing Contract Ref Number"] = element?.billingContractRefNumber
                    objConstruct["Order Number"] = element?.orderNumber
                    objConstruct["Status"] = element?.status
                    objConstruct["Reason"] = element?.reason
                    objConstruct["Contract Start Date"] = element?.contractStartDate
                    objConstruct["Product Name"] = element?.productName
                    objConstruct["Product Description"] = element?.productDescription
                    objConstruct["Billing Start Date"] = element?.billingStartDate
                    objConstruct["Consumption Base Product"] = element?.consumptionBaseProduct
                    objConstruct["Consumption Type"] = element?.consumptionType
                    objConstruct["Charge Type"] = element?.chargeType
                    objConstruct["Geo Location"] = element?.geoLocation
                    objConstruct["Unit Price"] = element?.unitPrice
                    objConstruct["Total Product"] = element?.totalProduct
                    objConstruct["Charge Amount"] = element?.chargeAmount
                    objConstruct["Balance Amount"] = element?.balanceAmount
                    objConstruct["Duration"] = element?.duration
                    objConstruct["Frequency"] = element?.frequency
                    objConstruct["Quantity"] = element?.quantity
                    objConstruct["Advance Flag"] = element?.advanceFlag
                    objConstruct["Credit Adjustment Amount"] = element?.creditAdjAmount
                    objConstruct["Debit Adjustment Amount"] = element?.debitAdjAmount
                    objConstruct["Advance Payment Allocation"] = element?.advancePaymentAllocation
                    objConstruct["Allocation Percentage"] = element?.allocationPercentage
                })
                createExcel(`${uploadTableName}_Outstanding`, tableData1, uploadFileName)

            } else if (uploadTableName === 'INVOICE') {
                downloadRowData?.forEach(element => {
                    let objConstruct = {}
                    objConstruct["Invoice Ref Number"] = element?.invoiceRefNumber
                    objConstruct["Invoice Detail Ref Number"] = element?.invoiceDetailRefNumber
                    objConstruct["Invoice Date"] = element?.invoiceDate
                    objConstruct["Due Date"] = element?.dueDate
                    objConstruct["Status"] = element?.status
                    objConstruct["Reason"] = element?.reason
                    objConstruct["Customer Reference No"] = element?.customerRefNo
                    objConstruct["Email ID"] = element?.emailid
                    objConstruct["Order Reference Number"] = element?.orderRefNo
                    objConstruct["Contract Reference Number"] = element?.contractRefNo
                    objConstruct["Product Name"] = element?.productName
                    objConstruct["Product Description"] = element?.productDescription
                    objConstruct["Invoice Details Start Date"] = element?.invoiceDetailsStartDate
                    objConstruct["Invoice Details End Date"] = element?.invoiceDetailsEndDate
                    objConstruct["Quantity"] = element?.quantity
                    objConstruct["Credit Adjustment"] = element?.creditAdjAmount
                    objConstruct["Debit Adjustment"] = element?.debitAdjAmount
                    objConstruct["Invoice Detail Amount"] = element?.invoiceDetailAmount
                    objConstruct["Invoice Detail OS Amount"] = element?.invoiceDetailOsAmount
                })
                createExcel(`${uploadTableName}_Outstanding`, tableData1, uploadFileName)
            } else if (uploadTableName === 'PAYMENT') {
                downloadRowData?.forEach(element => {
                    let objConstruct = {}
                    objConstruct["Payment Ref Number"] = element?.paymentRefNumber
                    objConstruct["Customer Reference No"] = element?.customerRefNumber
                    objConstruct["Invoice Ref Number"] = element?.invoiceRefNumber
                    objConstruct["Invoice Detail Ref Number"] = element?.invoiceDetailRefNumber
                    objConstruct["Status"] = element?.status
                    objConstruct["Reason"] = element?.reason
                    objConstruct["Currency"] = element?.currency
                    objConstruct["Payment Mode"] = element?.paymentMode
                    objConstruct["Payment Mode if Others"] = element?.paymentModeIfOth
                    objConstruct["Payment Amount"] = element?.paymentAmount
                    objConstruct["Payment Date"] = element?.paymentDate
                    objConstruct["Payment Location"] = element?.paymentLocation
                    objConstruct["Invoice Detail Amount"] = element?.invoiceDetailAmount
                })
                createExcel(`${uploadTableName}_Outstanding`, tableData1, uploadFileName)
            }
        }
        catch (error) {
            console.error(error);
        }
        finally {
            hideSpinner();
        }
    }

    const createExcel = (typeName, tableData, templateFileName) => {
        // console.log('templateFileName', templateFileName)
        // console.log('tableData', tableData)
        if (!!tableData.length) {
            const fileName = templateFileName//`${typeName.toLowerCase()}_Template_${moment(new Date()).format('DD MMM YYYY')}`
            const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
            const fileExtension = ".xlsx";
            const ws = XLSX.utils.json_to_sheet(tableData,
                {
                    origin: 'A2',
                    skipHeader: false
                });
            const wb = {
                Sheets: { data: ws },
                SheetNames: ["data"]
            };

            const excelBuffer = XLSX.write(wb, {
                bookType: "xlsx",
                type: "array"
            });
            const data = new Blob(
                [excelBuffer], { type: fileType }
            );
            FileSaver.saveAs(data, fileName + fileExtension);
        }
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleInputChange = (e) => {
        const target = e.target;
        setSearchInputs({
            ...searchInputs,
            [target.id]: target.value
        })
    }

    const handleOnKeyPress = (e) => {
        const { key } = e;
        validateNumber(e);
        if (key === "Enter") {
            handleSubmit(e)
        };
    }

    const handleSubmit = (e) => {
        if (e) {
            e.preventDefault();
            unstable_batchedUpdates(() => {
                setFilters([])
                setCurrentPage((currentPage) => {
                    if (currentPage === 0) {
                        return '0'
                    }
                    return 0
                });
            })
        }
        else {
            getExtractedRecordList();
        }
    }

    return (
        <div className="mt-2 cmmn-skeleton">
            {/* <div className="row">
                <div className="col">
                    <div className="page-title-box">
                        <h4 className="page-title">Search Bulk Upload</h4>
                    </div>
                </div>
            </div> */}
            <div className="">
                <div className="col-lg-12">
                    <div className="search-result-box m-t-30">
                        <div id="searchBlock" className="modal-body p-2 d-block">
                            <div className="d-flex justify-content-end">
                                <h6 className='text-primary cursor-pointer' onClick={() => { setDisplayForm(!displayForm) }}>
                                    {displayForm ? "Hide Search" : "Show Search"}
                                </h6>
                            </div>
                            {
                                displayForm &&
                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="processId" className="control-label">Process ID</label>
                                                <NumberFormatBase
                                                    value={searchInputs.processId}
                                                    onKeyPress={(e) => handleOnKeyPress(e)}
                                                    onChange={handleInputChange}
                                                    type="text"
                                                    className="form-control"
                                                    id="processId"
                                                    placeholder="Enter Proccess ID" />
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="uploadType" className="control-label">Upload Type</label>
                                                <select id='uploadType' className='form-control' value={searchInputs.uploadType} onChange={handleInputChange} >
                                                    <option value="">Select Upload Type</option>
                                                    {options?.map((e, i) => (
                                                        <option value={e.value} key={i}>{e.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="uploadedBy" className="control-label">Uploaded By</label>
                                                <input
                                                    value={searchInputs.uploadedBy}
                                                    onChange={handleInputChange}
                                                    type="text"
                                                    className="form-control"
                                                    id="uploadedBy"
                                                    placeholder="Enter Uploaded By"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="uploadedDate" className="control-label">Uploaded Date</label>
                                                <input
                                                    value={moment(searchInputs.uploadedDate).format('YYYY-MM-DD')}
                                                    onChange={handleInputChange}
                                                    type="date"
                                                    className="form-control"
                                                    id="uploadedDate"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className='row justify-content-center'>
                                        <div className="text-center mt-3">
                                            <button type="button" className="skel-btn-cancel " onClick={() => { setSearchInputs(initialValues); setTableRowData([]) }}>Clear</button>
                                            <button type="submit" className="skel-btn-submit">Search</button>

                                        </div>
                                    </div>
                                </form>
                            }
                        </div>
                        {
                            !!tableRowData.length &&
                            <div className="row mt-2">
                                <div className="col-lg-12">
                                    {
                                        <div className="">
                                            <div className="card-body" id="datatable">
                                                <DynamicTable
                                                    listKey={"Bulk Upload Search"}
                                                    listSearch={listSearch}
                                                    row={tableRowData}
                                                    header={RecordExtractorColumns}
                                                    rowCount={totalCount}
                                                    itemsPerPage={perPage}
                                                    backendPaging={true}
                                                    backendCurrentPage={currentPage}
                                                    isTableFirstRender={isTableFirstRender}
                                                    hasExternalSearch={hasExternalSearch}
                                                    exportBtn={exportBtn}
                                                    handler={{
                                                        handleCellRender: handleCellRender,
                                                        handlePageSelect: handlePageSelect,
                                                        handleItemPerPage: setPerPage,
                                                        handleCurrentPage: setCurrentPage,
                                                        handleFilters: setFilters,
                                                        handleExportButton: setExportBtn
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    }
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
            <div className='row'>
                <div className='col-lg-12'>
                    {
                        isOpen && (
                            <SearchExcelViewUploadDataModal
                                data={{
                                    isOpen,
                                    row: modalViewData.current
                                }}
                                handlers={{
                                    setIsOpen
                                }}
                            />
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default SearchBulkUpload