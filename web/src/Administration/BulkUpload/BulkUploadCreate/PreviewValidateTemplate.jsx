import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import moment from 'moment'
import { hideSpinner, showSpinner } from '../../../common/spinner';
import DynamicTable from '../../../common/table/DynamicTable';
import { properties } from '../../../properties';
import { post, get } from '../../../common/util/restUtil';


const PreviewValidateTemplate = (props) => {


    const { selectedTemplateType, bulkUploadTemplateList, uploadTemplateList, templateUploadCounts, templateStatusFlags, fileName } = props.data
    const { setUploadTemplateList, setTemplateUploadCounts, setTemplateStatusFlags } = props.handler
    const validateEmail = (mail) => {

        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {

            return true
        }
        return false
    }

    /** Only for Appoinment bulkupload check */
    const validateEmails = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };


    const validateDate = (date) => {
        const toDateFormat = moment(new Date(date)).format('DD-MM-YYYY');
        if (moment(toDateFormat, 'DD-MM-YYYY', true).isValid()) {
            return true;
        } return false
    }
    const handleCellRender = (cell, row) => {
        if (["Contract Start Date", "Contract End Date", "Contract Renewal Date", "Product Start Date", "Product End Date", "DOB", "Activation Date", "Expiry Date"].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD-MM-YYYY') : '-'}</span>)
        }
        return (<span>{cell.value}</span>)
    }

    const handleValidationResult = (invalidRecordFound, templateList, extraList) => {
        let rejectedList = [], acceptedList = []
        if (invalidRecordFound === true) {
            setTemplateStatusFlags({ ...templateStatusFlags, validateCheck: true, showErrorCheck: true })
        }
        else {
            setTemplateStatusFlags({ ...templateStatusFlags, validateCheck: true, showErrorCheck: false })
        }
        rejectedList = templateList.filter((record) => record?.validationStatus === 'FAILED')
        acceptedList = templateList.filter((record) => record?.validationStatus === 'SUCCESS')
        setTemplateUploadCounts({ ...templateUploadCounts, success: acceptedList.length, failed: rejectedList.length })
        setUploadTemplateList({ ...uploadTemplateList, rejectedList: rejectedList, finalList: acceptedList, extraList: extraList })
    }

    const handleValidate = () => {
        if (uploadTemplateList?.uploadList.length === 0) {
            toast.error("No Records to Validate")
            return
        }
        let invalidRecordFound = false
        let templateList = uploadTemplateList?.uploadList
        if (selectedTemplateType === 'CUSTOMER') {
            const customerRefNo = []
            const emailIds = []
            const mobileNos = []
            const idValues = []
            templateList.map((record) => {
                if (record?.lastName === null || record?.firstName === null || record?.customerCategory === null || record?.gender === null || record?.emailId === null
                    || record?.mobilePrefix === null || record?.mobileNo === null || record?.birthDate === null || record?.idType === null || record?.idValue === null
                    || record?.contactPreference === null || record?.address1 === null || record?.address2 === null || record?.state === null || record?.city === null
                    || record?.district === null || record?.country === null || record?.postcode === null || record?.status === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                }
                else if (['Business', 'Government'].includes(record?.customerCategory) && (record?.registeredNo === null && record?.registeredDate === null)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Registration Date and Registration Number is required for Business/Government Category'
                    invalidRecordFound = true
                }
                else if (customerRefNo.includes(record?.customerRefNo)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Duplicate Customer Ref No'
                    invalidRecordFound = true
                }
                else if (emailIds.includes(record?.emailId)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Duplicate Email ID'
                    invalidRecordFound = true
                }
                else if (mobileNos.includes(record?.mobileNo)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Duplicate Mobile No'
                    invalidRecordFound = true
                }
                else if (idValues.includes(record?.idValue)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Duplicate ID Value'
                    invalidRecordFound = true
                }
                else if ((record?.emailId !== null && validateEmail(record?.emailId) === false)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Invalid Email Format'
                    invalidRecordFound = true
                }
                else {
                    record.validationStatus = 'SUCCESS'
                }
                if (record?.customerRefNo) customerRefNo.push(record?.customerRefNo)
                if (record?.emailId) emailIds.push(record?.emailId)
                if (record?.mobileNo) mobileNos.push(record?.mobileNo)
                if (record?.idValue) idValues.push(record?.idValue)

                return record
            })

            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName
            }

            if (requestBody.list.length === 0) {
                if (templateList.filter((record) => record.validationStatus === 'FAILED').length > 0) {
                    handleValidationResult(invalidRecordFound, templateList, [])
                }
                else {
                    toast.error("No Records to Validate")
                }
                return false
            }
            showSpinner()
            post(properties.BULK_UPLOAD_API + '/customer/verify', requestBody)
                .then((response) => {
                    if (response.status === 200) {
                        templateList.map((record) => {
                            response.data.map((resp) => {
                                if (String(record?.emailId) === String(resp.emailId)) {
                                    if (resp.validationFlag === 'Y' && record.validationStatus === 'SUCCESS') {
                                        record.validationStatus = 'SUCCESS'
                                        record.tranId = resp?.customerTranId || {}
                                        record.bulkUploadId = resp?.bulkUploadId || {}
                                    }
                                    else if (resp.validationFlag === 'N') {
                                        record.validationStatus = 'FAILED'
                                        invalidRecordFound = true
                                        if (record?.validationRemark === null) {
                                            record.validationRemark = resp.validationRemarks
                                        }
                                    }
                                }
                            })
                            return record
                        })

                        handleValidationResult(invalidRecordFound, templateList, [])
                        toast.success("Records validated successfully.")
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
                .finally(hideSpinner)
        } else if (selectedTemplateType === 'USER') {
            let emails = []

            templateList.map((record) => {
                if (record?.emailId === null || record?.roleName === null || record?.department === null || record?.mobilePrefix === null ||
                    record?.firstName === null || record?.lastName === null || record?.gender === null || record?.mobileNo === null ||
                    record?.userType === null || record?.userFamily === null || record?.mobilePrefix === null || record?.birthDate === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                } else if (emails.includes(record?.emailId)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Duplicate Users'
                    invalidRecordFound = true
                }
                else if (record?.birthDate !== null && validateDate(record?.birthDate) === false) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Invalid Date Format'
                    invalidRecordFound = true
                } else if ((record?.emailId !== null && validateEmail(record?.emailId) === false)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Invalid Email Format'
                    invalidRecordFound = true
                }
                // } else if ((record?.managerEmail !== null && validateEmail(record?.managerEmail) === false)) {
                //     record.validationStatus = 'FAILED'
                //     record.validationRemark = 'Invalid Email Format'
                //     invalidRecordFound = true
                // }
                else {
                    record.validationStatus = 'SUCCESS'
                }
                emails.push(record?.email)
                return record
            })

            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName
            }
            if (requestBody.list.length === 0) {
                if (templateList.filter((record) => record.validationStatus === 'FAILED').length > 0) {
                    handleValidationResult(invalidRecordFound, templateList, [])
                }
                else {
                    toast.error("No Records to Validate")
                }
                return false

            }
            showSpinner()
            post(properties.BULK_UPLOAD_API + '/user/verify', requestBody)
                .then((response) => {
                    if (response.status === 200) {
                        templateList.map((record) => {
                            response.data.map((resp) => {
                                if (String(record?.emailId) === String(resp.emailId)) {
                                    if (resp.validationFlag === 'Y' && record.validationStatus === 'SUCCESS') {
                                        record.validationStatus = 'SUCCESS'
                                        record.tranId = resp?.usersTranId || {}
                                        record.bulkUploadId = resp?.bulkUploadId || {}
                                    }
                                    else if (resp.validationFlag === 'N') {
                                        record.validationStatus = 'FAILED'
                                        invalidRecordFound = true
                                        if (record?.validationRemark === null) {
                                            record.validationRemark = resp.validationRemarks
                                        }
                                    }
                                }
                            })
                            return record
                        })

                        handleValidationResult(invalidRecordFound, templateList, [])
                        toast.success("Records validated successfully.")
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
                .finally(hideSpinner)
        } else if (selectedTemplateType === 'REQUEST_STATEMENT') {
            let emails = []
            templateList.map((record) => {
                if (record?.intxnStatement === null || record?.intxnCategory === null || record?.intxnType === null ||
                    record?.serviceCategory === null || record?.serviceType === null || record?.priority === null ||
                    record?.reqStatementClass === null || record?.isAppointment === null || record?.isOrder === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                } else {
                    record.validationStatus = 'SUCCESS'
                }
                emails.push(record?.email)
                return record
            })

            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName

            }
            if (requestBody.list.length === 0) {
                if (templateList.filter((record) => record.validationStatus === 'FAILED').length > 0) {
                    handleValidationResult(invalidRecordFound, templateList, [])
                }
                else {
                    toast.error("No Records to Validate")
                }
                return false
            }

            showSpinner()
            post(properties.BULK_UPLOAD_API + '/request-statement/verify', requestBody)
                .then((response) => {
                    if (response.status === 200) {
                        templateList.map((record) => {
                            response.data.map((resp) => {
                                if (String(record?.intxnStatement) === String(resp.intxnStatement)) {
                                    if (resp.validationFlag === 'Y' && record.validationStatus === 'SUCCESS') {
                                        record.validationStatus = 'SUCCESS'
                                        record.tranId = resp?.reqStatTranId || {}
                                        record.bulkUploadId = resp?.bulkUploadId || {}
                                    }
                                    else if (resp.validationFlag === 'N') {
                                        record.validationStatus = 'FAILED'
                                        invalidRecordFound = true
                                        if (record?.validationRemark === null) {
                                            record.validationRemark = resp.validationRemarks
                                        }
                                    }
                                }
                            })
                            return record
                        })

                        handleValidationResult(invalidRecordFound, templateList, [])
                        toast.success("Records validated successfully.")

                    }
                })
                .catch((error) => {
                    console.error(error)
                })
                .finally(hideSpinner)
        } else if (selectedTemplateType === 'CHARGE') {
            let emails = []
            templateList.map((record) => {
                if (record?.chargeName === null || record?.chargeCategory === null || record?.serviceType === null ||
                    record?.chargeAmount === null || record?.currency === null || record?.startDate === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                } else if (record?.startDate !== null && validateDate(record?.startDate) === false) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Invalid Date Format'
                    invalidRecordFound = true
                } else {
                    record.validationStatus = 'SUCCESS'
                }
                emails.push(record?.email)
                return record
            })

            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName

            }
            if (requestBody.list.length === 0) {
                toast.error("No Records to Validate")
                return false
            }

            showSpinner()
            post(properties.BULK_UPLOAD_API + '/charge/verify', requestBody)
                .then((response) => {
                    if (response.status === 200) {
                        templateList.map((record) => {
                            response.data.map((resp) => {
                                if (String(record?.chargeName) === String(resp.chargeName)) {
                                    if (resp.validationFlag === 'Y' && record.validationStatus === 'SUCCESS') {
                                        record.validationStatus = 'SUCCESS'
                                        record.tranId = resp?.chargeTranId || {}
                                        record.bulkUploadId = resp?.bulkUploadId || {}
                                    }
                                    else if (resp.validationFlag === 'N') {
                                        record.validationStatus = 'FAILED'
                                        invalidRecordFound = true
                                        if (record?.validationRemark === null) {
                                            record.validationRemark = resp.validationRemarks
                                        }
                                    }
                                }
                            })
                            return record
                        })

                        handleValidationResult(invalidRecordFound, templateList, [])
                        toast.success("Records validated successfully.")

                    }
                })
                .catch((error) => {
                    console.error(error)
                })
                .finally(hideSpinner)
        } else if (selectedTemplateType === 'PRODUCT') {
            let productNames = []
            templateList.map((record) => {
                if (record?.productName === null || record?.productFamily === null || record?.productCategory === null || record?.productSubCategory === null
                    || record?.productType === null || record?.serviceClass === null || record?.serviceType === null || record?.provisioningType === null
                    || record?.productClass === null || record?.frequency === null || record?.chargeName === null || record?.uomCategory === null || record?.activationDate === null
                    || record?.isAppointRequired === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                }
                else if ((record?.activationDate !== null && validateDate(record?.activationDate) === false || record?.activationDate !== null && validateDate(record?.activationDate) === false)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Invalid Date Format'
                    invalidRecordFound = true
                }
                else if (record?.expiryDate && moment(record?.expiryDate).isBefore(record?.activationDate)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Expiry Date should be not be less Activation Date'
                    invalidRecordFound = true
                }
                else {
                    record.validationStatus = 'SUCCESS'
                }
                productNames.push(record?.productName)
                return record
            })

            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName
            }

            if (requestBody.list.length === 0) {
                if (templateList.filter((record) => record.validationStatus === 'FAILED').length > 0) {
                    handleValidationResult(invalidRecordFound, templateList, [])
                }
                else {
                    toast.error("No Records to Validate")
                }
                return false
            }
            showSpinner()
            post(properties.BULK_UPLOAD_API + '/product/verify', requestBody)
                .then((response) => {
                    if (response.status === 200) {
                        templateList.map((record) => {
                            response.data.map((resp) => {
                                if (String(record?.productName) === String(resp.productName)) {
                                    if (resp.validationFlag === 'Y' && record.validationStatus === 'SUCCESS') {
                                        record.validationStatus = 'SUCCESS'
                                        record.tranId = resp?.prodTranId || {}
                                        record.bulkUploadId = resp?.bulkUploadId || {}
                                    }
                                    else if (resp.validationFlag === 'N') {
                                        record.validationStatus = 'FAILED'
                                        invalidRecordFound = true
                                        if (record?.validationRemark === null) {
                                            record.validationRemark = resp.validationRemarks
                                        }
                                    }
                                }
                            })
                            return record
                        })
                        handleValidationResult(invalidRecordFound, templateList, [])
                        toast.success("Records validated successfully.")
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
                .finally(hideSpinner)

        } else if (selectedTemplateType === 'ORDER') {
            let productNames = []
            templateList.map((record) => {

                if (record?.orderRefNo === null || record?.orderDate === null || record?.customerName === null ||
                    record?.serviceName === null || record?.emailId === null || record?.orderCategory === null ||
                    record?.orderType === null || record?.orderSource === null || record?.orderChannel === null ||
                    record?.orderStatus === null || record?.orderFamily === null || record?.serviceCategory === null ||
                    record?.serviceType === null || record?.orderPriority === null || record?.orderDescription === null ||
                    record?.productName === null || record?.productQuantity === null || record?.billAmount === null ||
                    record?.contactPreference === null || record?.createdDept === null || record?.currDept === null ||
                    record?.createdRole === null || record?.currRole === null || record?.addressType === null ||
                    record?.address1 === null || record?.address2 === null || record?.district === null ||
                    record?.state === null || record?.postCode === null || record?.country === null
                ) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                } else if (record?.orderDate !== null && validateDate(record?.orderDate) === false) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Invalid Date Format'
                    invalidRecordFound = true
                } else {
                    record.validationStatus = 'SUCCESS'
                }
                productNames.push(record?.productName)
                return record
            })
            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName
            }
            if (requestBody.list.length === 0) {
                if (templateList.filter((record) => record.validationStatus === 'FAILED').length > 0) {
                    handleValidationResult(invalidRecordFound, templateList, [])
                }
                else {
                    toast.error("No Records to Validate")
                }
                return false
            }
            showSpinner()
            post(properties.BULK_UPLOAD_API + '/order/verify', requestBody)
                .then((response) => {
                    if (response.status === 200) {
                        templateList.map((record) => {
                            response.data.map((resp) => {
                                if (String(record?.emailId) === String(resp.emailId)) {
                                    if (resp.validationFlag === 'Y' && record.validationStatus === 'SUCCESS') {
                                        record.validationStatus = 'SUCCESS'
                                        record.tranId = resp?.orderTranId || {}
                                        record.bulkUploadId = resp?.bulkUploadId || {}
                                    }
                                    else {
                                        record.validationStatus = 'FAILED'
                                        invalidRecordFound = true
                                        if (record?.validationRemark === null) {
                                            record.validationRemark = resp.validationRemarks
                                        }
                                    }
                                }
                            })
                            return record
                        })
                        handleValidationResult(invalidRecordFound, templateList, [])
                        toast.success("Records validated successfully.")
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
                .finally(hideSpinner)
            //handleValidationResult(invalidRecordFound, templateList, [])
        } else if (selectedTemplateType === 'PROFILE') {
            let productNames = []
            let emails = []

            templateList.map((record) => {
                if (record?.firstName === null || record?.lastName === null || record?.gender === null
                    || record?.emailId === null || record?.profileCategory === null || record?.mobilePrefix === null
                    || record?.mobileNo === null
                ) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                } else if ((record?.emailId !== null && validateEmail(record?.emailId) === false)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Invalid Email Format'
                    invalidRecordFound = true
                }
                else if (record?.birthDate !== null && validateDate(record?.birthDate) === false) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Invalid Date Format'
                    invalidRecordFound = true
                } else if (emails.includes(record?.emailId)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Duplicate Users'
                    invalidRecordFound = true
                }
                else {
                    record.validationStatus = 'SUCCESS'
                }
                productNames.push(record?.productName)
                return record
            })
            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName
            }
            if (requestBody.list.length === 0) {
                if (templateList.filter((record) => record.validationStatus === 'FAILED').length > 0) {
                    handleValidationResult(invalidRecordFound, templateList, [])
                }
                else {
                    toast.error("No Records to Validate")
                }
                return false
            }
            showSpinner()
            post(properties.BULK_UPLOAD_API + '/profile/verify', requestBody)
                .then((response) => {
                    if (response.status === 200) {

                        templateList.map((record) => {
                            response.data.map((resp) => {
                                if (String(record?.emailId) === String(resp.emailId)) {
                                    if (resp.validationFlag === 'Y' && record.validationStatus === 'SUCCESS') {
                                        record.validationStatus = 'SUCCESS'
                                        record.tranId = resp?.profTranId || {}
                                        record.bulkUploadId = resp?.bulkUploadId || {}
                                    }
                                    else if (resp.validationFlag === 'N') {
                                        record.validationStatus = 'FAILED'
                                        invalidRecordFound = true
                                        if (record?.validationRemark === null) {
                                            record.validationRemark = resp.validationRemarks
                                        }
                                    }
                                }
                            })
                            return record
                        })

                        handleValidationResult(invalidRecordFound, templateList, [])
                        toast.success("Records validated successfully.")
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
                .finally(hideSpinner)
        } else if (selectedTemplateType === 'SERVICE') {
            let emails = []

            templateList.map((record) => {
                if (record?.customerRefNo === null || record?.accountRefNo === null || record?.serviceRefNo === null || record?.accountCategory === null ||
                    record?.accountType === null || record?.firstName === null || record?.lastName === null || record?.emailId === null ||
                    record?.mobileNo === null || record?.serviceName === null || record?.serviceCategory === null || record?.serviceType === null ||
                    record?.status === null || record?.serviceClass === null || record?.accountCurreny === null || record?.accountBillLanguage === null ||
                    record?.productName === null || record?.notificationPreference === null || record?.serviceProvisioningType === null ||
                    record?.addressType === null || record?.address1 === null || record?.address2 === null || record?.state === null ||
                    record?.postcode === null || record?.country === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                } else if ((record?.emailId !== null && validateEmail(record?.emailId) === false)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Invalid Email Format'
                    invalidRecordFound = true
                }
                // else if (record?.expiryDate !== null && validateDate(record?.activationDate) === false) {
                //     record.validationStatus = 'FAILED'
                //     record.validationRemark = 'Invalid Date Format'
                //     invalidRecordFound = true
                // }
                else if (emails.includes(record?.emailId)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Duplicate Users'
                    invalidRecordFound = true
                }
                // else if (moment(record?.endDate).isBefore(record?.startDate)) {
                //     record.validationStatus = 'FAILED'
                //     record.validationRemark = 'Product End Date should be not be less Product Start Date'
                //     invalidRecordFound = true
                // }
                else {
                    record.validationStatus = 'SUCCESS'
                }
                return record
            })
            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName
            }
            if (requestBody.list.length === 0) {
                if (templateList.filter((record) => record.validationStatus === 'FAILED').length > 0) {
                    handleValidationResult(invalidRecordFound, templateList, [])
                }
                else {
                    toast.error("No Records to Validate")
                }
                return false
            }
            showSpinner()
            post(properties.BULK_UPLOAD_API + '/service/verify', requestBody)
                .then((response) => {
                    if (response.status === 200) {

                        templateList.map((record) => {
                            response.data.map((resp) => {
                                if (String(record?.emailId) === String(resp.emailId)) {
                                    if (resp?.validationFlag === 'Y' && record.validationStatus === 'SUCCESS') {
                                        record.validationStatus = 'SUCCESS'
                                        record.tranId = resp?.serviceTranId || {}
                                        record.bulkUploadId = resp?.bulkUploadId || {}
                                    }
                                    else if (resp?.validationFlag === 'N') {
                                        record.validationStatus = 'FAILED'
                                        invalidRecordFound = true
                                        if (record?.validationRemark === null) {
                                            record.validationRemark = resp.validationRemarks
                                        }
                                    }
                                }
                            })
                            return record
                        })

                        handleValidationResult(invalidRecordFound, templateList, [])
                        toast.success("Records validated successfully.")
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
                .finally(hideSpinner)
        } else if (selectedTemplateType === 'INTERACTION') {
            let emails = []

            templateList.map((record) => {
                if (record?.customerRefNo === null || record?.accountRefNo === null || record?.serviceRefNo === null || record?.accountCategory === null ||
                    record?.accountType === null || record?.firstName === null || record?.lastName === null || record?.emailId === null ||
                    record?.mobileNo === null || record?.serviceName === null || record?.serviceCategory === null || record?.serviceType === null ||
                    record?.status === null || record?.serviceClass === null || record?.accountCurreny === null || record?.accountBillLanguage === null ||
                    record?.productName === null || record?.notificationPreference === null || record?.serviceProvisioningType === null ||
                    record?.addressType === null || record?.address1 === null || record?.address2 === null || record?.state === null ||
                    record?.postcode === null || record?.country === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                } else if ((record?.emailid !== null && validateEmail(record?.emailid) === false)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Invalid Email Format'
                    invalidRecordFound = true
                }
                else if (emails.includes(record?.emailId)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Duplicate Users'
                    invalidRecordFound = true
                }
                else {
                    record.validationStatus = 'SUCCESS'
                }
                return record
            })
            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName
            }
            if (requestBody.list.length === 0) {
                if (templateList.filter((record) => record.validationStatus === 'FAILED').length > 0) {
                    handleValidationResult(invalidRecordFound, templateList, [])
                }
                else {
                    toast.error("No Records to Validate")
                }
                return false
            }
            showSpinner()
            post(properties.BULK_UPLOAD_API + '/interaction/verify', requestBody)
                .then((response) => {
                    if (response.status === 200) {

                        templateList.map((record) => {
                            response.data.map((resp) => {
                                if (String(record?.emailId) === String(resp.emailId) && resp?.intxnRefNo === record?.intxnRefNo) {
                                    if (resp.validationFlag === 'Y' && record.validationStatus === 'SUCCESS') {
                                        record.validationStatus = 'SUCCESS'
                                        record.tranId = resp?.interactionTranId || {}
                                        record.bulkUploadId = resp?.bulkUploadId || {}
                                    }
                                    else if (resp.validationFlag === 'N') {
                                        record.validationStatus = 'FAILED'
                                        invalidRecordFound = true
                                        if (record?.validationRemark === null) {
                                            record.validationRemark = resp.validationRemarks
                                        }
                                    }
                                }
                            })
                            return record
                        })

                        handleValidationResult(invalidRecordFound, templateList, [])
                        toast.success("Records validated successfully.")
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
                .finally(hideSpinner)
        } else if (selectedTemplateType === 'USER_ROLE_MAPPING') {
            let emails = []
            templateList.map((record) => {

                if (record?.email === null || record?.roleDescription === null || record?.departmentDescription === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                }
                else if ((record?.email !== null && validateEmail(record?.email) === false)) {
                    record.validationStatus = 'FAILED'

                    record.validationRemark = 'Invalid Email Format'

                    invalidRecordFound = true

                }
                else if (emails.includes(record?.email)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Duplicate Users'
                    invalidRecordFound = true
                }
                else {
                    record.validationStatus = 'SUCCESS'
                }
                emails.push(record?.email)
                return record
            })

            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName
            }
            if (requestBody.list.length === 0) {
                toast.error("No Records to Validate")
                return false
            }

            showSpinner()
            post(properties.USER_API + '/verify-email', requestBody)
                .then((response) => {
                    if (response.status === 200) {

                        templateList.map((record) => {
                            response.data.map((resp) => {
                                if (record?.email === resp.email) {
                                    if (resp.validationStatus === 'SUCCESS' && record.validationStatus === 'SUCCESS') {
                                        record.validationStatus = 'SUCCESS'
                                        record.userDetails = resp?.userDetails || {}
                                    }
                                    else if (resp.validationStatus === 'FAILED') {
                                        record.validationStatus = 'FAILED'
                                        invalidRecordFound = true
                                        if (record?.validationRemark === null) {
                                            record.validationRemark = resp.validationRemark
                                        }
                                    }
                                }
                            })
                            return record
                        })

                        handleValidationResult(invalidRecordFound, templateList, [])
                        toast.success("Records validated successfully.")

                    }
                })
                .catch((error) => {
                    console.error(error)
                })
                .finally(hideSpinner)
        } else if (selectedTemplateType === 'BUSINESS_ENTITY') {

            let codes = []
            templateList.map((record) => {

                if (record?.code === null || record?.description === null || record?.codeType === null || record?.status === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                }

                else if (codes.includes(record?.code)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Duplicate Entries'
                    invalidRecordFound = true
                }
                else {
                    record.validationStatus = 'SUCCESS'
                }
                codes.push(record?.code)
                return record
            })

            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName
            }
            if (requestBody.list.length === 0) {
                toast.error("No Records to Validate")
                return false
            }
            showSpinner()
            post(properties.BUSINESS_PARAMETER_API + '/verify', requestBody)
                .then((response) => {
                    if (response.status === 200) {

                        templateList.map((record) => {
                            response.data.map((resp) => {
                                if (record?.code === resp.code) {
                                    if (resp.validationStatus === 'SUCCESS' && record.validationStatus === 'SUCCESS') {
                                        record.validationStatus = 'SUCCESS'
                                        record.businessEntityDetails = resp?.businessEntityDetails || {}
                                    }
                                    else if (resp.validationStatus === 'FAILED') {
                                        record.validationStatus = 'FAILED'
                                        invalidRecordFound = true
                                        if (record?.validationRemark === null) {
                                            record.validationRemark = resp.validationRemark
                                        }
                                    }
                                }
                            })
                            return record
                        })

                        handleValidationResult(invalidRecordFound, templateList, [])
                        toast.success("Records validated successfully.")
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
                .finally(hideSpinner)
        } else if (selectedTemplateType === 'ROLE') {
            let roleNames = []
            templateList.map((record) => {

                if (record?.roleName === null || record?.roleDescription === null || record?.isAdmin === null || record?.status === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                }

                else if (roleNames.includes(record?.roleName)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Duplicate Entries'
                    invalidRecordFound = true
                }
                else {
                    record.validationStatus = 'SUCCESS'
                }
                roleNames.push(record?.roleName)
                return record
            })

            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName
            }
            if (requestBody.list.length === 0) {
                toast.error("No Records to Validate")
                return false
            }
            showSpinner()
            post(properties.ROLE_API + '/verify', requestBody)
                .then((response) => {
                    if (response.status === 200) {

                        templateList.map((record) => {
                            response.data.map((resp) => {
                                if (record?.roleName === resp.roleName) {
                                    if (resp.validationStatus === 'SUCCESS' && record.validationStatus === 'SUCCESS') {
                                        record.validationStatus = 'SUCCESS'
                                        record.roleDetails = resp?.roleDetails || {}
                                    }
                                    else if (resp.validationStatus === 'FAILED') {
                                        record.validationStatus = 'FAILED'
                                        invalidRecordFound = true
                                        if (record?.validationRemark === null) {
                                            record.validationRemark = resp.validationRemark
                                        }
                                    }
                                }
                            })
                            return record
                        })

                        handleValidationResult(invalidRecordFound, templateList, [])
                        toast.success("Records validated successfully.")
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
                .finally(hideSpinner)
        } else if (selectedTemplateType === 'CUSTOMER_CONTRACT') {
            let previousEntries = []
            templateList.map((record) => {
                let duplicateFound = false
                for (const i of previousEntries) {
                    if (record?.contCategory === 'Header' && record.soNo === i.soNo && record.custContRefNo === i.custContRefNo) {
                        duplicateFound = true
                        break;
                    }
                }
                if (record?.custContRefNo === null || record?.soNo === null || record?.contCategory === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                }
                else if (record?.contCategory === 'Header' && (record?.contStartDate === null || record?.contEndDate === null || record?.contStatus === null || record?.contTotalAmt === null || record?.duration === null || record?.isContEvergreen === null || record?.advFlag === null)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                }
                else if (record?.contCategory === 'Lineitem' && (record?.chargeType === null || record?.prodName === null || record?.prodDesc === null || record?.quantity === null || record?.prodStartDate === null || record?.prodEndDate === null || record?.prodTotalAmt === null || record?.unitAmt === null || record?.lineItemStatus === null)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                }
                else if (record?.contCategory === 'Header' && (moment(record?.contEndDate).isBefore(record?.contStartDate))) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Contract End Date should be not be less Contract Start Date'
                    invalidRecordFound = true
                }
                else if (record?.contCategory === 'Lineitem' && (moment(record?.prodEndDate).isBefore(record?.prodStartDate))) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Product End Date should be not be less Product Start Date'
                    invalidRecordFound = true
                }
                else if (duplicateFound) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Duplicate Record'
                    invalidRecordFound = true
                }
                else {
                    record.validationStatus = 'SUCCESS'
                }
                if (record?.contCategory === 'Header') {
                    previousEntries.push({
                        contCategory: record.contCategory,
                        soNo: record.soNo,
                        custContRefNo: record.custContRefNo
                    })
                }
                return record
            })
            let requestBody = {
                list: templateList.filter((record) => (record?.contCategory === 'Header' && record.validationStatus === 'SUCCESS'))
            }
            if (requestBody.list.length === 0) {
                toast.error("No Records to Validate")
                return false
            }
            showSpinner()
            post(properties.ORDERS_API + '/validate-customer-contract', requestBody)
                .then((response) => {
                    if (response.data) {
                        templateList.map((record) => {
                            response.data.list.map((resp) => {
                                if (record?.soNo === resp.soNo && record.custContRefNo === resp.custContRefNo/*  && record.indexId === resp.indexId*/) {
                                    if (resp.validationStatus === 'SUCCESS' && record.validationStatus === 'SUCCESS') {
                                        record.validationStatus = 'SUCCESS'
                                        if (record?.contCategory === 'Header') {
                                            record.salesOrderDetails = resp.salesOrderDetails
                                            record.customerDetails = resp.customerDetails
                                            record.crmCustomerNo = resp.crmCustomerNo
                                        }
                                    }
                                    else if (resp.validationStatus === 'FAILED') {
                                        record.validationStatus = 'FAILED'
                                        invalidRecordFound = true
                                        if (record?.validationRemark === null) {
                                            record.validationRemark = resp.validationRemark
                                        }
                                    }
                                }
                            })
                            return record
                        })
                        handleValidationResult(invalidRecordFound, templateList, response?.data?.products || [])
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
                .finally(hideSpinner)
        }
        //  else if (selectedTemplateType === 'CONTRACT') {
        //     let previousEntries = []
        //     let customerRefNo = []
        //     templateList.map((record) => {
        //         // let duplicateFound = false
        //         // for (const i of previousEntries) {
        //         //     if (record?.billContRefNo === i.billContRefNo) {
        //         //         duplicateFound = true
        //         //         break;
        //         //     }
        //         // }


        //         if (record?.customerRefNo === null || record?.contractStartDate === null || record?.contractEndDate === null || record?.contractstatus === null || record?.productName === null ||
        //             record?.productStartDate === null || record?.productEndDate === null || record?.status === null) {
        //             record.validationStatus = 'FAILED'
        //             record.validationRemark = 'Mandatory Columns(Values) are Missing'
        //             invalidRecordFound = true
        //         }
        //         else if ((record?.productStartDate !== null && validateDate(record?.productStartDate) === false || record?.productEndDate !== null && validateDate(record?.productEndDate) === false || record?.chargeStartDate !== null && validateDate(record?.contractStartDate) === false || record?.contractEndDate !== null && validateDate(record?.contractEndDate) === false)) {
        //             record.validationStatus = 'FAILED'
        //             record.validationRemark = 'Invalid Date Format'
        //             invalidRecordFound = true
        //         }
        //         else if (moment(record?.contractEndDate).isBefore(record?.contractStartDate)) {
        //             record.validationStatus = 'FAILED'
        //             record.validationRemark = 'Contract End Date should be not be less Contract Start Date'
        //             invalidRecordFound = true
        //         }
        //         else if (moment(record?.productEndDate).isBefore(record?.productStartDate)) {
        //             record.validationStatus = 'FAILED'
        //             record.validationRemark = 'Product End Date should be not be less Product Start Date'
        //             invalidRecordFound = true
        //         }
        //         else if ((record?.chargeType == 'Usage' || record?.chargeType == 'Non Recurring') && (record?.frequency !== null || record?.prorated !== null)) {
        //             record.validationStatus = 'FAILED'
        //             record.validationRemark = 'Frequency and Prorated is not valid for Usage and Non Recurring Charge Type'
        //             invalidRecordFound = true
        //         }
        //         // else if (duplicateFound) {
        //         //     record.validationStatus = 'FAILED'
        //         //     record.validationRemark = 'Duplicate Record'
        //         //     invalidRecordFound = true
        //         // }
        //         else {
        //             record.validationStatus = 'SUCCESS'
        //         }
        //         customerRefNo.push(record?.customerRefNo)
        //         // previousEntries.push({

        //         //     billContRefNo: record.billContRefNo
        //         // })


        //         return record
        //     })

        //     let requestBody = {
        //         list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
        //         fileName
        //     }

        //     if (requestBody.list.length === 0) {
        //         toast.error("No Records to Validate")
        //         return false
        //     }

        //     handleValidationResult(invalidRecordFound, templateList, [])
        //     // showSpinner()
        //     // post(properties.ORDERS_API + '/verify-bill-contract', requestBody)
        //     //     .then((response) => {
        //     //         if (response.data) {
        //     //             templateList.map((record) => {
        //     //                 response.data.map((resp) => {
        //     //                     if (record?.billContRefNo === resp.billContRefNo && record.indexId === resp.indexId) {
        //     //                         if (resp.validationStatus === 'SUCCESS' && record.validationStatus === 'SUCCESS') {
        //     //                             record.validationStatus = 'SUCCESS'
        //     //                             record.customerId = resp.customerId
        //     //                             record.soId = resp.soId
        //     //                         }
        //     //                         else if (resp.validationStatus === 'FAILED') {
        //     //                             record.validationStatus = 'FAILED'
        //     //                             invalidRecordFound = true
        //     //                             if (record?.validationRemark === null) {
        //     //                                 record.validationRemark = resp.validationRemark
        //     //                             }
        //     //                         }
        //     //                     }
        //     //                 })
        //     //                 return record
        //     //             })
        //     //             handleValidationResult(invalidRecordFound, templateList, [])
        //     //         }
        //     //     })
        //     //     .catch((error) => {
        //     //         console.error(error)
        //     //     })
        //     //     .finally(hideSpinner)
        // } 
        else if (selectedTemplateType === 'SALES_ORDER') {
            let previousEntries = []
            templateList.map((record) => {
                if (record?.custNo === null || record?.soNo === null || record?.soType === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                }
                else if (previousEntries.includes(record?.soNo)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Duplicate Sales Order Number'
                    invalidRecordFound = true
                }
                else {
                    record.validationStatus = 'SUCCESS'
                }
                previousEntries.push(record?.soNo)
                return record
            })
            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName
            }
            if (requestBody.list.length === 0) {
                toast.error("No Records to Validate")
                return false
            }
            showSpinner()
            post(properties.ORDERS_API + '/verify-sales-order', requestBody)
                .then((response) => {
                    if (response.status === 200) {
                        //setUploadTemplateList({...uploadTemplateList,extraList: response?.data?.products || []}) 
                        templateList.map((record) => {
                            response.data.list.map((resp) => {
                                if (record?.soNo === resp.soNo && record.custNo === resp.custNo && record.indexId === resp.indexId) {
                                    if (resp.validationStatus === 'SUCCESS' && record.validationStatus === 'SUCCESS') {
                                        record.validationStatus = 'SUCCESS'
                                        record.salesOrderDetails = resp.salesOrderDetails || {}
                                        record.customerDetails = resp?.customerDetails || {}
                                        record.crmCustomerNo = resp?.crmCustomerNo
                                    }
                                    else if (resp.validationStatus === 'FAILED') {
                                        record.validationStatus = 'FAILED'
                                        invalidRecordFound = true
                                        if (record?.validationRemark === null) {
                                            record.validationRemark = resp.validationRemark
                                        }
                                    }
                                }
                            })
                            return record
                        })
                        handleValidationResult(invalidRecordFound, templateList, response?.data?.products || [])
                    }
                })
                .catch((error) => {
                    console.error(error)
                })
                .finally(hideSpinner)
        } else if (selectedTemplateType === 'INCIDENT') {
            templateList.map((record) => {
                if (record?.custNo === null || record?.hpsmRefNo === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                }
                else {
                    record.validationStatus = 'SUCCESS'
                }
                return record
            })
            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName
            }
            if (requestBody.list.length === 0) {
                toast.error("No Records to Validate")
                return false
            }
            showSpinner()
            post(properties.COMPLAINT_API + '/verify-incident', requestBody).then((response) => {
                if (response.status === 200) {
                    templateList.map((record) => {
                        response.data.list.map((resp) => {
                            if (record?.hpsmRefNo === resp.hpsmRefNo && record.custNo === resp.custNo && record.indexId === resp.indexId) {
                                if (resp.validationStatus === 'SUCCESS' && record.validationStatus === 'SUCCESS') {
                                    record.validationStatus = 'SUCCESS'
                                    record.incidentDetails = resp.incidentDetails || {}
                                }
                                else if (resp.validationStatus === 'FAILED') {
                                    record.validationStatus = 'FAILED'
                                    invalidRecordFound = true
                                    if (record?.validationRemark === null) {
                                        record.validationRemark = resp.validationRemark
                                    }
                                }
                            }
                        })
                        return record
                    })
                    handleValidationResult(invalidRecordFound, templateList, [])
                }
            }).catch((error) => {
                console.error(error)
            }).finally(hideSpinner)
        } else if (selectedTemplateType === 'ENTITY_TRANSACTION_MAPPING') {
            templateList.map((record) => {
                if (record?.operationalUnit === null || record?.department === null || record?.roleName === null
                    || record?.productFamily === null || record?.productType === null || record?.productSubType === null
                    || record?.serviceType === null || record?.entityType === null || record?.transactionCategory === null
                    || record?.transactionType === null
                ) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                }
                else {
                    record.validationStatus = 'SUCCESS'
                }
                return record
            });

            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName
            }

            if (requestBody.list.length === 0) {
                if (templateList.filter((record) => record.validationStatus === 'FAILED').length > 0) {
                    handleValidationResult(invalidRecordFound, templateList, [])
                }
                else {
                    toast.error("No Records to Validate")
                }
                return false
            }

            showSpinner()
            post(properties.BULK_UPLOAD_API + '/entity-transaction-mapping/verify', requestBody).then((response) => {
                if (response.status === 200) {
                    templateList.map((record) => {
                        response.data.map((resp) => {
                            if (record?.operationalUnit === resp?.operationalUnit && record?.department === resp?.department && record?.roleName === resp?.roleName
                                && record?.productFamily === resp?.productFamily && record?.productType === resp?.productType && record?.productSubType === resp?.productSubType
                                && record?.serviceType === resp?.serviceType && record?.entityType === resp?.entityType && record?.transactionCategory === resp?.transactionCategory
                                && record?.transactionType === resp?.transactionType) {
                                if (resp.validationFlag === 'Y' && record.validationStatus === 'SUCCESS') {
                                    record.validationStatus = 'SUCCESS'
                                    record.tranId = resp?.txnTranId || {}
                                    record.bulkUploadId = resp?.bulkUploadId || {}
                                }
                                else if (resp.validationFlag === 'N') {
                                    record.validationStatus = 'FAILED'
                                    invalidRecordFound = true
                                    if (record?.validationRemark === null) {
                                        record.validationRemark = resp.validationRemarks
                                    }
                                }
                            }
                        })
                        return record
                    })
                    handleValidationResult(invalidRecordFound, templateList, [])
                }
            }).catch((error) => {
                console.error(error)
            }).finally(hideSpinner)
        } else if (selectedTemplateType === 'BUSINESS_UNITS') {
            templateList.map((record) => {
                if (record?.unitName === null || record?.unitDesc === null || record?.unitType === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                }
                else if (record?.unitType && !!!(['ORG - Organisation Unit'].includes(record?.unitType)) && record?.parentUnit === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                } else if (record?.unitType && (['DEPT - Department'].includes(record?.unitType)) && record?.roleName === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                }
                else {
                    record.validationStatus = 'SUCCESS'
                }
                return record
            });

            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName
            }

            if (requestBody.list.length === 0) {
                if (templateList.filter((record) => record.validationStatus === 'FAILED').length > 0) {
                    handleValidationResult(invalidRecordFound, templateList, [])
                }
                else {
                    toast.error("No Records to Validate")
                }
                return false
            }

            showSpinner()
            post(properties.BULK_UPLOAD_API + '/business-units/verify', requestBody).then((response) => {
                if (response.status === 200) {
                    templateList.map((record) => {
                        let recordNew = response.data.find(x => x.unitName == record?.unitName && x.roleName == record?.roleName && x.unitDesc == record?.unitDesc && x.unitType == record?.unitType && x.parentUnit == record?.parentUnit)
                        if (recordNew.validationFlag === 'Y' && record.validationStatus === 'SUCCESS') {
                            record.validationStatus = 'SUCCESS'
                            record.tranId = recordNew?.buTranId || {}
                            record.bulkUploadId = recordNew?.bulkUploadId || {}
                        }
                        else if (recordNew.validationFlag === 'N') {
                            record.validationStatus = 'FAILED'
                            invalidRecordFound = true
                            if (!recordNew?.validationRemark) {
                                record.validationRemark = recordNew.validationRemarks
                            }
                        }
                        return record
                    })
                    handleValidationResult(invalidRecordFound, templateList, [])
                }
            }).catch((error) => {
                console.error(error)
            }).finally(hideSpinner)
        } else if (selectedTemplateType === 'CALENDAR') {
            templateList.map((record) => {
                if (record?.calendarName === null || record?.calendarDescription === null || record?.status === null || record?.startDate === null || record?.endDate === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                } else if (containsSpecialCharacters(record?.calendarName)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Calendar Name contain special character'
                    invalidRecordFound = true
                } else if (containsSpecialCharacters(record?.calendarDescription)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Calendar Description contain special character'
                    invalidRecordFound = true
                } else if (containsSpecialCharacters(record?.status)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Status contain special character'
                    invalidRecordFound = true
                } else {
                    record.validationStatus = 'SUCCESS'
                }
                return record
            })

            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName
            }

            if (requestBody.list.length === 0) {
                if (templateList.filter((record) => record.validationStatus === 'FAILED').length > 0) {
                    handleValidationResult(invalidRecordFound, templateList, [])
                }
                else {
                    toast.error("No Records to Validate")
                }
                return false
            }

            showSpinner()
            post(properties.BULK_UPLOAD_API + '/calendar/verify', requestBody).then((response) => {
                if (response.status === 200) {
                    templateList.map((record) => {
                        response.data.map((resp) => {
                            if (record?.calendarName === resp?.calendarName && record?.calendarDescription === resp?.calendarDescription && record?.status === resp?.status
                                && record?.startDate === resp?.startDate && record?.endDate === resp?.endDate) {
                                if (resp?.validationFlag === 'Y' && record?.validationStatus === 'SUCCESS') {

                                    record.validationStatus = 'SUCCESS'
                                    record.tranId = resp?.calendarTranId || {}
                                    record.bulkUploadId = resp?.bulkUploadId || {}
                                }
                                else {
                                    record.validationStatus = 'FAILED'
                                    invalidRecordFound = true
                                    if (record?.validationRemark === null) {
                                        record.validationRemark = resp.validationRemarks
                                    }
                                }
                            }
                        })
                        return record
                    })
                    handleValidationResult(invalidRecordFound, templateList, [])
                    toast.success("Records validated successfully.")

                }
            }).catch((error) => {
                console.error(error)
            }).finally(hideSpinner)
        } else if (selectedTemplateType === 'SHIFT') {
            templateList.map((record) => {
                if (record?.shiftShortName === null || record?.shiftDescription === null || record?.shiftStartTime === null || record?.shiftEndTime === null || record?.status === null || record?.calendarName === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                } else if (containsSpecialCharacters(record?.shiftShortName)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Shift Short Name contain special character'
                    invalidRecordFound = true
                } else if (containsSpecialCharacters(record?.shiftDescription)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Shift Description contain special character'
                    invalidRecordFound = true
                } else if (containsSpecialCharacters(record?.status)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Status contain special character'
                    invalidRecordFound = true
                } else if (!validateTime(record?.shiftStartTime)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Shift Start Time is not Valid'
                    invalidRecordFound = true
                } else if (!validateTime(record?.shiftEndTime)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Shift end Time is not Valid'
                    invalidRecordFound = true
                } else if (validateStartAndEndTine(record?.shiftStartTime, record?.shiftEndTime)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Shift end time cannot be greater than shift start time.'
                    invalidRecordFound = true
                }
                else {
                    record.validationStatus = 'SUCCESS'
                }
                return record
            })

            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName
            }

            if (requestBody.list.length === 0) {
                if (templateList.filter((record) => record.validationStatus === 'FAILED').length > 0) {
                    handleValidationResult(invalidRecordFound, templateList, [])
                }
                else {
                    toast.error("No Records to Validate")
                }
                return false
            }

            showSpinner()
            post(properties.BULK_UPLOAD_API + '/shift/verify', requestBody).then((response) => {
                if (response.status === 200) {
                    templateList.map((record) => {
                        response.data.map((resp) => {
                            record.shiftStartTime = record?.shiftStartTime ? moment(record?.shiftStartTime, 'hh:mm').format('hh:mm:ss') : record?.shiftStartTime
                            record.shiftEndTime = record?.shiftEndTime ? moment(record?.shiftEndTime, 'hh:mm').format('hh:mm:ss') : record?.shiftEndTime

                            if (record?.calendarName === resp?.calendarName && record?.shiftShortName === resp?.shiftShortName && record?.shiftDescription === resp?.shiftDescription
                                && record?.shiftStartTime === resp?.shiftStartTime && record?.shiftEndTime === resp?.shiftEndTime && record?.status === resp?.status) {
                                if (resp?.validationFlag === 'Y' && record?.validationStatus === 'SUCCESS') {
                                    record.validationStatus = 'SUCCESS'
                                    record.tranId = resp?.shiftTranId || {}
                                    record.bulkUploadId = resp?.bulkUploadId || {}
                                }
                                else {
                                    record.validationStatus = 'FAILED'
                                    invalidRecordFound = true
                                    if (!record?.validationRemark) {
                                        record.validationRemark = resp.validationRemarks
                                    }
                                }
                            }
                        })
                        return record
                    })
                    handleValidationResult(invalidRecordFound, templateList, [])
                    toast.success("Records validated successfully.")

                }
            }).catch((error) => {
                console.error(error)
            }).finally(hideSpinner)
        } else if (selectedTemplateType === 'HOLIDAY_CALENDAR') {
            // console.log("templateList before validation ===> ", templateList);
            templateList.map((record) => {
                if (record?.calendarName === null || record?.holidayDayName === null || record?.holidayDescription === null || record?.holidayType === null || record?.holidayDate === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                } else {
                    record.validationStatus = 'SUCCESS'
                }
                return record
            })
            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName
            }
            if (requestBody.list.length === 0) {
                if (templateList.filter((record) => record.validationStatus === 'FAILED').length > 0) {
                    handleValidationResult(invalidRecordFound, templateList, [])
                } else {
                    toast.error("No Records to Validate")
                }
                return false
            }
            // console.log("templateList after validation ===> ", templateList);
            showSpinner()
            post(properties.BULK_UPLOAD_API + '/holiday/calendar/verify', requestBody).then((response) => {
                if (response.status === 200) {
                    // templateList.map((record, index) => {
                    //     response.data.map((resp) => {
                    //         if (record?.calendarName === resp?.calendarName
                    //             && record?.holidayDayName === resp?.holidayDayName
                    //             && record?.holidayDate === resp?.holidayDate
                    //             && record?.holidayDescription === resp?.holidayDescription
                    //             && record?.holidayType === resp?.holidayType
                    //         ) {
                    //             if (resp?.validationFlag === 'Y' && record?.validationStatus === 'SUCCESS') {
                    //                 record.validationStatus = 'SUCCESS'
                    //                 record.tranId = resp?.holidayTranId || {}
                    //                 record.bulkUploadId = resp?.bulkUploadId || {}
                    //             } else if (resp.validationFlag === 'N') {
                    //                 record.validationStatus = 'FAILED'
                    //                 invalidRecordFound = true
                    //                 if (record?.validationRemark === null || record?.validationRemark === undefined) {
                    //                     record.validationRemark = resp.validationRemarks
                    //                 }
                    //             }
                    //             templateList[index] = record;
                    //         }
                    //     })
                    // })
                    let data = response.data;
                    for (let index = 0; index < data.length; index++) {
                        data[index]['responseValidated'] = false;
                    }
                    templateList.map((record) => {
                        let responseRecordIndex = data.findIndex(resp => {
                            return (record?.calendarName === resp?.calendarName
                                && record?.holidayDayName === resp?.holidayDayName
                                && record?.holidayDate === resp?.holidayDate
                                && record?.holidayDescription === resp?.holidayDescription
                                && record?.holidayType === resp?.holidayType
                                && resp?.responseValidated === false
                            );
                        })
                        console.log(data[responseRecordIndex]);
                        if (data[responseRecordIndex]?.validationFlag === 'Y') {
                            record.validationStatus = 'SUCCESS'
                            record.tranId = data[responseRecordIndex]?.holidayTranId || {}
                            record.bulkUploadId = data[responseRecordIndex]?.bulkUploadId || {}
                        } else if (data[responseRecordIndex]?.validationFlag === 'N') {
                            record.validationStatus = 'FAILED'
                            invalidRecordFound = true
                            if (record?.validationRemark === null || record?.validationRemark === undefined) {
                                record.validationRemark = data[responseRecordIndex]?.validationRemarks
                            }
                        }
                        data[responseRecordIndex]['responseValidated'] = true;
                        return record;
                    })

                    handleValidationResult(invalidRecordFound, templateList, [])
                    toast.success("Records validated successfully.")

                }
            }).catch((error) => {
                console.error(error)
            }).finally(hideSpinner)
        } else if (selectedTemplateType === 'SKILL') {
            templateList.map((record) => {
                if (record?.skillDescription === null || record?.serviceCategory === null || record?.serviceType === null || record?.entityName === null || record?.entityCategory === null || record?.entityType === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                } else {
                    record.validationStatus = 'SUCCESS'
                }
                return record
            })
            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName
            }
            if (requestBody.list.length === 0) {
                if (templateList.filter((record) => record.validationStatus === 'FAILED').length > 0) {
                    handleValidationResult(invalidRecordFound, templateList, [])
                }
                else {
                    toast.error("No Records to Validate")
                }
                return false
            }

            showSpinner()
            post(properties.BULK_UPLOAD_API + '/skill/verify', requestBody).then((response) => {
                if (response.status === 200) {
                    templateList.map((record) => {
                        response.data.map((resp) => {
                            if (record?.skillDescription === resp?.skillDescription && record?.serviceCategory === resp?.serviceCategory && record?.entityName === resp?.entityName
                                && record?.entityCategory === resp?.entityCategory && record?.entityType === resp?.entityType) {
                                if (resp?.validationFlag === 'Y' && record?.validationStatus === 'SUCCESS') {
                                    record.validationStatus = 'SUCCESS'
                                    record.tranId = resp?.skillTranId || {}
                                    record.bulkUploadId = resp?.bulkUploadId || {}
                                } else if (resp.validationFlag === 'N') {
                                    record.validationStatus = 'FAILED'
                                    invalidRecordFound = true
                                    if (record?.validationRemark === null || record?.validationRemark === undefined) {
                                        record.validationRemark = resp.validationRemarks
                                    }
                                }

                            }
                        })
                        return record
                    })
                    handleValidationResult(invalidRecordFound, templateList, [])
                    toast.success("Records validated successfully.")

                }
            }).catch((error) => {
                console.error(error)
            }).finally(hideSpinner)
        } else if (selectedTemplateType === 'USER_SKILL') {
            templateList.map((record) => {
                if (record?.skillDescription === null || record?.emailId === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                } else {
                    record.validationStatus = 'SUCCESS'
                }
                return record
            })
            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName
            }
            if (requestBody.list.length === 0) {
                if (templateList.filter((record) => record.validationStatus === 'FAILED').length > 0) {
                    handleValidationResult(invalidRecordFound, templateList, [])
                }
                else {
                    toast.error("No Records to Validate")
                }
                return false
            }

            showSpinner()
            post(properties.BULK_UPLOAD_API + '/user/skill/verify', requestBody).then((response) => {
                if (response.status === 200) {
                    templateList.map((record) => {
                        response.data.map((resp) => {
                            if (record?.skillDescription === resp?.skillDescription && record?.emailId === resp?.emailId) {
                                if (resp?.validationFlag === 'Y' && record?.validationStatus === 'SUCCESS') {
                                    record.validationStatus = 'SUCCESS'
                                    record.tranId = resp?.skillMapTranId || {}
                                    record.bulkUploadId = resp?.bulkUploadId || {}
                                } else if (resp.validationFlag === 'N') {
                                    record.validationStatus = 'FAILED'
                                    invalidRecordFound = true
                                    if (record?.validationRemark === null || record?.validationRemark === undefined) {
                                        record.validationRemark = resp.validationRemarks
                                    }
                                }
                            }
                        })
                        return record
                    })
                    handleValidationResult(invalidRecordFound, templateList, [])
                    toast.success("Records validated successfully.")

                }
            }).catch((error) => {
                console.error(error)
            }).finally(hideSpinner)
        } else if (selectedTemplateType === 'APPOINTMENT') {
            templateList.map((record) => {
                if (record?.appointmentName === null || record?.appointmentType === null || record?.userGroup === null || record?.templateName === null ||
                    record?.notificationName === null || record?.calendarName === null || record?.shiftName === null || record?.workingType === null || record?.appointmentDate === null ||
                    record?.appointmentStartTime === null || record?.appointmentEndTime === null || record?.userName === null || record?.userEmailId === null || record?.eventType === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                }
                else if (containsSpecialCharacters(record?.appointmentName)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Appointment Name contain special character'
                    invalidRecordFound = true
                } else if (containsSpecialCharacters(record?.appointmentType)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Appontment Type contain special character'
                    invalidRecordFound = true
                } else if (containsSpecialCharacters(record?.userGroup)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'User Group contain special character'
                    invalidRecordFound = true
                } else if (containsSpecialCharacters(record?.templateName)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Template Name contain special character'
                    invalidRecordFound = true
                } else if (containsSpecialCharacters(record?.notificationName)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Notification Name contain special character'
                    invalidRecordFound = true
                } else if (containsSpecialCharacters(record?.calendarName)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Calendar Name contain special character'
                    invalidRecordFound = true
                } else if (containsSpecialCharacters(record?.shiftName)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Shift Name contain special character'
                    invalidRecordFound = true
                } else if (containsSpecialCharacters(record?.workingType)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Working Type contain special character'
                    invalidRecordFound = true
                } else if (containsSpecialCharacters(record?.userName)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'User Name contain special character'
                    invalidRecordFound = true
                }
                else if ((record?.userEmailId !== null && validateEmails(record?.userEmailId) === false)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Invalid Email Format'
                    invalidRecordFound = true
                }
                else if (!validateTime(record?.appointmentStartTime)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Appointment Start Time is not Valid'
                    invalidRecordFound = true
                } else if (!validateTime(record?.appointmentEndTime)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Appointment End Time is not Valid'
                    invalidRecordFound = true
                } else if (validateStartAndEndTine(record?.appointmentStartTime, record?.appointmentEndTime)) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Appointment end time cannot be greater than appointment start time.'
                    invalidRecordFound = true
                } else if (!record?.locations && record?.appointmentType === 'Customer Visit') {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Location is required when appointment Type is customer visit'
                    invalidRecordFound = true
                } else {
                    record.validationStatus = 'SUCCESS'
                }
                return record
            })

            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName
            }

            if (requestBody.list.length === 0) {
                if (templateList.filter((record) => record.validationStatus === 'FAILED').length > 0) {
                    handleValidationResult(invalidRecordFound, templateList, [])
                }
                else {
                    toast.error("No Records to Validate")
                }
                return false
            }

            showSpinner()
            post(properties.BULK_UPLOAD_API + '/appointment/verify', requestBody).then((response) => {
                if (response.status === 200) {
                    templateList.map((record) => {
                        response.data.map((resp) => {
                            if (record?.appointmentName === resp?.appointmentName && record?.appointmentType === resp?.appointmentType && record?.userGroup === resp?.userGroup && record?.templateName === resp?.templateName &&
                                record?.notificationName === resp?.notificationName && record?.calendarName === resp?.calendarName && record?.shiftName === resp?.shiftName && record?.workingType === resp?.workingType && record?.appointmentDate === resp?.appointmentDate &&
                                record?.appointmentStartTime === resp?.appointmentStartTime && record?.appointmentEndTime === resp?.appointmentEndTime && record?.userName === resp?.userName && record?.userEmailId === resp?.userEmailId && record?.eventType === resp?.eventType) {
                                if (resp?.validationFlag === 'Y' && record?.validationStatus === 'SUCCESS') {
                                    record.validationStatus = 'SUCCESS'
                                    record.tranId = resp?.appointmentTranId || {}
                                    record.bulkUploadId = resp?.bulkUploadId || {}
                                }
                                else {
                                    record.validationStatus = 'FAILED'
                                    invalidRecordFound = true
                                    if (!record?.validationRemark) {
                                        record.validationRemark = resp.validationRemarks
                                    }
                                }
                            }
                        })
                        return record
                    })
                    handleValidationResult(invalidRecordFound, templateList, [])
                    toast.success("Records validated successfully.")
                }
            }).catch((error) => {
                console.error(error)
            }).finally(hideSpinner)
        } else if (selectedTemplateType === 'CONTRACT') {
            templateList.map((record) => {
                if (record?.status === null || record?.contractStartDate === null || record?.productName === null || record?.productDescription === null || record?.billingStartDate === null ||
                    record?.consumptionBaseProduct === null || record?.consumptionType === null || record?.chargeType === null || record?.unitPrice === null || record?.totalProductChargeAmount === null ||
                    record?.balanceAmount === null || record?.duration === null || record?.frequency === null || record?.quantity === null || record?.advanceFlag === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                }
                // else if (containsSpecialCharacters(record?.status)) {
                //     record.validationStatus = 'FAILED'
                //     record.validationRemark = 'Status contain special character'
                //     invalidRecordFound = true
                // } 
                // else if (containsSpecialCharacters(record?.billingContractRefNumber)) {
                //     record.validationStatus = 'FAILED'
                //     record.validationRemark = 'Billing Contract Reference number contain special character'
                //     invalidRecordFound = true
                // } 
                // else if (containsSpecialCharacters(record?.reason)) {
                //     record.validationStatus = 'FAILED'
                //     record.validationRemark = 'Reason contain special character'
                //     invalidRecordFound = true
                // } 
                // else if (containsSpecialCharacters(record?.productName)) {
                //     record.validationStatus = 'FAILED'
                //     record.validationRemark = 'Product Name contain special character'
                //     invalidRecordFound = true
                // } 
                // else if (containsSpecialCharacters(record?.productDescription)) {
                //     record.validationStatus = 'FAILED'
                //     record.validationRemark = 'Product Description contain special character'
                //     invalidRecordFound = true
                // } 
                // else if (containsSpecialCharacters(record?.consumptionBaseProduct)) {
                //     record.validationStatus = 'FAILED'
                //     record.validationRemark = 'Consumer Base Product contain special character'
                //     invalidRecordFound = true
                // } else if (containsSpecialCharacters(record?.consumptionType)) {
                //     record.validationStatus = 'FAILED'
                //     record.validationRemark = 'Consumer Type contain special character'
                //     invalidRecordFound = true
                // } else if (containsSpecialCharacters(record?.geoLocation)) {
                //     record.validationStatus = 'FAILED'
                //     record.validationRemark = 'Geo Location contain special character'
                //     invalidRecordFound = true
                // } else if (containsSpecialCharacters(record?.frequency)) {
                //     record.validationStatus = 'FAILED'
                //     record.validationRemark = 'Frequency contain special character'
                //     invalidRecordFound = true
                // }
                else {
                    record.validationStatus = 'SUCCESS'
                }
                return record
            })
            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName
            }

            if (requestBody.list.length === 0) {
                if (templateList.filter((record) => record.validationStatus === 'FAILED').length > 0) {
                    handleValidationResult(invalidRecordFound, templateList, [])
                }
                else {
                    toast.error("No Records to Validate")
                }
                return false
            }

            showSpinner()
            post(properties.BULK_UPLOAD_API + '/contract/verify', requestBody).then((response) => {
                if (response.status === 200) {
                    templateList.map((record) => {
                        response.data.map((resp) => {
                            if (record?.status === resp?.status && record?.contractStartDate === resp?.contractStartDate && record?.productName === resp?.productName && record?.productDescription === resp?.productDescription && record?.billingStartDate === resp?.billingStartDate &&
                                record?.consumptionBaseProduct === resp?.consumptionBaseProduct && record?.consumptionType === resp?.consumptionType && record?.chargeType === resp?.chargeType && Number(record?.unitPrice) === Number(resp?.unitPrice) && Number(record?.totalProductChargeAmount) === Number(resp?.totalProductChargeAmount) &&
                                Number(record?.balanceAmount) === Number(resp?.balanceAmount) && Number(record?.duration) === Number(resp?.duration) && record?.frequency === resp?.frequency && Number(record?.quantity) === Number(resp?.quantity) && record?.advanceFlag === resp?.advanceFlag) {
                                if (resp?.validationFlag === 'Y' && record?.validationStatus === 'SUCCESS') {
                                    record.validationStatus = 'SUCCESS'
                                    record.tranId = resp?.contractTranId || {}
                                    record.bulkUploadId = resp?.bulkUploadId || {}
                                }
                                else {
                                    record.validationStatus = 'FAILED'
                                    invalidRecordFound = true
                                    if (!record?.validationRemark) {
                                        record.validationRemark = resp.validationRemarks
                                    }
                                }
                            }
                        })
                        return record
                    })
                    handleValidationResult(invalidRecordFound, templateList, [])
                    toast.success("Records validated successfully.")
                }
            }).catch((error) => {
                console.error(error)
            }).finally(hideSpinner)
        } else if (selectedTemplateType === 'INVOICE') {
            templateList.map((record) => {
                if (record?.invoiceRefNumber === null || record?.invoiceDetailRefNumber === null || record?.invoiceDate === null || record?.dueDate === null || record?.status === null ||
                    record?.customerRefNo === null || record?.orderRefNo === null || record?.contractRefNo === null || record?.productName === null || record?.invoiceDetailsStartDate === null ||
                    record?.invoiceDetailsEndDate === null || record?.quantity === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                }
                // else if (containsSpecialCharacters(record?.invoiceRefNumber)) {
                //     record.validationStatus = 'FAILED'
                //     record.validationRemark = 'Invoice Reference Number contain special character'
                //     invalidRecordFound = true
                // }
                // else if (containsSpecialCharacters(record?.invoiceDetailRefNumber)) {
                //     record.validationStatus = 'FAILED'
                //     record.validationRemark = 'Invoice Details Reference number contain special character'
                //     invalidRecordFound = true
                // } 
                // else if (containsSpecialCharacters(record?.status)) {
                //     record.validationStatus = 'FAILED'
                //     record.validationRemark = 'Status contain special character'
                //     invalidRecordFound = true
                // } 
                // else if (containsSpecialCharacters(record?.customerRefNo)) {
                //     record.validationStatus = 'FAILED'
                //     record.validationRemark = 'Customer Reference No contain special character'
                //     invalidRecordFound = true
                // }
                // else if (containsSpecialCharacters(record?.orderRefNo)) {
                //     record.validationStatus = 'FAILED'
                //     record.validationRemark = 'order Reference Number contain special character'
                //     invalidRecordFound = true
                // } 
                // else if (containsSpecialCharacters(record?.contractRefNo)) {
                //     record.validationStatus = 'FAILED'
                //     record.validationRemark = 'Contract Reference Number contain special character'
                //     invalidRecordFound = true
                // } 
                // else if (containsSpecialCharacters(record?.productName)) {
                //     record.validationStatus = 'FAILED'
                //     record.validationRemark = 'Product Name contain special character'
                //     invalidRecordFound = true
                // } 
                // else if (containsSpecialCharacters(record?.quantity)) {
                //     record.validationStatus = 'FAILED'
                //     record.validationRemark = 'Quantity contain special character'
                //     invalidRecordFound = true
                // }
                else {
                    record.validationStatus = 'SUCCESS'
                }
                return record
            })

            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName
            }

            if (requestBody.list.length === 0) {
                if (templateList.filter((record) => record.validationStatus === 'FAILED').length > 0) {
                    handleValidationResult(invalidRecordFound, templateList, [])
                }
                else {
                    toast.error("No Records to Validate")
                }
                return false
            }

            showSpinner()
            post(properties.BULK_UPLOAD_API + '/invoice/verify', requestBody).then((response) => {
                if (response.status === 200) {
                    templateList.map((record) => {
                        response.data.map((resp) => {
                            if (record?.invoiceRefNumber === resp?.invoiceRefNumber || record?.invoiceDetailRefNumber === resp?.invoiceDetailRefNumber || record?.invoiceDate === resp?.invoiceDate
                                || record?.dueDate === resp?.dueDate || record?.status === resp?.status ||
                                record?.customerRefNo === resp?.customerRefNo || record?.orderRefNo === resp?.orderRefNo || record?.contractRefNo === resp?.contractRefNo || record?.productName === resp?.productName ||
                                record?.invoiceDetailsStartDate === resp?.invoiceDetailsStartDate ||
                                record?.invoiceDetailsEndDate === resp?.invoiceDetailsEndDate || record?.quantity === resp?.quantity) {
                                if (resp?.validationFlag === 'Y' && record?.validationStatus === 'SUCCESS') {
                                    record.validationStatus = 'SUCCESS'
                                    record.tranId = resp?.invoiceTranId || {}
                                    record.bulkUploadId = resp?.bulkUploadId || {}
                                }
                                else {
                                    record.validationStatus = 'FAILED'
                                    invalidRecordFound = true
                                    if (!record?.validationRemark) {
                                        record.validationRemark = resp.validationRemarks
                                    }
                                }
                            }
                        })
                        return record
                    })
                    handleValidationResult(invalidRecordFound, templateList, [])
                    toast.success("Records validated successfully.")
                }
            }).catch((error) => {
                console.error(error)
            }).finally(hideSpinner)

        } else if (selectedTemplateType === 'PAYMENT') {
            templateList.map((record) => {
                if (record?.paymentRefNumber === null || record?.customerRefNumber === null || record?.invoiceRefNumber === null || record?.invoiceDetailRefNumber === null || record?.status === null ||
                    record?.paymentAmount === null || record?.paymentDate === null || record?.invoiceDetailAmount === null) {
                    record.validationStatus = 'FAILED'
                    record.validationRemark = 'Mandatory Columns(Values) are Missing'
                    invalidRecordFound = true
                }
                // else if (containsSpecialCharacters(record?.status)) {
                //     record.validationStatus = 'FAILED'
                //     record.validationRemark = 'Status contain special character'
                //     invalidRecordFound = true
                // } 
                // else if (containsSpecialCharacters(record?.paymentAmount)) {
                //     record.validationStatus = 'FAILED'
                //     record.validationRemark = 'Payment Amount contain special character'
                //     invalidRecordFound = true
                // } 
                // else if (containsSpecialCharacters(record?.invoiceDetailAmount)) {
                //     record.validationStatus = 'FAILED'
                //     record.validationRemark = 'Invoice Detail Amount contain special character'
                //     invalidRecordFound = true
                // } 
                else {
                    record.validationStatus = 'SUCCESS'
                }
                return record
            })
            let requestBody = {
                list: templateList.filter((record) => record.validationStatus === 'SUCCESS'),
                fileName
            }

            if (requestBody.list.length === 0) {
                if (templateList.filter((record) => record.validationStatus === 'FAILED').length > 0) {
                    handleValidationResult(invalidRecordFound, templateList, [])
                }
                else {
                    toast.error("No Records to Validate")
                }
                return false
            }

            showSpinner()
            post(properties.BULK_UPLOAD_API + '/payment/verify', requestBody).then((response) => {
                if (response.status === 200) {
                    templateList.map((record) => {
                        response.data.map((resp) => {
                            if (String(record?.paymentRefNumber) === String(resp?.paymentRefNumber) && String(record?.customerRefNumber) === String(resp?.customerRefNumber)
                                && String(record?.invoiceRefNumber) === String(resp?.invoiceRefNumber) && String(record?.invoiceDetailRefNumber) === String(resp?.invoiceDetailRefNumber) && record?.status === resp?.status &&
                                Number(record?.paymentAmount) === Number(resp?.paymentAmount) && Number(record?.invoiceDetailAmount) === Number(resp?.invoiceDetailAmount)) {
                                if (resp?.validationFlag === 'Y' && record?.validationStatus === 'SUCCESS') {
                                    record.validationStatus = 'SUCCESS'
                                    record.tranId = resp?.paymentTranId || {}
                                    record.bulkUploadId = resp?.bulkUploadId || {}
                                }
                                else {
                                    record.validationStatus = 'FAILED'
                                    invalidRecordFound = true
                                    if (!record?.validationRemarks) {
                                        record.validationRemarks = resp.validationRemarks
                                    }
                                }
                            }
                        })
                        return record
                    })
                    handleValidationResult(invalidRecordFound, templateList, [])
                    toast.success("Records validated successfully.")
                }
            }).catch((error) => {
                console.error(error)
            }).finally(hideSpinner)
        }
    }

    const containsSpecialCharacters = (dataValue) => {
        // Regular expression pattern to match special characters
        var regex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

        // Test if the string contains any special character
        return regex.test(dataValue);
    }

    const validateTime = (dataValue) => {
        let isValidTime = false
        if (dataValue) {
            const momentObj = moment(dataValue, "hh:mm:ss");
            isValidTime = momentObj.isValid();
        }
        return isValidTime
    }

    const validateStartAndEndTine = (start, end) => {
        let isValidTime = false
        if (start && end) {
            const startTime = moment(start, "hh:mm:ss");
            const endTime = moment(end, "hh:mm:ss");
            isValidTime = startTime.isAfter(endTime)
        }
        return isValidTime
    }

    return (
        <div className="col-12 mb-3">
            <div className="mb-2">
                <div className="row">
                    <div className="skel-mig-info">
                        <p className={`font-weight-bold font-18`}>({templateUploadCounts?.total}) Rows of Records Found </p>
                        <p className={`text-danger font-weight-bold font-18 ${templateStatusFlags.validateCheck ? '' : 'd-none'}`}>({templateUploadCounts?.failed})  Invalid Record Found</p>
                        <p className={`text-success font-weight-bold font-18 ${templateStatusFlags.validateCheck ? '' : 'd-none'}`}>({templateUploadCounts?.success}) No. of Records Validation Success</p>
                    </div>
                </div>
                {uploadTemplateList?.uploadList && uploadTemplateList?.uploadList?.length > 0 &&
                    <div className="p-1">
                        <DynamicTable
                            row={templateStatusFlags.validateCheck === true ? uploadTemplateList?.finalList : uploadTemplateList?.uploadList}
                            itemsPerPage={10}
                            header={bulkUploadTemplateList.filter((temp) => temp?.type === selectedTemplateType)[0].tableColumns}
                            handler={{
                                handleCellRender: handleCellRender,
                            }}
                        />
                    </div>
                }
            </div>

            <div className="d-flex  justify-content-center">
                <button className="skel-btn-submit" onClick={handleValidate}>Validate</button>
            </div>

            {(templateStatusFlags.validateCheck && templateStatusFlags.showErrorCheck) &&
                <React.Fragment>
                    <div className=" bg-light border m-2 pr-2 mb-3">
                        <h5 className="text-primary pl-2">Validation Result</h5>
                    </div>
                    <p className="text-danger font-weight-bold font-13">Please correct the failed records and reupload again or you can skip the records</p>
                    {(uploadTemplateList?.rejectedList && uploadTemplateList?.rejectedList?.length > 0) &&
                        <div className="card p-1">
                            <DynamicTable
                                row={uploadTemplateList?.rejectedList}
                                itemsPerPage={10}
                                header={bulkUploadTemplateList.filter((temp) => temp?.type === selectedTemplateType)[0].tableColumns}
                                handler={{
                                    handleCellRender: handleCellRender,
                                }}
                            />
                        </div>
                    }
                    <div className="d-flex justify-content-center">
                        <div className="custom-control custom-checkbox">
                            <input type="checkbox" className="custom-control-input" id="proceedCheck" checked={templateStatusFlags.proceedCheck}
                                onChange={(e) => setTemplateStatusFlags({ ...templateStatusFlags, proceedCheck: e.target.checked })}
                            />
                            <label className="custom-control-label" htmlFor="proceedCheck">Skip Error Data and Proceed to migration</label>
                        </div>
                    </div>
                </React.Fragment>
            }
        </div>
    )
}

export default PreviewValidateTemplate