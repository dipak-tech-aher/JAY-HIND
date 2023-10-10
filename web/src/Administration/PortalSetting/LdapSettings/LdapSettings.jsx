import React, { useState, useEffect } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { object, string } from 'yup';

import { properties } from '../../../properties';
import { get, post, put } from '../../../common/util/restUtil';
import { history } from '../../../common/util/history'
import FileUpload from './fileUpload';


const LdapSettings = () => {
    const LDAPInitalValues = {
        enableLdap: "N",
        ldapServer: "",
        ldapPort: "",
        ldapbindDn: "",
        ldapPassword: "",
        ldapBaseDn: "",
        ldapUserName: "",
        ldapUser: "",
        ldapTls: "N",
        ldapClientCertificate: "",
        ldapCaCertificate: ""
    }
    const [ldapInputs, setLdapInputs] = useState(LDAPInitalValues);
    const [showPassword, setShowPassword] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [ldapError, setLdapError] = useState({});
    const [isCreate, setIsCreate] = useState(true);
    const [clientExistingFiles, setClientExistingFiles] = useState([]);
    const [catexistingFiles, setCaExistingFiles] = useState([]);
    const [clientcurrentFiles, setClientCurrentFiles] = useState([])
    const [cacurrentFiles, setCACurrentFiles] = useState([])
    // const [permissions,setPermissions] = useState(false)

    const validationSchema = object().shape({
        ldapServer: string().required("LDAP Server is required"),
        ldapPort: string().required("LDAP Port is required"),
        ldapPassword: string().required("Password is required"),
        ldapBaseDn: string().required("Base DN is required"),
        ldapUserName: string().required("User Name Attribute/SAM Name is required"),
        ldapUser: string().required("LDAP User is required")
    });

    useEffect(() => {
        if (true) {
            getLDAPData();
        }
    }, [])

    const getLDAPData = () => {
        
        get(`${properties.PORTAL_SETTING_API}/LDAP`)
            .then((response) => {
                const { status, data } = response;
                if (data) {
                    setIsCreate(false)
                    if (status === 200 && !!Object.keys(data).length) {
                        unstable_batchedUpdates(() => {
                            setLdapInputs({
                                ...ldapInputs,
                                settingId: data?.settingId,
                                enableLdap: data?.mappingPayload?.enableLdap || "N",
                                ldapServer: data?.mappingPayload?.ldapServer,
                                ldapPort: data?.mappingPayload?.ldapPort,
                                ldapbindDn: data?.mappingPayload?.ldapbindDn,
                                ldapPassword: data?.mappingPayload?.ldapPassword,
                                ldapBaseDn: data?.mappingPayload?.ldapBaseDn,
                                ldapUserName: data?.mappingPayload?.ldapUserName,
                                ldapUser: data?.mappingPayload?.ldapUser,
                                ldapTls: data?.mappingPayload?.ldapTls || "N",
                                ldapClientCertificate: data?.mappingPayload?.ldapClientCertificate && [...data?.mappingPayload?.ldapClientCertificate?.map((current) => ({ attachmentId: current.attachmentId, entityId: current.entityId, entityType: current.entityType,fileName:current?.fileName }))],
                                ldapCaCertificate: data?.mappingPayload?.ldapClientCertificate && [...data?.mappingPayload?.ldapCaCertificate?.map((current) => ({ attachmentId: current.attachmentId, entityId: current.entityId, entityType: current.entityType,fileName:current?.fileName }))]
                            })
                            setClientExistingFiles([...data?.mappingPayload?.ldapClientCertificate?.map((current) => ({ attachmentId: current.attachmentId, entityId: current.entityId, entityType: current.entityType,fileName:current?.fileName }))])
                            setCaExistingFiles([...data?.mappingPayload?.ldapCaCertificate?.map((current) => ({ attachmentId: current.attachmentId, entityId: current.entityId, entityType: current.entityType,fileName:current?.fileName }))])

                        })
                    }
                }
                else {
                    toast.error("Please Add the LDAP Details")
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
            setLdapInputs({
                ...ldapInputs,
                [target.id]: target.checked ? 'Y' : 'N',
            })
        }
        else {
            unstable_batchedUpdates(() => {
                setLdapInputs({
                    ...ldapInputs,
                    [target.id]: target.value
                })
                setLdapError({
                    ...ldapError,
                    [target.id]: ""
                })
            })
        }
    }

    const handleOnToogleEdit = () => {
        setIsEdit(!isEdit);
    }

    const validate = (schema, data) => {
        try {
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setLdapError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    const handleOnShowPassword = () => {
        setShowPassword(!showPassword);
    }

    const handleOnSave = () => {
        let error = validate(validationSchema, ldapInputs);
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        else {
            const requestBody = {
                attachment:true,
                settingType: 'LDAP',
                mappingPayload: {
                    enableLdap: ldapInputs.enableLdap,
                    ldapServer: ldapInputs.ldapServer,
                    ldapPort: ldapInputs.ldapPort,
                    ldapbindDn: ldapInputs.ldapbindDn,
                    ldapPassword: ldapInputs.ldapPassword,
                    ldapBaseDn: ldapInputs.ldapBaseDn,
                    ldapUserName: ldapInputs.ldapUserName,
                    ldapUser: ldapInputs.ldapUser,
                    ldapTls: ldapInputs.ldapTls,
                    ldapClientCertificate: [...clientExistingFiles.map((current) => ({ attachmentId: current.attachmentId, entityId: current.entityId, entityType: current.entityType,fileName:current.fileName })), ...clientcurrentFiles.map((current) => ({ attachmentId: current.attachmentId, entityId: current.entityId, entityType: current.entityType,fileName:current.fileName}))],
                    ldapCaCertificate: [...catexistingFiles.map((current) => ({ attachmentId: current.attachmentId, entityId: current.entityId, entityType: current.entityType,fileName:current.fileName })), ...cacurrentFiles.map((current) => ({ attachmentId: current.attachmentId, entityId: current.entityId, entityType: current.entityType,fileName:current.fileName }))]
                }
            }
            if (!isCreate) {
                
                requestBody.settingId = ldapInputs?.settingId

                const ldapClientCertificate=[]
                const ldapCaCertificate=[]

                for (let e of requestBody.mappingPayload.ldapClientCertificate){
                    ldapClientCertificate.push({...e, entityId:ldapInputs?.settingId.toString()})
                }
                for (let e of requestBody.mappingPayload.ldapCaCertificate){
                    ldapCaCertificate.push({...e, entityId:ldapInputs?.settingId.toString()})
                }
                requestBody.mappingPayload= ({...requestBody.mappingPayload,ldapClientCertificate:ldapClientCertificate,ldapCaCertificate:ldapCaCertificate})

                put(properties.PORTAL_SETTING_API, requestBody)
                    .then((response) => {
                        const { status, data } = response;
                        if (status === 200 && !!Object.keys(data).length) {
                            toast.success('LDAP Setting has been updated');
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
                            toast.success('LDAP Setting has been Created');
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

    return (<>
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <div className="page-title-box">
                        <h4 className="page-title">LDAP Configuration</h4>
                    </div>
                </div>
            </div>
            <div className="card-box p-0 border">
                <div className="col-12 pr-0">
                    <section className="triangle">
                        <div className="row">
                            <div className="col">
                                <h4 id="list-item-1" className="pl-2">LDAP Settings</h4>
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
                                        {isCreate ? 'Add' : 'Edit'}
                                    </button>
                                </span>
                            </div>
                        </div>
                        <div className="row pb-2 col-12">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="enableLdap" className="col-form-label">Status</label>
                                    <div className="switchToggle">
                                        <input type="checkbox" disabled={!isEdit} name="enable" id="enableLdap" checked={ldapInputs.enableLdap === 'Y' ? true : false} onChange={handleOnChange} />
                                        <label htmlFor="enableLdap">Toggle</label>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="ldapServer" className="col-form-label">LDAP Server<span className="text-danger"> *</span> </label>
                                    <input type="text" id="ldapServer" disabled={!isEdit} className={`form-control ${ldapError.ldapServer && "error-border"}`} value={ldapInputs.ldapServer} onChange={handleOnChange} />
                                    <span className="errormsg">{ldapError.ldapServer ? ldapError.ldapServer : ""}</span>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="ldapPort" className="col-form-label">LDAP Port<span className="text-danger"> *</span> </label>
                                    <input type="text" id="ldapPort" disabled={!isEdit} className={`form-control ${ldapError.ldapPort && "error-border"}`} value={ldapInputs.ldapPort} onChange={handleOnChange} />
                                    <span className="errormsg">{ldapError.ldapPort ? ldapError.ldapPort : ""}</span>
                                </div>
                            </div>
                        </div>
                        <div className="row pb-2 col-12">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="ldapbindDn" className="col-form-label">Bind DN</label>
                                    <input type="text" id="ldapbindDn" disabled={!isEdit} className="form-control" value={ldapInputs.ldapbindDn} onChange={handleOnChange} />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="ldapPassword" className="col-form-label">Password<span className="text-danger"> *</span> </label>
                                    <div className="input-group input-group-merge">
                                        <input type={showPassword ? 'text' : 'password'} disabled={!isEdit} id="ldapPassword" className={`form-control ${ldapError.ldapPassword && "error-border"}`} value={ldapInputs.ldapPassword} onChange={handleOnChange} />
                                        <div className={`input-group-append ${showPassword === false ? "" : "show-password"}`} data-password="false" onClick={handleOnShowPassword}>
                                            <div className="input-group-text cursor-pointer">
                                                <span className="password-eye font-12"></span>
                                            </div>
                                        </div>
                                        <span className="errormsg">{ldapError.smtpPassword ? ldapError.smtpPassword : ""}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="ldapBaseDn" className="col-form-label">Base DN<span className="text-danger"> *</span> </label>
                                    <input type="text" id="ldapBaseDn" disabled={!isEdit} className="form-control" value={ldapInputs.ldapBaseDn} onChange={handleOnChange} />
                                    <span className="errormsg">{ldapError.ldapBaseDn ? ldapError.ldapBaseDn : ""}</span>
                                </div>
                            </div>
                        </div>
                        <div className="row pb-2 col-12">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="ldapUserName" className="col-form-label">User Name Attribute/SAM Name<span className="text-danger"> *</span> </label>
                                    <input type="text" id="ldapUserName" disabled={!isEdit} className={`form-control ${ldapError.ldapUserName && "error-border"}`} value={ldapInputs.ldapUserName} onChange={handleOnChange} />
                                    <span className="errormsg">{ldapError.ldapUserName ? ldapError.ldapUserName : ""}</span>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="ldapUser" className="col-form-label">LDAP User<span className="text-danger"> *</span> </label>
                                    <input type="text" id="ldapUser" disabled={!isEdit} className={`form-control ${ldapError.ldapUser && "error-border"}`} value={ldapInputs.ldapUser} onChange={handleOnChange} />
                                    <span className="errormsg">{ldapError.ldapUser ? ldapError.ldapUser : ""}</span>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group pt-2">
                                    <label htmlFor="ldapTls" className="col-form-label">TLS</label>
                                    <fieldset className="question">
                                        <input id="ldapTls" type="checkbox" disabled={!isEdit} name="ldapTls" checked={ldapInputs.ldapTls === 'Y' ? true : false} onChange={handleOnChange} />
                                        <span className="item-text">Use TLS to Connect LDAP</span>
                                    </fieldset>
                                </div>
                            </div>
                        </div>
                        <div className="row pb-2 col-12">
                            <div className="col-md-4">
                                <div className="form-group pt-2" >
                                    <label htmlFor="ldapTls" className="col-form-label">Client Certificate</label>
                                    <fieldset >
                                        <FileUpload
                                            data={{
                                                currentFiles: clientcurrentFiles,
                                                entityType: 'CLIENT_CERTIFICATE',
                                                existingFiles: clientExistingFiles,
                                                interactionId: ldapInputs.settingId,
                                                permission: !isEdit
                                            }}
                                            handlers={{
                                                setCurrentFiles: setClientCurrentFiles,
                                                setExistingFiles: setClientExistingFiles
                                            }}
                                        />
                                    </fieldset>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group pt-2">
                                    <label htmlFor="ldapTls" className="col-form-label">Client Certificate</label>
                                    <fieldset >
                                        <FileUpload
                                            data={{
                                                currentFiles: cacurrentFiles,
                                                entityType: 'CA_CERTIFICATE',
                                                existingFiles: catexistingFiles,
                                                interactionId: ldapInputs.settingId,
                                                permission: !isEdit
                                            }}
                                            handlers={{
                                                setCurrentFiles: setCACurrentFiles,
                                                setExistingFiles: setCaExistingFiles
                                            }}
                                        />
                                    </fieldset>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 text-center pt-2 pb-2">
                            {
                                isEdit &&
                                (
                                    <>
                                        <button type="button" className="btn btn-sm waves-effect waves-light btn-primary mr-2" onClick={handleOnSave}>Save</button>
                                    </>
                                )
                            }
                            <Link className="btn btn-sm waves-effect waves-light btn-primary" to={`${process.env.REACT_APP_BASE}/portal-settings`} >Back to Admin Dashboard</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>)

}

export default LdapSettings;