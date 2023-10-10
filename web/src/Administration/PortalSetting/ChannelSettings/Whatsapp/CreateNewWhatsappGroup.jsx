/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';
import { boolean, object, string } from 'yup';

import { properties } from '../../../../properties';
import { history } from '../../../../common/util/history';
import { get, post, put } from '../../../../common/util/restUtil';
import SupportAvailability from './SupportAvailability';
import WhatsappAccountInfo from './WhatsappAccountInfo';
import WhatsappSettings from './WhatsappSettings';
import WhatsappSubmit from './WhatsappSubmit';

const CreateWhatsappGroup = (props) => {
    const intialValue = {
        id: Math.floor(Math.random() * 900) + Math.floor(Math.random() * 900),
        supportGroup: "",
        channel: "",
        organization: "",
        accountNumber: "",
        title: "",
        predefinedText: "",
        alwaysOnline: "N",
        timeZone: "",
        offlineDescription: "",
        status: 'Y',
        theme: {
            buttonLabel: "",
            rounded: "N",
            square: "Y",
            buttonBackground: "#25D366",
            buttonTextColor: "#FFFFFF"
        },
        deptUser: [],
        customAvailability: []
    }
    const [whatsappSettings, setWhatsappSettings] = useState(intialValue)
    const lookupData = useRef(undefined);
    const [channel, setChannal] = useState()
    const [organization, setOrganization] = useState()
    const [userDeparmentMapping, setUserDeparmentMapping] = useState()
    const [whatsappSettingError, setWhatsappSettingError] = useState({})
    const tableRowData = props?.data?.tableRowData
    const mode = props?.data?.Mode || "ADD"
    const whatsappSettingData = props?.data?.whatsappSettingData
    const [generatedButtonId, setGeneratedButtonId] = useState()
    const [WhatsappData, setWhatsappData] = useState()
    const [interactionMode, setInteractionMode] = useState()
    const [progressBar, setProgresBar] = useState(25)


    const tabs = [
        {
            name: 'Account Information',
            index: 0,
            progressBar: 25
        },
        {
            name: 'Support Availability',
            index: 1,
            progressBar: 50
        },
        {
            name: 'Settings',
            index: 2,
            progressBar: 75
        },
        {
            name: 'Finish',
            index: 3,
            progressBar: 100
        }
    ];
    const [activeTab, setActiveTab] = useState(tabs[0]);

    const validationSchema = object().shape({
        supportGroup: string().required("Support Group is required"),
        channel: string().required("channel is required"),
        organization: string().required("organization is required"),
        accountNumber: string().required("Account Number is required"),
        title: string().required("Title is required"),
        predefinedText: string().required("Predefined Text is required"),
    });

    const accountInformationValidateSchema = object().shape({
        supportGroup: string().required("Support Group is required"),
        channel: string().required("channel is required"),
        organization: string().required("organization is required"),
        accountNumber: string().required("Account Number is required"),
        title: string().required("Title is required"),
        predefinedText: string().required("Predefined Text is required"),
    })

    const supportAvailabilityValidateSchema = object().shape({
        alwaysOnline: string().required("Always Available Required"),
        timeZone: string().required("TimeZone is required"),
        offlineDescription: string().required("Offline Description"),
    })

    const themeValidationSchema = object().shape({
        buttonLabel: string().required("Button Label is required"),
        buttonBackground:string().required("Button Background is required"),
        buttonTextColor: string().required("Button Text Color is required"),
    })

    useEffect(() => {
        setInteractionMode(mode)
    }, [mode])

    useEffect(() => {
        if (['EDIT', 'VIEW'].includes(interactionMode)) {
            setWhatsappSettings(whatsappSettingData)
        }
        else if (interactionMode === "ADD") {
            unstable_batchedUpdates(() => {
                setActiveTab(tabs[0])
                setProgresBar(25)
                setWhatsappSettings(intialValue)
                setGeneratedButtonId()
            })
        }
    }, [interactionMode])

    useEffect(() => {
        getInitialDropDownValues()
    }, [])

    const getInitialDropDownValues = () => {
        
        let organizationData = []
        let option = []
        let userData = []
        //  let roles = []
        post(properties.BUSINESS_ENTITY_API, ['TICKET_CHANNEL'])
            .then((response) => {
                if (response.data) {
                    lookupData.current = response.data;
                    setChannal(lookupData?.current['TICKET_CHANNEL'])
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
                                        if (m?.mappingPayload?.userDeptRoleMapping) {
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

        
        get(`${properties.PORTAL_SETTING_API}/WHATSAPP`)
            .then((response) => {
                const { status, data } = response;
                if (data) {
                    if (status === 200 && !!Object.keys(data).length) {
                        setWhatsappData(data)
                    }
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

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
            if (activeTab.index === 0) {
                let error = validate(accountInformationValidateSchema, whatsappSettings);
                if (error) {
                    toast.error("Validation errors found. Please check all fields");
                    return false;
                }
                else {
                    const index = tabs[++activeTab.index]
                    unstable_batchedUpdates(() => {
                        setActiveTab(index);
                        setProgresBar(index?.progressBar)
                    })
                }
            }
            else if (activeTab.index === 1 && whatsappSettings.alwaysOnline !== "Y") {
                let supportCustomAvability = [...whatsappSettings.customAvailability]
                if(supportCustomAvability.length<1){
                    toast.error("Validation errors found. Please Add Custom Availability");
                    return false;
                }
                else{
                    let error = validate(supportAvailabilityValidateSchema, whatsappSettings);
                    if (error) {
                        toast.error("Validation errors found. Please check all fields");
                        return false;
                    }
                    else {
                        const index = tabs[++activeTab.index]
                        unstable_batchedUpdates(() => {
                            setActiveTab(index);
                            setProgresBar(index?.progressBar)
                        })
                    }
                }
            }
            else {
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
                setWhatsappSettingError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    const handleSubmit = (e) => {
        let themeValidation = {...whatsappSettings.theme}
        let themeError = validate(themeValidationSchema, themeValidation);
        if (themeError) {
            toast.error("Validation errors found. Please check all fields");
            return false;
        }

        let error = validate(validationSchema, whatsappSettings);
        if (error) {
            toast.error("Validation errors found. Please check all fields");
            return false;
        }
        const requestBody = {
            settingType: 'WHATSAPP',
            mappingPayload: (tableRowData && tableRowData?.mappingPayload) || (WhatsappData && WhatsappData?.mappingPayload) || []
        }
        if (whatsappSettingData || tableRowData || WhatsappData) {
            if (interactionMode === 'EDIT') {
                const whatsappSettingList = []
                requestBody?.mappingPayload.forEach((api) => {
                    if (Number(api.id) === Number(whatsappSettings.id)) {
                        whatsappSettingList.push(whatsappSettings)
                    } else {
                        whatsappSettingList.push(api)
                    }
                })
                requestBody.mappingPayload = whatsappSettingList
            }
            else if (interactionMode === 'ADD') {
                requestBody.mappingPayload.push(whatsappSettings)
            }
            
            requestBody.settingId = tableRowData?.settingId || WhatsappData?.settingId
            put(properties.PORTAL_SETTING_API, requestBody)
                .then((response) => {
                    const { status, data } = response;
                    if (status === 200 && !!Object.keys(data).length) {
                        toast.success('Whatsapp Setting has been updated');
                        unstable_batchedUpdates(() => {
                            //data?.mappingPayload?.generatedButtonId
                            setActiveTab(tabs[++activeTab.index]);
                            setGeneratedButtonId("1")
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

            requestBody.mappingPayload.push(whatsappSettings)
            
            post(properties.PORTAL_SETTING_API, requestBody)
                .then((response) => {
                    const { status, data } = response;
                    if (status === 200 && !!Object.keys(data).length) {
                        toast.success('Whatsapp Setting has been Created');
                        unstable_batchedUpdates(() => {
                            //data?.mappingPayload?.generatedButtonId
                            setGeneratedButtonId("1")
                            setActiveTab(tabs[++activeTab.index]);
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

    const handleFinish = (e) => {
        handleSubmit(e)
    }

    const handleClear = () => {
        unstable_batchedUpdates(() => {
            setWhatsappSettings(intialValue)
            setInteractionMode("ADD")
            setGeneratedButtonId()
        })

        const data = {
            ActiveTab: "create-whatsapp-group",
            Mode: "ADD",
        }
        history.push(`${process.env.REACT_APP_BASE}/portal-settings/channel-settings`, { data })
    }

    const handleCellLinkClick = (e, rowData, mode) => {
        handleClear()
    }

    const handleOnChange = (e) => {
        const { target } = e;
        if ((target.type === 'radio' || target.type === 'checkbox') && target.id !== 'alwaysOnline') {

            if (target.id === "square") {
                const themeUpdate = {
                    ...whatsappSettings.theme,
                    square: target.value ? 'Y' : 'N',
                    rounded: !target.value ? 'Y' : 'N'
                }
                setWhatsappSettings({
                    ...whatsappSettings,
                    theme: themeUpdate
                })

            }
            else if (target.id === "rounded") {
                const themeUpdate = {
                    ...whatsappSettings.theme,
                    rounded: target.value ? 'Y' : 'N',
                    square: !target.value ? 'Y' : 'N'
                }
                setWhatsappSettings({
                    ...whatsappSettings,
                    theme: themeUpdate
                })
            }
            else {
                setWhatsappSettings({
                    ...whatsappSettings,
                    [target.id]: target.checked ? 'Y' : 'N',
                })
            }

        }
        else if (target.id === 'day' || target.id === 'fromTime' || target.id === 'toTime') {
            const customUpdate = {
                ...whatsappSettings.customAvailability,
                [target.id]: target.value,
            }
            setWhatsappSettings({
                ...whatsappSettings,
                customAvailability: customUpdate
            })
        }
        else if (target.id === 'buttonLabel' || target.id === 'buttonBackground' || target.id === 'buttonTextColor') {
            const themeUpdate = {
                ...whatsappSettings.theme,
                [target.id]: target.value,
            }

            setWhatsappSettings({
                ...whatsappSettings,
                theme: themeUpdate
            })
            setWhatsappSettingError({
                ...whatsappSettingError,
                [target.id]: ""
            })
        }
        else if (target.id === 'alwaysOnline') {
            if (target.checked) {
                setWhatsappSettings({
                    ...whatsappSettings,
                    [target.id]: target.checked ? 'Y' : 'N',
                    timeZone: '',
                    customAvailability: [],
                    offlineDescription:""
                })
            }
            else {
                setWhatsappSettings({
                    ...whatsappSettings,
                    [target.id]: target.checked ? 'Y' : 'N',
                })
            }

        }
        else {
            unstable_batchedUpdates(() => {
                setWhatsappSettingError({
                    ...whatsappSettingError,
                    [target.id]: ""
                })
                setWhatsappSettings({
                    ...whatsappSettings,
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
                                                    <h5>Whatsapp Settings</h5>
                                                </div>
                                                <div className="col-md-4">
                                                    <span style={{ float: "right" }}>
                                                        <button type="button" className="btn btn-labeled btn-primary btn-sm mt-1" onClick={(e) => handleCellLinkClick(e, {}, 'ADD')}>
                                                            <small>Add Whatsapp Support</small>
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
                                                                {activeTab.index === 0 && <WhatsappAccountInfo
                                                                    data={{
                                                                        whatsappSettings,
                                                                        whatsappSettingError,
                                                                        channel,
                                                                        organization,
                                                                        userDeparmentMapping,
                                                                        Mode: interactionMode
                                                                    }}
                                                                    handle={{
                                                                        handleOnChange,
                                                                        setWhatsappSettings
                                                                    }}
                                                                />}
                                                            </div>
                                                            <div className={`tab-pane ${activeTab.index === 1 ? 'show active' : ''}`} >
                                                                {activeTab.index === 1 && <SupportAvailability
                                                                    data={{
                                                                        whatsappSettings,
                                                                        whatsappSettingError,
                                                                        Mode: interactionMode
                                                                    }}
                                                                    handle={{
                                                                        handleOnChange,
                                                                        setWhatsappSettings
                                                                    }}
                                                                />
                                                                }
                                                            </div>
                                                            <div className={`tab-pane text-center p-2 ${activeTab.index === 2 ? 'show active' : ''}`}>
                                                                {
                                                                    activeTab.index === 2 && <WhatsappSettings
                                                                        data={{
                                                                            whatsappSettings,
                                                                            whatsappSettingError,
                                                                            Mode: interactionMode
                                                                        }}
                                                                        handle={{
                                                                            handleOnChange,
                                                                            setWhatsappSettings
                                                                        }}
                                                                    />
                                                                }
                                                            </div>
                                                            <div className={`tab-pane text-center p-2 ${activeTab.index === 3 ? 'show active' : ''}`}>
                                                                {
                                                                    activeTab.index === 3 && <WhatsappSubmit
                                                                        data={{
                                                                            whatsappSettings,
                                                                            generatedButtonId: generatedButtonId
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
                                                                        <button className="btn btn-primary" disabled={interactionMode === "VIEW" ? true : ""} id="finish" onClick={(e) => { handleFinish(e) }}>
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
export default CreateWhatsappGroup