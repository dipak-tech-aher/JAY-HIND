import moment from 'moment'
import { toast } from 'react-toastify'

import DynamicTable from '../../../../common/table/DynamicTable'
import { properties } from '../../../../properties'
import { post } from '../../../../common/util/restUtil'
import { ChildTicketTemplateColumns } from '../PreviewAndValidate/BulkUploadColumns'

const PreviewValidateSearch = (props) => {

    const { uploadTemplateList, templateUploadCounts, templateStatusFlags } = props?.data
    const { setUploadTemplateList, setTemplateUploadCounts, setTemplateStatusFlags } = props?.handler

    const handleCellRender = (cell, row) => {
        if (["Created Date"].includes(cell.column.Header)) {
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
        rejectedList = templateList.filter((record) => record.validationStatus === 'FAILED')
        acceptedList = templateList.filter((record) => record.validationStatus === 'SUCCESS')
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
        let interactionList = []

        templateList.map((record) => {

            if (record?.intxnId === null || record?.problemCode === null || record?.status === null) {
                record.validationStatus = 'FAILED'
                record.validationRemark = 'Mandatory Columns(Values) are Missing'
                invalidRecordFound = true
            }
            else if (interactionList.includes(record.intxnId)) {
                record.validationStatus = 'FAILED'
                record.validationRemark = 'Duplicate Interaction Ticket'
                invalidRecordFound = true
            }
            else if (record?.status.toLowerCase() === 'closed') {
                record.validationStatus = 'FAILED'
                record.validationRemark = 'Please check the Status. We are not Add Closed Child Tickets under Master Tickets'
                invalidRecordFound = true
            }
            else {
                record.validationStatus = 'SUCCESS'
            }
            interactionList.push(record?.intxnId)
            return record
        })

        let requestBody = {
            list: templateList.filter((record) => record.validationStatus === 'SUCCESS')
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
        
        post(properties.INTERACTION_API + '/verify-child-tickets', requestBody)
            .then((response) => {
                if (response.status === 200) {
                    templateList.map((record) => {
                        response.data.map((resp) => {
                            if (record.intxnId === resp.intxnId) {
                                if (resp.validationStatus === 'SUCCESS' && record.validationStatus === 'SUCCESS') {
                                    record.validationStatus = 'SUCCESS'
                                }
                                else if (resp.validationStatus === 'FAILED') {
                                    record.validationStatus = 'FAILED'
                                    invalidRecordFound = true
                                    if (record.validationRemark === null || record.validationRemark === undefined) {
                                        record.validationRemark = resp.validationRemark
                                    }
                                }
                            }
                        })
                    })
                    handleValidationResult(invalidRecordFound, templateList, [])
                }

            }).catch(error => {
                console.error(error)
            }).finally()
    }

    return (
        <div className="col-12 mb-3">
            <div className="mb-2">
                <div className="row">
                    <div className="col-12 text-sm-center form-inline">
                        <div className="form-group mr-2">
                        </div>
                        <div className="col-12 text-center">
                            <p className="text-center font-22">{templateUploadCounts?.total} Rows of Records Found </p>
                        </div>
                        <div className="col-md-12 text-left">
                            <p className={`text-danger font-weight-bold font-18 ${templateStatusFlags.validateCheck ? '' : 'd-none'}`}>{templateUploadCounts?.failed}  Invalid Record Found</p>
                        </div>
                        <div className="col-md-12 text-left pt-2">
                            <p className={`text-success font-weight-bold font-18 ${templateStatusFlags.validateCheck ? '' : 'd-none'}`}>{templateUploadCounts?.success} No. of Records Validation Success</p>
                        </div>
                    </div>
                </div>
                {
                    uploadTemplateList?.uploadList && uploadTemplateList?.uploadList?.length > 0 &&
                    <div className="card p-1">
                        <DynamicTable
                            row={templateStatusFlags.validateCheck === true ? uploadTemplateList?.finalList : uploadTemplateList?.uploadList}
                            itemsPerPage={10}
                            header={ChildTicketTemplateColumns}
                            handler={{
                                handleCellRender: handleCellRender,
                            }}
                        />
                    </div>
                }
            </div>

            <div className="d-flex  justify-content-center">
                <button className="btn btn-primary" onClick={handleValidate}>Validate</button>
            </div>

            {
                templateStatusFlags.validateCheck && templateStatusFlags.showErrorCheck &&
                <>
                    <div className=" bg-light border m-2 pr-2 mb-3">
                        <h5 className="text-primary pl-2">Validation Result</h5>
                    </div>
                    <p className="text-danger font-weight-bold font-13">Please correct the failed records and reupload again or you can skip the records</p>
                    {
                        uploadTemplateList?.rejectedList && uploadTemplateList?.rejectedList?.length > 0 &&
                        <div className="card p-1">
                            <DynamicTable
                                row={uploadTemplateList?.rejectedList}
                                itemsPerPage={10}
                                header={ChildTicketTemplateColumns}
                                handler={{
                                    handleCellRender: handleCellRender,
                                }}
                            />
                        </div>
                    }
                    <div className="d-flex justify-content-center pt-2">
                        <div className="custom-control custom-checkbox">
                            <input type="checkbox" className="custom-control-input" id="proceedCheck" checked={templateStatusFlags.proceedCheck}
                                onChange={(e) => setTemplateStatusFlags({ ...templateStatusFlags, proceedCheck: e.target.checked })}
                            />
                            <label className="custom-control-label" htmlFor="proceedCheck">Skip Error Data and Proceed to Selected Interaction as Child Tickets</label>
                        </div>
                    </div>
                </>
            }

        </div>
    )
}

export default PreviewValidateSearch