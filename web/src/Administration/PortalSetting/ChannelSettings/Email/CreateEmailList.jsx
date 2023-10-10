/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';
import { object, string } from 'yup';

import { properties } from '../../../../properties';
import { get, post, put } from '../../../../common/util/restUtil';
import EmailAccountInfo from './EmailAccountInfo'
import EmailServerSettings from './EmailServerSettings'
import EmailSubmit from './EmailSubmit'
import { history } from '../../../../common/util/history';

const CreateEmailList = (props) => {
    const intialValue = {
        id: Math.floor(Math.random() * 900) + Math.floor(Math.random() * 900),
        emailGroupName: "",
        emailDescription: "",
        channelCategory: "",
        userDepartment: [],
        name: "",
        emailId: "",
        password: "",
        AccountType: "",
        incomeServer: "",
        outgoingServer: "",
        requiredLogin: "",
        Status:"Active"
    }
    const [emailSettings, setEmailSettings] = useState(intialValue)
    const [channel, setChannal] = useState()
    const [userDeparmentMapping, setUserDeparmentMapping] = useState()
    const [organization, setOrganization] = useState()
    const [emailSettingError, setEmailSettingError] = useState({})
    const tableRowData = props?.data?.tableRowData
    const mode = props?.data?.Mode || "ADD"
    const emailSettingData = props?.data?.emailSettingsData
    const [emailData, setEmailData] = useState()
    const lookupData = useRef(undefined);
    const [accountType, setAccountType] = useState()
    const [finish, setFinish] = useState(false)
    const [interactionMode, setInteractionMode] = useState("")
    const [progressBar, setProgresBar] = useState(25)
    const tabs = [
        {
            name: 'Account Information',
            index: 0,
            progressBar: 25
        },
        {
            name: 'Email Server Settings',
            index: 1,
            progressBar: 50
        },
        {
            name: 'Finish',
            index: 2,
            progressBar: 100
        }];
    const [activeTab, setActiveTab] = useState(tabs[0]);

    useEffect(() => {
        setInteractionMode(mode)
    }, [mode])

    useEffect(() => {
        if (['EMAIL_EDIT', 'EMAIL_VIEW'].includes(interactionMode)) {
            setEmailSettings(emailSettingData)
        }
        else if (interactionMode === "ADD") {
            unstable_batchedUpdates(() => {
                setActiveTab(tabs[0])
                setProgresBar(25)
                setEmailSettings(intialValue)
                setFinish(false)
            })
        }
    }, [interactionMode])

    useEffect(() => {
        getInitialDropDownValues()
    }, [])

    useEffect(() => {
        getInitialDropDownValues()
    }, [interactionMode])

    const getInitialDropDownValues = () => {

        
        let organizationData = []
        let option = []
        let userData = []

        post(properties.BUSINESS_ENTITY_API, ['TICKET_CHANNEL', 'EMAIL_ACCOUNT_TYPE'])
            .then((response) => {
                if (response.data) {
                    lookupData.current = response.data;
                    unstable_batchedUpdates(() => {
                        setAccountType(lookupData?.current['EMAIL_ACCOUNT_TYPE'])
                        setChannal(lookupData?.current['TICKET_CHANNEL'])
                    })

                }
            }).catch((error) => {
                console.log(error)
            })
        get(properties.ORGANIZATION)
            .then((res) => {
                if (res.data) {
                    for (let dept of res.data) {
                        organizationData.push(dept)
                    }
                    setOrganization(res.data)
                    
                    post(`${properties.USER_API}/search`)
                        .then((e) => {
                            if (e.data) {
                                // for (let a of e.data.rows) {
                                //     for (let b of a.mappingPayload.userDeptRoleMapping) {
                                //         roles.push({ label: a.firstName, unitId: b.unitId, value: { id: a.userId, dept: b.unitId } })
                                //     }
                                // }

                                for (let d of organizationData) {
                                    option = []
                                    for (let m of e.data.rows) {
                                        if(m?.mappingPayload?.userDeptRoleMapping){
                                            for (let n of m?.mappingPayload?.userDeptRoleMapping) {
                                                if (d.unitId === n.unitId) {
                                                    option.push({ label: m.firstName, value: m.userId, unitId: d.unitId })
                                                }
                                            }
                                        }
                                    }
                                    userData.push({ label: d.unitId, options: option })
                                }
                            }
                            setUserDeparmentMapping(userData)
                            //    setRole(roles)
                            
                        }).catch((error) => {
                            console.log(error)
                        })
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()

        
        get(`${properties.PORTAL_SETTING_API}/EMAIL`)
            .then((response) => {
                const { status, data } = response;
                if (data) {
                    if (status === 200 && !!Object.keys(data).length) {
                        setEmailData(data)
                    }
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()

    }

    const validationSchema = object().shape({
        emailGroupName: string().required("Email Group Name is required"),
        emailDescription: string().required("Email Description is required"),
        channelCategory: string().required("Channel Category is required"),
        userDepartment: string().required("User is required"),
        name: string().required("Name is required"),
        emailId: string().required("Email Id is required"),
        password: string().required("Password is required"),
        AccountType: string().required("Account Type is required"),
        incomeServer: string().required("Incoming Server is required"),
        outgoingServer: string().required("outgoing Server is required"),

    });
    const accountInformationValidateSchema = object().shape({
        emailGroupName: string().required("Email Group Name is required"),
        emailDescription: string().required("Email Description is required"),
        channelCategory: string().required("Channel Category is required"),
        userDepartment: string().required("User is required"),
        name: string().required("Name is required")
    });

    const emailSettingsValidateSchema = object().shape({
        emailId: string().required("Email Id is required"),
        password: string().required("Password is required"),
        AccountType: string().required("Account Type is required"),
        incomeServer: string().required("Incoming Server is required"),
        outgoingServer: string().required("outgoing Server is required")
    });


    const handleOnPreviousNext = (e) => {
        const { target } = e;
        if (target.id === 'prev') {
            const index = tabs[--activeTab.index]
            unstable_batchedUpdates(() => {
                setActiveTab(index);
                setProgresBar(index?.progressBar)
            })
        }
        else {
            if(activeTab.index === 0){
                let error = validate(accountInformationValidateSchema, emailSettings);
                if (error) {
                    toast.error("Validation errors found. Please check all fields");
                    return false;
                }
                else{
                    const index = tabs[++activeTab.index]
                    unstable_batchedUpdates(() => {
                        setActiveTab(index);
                        setProgresBar(index?.progressBar)
                    })
                }
            }
            else if (activeTab.index === 1){
                let error = validate(emailSettingsValidateSchema, emailSettings);
                if (error) {
                    toast.error("Validation errors found. Please check all fields");
                    return false;
                }
                else{
                    const index = tabs[++activeTab.index]
                    unstable_batchedUpdates(() => {
                        setActiveTab(index);
                        setProgresBar(index?.progressBar)
                    })
                }
            }
            else{
                const index = tabs[++activeTab.index]
                unstable_batchedUpdates(() => {
                    setActiveTab(index);
                    setProgresBar(index?.progressBar)
                })
            }
        }
    }

    const handleOnTabChange = (selectedTab) => {
        if (activeTab.index === 1 && selectedTab.index === 0) {
            setActiveTab(selectedTab);
            setProgresBar(selectedTab.progressBar)
            return;
        }
        setActiveTab(selectedTab);
        setProgresBar(selectedTab.progressBar)
    }

    const validate = (schema, data) => {
        try {
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setEmailSettingError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    const handleFinish = (e) => {
        handleSubmit(e)
    }

    const handleOnChange = (e) => {

        const { target } = e;
        if (target.type === 'radio' || target.type === 'checkbox') {
            setEmailSettings({
                ...emailSettings,
                [target.id]: target.checked ? 'Y' : 'N',
            })
        }
        else {
            unstable_batchedUpdates(() => {
                setEmailSettingError({
                    ...emailSettingError,
                    [target.id]: ""
                })
                setEmailSettings({
                    ...emailSettings,
                    [target.id]: target.value
                })
            })
        }
    }

    const handleSubmit = (e) => {
        let error = validate(validationSchema, emailSettings);
        if (error) {
            toast.error("Validation errors found. Please check all fields");
            return false;
        }
        const requestBody = {
            settingType: 'EMAIL',
            mappingPayload: (tableRowData && tableRowData?.mappingPayload) || (emailData && emailData?.mappingPayload) || []
        }

        if (emailSettingData || tableRowData || emailData) {
            if (interactionMode === 'EMAIL_EDIT') {
                const emailSettingList = []
                requestBody?.mappingPayload.forEach((api) => {
                    if (Number(api.id) === Number(emailSettings.id)) {
                        emailSettingList.push(emailSettings)
                    } else {
                        emailSettingList.push(api)
                    }
                })
                requestBody.mappingPayload = emailSettingList
            }
            else if (interactionMode === 'ADD') {
                requestBody.mappingPayload.push(emailSettings)
            }
            
            requestBody.settingId = tableRowData?.settingId || emailData?.settingId
            put(properties.PORTAL_SETTING_API, requestBody)
                .then((response) => {
                    const { status, data } = response;
                    if (status === 200 && !!Object.keys(data).length) {
                        toast.success('Email Setting has been updated');
                        unstable_batchedUpdates(() => {
                            setActiveTab(tabs[++activeTab.index]);
                            setFinish(true)
                            setProgresBar(100)
                        })
                    }
                })
                .catch(error => {
                    console.error(error);
                })
                .finally()
        }
        else {
            requestBody.mappingPayload.push(emailSettings)
            
            post(properties.PORTAL_SETTING_API, requestBody)
                .then((response) => {
                    const { status, data } = response;
                    if (status === 200 && !!Object.keys(data).length) {
                        toast.success('Email Setting has been Created');
                        unstable_batchedUpdates(() => {
                            setActiveTab(tabs[++activeTab.index]);
                            setFinish(true)
                            setProgresBar(100)
                        })
                    }
                })
                .catch(error => {
                    console.error(error);
                })
                .finally()
        }
    }

    const handleClear = () => {
        unstable_batchedUpdates(() => {
            setEmailSettings(intialValue)
            setInteractionMode("ADD")
            setFinish(false)
            setActiveTab(tabs[0])
            setProgresBar(25)
        })
        const data = {
            ActiveTab: "create-email-list",
            Mode: "ADD",
        }
        history.push(`${process.env.REACT_APP_BASE}/portal-settings/channel-settings`, { data })

    }

    const handleCellLinkClick = (e, rowData, mode) => {
        handleClear()
    }

    return (
        <>
            <div id="main pt-0">
                <div className="row p-0">
                    <div className="col p-0">
                        <div className="card-body insta-page row">
                            <div className="col-md-12">
                                <div className="card-box">
                                    <div className="row mt-1 col-md-12 p-0 mb-3">
                                        <section className="triangle col-md-12">
                                            <div className="row col-md-12">
                                                <div className="col-md-8">
                                                    <h5>Email Settings</h5>
                                                </div>
                                                <div className="col-md-4">
                                                    <span style={{ float: "right" }}>
                                                        <button type="button" className="btn btn-labeled btn-primary btn-sm mt-1" onClick={(e) => handleCellLinkClick(e, {}, 'ADD')}>
                                                            <small>Add Email Support</small>
                                                        </button>
                                                    </span>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                    <div className="row">
                                        <div className="col-xl-12">
                                            <div className="card">
                                                <div className="card-body">
                                                    <div id="progressbarwizard">
                                                        <ul className="nav nav-pills bg-light nav-justified form-wizard-header mb-3">
                                                            {
                                                                tabs.map((tab, index) => (
                                                                    <li key={tab.name} className="nav-item">
                                                                        <a className={`nav-link rounded-0 pt-2 pb-2 cursor-pointer ${activeTab.index === index ? 'active' : ''}`} onClick={() => handleOnTabChange(tab)}>
                                                                            <i className={tab.index === 0 ? "mdi mdi-progress-download mr-1 font-17" : tab.index === 1 ? "mdi mdi-view-list font-17 mr-1" : "mdi mdi-checkbox-marked-circle-outline mr-1 font-17"}></i>
                                                                            <span className="d-none d-sm-inline">{tab.name}</span>
                                                                        </a>
                                                                    </li>
                                                                ))
                                                            }
                                                        </ul>
                                                        <div className="tab-content b-0 mb-0 pt-0">
                                                            <div id="bar" className="progress mb-3" style={{ height: "7px" }}>
                                                                <div className="bar progress-bar progress-bar-striped progress-bar-animated bg-success" style={{ width: progressBar + "%" }}></div>
                                                            </div>
                                                            <div className={`tab-pane ${activeTab.index === 0 ? 'show active' : ''}`} >
                                                                {activeTab.index === 0 && <EmailAccountInfo
                                                                    data={{
                                                                        emailSettings,
                                                                        emailSettingError,
                                                                        channel,
                                                                        organization,
                                                                        userDeparmentMapping,
                                                                        Mode: interactionMode
                                                                    }}
                                                                    handle={{
                                                                        handleOnChange,
                                                                        setEmailSettings
                                                                    }}
                                                                />}
                                                            </div>
                                                            <div className={`tab-pane ${activeTab.index === 1 ? 'show active' : ''}`} >
                                                                {activeTab.index === 1 && <EmailServerSettings
                                                                    data={{
                                                                        emailSettings,
                                                                        emailSettingError,
                                                                        accountType,
                                                                        Mode: interactionMode
                                                                    }}
                                                                    handle={{
                                                                        handleOnChange,
                                                                        setEmailSettings
                                                                    }}
                                                                />
                                                                }
                                                            </div>

                                                            <div className={`tab-pane text-center p-2 ${activeTab.index === 2 ? 'show active' : ''}`}>
                                                                {
                                                                    activeTab.index === 2 && <EmailSubmit
                                                                        data={{
                                                                            emailSettings,
                                                                            finish
                                                                        }}
                                                                    />
                                                                }
                                                            </div>
                                                        </div>
                                                        <ul className="list-inline wizard mb-0">
                                                            <li className="previous list-inline-item">
                                                                <button className={`btn btn-primary ${activeTab.index === 0 || activeTab.index === 2 ? 'd-none' : ''}`} id='prev' onClick={handleOnPreviousNext}>Previous</button>
                                                            </li>
                                                            {
                                                                (activeTab.index === 1) ?
                                                                    <li className="next list-inline-item float-right">
                                                                        <button className="btn btn-primary" disabled={interactionMode === "EMAIL_VIEW" ? true : ""} id="finish" onClick={(e) => { handleFinish(e) }}>
                                                                            Finish
                                                                        </button>
                                                                    </li>
                                                                    :
                                                                    <li className="next list-inline-item float-right">
                                                                        <button className={`btn btn-primary ${activeTab.index === 1 || activeTab.index === 2 ? 'd-none' : ''}`} id="next" onClick={handleOnPreviousNext}>Next</button>
                                                                    </li>
                                                            }
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CreateEmailList;