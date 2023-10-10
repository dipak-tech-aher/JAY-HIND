import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Link } from "react-scroll";
import { get, post, put } from "../../../../common/util/restUtil";
import { properties } from "../../../../properties";
import { toast } from 'react-toastify';
import OrderDetails from './../EditOrder/OrderDetails';
import { string, object } from "yup";
import { AppContext } from "../../../../AppContext";
import { formatISODateTime } from '../../../../common/util/dateUtil';
import { unstable_batchedUpdates } from 'react-dom';
import OrderWorkflowHistory from './OrderWorkflowHistory';

import moment from 'moment';

const EditOrderLandingPage = (props) => {

    const { auth } = useContext(AppContext);
    const [permissions, setPermissions] = useState({
        ciDetails: false,
        taskDetails: false,
        assignToSlef: false,
        followup: false,
        readOnly: false,
        reAssign: false
    });
    const [flowValue, setFlowValue] = useState()
    const [customerData, setCustomerData] = useState(null);
    const [complaintData, setComplaintData] = useState({
        soNumber: "",
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
        startDate: "",
        endDate: ""
    })
    const [workflowHistory, setWorkflowHistory] = useState([]);
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
    const [billingContractDetails, setBillingContractDetails] = useState([])
    const [orderTaskDetailsList, setOrderTaskDetailsList] = useState([])
    const [serverApplianceDetailsList, setServerApplianceDetailsList] = useState([])
    const [networkDetailsList, setNetworkDetailsList] = useState([])
    const [networkList, setNetworkList] = useState([])
    const [applicationList, setApplicationList] = useState([])
    const [saasList, setSaasList] = useState([])
    const [otherServicesList, setOtherServicesList] = useState([])
    const [activeTab, setActiveTab] = useState(0)
    const [editedTaskIdList, setEditedTaskIdList] = useState([])
    const [editedNetworkIdList, setEditedNetworkIdList] = useState([])
    const [editedServerApplianceIdList, setEditedServerApplianceIdList] = useState([])
    const [customerContract, setCustomerContract] = useState({})
    const { isAdjustmentOrRefund, type } = props.location.state.data;
    const [quickLinks, setQuickLinks] = useState([{}])
    const [isQuickLinkEnabled, setIsQuickLinkEnabled] = useState(false)


    const ticketDetailsValidationSchema = object().shape({
        // assignRole: string().required("Assign Role is required"),
        currStatus: string().required("Current Status is required"),
        startDate: string().required("Start Date is required"),
        endDate: string().test(
            "Date",
            "End date is required",
            (endDate) => (endDate !== "")
        ).test(
            "Date",
            "End date should not be less than start date",
            (endDate) => validateToDate(endDate)
        )
    });

    const validateToDate = (value) => {
        try {
            if (Date.parse(value) < Date.parse(ticketDetailsInputs?.startDate))
                return false;
            return true
        } catch (e) {
            return false
        }
    }

    const handleCIDetailsIntialize = (list, ciMain) => {
        let ciDetails = list
        !!ciDetails && !!ciDetails.length && ciDetails.map((app) => {
            !!ciMain.length && ciMain.map((node) => {
                if (app.id === node.id) {
                    app.selected = 'Y'
                    !!app?.children.length && app?.children.map((mgApp) => {
                        !!node?.children.length && node?.children.map((mgNode) => {
                            if (mgApp.id === mgNode.id && mgApp.selected) {
                                if (mgApp.selected !== 'LABEL') {
                                    mgApp.selected = 'Y'
                                }
                                !!mgApp?.children.length && mgApp?.children.map((netApp) => {
                                    !!mgNode?.children.length && mgNode?.children.map((netNode) => {
                                        if (netApp.id === netNode.id) {
                                            netApp.selected = 'Y'
                                        }
                                    })
                                    return netApp
                                })
                            }
                        })
                        return mgApp
                    })
                }
            })
            return app
        })
        return ciDetails
    }

    const handleRefreshValues = (list) => {
        let ciList = list
        !!ciList && !!ciList.length && ciList.map((app) => {
            app.selected = 'N'
            !!app?.children.length && app?.children.map((mgApp) => {
                if (mgApp.selected !== 'LABEL') {
                    mgApp.selected = 'N'
                }
                !!mgApp?.children.length && mgApp?.children.map((netApp) => {
                    netApp.selected = 'N'
                    return netApp
                })
                return mgApp
            })
            return app
        })
        return ciList
    }

    const initialize = useCallback(() => {
        const { data } = props.location.state;
        
        isRoleChangedByUserRef.current = false;
        get(`${properties.ORDERS_API}/${data.interactionId}?type=REQWO&soId=${props.location.state.data.row.soId}`)
            .then((response) => {
                setComplaintData({
                    ...response.data,
                    soNumber: response?.data?.soDet?.soNumber,
                    problemType: response?.data?.problemTypeDescription,
                    problemCause: response?.data?.problemCause,
                    ticketChannel: response?.data?.chnlDescription,
                    ticketSource: response?.data?.sourceDescription,
                    ticketPriority: response?.data?.priorityDescription,
                    contactPreference: response?.data?.cntPrefer,
                    ticketCreatedBy: response?.data?.createdBy,
                    ticketCreatedOn: formatISODateTime(response?.data?.createdAt),
                    currentStatus: response?.data?.currStatus,
                    currentStatusDesc: response?.data?.currStatusDescription,
                    currentDeptRole: `${response?.data?.currEntity} - ${response?.data?.currRoleName}`,
                    currentDeptRoleDesc: `${response?.data?.currEntityDesc} - ${response?.data?.roleDesc}`,
                    currentUser: response?.data?.userName,
                    ticketDescription: response?.data?.description,
                    latestAppointment: response?.data?.latestAppointment,
                    serviceOrProduct: response?.data?.services,
                    inquiryAbout: response?.data?.causeCode,
                    serviceTypeDesc: response?.data?.typeDescription,
                    ticketUserLocation: response?.data?.location,
                    currUserName: (response?.data?.currUserDetails?.firstName || '') + " " + (response?.data?.currUserDetails?.lastName || '')
                })
                setBillingContractDetails(response?.data?.contractDetails || [])
                let requestBody = {
                    customerId: response?.data?.customerId, //30003067,//
                    soId: response?.data?.soId, //20,//,
                    billRefNo: response?.data?.billRefNo || "",
                }

                if (['order'].includes(data?.type)) {
                    let roleName = response?.data?.currRoleDesc?.role_name.toLowerCase()
                    let assignRole = !!response?.data?.currRole ? parseInt(response?.data?.currRole) : "";
                    let assignDept = !!response?.data?.currEntity ? response?.data?.currEntity : "";
                    let assignRoleName = !!response?.data?.currRoleName ? response?.data?.currRoleName : "";
                    let user = !!response?.data?.currUser ? parseInt(response?.data?.currUser) : "";
                    let currStatus = response?.data?.currStatus;
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
                    grantPermissions(assignRole, user, response?.data?.currStatus, assignDept, roleName);
                }
            }).catch(error => console.log(error))
            .finally(() => {
                
            })

        
        get(`${properties.INTERACTION_API}/history/${data?.interactionId}`)
            .then((response) => {
                setWorkflowHistory(response.data)
            }).catch(error => console.log(error))
            .finally(() => {
                
            })

        
        get(`${properties.CUSTOMER_DETAILS}/${data?.customerId}?serviceId=${data?.serviceId}`)
            .then((customerResp) => {
                if (data.accountId) {
                    
                    get(`${properties.ACCOUNT_DETAILS_API}/${data?.customerId}?account-id=${data?.accountId}`)
                        .then((accountResp) => {
                            //get(`${properties.SERVICES_LIST_API}/${data?.customerId}?account-id=${data?.accountId}&service-id=${data?.serviceId}&realtime=false`)
                            //.then((serviceResp) => {
                            customerResp.data.accountNumber = accountResp?.data?.accountNo;
                            customerResp.data.accountEmail = accountResp?.data?.email;
                            customerResp.data.accountContactNbr = accountResp?.data?.contactNbr;
                            customerResp.data.accountName = `${accountResp?.data?.foreName || ""} ${accountResp?.data?.surName || ""}`;
                            //customerResp.data.serviceNumber = serviceResp.data[0]?.accessNbr;
                            //customerResp.data.serviceType = serviceResp.data[0]?.prodType;
                            //customerResp.data.serviceStatus = serviceResp.data[0]?.statusDesc;
                            //customerResp.data.planName = serviceResp.data[0]?.planName;
                            //customerResp.data.serviceTypeDesc = serviceResp.data[0]?.serviceTypeDesc;
                            customerResp.data.customerName = (customerResp?.data?.firstName || "") + " " + (customerResp?.data?.lastName || "")
                            customerResp.data.address.flatHouseUnitNo = customerResp?.data?.address?.hno
                            customerResp.data.address.building = customerResp?.data?.address?.buildingName
                            //customerResp.data.address.street = customerResp?.data?.address?.street
                            customerResp.data.address.cityTown = customerResp?.data?.address?.city
                            //customerResp.data.address.district = customerResp?.data?.address?.district
                            //customerResp.data.address.state = customerResp?.data?.address?.state
                            //customerResp.data.address.postCode = customerResp?.data?.address?.postCode
                            //customerResp.data.address.country = customerResp?.data?.address?.country

							/***Srini added for blank page in work order start***/
                            let custData

                            custData.customerTypeDesc.description = customerResp?.data?.customerTypeDesc.description
							/***Srini added for blank page in work order end***/
                            setCustomerData({
                                ...customerResp?.data,
                                billingAddress: accountResp?.data?.billingAddress[0]
                            })
                            //})
                        })
                        .catch((error) => {
                            
                        })
                        .finally(() => {
                            
                        })
                }
                else {
                    
                }
            }).catch(error => console.log(error))
            .finally(() => {
                
            })
        //.finally()
    }, [])

    useEffect(() => {
        initialize();
    }, [props.location.state, initialize])


    const grantPermissions = (assignedRole, assignedUserId, status, assignedDept, roleName) => {
        const { user, currRoleId, currDeptId } = auth;
        if (status === "CLOSED") {
            setPermissions({
                taskDetails: true,
                ciDetails: true,
                assignToSlef: false,
                followup: false,
                readOnly: true,
                reAssign: false
            })
        } else {
            if (Number(assignedRole) === Number(currRoleId) && assignedDept === currDeptId) {
                if (assignedUserId !== "") {
                    if (Number(assignedUserId) === Number(user.userId)) {
                        setPermissions({
                            taskDetails: roleName === 'pmo' ? false : true,
                            ciDetails: roleName === 'pmo' ? true : false,
                            assignToSlef: false,
                            followup: false,
                            readOnly: false,
                            reAssign: true
                        })
                    }
                    else {
                        setPermissions({
                            taskDetails: roleName === 'pmo' ? false : true,
                            ciDetails: roleName === 'pmo' ? true : false,
                            assignToSlef: false,
                            followup: true,
                            readOnly: true,
                            reAssign: false
                        })
                    }
                }
                else {
                    setPermissions({
                        taskDetails: true,
                        ciDetails: false,
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
                        taskDetails: roleName === 'pmo' ? false : true,
                        ciDetails: roleName === 'pmo' ? true : false,
                        assignToSlef: false,
                        followup: true,
                        readOnly: true,
                        reAssign: false
                    })
                }
                else {
                    setPermissions({
                        taskDetails: roleName === 'pmo' ? false : true,
                        ciDetails: roleName === 'pmo' ? true : false,
                        assignToSlef: false,
                        followup: true,
                        readOnly: true,
                        reAssign: false
                    })
                }
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
            // const { realTimeDetails } = complaintData;
            // let restrictStatus = false;
            // if (realTimeDetails && realTimeDetails.hasOwnProperty('status')) {
            //     if (target.value === 'CLOSED') {
            //         if (realTimeDetails.status === 'CLOSED') {
            //             restrictStatus = false;
            //         }
            //         else {
            //             restrictStatus = true;
            //             toast.info('Cannot close this ticket until UNN status is also closed.');
            //         }
            //     }
            // }
            // setTicketDetailsInputs({
            //     ...ticketDetailsInputs,
            //     [target.id]: restrictStatus ? "" : target.value,
            // })
            setTicketDetailsInputs({
                ...ticketDetailsInputs,
                [target.id]: target.value,
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

    const handleCIDetailsObject = (list) => {
        let networkArray = []
        !!list.length && list.map((network) => {
            if (network.selected === "Y") {
                let childArray = []
                !!network.children.length && network.children.map((networkChild) => {
                    if (networkChild.selected === "Y") {
                        let grandChildArray = []
                        !!networkChild.children.length && networkChild.children.map((networkGrandChild) => {
                            if (networkGrandChild.selected === "Y") {
                                grandChildArray.push({ id: networkGrandChild.id, children: [] })
                            }
                        })
                        childArray.push({ id: networkChild.id, children: grandChildArray })
                    }
                    else if (networkChild.selected === "LABEL") {
                        let grandChildArray = []
                        !!networkChild.children.length && networkChild.children.map((networkGrandChild) => {
                            if (networkGrandChild.selected === "Y") {
                                grandChildArray.push({ id: networkGrandChild.id, children: [] })
                            }
                        })
                        if (!!grandChildArray.length) {
                            childArray.push({ id: networkChild.id, children: grandChildArray })
                        }
                    }
                })
                networkArray.push({ id: network.id, children: childArray })
            }
        })
        return networkArray
    }

    function getMonthDifference(startDate, endDate) {
        return (
            endDate.getMonth() -
            startDate.getMonth() +
            12 * (endDate.getFullYear() - startDate.getFullYear())
        )
    }

    const handleTicketDetailsSubmit = (e) => {
        e.preventDefault();

        const { data } = props.location.state;
        const { accountId, causeCode, chnlCode, clearCode, natureCode, priorityCode, problemCode, problemTypeDescription, sourceCode, description, customerId, connectionId, cntPrefer, serviceOrProduct, inquiryAbout, billRefNo, contractId, soNumber } = complaintData;
        const { assignRole, user, currStatus, additionalRemarks, fromDate, fromTime, toDate, toTime, contactPerson, contactNumber, appointmentRemarks, entity, surveyReq } = ticketDetailsInputs;

        if (checkTicketDetails()) {

            // const statusArray = billingContractDetails.filter((cont) => ['PENDING','CREATED'].includes(cont.status))
            // if(statusArray.length > 0) {
            //     toast.error('Billing Contract Activation Pending')
            //     return
            // }
            //return

            // put(`${properties.ORDERS_API}/update/${data.interactionId}`, { ...reqBody })
            //     .then((response) => {
            //         toast.success(`Work Order Updated Successfully`);
            //         props.history.push(`${process.env.REACT_APP_BASE}/`);
            //     })
            //     .catch((error) => {
            //         console.error(error);
            //         toast.error(error);
            //     })
            //     .finally(() => {
            //         
            //     })
            if (moment(ticketDetailsInputs?.startDate).isBefore(moment(new Date()).format('YYYY-MM-DD'))) {
                toast.error('Start Date Cannot be past date')
                return
            }
            const noOfMonths = getMonthDifference(new Date(ticketDetailsInputs?.startDate), new Date(ticketDetailsInputs?.endDate))
            const frequencies = []
            for (const contract of billingContractDetails) {
                frequencies.push(contract?.frequency)
            }
            let found = false
            if (frequencies.includes('FREQ_YEAR')) {
                if (noOfMonths < 12) {
                    toast.error('Please provide dates for alteast one year frequency')
                    found = true
                }
            }
            if (found === false && frequencies.includes('FREQ_MONTH')) {
                if (noOfMonths < 1) {
                    toast.error('Please provide date for alteast one month frequency')
                    found = true
                }
            }
            if (found === false && frequencies.includes('FREQ_QUARTER')) {
                if (noOfMonths < 3) {
                    toast.error('Please provide date for alteast one quarter frequency')
                    found = true
                }
            }
            if (found === false && frequencies.includes('FREQ_HALF_YEAR')) {
                if (noOfMonths < 6) {
                    toast.error('Please provide date for alteast half year frequency')
                    found = true
                }
            }
            if (found === false && frequencies.includes('FREQ_WEEK')) {
                if (noOfMonths < 1) {
                    toast.error('Please provide date for alteast one week frequency')
                    found = true
                }
            }
            if (found === false && frequencies.includes('FREQ_DAILY')) {
                if (noOfMonths < 1) {
                    toast.error('Please provide date for alteast one day frequency')
                    found = true
                }
            }
            if (found === true) {
                return
            }
            
            let obj = {
                soNo: soNumber,
                status: currStatus,
                startDate: ticketDetailsInputs?.startDate,
                endDate: ticketDetailsInputs?.endDate
            }

            put(properties.ORDERS_API + "/sales-order/" + data.interactionId, obj)
                .then((response) => {
                    toast.success(`Work Order Updated Successfully`);
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
                setQuickLinks(response.data[0].links.editOrderLandingPage)
            })
            .catch((error) => {
                console.log("error", error)
            })
            .finally()
    }, [])

    const handleQuickLinks = (e) => {
        return (
            <li key="ecli11"><Link activeclassName="active" to={e.to} spy={true} offset={-250} smooth={true} duration={100}>{e.name}</Link></li>
        )
    }

    return (
        <div className="container-fluid edit-complaint">
            <div className="row align-items-center">
                <div className="col">
                    <h1 className="title bold">Work Order Number - {props.location.state.data.interactionId}</h1>
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
                            <div className={`edit-inq  new-customer ${isQuickLinkEnabled ? 'col-md-10' : 'col-md-12'}`}>
                                <div data-spy="scroll" data-target="#scroll-list" data-offset="0" className="scrollspy-div new-customer view-serv">
                                    <div className="col-12">
                                        <ul key="ecul2" className="nav nav-tabs" role="tablist">
                                            <li key="ecli21" className="nav-item pl-0">
                                                <button onClick={() => { setActiveTab(0) }} className={`nav-link ${activeTab === 0 ? 'active' : ''} font-17 bolder`}>
                                                    Work Order Details
                                                </button>
                                            </li>
                                            <li key="ecli22" className="nav-item">
                                                <button onClick={() => { setActiveTab(1) }} className={`nav-link ${activeTab === 1 ? 'active' : ''} font-17 bolder`}>
                                                    Workflow History
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="tab-content py-0 pl-3">
                                        <div className={`tab-pane ${activeTab === 0 ? 'show active' : ''}`} id="ticketDetails">
                                            {
                                                activeTab === 0 &&
                                                <OrderDetails
                                                    data={{
                                                        customerData,
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
                                                        orderTaskDetailsList,
                                                        serverApplianceDetailsList,
                                                        networkDetailsList,
                                                        networkList,
                                                        applicationList,
                                                        saasList,
                                                        otherServicesList,
                                                        editedTaskIdList,
                                                        editedNetworkIdList,
                                                        editedServerApplianceIdList,
                                                        customerContract,
                                                        billingContractDetails
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
                                                        setOrderTaskDetailsList,
                                                        setServerApplianceDetailsList,
                                                        setNetworkDetailsList,
                                                        setNetworkList,
                                                        setApplicationList,
                                                        setSaasList,
                                                        setOtherServicesList,
                                                        setEditedTaskIdList,
                                                        setEditedNetworkIdList,
                                                        setEditedServerApplianceIdList,
                                                        setBillingContractDetails
                                                    }}
                                                    error={ticketDetailsError}
                                                />
                                            }
                                        </div>
                                        {/* <div className="tab-pane" id="ticketHistory"> */}
                                        <div className={`tab-pane ${activeTab === 1 ? 'show active' : ''}`} id="ticketHistory">
                                            {
                                                activeTab === 1 &&
                                                <OrderWorkflowHistory
                                                    data={{
                                                        workflowHistory
                                                    }}
                                                />
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {isQuickLinkEnabled && <div className="col-md-2 pl-2 sticky">
                                <nav className="navbar navbar-default navbar-fixed-top">
                                    <div className="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
                                        <ul key="ecul1" className="nav navbar-nav">
                                            {quickLinks && quickLinks.map((e) => (
                                                handleQuickLinks(e)
                                            ))}
                                            {/* <li key="ecli11"><Link activeclassName="active" to="ticketDetailsSection" spy={true} offset={-250} smooth={true} duration={100}>Work Order</Link></li>
                                            <li key="ecli12"><Link activeclassName="active" to="salesOrderSection" spy={true} offset={-250} smooth={true} duration={100}>Sales Order</Link></li>
                                            <li key="ecli13"><Link activeclassName="active" to="customerSection" spy={true} offset={-230} smooth={true} duration={100}>Customer Details</Link></li>
                                            <li key="ecli14"><Link activeclassName="active" to="contractSection" spy={true} offset={-250} smooth={true} duration={100}>Customer Contract</Link></li>
                                            <li key="ecli15"><Link activeclassName="active" to="attachmentsSection" spy={true} offset={-220} smooth={true} duration={100}>Attachments</Link></li>
                                            <li key="ecli16"><Link activeclassName="active" to="fulfilmentSection" spy={true} offset={-220} smooth={true} duration={100}>Fulfilment</Link></li>
                                            <li key="ecli17"><Link activeclassName="active" to="contractDetailsSection" spy={true} offset={-220} smooth={true} duration={100}>Billing Contract Details</Link></li> */}
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

export default EditOrderLandingPage;