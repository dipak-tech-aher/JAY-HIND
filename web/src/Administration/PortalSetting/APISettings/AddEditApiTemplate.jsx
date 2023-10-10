import moment from 'moment';
import React, { useEffect, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom';
import Modal from 'react-modal'
import { toast } from 'react-toastify';
import { object, string } from 'yup';

import { properties } from '../../../properties';
import { post } from '../../../common/util/restUtil';
import { RegularModalCustomStyles } from '../../../common/util/util';

const AddEditApiTemplate = (props) => {
    const { isOpen, apiList, isEdit, isViewOnly } = props.data;
    const { setIsOpen } = props.handler
    const [templateDataError, setTemplateDataError] = useState({})
    const [templateData, setTemplateData] = useState({
        apiName: "",
        apiBaseUrl: "",
        apiToken: "",
        apiKey: "",
        mode: "",
        updatedBy: "",
        updatedAt: isEdit ? moment().format('DD-MM-YYYY') : null,
        createdBy: "",
        createdAt: isEdit ? apiList.createdAt : moment().format('DD-MM-YYYY')
    })

   /* A validation schema for the form. */
    const validationSchema = object().shape({
        apiName: string().required("API Name is required"),
        apiBaseUrl: string().required("API Base URL is required"),
        mode: string().required("Mode is required")
    });

    /* A hook that is called when the component is mounted. It is used to set the initial state of the
    component. */

    useEffect(() => {
        if (isEdit || isViewOnly) {
            setTemplateData(apiList)
        }
    }, [props])

    const handleSubmit = () => {
        let error = validate(validationSchema, templateData);
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        if (isEdit === false) {
        }
        else {
        }
    }

    /**
     * The function is called when the user types into the input field. It updates the state of the
     * component with the new value of the input field and clears the error message for that field.
     */
    const handleOnChange = (e) => {
        const { target } = e;
        unstable_batchedUpdates(() => {
            setTemplateData({
                ...templateData,
                [target.id]: target.value
            })
            setTemplateDataError({
                ...templateDataError,
                [target.id]: ""
            })
        })
    }

    /**
     * If the schema is invalid, set the error state to the error message.
     * @returns The error object.
     */
    const validate = (schema, data) => {
        try {
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setTemplateDataError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    return (
        <Modal isOpen={isOpen} contentLabel="Add API Modal" style={RegularModalCustomStyles}>
            <div>
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{isEdit ? 'Edit' : 'Add'} API</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setIsOpen(false)}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div id="searchBlock" className="modal-body">
                                <div className="row pl-2">
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor="apiName" className="control-label">API Name</label>
                                            <input type="apiName" id="apiName" name="apiName" className={`form-control ${templateDataError.apiName && "error-border"}`} disabled={isViewOnly ? 'disabled' : ""} value={templateData.apiName} onChange={handleOnChange} />
                                            <span className="errormsg">{templateDataError.apiName ? templateDataError.apiName : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor="apiBaseUrl" className="control-label">API Base URL/Description</label>
                                            <textarea type="apiBaseUrl" id="apiBaseUrl" name="apiBaseUrl" className={`form-control ${templateDataError.apiBaseUrl && "error-border"}`} value={templateData.apiBaseUrl} disabled={isViewOnly ? 'disabled' : ""} onChange={handleOnChange} />
                                            <span className="errormsg">{templateDataError.apiBaseUrl ? templateDataError.apiBaseUrl : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor="apiToken" className="control-label">Application Token/Site Key</label>
                                            <input type="apiToken" id="apiToken" name="apiToken" className="form-control" value={templateData.apiToken} disabled={isViewOnly ? 'disabled' : ""} onChange={handleOnChange} />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor="apiKey" className="control-label">Secret Key</label>
                                            <input type="apiKey" id="apiKey" name="apiKey" className="form-control" value={templateData.apiKey} disabled={isViewOnly ? 'disabled' : ""} onChange={handleOnChange} />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor="mode" className="control-label">Mode</label>
                                            <select type="mode" id="mode" name="mode" className={`form-control ${templateDataError.mode && "error-border"}`} value={templateData.mode} disabled={isViewOnly ? 'disabled' : ""} onChange={handleOnChange}>
                                                <option value="">Choose Mode</option>
                                                <option value="Test">Test</option>
                                                <option value="Live">Live</option>
                                            </select>
                                            <span className="errormsg">{templateDataError.mode ? templateDataError.mode : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor={isEdit ? "updatedBy" : "createdBy"} className="control-label"  > {isEdit ? 'Updated By' : 'Created By'} </label>
                                            <input className="form-control" type={isEdit ? "updatedBy" : "createdBy"} id={isEdit ? "updatedBy" : "createdBy"}
                                                name={isEdit ? "updatedBy" : "createdBy"} value={isEdit ? templateData.updatedBy : templateData.createdBy}
                                                onChange={handleOnChange} disabled />
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor={isEdit ? "updatedAt" : "createdAt"} className="control-label">{isEdit ? 'Updated On' : 'Created On'}</label>
                                            <input className="form-control" type="createdAt" id={isEdit ? "updatedAt" : "createdAt"}
                                                name={isEdit ? "updatedAt" : "createdAt"} value={isEdit ? templateData.updatedAt : templateData.createdAt} onChange={handleOnChange} disabled />
                                        </div>
                                    </div>
                                    <div className="col-12 pt-2 text-center">

                                        <button type="button" className="skel-btn-cancel" onClick={() => { setIsOpen(false) }}>Cancel</button>
                                        <button type="button" className="skel-btn-submit" onClick={handleSubmit}>Submit</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default AddEditApiTemplate;