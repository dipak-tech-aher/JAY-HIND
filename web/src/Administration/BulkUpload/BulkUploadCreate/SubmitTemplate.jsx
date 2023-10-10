import React from 'react'
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";
import moment from 'moment'
import { hideSpinner, showSpinner } from '../../../common/spinner';

const SubmitTemplate = (props) => {

    const { selectedTemplateType, uploadStatusResponse } = props.data
    const exportToCSV = () => {
        showSpinner()
        const fileName = `${uploadStatusResponse?.uploadTableName.replace(' ', '_').toLowerCase()}_Migrated_Data_${moment(new Date()).format('DD MMM YYYY')}`
        const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const fileExtension = ".xlsx";
        let tableData = [];
        uploadStatusResponse?.finalList.forEach(element => {
            let objConstruct = {}
            if (uploadStatusResponse?.uploadTableName === 'CUSTOMER') {
                objConstruct["Customer Reference No"] = element?.customerRefNo
                objConstruct["Title"] = element?.title
                objConstruct["First Name"] = element?.firstName
                objConstruct["Last Name"] = element?.lastName
                objConstruct["Customer Category"] = element?.customerCategory
                objConstruct["Department"] = element?.department
                objConstruct["Projects"] = element?.projects
                objConstruct["Customer Class"] = element?.customerClass
                objConstruct["Martial Status"] = element?.customerMaritalStatus
                objConstruct["Occupation"] = element?.occupation
                objConstruct["Gender"] = element?.gender
                objConstruct["Email ID"] = element?.emailId
                objConstruct["Mobile Prefix"] = element?.mobilePrefix
                objConstruct["Mobile No"] = element?.mobileNo
                objConstruct["DOB"] = element?.birthDate
                objConstruct["ID Type"] = element?.idType
                objConstruct["ID Value"] = element?.idValue
                objConstruct["Nationality"] = element?.nationality
                objConstruct["Notification Type"] = element?.contactPreference
                objConstruct["Registeration No"] = element?.registeredNo
                objConstruct["Registeration Date"] = element?.registeredDate
                objConstruct["Address Type"] = element?.addressType
                objConstruct["Address 1"] = element?.address1
                objConstruct["Address 2"] = element?.address2
                objConstruct["Address 3"] = element?.address3
                objConstruct["District"] = element?.latitude
                objConstruct["City"] = element?.latitude
                objConstruct["State"] = element?.latitude
                objConstruct["Post code"] = element?.postcode
                objConstruct["Country"] = element?.country
                objConstruct["Latitude"] = element?.latitude
                objConstruct["Longitude"] = element?.longitude
                objConstruct["Telephone No Prefix"] = element?.telephonePrefix
                objConstruct["Telephone No"] = element?.telephoneNo
                objConstruct["WhastApp No Prefix"] = element?.whastappNoPrefix
                objConstruct["WhatsApp Number"] = element?.whastappNo
                objConstruct["FAX"] = element?.fax
                objConstruct["Facebook Id"] = element?.facebookId
                objConstruct["Instagram Id"] = element?.instagramId
                objConstruct["Telegram Id"] = element?.telegramId
                objConstruct["Status"] = element?.status
            } else if (uploadStatusResponse?.uploadTableName === 'PRODUCT') {
                objConstruct["Product Name"] = element?.productName
                objConstruct["Product Family"] = element?.productFamily
                objConstruct["Product Category"] = element?.productCategory
                objConstruct["Product Sub Category"] = element?.productSubCategory
                objConstruct["Product Type"] = element?.productType
                objConstruct["Service Class"] = element?.serviceClass
                objConstruct["Product Sub Type"] = element.productSubType
                objConstruct["Service Type"] = element?.serviceType
                objConstruct["Provisioning Type"] = element?.provisioningType
                objConstruct["Product Class"] = element?.productClass
                objConstruct["Bundle Name"] = element?.prodBundleName
                objConstruct["Charge Name"] = element?.chargeName
                // objConstruct["Charge Type"] = element?.chargeType
                // objConstruct["Charge Amount"]  = element?.chargeAmount
                // objConstruct["Advance Charge"] = element?.advanceCharge
                // objConstruct["Upfront Charge"] = element?.chargeUpfront
                objConstruct["Frequency"] = element?.frequency
                // objConstruct["Prorated"] = element?.prorated
                // objConstruct["Currency"] = element?.currency
                objConstruct["Contract Availability"] = element?.contractFlag
                objConstruct["Contract Duration"] = element?.contractInMonths
                objConstruct["UOM"] = element?.uomCategory
                // objConstruct["GL Code"] = element?.glcode 
                objConstruct["Expiry Date"] = element?.expiryDate
                objConstruct["Activation Date"] = element?.activationDate
                objConstruct["Is Appointment Required"] = element?.isAppointRequired
                objConstruct["Product Benefits"] = element?.productBenefits
            } else if (uploadStatusResponse?.uploadTableName === 'USER') {
                objConstruct["First Name"] = element?.firstName
                objConstruct["Last Name"] = element?.lastName
                objConstruct["Gender"] = element?.gender
                objConstruct["Email"] = element?.email
                objConstruct["Date of Birth"] = element?.dob
                objConstruct["User Category"] = element?.userCategory
                objConstruct["User Type"] = element?.userType
                objConstruct["User Family"] = element?.userFamily
                objConstruct["Country"] = element?.country
                objConstruct["Contact Prefix"] = element?.extn
                objConstruct["Contact Number"] = element?.contactNo
                objConstruct["Location"] = element?.location
                objConstruct["Projects"] = element?.projects
                objConstruct["Manager Email"] = element?.managerEmail
                objConstruct["Notification Type"] = element?.notificationType
                objConstruct["BI Access"] = element?.biAccess
                objConstruct["Role Name"] = element?.roleName
                objConstruct["Department Name"] = element?.departmentName
            } else if (uploadStatusResponse?.uploadTableName === 'REQUEST_STATEMENT') {
                objConstruct["Interaction statement"] = element?.requestStatement
                objConstruct["Interaction Category"] = element?.intxnCategory
                objConstruct["Interaction Type"] = element?.intxnType
                objConstruct["Service Category"] = element?.serviceCategory
                objConstruct["Service type"] = element?.serviceType
                objConstruct["Priority"] = element?.priority
                objConstruct["Interaction Statement Cause"] = element?.intxnCause
                objConstruct["Interaction Resolution"] = element?.intxnResolution
                objConstruct["Interaction Statement Class"] = element?.reqStatementClass
            } else if (uploadStatusResponse?.uploadTableName === 'BUSINESS ENTITY') {
                objConstruct["Code"] = element?.code
                objConstruct["Description"] = element?.description
                objConstruct["Code Type"] = element?.codeType
                objConstruct["Mapping Payload"] = element?.mappngPayload
                objConstruct["Status"] = element?.status
            } else if (uploadStatusResponse?.uploadTableName === 'ROLE') {
                objConstruct["Role Name"] = element?.roleName
                objConstruct["Role Description"] = element?.roleDescription
                objConstruct["Is Admin"] = element?.isAdmin
                objConstruct["Parent Role"] = element?.parentRole
                objConstruct["Status"] = element?.status
            }
            // if(uploadStatusResponse?.uploadTableName === 'USER_ROLE_MAPPING')
            // {
            //     objConstruct["Email"] = element?.email
            //     objConstruct["Role Description"] =  element?.roleDescription
            //     objConstruct["Department Description"] = element?.departmentDescription   
            // }
            else if (uploadStatusResponse?.uploadTableName === 'CUSTOMER CONTRACT') {
                objConstruct["Customer Contract Ref Number"] = element?.custContRefNo
                objConstruct["SO Number"] = element?.soNo
                objConstruct["Contract Category"] = element?.contCategory
                objConstruct["Charge Type"] = element?.chargeType
                objConstruct["Contract Start Date"] = element?.contStartDate
                objConstruct["Contract End Date"] = element?.contEndDate
                objConstruct["Contract Status"] = element?.contStatus
                objConstruct["Contract Total Amount"] = element?.contTotalAmt
                objConstruct["Product Name"] = element?.prodName
                objConstruct["Prod Desc"] = element?.prodDesc
                objConstruct["Qty"] = element?.quantity
                objConstruct["Product Start Date"] = element?.prodStartDate
                objConstruct["Product End Date"] = element?.prodEndDate
                objConstruct["Product Total Amount"] = element?.prodTotalAmt
                objConstruct["Unit Amount"] = element?.unitAmt
                objConstruct["Duration"] = element?.duration
                objConstruct["Line Item Status"] = element?.lineItemStatus
                objConstruct["Contract Renewal Date"] = element?.contRenewalDate
                objConstruct["Allocation Percentage"] = element?.allocationPercent
                objConstruct["Is Contract Evergreen"] = element?.isContEvergreen
                objConstruct["Advance Flag"] = element?.advFlag
            } else if (uploadStatusResponse?.uploadTableName === 'CONTRACT') {
                objConstruct["Contract Reference No"] = element?.contractRefNo
                objConstruct["Contract Start Date"] = element?.contractStartDate
                objConstruct["Contract End Date"] = element?.contractEndDate
                objConstruct["Contract Status"] = element?.contractstatus
                objConstruct["Product Name"] = element?.productName
                objConstruct["Service Reference No"] = element?.serviceRefNo
                objConstruct["Product Start Date"] = element?.productStartDate
                objConstruct["Product End Date"] = element?.productEndDate
                objConstruct["Charge Name"] = element?.chargeName
                objConstruct["Charge Type"] = element?.chargeType
                objConstruct["Charge Amount"] = element?.chargeAmount
                objConstruct["Frequency"] = element?.frequency
                objConstruct["Prorated"] = element?.prorated
                objConstruct["Credit Adjustment Amount"] = element?.creditAdjAmt
                objConstruct["Debit Adjustment Amount"] = element?.debitAdjAmt
                objConstruct["Last Bill Period"] = element?.lastBillPeriod
                objConstruct["Next Bill Period"] = element?.nextBillPeriod
                objConstruct["Status"] = element?.status

            } else if (uploadStatusResponse?.uploadTableName === 'SALES ORDER') {
                objConstruct["Customer No"] = element?.custNo
                objConstruct["Sales Order No"] = element?.soNo
                objConstruct["SO Type"] = element?.soType
            } else if (uploadStatusResponse?.uploadTableName === 'INCIDENT') {
                objConstruct["Customer No"] = element?.custNo
                objConstruct["HPSM Ref Number"] = element?.hpsmRefNo
            } else if (uploadStatusResponse?.uploadTableName === 'ENTITY_TRANSACTION_MAPPING') {
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
            } else if (uploadStatusResponse?.uploadTableName === 'BUSINESS_UNITS') {
                objConstruct["Unit Name"] = element?.unitName
                objConstruct["Unit Description"] = element?.unitDesc
                objConstruct["Unit Type"] = element?.unitType
                objConstruct["Parent Unit Name"] = element?.parentUnit
                objConstruct["Role Name"] = element?.roleName
            } else if (uploadStatusResponse?.uploadTableName === 'SERVICE') {
                objConstruct["Customer Reference No"] = element?.customerRefNo
                objConstruct["Account Reference No"] = element?.accountRefNo
                objConstruct["Service Reference No"] = element?.serviceRefNo
                objConstruct["Account Category"] = element?.accountCategory
                objConstruct["Account Type"] = element?.accountType
                objConstruct["First Name"] = element?.firstName
                objConstruct["Last Name"] = element?.lastName
                objConstruct["Email ID"] = element?.email
                objConstruct["Mobile No"] = element?.mobileNo
                objConstruct["Service Name"] = element?.serviceName
                objConstruct["Service Category"] = element?.serviceCategory
                objConstruct["Service Type"] = element?.serviceType
                objConstruct["Service Status"] = element?.status
                objConstruct["Service Class"] = element?.serviceClass
                objConstruct["Currency"] = element?.accountCurreny
                objConstruct["Bill Language"] = element?.accountBillLanguage
                objConstruct["Plan Reference No"] = element?.planReferenceNo
                objConstruct["Plan Name"] = element?.productName
                objConstruct["Quantity"] = element?.quantity
                // objConstruct["DOB"] = element?.
                objConstruct["Activation Date"] = element?.activationDate
                objConstruct["Expiry Date"] = element?.expiryDate
                objConstruct["Notification Preference"] = element?.notificationPreference
                objConstruct["Service Agreement"] = element?.serviceAgreement
                objConstruct["Service Limit"] = element?.serviceLimit
                objConstruct["Service Usage"] = element?.serviceUsage
                objConstruct["Service Balance"] = element?.serviceBalance
                objConstruct["Payment Method"] = element?.paymentMethod
                objConstruct["Service Provisioning Type"] = element?.serviceProvisioningType
                objConstruct["Address Type"] = element?.addressType
                objConstruct["Address 1"] = element?.address1
                objConstruct["Address 2"] = element?.address2
                objConstruct["Address 3"] = element?.address3
                objConstruct["City"] = element?.city
                objConstruct["State"] = element?.state
                objConstruct["District"] = element?.district
                objConstruct["Post code"] = element?.postcode
                objConstruct["Country"] = element?.country
                objConstruct["Latitude"] = element?.latitude
                objConstruct["Longitude"] = element?.longitude
                objConstruct["Telephone No Prefix"] = element?.telephonePrefix
                objConstruct["Telephone No"] = element?.telephoneNo
                objConstruct["WhatsApp No Prefix"] = element?.whatsappNoPrefix
                objConstruct["WhatsApp Number"] = element?.whatsappNo
                objConstruct["FAX"] = element?.fax
                objConstruct["Facebook Id"] = element?.facebookId
                objConstruct["Instagram Id"] = element?.instagramId
                objConstruct["Telegram Id"] = element?.telegramId
            } else if (uploadStatusResponse?.uploadTableName === 'CALENDAR') {
                objConstruct["Calendar Name"] = element?.calendarName
                objConstruct["Calendar Description"] = element?.calendarDescription
                objConstruct["Status"] = element?.status
                objConstruct["Start Date"] = element?.startDate
                objConstruct["End Date"] = element?.endDate
            } else if (uploadStatusResponse?.uploadTableName === 'SHIFT') {
                objConstruct["Shift Short Name"] = element?.shiftShortName
                objConstruct["Shift Description"] = element?.shiftDescription
                objConstruct["Start Time"] = element?.startTime
                objConstruct["End Time"] = element?.endTime
                objConstruct["Status"] = element?.status
                objConstruct["Calendar Name"] = element?.calendarName
            } else if (uploadStatusResponse?.uploadTableName === 'APPOINTMENT') {
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
            } else if (uploadStatusResponse?.uploadTableName === 'CONTRACT') {
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
                objConstruct["Credit Adjustment Amount"] = element?.creditAdjustmentAmount
                objConstruct["Debit Adjustment Amount"] = element?.debitAdjustmentAmount
                objConstruct["Advance Payment Allocation"] = element?.advancePaymentAllocation
                objConstruct["Allocation Percentage"] = element?.allocationPercentage
            } else if (uploadStatusResponse?.uploadTableName === 'INVOICE') {
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
            } else if (uploadStatusResponse?.uploadTableName === 'PAYMENT') {
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
            }
            tableData.push(objConstruct);
        })

        if (tableData.length !== 0) {
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
        hideSpinner()
    };

    return (
        <>
            {
                uploadStatusResponse?.finalList.length > 0 && uploadStatusResponse?.bulkUploadId &&
                <>
                    <div className='skel-bulk-upload-success'>
                        <h3 className="">Bulk Upload Success!</h3>
                        <div className='row p-3'>
                            <div className="form-group col-md-6">
                                <label htmlFor="email_address" className="col-12 col-form-label text-md-left">Upload Process ID</label>
                                <div className="text-left mt-2">{uploadStatusResponse?.bulkUploadId}</div>
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="email_address" className="col-12 col-form-label text-md-left">Bulk Upload Type</label>
                                <div className="text-left mt-2">{uploadStatusResponse?.uploadTableName}</div>
                            </div>
                            {/* <div className="col-12 form-group row">
                                <label htmlFor="email_address" className="col-4 col-form-label text-md-left">No of Records Attempted</label>
                                <div className="col-6 text-left mt-2">{uploadStatusResponse?.noOfRecordsAttempted}</div>
                            </div>
                            <div className="col-12 form-group row">
                                <label htmlFor="email_address" className="col-4 col-form-label text-md-left">Successfully Uploaded</label>
                                <div className="col-6 text-left mt-2">{uploadStatusResponse?.successfullyUploaded}</div>
                            </div>
                            <div className="col-12 form-group row">
                                <label htmlFor="email_address" className="col-4 col-form-label text-md-left">Failed</label>
                                <div className="col-6 text-left mt-2">{uploadStatusResponse?.failed}</div>
                            </div> */}
                            {/* <div className="col-12 form-group row">
                                <label htmlFor="email_address" className="col-4 col-form-label text-md-left">Uploaded By</label>
                                <div className="col-6 text-left mt-2">{(uploadStatusResponse?.createdByName?.firstName || '') + ' ' + (uploadStatusResponse?.createdByName?.lastName || '')}</div>
                            </div> */}
                            <div className="form-group col-md-6">
                                <label htmlFor="email_address" className="col-12 col-form-label text-md-left">Uploaded Date and Time</label>
                                <div className="text-left mt-2">{uploadStatusResponse?.createdAt ? moment(uploadStatusResponse?.createdAt).format('DD-MMM-YYYY hh:mm:ss A') : '-'}</div>
                            </div>
                            <div className="form-group col-md-6">
                                <label htmlFor="email_address" className="col-12 col-form-label text-md-left">Successfully Uploaded Data</label>
                                <div className="skel-migration-template">

                                    <div className="skel-template-excl">

                                        <a className='cursor-pointer' onClick={() => exportToCSV()}>
                                            <span className="avatar-title bg-primary rounded">
                                                <i className="mdi mdi-microsoft-excel font-22"></i>
                                            </span>
                                        </a>

                                    </div>
                                    <div className="skel-template-excl">
                                        <a className="cursor-pointer text-black font-weight-bold" onClick={() => exportToCSV()}>{`${uploadStatusResponse?.uploadTableName.replace(' ', '_').toUpperCase()}_TEMPLATE_${moment(new Date()).format('DD-MMM-YYYY')}.xlsx`}</a>
                                    </div>
                                    <div className="skel-template-excl">
                                        <a className="cursor-pointer btn btn-link btn-lg text-muted" onClick={() => exportToCSV()}>
                                            <i className="dripicons-download"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            }
        </>
    )
}

export default SubmitTemplate