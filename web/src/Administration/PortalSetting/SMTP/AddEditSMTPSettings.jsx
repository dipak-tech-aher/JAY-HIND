import React, { useState, useEffect } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { object, string } from 'yup';

import { properties } from '../../../properties';
import { get, post, put } from '../../../common/util/restUtil';
import TestSmtpEmailModal from './TestSmtpEmailModal';
import { history } from '../../../common/util/history'

const AddEditSMTPSettings = () => {

    const SMTPInitalValues = {
        enableSmtp: "N",
        enableSsl: "N",
        smtpServer: "",
        smtpUserName: "",
        smtpPassword: "",
        smtpPort: "",
        smtpEmailAddress: "",
        useTls: "N"
    }

    const [smtpInputs, setSmtpInputs] = useState(SMTPInitalValues);
    const [showPassword, setShowPassword] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isSendSmtpMailModalOpen,setIsSendSmtpMailModalOpen] = useState(false)
    const [smtpError, setSmtpError] = useState({});
    const [isCreate,setIsCreate] = useState(true);
    const validationSchema = object().shape({
        smtpServer: isSendSmtpMailModalOpen ? string().nullable(true) : string().required("Server is required"),
        smtpUserName: isSendSmtpMailModalOpen ? string().nullable(true) : string().required("User Name is required"),
        smtpEmailAddress: isSendSmtpMailModalOpen ? string().nullable(true) : string().required("User Name is required").email('Email is not in correct format'),
        smtpPassword: isSendSmtpMailModalOpen ? string().nullable(true) : string().required("Password is required"),
        smtpPort: isSendSmtpMailModalOpen ? string().nullable(true) : string().required("Port is required"),
        to: isSendSmtpMailModalOpen ? string().required("Email is required").email("Email is not in correct format") : string().nullable(true),
        testMessage: isSendSmtpMailModalOpen ? string().required("Message is required") : string().nullable(true) 
    });

    useEffect(() => {
        if (true) {
            getSMPTData();
        }
        else {

        }
    }, [])

    const getSMPTData = () => {
        
        get(`${properties.PORTAL_SETTING_API}/SMTP`)
            .then((response) => {
                const { status, data } = response;
                if(data) {
                    setIsCreate(false)
                    if (status === 200 && !!Object.keys(data).length) {
                        setSmtpInputs({
                            ...smtpInputs,
                            settingId: data?.settingId,
                            smtpServer: data?.mappingPayload?.host,
                            smtpUserName: data?.mappingPayload?.userName,
                            smtpPassword: data?.mappingPayload?.password,
                            smtpPort: data?.mappingPayload?.port,
                            smtpEmailAddress: data?.mappingPayload?.fromEmailAddress,
                            enableSmtp: data?.mappingPayload?.enableSmtp || "N",
                            enableSsl: data?.mappingPayload?.enableSsl || "N",
                            useTls: data?.mappingPayload?.useTls || "N"
                        })
                    }
                }
                else {
                    toast.error("Please Add the SMTP Details")
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
            setSmtpInputs({
                ...smtpInputs,
                [target.id]: target.checked ? 'Y' : 'N',
            })
        }
        else {
            unstable_batchedUpdates(() => {
                setSmtpInputs({
                    ...smtpInputs,
                    [target.id]: target.value
                })
                setSmtpError({
                    ...smtpError,
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
                setSmtpError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    const handleOnSave = () => {
        let error = validate(validationSchema, smtpInputs);
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        else {
            const requestBody = {
                settingType: 'SMTP',
                mappingPayload: {
                    host :  smtpInputs?.smtpServer,
                    userName : smtpInputs?.smtpUserName,
                    password : smtpInputs?.smtpPassword,
                    port : smtpInputs?.smtpPort,
                    fromEmailAddress : smtpInputs?.smtpEmailAddress,
                    enableSmtp: smtpInputs?.enableSmtp,
                    enableSsl: smtpInputs?.enableSsl,
                    useTls: smtpInputs?.useTls
                }
            }
            if (!isCreate) {
                
                requestBody.settingId = smtpInputs?.settingId
                put(properties.PORTAL_SETTING_API, requestBody)
                    .then((response) => {
                        const { status, data } = response;
                        if (status === 200 && !!Object.keys(data).length) {
                            toast.success('SMTP Setting has been updated');
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
                            toast.success('SMTP Setting has been Created');
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
        let error = validate(validationSchema, smtpInputs);
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        setIsSendSmtpMailModalOpen(true)
    }


    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <div className="page-title-box">
                        <h4 className="page-title">SMTP Configuration</h4>
                    </div>
                </div>
            </div>
            <div className="card-box p-0 border">
                <div className="col-12 pr-0">
                    <section className="triangle">
                        <div className="row">
                            <div className="col">
                                <h4 id="list-item-1" className="pl-2">SMTP Settings</h4>
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
                                    <label htmlFor="enableSmtp" className="col-form-label">Enable SMTP</label>
                                    <div className="switchToggle">
                                        <input type="checkbox" disabled={!isEdit} name="enable" id="enableSmtp" checked={smtpInputs.enableSmtp === 'Y' ? true : false} onChange={handleOnChange} />
                                        <label htmlFor="enableSmtp">Toggle</label>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="enableSsl" className="col-form-label">Enable SSL</label>
                                    <div className="switchToggle">
                                        <input type="checkbox" disabled={!isEdit} name="enable" id="enableSsl" checked={smtpInputs.enableSsl === 'Y' ? true : false} onChange={handleOnChange} />
                                        <label htmlFor="enableSsl">Toggle</label>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="smtpServer" className="col-form-label">SMTP Server<span className="text-danger"> *</span> </label>
                                    <input type="text" id="smtpServer" disabled={!isEdit} className={`form-control ${smtpError.smtpServer && "error-border"}`} value={smtpInputs.smtpServer} onChange={handleOnChange} />
                                    <span className="errormsg">{smtpError.smtpServer ? smtpError.smtpServer : ""}</span>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="smtpUserName" className="col-form-label">SMTP User Name<span className="text-danger"> *</span> </label>
                                    <input type="text" id="smtpUserName" disabled={!isEdit} className={`form-control ${smtpError.smtpUserName && "error-border"}`} value={smtpInputs.smtpUserName} onChange={handleOnChange} />
                                    <span className="errormsg">{smtpError.smtpUserName ? smtpError.smtpUserName : ""}</span>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="smtpPassword" className="col-form-label">SMTP Password<span className="text-danger"> *</span> </label>
                                    <div className="input-group input-group-merge">
                                        <input type={showPassword ? 'text' : 'password'} disabled={!isEdit} id="smtpPassword" className={`form-control ${smtpError.smtpPassword && "error-border"}`} value={smtpInputs.smtpPassword} onChange={handleOnChange} />
                                        <div className={`input-group-append ${showPassword === false ? "" : "show-password"}`} data-password="false" onClick={handleOnShowPassword}>
                                            <div className="input-group-text cursor-pointer">
                                                <span className="password-eye font-12"></span>
                                            </div>
                                        </div>
                                        <span className="errormsg">{smtpError.smtpPassword ? smtpError.smtpPassword : ""}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="smtpPort" className="col-form-label">SMTP Port<span className="text-danger"> *</span> </label>
                                    <input type="text" id="smtpPort" disabled={!isEdit} className={`form-control ${smtpError.smtpPort && "error-border"}`} value={smtpInputs.smtpPort} onChange={handleOnChange} />
                                    <span className="errormsg">{smtpError.smtpPort ? smtpError.smtpPort : ""}</span>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="smtpEmailAddress" className="col-form-label">SMTP Email Address<span className="text-danger"> *</span> </label>
                                    <input type="email" id="smtpEmailAddress" disabled={!isEdit} className={`form-control ${smtpError.smtpEmailAddress && "error-border"}`} value={smtpInputs.smtpEmailAddress} onChange={handleOnChange} />
                                    <span className="errormsg">{smtpError.smtpEmailAddress ? smtpError.smtpEmailAddress : ""}</span>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group pt-2">
                                    <label htmlFor="useTls" className="col-form-label">TLS</label>
                                    <fieldset className="question">
                                        <input id="useTls" type="checkbox" disabled={!isEdit} name="useTls" checked={smtpInputs.useTls === 'Y' ? true : false} onChange={handleOnChange} />
                                        <span className="item-text">Use TLS to Connect SMTP</span>
                                    </fieldset>
                                </div>
                            </div>
                            <div className="col-12 text-center pt-2 pb-2">
                                {
                                    isEdit &&
                                    (
                                        <>
                                            <button type="button" className="btn btn-sm waves-effect waves-light btn-primary mr-2" onClick={handleOnSave}>Save</button>
                                            <button type="button" className="btn btn-sm waves-effect waves-light btn-primary mr-2" onClick={handleOnSendTestEmail}>Send Test Mail</button>
                                        </>
                                    )
                                }
                                <Link className="btn btn-sm waves-effect waves-light btn-primary" to={`${process.env.REACT_APP_BASE}/admin-dashboard`} >Back to Admin Dashboard</Link>
                            </div>
                            {
                                isSendSmtpMailModalOpen &&
                                <TestSmtpEmailModal
                                    data={{
                                        isOpen: isSendSmtpMailModalOpen,
                                        validationSchema: validationSchema,
                                        testInputs: smtpInputs,
                                        testInputsError: smtpError,
                                        settingType: 'SMTP'
                                    }}
                                    handler={{
                                        setIsOpen: setIsSendSmtpMailModalOpen,
                                        validate: validate,
                                        setTestInputsError: setSmtpError
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

export default AddEditSMTPSettings;