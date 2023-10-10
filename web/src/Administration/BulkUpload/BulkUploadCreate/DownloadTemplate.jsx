import React, { useState } from 'react'
import * as XLSX from "xlsx";
import moment from 'moment'
import { toast } from 'react-toastify';
import { hideSpinner, showSpinner } from '../../../common/spinner';

const DownloadTemplate = (props) => {

    const { selectedTemplateType, bulkUploadTemplateList, uploadTemplateList, file, fileName, templateUploadCounts } = props.data
    const { setSelectedTemplateType, setUploadTemplateList, setFile, setFileName, setTemplateUploadCounts, setTemplateStatusFlags } = props.handler
    const [showImportantInstruction, setShowImportantInstruction] = useState(false)

    const formatExcelDate = (dateValue) => {
        let date
        if (String(dateValue).length === 5) {
            let date_info = new Date(((Math.floor(dateValue - 25568)) * 86400) * 1000)
            date = JSON.stringify(new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate()))
            date = date.slice(1, 11)
            date = moment(date).format('YYYY-MM-DD')
        }
        else if (String(dateValue).includes('/')) {
            const splitValue = String(dateValue).split('/')
            if (splitValue[1].length > 2) //1/Jul/21
            {
                //2021-12-24
                date = moment(dateValue).format('YYYY-MM-DD')
            }
            else {
                if (splitValue[0].length > 2) //2021-12-24
                {
                    ///2021-12-24
                    date = splitValue[0] + '-' + splitValue[1] + '-' + splitValue[2]
                }
                else //24-12-2021
                {
                    //2021-12-24
                    date = splitValue[2] + '-' + splitValue[1] + '-' + splitValue[0]
                }
            }
        }
        else if (String(dateValue).includes('-')) {
            const splitValue = String(dateValue).split('-')
            if (splitValue[1].length > 2) //1-Jul-21
            {
                //1-Jul-21
                date = moment(dateValue).format('YYYY-MM-DD')
            }
            else {
                if (splitValue[0].length > 2) //2021-12-24
                {
                    ///2021-12-24
                    date = splitValue[0] + '-' + splitValue[1] + '-' + splitValue[2]
                }
                else //24-12-2021
                {
                    //2021-12-24
                    date = splitValue[2] + '-' + splitValue[1] + '-' + splitValue[0]
                }
            }
        }
        else {
            date = moment(dateValue).format('YYYY-MM-DD')
        }

        return date
    }

    const formatExcelTime = (dataValue) =>{
        let response = dataValue
        if(String(dataValue)){
            const splitString = String(dataValue)?.split(':')
            response = splitString?.[0].length<2 ? '0'+dataValue : dataValue         
        }
        return response
    }

    const handleFileRejection = () => {
        setUploadTemplateList({
            uploadList: [],
            rejectedList: [],
            finalList: [],
            extraList: []
        })
        setTemplateUploadCounts({
            success: 0,
            failed: 0,
            total: 0
        })
        setTemplateStatusFlags({
            validateCheck: false,
            showErrorCheck: false,
            proceedCheck: false
        })
    }

    const handleFileSelect = (e) => {
        showSpinner()
        setFileName(e.target.files[0]?.name);
        setFile(e.target.files[0]);
        readExcel(e.target.files[0]);
    }

    const handleFileUpload = (list) => {
        // let acceptFile = false
        // if (selectedTemplateType === 'CUSTOMER') {
        //     list.map((z) => {
        //         if ('First Name' in z && 'Last Name' in z && 'Title' in z && 'Email ID' in z && 'Customer Category' in z && 'Gender' in z && 'DOB',
        //             'Mobile Prefix' in z && 'Mobile No' in z && 'ID Type' in z && 'ID Value' in z && 'Contact Preference' in z && 'Registeration No' in z && 'Registeration Date',
        //             'Address Type' in z && 'Address 1' in z && 'Address 2' in z && 'District' in z && 'State' in z && 'Post code' in z && 'Country') {
        //             acceptFile = true
        //         }
        //     })
        // } else if (selectedTemplateType === 'PRODUCT') {
        //     list.map((z) => {
        //         if ("Product Name" in z && "Product Family" in z && "Product Category" in z && "Product Sub Category" in z && "Product Type" in z
        //             && "Service Type" in z && "Service Class" in z && "Provisioning Type" in z && "Product Class" in z && "Charge Name" in z
        //             && "UOM" in z && "Frequency" in z && "Activation Date" in z) {
        //             acceptFile = true
        //         }
        //     })
        //     // console.log(list);
        // } else if (selectedTemplateType === 'USER') {
        //     // console.log(list);
        //     list.map((z) => {
        //         if ("First Name" in z && "Last Name" in z && "Gender" in z && "Email" in z &&
        //             "Date of Birth" in z && "User Type" in z && "User Family" in z &&
        //             "Country" in z && "Contact Prefix" in z && "Contact Number" in z &&
        //             "Role Name" in z && "Department Name" in z && "Activation Date" in z) {
        //             acceptFile = true
        //         }
        //     })
        // } else if (selectedTemplateType === 'REQUEST_STATEMENT') {
        //     list.map((z) => {
        //         if ("Interaction statement" in z && "Interaction Category" in z && "Interaction Type" in z && "Service Category" in z &&
        //             "Service type" in z && "Priority" in z && "Interaction Statement Cause" in z && "Interaction Resolution" in z && "Interaction Class" in z) {
        //             acceptFile = true
        //         }
        //     })
        // } else if (selectedTemplateType === 'CHARGE') {
        //     list.map((z) => {
        //         if ("Charge Name" in z && "Charge Category" in z && "Service Type" in z && "Charge Amount" in z && "Currency" in z && "Start Date") {
        //             acceptFile = true
        //         }
        //     })
        // } else if (selectedTemplateType === 'ORDER') {
        //     list.map((z) => {
        //         if ("Order Reference No" in z && "Order Date" in z && "Customer Name" in z && "Service Name" in z && "Email ID" in z && "Order Category" in z &&
        //             "Customer Reference No" in z && "Service Reference No" in z && "Order Type" in z && "Order Source" in z && "Order Channel" in z && "Order Status" in z && "Order Family" in z &&
        //             "Service Category" in z && "Service Type" in z && "Order Priority" in z && "Order Description" in z &&
        //             "Product Name" in z && "Quantity" in z && "Bill Amount" in z && "Contact Preference" in z && "Reason" in z &&
        //             "Created Department" in z && "Current Department" in z && "Created Role" in z && "Current Role" in z &&
        //             "Address Type" in z && "Address 1" in z && "Address 2" in z && "District" in z && "State" in z && "Post code" in z && "Country" in z) {
        //             acceptFile = true
        //         }
        //     })
        // } else if (selectedTemplateType === 'PROFILE') {
        //     list.map((z) => {
        //         if ("First Name" in z && "Last Name" in z && "Gender" in z && "Profile Category" in z && "Email ID" in z && "Mobile Prefix" in z && "Mobile No" in z) {
        //             acceptFile = true
        //         }
        //     })
        // } else if (selectedTemplateType === 'SERVICE') {
        //     list.map((z) => {
        //         if ("Customer Reference No" in z && "Account Reference No" in z && "Service Reference No" in z && "Account Category" in z &&
        //             "Account Type" in z && "First Name" in z && "Last Name" in z && "Email ID" in z && "Mobile No" in z && "Service Name" in z &&
        //             "Service Category" in z && "Service Type" in z && "Service Status" in z && "Service Class" in z && "Currency" in z && "Bill Language" in z &&
        //             "Plan Name" in z && "Notification Preference" in z && "Service Provisioning Type" in z && "Address Type" in z && "Address 1" in z &&
        //             "Address 2" in z && "District" in z && "State" in z && "Post code" in z && "Country" in z) {
        //             acceptFile = true
        //         }
        //     })
        // } else if (selectedTemplateType === 'INTERACTION') {
        //     console.log(list);
        //     list.map((z) => {
        //         if ("Interaction Reference No" in z && "Customer Name" in z && "Service Name" in z && "Service Ref No" in z && "Product Name" in z && "Email ID" in z && "Mobile No" in z && "Interaction Category" in z && 
        //             "Interaction Type" in z && "Service Category" in z && "Service Type" in z && "Interaction Cause" in z && "Interaction Status" in z && "Created Department" in z && "Current Department" in z && "Created Role" in z && "Current Role" in z &&
        //             "Interaction Workflow Sequence" in z && "Interaction Workflow Status" in z && "From Department" in z && "From Role" in z && "From User" in z && "To Department" in z && "To Role" in z &&
        //             "Interaction Priority" in z && "Interaction Channel" in z && "Created Date" in z && "Assigned Date" in z && "Workflow Created Date" in z && "Interaction Description" in z && "Response Resolution" in z &&
        //             "Address Type" in z && "Address 1" in z && "Address 2" in z && "City" in z && "District" in z && "State" in z && "Post code" in z && "Country") {
        //             acceptFile = true
        //         }
        //     })
        // } else if (selectedTemplateType === 'CONTRACT') {
        //     list.map((z) => {
        //         if ('Contract Reference No' in z && 'Contract Start Date' in z) {
        //             acceptFile = true
        //         }
        //     })
        // } else if (selectedTemplateType === 'SALES_ORDER') {
        //     list.map((z) => {
        //         if ("Customer No" in z && "Sales Order No" in z && "SO Type" in z) {
        //             acceptFile = true
        //         }
        //     })
        // } else if (selectedTemplateType === 'INCIDENT') {
        //     list.map((z) => {
        //         if ("Customer No" in z && "HPSM Ref Number" in z) {
        //             acceptFile = true
        //         }
        //     })
        // } else if (selectedTemplateType === 'BUSINESS_ENTITY') {
        //     list.map((z) => {
        //         if ("Code" in z && "Description" in z && "Code Type" in z && "Status" in z) {
        //             acceptFile = true
        //         }
        //     })
        // } else if (selectedTemplateType === 'ROLE') {
        //     list.map((z) => {
        //         if ("Role Name" in z && "Role Description" in z && "Is Admin" in z && "Status" in z) {
        //             acceptFile = true
        //         }
        //     })
        // } else if (selectedTemplateType === 'USER_ROLE_MAPPING') {
        //     list.map((z) => {
        //         if ("Email" in z && "Role Description" in z && "Department Description" in z) {
        //             acceptFile = true
        //         }
        //     })
        // } else if (selectedTemplateType === 'ENTITY_TRANSACTION_MAPPING') {
        //     list.map((z) => {
        //         if ("Operational Unit" in z && "Department" in z && "Role Name" in z && "Product Family" in z && "Product Type" in z && "Product Sub Type" in z && "Service Type" in z && "Entity Type" in z && "Transaction Category" in z && "Transaction Type") {
        //             acceptFile = true
        //         }
        //     })
        // } else if (selectedTemplateType === 'BUSINESS_UNITS') {
        //     list.map((z) => {
        //         if ("Unit Name" in z && "Unit Description" in z && "Unit Type" in z) {
        //             acceptFile = true
        //         }
        //     })
        // }
        // if (acceptFile === false) {
        //     setFile(null)
        //     setFileName("")
        //     handleFileRejection()
        //     hideSpinner()
        //     toast.error("Please check the records and fields are matching.")
        //     return false;
        // }
        let tempTaskList = []
        let count = 0
        list.map((task) => {
            count = count + 1
            let taskObject = {}
            if (selectedTemplateType === 'CUSTOMER') {
                taskObject = {
                    indexId: count,
                    customerRefNo: task["Customer Reference No"] ? task["Customer Reference No"].toString() : null,
                    title: task["Title"] || null,
                    firstName: task["First Name"] || null,
                    lastName: task["Last Name"] || null,
                    customerCategory: task["Customer Category"] || null,
                    department: task["Department"] || null,
                    projects: task["Projects"] || null,
                    customerClass: task["Customer Class"] ? task["Customer Class"].toString() : null,
                    customerMaritalStatus: task["Martial Status"] || null,
                    occupation: task["Occupation"] || null,
                    gender: task["Gender"] || null,
                    emailId: task["Email ID"] || null,
                    mobilePrefix: task["Mobile Prefix"] || null,
                    mobileNo: task["Mobile No"] || null,
                    birthDate: task["DOB"] ? formatExcelDate(task["DOB"]) : null,
                    idType: task["ID Type"] || null,
                    idValue: task["ID Value"] || null,
                    nationality: task["Nationality"] || null,
                    contactPreference: task["Notification Type"] || null,
                    registeredNo: task["Registeration No"] || null,
                    registeredDate: task["Registeration Date"] ? formatExcelDate(task["Registeration Date"]) : null,
                    addressType: task["Address Type"] || null,
                    address1: task["Address 1"] || null,
                    address2: task["Address 2"] || null,
                    address3: task["Address 3"] || null,
                    state: task["State"] || null,
                    city: task["City"] || null,
                    district: task["District"] || null,
                    country: task["Country"] || null,
                    postcode: task["Post code"] || null,
                    latitude: task["Latitude"] || null,
                    longitude: task["Longitude"] || null,
                    telephonePrefix: task["Telephone No Prefix"] || null,
                    telephoneNo: task["Telephone No"] || null,
                    whatsappNoPrefix: task["WhatsApp No Prefix"] || null,
                    whatsappNo: task["WhatsApp Number"] || null,
                    fax: task["FAX"] || null,
                    facebookId: task["Facebook Id"] || null,
                    instagramId: task["Instagram Id"] || null,
                    telegramId: task["Telegram Id"] || null,
                    status: task["Status"] || null,
                    validationRemark: null,
                    validationStatus: null
                }
            } else if (selectedTemplateType === 'USER') {
                taskObject = {
                    indexId: count,
                    firstName: task["First Name"] || null,
                    lastName: task["Last Name"] || null,
                    gender: task["Gender"] || null,
                    emailId: task["Email"] || null,
                    birthDate: task["Date of Birth"] ? formatExcelDate(task["Date of Birth"]) : null,
                    userCategory: task["User Category"] || null,
                    userType: task["User Type"] || null,
                    userFamily: task["User Family"] || null,
                    country: task["Country"] || null,
                    mobilePrefix: task["Contact Prefix"] || null,
                    mobileNo: task["Contact Number"] || null,
                    userLocation: task["Location"] || null,
                    managerEmail: task["Manager Email"] || null,
                    notificationType: task["Notification Type"] || null,
                    biAccess: task["BI Access"] || null,
                    biAccessKey: task["BI Access Key"] || null,
                    roleName: task["Role Name"] || null,
                    department: task["Department Name"] || null,
                    projects: task["Projects"] || null,
                    expertiseOn: task["Expertise On"] || null,
                    // userGroup: task["User Group"] || null,
                    activationDate: task["Activation Date"] ? formatExcelDate(task["Activation Date"]) : null,
                    expiryDate: task["Expiry Date"] ? formatExcelDate(task["Expiry Date"]) : null,
                    validationRemark: null,
                    validationStatus: null
                }

            } else if (selectedTemplateType === 'REQUEST_STATEMENT') {
                taskObject = {
                    indexId: count,
                    intxnStatement: task["Interaction Statement"] || null,
                    intxnCategory: task["Interaction Category"] || null,
                    intxnType: task["Interaction Type"] || null,
                    serviceCategory: task["Service Category"] || null,
                    serviceType: task["Service Type"] || null,
                    priority: task["Priority"] || null,
                    intxnStatCause: task["Interaction Statement Cause"] || null,
                    intxnResolution: task["Interaction Resolution"] || null,
                    reqStatementClass: task["Interaction Class"] || null,
                    // interactionClass: task["Interaction Class"] || null,
                    multiLang: task["Multi Language"],
                    multiLangIntxnStatement: task["Multi Language Interaction Statement"],
                    multiLangIntxnResolution: task["Multi Language Interaction Resolution"],
                    isAppointment: task["Is Appointment Required"],
                    isOrder: task["Order Convertion Required"],
                    orderCategory: task["Order Category"],
                    orderType: task["Order Type"],
                    validationRemark: null,
                    validationStatus: null
                }

            } else if (selectedTemplateType === 'CHARGE') {
                taskObject = {
                    indexId: count,
                    chargeName: task["Charge Name"] || null,
                    chargeCategory: task["Charge Category"] || null,
                    serviceType: task["Service Type"] || null,
                    chargeAmount: task["Charge Amount"] || null,
                    currency: task["Currency"] || null,
                    // advanceCharge: task["Advance Charge"] || null,
                    glCode: task["GL Code"] || null,
                    startDate: task["Start Date"] ? formatExcelDate(task["Start Date"]) : null,
                    endDate: task["End Date"] ? formatExcelDate(task["End Date"]) : null,
                    validationRemark: null,
                    validationStatus: null
                }

            } else if (selectedTemplateType === 'PRODUCT') {
                taskObject = {
                    indexId: count,
                    productName: task["Product Name"] || null,
                    productFamily: task["Product Family"] || null,
                    productCategory: task["Product Category"] || null,
                    productSubCategory: task["Product Sub Category"] || null,
                    productType: task["Product Type"] || null,
                    serviceClass: task["Service Class"] || null,
                    productSubType: task["Product Sub Type"] || null,
                    serviceType: task["Service Type"] || null,
                    provisioningType: task["Provisioning Type"] || null,
                    productClass: task["Product Class"] || null,
                    prodBundleName: task["Bundle Name"] || null,
                    chargeName: task["Charge Name"] || null,
                    // chargeType: task["Charge Type"] || null,
                    // chargeAmount: task["Charge Amount"] || null,
                    // advanceCharge: task["Advance Charge"] || null,
                    // chargeUpfront: task["Upfront Charge"] || null,
                    frequency: task["Frequency"] || null,
                    // prorated: task["Prorated"] || null,
                    //currency: task["Currency"] || null,
                    contractFlag: task["Contract Availability"] || null,
                    contractInMonths: task["Contract Duration"] || null,
                    uomCategory: task["UOM"] || null,
                    // glcode: task["GL Code"] || null,
                    expiryDate: task["Expiry Date"] ? formatExcelDate(task["Expiry Date"]) : null,
                    activationDate: task["Activation Date"] ? formatExcelDate(task["Activation Date"]) : null,
                    isAppointRequired: task["Is Appointment Required"] || null,
                    productBenefits: task["Product Benefits"] || null,
                    validationRemark: null,
                    validationStatus: null
                }
                // console.log(taskObject);
            } else if (selectedTemplateType === 'ORDER') {
                taskObject = {
                    indexId: count,
                    orderRefNo: task["Order Reference No"] || null,
                    orderDate: task["Order Date"] ? formatExcelDate(task["Order Date"]) : null,
                    customerName: task["Customer Name"] || null,
                    serviceName: task["Service Name"] || null,
                    emailId: task["Email ID"] || null,
                    orderCategory: task["Order Category"] || null,
                    customerRefNo: task["Customer Reference No"] || null,
                    serviceRefNo: task["Service Reference No"] || null,
                    orderType: task["Order Type"] || null,
                    orderSource: task["Order Source"] || null,
                    orderChannel: task["Order Channel"] || null,
                    orderStatus: task["Order Status"] || null,
                    orderFamily: task["Order Family"] || null,
                    orderMode: task["Order Mode Type"] || null,
                    orderDeliveryMode: task["Order Delivery Mode"] || null,
                    serviceCategory: task["Service Category"] || null,
                    serviceType: task["Service Type"] || null,
                    // orderCause: task["Order Cause"] || null,
                    orderPriority: task["Order Priority"] || null,
                    orderDescription: task["Order Description"] || null,
                    productName: task["Product Name"] || null,
                    productQuantity: task["Quantity"] || null,
                    billAmount: task["Bill Amount"] || null,
                    productRefNo: task["Product Reference No"] || null,
                    deliveryLocation: task["Delivery Location"] || null,
                    edoc: task["EDOC"] ? formatExcelDate(task["EDOC"]) : null,
                    contactPreference: task["Contact Preference"] || null,
                    createdDept: task["Created Department"] || null,
                    currDept: task["Current Department"] || null,
                    createdRole: task["Created Role"] || null,
                    currRole: task["Current Role"] || null,
                    currUser: task["Current User"] || null,
                    requestStatement: task["Request Statement"],
                    addressType: task["Address Type"] || null,
                    address1: task["Address 1"] || null,
                    address2: task["Address 2"] || null,
                    address3: task["Address 3"] || null,
                    city: task["City"] || null,
                    district: task["District"] || null,
                    state: task["State"] || null,
                    postcode: task["Post code"] || null,
                    country: task["Country"] || null,
                    latitude: task["Latitude"] || null,
                    longitud: task["Longitud"] || null,
                    advanceCharge: task["Advance Charge"] || null,
                    upfrontCharge: task["Upfront Charge"] || null,
                    prorated: task["Prorated"] || null,
                    validationRemark: null,
                    validationStatus: null
                }
            } else if (selectedTemplateType === 'PROFILE') {
                taskObject = {
                    indexId: count,
                    firstName: task["First Name"] || null,
                    lastName: task["Last Name"] || null,
                    gender: task["Gender"] || null,
                    profileCategory: task["Profile Category"] || null,
                    emailId: task["Email ID"] || null,
                    mobilePrefix: task["Mobile Prefix"] || null,
                    mobileNo: task["Mobile No"] || null,
                    birthDate: task["DOB"] ? formatExcelDate(task["DOB"]) : null,
                    idType: task["ID Type"] || null,
                    idValue: task["ID Value"] || null,
                    nationality: task["Nationality"] || null,
                    contactPreferences: task["Contact Preferences"] || null,
                    registeredNo: task["Registeration No"] || null,
                    registeredDate: task["Registeration Date"] ? formatExcelDate(task["Registeration Date"]) : null,
                    addressType: task["Address Type"] || null,
                    address1: task["Address 1"] || null,
                    address2: task["Address 2"] || null,
                    address3: task["Address 3"] || null,
                    city: task["City"] || null,
                    district: task["District"] || null,
                    state: task["State"] || null,
                    postcode: task["Post code"] || null,
                    country: task["Country"] || null,
                    city: task["City"] || null,
                    telephonePrefix: task["Telephone No Prefix"] || null,
                    telephoneNo: task["Telephone No"] || null,
                    whatsappNoPrefix: task["WhastApp No Prefix"] || null,
                    whatsappNo: task["WhatsApp Number"] || null,
                    fax: task["FAX"] || null,
                    project: task["Project"] || null,
                    facebookId: task["Facebook Id"] || null,
                    instagramId: task["Instagram Id"] || null,
                    telegramId: task["Telegram Id"] || null,
                    validationRemark: null,
                    validationStatus: null
                }
            } else if (selectedTemplateType === 'SERVICE') {
                taskObject = {
                    indexId: count,
                    customerRefNo: task["Customer Reference No"] || null,
                    accountRefNo: task["Account Reference No"] || null,
                    serviceRefNo: task["Service Reference No"] || null,
                    accountCategory: task["Account Category"] || null,
                    accountType: task["Account Type"] || null,
                    firstName: task["First Name"] || null,
                    lastName: task["Last Name"] || null,
                    emailId: task["Email ID"] || null,
                    mobileNo: task["Mobile No"],
                    serviceName: task["Service Name"] || null,
                    serviceCategory: task["Service Category"] || null,
                    serviceType: task["Service Type"] || null,
                    status: task["Service Status"] || null,
                    serviceClass: task["Service Class"] || null,
                    accountCurreny: task["Currency"] || null,
                    accountBillLanguage: task["Bill Language"] || null,
                    productName: task["Plan Name"] || null,
                    quantity: task["Quantity"] || null,
                    birthDate: task["DOB"] ? formatExcelDate(task["DOB"]) : null,
                    activationDate: task["Activation Date"] ? formatExcelDate(task["Activation Date"]) : null,
                    expiryDate: task["Expiry Date"] ? formatExcelDate(task["Expiry Date"]) : null,
                    notificationPreference: task["Notification Preference"],
                    serviceAgreement: task["Service Agreement"],
                    serviceLimit: task["Service Limit"],
                    serviceUsage: task["Service Usage"],
                    serviceBalance: task["Service Balance"],
                    paymentMethod: task["Payment Method"],
                    serviceProvisioningType: task["Service Provisioning Type"] || null,
                    addressType: task["Address Type"] || null,
                    address1: task["Address 1"] || null,
                    address2: task["Address 2"] || null,
                    address3: task["Address 3"] || null,
                    city: task["City"] || null,
                    serviceUnit: task["Service Unit"] || null,
                    state: task["State"] || null,
                    district: task["District"] || null,
                    postcode: task["Post code"] || null,
                    country: task["Country"] || null,
                    latitude: task["Latitude"] || null,
                    longitude: task["Longitude"] || null,
                    telephonePrefix: task["Telephone No Prefix"] || null,
                    telephoneNo: task["Telephone No"] || null,
                    whatsappNoPrefix: task["WhatsApp No Prefix"] || null,
                    whatsappNo: task["WhatsApp Number"] || null,
                    fax: task["FAX"] || null,
                    facebookId: task["Facebook Id"] || null,
                    instagramId: task["Instagram Id"] || null,
                    telegramId: task["Telegram Id"] || null,
                    validationRemark: null,
                    validationStatus: null
                }
            } else if (selectedTemplateType === 'INTERACTION') {
                taskObject = {
                    indexId: count,
                    intxnRefNo: task["Interaction Reference No"] || null,
                    customerName: task["Customer Name"] || null,
                    serviceName: task["Service Name"] || null,
                    serviceRefNo: task["Service Ref No"] || null,
                    productName: task["Product Name"] || null,
                    emailid: task["Email ID"] || null,
                    mobileNo: task["Mobile No"] || null,
                    intxnCategory: task["Interaction Category"] || null,
                    intxnType: task["Interaction Type"] || null,
                    serviceCategory: task["Service Category"] || null,
                    serviceType: task["Service Type"] || null,
                    intxnCause: task["Interaction Cause"] || null,
                    intxnStatus: task["Interaction Status"] || null,
                    statusReason: task["Reason"] || null,
                    createdEntity: task["Created Department"] || null,
                    currEntity: task["Current Department"] || null,
                    currUser: task["Current User"] || null,
                    toUser: task["To User"] || null,
                    createdRole: task["Created Role"] || null,
                    currRole: task["Current Role"] || null,
                    intxnWorkflowSeq: task["Interaction Workflow Sequence"] || null,
                    intxnWorkflowStatus: task["Interaction  Workflow Status"] || null,
                    fromEntity: task["From Department"] || null,
                    fromRole: task["From Role"] || null,
                    fromUser: task["From User"] || null,
                    toEntity: task["To Department"] || null,
                    toRole: task["To Role"] || null,
                    intxnPriority: task["Interaction Priority"] || null,
                    // toUser: task["To User"] || null,
                    intxnChannel: task["Interaction Channel"] || null,
                    intxnCreatedDate: task["Created Date"] ? formatExcelDate(task["Created Date"]) : null,
                    assignedDate: task["Assigned Date"] ? formatExcelDate(task["Assigned Date"]) : null,
                    flwCreatedAt: task["Workflow Created Date"] ? formatExcelDate(task["Workflow Created Date"]) : null,
                    intxnDescription: task["Interaction Description"] || null,
                    responseSolution: task["Response Resolution"] || null,
                    addressType: task["Address Type"] || null,
                    address1: task["Address 1"] || null,
                    address2: task["Address 2"] || null,
                    address3: task["Address 3"] || null,
                    city: task["City"] || null,
                    district: task["District"] || null,
                    state: task["State"] || null,
                    postcode: task["Post code"] || null,
                    country: task["Country"] || null,
                    contactPreference: task["Contact Preference"] || null,
                    requestStatement: task["Request Statement"] || null,
                    isFollowup: task["Is Followup"] || null,
                    remarks: task["Remarks"] || null,
                    latitude: task["Latitude"] || null,
                    longitude: task["Longitude"] || null,
                    validationRemark: null,
                    validationStatus: null
                }
            } else if (selectedTemplateType === 'BUSINESS_ENTITY') {
                taskObject = {
                    indexId: count,
                    code: task["Code"] || null,
                    description: task["Description"] || null,
                    codeType: task["Code Type"] || null,
                    mappingPayload: task["Mapping Payload"] || null,
                    status: task["Status"] || null,
                    validationRemark: null,
                    validationStatus: null
                }

            } else if (selectedTemplateType === 'USER_ROLE_MAPPING') {
                taskObject = {
                    indexId: count,
                    email: task["Email"] || null,
                    roleDescription: task["Role Description"] || null,
                    departmentDescription: task["Department Description"] || null,
                    validationRemark: null,
                    validationStatus: null
                }

            } else if (selectedTemplateType === 'ROLE') {
                taskObject = {
                    indexId: count,
                    roleName: task["Role Name"] || null,
                    roleDescription: task["Role Description"] || null,
                    isAdmin: task["Is Admin"] || null,
                    parentRole: task["Parent Role"] || null,
                    status: task["Status"] || null,
                    validationRemark: null,
                    validationStatus: null
                }

            } else if (selectedTemplateType === 'CUSTOMER_CONTRACT') {
                taskObject = {
                    indexId: count,
                    custContRefNo: task["Customer Contract Ref Number"] || null,
                    soNo: task["SO Number"] || null,
                    contCategory: task["Contract Category"] || null,
                    chargeType: task["Charge Type"] || null,
                    contStartDate: task["Contract Start Date"] ? formatExcelDate(task["Contract Start Date"]) : null,
                    contEndDate: task["Contract End Date"] ? formatExcelDate(task["Contract End Date"]) : null,
                    contStatus: task["Contract Status"] || null,
                    contTotalAmt: task["Contract Total Amount"] || null,
                    prodName: task["Product Name"] || null,
                    prodDesc: task["Prod Desc"] || null,
                    quantity: task["Qty"] || null,
                    prodStartDate: task["Product Start Date"] ? formatExcelDate(task["Product Start Date"]) : null,
                    prodEndDate: task["Product End Date"] ? formatExcelDate(task["Product End Date"]) : null,
                    prodTotalAmt: task["Product Total Amount"] || null,
                    unitAmt: task["Unit Amount"] || null,
                    duration: task["Duration"] || null,
                    lineItemStatus: task["Line Item Status"] || null,
                    contRenewalDate: task["Contract Renewal Date"] ? formatExcelDate(task["Contract Renewal Date"]) : null,
                    allocationPercent: task["Allocation Percentage"] || null,
                    isContEvergreen: task["Is Contract Evergreen"] || null,
                    advFlag: task["Advance Flag"] || null,
                    validationRemark: null,
                    validationStatus: null
                }
            }
            //  else if (selectedTemplateType === 'CONTRACT') {
            //     taskObject = {
            //         indexId: count,
            //         contractRefNo: task["Contract Reference No"] || null,
            //         contractStartDate: task["Contract Start Date"] ? formatExcelDate(task["Contract Start Date"]) : null,
            //         contractEndDate: task["Contract End Date"] ? formatExcelDate(task["Contract End Date"]) : null,
            //         contractstatus: task["Contract Status"] || null,
            //         productName: task["Product Name"] || null,
            //         serviceRefNo: task["Service Reference No"] || null,
            //         productStartDate: task["Product Start Date"] ? formatExcelDate(task["Product Start Date"]) : null,
            //         productEndDate: task["Product End Date"] ? formatExcelDate(task["Product End Date"]) : null,
            //         chargeName: task["Charge Name"] || null,
            //         chargeType: task["Charge Type"] || null,
            //         chargeAmount: task["Charge Amount"] || null,
            //         frequency: task["Frequency"] || null,
            //         prorated: task["Prorated"] || null,
            //         creditAdjAmt: task["Credit Adjustment Amount"] || null,
            //         debitAdjAmt: task["Debit Adjustment Amount"] || null,
            //         lastBillPeriod: task["Last Bill Period"] ? formatExcelDate(task["Last Bill Period"]) : null,
            //         nextBillPeriod: task["Next Bill Period"] ? formatExcelDate(task["Next Bill Period"]) : null,
            //         status: task["Status"] || null,
            //         validationRemark: null,
            //         validationStatus: null
            //     }

            // } 
            else if (selectedTemplateType === 'SALES_ORDER') {
                taskObject = {
                    indexId: count,
                    custNo: task["Customer No"] ? task["Customer No"].toString() : null,
                    soNo: task["Sales Order No"] || null,
                    soType: task["SO Type"] || null,
                    validationRemark: null,
                    validationStatus: null
                }
            } else if (selectedTemplateType === 'INCIDENT') {
                taskObject = {
                    indexId: count,
                    custNo: task["Customer No"] ? task["Customer No"].toString() : null,
                    hpsmRefNo: task["HPSM Ref Number"] || null,
                    validationRemark: null,
                    validationStatus: null
                }
            } else if (selectedTemplateType === 'ENTITY_TRANSACTION_MAPPING') {
                taskObject = {
                    indexId: count,
                    operationalUnit: task["Operational Unit"] || null,
                    department: task["Department"] || null,
                    roleName: task["Role"] || null,
                    productFamily: task["Product Family"] || null,
                    productType: task["Product Type"] || null,
                    productSubType: task["Product Sub Type"] || null,
                    serviceType: task["Service Type"] || null,
                    entityType: task["Entity Type"] || null,
                    transactionCategory: task["Transaction Category"] || null,
                    transactionType: task["Transaction Type"] || null,
                    validationRemark: null,
                    validationStatus: null
                }
            } else if (selectedTemplateType === 'BUSINESS_UNITS') {
                taskObject = {
                    indexId: count,
                    unitName: task["Unit Name"] || null,
                    unitDesc: task["Unit Description"] || null,
                    unitType: task["Unit Type"] || null,
                    parentUnit: task["Parent Unit Name"] || null,
                    roleName: task["Role Name"] || null,
                }
            } else if (selectedTemplateType === 'CALENDAR') {
                taskObject = {
                    indexId: count,
                    calendarName: task["Calendar Name"] || null,
                    calendarDescription: task["Calendar Description"] || null,
                    status: task["Status"] || null,
                    startDate: task["Start Date"] ? formatExcelDate(task["Start Date"]) : null,
                    endDate: task["End Date"] ? formatExcelDate(task["End Date"]) : null,
                }
            } else if (selectedTemplateType === 'SHIFT'){
                taskObject = {
                    indexId: count,
                    shiftShortName:task["Shift Short Name"] || null,
                    shiftDescription:task["Shift Description"] || null,
                    shiftStartTime:task["Start Time"] ? formatExcelTime(task["Start Time"]) : null,
                    shiftEndTime:task["End Time"] ? formatExcelTime(task["End Time"]) :null,
                    status:task["Status"] || null,
                    calendarName:task["Calendar Name"] || null,
                }
            } else if (selectedTemplateType === 'HOLIDAY_CALENDAR') {
                taskObject = {
                    indexId: count,
                    calendarName: task["Calendar Name"] || null,
                    holidayDayName: task["Holiday Day Name"] || null,
                    holidayDescription: task["Holiday Description"] || null,
                    holidayType: task["Holiday Type"] || null,
                    holidayDate: task["Holiday Date"] ? formatExcelDate(task["Holiday Date"]) : null,
                }
            } else if (selectedTemplateType === 'SKILL') {
                taskObject = {
                    indexId: count,
                    skillDescription: task["Skill Description"] || null,
                    serviceCategory: task["Service Category"] || null,
                    serviceType: task["Service Type"] || null,
                    entityName: task["Entity Name"] || null,
                    entityCategory: task["Entity Category"] || null,
                    entityType: task["Entity Type"] || null,
                }
            } else if (selectedTemplateType === 'USER_SKILL') {
                taskObject = {
                    indexId: count,
                    skillDescription: task["Skill Description"] || null,
                    emailId: task["Email Id"] || null,
                }
            } else if (selectedTemplateType === 'APPOINTMENT'){
                taskObject = {
                    indexId: count,
                    appointmentName: task["Appointment Name"] || null,
                    appointmentType: task["Appointment Type"] || null,
                    userGroup: task["User Group"] || null,
                    templateName: task["Template Name"] || null,
                    notificationName: task["Notification Name"] || null,
                    locations: task["Location"] || null,
                    calenderName: task["Calender Name"] || null,
                    shiftName: task["Shift Name"] || null,
                    workingType: task["Working Type"] || null,
                    appointmentDate: task["Appointment Date"] ? formatExcelDate(task["Appointment Date"]) : null,
                    appointmentStartTime:  task["Appointment Start Time"] ? formatExcelTime(task["Appointment Start Time"]) : null,
                    appointmentEndTime:  task["Appointment End Time"] ? formatExcelTime(task["Appointment End Time"]) : null,
                    userName: task["User Name"] || null,
                    userEmailid: task["User Email Id"] || null,
                    eventType: task["Event Type"] || null
                }
            } else if (selectedTemplateType === 'CONTRACT'){
                taskObject = {
                    indexId: count,
                    billingContractRefNumber: task["Billing Contract Ref Number"] || null,
                    orderNumber	: task["Order Number"] || null,
                    status : task["Status"] || null,
                    reason: task["Reason"] || null,
                    contractStartDate: task["Contract Start Date"] ? formatExcelDate(task["Contract Start Date"]) : null,
                    productName	: task["Product Name"] || null,
                    productDescription	: task["Product Description"] || null,
                    billingStartDate	: task["Billing Start Date"] ? formatExcelDate(task["Billing Start Date"]) :  null,
                    consumptionBaseProduct	: task["Consumption Base Product"] || null,
                    consumptionType: task["Consumption Type"] || null,	
                    chargeType	: task["Charge Type"] || null,
                    geoLocation	: task["Geo Location"] || null,
                    unitPrice	: task["Unit Price"] || null,
                    totalProductChargeAmount : task["Total Product Charge Amount"] || null,
                    balanceAmount	: task["Balance Amount"] || null,
                    duration: task["Duration"] || null,
                    frequency: task["Frequency"] || null,
                    quantity: task["Quantity"] || null,
                    advanceFlag: task["Advance Flag"] || null,
                    creditAdjustmentAmount	: task["Credit Adjustment Amount"] || null,
                    debitAdjustmentAmount: task["Debit Adjustment Amount"] || null,
                    advancePaymentAllocation	: task["Advance Payment Allocation"] || null,
                    allocationPercentage: task["Allocation Percentage"] || null,
                }
            } else if(selectedTemplateType === "INVOICE"){
                taskObject = {
                    indexId: count,
                    invoiceRefNumber : task["Invoice Ref Number"],
                    invoiceDetailRefNumber: task["Invoice Detail Ref Number"],
                    invoiceDate: task["Invoice Date"]  ? formatExcelDate(task["Invoice Date"]) : null,
                    dueDate: task["Due Date"]? formatExcelDate(task["dueDate"]) : null,
                    status: task["Status"],
                    reason: task["Reason"],
                    customerRefNo: task["Customer Reference No"],
                    emailid: task["Email ID"],
                    orderRefNo: task["Order Reference Number"],
                    contractRefNo: task["Contract Reference Number"],
                    productName : task["Product Name"],
                    productDescription: task["Product Description"],
                    invoiceDetailsStartDate: task["Invoice Details Start Date"]? formatExcelDate(task["Invoice Details Start Date"]) : null,
                    invoiceDetailsEndDate: task["Invoice Details End Date"]? formatExcelDate(task["Invoice Details End Date"]) : null,
                    quantity: task["Quantity"],
                    creditAdjAmount: task["Credit Adjustment"],
                    debitAdjAmount: task["Debit Adjustment"],
                    invoiceDetailAmount: task["Invoice Detail Amount"],
                    invoiceDetailOsAmount: task["Invoice Detail OS Amount"]
                }
            } else if (selectedTemplateType === "PAYMENT"){
                taskObject = {
                    indexId: count,
                    paymentRefNumber: task["Payment Ref Number"] || null,
                    customerRefNumber: task["Customer Reference No"] ||null,
                    invoiceRefNumber: task["Invoice Ref Number"] || null,
                    invoiceDetailRefNumber: task["Invoice Detail Ref Number"] || null,
                    status: task["Status"] || null,
                    reason: task["Reason"] || null,
                    currency: task["Currency"] || null,
                    paymentMode: task["Payment Mode"] || null,
                    paymentModeIfOth: task["Payment Mode if Others"] || null,
                    paymentAmount: task["Payment Amount"] || null, 
                    paymentDate:  task["Payment Date"] ? formatExcelDate(task["Payment Date"]) : null,
                    paymentLocation: task["Payment Location"] || null,
                    invoiceDetailAmount:task["Invoice Detail Amount"] || null
                }
            }
            tempTaskList.push(taskObject)
        })

        toast.success(fileName + ' Uploaded Successfully');
        setUploadTemplateList({ ...uploadTemplateList, uploadList: tempTaskList, rejectedList: [], finalList: [] })
        setTemplateUploadCounts({ ...templateUploadCounts, total: tempTaskList.length, failed: 0, success: 0 })
        setTemplateStatusFlags({
            validateCheck: false,
            showErrorCheck: false,
            proceedCheck: false
        })
        hideSpinner()
    }

    const trimObjValues = (obj) => {
        return Object.keys(obj).reduce((acc, curr) => {
            let value = obj[curr];
            curr = curr.trim();
            // console.log(curr);
            acc[curr] = typeof value == 'string' ? value.trim() : value;
            // console.log(acc);
            return acc;
        }, {});
    }

    const readExcel = (file) => {
        let sheetName = bulkUploadTemplateList.find(x => x.type === selectedTemplateType)?.displayName;
        let error = false
        let fi = document.getElementById('file');
        var extension = file.name.substr(file.name.lastIndexOf('.'));
        if ((extension.toLowerCase() === ".xls") || (extension.toLowerCase() === ".xlsx")) {
            error = false
        }
        else {
            error = true
            toast.error(file.name + ' is not a excel file, Please try again');
            hideSpinner()
            handleFileRejection()
            return false;
        }
        if (fi.files.length > 0) {
            for (let i = 0; i <= fi.files.length - 1; i++) {
                let fsize = fi.files.item(i).size;
                if (fsize > 5242880) {
                    error = true
                    toast.error("File too Big, Please Select a File less than 4mb");
                    setFile(null)
                    setFileName("")
                    handleFileRejection()
                    hideSpinner()
                }
            }
        }
        if (error) {
            console.error(error)
            hideSpinner()
            return;
        }
        else {
            const promise = new Promise((resolve, reject) => {
                const fileReader = new FileReader();
                fileReader.readAsArrayBuffer(file);
                fileReader.onload = (e) => {
                    const bufferArray = e.target.result;
                    const wb = XLSX.read(bufferArray, { type: "buffer" });
                    // const wsname = wb.SheetNames[0];
                    // console.log({ sheetName });
                    const ws = wb.Sheets['Sheet1'];
                    const range = { s: { r: 7, c: 0 }, e: { r: ws['!ref'].split(':')[1], c: 0 } };
                    // console.log(range);
                    const rangeA1 = XLSX.utils.encode_range(range);
                    const data = XLSX.utils.sheet_to_json(ws, { range: rangeA1 })
                    let result = data.map(el => {
                        return trimObjValues(el)
                    })
                    resolve(result);
                };
                fileReader.onerror = (error) => {
                    hideSpinner()
                    reject(error);
                };
            });
            promise.then((d) => {
                handleFileUpload(d);
                fi.value = "";
            }).catch((error) => {
                console.log(error)
            });
        }
    };

    const validateFileInput = (e) => {
        const { target } = e;
        if (target.closest('.excel')) {
            if (selectedTemplateType === '') {
                toast.error('Please Select Template Type');
            }
        }
    }

    return (
        <div className='col-md-12'>
            <div className="row">
                <div className="col-lg-5 col-md-5 col-xs-12 pt-0">
                    <div className="">
                        <label htmlFor="selectedTemplateType" className="col-md-7 col-form-label text-md-left">
                            Select Sample Excel/CSV Template
                        </label>
                        <div className="col-md-12">
                            <select name="selectedTemplateType" className="form-control" id="selectedTemplateType" value={selectedTemplateType} onChange={(e) => {
                                setShowImportantInstruction(!(e.target.value === ''))
                                setSelectedTemplateType(e.target.value)
                            }}>
                                <option value="">Select Template</option>
                                {bulkUploadTemplateList?.map((el, idx) => (
                                    <option key={idx} value={el.type}>{el.displayName}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <br />
                </div>
                {(selectedTemplateType && selectedTemplateType !== '') &&
                    <div className="col-lg-6 col-md-6 col-xs-12">
                        {(bulkUploadTemplateList && bulkUploadTemplateList.length > 0) && bulkUploadTemplateList.map((temp, index) => (
                            <React.Fragment>
                                {
                                    temp?.type === selectedTemplateType &&
                                    <>
                                        <span className='skel-heading'>{temp?.description}</span>
                                        <div className="skel-migration-template" key={index}>
                                            <div className="skel-template-excl">

                                                <a className='cursor-pointer' download={temp?.name} href={temp?.template + `#${temp.displayName}!A1`}>
                                                    <span className="avatar-title bg-primary rounded">
                                                        <i className="mdi mdi-microsoft-excel font-22"></i>
                                                    </span>
                                                </a>

                                            </div>
                                            <div className="skel-template-excl">
                                                <a className="cursor-pointer text-black font-weight-bold" download={temp?.name} href={temp?.template + `#${temp.displayName}!A1`}>{temp?.name}</a>
                                                {/* <p className="mb-0">1.11 MB</p> */}
                                            </div>
                                            <div className="skel-template-excl">
                                                <a className="cursor-pointer btn btn-link btn-lg text-muted" download={temp?.name} href={temp?.template + `#${temp.displayName}!A1`}>
                                                    <i className="dripicons-download"></i>
                                                </a>
                                            </div>
                                        </div>
                                    </>
                                }
                            </React.Fragment>
                        ))}
                    </div>
                }
                <div className="col-12 pt-2">
                    <div className="custom-accordioncustomer skill" id="custom-accordion-one" >
                        <div className="card-header" id="headingTen">
                            <h5 className="m-0 position-relative" /*onClick={() => {setShowImportantInstruction(!showImportantInstruction)}}*/>
                                <a className="cursor-pointer custom-accordion-title text-reset d-block" data-toggle="collapse" data-target="#collapseTen" aria-expanded="true" aria-controls="collapseTen">
                                    Important Instructions <i className={`mdi mdi-chevron-${showImportantInstruction ? 'down' : 'right'} accordion-arrow`}></i>
                                </a>
                            </h5>
                        </div>
                        {(showImportantInstruction && selectedTemplateType !== '') &&
                            <div id="collapseTen" className="collapse show" aria-labelledby="headingTen" data-parent="#custom-accordion-one" >
                                <div>
                                    <div className="col-md-12 row pt-2 pl-2">
                                        <div className="border bg-light p-2 mb-2">
                                            {(bulkUploadTemplateList && bulkUploadTemplateList.length > 0) && bulkUploadTemplateList.map((temp, index) => (
                                                <React.Fragment>
                                                    {
                                                        temp?.type === selectedTemplateType &&
                                                        <div className="col-md-12" key={index}>
                                                            <p>These are the mandatory fields required for the migration. The Excel sheet template should contain these mandatory fields</p>
                                                            <p></p>
                                                            {/* <p>Es un hecho establecido hace demasiado tiempo que un lector se distraerá con el contenido del texto de un sitio mientras que mira su diseño. El punto de usar Lorem Ipsum es que tiene una distribución más o menos normal de las letras, al contrario de usar textos como por ejemplo "Contenido aquí, contenido aquí". </p> */}
                                                            <h4>Mandatory Fields</h4>
                                                            <div className="card-body">
                                                                <div className="row col-12">
                                                                    {
                                                                        temp?.mandatoryColumns && temp?.mandatoryColumns.length > 0 && temp?.mandatoryColumns.map((column) => (
                                                                            <div className="col-4">
                                                                                <ul className="list-group">
                                                                                    {
                                                                                        column.length > 0 && column.map((name, i) => (
                                                                                            <li className="list-group-item" key={i}>{name}</li>
                                                                                        ))
                                                                                    }
                                                                                </ul>
                                                                            </div>
                                                                        ))
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
                <div className="col-12 pt-2">
                    <div className=" pl-2">
                        <span className="skel-heading">File Upload</span>
                    </div>
                </div>
                <div className="col-12">
                    <div className="form-group col-12">
                        <label htmlFor="email_address" className="pl-2 col-form-label text-md-left">Choose the file to Upload</label>
                    </div>
                    <div className="">
                        <div className="">
                            <fieldset className="">
                                <div className="file-upload" >
                                    <div className="file-select" onClick={validateFileInput}>
                                        <div className="file-select-button skel-btn-submit" id="fileName" >Choose File</div>
                                        {selectedTemplateType !== '' &&
                                            <input
                                                type="file"
                                                accept=".xlsx, .xls"
                                                id="file"
                                                onChange={handleFileSelect}
                                            />
                                        }
                                    </div>
                                </div>
                                <div className="ml-3 d-flex">
                                    <div className="file-select">
                                        <div className="file-select-name" id="noFile">{fileName}</div>
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default DownloadTemplate


