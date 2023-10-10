import React, { useEffect, useState } from 'react'
import Modal from 'react-modal';
import { RegularModalCustomStyles } from '../../../common/util/util';
import { toast } from 'react-toastify';
import { object, string } from 'yup';
import { unstable_batchedUpdates } from 'react-dom';
import moment from 'moment'

import { properties } from '../../../properties';
import { post, put } from '../../../common/util/restUtil';
import { history } from '../../../common/util/history'

const AddEditViewApiSetting = (props) => {

    const { isOpen, modalMode, apiSettingData, tableRowData } = props.data
    const { setIsOpen } = props.handler

    const apiSettingInitalValues = {
        id: Math.random() + Math.random(),
        apiName: "",
        apiBaseUrl: "",
        appToken: "",
        secretKey: "",
        mode: "",
        status: "",
    }

    const [apiSettingInputs, setApiSettingInputs] = useState(apiSettingInitalValues);
    const [apiSettingError, setApiSettingError] = useState({});

    const validationSchema = object().shape({
        apiName: string().required("API Name is required"),
        apiBaseUrl: string().required("API Base URL is required"),
        appToken: string().required("Application Token is required"),
        secretKey: string().required("Secret Key is required"),
        mode: string().required("Mode is required"),
        status: string().required("Status is required")
    });

    useEffect(() => {
        if(['EDIT','VIEW'].includes(modalMode)) {
            setApiSettingInputs(apiSettingData)
        }
    }, [])

    const handleOnChange = (e) => {
        const { target } = e;
        if (target.id === 'apiStatus') {
            setApiSettingInputs({
                ...apiSettingInputs,
                status: target.value,
            })
            setApiSettingError({
                ...apiSettingError,
                status: ""
            })
        }
        else {
            unstable_batchedUpdates(() => {
                setApiSettingInputs({
                    ...apiSettingInputs,
                    [target.id]: target.value
                })
                setApiSettingError({
                    ...apiSettingError,
                    [target.id]: ""
                })
            })
        }
    }

    const validate = (schema, data) => {
        try {
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setApiSettingError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    const handleClose = () => {
        setIsOpen(false)
    }

    const handleSubmit = () => {
        let error = validate(validationSchema, apiSettingInputs);
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        const requestBody = {
            settingType: 'API',
            mappingPayload: tableRowData && tableRowData?.mappingPayload || []
        }
        if (apiSettingData || tableRowData) {
            if(modalMode === 'EDIT') {
                const apiSettingList = []
                requestBody?.mappingPayload.forEach((api) => {
                    if(Number(api.id) === Number(apiSettingInputs.id)) {
                        apiSettingList.push(apiSettingInputs)
                    } else {
                        apiSettingList.push(api)
                    }
                })
                requestBody.mappingPayload = apiSettingList
            }
            else if(modalMode === 'ADD') {
                requestBody.mappingPayload.push(apiSettingInputs)
            }
            
            requestBody.settingId = tableRowData?.settingId
            put(properties.PORTAL_SETTING_API, requestBody)
                .then((response) => {
                    const { status, data } = response;
                    if (status === 200 && !!Object.keys(data).length) {
                        toast.success('API Setting has been updated');
                        history.push(`${process.env.REACT_APP_BASE}/portal-settings`);
                    }
                })
                .catch(error => {
                    console.error(error);
                })
                .finally()
        }
        else {
            requestBody.mappingPayload.push(apiSettingInputs)
            
            post(properties.PORTAL_SETTING_API, requestBody)
                .then((response) => {
                    const { status, data } = response;
                    if (status === 200 && !!Object.keys(data).length) {
                        toast.success('API Setting has been Created');
                        history.push(`${process.env.REACT_APP_BASE}/portal-settings`);
                    }
                })
                .catch(error => {
                    console.error(error);
                })
                .finally()
        }
    }


    return (
        <>
            <Modal isOpen={isOpen} contentLabel="Worflow History Modal" style={RegularModalCustomStyles}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">{modalMode} API</h4>
                        <button type="button" className="close" onClick={handleClose}>×</button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="modal-body overflow-auto cus-srch">
                            <div className="row pl-2">
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor="apiName" className="control-label">API Name</label>
                                            <input type="apiName" id="apiName" name="apiName" className={`form-control ${apiSettingError.apiName && "error-border"}`} disabled={modalMode === 'VIEW' ? 'disabled' : ""} value={apiSettingInputs.apiName} onChange={handleOnChange} />
                                            <span className="errormsg">{apiSettingError.apiName ? apiSettingError.apiName : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor="apiBaseUrl" className="control-label">API Base URL/Description</label>
                                            <textarea type="apiBaseUrl" id="apiBaseUrl" name="apiBaseUrl" className={`form-control ${apiSettingError.apiBaseUrl && "error-border"}`} value={apiSettingInputs.apiBaseUrl} disabled={modalMode === 'VIEW' ? 'disabled' : ""} onChange={handleOnChange} />
                                            <span className="errormsg">{apiSettingError.apiBaseUrl ? apiSettingError.apiBaseUrl : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor="appToken" className="control-label">Application Token/Site Key</label>
                                            <input type="appToken" id="appToken" name="appToken" className={`form-control ${apiSettingError.appToken && "error-border"}`} value={apiSettingInputs.appToken} disabled={modalMode === 'VIEW' ? 'disabled' : ""} onChange={handleOnChange} />
                                            <span className="errormsg">{apiSettingError.appToken ? apiSettingError.appToken : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor="secretKey" className="control-label">Secret Key</label>
                                            <input type="secretKey" id="secretKey" name="secretKey" className={`form-control ${apiSettingError.secretKey && "error-border"}`} value={apiSettingInputs.secretKey} disabled={modalMode === 'VIEW' ? 'disabled' : ""} onChange={handleOnChange} />
                                            <span className="errormsg">{apiSettingError.secretKey ? apiSettingError.secretKey : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor="mode" className="control-label">Mode</label>
                                            <select id="mode" name="mode" className={`form-control ${apiSettingError.mode && "error-border"}`} value={apiSettingInputs.mode} disabled={modalMode === 'VIEW' ? 'disabled' : ""} onChange={handleOnChange}>
                                                <option value="">Select Mode</option>
                                                <option value="TEST">Test</option>
                                                <option value="LIVE">Live</option>
                                                <option value="DEBUG">Debug</option>
                                            </select>
                                            <span className="errormsg">{apiSettingError.mode ? apiSettingError.mode : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor="apiStatus" className="control-label">Status</label>
                                            <select id="apiStatus" name="apiStatus" className={`form-control ${apiSettingError.status && "error-border"}`} value={apiSettingInputs.status} disabled={modalMode === 'VIEW' ? 'disabled' : ""} onChange={handleOnChange}>
                                                <option value="">Select Status</option>
                                                <option value="ACTIVE">Active</option>
                                                <option value="INACTIVE">Inactive</option>
                                            </select>
                                            <span className="errormsg">{apiSettingError.status ? apiSettingError.status : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor={['EDIT','VIEW'].includes(modalMode) ? "updatedBy" : "createdBy"} className="control-label"  > {['EDIT','VIEW'].includes(modalMode) ? 'Updated By' : 'Created By'} </label>
                                            <p>{['EDIT','VIEW'].includes(modalMode) ? (tableRowData?.updatedByName?.firstName || "") + " " + (tableRowData?.updatedByName?.lastName || "") : tableRowData?.createdBy ? (tableRowData?.createdByName?.firstName || "") + " " + (tableRowData?.createdByName?.lastName || "") : (tableRowData?.createdByName?.firstName || "") + " " + (tableRowData?.createdByName?.lastName || "")}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor={['EDIT','VIEW'].includes(modalMode) ? "updatedAt" : "createdAt"} className="control-label">{['EDIT','VIEW'].includes(modalMode) ? 'Updated On' : 'Created On'}</label>
                                            <p>{['EDIT','VIEW'].includes(modalMode) ? moment(tableRowData?.updatedAt).format('DD-MMM-YYYY') : tableRowData?.createdAt ? moment(tableRowData?.createdAt).format('DD-MMM-YYYY') : moment(new Date()).format('DD-MMM-YYYY')}</p>
                                        </div>
                                    </div>
                                    <div className="col-12 pt-2 text-center">
                                        
                                            <button type="button" className={`skel-btn-cancel ${modalMode === 'VIEW' && 'd-none'}`} onClick={handleClose}>Cancel</button>
                                            <button type="button" className={`skel-btn-submit ${modalMode === 'VIEW' && 'd-none'}`} onClick={handleSubmit}>Submit</button>
                                    </div>
                                </div>
                            
                            </div>
                            <br></br>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    
        </>
    )
}

export default AddEditViewApiSetting