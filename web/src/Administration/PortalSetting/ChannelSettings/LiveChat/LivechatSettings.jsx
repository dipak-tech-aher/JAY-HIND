/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';
import { object, string } from 'yup';

import { properties } from '../../../../properties';
import { get, post, put } from '../../../../common/util/restUtil';
import CreateLiveChatID from './CreateLiveChatID';
import SelectLiveChatId from './SelectLiveChatId';
import Settings from './Settings';
import SupportAvailability from './SupportAvailability';
import Finish from './Finish'

const LiveChatSettings = (props) => {
    const intialValue = {
        id: Math.floor(Math.random() * 900) + Math.floor(Math.random() * 900),
        livechat: [],
        LiveChatId: "",
        userDepartment: [],
        title: "",
        predefineText: "",
        onlineAvailability: "N",
        timeZone: "",
        customAvailability: [],
        offlineText: "",
        logo:[],
        theme: {
            buttonLabel: "",
            welcomeMessage: "",
            titleColor: "#25D366"
        }

    }
    const [isCreate, setIsCreate] = useState(true);
    const [finish, setFinish] = useState(false)
    const [progressBar, setProgresBar] = useState(25)
    const [livechatSettings, setLiveChatSettings] = useState(intialValue)
    const [userDeparmentMapping, setUserDeparmentMapping] = useState()
    const [organization, setOrganization] = useState()
    const [livechatSettingsError, setLiveChatSettingsError] = useState({})
    const [generatedButtonId, setGeneratedButtonId] = useState()
    const [logoExistingFiles, setLogoExistingFiles] = useState([]);
    const [logocurrentFiles, setlogoCurrentFiles] = useState([])

    const tabs = [
        {
            name: 'LiveChat ID Creation',
            index: 0,
            progressBar: 20
        },
        {
            name: 'Select Live Chat ID',
            index: 1,
            progressBar: 40
        },
        {
            name: 'Support Availability',
            index: 2,
            progressBar: 60
        },
        {
            name: 'Settings',
            index: 3,
            progressBar: 80
        },
        {
            name: 'Finish',
            index: 4,
            progressBar: 100
        }
    ];
    const [activeTab, setActiveTab] = useState(tabs[0]);

    useEffect(() => {
        if (true) {
            getLiveChatSettingsData();
        }
    }, [])

    const getLiveChatSettingsData = () => {
        
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
                            
                        }).catch((error) => {
                            console.log(error)
                        })
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()

        
        get(`${properties.PORTAL_SETTING_API}/LIVECHAT`)
            .then((response) => {
                const { status, data } = response;
                if (data) {
                    setIsCreate(false)
                    if (status === 200 && !!Object.keys(data).length) {
                        setLiveChatSettings({
                            ...livechatSettings,
                            settingId: data?.settingId,
                            livechat: data?.mappingPayload?.livechat,
                            LiveChatId: data?.mappingPayload?.LiveChatId,
                            userDepartment: data?.mappingPayload?.userDepartment,
                            title: data?.mappingPayload?.title,
                            predefineText: data?.mappingPayload?.predefineText,
                            onlineAvailability: data?.mappingPayload?.onlineAvailability,
                            timeZone: data?.mappingPayload?.timeZone,
                            customAvailability: data?.mappingPayload?.customAvailability,
                            offlineText: data?.mappingPayload?.offlineText,
                            logo: data?.mappingPayload?.logo && [...data?.mappingPayload?.logo?.map((current) => ({ attachmentId: current.attachmentId, entityId: current.entityId, entityType: current.entityType,fileName:current?.fileName }))],
                            theme: {
                                buttonLabel: data?.mappingPayload?.theme?.buttonLabel,
                                welcomeMessage: data?.mappingPayload?.theme?.welcomeMessage,
                                titleColor: data?.mappingPayload?.theme?.titleColor
                            }
                        })
                        setLogoExistingFiles([...data?.mappingPayload?.logo?.map((current) => ({ attachmentId: current.attachmentId, entityId: current.entityId, entityType: current.entityType,fileName:current?.fileName }))])

                    }
                }
                else {
                    toast.error("Please Add the Livechat Details")
                    setIsCreate(true)
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

    const validationSchema = object().shape({
        LiveChatId: string().required("Live Chat Id is required"),
        title: string().required("title is required"),
        predefineText: string().required("Predefined Text is required"),
        onlineAvailability: string().required("Always available online is required"),
        timeZone: string().required("TimeZone is required"),
        offlineText: string().required("Description text when offline is required")
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
            unstable_batchedUpdates(() => {
                setActiveTab(selectedTab);
                setProgresBar(selectedTab.progressBar)
            });
            return;
        }
        unstable_batchedUpdates(() => {
            setActiveTab(selectedTab);
            setProgresBar(selectedTab.progressBar)
        })
    }

    const validate = (schema, data) => {
        try {
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setLiveChatSettingsError((prevState) => {
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
        let error = validate(validationSchema, livechatSettings);
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        else {
            const requestBody = {
                settingType: 'LIVECHAT',
                settingId: livechatSettings?.settingId,
                attachment:true,
                mappingPayload: {
                    id: livechatSettings?.id,
                    livechat: livechatSettings?.livechat,
                    LiveChatId: livechatSettings?.LiveChatId,
                    userDepartment: livechatSettings?.userDepartment,
                    title: livechatSettings?.title,
                    predefineText: livechatSettings?.predefineText,
                    onlineAvailability: livechatSettings?.onlineAvailability,
                    timeZone: livechatSettings?.timeZone,
                    customAvailability: livechatSettings?.customAvailability,
                    offlineText: livechatSettings?.offlineText,
                    theme: livechatSettings?.theme,
                    logo: [...logoExistingFiles.map((current) => ({ attachmentId: current.attachmentId, entityId: current.entityId, entityType: current.entityType,fileName:current.fileName })), ...logocurrentFiles.map((current) => ({ attachmentId: current.attachmentId, entityId: current.entityId, entityType: current.entityType,fileName:current.fileName}))],

                }
            }

            if (!isCreate) {
                
                const logoCertificate=[]

                for (let e of requestBody.mappingPayload.logo){
                    logoCertificate.push({...e, entityId:livechatSettings?.settingId.toString()})
                }
                requestBody.mappingPayload= ({...requestBody.mappingPayload,logo:logoCertificate})

                put(properties.PORTAL_SETTING_API, requestBody)
                    .then((response) => {
                        const { status, data } = response;
                        if (status === 200 && !!Object.keys(data).length) {
                            toast.success('Live Chat Setting has been updated');
                            unstable_batchedUpdates(() => {
                                setActiveTab(tabs[++activeTab.index]);
                                setFinish(true);
                                setGeneratedButtonId("1");
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
                            toast.success('Live Chat Setting has been Created');
                            unstable_batchedUpdates(() => {
                                setActiveTab(tabs[++activeTab.index]);
                                setFinish(true);
                                setGeneratedButtonId("1");
                            })
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
            setLiveChatSettings({
                ...livechatSettings,
                [target.id]: target.checked ? 'Y' : 'N',
            })
        }
        else if (target.id === 'titleColor' || target.id === 'welcomeMessage' || target.id === 'buttonLabel') {
            const themeUpdate = {
                ...livechatSettings.theme,
                [target.id]: target.value,
            }

            setLiveChatSettings({
                ...livechatSettings,
                theme: themeUpdate
            })
        }
        else {
            unstable_batchedUpdates(() => {
                setLiveChatSettingsError({
                    ...livechatSettingsError,
                    [target.id]: ""
                })
                setLiveChatSettings({
                    ...livechatSettings,
                    [target.id]: target.value
                })
            })
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
                                                    <h5>Live Chat Settings</h5>
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
                                                                {activeTab.index === 0 && <CreateLiveChatID
                                                                    data={{
                                                                        livechatSettingsError,
                                                                        livechatSettings,
                                                                        setLiveChatSettings,
                                                                        setIsCreate,
                                                                        setLiveChatSettingsError
                                                                    }}
                                                                />}
                                                            </div>
                                                            <div className={`tab-pane ${activeTab.index === 1 ? 'show active' : ''}`} >
                                                                {activeTab.index === 1 && <SelectLiveChatId
                                                                    data={{
                                                                        livechatSettingsError,
                                                                        livechatSettings,
                                                                        userDeparmentMapping,
                                                                        setLiveChatSettings
                                                                    }}
                                                                    handle={{
                                                                        handleOnChange
                                                                    }}
                                                                />
                                                                }
                                                            </div>
                                                            <div className={`tab-pane ${activeTab.index === 2 ? 'show active' : ''}`} >
                                                                {activeTab.index === 2 && <SupportAvailability
                                                                    data={{
                                                                        livechatSettings,
                                                                        livechatSettingsError
                                                                    }}
                                                                    handle={{
                                                                        handleOnChange,
                                                                        setLiveChatSettings
                                                                    }}
                                                                />
                                                                }
                                                            </div>
                                                            <div className={`tab-pane text-center p-2 ${activeTab.index === 3 ? 'show active' : ''}`}>
                                                                {
                                                                    activeTab.index === 3 && <Settings

                                                                        data={{
                                                                            livechatSettings,
                                                                            setLiveChatSettings,
                                                                            logocurrentFiles,
                                                                            logoExistingFiles,
                                                                            setlogoCurrentFiles,
                                                                            setLogoExistingFiles
                                                                        }}
                                                                        handle={{
                                                                            handleOnChange
                                                                        }}

                                                                    />
                                                                }
                                                            </div>
                                                            <div className={`tab-pane text-center p-2 ${activeTab.index === 4 ? 'show active' : ''}`}>
                                                                {
                                                                    activeTab.index === 4 && <Finish
                                                                        data={{
                                                                            livechatSettings,
                                                                            generatedButtonId,
                                                                            finish
                                                                        }} />
                                                                }
                                                            </div>
                                                        </div>
                                                        <ul className="list-inline wizard mb-0">
                                                            <li className="previous list-inline-item">
                                                                <button className={`btn btn-primary ${activeTab.index === 0 || activeTab.index === 4 ? 'd-none' : ''}`} id='prev' onClick={handleOnPreviousNext}>Previous</button>
                                                            </li>
                                                            {
                                                                (activeTab.index === 3) ?
                                                                    <li className="next list-inline-item float-right">
                                                                        <button className="btn btn-primary" id="finish" onClick={(e) => { handleFinish(e) }}>
                                                                            Finish
                                                                        </button>
                                                                    </li>
                                                                    :
                                                                    <li className="next list-inline-item float-right">
                                                                        <button className={`btn btn-primary ${activeTab.index === 3 || activeTab.index === 4 ? 'd-none' : ''}`} id="next" onClick={handleOnPreviousNext}>Next</button>
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

export default LiveChatSettings;