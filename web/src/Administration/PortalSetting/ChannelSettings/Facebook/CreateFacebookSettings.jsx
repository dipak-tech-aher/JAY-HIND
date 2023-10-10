/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';
import { object, string } from 'yup';

import { properties } from '../../../../properties';
import { get, post, put } from '../../../../common/util/restUtil';
import AccountConnection from './AccountConnection';
import ChannelConfiguration from './ChannelConfiguration';
import FacebookAPI from './FacebookAPI';
import FacebookSettingsFinish from './FacebookSettingsFinish';

const CreateFacebookSettings = (props) => {

    const intialValue = {
        id: Math.floor(Math.random() * 900) + Math.floor(Math.random() * 900),
        enableFacebook: "N",
        facebookApiType: "",
        facebookApiId: "",
        facebookAppKey: "",
        facebookUserName: "",
        password: "",
        userDepartment: [],
        facebookPageName: "",
        importSmart: "Y",
        importAll: "N",
        notificationSmart: "Y",
        notificationAll: "N",
        notificationOff: "N"
    }

    const [facebookSettings, setFacebookSettings] = useState(intialValue)
    const [channel, setChannal] = useState()
    const [userDeparmentMapping, setUserDeparmentMapping] = useState()
    const [organization, setOrganization] = useState()
    const [facebookSettingError, setFacebookSettingError] = useState({})
    const [isCreate, setIsCreate] = useState(true);
    const [finish, setFinish] = useState(false)
    const [progressBar, setProgresBar] = useState(25)


    const lookupData = useRef(undefined);

    const tabs = [
        {
            name: 'Facebbok API',
            index: 0,
            progressBar: 25
        },
        {
            name: 'Account Connection',
            index: 1,
            progressBar: 50
        },
        {
            name: 'Channel Configuration',
            index: 2,
            progressBar: 75
        }, {
            name: 'Finish',
            index: 3,
            progressBar: 100
        }];
    const [activeTab, setActiveTab] = useState(tabs[0]);

    useEffect(() => {
        if (true) {
            getFacebookSettingsData();
        }
    }, [])

    const getFacebookSettingsData = () => {
        
        let organizationData = []
        let option = []
        let userData = []

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
                                        for (let n of m.mappingPayload.userDeptRoleMapping) {
                                            if (d.unitId === n.unitId) {
                                                option.push({ label: m.firstName, value: m.userId, unitId: d.unitId })
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

        
        get(`${properties.PORTAL_SETTING_API}/FACEBOOK`)
            .then((response) => {
                const { status, data } = response;
                if (data) {
                    setIsCreate(false)
                    if (status === 200 && !!Object.keys(data).length) {
                        setFacebookSettings({
                            ...facebookSettings,
                            settingId: data?.settingId,
                            enableFacebook: data?.mappingPayload?.enableFacebook || "N",
                            facebookApiType: data?.mappingPayload?.facebookApiType,
                            facebookApiId: data?.mappingPayload?.facebookApiId,
                            facebookAppKey: data?.mappingPayload?.facebookAppKey,
                            facebookUserName: data?.mappingPayload?.facebookUserName,
                            password: data?.mappingPayload?.password,
                            userDepartment: data?.mappingPayload?.userDepartment,
                            facebookPageName: data?.mappingPayload?.facebookPageName,
                            importSmart: data?.mappingPayload?.importSmart,
                            importAll: data?.mappingPayload?.importAll,
                            notificationSmart: data?.mappingPayload?.notificationSmart,
                            notificationAll: data?.mappingPayload?.notificationAll,
                            notificationOff: data?.mappingPayload?.notificationOff
                        })
                    }
                }
                else {
                    setIsCreate(true)
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

    const validationSchema = object().shape({
        facebookApiType: string().required("Facebook API Type is required"),
        facebookApiId: string().required("App Id is required"),
        facebookAppKey: string().required("App Secert Key is required"),
        facebookUserName: string().required("UserName is required"),
        password: string().required("Password is required"),
        userDepartment: string().required("User List is required"),
        facebookPageName: string().required("Facebook PageName is required"),
    });

    const ConnectValidationSchema = object().shape({
        facebookUserName: string().required("UserName is required"),
        password: string().required("Password is required"),
    })

    const facebookApiValidationSchema = object().shape({
        facebookApiType: string().required("Facebook API Type is required"),
        facebookApiId: string().required("App Id is required"),
        facebookAppKey: string().required("App Secert Key is required"),
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
            const index = tabs[++activeTab.index]
            unstable_batchedUpdates(() => {
                setActiveTab(index);
                setProgresBar(index?.progressBar)
            })
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
                setFacebookSettingError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    const handleFinish = (e) => {
        handleSubmit(e)
    }

    const handleSubmit = () => {
        let error = validate(validationSchema, facebookSettings);
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        else {
            const requestBody = {
                settingType: 'FACEBOOK',
                settingId: facebookSettings?.settingId,
                mappingPayload: {
                    id: facebookSettings?.id,
                    enableFacebook: facebookSettings?.enableFacebook,
                    facebookApiType: facebookSettings?.facebookApiType,
                    facebookApiId: facebookSettings?.facebookApiId,
                    facebookAppKey: facebookSettings?.facebookAppKey,
                    facebookUserName: facebookSettings?.facebookUserName,
                    password: facebookSettings?.password,
                    userDepartment: facebookSettings?.userDepartment,
                    facebookPageName: facebookSettings?.facebookPageName,
                    importSmart: facebookSettings?.importSmart,
                    importAll: facebookSettings?.importAll,
                    notificationSmart: facebookSettings?.notificationSmart,
                    notificationAll: facebookSettings?.notificationAll,
                    notificationOff: facebookSettings?.notificationOff
                }
            }

            if (!isCreate) {
                
                put(properties.PORTAL_SETTING_API, requestBody)
                    .then((response) => {
                        const { status, data } = response;
                        if (status === 200 && !!Object.keys(data).length) {
                            toast.success('Facebook API Setting has been updated');
                            unstable_batchedUpdates(() => {
                                setActiveTab(tabs[++activeTab.index]);
                                setFinish(true)
                            })
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
                            toast.success('Facebook API Setting has been Created');
                            unstable_batchedUpdates(() => {
                                setActiveTab(tabs[++activeTab.index]);
                                setFinish(true)
                            })
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

    const handleOnChange = (e) => {

        const { target } = e;
        if (target.type === 'radio' || target.type === 'checkbox') {
            if (target.id === "importSmart") {
                setFacebookSettings({
                    ...facebookSettings,
                    importSmart: target.checked ? 'Y' : 'N',
                    importAll: 'N'
                })
            }
            else if (target.id === "importAll") {
                setFacebookSettings({
                    ...facebookSettings,
                    importSmart: 'N',
                    importAll: target.checked ? 'Y' : 'N'
                })
            }
            else if (target.id === "notificationSmart") {
                setFacebookSettings({
                    ...facebookSettings,
                    notificationSmart: 'Y',
                    notificationAll: 'N',
                    notificationOff: 'N'
                })
            }
            else if (target.id === "notificationAll") {
                setFacebookSettings({
                    ...facebookSettings,
                    notificationSmart: 'N',
                    notificationAll: 'Y',
                    notificationOff: 'N'
                })

            }
            else if (target.id === "notificationOff") {
                setFacebookSettings({
                    ...facebookSettings,
                    notificationSmart: 'N',
                    notificationAll: 'N',
                    notificationOff: 'Y'
                })

            }
            else {
                setFacebookSettings({
                    ...facebookSettings,
                    [target.id]: target.checked ? 'Y' : 'N',
                })
            }
        }
        else {
            unstable_batchedUpdates(() => {
                setFacebookSettingError({
                    ...facebookSettingError,
                    [target.id]: ""
                })
                setFacebookSettings({
                    ...facebookSettings,
                    [target.id]: target.value
                })
            })
        }
    }

    const handleOnAPISubmit = (e) => {
        e.preventDefault()
        let error = validate(facebookApiValidationSchema, facebookSettings);
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        else {
            const requestBody = {
                settingType: 'FACEBOOK',
                mappingPayload: {
                    id: facebookSettings?.id,
                    enableFacebook: facebookSettings?.enableFacebook,
                    facebookApiType: facebookSettings?.facebookApiType,
                    facebookApiId: facebookSettings?.facebookApiId,
                    facebookAppKey: facebookSettings?.facebookAppKey,
                    facebookUserName: facebookSettings?.facebookUserName,
                    facebookPageName: facebookSettings?.facebookPageName,
                    password: facebookSettings?.password,
                    userDepartment: facebookSettings?.userDepartment,
                    importSmart: facebookSettings?.importSmart,
                    importAll: facebookSettings?.importAll,
                    notificationSmart: facebookSettings?.notificationSmart,
                    notificationAll: facebookSettings?.notificationAll,
                    notificationOff: facebookSettings?.notificationOff
                }
            }

            if (!isCreate) {
                
                requestBody.settingId = facebookSettings?.settingId
                put(properties.PORTAL_SETTING_API, requestBody)
                    .then((response) => {
                        const { status, data } = response;
                        if (status === 200 && !!Object.keys(data).length) {
                            setFacebookSettings({
                                ...facebookSettings,
                                id: data?.id,
                                settingId: data?.settingId,
                                enableFacebook: data?.mappingPayload?.enableFacebook,
                                facebookApiType: data?.mappingPayload?.facebookApiType,
                                facebookApiId: data?.mappingPayload?.facebookApiId,
                                facebookAppKey: data?.mappingPayload?.facebookAppKey,
                                facebookUserName: data?.mappingPayload?.facebookUserName,
                                facebookPageName: data?.mappingPayload?.facebookPageName,
                                password: data?.mappingPayload?.password,
                                userDepartment: data?.mappingPayload?.userDepartment,
                                importSmart: data?.mappingPayload?.importSmart,
                                importAll: data?.mappingPayload?.importAll,
                                notificationSmart: data?.mappingPayload?.notificationSmart,
                                notificationAll: data?.mappingPayload?.notificationAll,
                                notificationOff: data?.mappingPayload?.notificationOff
                            })
                            setIsCreate(false)

                            toast.success('Facebook API Setting has been updated');
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
                            setFacebookSettings({
                                ...facebookSettings,
                                id: data?.id,
                                settingId: data?.settingId,
                                enableFacebook: data?.mappingPayload?.enableFacebook,
                                facebookApiType: data?.mappingPayload?.facebookApiType,
                                facebookApiId: data?.mappingPayload?.facebookApiId,
                                facebookAppKey: data?.mappingPayload?.facebookAppKey,
                                facebookUserName: data?.mappingPayload?.facebookUserName,
                                facebookPageName: data?.mappingPayload?.facebookPageName,
                                password: data?.mappingPayload?.password,
                                userDepartment: data?.mappingPayload?.userDepartment,
                                importSmart: data?.mappingPayload?.importSmart,
                                importAll: data?.mappingPayload?.importAll,
                                notificationSmart: data?.mappingPayload?.notificationSmart,
                                notificationAll: data?.mappingPayload?.notificationAll,
                                notificationOff: data?.mappingPayload?.notificationOff
                            })
                            setIsCreate(false)
                            toast.success('Facebook API Setting has been Created');
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

    const handleOnDisConnect = (e) => {
        e.preventDefault()
        let error = validate(ConnectValidationSchema, facebookSettings);
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        else {

        }
    }

    const handleOnConnect = (e) => {
        e.preventDefault()
        let error = validate(ConnectValidationSchema, facebookSettings);
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        else {

        }
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
                                                    <h5>Facebook Settings - Setup Wizard</h5>
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
                                                                        <a className={`nav-link rounded-0 pt-2 pb-2 cursor-pointer ${activeTab?.index === index ? 'active' : ''}`} onClick={() => handleOnTabChange(tab)}>
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
                                                                {activeTab.index === 0 && <FacebookAPI
                                                                    data={{
                                                                        facebookSettingError,
                                                                        facebookSettings
                                                                    }}
                                                                    handle={{
                                                                        handleOnChange,
                                                                        handleOnAPISubmit
                                                                    }}
                                                                />}
                                                            </div>
                                                            <div className={`tab-pane ${activeTab.index === 1 ? 'show active' : ''}`} >
                                                                {activeTab.index === 1 && <AccountConnection
                                                                    data={{
                                                                        facebookSettingError,
                                                                        facebookSettings
                                                                    }}
                                                                    handle={{
                                                                        handleOnChange,
                                                                        handleOnDisConnect,
                                                                        handleOnConnect
                                                                    }}
                                                                />
                                                                }
                                                            </div>
                                                            <div className={`tab-pane ${activeTab.index === 2 ? 'show active' : ''}`} >
                                                                {activeTab.index === 2 && <ChannelConfiguration
                                                                    data={{
                                                                        facebookSettingError,
                                                                        facebookSettings,
                                                                        userDeparmentMapping
                                                                    }}
                                                                    handle={{
                                                                        handleOnChange,
                                                                        setFacebookSettings
                                                                    }}
                                                                />
                                                                }
                                                            </div>
                                                            <div className={`tab-pane text-center p-2 ${activeTab.index === 3 ? 'show active' : ''}`}>
                                                                {
                                                                    activeTab.index === 3 && <FacebookSettingsFinish
                                                                        data={{
                                                                            facebookSettings,
                                                                            finish
                                                                        }}
                                                                    />
                                                                }
                                                            </div>
                                                        </div>
                                                        <ul className="list-inline wizard mb-0">
                                                            <li className="previous list-inline-item">
                                                                <button className={`btn btn-primary ${activeTab.index === 0 || activeTab.index === 3 ? 'd-none' : ''}`} id='prev' onClick={handleOnPreviousNext}>Previous</button>
                                                            </li>
                                                            {
                                                                (activeTab.index === 2) ?
                                                                    <li className="next list-inline-item float-right">
                                                                        <button className="btn btn-primary" id="finish" onClick={(e) => { handleFinish(e) }}>
                                                                            Finish
                                                                        </button>
                                                                    </li>
                                                                    :
                                                                    <li className="next list-inline-item float-right">
                                                                        <button className={`btn btn-primary ${activeTab.index === 2 || activeTab.index === 3 ? 'd-none' : ''}`} id="next" onClick={handleOnPreviousNext}>Next</button>
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

export default CreateFacebookSettings