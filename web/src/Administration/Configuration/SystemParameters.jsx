import React, { useEffect, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { useHistory } from "react-router-dom";
import ReactSwitch from "react-switch";
import { toast } from 'react-toastify';
import avatarPlaceholder from '../../assets/images/profile-placeholder.png';
import store from '../../assets/images/store.svg';
import { get, post, put } from '../../common/util/restUtil';
import { properties } from '../../properties';
import FaqSetup from './FaqSetup';

const SystemParamters = () => {
    const history = useHistory();
    const otpDurations = [
        { label: "1 minute", value: 1 },
        { label: "2 minutes", value: 2 },
        { label: "5 minutes", value: 5 },
        { label: "10 minutes", value: 10 },
        { label: "15 minutes", value: 15 },
        { label: "30 minutes", value: 30 },
    ];
    const [systemParamtersData, setSystemParametersData] = useState({
        buttonColor: "",
        navbarColor: "",
        logoImage: avatarPlaceholder,
        userManualPdf: "",
        businessSetup: [],
        maxRolesLimit: "",
        maxEntityLimit: "",
        emailPortalSetting: {
            host: "",
            port: "",
            userName: "",
            password: "",
            fromEmailAddress: "",
            clientId: '',
            secret: '',
            url: '',
            scope: '',
            grantType: '',
            inboxUrl: '',
            mailUserId: '',
            status: 'IN',
            showPassword: false,
            isRequired: 'Y'
        },
        ivrPortalSetting: {
            clientId: "",
            apiKey: "",
            status: 'IN',
            isRequired: 'Y'
        },
        telegramPortalSetting: {
            email: "",
            password: "",
            apiKey: "",
            status: 'IN',
            isRequired: 'Y'
        },
        whatsappPortalSetting: {
            whatsappToken: "",
            whatsappNumber: "",
            phoneNumberId: "",
            status: 'IN',
            isRequired: 'Y'
        },
        facebookPortalSetting: {
            fbPageAccessToken: "",
            fbVerifyToken: "",
            fbBaseApiUrl: "",
            fbPageId: "",
            fbUserName: "",
            status: 'IN',
            isRequired: 'Y'
        },
        zoomPortalSetting: {
            clientId: "",
            clientSecretKey: "",
            accountId: "",
            status: 'IN',
            isRequired: 'Y'
        },
        teamsPortalSetting: {
            clientId: "",
            clientSecret: "",
            scope: "",
            tenantId: "",
            appUserID: "",
            status: 'IN',
            isRequired: 'Y'
        },
        googleMeetingPortalSetting: {
            clientId: "",
            clientSecretKey: "",
            status: 'IN',
            isRequired: 'Y'
        },
        notificationEmailSetting: {
            host: "",
            port: "",
            userName: "",
            password: "",
            fromEmailAddress: "",
            status: 'IN',
            showPassword: false,
            isRequired: 'Y'
        },
        notificationSmsSetting: {
            provider: "",
            url: "",
            app: "",
            user: "",
            password: "",
            host_no: "",
            op: "",
            status: 'IN',
            showPassword: false,
            isRequired: 'Y'
        },
        otpExpirationDuration: {
            email_sms: 10
        },
        rosterAutoAssignSetting: 'N',
        requestEnableSetting: 'N',
        channelEnablement: [],
        multiLanguageSelection: [],
        sessionAutoLogout: {
            value: "",
            type: ""
        },
        loginRetryCount: ""
    })
    const [moduleSetupList, setModuleSetupList] = useState([])
    const [businessSetupLookup, setBusinessSetupLookup] = useState([])
    const [userTypeLookup, setUserTypeLookup] = useState([])
    const [ticketChannelLookup, setTicketChannelLookup] = useState([])
    const [billLanguageLookup, setBillLanguageLookup] = useState([])
    const [customWorkDiv, setCustomWorkDiv] = useState(['workDiv0'])
    const [mainMenuData, setMainMenuData] = useState([])
    const [entityCategoryLookup, setEntityCategoryLookup] = useState([])
    const [faqList, setFaqList] = useState([])
    const [isOpen, setIsOpen] = useState({
        addOrEdit: false,
        delete: false
    })
    const [templateData, setTemplateData] = useState({
    })
    const [currentCount, setcurrentCount] = useState({
        department: 0,
        role: 0,
        user: {
            total: 0
        }
    })
    const [defaultRole, setDefaultRole] = useState(null)
    const [defaultDepartment, setDefaultDepartment] = useState(null)
    const [appTenantId, setAppTenantId] = useState(null)

    useEffect(() => {
        get(properties.MASTER_API + '/get-app-config').then((resp) => {
            get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=PRODUCT_FAMILY,USER_TYPE,USER_FAMILY,BILL_LANGUAGE,ENTITY_CATEGORY,CONFIG_MODULE')
                .then((response) => {
                    if (response.data) {
                        if (resp?.data?.configId) {
                            unstable_batchedUpdates(() => {
                                setModuleSetupList(response.data.CONFIG_MODULE.map((x) => { return { ...x, isSelected: 'N' } }) || [])
                                setBusinessSetupLookup(response.data.PRODUCT_FAMILY.map((x) => { return { ...x, isSelected: resp?.data?.businessSetup.includes(x.code) ? 'Y' : 'N' } }) || [])
                                setUserTypeLookup(response.data.USER_TYPE || [])
                                setTicketChannelLookup(response.data.USER_FAMILY.map((x) => { return { ...x, isSelected: resp?.data?.channelSetupPayload.includes(x.code) ? 'Y' : 'N' } }) || [])
                                setBillLanguageLookup(response.data.BILL_LANGUAGE.map((x) => { return { ...x, isSelected: resp?.data?.multiLangSetupPayload.includes(x.code) ? 'Y' : 'N' } }) || [])
                                setEntityCategoryLookup(response.data.ENTITY_CATEGORY.map((x) => { return { ...x, isSelected: resp?.data?.requestCycleSetupPayload.includes(x.code) ? 'Y' : 'N' } }) || [])
                                setMainMenuData(response.data.CONFIG_MODULE.filter((y) => y?.mapping?.mapEntity.includes(resp?.data?.businessSetup[0])).map((x) => { return { ...x, isSelected: resp?.data?.moduleSetupPayload.includes(x.code) ? 'Y' : 'N' } }) || [])
                                // setFaqList(resp?.data?.appFaq)
                                const templateObject = {}
                                const divList = customWorkDiv
                                resp?.data?.userLimitPayload.forEach((x, index) => {
                                    templateObject['userType' + index] = x.userType
                                    templateObject['personCount' + index] = x.count
                                    if (index > 0) {
                                        divList.push('workDiv' + index)
                                    }
                                })
                                setTemplateData(templateObject)
                                setCustomWorkDiv(divList)
                                setSystemParametersData({
                                    ...systemParamtersData,
                                    configId: resp?.data?.configId,
                                    buttonColor: resp?.data?.appButtonColor,
                                    navbarColor: resp?.data?.appBarColor,
                                    logoImage: resp?.data?.appLogo,
                                    userManualPdf: resp?.data?.appUserManual,
                                    maxRolesLimit: resp?.data?.maxRolesLimit,
                                    maxEntityLimit: resp?.data?.maxEntityLimit,
                                    rosterAutoAssignSetting: resp?.data?.appRosterFlag ? 'Y' : 'N',
                                    sessionAutoLogout: {
                                        value: resp?.data?.maxSessionTimeout?.value,
                                        type: resp?.data?.maxSessionTimeout?.type
                                    },
                                    loginRetryCount: resp?.data?.maxPasswordRetry,
                                    emailPortalSetting: {
                                        host: resp?.data?.portalSetupPayload?.emailPortalSetting?.host,
                                        port: resp?.data?.portalSetupPayload?.emailPortalSetting?.port,
                                        userName: resp?.data?.portalSetupPayload?.emailPortalSetting?.userName,
                                        password: resp?.data?.portalSetupPayload?.emailPortalSetting?.password,
                                        fromEmailAddress: resp?.data?.portalSetupPayload?.emailPortalSetting?.fromEmailAddress,
                                        clientId: resp?.data?.portalSetupPayload?.emailPortalSetting?.clientId,
                                        secret: resp?.data?.portalSetupPayload?.emailPortalSetting?.secret,
                                        url: resp?.data?.portalSetupPayload?.emailPortalSetting?.url,
                                        scope: resp?.data?.portalSetupPayload?.emailPortalSetting?.scope,
                                        grantType: resp?.data?.portalSetupPayload?.emailPortalSetting?.grantType,
                                        inboxUrl: resp?.data?.portalSetupPayload?.emailPortalSetting?.inboxUrl,
                                        mailUserId: resp?.data?.portalSetupPayload?.emailPortalSetting?.mailUserId,
                                        status: resp?.data?.portalSetupPayload?.emailPortalSetting?.status,
                                        showPassword: false,
                                        isRequired: resp?.data?.portalSetupPayload?.emailPortalSetting?.isRequired
                                    },
                                    ivrPortalSetting: {
                                        clientId: resp?.data?.portalSetupPayload?.ivrPortalSetting?.clientId,
                                        apiKey: resp?.data?.portalSetupPayload?.ivrPortalSetting?.apiKey,
                                        status: resp?.data?.portalSetupPayload?.ivrPortalSetting?.status,
                                        isRequired: resp?.data?.portalSetupPayload?.ivrPortalSetting?.isRequired
                                    },
                                    telegramPortalSetting: {
                                        email: resp?.data?.portalSetupPayload?.telegramPortalSetting?.email,
                                        password: resp?.data?.portalSetupPayload?.telegramPortalSetting?.password,
                                        apiKey: resp?.data?.portalSetupPayload?.telegramPortalSetting?.apiKey,
                                        status: resp?.data?.portalSetupPayload?.telegramPortalSetting?.status,
                                        isRequired: resp?.data?.portalSetupPayload?.telegramPortalSetting?.isRequired
                                    },
                                    whatsappPortalSetting: {
                                        whatsappToken: resp?.data?.portalSetupPayload?.whatsappPortalSetting?.whatsappToken,
                                        whatsappNumber: resp?.data?.portalSetupPayload?.whatsappPortalSetting?.whatsappNumber,
                                        phoneNumberId: resp?.data?.portalSetupPayload?.whatsappPortalSetting?.phoneNumberId,
                                        status: resp?.data?.portalSetupPayload?.whatsappPortalSetting?.status,
                                        isRequired: resp?.data?.portalSetupPayload?.whatsappPortalSetting?.isRequired
                                    },
                                    facebookPortalSetting: {
                                        fbPageAccessToken: resp?.data?.portalSetupPayload?.facebookPortalSetting?.fbPageAccessToken,
                                        fbVerifyToken: resp?.data?.portalSetupPayload?.facebookPortalSetting?.fbVerifyToken,
                                        fbBaseApiUrl: resp?.data?.portalSetupPayload?.facebookPortalSetting?.fbBaseApiUrl,
                                        fbPageId: resp?.data?.portalSetupPayload?.facebookPortalSetting?.fbPageIdn,
                                        fbUserName: resp?.data?.portalSetupPayload?.facebookPortalSetting?.fbUserName,
                                        status: resp?.data?.portalSetupPayload?.facebookPortalSetting?.status,
                                        isRequired: resp?.data?.portalSetupPayload?.facebookPortalSetting?.isRequired
                                    },
                                    zoomPortalSetting: {
                                        clientId: resp?.data?.appointChannelSetupPayload?.zoomPortalSetting?.clientId,
                                        clientSecretKey: resp?.data?.appointChannelSetupPayload?.zoomPortalSetting?.clientSecretKey,
                                        accountId: resp?.data?.appointChannelSetupPayload?.zoomPortalSetting?.accountId,
                                        status: resp?.data?.appointChannelSetupPayload?.zoomPortalSetting?.status,
                                        isRequired: resp?.data?.appointChannelSetupPayload?.zoomPortalSetting?.isRequired
                                    },
                                    teamsPortalSetting: {
                                        clientId: resp?.data?.appointChannelSetupPayload?.teamsPortalSetting?.clientId,
                                        clientSecret: resp?.data?.appointChannelSetupPayload?.teamsPortalSetting?.clientSecret,
                                        scope: resp?.data?.appointChannelSetupPayload?.teamsPortalSetting?.scope,
                                        tenantId: resp?.data?.appointChannelSetupPayload?.teamsPortalSetting?.tenantId,
                                        appUserID: resp?.data?.appointChannelSetupPayload?.teamsPortalSetting?.appUserID,
                                        status: resp?.data?.appointChannelSetupPayload?.teamsPortalSetting?.status,
                                        isRequired: resp?.data?.appointChannelSetupPayload?.teamsPortalSetting?.isRequired
                                    },
                                    googleMeetingPortalSetting: {
                                        clientId: resp?.data?.appointChannelSetupPayload?.googleMeetingPortalSetting?.clientId,
                                        clientSecretKey: resp?.data?.appointChannelSetupPayload?.googleMeetingPortalSetting?.clientSecretKey,
                                        status: resp?.data?.appointChannelSetupPayload?.googleMeetingPortalSetting?.status,
                                        isRequired: resp?.data?.appointChannelSetupPayload?.googleMeetingPortalSetting?.isRequired
                                    },
                                    notificationEmailSetting: {
                                        host: resp?.data?.notificationSetupPayload?.notificationEmailSetting?.host,
                                        port: resp?.data?.notificationSetupPayload?.notificationEmailSetting?.port,
                                        userName: resp?.data?.notificationSetupPayload?.notificationEmailSetting?.userName,
                                        password: resp?.data?.notificationSetupPayload?.notificationEmailSetting?.password,
                                        fromEmailAddress: resp?.data?.notificationSetupPayload?.notificationEmailSetting?.fromEmailAddress,
                                        status: resp?.data?.notificationSetupPayload?.notificationEmailSetting?.status,
                                        showPassword: false,
                                        isRequired: resp?.data?.notificationSetupPayload?.notificationEmailSetting?.isRequired
                                    },
                                    notificationSmsSetting: {
                                        provider: resp?.data?.notificationSetupPayload?.notificationSmsSetting?.provider,
                                        url: resp?.data?.notificationSetupPayload?.notificationSmsSetting?.url,
                                        app: resp?.data?.notificationSetupPayload?.notificationSmsSetting?.app,
                                        user: resp?.data?.notificationSetupPayload?.notificationSmsSetting?.user,
                                        password: resp?.data?.notificationSetupPayload?.notificationSmsSetting?.password,
                                        op: resp?.data?.notificationSetupPayload?.notificationSmsSetting?.op,
                                        host_no: resp?.data?.notificationSetupPayload?.notificationSmsSetting?.host_no,
                                        status: resp?.data?.notificationSetupPayload?.notificationSmsSetting?.status,
                                        showPassword: false,
                                        isRequired: resp?.data?.notificationSetupPayload?.notificationSmsSetting?.isRequired
                                    },
                                    otpExpirationDuration: {
                                        email_sms: resp?.data?.otpExpirationDuration?.email_sms
                                    }
                                })
                                setDefaultRole(resp?.data?.appDefaultRole)
                                setDefaultDepartment(resp?.data?.appDefaultDepartment)
                                setAppTenantId(resp?.data?.appTenantId)
                            })
                        } else {
                            unstable_batchedUpdates(() => {

                                setBusinessSetupLookup(response.data.PRODUCT_FAMILY.map((x) => { return { ...x, isSelected: 'N' } }) || [])
                                setUserTypeLookup(response.data.USER_TYPE || [])
                                setTicketChannelLookup(response.data.CONFIG_CHANNEL.map((x) => { return { ...x, isSelected: 'N' } }) || [])
                                setBillLanguageLookup(response.data.BILL_LANGUAGE.map((x) => { return { ...x, isSelected: 'N' } }) || [])
                                setEntityCategoryLookup(response.data.ENTITY_CATEGORY.map((x) => { return { ...x, isSelected: 'N' } }) || [])
                                setMainMenuData(response.data.CONFIG_MODULE.map((x) => { return { ...x, isSelected: 'N' } }) || [])
                                setModuleSetupList(response.data.CONFIG_MODULE.map((x) => { return { ...x, isSelected: 'N' } }) || [])
                            })
                        }
                    }
                })
                .catch(error => {
                    console.error(error);
                }).finally()
        }).catch(error => {
            console.error(error);
        }).finally()

        // get Current count
        get(properties.MASTER_API + '/get-current-count').then((res) => {
            if (res.status === 200) {
                setcurrentCount(res.data)
            }
        }).catch(error => {
            console.error(error)
        }).finally()

        // get faqs initially
        getFAQs();
    }, [])

    const getFAQs = () => {
        get(properties.MASTER_API + '/faqs').then((res) => {
            if (res.status === 200) {
                console.log("Faqs ===> ", res.data);
                setFaqList(res.data ?? [])
            }
        }).catch(error => {
            console.error(error)
        }).finally()
    }

    const [roles, setRoles] = useState([])
    const [department, setDepartment] = useState([])
    const [departments, setDepartments] = useState([])
    useEffect(() => {
        get(properties.USER_API + '/roles-departments')
            .then((resp) => {
                setRoles(resp?.data?.roles)
                setDepartment(resp?.data?.departments)
            })
            .catch(error => {
                console.error(error);
            }).finally()
    }, [])


    const handleSelectBusinessSetup = (data, e) => {
        setBusinessSetupLookup(
            businessSetupLookup.map((x) => {
                if (x?.code === data?.code) {
                    x.isSelected = e.target.checked ? 'Y' : 'N'
                }
                else {
                    x.isSelected = 'N'
                }
                return x
            })
        )
        setMainMenuData(moduleSetupList.filter((y) => y?.mapping?.mapEntity.includes(data?.code)).map((x) => { return { ...x, isSelected: 'N' } }) || [])
    }

    const handleSelectModuleSetup = (data, e) => {
        setMainMenuData(
            mainMenuData.map((x) => {
                if (x?.code === data?.code) {
                    x.isSelected = e.target.checked ? 'Y' : 'N'
                }
                return x
            })
        )
    }

    const handleSelectChannelEnablement = (data, e) => {
        setTicketChannelLookup(
            ticketChannelLookup.map((x) => {
                if (x?.code === data?.code) {
                    x.isSelected = e.target.checked ? 'Y' : 'N'
                }
                return x
            })
        )
    }

    const handleSelectMultiLanguageSelection = (data, e) => {
        setBillLanguageLookup(
            billLanguageLookup.map((x) => {
                if (x?.code === data?.code) {
                    x.isSelected = e.target.checked ? 'Y' : 'N'
                }
                return x
            })
        )
    }

    const handleSelectEntityCategorySetup = (data, e) => {
        setEntityCategoryLookup(
            entityCategoryLookup.map((x) => {
                if (x?.code === data?.code) {
                    x.isSelected = e.target.checked ? 'Y' : 'N'
                }
                return x
            })
        )
    }

    const addWorkTimeRow = () => {
        let cDivs = [...customWorkDiv];
        cDivs.push('workDiv' + customWorkDiv.length)
        setCustomWorkDiv(cDivs)
    }
    const removeWorkTimeRow = (id) => {
        const newDivs = customWorkDiv.filter(e => (e) !== id)
        setCustomWorkDiv(newDivs)
    }

    useEffect(() => {
        console.log(systemParamtersData);
    }, [systemParamtersData])

    const handleSubmit = () => {
        if (!systemParamtersData.logoImage) {
            toast.error('Please Provide the Logo')
            return
        }
        if (!systemParamtersData.buttonColor) {
            toast.error('Please Provide the Button Color')
            return
        }
        if (!systemParamtersData.navbarColor) {
            toast.error('Please Provide the Navbar Color')
            return
        }
        if (businessSetupLookup.filter((x) => x.isSelected === 'Y').map((y) => y.code).length === 0) {
            toast.error('Please Provide the Business Setup Values')
            return
        }
        if (!systemParamtersData.maxRolesLimit) {
            toast.error('Please Provide the Maximum Roles Limit')
            return
        }

        if (systemParamtersData.maxRolesLimit && systemParamtersData.maxRolesLimit < currentCount?.role) {
            toast.error(`you already have ${currentCount?.role} active role. please provide value greater than ${currentCount?.role}`)
            return
        }

        if (!systemParamtersData.maxEntityLimit) {
            toast.error('Please Provide the Maximum Entity Limit')
            return
        }
        if (systemParamtersData.maxEntityLimit && systemParamtersData.maxEntityLimit < currentCount?.department) {
            toast.error(`you already have ${currentCount?.department} active department. please provide value greater than ${currentCount?.department}`)
            return
        }
        if (!templateData) {
            toast.error('Please Provide the Users Limit')
            return
        }


        if (mainMenuData.filter((x) => x.isSelected === 'Y').map((y) => y.moduleName).length === 0) {
            toast.error('Please Provide the Module Setup Values')
            return
        }
        if (systemParamtersData.emailPortalSetting.isRequired === 'Y' && (!systemParamtersData.emailPortalSetting.host || !systemParamtersData.emailPortalSetting.port || !systemParamtersData.emailPortalSetting.userName
            || !systemParamtersData.emailPortalSetting.password || !systemParamtersData.emailPortalSetting.fromEmailAddress || !systemParamtersData.emailPortalSetting.clientId
            || !systemParamtersData.emailPortalSetting.secret || !systemParamtersData.emailPortalSetting.url || !systemParamtersData.emailPortalSetting.scope
            || !systemParamtersData.emailPortalSetting.grantType || !systemParamtersData.emailPortalSetting.inboxUrl || !systemParamtersData.emailPortalSetting.mailUserId)) {
            toast.error('Please Provide the Email Portal Setting')
            return
        }
        if (systemParamtersData.ivrPortalSetting.isRequired === 'Y' && (!systemParamtersData.ivrPortalSetting.clientId || !systemParamtersData.ivrPortalSetting.apiKey)) {
            toast.error('Please Provide the IVR Portal Setting')
            return
        }
        if (systemParamtersData.whatsappPortalSetting.isRequired === 'Y' && (!systemParamtersData.whatsappPortalSetting.whatsappNumber || !systemParamtersData.whatsappPortalSetting.whatsappToken || !systemParamtersData.whatsappPortalSetting.phoneNumberId)) {
            toast.error('Please Provide the WhastApp Portal Setting')
            return
        }
        if (systemParamtersData.facebookPortalSetting.isRequired === 'Y' && (!systemParamtersData.facebookPortalSetting.fbBaseApiUrl || !systemParamtersData.facebookPortalSetting.fbPageAccessToken || !systemParamtersData.facebookPortalSetting.fbPageId
            || !systemParamtersData.facebookPortalSetting.fbUserName || !systemParamtersData.facebookPortalSetting.fbVerifyToken)) {
            toast.error('Please Provide the Facebook Portal Setting')
            return
        }
        if (systemParamtersData.zoomPortalSetting.isRequired === 'Y' && (!systemParamtersData.zoomPortalSetting.clientId || !systemParamtersData.zoomPortalSetting.clientSecretKey || !systemParamtersData.zoomPortalSetting.accountId)) {
            toast.error('Please Provide the Zoom Appointment Setting')
            return
        }
        if (systemParamtersData.teamsPortalSetting.isRequired === 'Y' && (!systemParamtersData.teamsPortalSetting.clientId || !systemParamtersData.teamsPortalSetting.clientSecret || !systemParamtersData.teamsPortalSetting.scope || !systemParamtersData.teamsPortalSetting.tenantId || !systemParamtersData.teamsPortalSetting.appUserID)) {
            toast.error('Please Provide the Teams Appointment Setting')
            return
        }
        if (systemParamtersData.googleMeetingPortalSetting.isRequired === 'Y' && (!systemParamtersData.googleMeetingPortalSetting.clientId || !systemParamtersData.googleMeetingPortalSetting.clientSecretKey)) {
            toast.error('Please Provide the Google Meeting Appointment Setting')
            return
        }
        if (systemParamtersData.notificationEmailSetting.isRequired === 'Y' && (!systemParamtersData.notificationEmailSetting.host || !systemParamtersData.notificationEmailSetting.port || !systemParamtersData.notificationEmailSetting.password
            || !systemParamtersData.notificationEmailSetting.userName || !systemParamtersData.notificationEmailSetting.fromEmailAddress)) {
            toast.error('Please Provide the Notification Email Setting')
            return
        }
        if (systemParamtersData.notificationSmsSetting.isRequired === 'Y' && (!systemParamtersData.notificationSmsSetting.provider || !systemParamtersData.notificationSmsSetting.url || !systemParamtersData.notificationSmsSetting.app || !systemParamtersData.notificationSmsSetting.user
            || !systemParamtersData.notificationSmsSetting.password || !systemParamtersData.notificationSmsSetting.op || !systemParamtersData.notificationSmsSetting.host_no)) {
            toast.error('Please Provide the Notification SMS Setting')
            return
        }
        if (ticketChannelLookup.filter((x) => x.isSelected === 'Y').map((y) => y.code).length === 0) {
            toast.error('Please Provide the Channel Setup Values')
            return
        }
        if (billLanguageLookup.filter((x) => x.isSelected === 'Y').map((y) => y.code).length === 0) {
            toast.error('Please Provide the Language Setup Values')
            return
        }
        // if(entityCategoryLookup.filter((x) => x.isSelected === 'Y').map((y) => y.code).length === 0) {
        //     toast.error('Please Provide the Request Setup Values')
        //     return
        // }
        if (!systemParamtersData.otpExpirationDuration?.email_sms) {
            toast.error('Please Provide Email/SMS OTP expiry duration')
            return
        }
        if (!systemParamtersData.sessionAutoLogout.value || !systemParamtersData.sessionAutoLogout.type) {
            toast.error('Please Provide the Session Logout Setting')
            return
        }
        if (!systemParamtersData.userManualPdf) {
            toast.error('Please Provide the User Manual PDF')
            return
        }
        if (!systemParamtersData.loginRetryCount) {
            toast.error('Please Provide the Login Password Retry Max Limit')
            return
        }
        if (faqList.length === 0) {
            toast.error('Please Provide the FAQ')
            return
        }
        const objectLength = Object.keys(templateData)
        const list = []
        for (let i = 0; i < objectLength.length / 2; i++) {
            list.push({
                userType: templateData[`userType${i}`],
                count: templateData[`personCount${i}`]
            })
        }

        if (list) {
            let isTrue = false
            for (const t in currentCount?.user) {
                for (const l of list) {
                    if (l.userType === t && l.count < currentCount?.user[t]) {
                        isTrue = true
                    }
                    if (isTrue) {
                        const userTypeDesc = userTypeLookup.filter(e => e.code === l.userType)
                        toast.warn(`you already have ${currentCount?.user[t]} active user for ${userTypeDesc?.[0]?.description}. please provide value greater than ${currentCount?.user[t]}`)
                        return
                    }
                }
                if (isTrue) {
                    return
                }
            }

        }

        const reqBody = {
            logoImage: systemParamtersData.logoImage,
            buttonColor: systemParamtersData.buttonColor,
            navbarColor: systemParamtersData.navbarColor,
            businessSetup: businessSetupLookup.filter((x) => x.isSelected === 'Y').map((y) => y.code),
            maxRolesLimit: systemParamtersData.maxRolesLimit,
            maxEntityLimit: systemParamtersData.maxEntityLimit,
            userLimitPayload: list,
            moduleSetup: mainMenuData.filter((x) => x.isSelected === 'Y').map((y) => y.code),
            portalSetupPayload: {
                emailPortalSetting: systemParamtersData.emailPortalSetting,
                ivrPortalSetting: systemParamtersData.ivrPortalSetting,
                whatsappPortalSetting: systemParamtersData.whatsappPortalSetting,
                facebookPortalSetting: systemParamtersData.facebookPortalSetting
            },
            appointChannelSetupPayload: {
                zoomPortalSetting: systemParamtersData.zoomPortalSetting,
                teamsPortalSetting: systemParamtersData.teamsPortalSetting,
                googleMeetingPortalSetting: systemParamtersData.googleMeetingPortalSetting
            },
            notificationSetupPayload: {
                notificationEmailSetting: systemParamtersData.notificationEmailSetting,
                notificationSmsSetting: systemParamtersData.notificationSmsSetting,
            },
            otpExpirationDuration: systemParamtersData.otpExpirationDuration,
            rosterAutoAssignSetting: systemParamtersData.rosterAutoAssignSetting,
            requestEnableSetting: systemParamtersData.requestEnableSetting,
            channelSetupPayload: ticketChannelLookup.filter((x) => x.isSelected === 'Y').map((y) => y.code),
            multiLanguageSelection: billLanguageLookup.filter((x) => x.isSelected === 'Y').map((y) => y.code),
            requestCycleSetupPayload: entityCategoryLookup.filter((x) => x.isSelected === 'Y').map((y) => y.code),
            sessionAutoLogout: systemParamtersData.sessionAutoLogout,
            userManualPdf: systemParamtersData.userManualPdf,
            loginRetryCount: systemParamtersData.loginRetryCount,
            appDefaultRole: defaultRole,
            appDefaultDepartment: defaultDepartment,
            appTenantId: appTenantId,

        }
        console.log('systemParamtersData---->', systemParamtersData)
        if (systemParamtersData?.configId) {
            put(properties.MASTER_API + '/update-app-config/' + systemParamtersData?.configId, reqBody)
                .then((resp) => {
                    if (resp.status === 200) {
                        toast.success('Successfully Saved the System Paramters');
                        sessionStorage.removeItem('appConfig');
                        history.push(`${process.env.REACT_APP_BASE}/configuration-settings`)
                        // window.location.reload()
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
                .finally()
        } else {
            post(properties.MASTER_API + '/bcae-app-config-create', reqBody)
                .then((resp) => {
                    if (resp.data) {
                        toast.success('Successfully Saved the System Paramters');
                        sessionStorage.removeItem('appConfig');
                        history.push(`${process.env.REACT_APP_BASE}/configuration-settings`)
                        // window.location.reload()
                    }
                })
                .catch((error) => {
                    console.log(error)
                })
                .finally()
        }
    }

    const convertBase64 = (e) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(e.target.files[0]);

            fileReader.onload = () => {
                resolve(fileReader.result);
                return fileReader.result
            };

            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    };

    const handleLogoChange = async (e) => {

        if (!e?.target?.files || e?.target?.files?.length === 0) {
            toast.error("Please select the file to upload");
            return false;
        }

        var extension = e?.target?.files?.[0]?.name?.substr(e?.target?.files[0]?.name?.lastIndexOf('.'));
        if (!(extension?.toLowerCase() === ".jpg") &&
            !(extension?.toLowerCase() === ".jpeg") &&
            !(extension?.toLowerCase() === ".png")
        ) {
            toast.error(e.target.files?.[0]?.name + ' is invalid file format, Please try again with jpg/jpeg/png');
            return false;
        }

        validateImage(e).then(() => {
        }).catch(error => {
            console.log(error)
            toast.warn(error?.message)
        })

        if (e.target.files[0]?.size > 1000000) {
            toast.error("File too Big, please select a file less than 1mb");
            return false;
        }

        const image = await convertBase64(e);
        setSystemParametersData({
            ...systemParamtersData,
            logoImage: image
        })
    }

    const handlePdfChange = async (e) => {

        if (!e?.target?.files || e?.target?.files?.length === 0) {
            toast.error("Please select the file to upload");
            return false;
        }

        var extension = e?.target?.files?.[0]?.name?.substr(e?.target?.files[0]?.name.lastIndexOf('.'));
        if (!(extension?.toLowerCase() === ".pdf")
        ) {
            toast.error(e?.target?.files?.[0]?.name + ' is invalid file format, Please try again with PDF format file');
            return false;
        }
        let image = await convertBase64(e);
        image = image.replace("data:application/pdf;base64,", "");
        setSystemParametersData({
            ...systemParamtersData,
            userManualPdf: image
        })
    }

    const validateImage = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = function (event) {
                const image = new Image();
                image.onload = function () {
                    const width = this.width;
                    const height = this.height;

                    if (width === 150 && height === 150) {
                        resolve();
                    } else {
                        reject(new Error('Invalid image dimensions. Please upload an image with dimensions 150x150.'));
                    }
                };
            };
        });
    }

    const handleOnRoleChange = (e) => {
        setDefaultRole(e?.target?.value)
        const updatedDepartment = department.map((ele) => {
            const filteredMapping = ele?.mappingPayload?.unitroleMapping?.find((x) => Number(x) === Number(e?.target?.value));
            if (e?.target?.value == filteredMapping) {
                return ele
            }
        });
        setDepartments(updatedDepartment?.filter((x) => x !== undefined))
    };

    const handleDepartmentChange = (e) => {
        console.log('e?.target?.value-------->', e?.target?.value)
        setDefaultDepartment(e?.target?.value)
    }

    return (
        <div className="cnt-wrapper">
            <div className="card-skeleton">
                <div className="customer-skel">
                    <div className="cmmn-skeleton">
                        <div className="row">
                            <div className="skel-configuration-settings">
                                <div className="col-md-8">
                                    <div className="skel-config-top-sect">
                                        <h2>System Parameter Settings</h2>
                                        <p>Follow the setup wizard that will guide you through the remaining steps to complete the configuration setup.</p>
                                        <span className="skel-step-styl mt-3">est. 5 minutes <span className="material-icons skel-config-active-tick">check_circle</span></span>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <img src={store} alt="" className="img-fluid" />
                                </div>
                            </div>
                        </div>
                        <div className='row'>
                            <div className="skel-config-info-layout">
                                <div className='col-md-12 mb-3'>
                                    <div className="tabbable">
                                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                                            <li className="nav-item">
                                                <a className="nav-link active" id="general-settings" data-toggle="tab" href="#gsett" role="tab" aria-controls="generaltab" aria-selected="true">General</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" id="OMNI-settings" data-toggle="tab" href="#omnisett" role="tab" aria-controls="omnitab" aria-selected="false">OMNI Channel</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" id="appointment-settings" data-toggle="tab" href="#appsett" role="tab" aria-controls="appttab" aria-selected="false">Appointment</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" id="Notification-settings" data-toggle="tab" href="#notisett" role="tab" aria-controls="notifytab" aria-selected="false">Notification</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" id="FAQ-settings" data-toggle="tab" href="#faqsett" role="tab" aria-controls="faqtab" aria-selected="false">FAQ Setup</a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="tab-content mt-2">
                            <div className="tab-pane fade active show" id="gsett" role="tabpanel" aria-labelledby="generaltab">
                                <div className="row mb-4">
                                    <div className="skel-config-info-layout skel-system-para-settings">
                                        <div className="skel-config-data">
                                            <div className="skel-config-cnt">
                                                <span className="skel-app-heading">Logo Upload <span className="text-danger font-20 fld-imp">*</span></span>
                                                <p>(Actual Size 150px x 150px. Max upload limit 1MB. Please upload logo only jpg/jpeg/png)</p>
                                            </div>
                                            <div className="text-center sys-parm-img">
                                                <img alt=" " className="" id="img" src={systemParamtersData.logoImage} width="150px" height="150px" style={{ objectFit: "cover" }}>
                                                </img>
                                            </div>
                                            <div className="skel-config-btn">
                                                <button className="skel-btn-submit skel-custom-submit-btn"><label htmlFor="inputLogo" style={{
                                                    margin: "auto",
                                                    padding: "2px",
                                                    color: "white",
                                                    textJustify: "auto",
                                                    textAlign: "center",
                                                    cursor: "pointer",

                                                }}>Upload Logo</label></button>
                                                <input type="file"
                                                    accept="image/*"
                                                    name="image-upload"
                                                    id="inputLogo"
                                                    style={{ display: "none" }}
                                                    onChange={handleLogoChange}
                                                />
                                            </div>

                                        </div>

                                        <div className="skel-config-data">
                                            <div className="skel-config-cnt">
                                                <span className="skel-app-heading">Primary Color <span className="text-danger font-20 fld-imp">*</span></span>
                                            </div>
                                            <div className="skel-config-btn">
                                                <input type="color" id="navbarColor" name="navbarColor" style={{ width: "100%" }} value={systemParamtersData.navbarColor} onChange={(e) => setSystemParametersData({ ...systemParamtersData, navbarColor: e.target.value })} />
                                            </div>
                                        </div>

                                        <div className="skel-config-data">
                                            <div className="skel-config-cnt">
                                                <span className="skel-app-heading">Button Color <span className="text-danger font-20 fld-imp">*</span></span>
                                            </div>
                                            <div className="skel-config-btn">
                                                <input type="color" id="buttonColor" name="buttonColor" style={{ width: "100%" }} value={systemParamtersData.buttonColor} onChange={(e) => setSystemParametersData({ ...systemParamtersData, buttonColor: e.target.value })} />
                                            </div>
                                        </div>

                                        <div className="skel-config-data">
                                            <div className="skel-config-cnt">
                                                <span className="skel-app-heading">Business Setup <span className="text-danger font-20 fld-imp">*</span></span>
                                                <h5><b></b></h5>
                                                <div className="col-md-12">
                                                    <div className='row mt-3'>
                                                        {
                                                            businessSetupLookup && businessSetupLookup.map((x) => (
                                                                <div className="col-md-3">
                                                                    <div className="form-group">
                                                                        <div className="custom-control custom-checkbox">
                                                                            <input type="checkbox" id={`mandatory ${x?.code}`}
                                                                                className="custom-control-input"
                                                                                value={x?.isSelected}
                                                                                style={{ cursor: "pointer" }}
                                                                                checked={x?.isSelected === 'Y' ? true : false}
                                                                                onChange={(e) => handleSelectBusinessSetup(x, e)}
                                                                            />
                                                                            <label className="custom-control-label" htmlFor={`mandatory ${x?.code}`}>{x.description}</label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                        <div className="skel-config-data">
                                            <div className="skel-config-cnt">
                                                <span className="skel-app-heading">Module Setup <span className="text-danger font-20 fld-imp">*</span></span>
                                                <div className="col-md-12">
                                                    <div className='row mt-3'>
                                                        {
                                                            mainMenuData && mainMenuData.map((x) => (
                                                                <div className="col-md-3">
                                                                    <div className="form-group">
                                                                        <div className="custom-control custom-checkbox">
                                                                            <input type="checkbox" id={`mandatory ${x?.code}`}
                                                                                className="custom-control-input"
                                                                                value={x?.isSelected}
                                                                                style={{ cursor: "pointer" }}
                                                                                checked={x?.isSelected === 'Y' ? true : false}
                                                                                onChange={(e) => handleSelectModuleSetup(x, e)}
                                                                            />
                                                                            <label className="custom-control-label" htmlFor={`mandatory ${x?.code}`}>{x.description}</label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="skel-config-data">
                                            <div className="skel-config-cnt">
                                                <span className="skel-app-heading">Limit the size of Users/Roles/Departments</span>
                                                <br /><br />
                                                <div className="row">
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label htmlFor="maxRolesLimit" className="control-label">Roles <span className="text-danger font-20 fld-imp">*</span></label>
                                                            <input className="form-control" type="number"
                                                                id="maxRolesLimit" value={systemParamtersData?.maxRolesLimit}
                                                                placeholder="Enter Max Roles Limit"
                                                                onChange={(e) => setSystemParametersData({ ...systemParamtersData, maxRolesLimit: e.target.value })}
                                                                min={0}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label htmlFor="maxEntityLimit" className="control-label">Departments <span className="text-danger font-20 fld-imp">*</span></label>
                                                            <input className="form-control" type="number"
                                                                id="maxEntityLimit" value={systemParamtersData?.maxEntityLimit}
                                                                placeholder="Enter Max Roles Limit"
                                                                onChange={(e) => setSystemParametersData({ ...systemParamtersData, maxEntityLimit: e.target.value })}
                                                                min={0}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="customer_records mt-2">
                                                        {customWorkDiv?.map((cdiv, i) => (
                                                            <div className="form-row" key={i} id={`${cdiv}`} data-block={i}>
                                                                <div className="col-md-3">
                                                                    <div className="form-group">
                                                                        <label className="control-label">User Type <span className="text-danger font-20 fld-imp">*</span></label>
                                                                        <select className="form-control" value={templateData['userType' + i]}
                                                                            onChange={(e) => {
                                                                                setTemplateData({ ...templateData, ['userType' + i]: e.target.value })
                                                                            }}
                                                                        >
                                                                            <option value={null}>Select User Type</option>
                                                                            {userTypeLookup.map((e, k) => (
                                                                                <option key={k} value={e.code}>{e.description}</option>
                                                                            ))}
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div className="col-md-3">
                                                                    <div className="form-group">
                                                                        <label htmlFor="timing" className="control-label">Users <span className="text-danger font-20 fld-imp">*</span></label>
                                                                        <input type="number" id="personCount" className="form-control" value={templateData['personCount' + i]}
                                                                            min={0}
                                                                            onChange={(e) => {
                                                                                setTemplateData({ ...templateData, ['personCount' + i]: e.target.value })
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                {(i == 0) ? (
                                                                    <a className="styl-edti-btn addmore p-1" onClick={addWorkTimeRow}>
                                                                        <i className="fa fa-plus"></i>
                                                                    </a>
                                                                ) : (
                                                                    <a className="inputRemoveslots" onClick={(e) => removeWorkTimeRow(`${cdiv}`)}>
                                                                        <i className="fa fa-minus"></i>
                                                                    </a>
                                                                )}

                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>



                                        {/* <div className="skel-config-data">
                                            <div className="skel-config-cnt">
                                                <span className="skel-app-heading">Roster Auto Assign <ReactSwitch
                                                    onColor="#4C5A81"
                                                    offColor="#6c757d"
                                                    activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                    height={20}
                                                    width={48}
                                                    className="inter-toggle skel-inter-toggle ml-5 mt-1" id="rosterAutoAssignSetting" checked={systemParamtersData.rosterAutoAssignSetting === 'Y' ? true : false}
                                                    onChange={(e) => setSystemParametersData({ ...systemParamtersData, rosterAutoAssignSetting: e ? "Y" : "N" })}
                                                /></span>
                                                <h5><b></b></h5>
                                            </div>
                                        </div> */}

                                        <div className="skel-config-data">
                                            <div className="skel-config-cnt">
                                                <span className="skel-app-heading">OTP expiry duration</span>
                                                <h5><b></b></h5>
                                                <div className="col-md-12">
                                                    <div className='row mt-3'>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="url" className="control-label">Email/SMS <span className="text-danger font-20 fld-imp">*</span></label>
                                                                {/* otpDurations */}
                                                                <select className="form-control" onChange={(e) => {
                                                                    setSystemParametersData({ ...systemParamtersData, otpExpirationDuration: { email_sms: e.target.value } })
                                                                }}>
                                                                    {otpDurations && otpDurations.map((otpDuration) => (
                                                                        <option key={otpDuration.value} selected={systemParamtersData?.otpExpirationDuration?.email_sms == otpDuration.value} value={otpDuration.value}>{otpDuration.label}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="skel-config-data">
                                            <div className="skel-config-cnt">
                                                <span className="skel-app-heading">Request enable flag and repective with entity list</span>
                                                <h5><b></b></h5>
                                                <div className="col-md-12">
                                                    <div className='row mt-3'>
                                                        {
                                                            entityCategoryLookup && entityCategoryLookup.map((x) => (
                                                                <div className="col-md-3">
                                                                    <div className="form-group">
                                                                        <div className="custom-control custom-checkbox">
                                                                            <input type="checkbox" id={`mandatory ${x?.code}`}
                                                                                className="custom-control-input"
                                                                                value={x?.isSelected}
                                                                                style={{ cursor: "pointer" }}
                                                                                checked={x?.isSelected === 'Y' ? true : false}
                                                                                onChange={(e) => handleSelectEntityCategorySetup(x, e)}
                                                                            />
                                                                            <label className="custom-control-label" htmlFor={`mandatory ${x?.code}`}>{x.description}</label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* <div className="skel-config-data">
                                            <div className="skel-config-cnt">
                                                <span className="skel-app-heading">Channel Enablement <span className="text-danger font-20 fld-imp">*</span></span>
                                                <h5><b></b></h5>
                                                <div className="col-md-12">
                                                    <div className='row mt-3'>
                                                        {
                                                            ticketChannelLookup && ticketChannelLookup.map((x) => (
                                                                <div className="col-md-3">
                                                                    <div className="form-group">
                                                                        <div className="custom-control custom-checkbox">
                                                                            <input type="checkbox" id={`mandatory ${x?.code}`}
                                                                                className="custom-control-input"
                                                                                value={x?.isSelected}
                                                                                style={{ cursor: "pointer" }}
                                                                                checked={x?.isSelected === 'Y' ? true : false}
                                                                                onChange={(e) => handleSelectChannelEnablement(x, e)}
                                                                            />
                                                                            <label className="custom-control-label" htmlFor={`mandatory ${x?.code}`}>{x.description}</label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div> */}

                                        <div className="skel-config-data">
                                            <div className="skel-config-cnt">
                                                <span className="skel-app-heading">Multi-Language Selection <span className="text-danger font-20 fld-imp">*</span></span>
                                                <div className="col-md-12">
                                                    <div className='row mt-3'>
                                                        {
                                                            billLanguageLookup && billLanguageLookup.map((x) => (
                                                                <div className="col-md-3">
                                                                    <div className="form-group">
                                                                        <div className="custom-control custom-checkbox">
                                                                            <input type="checkbox" id={`mandatory ${x?.code}`}
                                                                                className="custom-control-input"
                                                                                value={x?.isSelected}
                                                                                style={{ cursor: "pointer" }}
                                                                                checked={x?.isSelected === 'Y' ? true : false}
                                                                                onChange={(e) => handleSelectMultiLanguageSelection(x, e)}
                                                                            />
                                                                            <label className="custom-control-label" htmlFor={`mandatory ${x?.code}`}>{x.description}</label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="skel-config-data">
                                            <div className="skel-config-cnt">
                                                <span className="skel-app-heading">Default Role And Department</span>
                                                <div className="row">
                                                    <div className='col-md-6'>
                                                        <label className='skel-app-heading' htmlFor="">Role<span className="text-danger font-20 fld-imp">*</span></label>
                                                        <select className="form-control" id="type" style={{ width: "100%" }} onChange={(e) => handleOnRoleChange(e)}
                                                        >
                                                            {roles?.map((ele) => <option value={ele?.roleId}>{ele?.roleName}</option>)}
                                                        </select>
                                                    </div>
                                                    <div className='col-md-6'>
                                                        <label htmlFor="" className='skel-app-heading'>Department <span className="text-danger font-20 fld-imp">*</span></label>
                                                        <select className="form-control" id="type" style={{ width: "100%" }}
                                                            onClick={(e) => handleDepartmentChange(e)}>
                                                            {departments?.map((ele) => <option value={ele?.unitId}>{ele?.unitDesc}</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="skel-config-data">
                                            <div className="skel-config-cnt">
                                                <span className="skel-app-heading">App Tenant Id</span>
                                                <div className="row">
                                                    <div className='col-md-12'>
                                                        <label className='skel-app-heading' htmlFor="">Tenant Id<span className="text-danger font-20 fld-imp">*</span></label>
                                                        <input placeholder='Tenant Id' type="text" className='form-control' value={appTenantId}
                                                            onChange={(event) => setAppTenantId(event.target.value)} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="skel-config-data">
                                            <div className="skel-config-cnt">
                                                <span className="skel-app-heading">Session Auto Logout <span className="text-danger font-20 fld-imp">*</span></span>
                                                <h5><b></b></h5>
                                            </div>
                                            <div className="skel-config-btn">
                                                <div className=" form-inline">
                                                    <input className="form-control" type="number"
                                                        id="value" value={systemParamtersData?.sessionAutoLogout?.value}
                                                        placeholder="Enter Value" style={{ width: "40%" }}
                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, sessionAutoLogout: { ...systemParamtersData.sessionAutoLogout, value: e.target.value } })}
                                                        min={0}
                                                    />
                                                    <div className="custselect ml-2" style={{ width: "50%" }}>
                                                        <select className="form-control" id="type" style={{ width: "100%" }}
                                                            value={systemParamtersData?.sessionAutoLogout?.type}
                                                            onChange={(e) => setSystemParametersData({ ...systemParamtersData, sessionAutoLogout: { ...systemParamtersData.sessionAutoLogout, type: e.target.value } })}
                                                        >
                                                            <option value="">Select Type</option>
                                                            <option value="MIN">Mins</option>
                                                            <option value="SEC">Sec</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>



                                        <div className="skel-config-data">
                                            <div className="skel-config-cnt">
                                                <span className="skel-app-heading">Login password retry max limit <span className="text-danger font-20 fld-imp">*</span></span>
                                                <h5><b></b></h5>
                                            </div>
                                            <div className="skel-config-btn">
                                                <div className="form-group">
                                                    <input className="form-control" type="number"
                                                        id="loginRetryCount" value={systemParamtersData?.loginRetryCount}
                                                        placeholder="Enter Max Roles Limit"
                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, loginRetryCount: e.target.value })}
                                                        min={0}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="skel-config-data">
                                            <div className="skel-config-cnt">
                                                <span className="skel-app-heading">Business User Manual <span className="text-danger font-20 fld-imp">*</span></span>
                                                <h5><b></b></h5>
                                            </div>
                                            <div className="skel-config-btn">
                                                <button className="skel-btn-submit skel-custom-submit-btn"><label htmlFor="input" style={{
                                                    margin: "auto",
                                                    padding: "2px",
                                                    color: "white",
                                                    textJustify: "auto",
                                                    textAlign: "center",
                                                    cursor: "pointer",

                                                }}>Upload PDF</label></button>
                                                <input type="file"
                                                    accept="application/pdf, image/*"
                                                    name="image-upload"
                                                    id="input"
                                                    style={{ display: "none" }}
                                                    onChange={handlePdfChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="skel-config-data">
                                            <div className="skel-config-cnt">
                                                <span className="skel-app-heading">Consumer User Manual <span className="text-danger font-20 fld-imp">*</span></span>
                                                <h5><b></b></h5>
                                            </div>
                                            <div className="skel-config-btn">
                                                <button className="skel-btn-submit skel-custom-submit-btn"><label htmlFor="input" style={{
                                                    margin: "auto",
                                                    padding: "2px",
                                                    color: "white",
                                                    textJustify: "auto",
                                                    textAlign: "center",
                                                    cursor: "pointer",

                                                }}>Upload PDF</label></button>
                                                <input type="file"
                                                    accept="application/pdf, image/*"
                                                    name="image-upload"
                                                    id="input"
                                                    style={{ display: "none" }}
                                                    onChange={handlePdfChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="tab-pane fade" id="omnisett" role="tabpanel" aria-labelledby="omnitab">
                                <div className="row mb-4">
                                    <div className="skel-config-info-layout skel-system-para-settings">
                                        <span className="skel-app-heading">OMNI Channel Settings</span>
                                        <div className="skel-portal-settings">
                                            <div className="skel-config-data">
                                                <div className="skel-config-cnt">
                                                    <div className='row'>
                                                        <div className="col-md-4">
                                                            <div className='row'>
                                                                <div className="col-md-6">
                                                                    <h5><b>Email</b></h5>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <ReactSwitch
                                                                        onColor="#4C5A81"
                                                                        offColor="#6c757d"
                                                                        activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                                        height={20}
                                                                        width={48}
                                                                        className="inter-toggle skel-inter-toggle " id="smartSwitch" checked={systemParamtersData.emailPortalSetting.isRequired === 'Y' ? true : false}
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, emailPortalSetting: { ...systemParamtersData.emailPortalSetting, isRequired: e ? "Y" : "N" } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-8">
                                                        </div>
                                                    </div>
                                                    {
                                                        systemParamtersData.emailPortalSetting.isRequired === 'Y' &&
                                                        <div className='row mt-3'>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="clientId" className="control-label">Client ID <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="clientId" value={systemParamtersData?.emailPortalSetting?.clientId}
                                                                        placeholder="Enter Client ID"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, emailPortalSetting: { ...systemParamtersData.emailPortalSetting, clientId: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="secret" className="control-label">Secrey Key <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="secret" value={systemParamtersData?.emailPortalSetting?.secret}
                                                                        placeholder="Enter Secrey Key"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, emailPortalSetting: { ...systemParamtersData.emailPortalSetting, secret: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="url" className="control-label">URL <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="url" value={systemParamtersData?.emailPortalSetting?.url}
                                                                        placeholder="Enter URL"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, emailPortalSetting: { ...systemParamtersData.emailPortalSetting, url: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="scope" className="control-label">Scope <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="scope" value={systemParamtersData?.emailPortalSetting?.scope}
                                                                        placeholder="Enter Scope"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, emailPortalSetting: { ...systemParamtersData.emailPortalSetting, scope: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="grantType" className="control-label">Grant Type <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="grantType" value={systemParamtersData?.emailPortalSetting?.grantType}
                                                                        placeholder="Enter Grant Type"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, emailPortalSetting: { ...systemParamtersData.emailPortalSetting, grantType: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="inboxUrl" className="control-label">Inbox URL <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="inboxUrl" value={systemParamtersData?.emailPortalSetting?.inboxUrl}
                                                                        placeholder="Enter Inbox URL"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, emailPortalSetting: { ...systemParamtersData.emailPortalSetting, inboxUrl: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="mailUserId" className="control-label">Mail User ID <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="mailUserId" value={systemParamtersData?.emailPortalSetting?.mailUserId}
                                                                        placeholder="Enter Mail User ID"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, emailPortalSetting: { ...systemParamtersData.emailPortalSetting, mailUserId: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="host" className="control-label">Host <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="host" value={systemParamtersData?.emailPortalSetting?.host}
                                                                        placeholder="Enter Host"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, emailPortalSetting: { ...systemParamtersData.emailPortalSetting, host: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="port" className="control-label">Port <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="port" value={systemParamtersData?.emailPortalSetting?.port}
                                                                        placeholder="Enter Port"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, emailPortalSetting: { ...systemParamtersData.emailPortalSetting, port: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="userName" className="control-label">User Name <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="email"
                                                                        id="userName" value={systemParamtersData?.emailPortalSetting?.userName}
                                                                        placeholder="Enter User Name"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, emailPortalSetting: { ...systemParamtersData.emailPortalSetting, userName: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="password" className="control-label">Password <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <div className="input-group input-group-merge">
                                                                        <input type={systemParamtersData?.emailPortalSetting?.showPassword ? 'text' : 'password'} id="password" className={`form-control`} value={systemParamtersData?.emailPortalSetting?.password}
                                                                            onChange={(e) => setSystemParametersData({ ...systemParamtersData, emailPortalSetting: { ...systemParamtersData.emailPortalSetting, password: e.target.value } })}
                                                                        />
                                                                        <div className={`input-group-append ${systemParamtersData?.emailPortalSetting?.showPassword === false ? "" : "show-password"}`} data-password="false"
                                                                            onClick={(e) => setSystemParametersData({ ...systemParamtersData, emailPortalSetting: { ...systemParamtersData.emailPortalSetting, showPassword: !systemParamtersData.emailPortalSetting.showPassword } })}
                                                                        >
                                                                            <div className="input-group-text cursor-pointer">
                                                                                <span className="password-eye font-12"></span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="fromEmailAddress" className="control-label">From Email Address <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="email"
                                                                        id="fromEmailAddress" value={systemParamtersData?.emailPortalSetting?.fromEmailAddress}
                                                                        placeholder="Enter From Email Address"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, emailPortalSetting: { ...systemParamtersData.emailPortalSetting, fromEmailAddress: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="status" className="control-label">Status <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <ReactSwitch
                                                                        onColor="#4C5A81"
                                                                        offColor="#6c757d"
                                                                        activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                                        height={20}
                                                                        width={48}
                                                                        className="inter-toggle skel-inter-toggle mt-1" id="smartSwitch" checked={systemParamtersData.emailPortalSetting.status === 'AC' ? true : false}
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, emailPortalSetting: { ...systemParamtersData.emailPortalSetting, status: e ? "AC" : "IN" } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                            <div className="skel-config-data">
                                                <div className="skel-config-cnt">
                                                    <div className='row'>
                                                        <div className="col-md-4">
                                                            <div className='row'>
                                                                <div className="col-md-6">
                                                                    <h5><b>IVR</b></h5>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <ReactSwitch
                                                                        onColor="#4C5A81"
                                                                        offColor="#6c757d"
                                                                        activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                                        height={20}
                                                                        width={48}
                                                                        className="inter-toggle skel-inter-toggle " id="smartSwitch" checked={systemParamtersData.ivrPortalSetting.isRequired === 'Y' ? true : false}
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, ivrPortalSetting: { ...systemParamtersData.ivrPortalSetting, isRequired: e ? "Y" : "N" } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-8">
                                                        </div>
                                                    </div>
                                                    {
                                                        systemParamtersData.ivrPortalSetting.isRequired === 'Y' &&
                                                        <div className='row mt-3'>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="clientId" className="control-label">Client Id <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="clientId" value={systemParamtersData?.ivrPortalSetting?.clientId}
                                                                        placeholder="Enter Client Id"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, ivrPortalSetting: { ...systemParamtersData.ivrPortalSetting, clientId: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label htmlFor="apiKey" className="control-label">API Key <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="apiKey" value={systemParamtersData?.ivrPortalSetting?.apiKey}
                                                                        placeholder="Enter API Key"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, ivrPortalSetting: { ...systemParamtersData.ivrPortalSetting, apiKey: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-2">
                                                                <div className="form-group">
                                                                    <label htmlFor="password" className="control-label">Status <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <ReactSwitch
                                                                        onColor="#4C5A81"
                                                                        offColor="#6c757d"
                                                                        activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                                        height={20}
                                                                        width={48}
                                                                        className="inter-toggle skel-inter-toggle mt-1" id="smartSwitch" checked={systemParamtersData.ivrPortalSetting.status === 'AC' ? true : false}
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, ivrPortalSetting: { ...systemParamtersData.ivrPortalSetting, status: e ? "AC" : "IN" } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                            <div className="skel-config-data d-none">
                                                <div className="skel-config-cnt">
                                                    <h5><b>Telegram</b></h5>
                                                    <div className='row mt-2'>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="email" className="control-label">Email <span className="text-danger font-20 fld-imp">*</span></label>
                                                                <input className="form-control" type="email"
                                                                    id="email" value={systemParamtersData?.telegramPortalSetting?.email}
                                                                    placeholder="Enter Email"
                                                                    onChange={(e) => setSystemParametersData({ ...systemParamtersData, telegramPortalSetting: { ...systemParamtersData.telegramPortalSetting, email: e.target.value } })}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="password" className="control-label">Password <span className="text-danger font-20 fld-imp">*</span></label>
                                                                <input className="form-control" type="text"
                                                                    id="password" value={systemParamtersData?.telegramPortalSetting?.password}
                                                                    placeholder="Enter Password"
                                                                    onChange={(e) => setSystemParametersData({ ...systemParamtersData, telegramPortalSetting: { ...systemParamtersData.telegramPortalSetting, password: e.target.value } })}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className='row mt-0'>
                                                        <div className="col-md-8">
                                                            <div className="form-group">
                                                                <label htmlFor="apiKey" className="control-label">API Key <span className="text-danger font-20 fld-imp">*</span></label>
                                                                <input className="form-control" type="text"
                                                                    id="apiKey" value={systemParamtersData?.telegramPortalSetting?.apiKey}
                                                                    placeholder="Enter API Key"
                                                                    onChange={(e) => setSystemParametersData({ ...systemParamtersData, telegramPortalSetting: { ...systemParamtersData.telegramPortalSetting, apiKey: e.target.value } })}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="skel-config-btn">
                                                    <ReactSwitch
                                                        onColor="#4C5A81"
                                                        offColor="#6c757d"
                                                        activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                        height={20}
                                                        width={48}
                                                        className="inter-toggle skel-inter-toggle" id="smartSwitch" checked={systemParamtersData.telegramPortalSetting.status === 'AC' ? true : false}
                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, telegramPortalSetting: { ...systemParamtersData.telegramPortalSetting, status: e ? "AC" : "IN" } })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="skel-config-data">
                                                <div className="skel-config-cnt">
                                                    <div className='row'>
                                                        <div className="col-md-4">
                                                            <div className='row'>
                                                                <div className="col-md-6">
                                                                    <h5><b>WhatsApp</b></h5>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <ReactSwitch
                                                                        onColor="#4C5A81"
                                                                        offColor="#6c757d"
                                                                        activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                                        height={20}
                                                                        width={48}
                                                                        className="inter-toggle skel-inter-toggle " id="smartSwitch" checked={systemParamtersData.whatsappPortalSetting.isRequired === 'Y' ? true : false}
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, whatsappPortalSetting: { ...systemParamtersData.whatsappPortalSetting, isRequired: e ? "Y" : "N" } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-8">
                                                        </div>
                                                    </div>
                                                    {
                                                        systemParamtersData.whatsappPortalSetting.isRequired === 'Y' &&
                                                        <div className='row mt-3'>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="whatsappToken" className="control-label">Whatsapp Token <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="whatsappToken" value={systemParamtersData?.whatsappPortalSetting?.whatsappToken}
                                                                        placeholder="Enter Whatsapp Token"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, whatsappPortalSetting: { ...systemParamtersData.whatsappPortalSetting, whatsappToken: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="whatsappNumber" className="control-label">Whatsapp Number <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="whatsappNumber" value={systemParamtersData?.whatsappPortalSetting?.whatsappNumber}
                                                                        placeholder="Enter Whatsapp Number"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, whatsappPortalSetting: { ...systemParamtersData.whatsappPortalSetting, whatsappNumber: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="phoneNumberId" className="control-label">Phone Number ID <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="phoneNumberId" value={systemParamtersData?.whatsappPortalSetting?.phoneNumberId}
                                                                        placeholder="Enter Phone Number ID"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, whatsappPortalSetting: { ...systemParamtersData.whatsappPortalSetting, phoneNumberId: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="status" className="control-label">Status <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <ReactSwitch
                                                                        onColor="#4C5A81"
                                                                        offColor="#6c757d"
                                                                        activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                                        height={20}
                                                                        width={48}
                                                                        className="inter-toggle skel-inter-toggle mt-1" id="smartSwitch" checked={systemParamtersData.whatsappPortalSetting.status === 'AC' ? true : false}
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, whatsappPortalSetting: { ...systemParamtersData.whatsappPortalSetting, status: e ? "AC" : "IN" } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                            <div className="skel-config-data">
                                                <div className="skel-config-cnt">
                                                    <div className='row'>
                                                        <div className="col-md-4">
                                                            <div className='row'>
                                                                <div className="col-md-6">
                                                                    <h5><b>Facebook</b></h5>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <ReactSwitch
                                                                        onColor="#4C5A81"
                                                                        offColor="#6c757d"
                                                                        activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                                        height={20}
                                                                        width={48}
                                                                        className="inter-toggle skel-inter-toggle " id="smartSwitch" checked={systemParamtersData.facebookPortalSetting.isRequired === 'Y' ? true : false}
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, facebookPortalSetting: { ...systemParamtersData.facebookPortalSetting, isRequired: e ? "Y" : "N" } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-8">
                                                        </div>
                                                    </div>
                                                    {
                                                        systemParamtersData.facebookPortalSetting.isRequired === 'Y' &&
                                                        <div className='row mt-3'>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="fbPageAccessToken" className="control-label">FB Page Access Token <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="fbPageAccessToken" value={systemParamtersData?.facebookPortalSetting?.fbPageAccessToken}
                                                                        placeholder="Enter FB Page Access Token"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, facebookPortalSetting: { ...systemParamtersData.facebookPortalSetting, fbPageAccessToken: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="fbVerifyToken" className="control-label">FB Verify Token <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="fbVerifyToken" value={systemParamtersData?.facebookPortalSetting?.fbVerifyToken}
                                                                        placeholder="Enter FB Verify Token"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, facebookPortalSetting: { ...systemParamtersData.facebookPortalSetting, fbVerifyToken: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="fbBaseApiUrl" className="control-label">FB Base API URL <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="fbBaseApiUrl" value={systemParamtersData?.facebookPortalSetting?.fbBaseApiUrl}
                                                                        placeholder="Enter FB Base API URL"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, facebookPortalSetting: { ...systemParamtersData.facebookPortalSetting, fbBaseApiUrl: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="fbPageId" className="control-label">FB Page ID <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="fbPageId" value={systemParamtersData?.facebookPortalSetting?.fbPageId}
                                                                        placeholder="Enter FB Page ID"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, facebookPortalSetting: { ...systemParamtersData.facebookPortalSetting, fbPageId: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="fbUserName" className="control-label">FB User Name <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="fbUserName" value={systemParamtersData?.facebookPortalSetting?.fbUserName}
                                                                        placeholder="Enter FB User Name"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, facebookPortalSetting: { ...systemParamtersData.facebookPortalSetting, fbUserName: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="fbUserName" className="control-label">Status <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <ReactSwitch
                                                                        onColor="#4C5A81"
                                                                        offColor="#6c757d"
                                                                        activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                                        height={20}
                                                                        width={48}
                                                                        className="inter-toggle skel-inter-toggle mt-1" id="smartSwitch" checked={systemParamtersData.facebookPortalSetting.status === 'AC' ? true : false}
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, facebookPortalSetting: { ...systemParamtersData.facebookPortalSetting, status: e ? "AC" : "IN" } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        {/* <div className="skel-config-data">
                                            <div className="skel-config-cnt">
                                                <span className="skel-app-heading">Roster Auto Assign <ReactSwitch
                                                    onColor="#4C5A81"
                                                    offColor="#6c757d"
                                                    activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                    height={20}
                                                    width={48}
                                                    className="inter-toggle skel-inter-toggle ml-5 mt-1" id="rosterAutoAssignSetting" checked={systemParamtersData.rosterAutoAssignSetting === 'Y' ? true : false}
                                                    onChange={(e) => setSystemParametersData({ ...systemParamtersData, rosterAutoAssignSetting: e ? "Y" : "N" })}
                                                /></span>
                                                <h5><b></b></h5>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            </div>
                            <div className="tab-pane fade" id="appsett" role="tabpanel" aria-labelledby="appttab">
                                <div className="row mb-4">
                                    <div className="skel-config-info-layout skel-system-para-settings">
                                        <span className="skel-app-heading">Appointment Settings</span>
                                        <div className="skel-portal-settings">
                                            {/* <div className="skel-config-data">
                                                <div className="skel-config-cnt">
                                                    <div className='row'>
                                                        <div className="col-md-8">
                                                            <div className='row'>
                                                                <div className="col-md-8">
                                                                    <h5><b>Teams</b></h5>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <ReactSwitch
                                                                        onColor="#4C5A81"
                                                                        offColor="#6c757d"
                                                                        activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                                        height={20}
                                                                        width={48}
                                                                        className="inter-toggle skel-inter-toggle " id="smartSwitch" checked={systemParamtersData.teamsPortalSetting.isRequired === 'Y' ? true : false}
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, teamsPortalSetting: { ...systemParamtersData.teamsPortalSetting, isRequired: e ? "Y" : "N" } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {systemParamtersData.teamsPortalSetting.isRequired === 'Y' &&
                                                        <div className='row mt-2'>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="clientId" className="control-label">Client ID <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="clientId" value={systemParamtersData?.teamsPortalSetting?.clientId}
                                                                        placeholder="Enter Client ID"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, teamsPortalSetting: { ...systemParamtersData.teamsPortalSetting, clientId: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="clientSecretKey" className="control-label">Client Secret Key <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="clientSecretKey" value={systemParamtersData?.teamsPortalSetting?.clientSecretKey}
                                                                        placeholder="Enter Client Secret Key"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, teamsPortalSetting: { ...systemParamtersData.teamsPortalSetting, clientSecretKey: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="clientSecretKey" className="control-label">Status <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <ReactSwitch
                                                                        onColor="#4C5A81"
                                                                        offColor="#6c757d"
                                                                        activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                                        height={20}
                                                                        width={48}
                                                                        className="inter-toggle skel-inter-toggle ml-2 mt-1" id="smartSwitch" checked={systemParamtersData.teamsPortalSetting.status === 'AC' ? true : false}
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, teamsPortalSetting: { ...systemParamtersData.teamsPortalSetting, status: e ? "AC" : "IN" } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div> */}
                                            <div className="skel-config-data">
                                                <div className="skel-config-cnt">
                                                    <div className='row'>
                                                        <div className="col-md-8">
                                                            <div className='row'>
                                                                <div className="col-md-8">
                                                                    <h5><b>Zoom</b></h5>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <ReactSwitch
                                                                        onColor="#4C5A81"
                                                                        offColor="#6c757d"
                                                                        activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                                        height={20}
                                                                        width={48}
                                                                        className="inter-toggle skel-inter-toggle " id="smartSwitch" checked={systemParamtersData.zoomPortalSetting.isRequired === 'Y' ? true : false}
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, zoomPortalSetting: { ...systemParamtersData.zoomPortalSetting, isRequired: e ? "Y" : "N" } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {systemParamtersData.zoomPortalSetting.isRequired === 'Y' &&
                                                        <div className='row mt-2'>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="accountId" className="control-label">Account ID <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="accountId" value={systemParamtersData?.zoomPortalSetting?.accountId}
                                                                        placeholder="Enter Account No"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, zoomPortalSetting: { ...systemParamtersData.zoomPortalSetting, accountId: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="clientId" className="control-label">Client ID <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="clientId" value={systemParamtersData?.zoomPortalSetting?.clientId}
                                                                        placeholder="Enter Client ID"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, zoomPortalSetting: { ...systemParamtersData.zoomPortalSetting, clientId: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="clientSecretKey" className="control-label">Client Secret Key <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="password"
                                                                        id="clientSecretKey" value={systemParamtersData?.zoomPortalSetting?.clientSecretKey}
                                                                        placeholder="Enter Client Secret Key"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, zoomPortalSetting: { ...systemParamtersData.zoomPortalSetting, clientSecretKey: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="clientSecretKey" className="control-label">Status <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <ReactSwitch
                                                                        onColor="#4C5A81"
                                                                        offColor="#6c757d"
                                                                        activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                                        height={20}
                                                                        width={48}
                                                                        className="inter-toggle skel-inter-toggle mt-1" id="smartSwitch" checked={systemParamtersData.zoomPortalSetting.status === 'AC' ? true : false}
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, zoomPortalSetting: { ...systemParamtersData.zoomPortalSetting, status: e ? "AC" : "IN" } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                            <div className="skel-config-data">
                                                <div className="skel-config-cnt">
                                                    <div className='row'>
                                                        <div className="col-md-8">
                                                            <div className='row'>
                                                                <div className="col-md-8">
                                                                    <h5><b>MicroSoft Teams</b></h5>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <ReactSwitch
                                                                        onColor="#4C5A81"
                                                                        offColor="#6c757d"
                                                                        activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                                        height={20}
                                                                        width={48}
                                                                        className="inter-toggle skel-inter-toggle " id="smartSwitch" checked={systemParamtersData.teamsPortalSetting.isRequired === 'Y' ? true : false}
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, teamsPortalSetting: { ...systemParamtersData.teamsPortalSetting, isRequired: e ? "Y" : "N" } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {systemParamtersData.teamsPortalSetting.isRequired === 'Y' &&
                                                        <div className='row mt-2'>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="clientId" className="control-label">Client ID <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="clientId" value={systemParamtersData?.teamsPortalSetting?.clientId}
                                                                        placeholder="Enter Client ID"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, teamsPortalSetting: { ...systemParamtersData.teamsPortalSetting, clientId: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="clientSecret" className="control-label">Client Secret <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="password"
                                                                        id="clientSecret" value={systemParamtersData?.teamsPortalSetting?.clientSecret}
                                                                        placeholder="Enter Client Secret"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, teamsPortalSetting: { ...systemParamtersData.teamsPortalSetting, clientSecret: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="scope" className="control-label">Scope <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="scope" value={systemParamtersData?.teamsPortalSetting?.scope}
                                                                        placeholder="Enter Client Secret Key"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, teamsPortalSetting: { ...systemParamtersData.teamsPortalSetting, scope: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="tenantId" className="control-label">Tenant ID <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="tenantId" value={systemParamtersData?.teamsPortalSetting?.tenantId}
                                                                        placeholder="Enter Tenant ID"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, teamsPortalSetting: { ...systemParamtersData.teamsPortalSetting, tenantId: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="appUserID" className="control-label">App User ID <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="appUserID" value={systemParamtersData?.teamsPortalSetting?.appUserID}
                                                                        placeholder="Enter Client Secret Key"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, teamsPortalSetting: { ...systemParamtersData.teamsPortalSetting, appUserID: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="teamsStatus" className="control-label">Status <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <ReactSwitch
                                                                        onColor="#4C5A81"
                                                                        offColor="#6c757d"
                                                                        activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                                        height={20}
                                                                        width={48}
                                                                        className="inter-toggle skel-inter-toggle mt-1" id="smartSwitch" checked={systemParamtersData.teamsPortalSetting.status === 'AC' ? true : false}
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, teamsPortalSetting: { ...systemParamtersData.teamsPortalSetting, status: e ? "AC" : "IN" } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                            <div className="skel-config-data">
                                                <div className="skel-config-cnt">
                                                    <div className='row'>
                                                        <div className="col-md-8">
                                                            <div className='row'>
                                                                <div className="col-md-8">
                                                                    <h5><b>Google Meetings</b></h5>
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <ReactSwitch
                                                                        onColor="#4C5A81"
                                                                        offColor="#6c757d"
                                                                        activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                                        height={20}
                                                                        width={48}
                                                                        className="inter-toggle skel-inter-toggle " id="smartSwitch" checked={systemParamtersData.googleMeetingPortalSetting.isRequired === 'Y' ? true : false}
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, googleMeetingPortalSetting: { ...systemParamtersData.googleMeetingPortalSetting, isRequired: e ? "Y" : "N" } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {systemParamtersData.googleMeetingPortalSetting.isRequired === 'Y' &&
                                                        <div className='row mt-2'>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="clientId" className="control-label">Client ID <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="clientId" value={systemParamtersData?.googleMeetingPortalSetting?.clientId}
                                                                        placeholder="Enter Client ID"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, googleMeetingPortalSetting: { ...systemParamtersData.googleMeetingPortalSetting, clientId: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="clientSecretKey" className="control-label">Client Secret Key <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="clientSecretKey" value={systemParamtersData?.googleMeetingPortalSetting?.clientSecretKey}
                                                                        placeholder="Enter Client Secret Key"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, googleMeetingPortalSetting: { ...systemParamtersData.googleMeetingPortalSetting, clientSecretKey: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="clientSecretKey" className="control-label">Status <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <ReactSwitch
                                                                        onColor="#4C5A81"
                                                                        offColor="#6c757d"
                                                                        activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                                        height={20}
                                                                        width={48}
                                                                        className="inter-toggle skel-inter-toggle mt-1" id="smartSwitch" checked={systemParamtersData.googleMeetingPortalSetting.status === 'AC' ? true : false}
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, googleMeetingPortalSetting: { ...systemParamtersData.googleMeetingPortalSetting, status: e ? "AC" : "IN" } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="tab-pane fade" id="notisett" role="tabpanel" aria-labelledby="notifytab">
                                <div className="row mb-4">
                                    <div className="skel-config-info-layout skel-system-para-settings">
                                        <span className="skel-app-heading">Notification Settings</span>
                                        <div className="skel-portal-settings">
                                            <div className="skel-config-data">
                                                <div className="skel-config-cnt">
                                                    <div className='row'>
                                                        <div className="col-md-4">
                                                            <div className='row'>
                                                                <div className="col-md-6">
                                                                    <h5><b>Email</b></h5>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <ReactSwitch
                                                                        onColor="#4C5A81"
                                                                        offColor="#6c757d"
                                                                        activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                                        height={20}
                                                                        width={48}
                                                                        className="inter-toggle skel-inter-toggle " id="smartSwitch" checked={systemParamtersData.notificationEmailSetting.isRequired === 'Y' ? true : false}
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, notificationEmailSetting: { ...systemParamtersData.notificationEmailSetting, isRequired: e ? "Y" : "N" } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-8">
                                                        </div>
                                                    </div>
                                                    {console.log('systemParamtersData--------->',systemParamtersData)}
                                                    {
                                                        systemParamtersData.notificationEmailSetting.isRequired === 'Y' &&
                                                        <div className='row mt-2'>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="host" className="control-label">Host <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="host" value={systemParamtersData?.notificationEmailSetting?.host}
                                                                        placeholder="Enter Host"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, notificationEmailSetting: { ...systemParamtersData.notificationEmailSetting, host: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="port" className="control-label">Port <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="port" value={systemParamtersData?.notificationEmailSetting?.port}
                                                                        placeholder="Enter Port"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, notificationEmailSetting: { ...systemParamtersData.notificationEmailSetting, port: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="userName" className="control-label">User Name <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="email"
                                                                        id="userName" value={systemParamtersData?.notificationEmailSetting?.userName}
                                                                        placeholder="Enter User Name"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, notificationEmailSetting: { ...systemParamtersData.notificationEmailSetting, userName: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="password" className="control-label">Password <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <div className="input-group input-group-merge">
                                                                        <input type={systemParamtersData?.notificationEmailSetting?.showPassword ? 'text' : 'password'} id="password" className={`form-control`} value={systemParamtersData?.notificationEmailSetting?.password}
                                                                            onChange={(e) => setSystemParametersData({ ...systemParamtersData, notificationEmailSetting: { ...systemParamtersData.notificationEmailSetting, password: e.target.value } })}
                                                                        />
                                                                        <div className={`input-group-append ${systemParamtersData?.notificationEmailSetting?.showPassword === false ? "" : "show-password"}`} data-password="false"
                                                                            onClick={(e) => setSystemParametersData({ ...systemParamtersData, notificationEmailSetting: { ...systemParamtersData.notificationEmailSetting, showPassword: !systemParamtersData.notificationEmailSetting.showPassword } })}
                                                                        >
                                                                            <div className="input-group-text cursor-pointer">
                                                                                <span className="password-eye font-12"></span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="fromEmailAddress" className="control-label">From Email Address <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="email"
                                                                        id="fromEmailAddress" value={systemParamtersData?.notificationEmailSetting?.fromEmailAddress}
                                                                        placeholder="Enter From Email Address"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, notificationEmailSetting: { ...systemParamtersData.notificationEmailSetting, fromEmailAddress: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="status" className="control-label">Status <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <ReactSwitch
                                                                        onColor="#4C5A81"
                                                                        offColor="#6c757d"
                                                                        activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                                        height={20}
                                                                        width={48}
                                                                        className="inter-toggle skel-inter-toggle mt-1" id="smartSwitch" checked={systemParamtersData.notificationEmailSetting.status === 'AC' ? true : false}
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, notificationEmailSetting: { ...systemParamtersData.notificationEmailSetting, status: e ? "AC" : "IN" } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                            <div className="skel-config-data">
                                                <div className="skel-config-cnt">
                                                    <div className='row'>
                                                        <div className="col-md-4">
                                                            <div className='row'>
                                                                <div className="col-md-6">
                                                                    <h5><b>SMS</b></h5>
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <ReactSwitch
                                                                        onColor="#4C5A81"
                                                                        offColor="#6c757d"
                                                                        activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                                        height={20}
                                                                        width={48}
                                                                        className="inter-toggle skel-inter-toggle " id="smartSwitch" checked={systemParamtersData.notificationSmsSetting.isRequired === 'Y' ? true : false}
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, notificationSmsSetting: { ...systemParamtersData.notificationSmsSetting, isRequired: e ? "Y" : "N" } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-8">
                                                        </div>
                                                    </div>
                                                    {
                                                        systemParamtersData.notificationSmsSetting.isRequired === 'Y' &&
                                                        <div className='row mt-2'>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label className="control-label">Provider <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <select className="form-control" id="provider" value={systemParamtersData?.notificationSmsSetting?.provider}
                                                                        onChange={(e) => {
                                                                            setSystemParametersData({ ...systemParamtersData, notificationSmsSetting: { ...systemParamtersData.notificationSmsSetting, provider: e.target.value } })
                                                                        }}
                                                                    >
                                                                        <option value={null}>Select Provider</option>
                                                                        <option value="TWILIO">Twilio</option>
                                                                        <option value="API">API</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="url" className="control-label">SMS Server (URL) <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="url" value={systemParamtersData?.notificationSmsSetting?.url}
                                                                        placeholder="Enter Server Url"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, notificationSmsSetting: { ...systemParamtersData.notificationSmsSetting, url: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="app" className="control-label">SMS App ID (app) <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="app" value={systemParamtersData?.notificationSmsSetting?.app}
                                                                        placeholder="Enter App Id"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, notificationSmsSetting: { ...systemParamtersData.notificationSmsSetting, app: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="host_no" className="control-label">SMS Host number (fn) <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="host_no" value={systemParamtersData?.notificationSmsSetting?.host_no}
                                                                        placeholder="Enter Host Number"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, notificationSmsSetting: { ...systemParamtersData.notificationSmsSetting, host_no: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="user" className="control-label">SMS User Name (u) <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="user" value={systemParamtersData?.notificationSmsSetting?.user}
                                                                        placeholder="Enter User Name"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, notificationSmsSetting: { ...systemParamtersData.notificationSmsSetting, user: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="password" className="control-label">SMS Password (h) <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <div className="input-group input-group-merge">
                                                                        <input type={systemParamtersData?.notificationSmsSetting?.showPassword ? 'text' : 'password'} id="password" className={`form-control`} value={systemParamtersData?.notificationSmsSetting?.password}
                                                                            onChange={(e) => setSystemParametersData({ ...systemParamtersData, notificationSmsSetting: { ...systemParamtersData.notificationSmsSetting, password: e.target.value } })}
                                                                        />
                                                                        <div className={`input-group-append ${systemParamtersData?.notificationSmsSetting?.showPassword === false ? "" : "show-password"}`} data-password="false"
                                                                            onClick={(e) => setSystemParametersData({ ...systemParamtersData, notificationSmsSetting: { ...systemParamtersData.notificationSmsSetting, showPassword: !systemParamtersData.notificationSmsSetting.showPassword } })}
                                                                        >
                                                                            <div className="input-group-text cursor-pointer">
                                                                                <span className="password-eye font-12"></span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="op" className="control-label">SMS Port (op) <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <input className="form-control" type="text"
                                                                        id="op" value={systemParamtersData?.notificationSmsSetting?.op}
                                                                        placeholder="Enter Port Number"
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, notificationSmsSetting: { ...systemParamtersData.notificationSmsSetting, op: e.target.value } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="status" className="control-label">Status <span className="text-danger font-20 fld-imp">*</span></label>
                                                                    <ReactSwitch
                                                                        onColor="#4C5A81"
                                                                        offColor="#6c757d"
                                                                        activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                                        height={20}
                                                                        width={48}
                                                                        className="inter-toggle skel-inter-toggle mt-1" id="smartSwitch" checked={systemParamtersData.notificationSmsSetting.status === 'AC' ? true : false}
                                                                        onChange={(e) => setSystemParametersData({ ...systemParamtersData, notificationSmsSetting: { ...systemParamtersData.notificationSmsSetting, status: e ? "AC" : "IN" } })}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                        {/* <div className="skel-config-data">
                                            <div className="skel-config-cnt">
                                                <span className="skel-app-heading">Roster Auto Assign <ReactSwitch
                                                    onColor="#4C5A81"
                                                    offColor="#6c757d"
                                                    activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                    height={20}
                                                    width={48}
                                                    className="inter-toggle skel-inter-toggle ml-5 mt-1" id="rosterAutoAssignSetting" checked={systemParamtersData.rosterAutoAssignSetting === 'Y' ? true : false}
                                                    onChange={(e) => setSystemParametersData({ ...systemParamtersData, rosterAutoAssignSetting: e ? "Y" : "N" })}
                                                /></span>
                                                <h5><b></b></h5>
                                            </div>
                                        </div> */}

                                    </div>
                                </div>
                            </div>
                            <div className="tab-pane fade" id="faqsett" role="tabpanel" aria-labelledby="faqtab">
                                <div className="row mb-4">
                                    <div className="skel-config-info-layout skel-system-para-settings">
                                        <div>
                                            <span className="skel-app-heading">Notification Settings</span>
                                            <button className="skel-btn-submit text-center skel-custom-submit-btn" onClick={() => setIsOpen({ ...isOpen, addOrEdit: true })}>Create FAQ</button>
                                        </div>
                                        <div className="skel-portal-settings">
                                            <div className="skel-config-data">
                                                <div className="skel-config-cnt">
                                                    <FaqSetup
                                                        data={{
                                                            isOpen,
                                                            faqList
                                                        }}
                                                        handler={{
                                                            setIsOpen,
                                                            setFaqList,
                                                            getFAQs
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="skel-sys-btn">
                            <button className="skel-btn-submit text-center skel-custom-submit-btn" onClick={handleSubmit}>Save Configuration</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SystemParamters