import React, { useState, useEffect } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { object, string } from 'yup';

import { properties } from '../../../properties';
import { get, post, put } from '../../../common/util/restUtil';
import TestSmtpEmailModal from '../SMTP/TestSmtpEmailModal';
import { history } from '../../../common/util/history'

const AddEditSMSSettings = () => {

    const SMSInitalValues = {
        smsServer: "",
        smsUserName: "",
        smsPassword: "",
        smsPort: "",
        smsAppId: "",
        isCallback: "N",
        isUnicode: "N"
    }

    const [smsInputs, setSmsInputs] = useState(SMSInitalValues);
    const [showPassword, setShowPassword] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isSendSmsMailModalOpen,setIsSendSmsMailModalOpen] = useState(false)
    const [smsError, setSmsError] = useState({});
    const [isCreate,setIsCreate] = useState(true);
    const validationSchema = object().shape({
        smsServer: isSendSmsMailModalOpen ? string().nullable(true) : string().required("Server is required"),
        smsUserName: isSendSmsMailModalOpen ? string().nullable(true) : string().required("User Name is required"),
        smsAppId: isSendSmsMailModalOpen ? string().nullable(true) : string().required("App Id is required"),
        smsPassword: isSendSmsMailModalOpen ? string().nullable(true) : string().required("Password is required"),
        smsPort: isSendSmsMailModalOpen ? string().nullable(true) : string().required("Port is required"),
        to: isSendSmsMailModalOpen ? string().required("Number is required") : string().nullable(true),
        testMessage: isSendSmsMailModalOpen ? string().required("Message is required") : string().nullable(true) 
    });

    useEffect(() => {
        if (true) {
            getSMSData();
        }
        else {

        }
    }, [])

    const getSMSData = () => {
        
        get(`${properties.PORTAL_SETTING_API}/SMS`)
            .then((response) => {
                const { status, data } = response;
                if(data) {
                    setIsCreate(false)
                    if (status === 200 && !!Object.keys(data).length) {
                        setSmsInputs({
                            ...smsInputs,
                            settingId: data?.settingId,
                            smsServer: data?.mappingPayload?.URL,
                            smsUserName: data?.mappingPayload?.u,
                            smsPassword: data?.mappingPayload?.h,
                            smsPort: data?.mappingPayload?.op,
                            smsAppId: data?.mappingPayload?.app,
                            isCallback: data?.mappingPayload?.isCallback || "N",
                            isUnicode: data?.mappingPayload?.isUnicode || "N"
                        })
                    }
                }
                else {
                    toast.error("Please Add the SMS Details")
                    setIsCreate(true)
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

    const handleOnChange = (e) => {
        const { target } = e;
        if (target.type === 'checkbox') {
            setSmsInputs({
                ...smsInputs,
                [target.id]: target.checked ? 'Y' : 'N',
            })
        }
        else {
            unstable_batchedUpdates(() => {
                setSmsInputs({
                    ...smsInputs,
                    [target.id]: target.value
                })
                setSmsError({
                    ...smsError,
                    [target.id]: ""
                })
            })
        }
    }

    const handleOnShowPassword = () => {
        setShowPassword(!showPassword);
    }

    const handleOnToogleEdit = () => {
        setIsEdit(!isEdit);
    }

    const validate = (schema, data) => {
        try {
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setSmsError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    const handleOnSave = () => {
        let error = validate(validationSchema, smsInputs);
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        else {
            const requestBody = {
                settingType: 'SMS',
                mappingPayload: {
                    URL :  smsInputs?.smsServer,
                    u : smsInputs?.smsUserName,
                    h : smsInputs?.smsPassword,
                    op : smsInputs?.smsPort,
                    app : smsInputs?.smsAppId,
                    isCallback: smsInputs?.isCallback,
                    isUnicode: smsInputs?.isUnicode
                }
            }
            if (!isCreate) {
                
                requestBody.settingId = smsInputs?.settingId
                put(properties.PORTAL_SETTING_API, requestBody)
                    .then((response) => {
                        const { status, data } = response;
                        if (status === 200 && !!Object.keys(data).length) {
                            toast.success('SMS Setting has been updated');
                            history.push(`${process.env.REACT_APP_BASE}/portal-settings`);
                            //handleOnToogleEdit();
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    })
                    .finally()
            }
            else {
                
                post(properties.PORTAL_SETTING_API, requestBody)
                    .then((response) => {
                        const { status, data } = response;
                        if (status === 200 && !!Object.keys(data).length) {
                            toast.success('SMS Setting has been Created');
                            history.push(`${process.env.REACT_APP_BASE}/portal-settings`);
                            //handleOnToogleEdit();
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    })
                    .finally()
            }
        }
    }

    const handleOnSendTestEmail = () => {
        let error = validate(validationSchema, smsInputs);
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        setIsSendSmsMailModalOpen(true)
    }


    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <div className="page-title-box">
                        <h4 className="page-title">SMS Configuration</h4>
                    </div>
                </div>
            </div>
            <div className="card-box p-0 border">
                <div className="col-12 pr-0">
                    <section className="triangle">
                        <div className="row">
                            <div className="col">
                                <h4 id="list-item-1" className="pl-2">SMS Settings</h4>
                            </div>
                        </div>
                    </section>
                </div>
                <div className="card-body p-2">
                    <div id="saved">
                        <div className="row pb-2 col-12">
                            <div className="col-12" id="editbutton">
                                <span className='float-right'>
                                    <button type="button" className={`btn btn-labeled btn-primary btn-sm mt-1 ${isEdit ? 'd-none' : ''}`} onClick={handleOnToogleEdit}>
                                        { isCreate ? 'Add' : 'Edit' }
                                    </button>
                                </span>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="smsServer" className="col-form-label">SMS Server (URL)<span className="text-danger"> *</span> </label>
                                    <input type="text" id="smsServer" disabled={!isEdit} className={`form-control ${smsError.smsServer && "error-border"}`} value={smsInputs.smsServer} onChange={handleOnChange} />
                                    <span className="errormsg">{smsError.smsServer ? smsError.smsServer : ""}</span>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="smsUserName" className="col-form-label">SMS User Name (u)<span className="text-danger"> *</span> </label>
                                    <input type="text" id="smsUserName" disabled={!isEdit} className={`form-control ${smsError.smsUserName && "error-border"}`} value={smsInputs.smsUserName} onChange={handleOnChange} />
                                    <span className="errormsg">{smsError.smsUserName ? smsError.smsUserName : ""}</span>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="smsPassword" className="col-form-label">SMS Password (h)<span className="text-danger"> *</span> </label>
                                    <div className="input-group input-group-merge">
                                        <input type={showPassword ? 'text' : 'password'} disabled={!isEdit} id="smsPassword" className={`form-control ${smsError.smsPassword && "error-border"}`} value={smsInputs.smsPassword} onChange={handleOnChange} />
                                        <div className={`input-group-append ${showPassword === false ? "" : "show-password"}`} data-password="false" onClick={handleOnShowPassword}>
                                            <div className="input-group-text cursor-pointer">
                                                <span className="password-eye font-12"></span>
                                            </div>
                                        </div>
                                        <span className="errormsg">{smsError.smsPassword ? smsError.smsPassword : ""}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="smsPort" className="col-form-label">SMS Port (op)<span className="text-danger"> *</span> </label>
                                    <input type="text" id="smsPort" disabled={!isEdit} className={`form-control ${smsError.smsPort && "error-border"}`} value={smsInputs.smsPort} onChange={handleOnChange} />
                                    <span className="errormsg">{smsError.smsPort ? smsError.smsPort : ""}</span>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="smsAppId" className="col-form-label">SMS App ID (app)<span className="text-danger"> *</span> </label>
                                    <input type="text" id="smsAppId" disabled={!isEdit} className={`form-control ${smsError.smsAppId && "error-border"}`} value={smsInputs.smsAppId} onChange={handleOnChange} />
                                    <span className="errormsg">{smsError.smsAppId ? smsError.smsAppId : ""}</span>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group pt-2">
                                    <label htmlFor="isCallback" className="col-form-label">Callback</label>
                                    <fieldset className="question">
                                        <input id="isCallback" type="checkbox" disabled={!isEdit} name="isCallback" checked={smsInputs.isCallback === 'Y' ? true : false} onChange={handleOnChange} />
                                        <span className="item-text">Enable Callback</span>
                                    </fieldset>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group pt-2">
                                    <label htmlFor="isUnicode" className="col-form-label">Unicode</label>
                                    <fieldset className="question">
                                        <input id="isUnicode" type="checkbox" disabled={!isEdit} name="isUnicode" checked={smsInputs.isUnicode === 'Y' ? true : false} onChange={handleOnChange} />
                                        <span className="item-text">Use Unicode</span>
                                    </fieldset>
                                </div>
                            </div>
                            <div className="col-12 text-center pt-2 pb-2">
                                {
                                    isEdit &&
                                    (
                                        <>
                                            <button type="button" className="btn btn-sm waves-effect waves-light btn-primary mr-2" onClick={handleOnSave}>Save</button>
                                            <button type="button" className="btn btn-sm waves-effect waves-light btn-primary mr-2" onClick={handleOnSendTestEmail}>Send Test SMS</button>
                                        </>
                                    )
                                }
                                <Link className="btn btn-sm waves-effect waves-light btn-primary" to={`${process.env.REACT_APP_BASE}/admin-dashboard`} >Back to Admin Dashboard</Link>
                            </div>
                            {
                                isSendSmsMailModalOpen &&
                                <TestSmtpEmailModal
                                    data={{
                                        isOpen: isSendSmsMailModalOpen,
                                        validationSchema: validationSchema,
                                        testInputs: smsInputs,
                                        testInputsError: smsError,
                                        settingType: 'SMS'
                                    }}
                                    handler={{
                                        setIsOpen: setIsSendSmsMailModalOpen,
                                        validate: validate,
                                        setTestInputsError: setSmsError
                                    }}
                                />
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddEditSMSSettings;