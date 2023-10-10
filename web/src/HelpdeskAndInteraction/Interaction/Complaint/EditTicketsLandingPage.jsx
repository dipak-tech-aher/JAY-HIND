import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link } from 'react-scroll';
import { get, put, post } from "../../../common/util/restUtil";
import { properties } from "../../../properties";

import { toast } from 'react-toastify';
import TicketDetails from './TicketDetails';
import { string, object } from "yup";
import TicketHistory from './TicketHistory';
import { AppContext } from "../../../AppContext";
import { formatISODateTime } from '../../../common/util/dateUtil';
import { unstable_batchedUpdates } from 'react-dom';
import HelpDeskHistory from '../../Helpdesk/Interactions/shared/HelpdeskHistory';
import MoreDetailsTab from '../../Helpdesk/HelpdeskSearch/MoreDetailsTab';

const ticketDetailsValidationSchema = object().shape({
    assignRole: string().required("Assign Role is required"),
    currStatus: string().required("Current Status is required")
});

const EditTicketsLandingPage = (props) => {

    const { auth } = useContext(AppContext);
    const [permissions, setPermissions] = useState({
        assignToSlef: false,
        followup: false,
        readOnly: false,
        reAssign: false
    });
    const [flowValue, setFlowValue] = useState()
    const [taskHistoryMsg, setTaskHistoryMsg] = useState(false)
    const [customerData, setCustomerData] = useState(null);
    const [showInquiryCustomer, setShowInquiryCustomer] = useState(false)
    const [complaintData, setComplaintData] = useState({
        problemType: "",
        problemCause: "",
        ticketChannel: "",
        ticketSource: "",
        ticketPriority: "",
        contactPreference: "",
        ticketCreatedBy: "",
        currentStatus: "",
        currentDeptRole: "",
        currentUser: "",
        ticketCreatedOn: "",
        ticketDescription: "",
        latestAppointment: "",
        serviceOrProduct: "",
        inquiryAbout: "",
        realTimeDetails: {},
        ticketUserLocation: ""
    });
    const [ticketDetailsError, setTicketDetailsError] = useState({});
    const [ticketDetailsInputs, setTicketDetailsInputs] = useState({
        surveyReq: "",
        assignRole: "",
        entity: "",
        user: "",
        currStatus: "",
        additionalRemarks: "",
        fromDate: "",
        fromTime: "",
        toDate: "",
        toTime: "",
        contactPerson: "",
        contactNumber: "",
        appointmentRemarks: ""
    })
    const [followUpHistory, setFollowUpHistory] = useState([]);
    const [workflowHistory, setWorkflowHistory] = useState([]);
    const [taskHistory, setTaskHistory] = useState([]);
    const [appointmentHistory, setAppointmentHistory] = useState([]);
    const [currentFiles, setCurrentFiles] = useState([]);
    const [existingFiles, setExistingFiles] = useState([]);
    const entityRef = useRef()
    const isRoleChangedByUserRef = useRef(false);
    const currentWorkflowRef = useRef();
    const currentTicketUserRef = useRef({
        currRole: "",
        currDept: "",
        currRoleName: "",
        currUser: "",
        currStatus: ""
    });

    const [onTabChange, setOnTabChange] = useState()
    const [quickLinks, setQuickLinks] = useState([{}])
    const [isQuickLinkEnabled, setIsQuickLinkEnabled] = useState(false)

    const { isAdjustmentOrRefund, type, detailedViewItem = undefined, fromHelpDesk = false, helpDeskView = undefined, noInteraction = undefined } = props.location.state.data;

    const initialize = useCallback(() => {
        const { data } = props.location.state;
        
        isRoleChangedByUserRef.current = false;
        get(`${data.type === 'complaint' ? `${properties.COMPLAINT_API}/${data.interactionId}?type=${isAdjustmentOrRefund ? 'REQSR' : 'REQCOMP'}` : data.type === 'inquiry' ? `${properties.CUSTOMER_INQUIRY_API_2}/${data.interactionId}` : `${properties.SERVICE_REQUEST_DETAILS}/${data.interactionId}`}`)
            .then((response) => {
                setComplaintData({
                    ...response.data,
                    problemType: response.data.problemType,
                    problemCause: response.data.problemCause,
                    problemTypeDescription: response.data.problemTypeDescription,
                    problemCauseDescription: response.data.problemCauseDescription,
                    ticketChannel: response.data.chnlDescription,
                    ticketSource: response.data.sourceDescription,
                    ticketPriority: response.data.priorityDescription,
                    contactPreference: response.data.cntPrefer,
                    contactPreferenceDescription: response.data.cntPreferDescription,
                    ticketCreatedBy: response.data.createdBy,
                    ticketCreatedOn: formatISODateTime(response.data.createdAt),
                    currentStatus: response.data.currStatus,
                    currentStatusDesc: response.data.currStatusDescription,
                    currentDeptRole: `${response.data.currEntity} - ${response.data.currRoleName}`,
                    currentDeptRoleDesc: `${response.data.currEntityDesc} - ${response.data.roleDesc}`,
                    currentUser: response.data.userName,
                    ticketDescription: response.data.description,
                    latestAppointment: response.data.latestAppointment,
                    serviceOrProduct: response.data.services,
                    inquiryAbout: response.data.causeCode,
                    serviceTypeDesc: response.data.typeDescription,
                    ticketUserLocation: response.data.locationDescription,
                    sevearity: response.data.sevearityDescription,
                    commentCauseDescription: response.data.commentCauseDescription,
                    commentTypeDescription: response.data.aboutDescription
                })
                if (['complaint', 'inquiry', 'service request'].includes(data.type)) {
                    let assignRole = !!response.data.currRole ? parseInt(response.data.currRole) : "";
                    let assignDept = !!response.data.currEntity ? response.data.currEntity : "";
                    let assignRoleName = !!response.data.currRoleName ? response.data.currRoleName : "";
                    let user = !!response.data.currUser ? parseInt(response.data.currUser) : "";
                    let currStatus = response.data.currStatus;
                    currentTicketUserRef.current = {
                        currRole: assignRole,
                        currDept: assignDept,
                        currRoleName: assignRoleName,
                        currUser: user,
                        currStatus
                    };
                    // setTicketDetailsInputs({
                    //     ...ticketDetailsInputs,
                    //     assignRole,
                    //     assignRoleName,
                    //     user,
                    //     currStatus
                    // })
                    grantPermissions(assignRole, user, response.data.currStatus, assignDept);
                }
            }).catch(error => console.log(error))
        if (data.type === 'complaint') {
            get(`${properties.COMPLAINT_API}/appointment/${data.interactionId}?type=${isAdjustmentOrRefund ? 'REQSR' : 'REQCOMP'}`)
                .then((response) => {
                    setAppointmentHistory(response.data)
                }).catch(error => console.log(error))
        }
        if (['complaint', 'inquiry'].includes(data.type)) {
            get(`${properties.INTERACTION_API}/followUp/${data.interactionId}`)
                .then((response) => {
                    setFollowUpHistory(response.data)
                }).catch(error => console.log(error))
        }
        get(`${properties.INTERACTION_API}/history/${data.interactionId}`)
            .then((response) => {
                setWorkflowHistory(response.data)
            }).catch(error => console.log(error))
        if ((data.type === 'complaint' && data.woType === 'FAULT') || data.type === 'service request') {
            getTaskHistory();
        }
        get(`${properties.CUSTOMER_DETAILS}/${data.customerId}?serviceId=${data.serviceId}`)
            .then((customerResp) => {
                if (!data.accountId) {
                    setShowInquiryCustomer(true)
                    setCustomerData(customerResp.data)
                }
                else {
                    setShowInquiryCustomer(false)
                }
                if (data.accountId) {
                    setShowInquiryCustomer(false)
                    get(`${properties.ACCOUNT_DETAILS_API}/${data.customerId}?account-id=${data.accountId}`)
                        .then((accountResp) => {
                            get(`${properties.SERVICES_LIST_API}/${data.customerId}?account-id=${data.accountId}&service-id=${data.serviceId}&realtime=false`)
                                .then((serviceResp) => {
                                    customerResp.data.accountNumber = accountResp?.data?.accountNo;
                                    customerResp.data.accountEmail = accountResp?.data?.email;
                                    customerResp.data.accountContactNbr = accountResp?.data?.contactNbr;
                                    customerResp.data.accountName = `${accountResp?.data?.foreName} ${accountResp?.data?.surName}`;
                                    customerResp.data.serviceNumber = serviceResp.data[0]?.accessNbr;
                                    customerResp.data.serviceType = serviceResp.data[0]?.prodType;
                                    customerResp.data.serviceStatus = serviceResp.data[0]?.statusDesc;
                                    customerResp.data.planName = serviceResp.data[0]?.planName;
                                    customerResp.data.serviceTypeDesc = serviceResp.data[0]?.serviceTypeDesc;
                                    customerResp.data.customerName = customerResp?.data?.firstName + " " + customerResp?.data?.lastName
                                    customerResp.data.address.flatHouseUnitNo = customerResp?.data?.address?.hno
                                    customerResp.data.address.building = customerResp?.data?.address?.buildingName
                                    //customerResp.data.address.street = customerResp?.data?.address?.street
                                    customerResp.data.address.cityTown = customerResp?.data?.address?.city
                                    //customerResp.data.address.district = customerResp?.data?.address?.district
                                    //customerResp.data.address.state = customerResp?.data?.address?.state
                                    //customerResp.data.address.postCode = customerResp?.data?.address?.postCode
                                    //customerResp.data.address.country = customerResp?.data?.address?.country
                                    setCustomerData(customerResp.data)
                                }).catch(error => console.log(error))
                                .finally(() => {
                                    
                                })
                        })
                        .catch((error) => {
                            
                        })
                }
                else {
                    
                }
            }).catch(error => console.log(error))
    }, [])

    useEffect(() => {
        if (noInteraction === undefined) {
            initialize();
        }
    }, [props.location.state, initialize])

    const getTaskHistory = () => {
        const { interactionId } = props.location.state.data;
        
        get(`${properties.CUSTOMER_API}/interaction/${interactionId}`)
            .then((response) => {
                if (response.data.length > 0) {
                    setTaskHistory(response.data)
                    setTaskHistoryMsg(false)
                }
                else {
                    setTaskHistoryMsg(true)
                }
            }).catch(error => console.log(error))
            .finally()
    }

    useEffect(() => {
        if (['Search', 'Incident', 'Customer360'].includes(helpDeskView)) {
            setOnTabChange('More Details')
        }
        else {
            setOnTabChange('Interaction')
        }
    }, [helpDeskView])

    const grantPermissions = (assignedRole, assignedUserId, status, assignedDept) => {
        if (fromHelpDesk && helpDeskView === 'QUEUE') {
            setPermissions({
                assignToSlef: false,
                followup: false,
                readOnly: true,
                reAssign: false
            })
        }
        else {
            const { user, currRoleId, currDeptId } = auth;
            if (Number(assignedRole) === Number(currRoleId) && assignedDept === currDeptId) {
                if (assignedUserId !== "") {
                    if (Number(assignedUserId) === Number(user.userId)) {
                        setPermissions({
                            assignToSlef: false,
                            followup: false,
                            readOnly: false,
                            reAssign: true
                        })
                    }
                    else {
                        setPermissions({
                            assignToSlef: false,
                            followup: true,
                            readOnly: true,
                            reAssign: false
                        })
                    }
                }
                else {
                    setPermissions({
                        assignToSlef: true,
                        followup: true,
                        readOnly: true,
                        reAssign: false
                    })
                }
            }
            else {
                if (assignedUserId !== "") {
                    setPermissions({
                        assignToSlef: false,
                        followup: true,
                        readOnly: true,
                        reAssign: false
                    })
                }
                else {
                    setPermissions({
                        assignToSlef: false,
                        followup: true,
                        readOnly: true,
                        reAssign: false
                    })
                }
            }
            if (complaintData.currStatus === "CLOSED") {
                setPermissions({
                    assignToSlef: false,
                    followup: false,
                    readOnly: true,
                    reAssign: false
                })
            }
        }
    }

    const handleOnTicketDetailsInputsChange = (e) => {
        const { target } = e;
        if (target.id === 'assignRole') {
            const { unitName = "", unitId = "" } = target.value !== "" && JSON.parse(target.options[target.selectedIndex].dataset.entity)

            entityRef.current = { unitId, unitName }
            unstable_batchedUpdates(() => {
                setTicketDetailsInputs({
                    ...ticketDetailsInputs,
                    [target.id]: target.value,
                    user: "",
                    entity: entityRef.current,
                })
            })
            isRoleChangedByUserRef.current = true;
        }
        if (target.id === 'user') {
            setTicketDetailsInputs({
                ...ticketDetailsInputs,
                [target.id]: target.value,
                //currStatus: target.value === "" ? 'NEW' : 'ASSIGNED'
            })
        }
        else if (target.id === 'currStatus') {
            const { realTimeDetails } = complaintData;
            let restrictStatus = false;
            if (realTimeDetails && realTimeDetails.hasOwnProperty('status')) {
                if (target.value === 'CLOSED') {
                    if (realTimeDetails.status === 'CLOSED') {
                        restrictStatus = false;
                    }
                    else {
                        restrictStatus = true;
                        toast.info('Cannot close this ticket until UNN status is also closed.');
                    }
                }
            }
            setTicketDetailsInputs({
                ...ticketDetailsInputs,
                [target.id]: restrictStatus ? "" : target.value,
            })
        }
        else {
            setTicketDetailsInputs({
                ...ticketDetailsInputs,
                [target.id]: target.id === 'contactNumber' ? Number(target.value) ? target.value : "" : target.value
            })
        }
    }

    const validate = (section, schema, data) => {
        try {
            if (section === 'DETAILS') {
                setTicketDetailsError({})
            }
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                if (section === 'DETAILS') {
                    setTicketDetailsError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
            });
            return e;
        }
    };

    const checkTicketDetails = useCallback(() => {
        let error = validate('DETAILS', ticketDetailsValidationSchema, ticketDetailsInputs);
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        return true;
    }, [ticketDetailsInputs])

    const handleTicketDetailsSubmit = (e, isAppointmentEdit) => {
        e.preventDefault();
        const { data } = props.location.state;
        const { accountId, causeCode, chnlCode, clearCode, natureCode, priorityCode, problemCode, problemTypeDescription, sourceCode, description, customerId, connectionId, cntPrefer, serviceOrProduct, inquiryAbout } = complaintData;
        const { assignRole, user, currStatus, additionalRemarks, fromDate, fromTime, toDate, toTime, contactPerson, contactNumber, appointmentRemarks, entity, surveyReq, commentCause, commentType } = ticketDetailsInputs;

        if (checkTicketDetails()) {
            let reqBody = data.type === 'complaint' ? {
                accountId: accountId,
                causeCode: causeCode,
                chnlCode: chnlCode,
                clearCode: clearCode,
                natureCode: natureCode,
                priorityCode: priorityCode,
                problemCause: commentCause || complaintData.commentCause,
                problemType: commentType || complaintData.commentType,
                commentCause: commentCause || complaintData.commentCause,
                commentType: commentType || complaintData.commentType,
                remarks: description,
                sourceCode: sourceCode,
                customerId: customerId,
                serviceId: connectionId,
                cntPrefer: cntPrefer,
                toRole: assignRole,
                toUser: user ? user : null,
                currStatus,
                productOrServices: serviceOrProduct,
                additionalRemarks: additionalRemarks,
                ticketType: complaintData.intxnCatType && complaintData.intxnCatType,
                flow: flowValue,
                attachments: [...existingFiles.map((current) => current.entityId), ...currentFiles.map((current) => current.entityId)],
                appointment: {
                    appointmentId: isAppointmentEdit ? complaintData.latestAppointment.appointmentId : "",
                    fromDate: fromDate,
                    fromTime: fromTime,
                    toDate: toDate,
                    toTime: toTime,
                    contactPerson,
                    contactNumber,
                    remarks: appointmentRemarks
                },
                ...currentWorkflowRef.current,
                unitName: entityRef?.current?.unitName,
                toEntity: entityRef?.current?.unitId,
                surveyReq,
                intxnType: complaintData.intxnType && complaintData.intxnType
            } :
                data.type === 'service request' ? {
                    toRole: assignRole,
                    toUser: user ? user : null,
                    currStatus,
                    flow: flowValue,
                    ...currentWorkflowRef.current,
                    unitName: entityRef?.current?.unitName,
                    toEntity: entityRef?.current?.unitId,
                }
                    :
                    {
                        //service: serviceOrProduct,
                        inquiryAbout: complaintData.commentType,
                        inquiryCategory: serviceOrProduct,
                        ticketPriority: priorityCode,
                        ticketChannel: chnlCode,
                        ticketSource: sourceCode,
                        problemCause: problemCode,
                        commentCause: commentCause,
                        commentType: commentType,
                        currStatus,
                        additionalRemarks: additionalRemarks,
                        customerId: customerId,
                        accountId: accountId,
                        toRole: assignRole,
                        toUser: user ? user : null,
                        connectionId: connectionId,
                        ticketType: complaintData.intxnCatType && complaintData.intxnCatType,
                        flow: flowValue,
                        attachments: [...existingFiles.map((current) => current.entityId), ...currentFiles.map((current) => current.entityId)],
                        ...currentWorkflowRef.current,
                        unitName: entityRef?.current?.unitName,
                        toEntity: entityRef?.current?.unitId,
                        surveyReq
                    }
            
            put(`${data.type === 'complaint' ? properties.COMPLAINT_API : data.type === 'service request' ? properties.SERVICE_REQUEST_DETAILS : properties.CUSTOMER_INQUIRY_API_2}/${data.interactionId}`, { ...reqBody })
                .then((response) => {
                    toast.success(`${isAdjustmentOrRefund ? 'Order' : type === 'complaint' ? 'Incident' : type === 'service request' ? 'Interaction' : type === 'inquiry' ? 'Lead' : 'Order'} Updated Successfully`);
                    // setTicketDetailsInputs({
                    //     ...ticketDetailsInputs,
                    //     fromDate: "",
                    //     fromTime: "",
                    //     toDate: "",
                    //     toTime: "",
                    //     contactPerson: "",
                    //     contactNumber: "",
                    //     appointmentRemarks: ""
                    // });
                    //initialize();
                    props.history.push(`${process.env.REACT_APP_BASE}/`);
                })
                .catch((error) => {
                    console.error(error);
                    toast.error(error);
                })
                .finally(() => {
                    
                })
        }
    }

    useEffect(() => {
        const requestBody = {
            screenName: "Search Tickets",
            moduleName: "Helpdesk 360"
        }
        
        post(properties.MAINMENU_API + '/getQuickLinks', requestBody)
            .then((response) => {
                setQuickLinks(response.data[0].links.editTicketLandingPage)
            })
            .catch((error) => {
                console.log("error", error)
            })
            .finally()
    }, [])

    const handleQuickLinks = (e) => {
        if (onTabChange === "Interaction") {
            if (e.name === "Details") {
                return (<li key={e.id}>
                    <Link activeclassName="active" to={e.to} spy={true} offset={-250} smooth={true} duration={100}>
                        {fromHelpDesk ? 'Interaction' : (type === 'complaint' && isAdjustmentOrRefund === false) ? 'Incident Details' : type === 'inquiry' ? 'Lead Details' : 'Order Details'}
                    </Link>
                </li>)
            }
            else if (e.name === "Customer") {
                return (<li key={e.id}><Link activeclassName="active" to={e.to} spy={true} offset={-230} smooth={true} duration={100}>{e.name}</Link></li>)

            }
            else if (e.name === "Attachments") {

                return (type !== 'service request' && (
                    <li key={e.id}><Link activeclassName="active" to={e.to} spy={true} offset={-220} smooth={true} duration={100}>{e.name}</Link></li>
                ))

            }
            else if (e.name === "Appointment") {
                return (type === 'complaint' && (
                    <>
                        <li key={e.id}><Link activeclassName="active" to={e.to} spy={true} offset={-220} smooth={true} duration={100}>{e.name}</Link></li>
                    </>
                ))
            }
        }
        else if (onTabChange === "More Details") {
            if (['Interaction Details', 'Interaction History'].includes(e.name)) {
                return (
                    <li key={e.id}><Link activeclassName="active" to={e.to} spy={true} offset={-220} smooth={true} duration={100}>{e.name}</Link></li>
                )
            }
        }
        else if (onTabChange === "Workflow History") {
            if (['Workflow History'].includes(e.name)) {
                return (
                    <li key={e.id}><Link activeclassName="active" to={e.to} spy={true} offset={-220} smooth={true} duration={100}>{e.name}</Link></li>
                )
            }
        }
        else if (onTabChange === "HelpdeskInfo") {
            if (['Helpdesk Info'].includes(e.name)) {
                return (
                    <li key={e.id}><Link activeclassName="active" to={e.to} spy={true} offset={-220} smooth={true} duration={100}>{e.name}</Link></li>
                )
            }
        }
    }

    return (
        <div className="container-fluid edit-complaint">
            <div className={`row align-items-center ${fromHelpDesk && helpDeskView === 'QUEUE' ? 'd-none' : ''}`}>
                <div className="col">
                    <h1 className="title bold">{['QUEUE', 'ASSIGNED', 'Incident'].includes(helpDeskView) ? 'Interaction' : ['Search', 'Customer360'].includes(helpDeskView) ? 'Helpdesk' : isAdjustmentOrRefund ? 'Order Number' : type === 'complaint' ? 'Incident Number' : type === 'inquiry' ? 'Lead Number' : 'Order Number'} - {['QUEUE', 'ASSIGNED', 'Incident'].includes(helpDeskView) ? props.location.state.data.interactionId : ['Search', 'Customer360'].includes(helpDeskView) ? detailedViewItem?.helpdeskId : props.location.state.data.interactionId}</h1>
                </div>
                <div className="form-inline">
                    <span className="ml-1" >Quick Link</span>
                    <div className="switchToggle ml-1">
                        <input type="checkbox" id="quickLink" checked={isQuickLinkEnabled} onChange={() => {
                            setIsQuickLinkEnabled(!isQuickLinkEnabled)
                        }} />
                        <label htmlFor="quickLink">Toggle</label>
                    </div>
                </div>
                <div className="col-auto">
                    <button type="button" onClick={() => props.history.goBack()} className="btn btn-labeled btn-primary btn-sm">Back</button>
                </div>
            </div>
            <div className="row mt-1">
                <div className="col-lg-12">
                    <div className="card-box">

                        <div className="testFlex">
                            <div className={` new-customer ${isQuickLinkEnabled ? fromHelpDesk && helpDeskView === 'QUEUE' ? 'col-12' : 'col-md-10' : fromHelpDesk && helpDeskView === 'QUEUE' ? 'col-12' : 'col-md-12'}`}>
                                <div data-spy="scroll" data-target="#scroll-list" data-offset="0" className="scrollspy-div new-customer">
                                    <div className="col-12">
                                        <ul key="ecul2" className="nav nav-tabs" role="tablist">
                                            {
                                                fromHelpDesk && ['Search', 'Incident', 'Customer360'].includes(helpDeskView) &&
                                                <li key="ecli23" className="nav-item">
                                                    <button data-target="#ticketHelpDeskMoreDetails" role="tab" data-toggle="tab" aria-expanded="false" className="nav-link font-17 bolder active" onClick={() => { setOnTabChange('More Details') }}>
                                                        More Details
                                                    </button>
                                                </li>
                                            }
                                            <li key="ecli21" className={`nav-item pl-0`}>
                                                <button data-target="#ticketDetails" role="tab" data-toggle="tab" aria-expanded="false" className={`nav-link font-17 bolder ${!['Search', 'Incident', 'Customer360'].includes(helpDeskView) ? 'active' : ''}`} onClick={() => { setOnTabChange('Interaction') }}>
                                                    {
                                                        fromHelpDesk ? 'Interaction Details' :
                                                            (type === 'complaint' && isAdjustmentOrRefund === false) ? 'Incident Details' : type === 'inquiry' ? 'Lead Details' : 'Order Details'
                                                    }
                                                </button>
                                            </li>
                                            <li key="ecli22" className={`nav-item `}>
                                                <button data-target="#ticketHistory" role="tab" data-toggle="tab" aria-expanded="false" className="nav-link font-17 bolder" onClick={() => { setOnTabChange('Workflow History') }}>
                                                    Workflow History
                                                </button>
                                            </li>
                                            {
                                                fromHelpDesk &&
                                                <li key="ecli24" className="nav-item">
                                                    <button data-target="#ticketHelpDeskHistory" role="tab" data-toggle="tab" aria-expanded="false" className="nav-link font-17 bolder" onClick={() => { setOnTabChange('HelpdeskInfo') }}>
                                                        {
                                                            ['Search', 'Incident'].includes(helpDeskView) ? 'HelpDesk Info' : 'HelpDesk History'
                                                        }
                                                    </button>
                                                </li>
                                            }
                                        </ul>

                                    </div>
                                    <div className="tab-content py-0 pl-3">
                                        <div className={`tab-pane show ${!['Search', 'Incident', 'Customer360'].includes(helpDeskView) ? 'active' : ''}`} id="ticketDetails">
                                            {
                                                noInteraction ? (
                                                    <h5 className="text-center p-3">No Interaction Found yet.</h5>
                                                ) : (
                                                    <TicketDetails
                                                        data={{
                                                            customerData,
                                                            showInquiryCustomer,
                                                            complaintData,
                                                            ticketDetailsInputs,
                                                            permissions,
                                                            interactionData: props.location.state.data,
                                                            isRoleChangedByUserRef,
                                                            currentFiles,
                                                            existingFiles,
                                                            currentWorkflowRef,
                                                            currentTicketUserRef,
                                                            entityRef: entityRef.current,
                                                            detailedViewItem,
                                                            fromHelpDesk,
                                                            helpDeskView
                                                        }}
                                                        handlers={{
                                                            handleOnTicketDetailsInputsChange: handleOnTicketDetailsInputsChange,
                                                            handleTicketDetailsSubmit: handleTicketDetailsSubmit,
                                                            setTicketDetailsInputs,
                                                            setCurrentFiles,
                                                            setExistingFiles,
                                                            initialize,
                                                            setTicketDetailsError,
                                                            setFlowValue,
                                                            setPermissions,
                                                            detailedViewItem,
                                                            fromHelpDesk,
                                                            helpDeskView
                                                        }}
                                                        error={ticketDetailsError}
                                                    />
                                                )
                                            }
                                        </div>
                                        <div className="tab-pane" id="ticketHistory">
                                            {
                                                noInteraction ? (
                                                    <h5 className="text-center p-3">No Workflow History Found yet.</h5>
                                                ) : (
                                                    <TicketHistory
                                                        data={{
                                                            realTimeDetails: complaintData.realTimeDetails,
                                                            followUpHistory,
                                                            appointmentHistory,
                                                            workflowHistory,
                                                            taskHistory,
                                                            interactionData: props.location.state.data,
                                                            taskHistoryMsg
                                                        }}
                                                        handlers={{
                                                            initialize
                                                        }}
                                                    />
                                                )
                                            }
                                        </div>
                                        {
                                            fromHelpDesk && ['Search', 'Incident', 'Customer360'].includes(helpDeskView) &&
                                            <div className={`tab-pane ${['Search', 'Incident', 'Customer360'].includes(helpDeskView) ? 'active' : ''}`} id="ticketHelpDeskMoreDetails">
                                                <MoreDetailsTab
                                                    data={{
                                                        detailedViewItem,
                                                    }}
                                                />
                                            </div>
                                        }
                                        {
                                            fromHelpDesk &&
                                            <div className="tab-pane" id="ticketHelpDeskHistory">
                                                {
                                                    <HelpDeskHistory
                                                        data={{
                                                            detailedViewItem,
                                                            helpDeskView
                                                        }}
                                                    />
                                                }
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                            {isQuickLinkEnabled && <div className={`col sticky ${fromHelpDesk && helpDeskView === 'QUEUE' ? 'd-none' : ''}`}>
                                <nav className="navbar navbar-default navbar-fixed-top">
                                    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                                        <ul key="ecul1" className="nav navbar-nav">
                                            <ul className="nav navbar-nav">
                                                {quickLinks && quickLinks.map((e) => (
                                                    handleQuickLinks(e)
                                                ))}
                                            </ul>
                                            {/* {onTabChange === "Interaction" && <>
                                                <li key="ecli11">
                                                    <Link activeclassName="active" to="ticketDetailsSection" spy={true} offset={-250} smooth={true} duration={100}>
                                                        {fromHelpDesk ? 'Interaction' : (type === 'complaint' && isAdjustmentOrRefund === false) ? 'Incident Details' : type === 'inquiry' ? 'Lead Details' : 'Order Details'}
                                                    </Link>
                                                </li>
                                                <li key="ecli12"><Link activeclassName="active" to="customerSection" spy={true} offset={-230} smooth={true} duration={100}>Customer</Link></li>
                                                {
                                                    type !== 'service request' && (
                                                        <li key="ecli13"><Link activeclassName="active" to="attachmentsSection" spy={true} offset={-220} smooth={true} duration={100}>Attachments</Link></li>
                                                    )
                                                }
                                                {
                                                    type === 'complaint' && (
                                                        <>
                                                            <li key="ecli14"><Link activeclassName="active" to="AppointmentSection" spy={true} offset={-220} smooth={true} duration={100}>Appointment</Link></li>
                                                        </>
                                                    )
                                                }
                                            </>}
                                            {onTabChange === "More Details" && <>
                                                <li key="ecli15"><Link activeclassName="active" to="InteractionDetailsSection" spy={true} offset={-220} smooth={true} duration={100}>Interaction Details</Link></li>

                                                <li key="ecli16"><Link activeclassName="active" to="InteractionHistorySection" spy={true} offset={-220} smooth={true} duration={100}>Interaction HIstory</Link></li>
                                            </>
                                            }
                                            {onTabChange === "Workflow History" && <>
                                                <li key="ecli15"><Link activeclassName="active" to="WorkflowHistorySection" spy={true} offset={-220} smooth={true} duration={100}>Workflow History</Link></li>

                                            </>}
                                            {onTabChange === "HelpdeskInfo" && <>
                                                <li key="ecli15"><Link activeclassName="active" to="HelpdeskInfoSection" spy={true} offset={-220} smooth={true} duration={100}>Helpdesk Info</Link></li>

                                            </>} */}
                                        </ul>
                                    </div>
                                </nav>
                            </div>}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditTicketsLandingPage;