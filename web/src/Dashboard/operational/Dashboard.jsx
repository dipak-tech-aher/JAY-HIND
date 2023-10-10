/* eslint-disable jsx-a11y/anchor-is-valid */
import moment from "moment";
import React, { useContext, useEffect, useRef, useState, lazy, Suspense } from "react";
import { Form } from 'react-bootstrap';
import { unstable_batchedUpdates } from 'react-dom';
import { Controller, useForm } from "react-hook-form";
import ReactSelect from "react-select";
import { toast } from "react-toastify";
import { DateRangePicker } from 'rsuite';
import { AppContext, OpsDashboardContext } from "../../AppContext";
import { get, post } from "../../common/util/restUtil";
import { properties } from "../../properties";
import { Modal } from 'react-bootstrap';
// import AppoinmentHistory from "./Appoinment/appoinmentHistory";
// import UpcomingAppoinments from './Appoinment/upcomingAppoinments';
// import AssignInteractions from './Interactions/assignedInteractions';
// import InteractionHistory from './Interactions/interactionHistory';
// import AssignedOrders from './Orders/assignedOrders';
// import OrderHistory from './Orders/orderHistory';
// import TopFivePerformer from "./Performance/TopFivePerformer";
// import TopPerformanceChat from "./Performance/TopPerformerChat";
// import PerformanceActivity from './Performance/performanceActivity';
import DangerCalSvg from "../../assets/images/ops/danger-cal.svg";
import EquiSvg from "../../assets/images/ops/equi.svg";
import SuccessCalSvg from "../../assets/images/ops/success-cal.svg";
import WarnCalSvg from "../../assets/images/ops/warn-cal.svg";
// import TopPerformanceInteraction from "./CategoryPerformance/TopPerformanceInteraction";
// import TopPerformanceOrder from "./CategoryPerformance/TopPerformanceOrder";
// import InteractionsRightModal from "./RightModals/InteractionsRightModal";
// import OrdersRightModal from "./RightModals/OrdersRightModal";
import AssignToMe from "./assignToMe";
// import AvatarImg from "../../assets/images/Avatar2.jpg";
// import Trophy from "../../assets/images/trophy.svg";
// import Trophyb from "../../assets/images/trophy-b.svg";
// import Trophys from "../../assets/images/trophy-s.svg";
import { statusConstantCode } from '../../AppConstants';
// import AgentPerformance from "./Performance/AgentPerformance";
// import OverAllPerformance from "./Performance/OverAllPerformance";
import Insights from "./insights";
import SuspenseFallbackLoader from "../../common/components/SuspenseFallbackLoader";
import RequestTable from "../../CRM/Request/table";

const TopPerformanceInteraction = lazy(() => import('./CategoryPerformance/TopPerformanceInteraction'));
const TopPerformanceOrder = lazy(() => import("./CategoryPerformance/TopPerformanceOrder"));
const InteractionsRightModal = lazy(() => import("./RightModals/InteractionsRightModal"));
const OrdersRightModal = lazy(() => import("./RightModals/OrdersRightModal"));
const AgentPerformance = lazy(() => import("./Performance/AgentPerformance"));
const OverAllPerformance = lazy(() => import("./Performance/OverAllPerformance"));
const TopFivePerformer = lazy(() => import("./Performance/TopFivePerformer"));
const TopPerformanceChat = lazy(() => import("./Performance/TopPerformerChat"));
const AppoinmentHistory = lazy(() => import("./Appoinment/appoinmentHistory"));
const UpcomingAppoinments = lazy(() => import('./Appoinment/upcomingAppoinments'));
const AssignInteractions = lazy(() => import('./Interactions/assignedInteractions'));
const InteractionHistory = lazy(() => import('./Interactions/interactionHistory'));
const AssignedOrders = lazy(() => import('./Orders/assignedOrders'));
const OrderHistory = lazy(() => import('./Orders/orderHistory'));

const OperationalDashboard = (props) => {
    const modalStyle = {
        'width': '100%'
    }
    const { appsConfig } = props;
    const { auth, appConfig } = useContext(AppContext);
    const [meOrMyTeam, setMeOrMyTeam] = useState('Me')
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [screenType, setScreenType] = useState(null)
    const handleClose = () => {
        setIsFullScreen(false);
    };
    const [viewType, setViewType] = useState('skel-interactive')
    const [masterLookupData, setMasterLookupData] = useState({});
    const [teamMembers, setTeamMembers] = useState([]);
    const [selectedInteraction, setSelectedInteraction] = useState([])
    const [selectedEntityType, setSelectedEntityType] = useState('')
    const [selectedOrder, setSelectedOrder] = useState([])
    //Refresh states
    const [isPageRefresh, setIsPageRefresh] = useState(false)
    const [isChecked, setIsChecked] = useState(false);
    // const [time, setTime] = useState();
    const [pageRefreshTime, setPageRefreshTime] = useState(30);
    const [lastDataRefreshTime, setLastDataRefreshTime] = useState({
        assignedToMe: moment().format('DD-MM-YYYY HH:mm:ss'),
        assignedInteraction: moment().format('DD-MM-YYYY HH:mm:ss'),
        assignedOrder: moment().format('DD-MM-YYYY HH:mm:ss'),
        assignedAppointment: moment().format('DD-MM-YYYY HH:mm:ss'),
        assignedToTeamInteraction: moment().format('DD-MM-YYYY HH:mm:ss'),
        assignedToTeamOrder: moment().format('DD-MM-YYYY HH:mm:ss'),
        assignedToTeamAppointment: moment().format('DD-MM-YYYY HH:mm:ss'),
        performanceActivity: moment().format('DD-MM-YYYY HH:mm:ss'),
        interactionHistory: moment().format('DD-MM-YYYY HH:mm:ss'),
        orderHistory: moment().format('DD-MM-YYYY HH:mm:ss'),
        appoinmentHistory: moment().format('DD-MM-YYYY HH:mm:ss'),
        performanceActivityTeam: moment().format('DD-MM-YYYY HH:mm:ss'),
        interactionHistoryTeam: moment().format('DD-MM-YYYY HH:mm:ss'),
        orderHistoryTeam: moment().format('DD-MM-YYYY HH:mm:ss'),
        appoinmentHistoryTeam: moment().format('DD-MM-YYYY HH:mm:ss'),
        TopPerformanceInteraction: moment().format('DD-MM-YYYY HH:mm:ss'),
        TopPerformanceInteractionTeam: moment().format('DD-MM-YYYY HH:mm:ss'),
        TopPerformanceOrder: moment().format('DD-MM-YYYY HH:mm:ss'),
        TopPerformanceOrderTeam: moment().format('DD-MM-YYYY HH:mm:ss'),
        TopFivePerformer: moment().format('DD-MM-YYYY HH:mm:ss'),
        TopFivePerformerTeam: moment().format('DD-MM-YYYY HH:mm:ss'),
        TopPerformanceChat: moment().format('DD-MM-YYYY HH:mm:ss'),
        TopPerformanceChatTeam: moment().format('DD-MM-YYYY HH:mm:ss'),
        requestAssignedToMe: moment().format('DD-MM-YYYY HH:mm:ss'),
        requestAssignedToTeam: moment().format('DD-MM-YYYY HH:mm:ss')
    })
    const [currentTime, setCurrentTime] = useState(moment().format('DD-MM-YYYY HH:mm:ss'))
    const [assignedInteractionAge, setAssignedInteractionAge] = useState({
        threeDays: 0,
        fiveDays: 0,
        morethan: 0,
        total: 0
    })
    const [assignedOrderAge, setAssignedOrderAge] = useState({
        threeDays: 0,
        fiveDays: 0,
        morethan: 0,
        total: 0
    })
    const [assignedRequestAge, setAssignedRequestAge] = useState({
        threeDays: 0,
        fiveDays: 0,
        morethan: 0,
        total: 0
    })
    const [agentInteractionPerformance, setAgentInteractionPerformance] = useState([])
    const [agentOrderPerformance, setagentOrderPerformance] = useState([])
    const [agentAppointmentPerformance, setagentAppointmentPerformance] = useState([])
    const serviceCategories = masterLookupData?.PROD_SUB_TYPE?.map(elm => ({ label: elm?.description, value: elm?.code }));
    const serviceTypeList = masterLookupData?.SERVICE_TYPE?.map(elm => ({ label: elm?.description, value: elm?.code }));
    const teamMemberss = teamMembers?.map(elm => ({ label: (elm?.firstName + ' ' + elm?.lastName), value: elm?.userId }));
    const [serviceTypes, setServiceTypes] = useState([])

    const [searchParams, setSearchParams] = useState({
        roleId: auth?.currRoleId,
        departmentId: auth?.currDeptId
    });
    const [submitError, setSubmitError] = useState(null);
    const [chatWidth, setChatWidth] = useState(undefined);
    const [sidebarTop, setSidebarTop] = useState(undefined);
    const formRef = useRef();
    const { handleSubmit, control, reset } = useForm();

    const onSubmit = (data) => {
        // console.log(data);
        setSubmitError(null);
        const noFilterSelected = !data?.dateRange?.length && !data.serviceCat && !data.serviceType;
        if (meOrMyTeam === "Me" && noFilterSelected) {
            setSubmitError("Please apply atleast one filter"); return;
        } else if (meOrMyTeam === "MyTeam" && noFilterSelected && !data.teamMemberId) {
            setSubmitError("Please apply atleast one filter"); return;
        }

        if (data?.dateRange?.length) {
            data.dateRange[1] = data.dateRange?.[1] ? data.dateRange?.[1] : data.dateRange?.[0]
            data['fromDate'] = moment(data.dateRange?.[0]).format("YYYY-MM-DD");
            data['toDate'] = moment(data.dateRange?.[1]).format("YYYY-MM-DD")
        }

        if (meOrMyTeam !== "MyTeam") {
            data["teamMemberId"] = undefined;
        }

        setSearchParams({
            ...data
        });

        getOverViewDetails()
    }

    const handleClear = (event) => {
        event.preventDefault();
        reset();
        setSearchParams({
            fromDate: undefined, toDate: undefined, serviceCat: undefined,
            serviceType: undefined, teamMemberId: undefined,
            roleId: auth?.currRoleId,
            departmentId: auth?.currDeptId
        });
    }

    useEffect(() => {
        const intervalId = setInterval(() => {
            // console.log("current time");
            setCurrentTime(moment().format('DD-MM-YYYY HH:mm:ss'))
            // console.log('-------------> refresh', moment().format('DD-MM-YYYY HH:MM:SS'))
        }, 60 * 1000);

        return () => clearInterval(intervalId);
    }, [])


    useEffect(() => {
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=APPOINT_TYPE,TICKET_CHANNEL,PRIORITY,SERVICE_TYPE,PROD_SUB_TYPE,INTXN_TYPE,INTXN_CATEGORY,INTERACTION_STATUS,ORDER_STATUS,ORDER_CATEGORY,ORDER_TYPE')
            .then((response) => {
                const { data } = response;
                // console.log(data);
                setMasterLookupData({ ...data });
            })
            .catch(error => {
                console.error(error);
            });
        get(properties.USER_API + '/get-my-team-members')
            .then((response) => {
                const { data } = response;
                if (data) {
                    setTeamMembers([...data]);
                }
            })
            .catch(error => {
                console.error(error);
            });


    }, [])

    const getTopPerformance = () => {

        const requestBody = {
            searchParams: {
                userId: auth?.user?.userId
            }
        }

        post(`${properties.INTERACTION_API}/get-top-performance`, { ...requestBody }).then((resp) => {
            if (resp?.data && Array.isArray(resp?.data) && resp.data?.length > 0) {
                setAgentInteractionPerformance(resp?.data)
            }
        }).catch((error) => console.log(error))
            .finally()

        post(`${properties.ORDER_API}/get-top-performance`, { ...requestBody }).then((resp) => {
            if (resp?.data && Array.isArray(resp?.data) && resp.data?.length > 0) {
                setagentOrderPerformance(resp?.data)
            }
        }).catch((error) => console.log(error))
            .finally()

        post(`${properties.APPOINTMENT_API}/get-top-performance`, { ...requestBody }).then((resp) => {
            if (resp?.data && Array.isArray(resp?.data) && resp.data?.length > 0) {
                setagentAppointmentPerformance(resp?.data)
            }
        }).catch((error) => console.log(error))
            .finally()
    }

    const handleAutoRefresh = (event) => {
        if (!pageRefreshTime) {
            toast.error("Refresh Time Is Require!");
            return
        }
        setIsChecked(event.target.checked);
    }

    const getOverViewDetails = () => {
        const interactionOverViewAPI = `${properties.INTERACTION_API}/get-interaction-overview`;

        let searchParamss = {
            ...searchParams,
            userId: auth?.user?.userId,
            roleId: auth?.currRoleId,
        }
        post(interactionOverViewAPI, {
            "searchParams": searchParamss,
        }).then((resp) => {
            if (resp.data?.rows && Array.isArray(resp.data?.rows) && resp.data?.rows.length > 0) {
                const interactionResponse = resp?.data?.rows?.map((e) => {
                    return {
                        threeDays: e?.oIntxn3DayCnt || 0,
                        fiveDays: e?.oIntxn5DayCnt || 0,
                        morethan: e?.oIntxnMoreThan5DayCnt || 0,
                        total: e?.oIntxnTotalCnt || 0
                    }
                })
                const orderResponse = resp?.data?.rows?.map((e) => {
                    return {
                        threeDays: e?.oOrder3DayCnt || 0,
                        fiveDays: e?.oOrder5DayCnt || 0,
                        morethan: e?.oOrderMoreThan5DayCnt || 0,
                        total: e?.oOrderTotalCnt || 0
                    }
                })
                const requestResponse = resp?.data?.rows?.map((e) => {
                    return {
                        threeDays: e?.oRequest3DayCnt || 0,
                        fiveDays: e?.oRequest5DayCnt || 0,
                        morethan: e?.oRequestMoreThan5DayCnt || 0,
                        total: e?.oRequestTotalCnt || 0
                    }
                })
                unstable_batchedUpdates(() => {
                    setAssignedInteractionAge(interactionResponse?.[0] || {})
                    setAssignedOrderAge(orderResponse?.[0] || {})
                    setAssignedRequestAge(requestResponse?.[0] || {})
                })
            }
        }).catch((error) => {
            console.log(error)
        })
    }

    useEffect(() => {
        getOverViewDetails()
        getTopPerformance()
    }, [meOrMyTeam, isPageRefresh])

    useEffect(() => {
        unstable_batchedUpdates(() => {
            // console.log('typeof(pageRefreshTime)-------', pageRefreshTime)
            if (pageRefreshTime && typeof (pageRefreshTime) === 'number') {
                const intervalId = setInterval(() => {
                    if (isChecked) {
                        // setTime(new Date())
                        setIsPageRefresh(!isPageRefresh)
                        const currentTime = moment().format('DD-MM-YYYY HH:mm:ss')
                        setLastDataRefreshTime({
                            assignedToMe: currentTime,
                            assignedInteraction: currentTime,
                            assignedOrder: currentTime,
                            assignedAppointment: currentTime,
                            assignedToTeamInteraction: currentTime,
                            assignedToTeamOrder: currentTime,
                            assignedToTeamAppointment: currentTime,
                            performanceActivity: currentTime,
                            interactionHistory: currentTime,
                            orderHistory: currentTime,
                            appoinmentHistory: currentTime,
                            performanceActivityTeam: currentTime,
                            interactionHistoryTeam: currentTime,
                            orderHistoryTeam: currentTime,
                            appoinmentHistoryTeam: currentTime,
                            TopPerformanceInteraction: currentTime,
                            TopPerformanceInteractionTeam: currentTime,
                            TopPerformanceOrder: currentTime,
                            TopPerformanceOrderTeam: currentTime,
                            TopFivePerformer: currentTime,
                            TopFivePerformerTeam: currentTime,
                            TopPerformanceChat: currentTime,
                            TopPerformanceChatTeam: currentTime,
                            requestAssignedToMe: currentTime,
                            requestAssignedToTeam: currentTime
                        })
                        // console.log("Component refreshed!", pageRefreshTime);
                    }
                }, Number(pageRefreshTime) * 60 * 1000);

                return () => clearInterval(intervalId);
            }
        })
    }, [isChecked]);

    const handleSetRefreshTime = (e) => {
        unstable_batchedUpdates(() => {
            setIsChecked(false)
            setPageRefreshTime(parseInt(e.target.value));
        })
    }


    useEffect(() => {
        const chatEl = document.querySelector('.skel-op-dashboard-lft-base').getBoundingClientRect();
        setChatWidth(chatEl.width);
        // setChatWidth(200);
        setSidebarTop(chatEl.top);
    }, [window?.scrollY]);

    useEffect(() => {
        if (!sidebarTop) return;
        // console.log("calling...")
        window.addEventListener('scroll', isSticky);
        return () => {
            window.removeEventListener('scroll', isSticky);
        };
    }, [sidebarTop]);

    const isSticky = (e) => {
        const chatEl = document.querySelector('.skel-op-dashboard-lft-base');
        const scrollTop = window.scrollY;
        if (scrollTop >= sidebarTop - 10) {
            chatEl?.classList?.add('is-sticky');
        } else {
            chatEl?.classList?.remove('is-sticky');
        }
    };
    const contextProvider = {
        data: {
            meOrMyTeam,
            viewType,
            pageRefreshTime,
            masterLookupData,
            teamMembers,
            lastDataRefreshTime,
            currentTime,
            searchParams,
            assignedInteractionAge,
            assignedOrderAge,
            assignedRequestAge,
            isPageRefresh
        },
        handlers: {
            setSelectedInteraction,
            setSelectedOrder,
            setSelectedEntityType,
            setLastDataRefreshTime,
            setCurrentTime,
            setAssignedInteractionAge,
            setAssignedOrderAge,
            setAssignedRequestAge,
            setSearchParams,
            setIsPageRefresh
        }
    }

    const handleOnChangeServiceCat = (e) => {
        // console.log(e)
        const arr = []
        if (e.length > 0) {
            for (const d of e) {
                masterLookupData?.SERVICE_TYPE
                    .filter(col => {
                        if (col?.mapping?.mapEntity && col?.mapping?.mapEntity.includes(d.value)) {
                            arr.push(col)
                        }
                    })
                // console.log(arr)
                setServiceTypes(arr.map(val => (
                    {
                        label: val.description,
                        value: val.code
                    }
                )))

            }
        } else {
            setServiceTypes([])
        }
    }

    const [requestTotalCount, setRequestTotalCount] = useState(0);
    const [requestRefresh, setRequestRefresh] = useState(false);

    const [requestLastUpdatedAt, setRequestLastUpdatedAt] = useState(moment());

    useEffect(() => {
        const interval = setInterval(() => {
            setRequestLastUpdatedAt(moment(meOrMyTeam === 'Me' ? lastDataRefreshTime?.requestAssignedToMe : lastDataRefreshTime?.requestAssignedToTeam, "DD-MM-YYYY HH:mm:ss"))
        }, 60 * 1000);
        return () => clearInterval(interval);
    }, [lastDataRefreshTime]);

    return (
        <OpsDashboardContext.Provider value={contextProvider}>
            <div className="content-page" style={{ margin: 0 }}>
                <div className="content">

                    <div className="cnt-wrapper">
                        <div className="card-skeleton">
                            <div className="customer-skel">
                                <div className="row">
                                    <div className="col-lg-2 col-md-12 col-xs-12 skel-resp-w-100">
                                        <div className="skel-op-dashboard-lft-base cmmn-skeleton" style={{ width: chatWidth }}>
                                            <span className="skel-header-title">Filters</span>
                                            <hr className="cmmn-hline" />
                                            <Form className="mt-1 filter-form" ref={formRef} onSubmit={handleSubmit(onSubmit)}>
                                                {meOrMyTeam === "MyTeam" && (
                                                    <div className="form-group">
                                                        <label htmlFor="apptname" className="filter-form-label control-label">Team Members</label>
                                                        <Controller
                                                            control={control}
                                                            name="teamMemberId"
                                                            render={({ field: { onChange, onBlur, value, ref } }) => (
                                                                <ReactSelect
                                                                    inputRef={ref}

                                                                    menuPortalTarget={document.body}
                                                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                                                    className="w-100"
                                                                    options={teamMemberss}
                                                                    isMulti={true}
                                                                    value={value ? teamMemberss.find(c => c.value === value) : null}
                                                                    onChange={val => onChange(val)}
                                                                />
                                                            )}
                                                        />
                                                    </div>
                                                )}
                                                <div className="form-group">
                                                    <label htmlFor="apptname" className="filter-form-label control-label">Date Range</label>
                                                    <Controller
                                                        control={control}
                                                        name="dateRange"
                                                        render={({ field: { onChange, onBlur, value, ref } }) => (
                                                            <DateRangePicker
                                                                format="dd-MM-yyyy"
                                                                character={' to '}
                                                                value={value ? value : []}
                                                                onChange={onChange}
                                                                placeholder="Select Date Range"
                                                                className="z-idx w-100"
                                                            />
                                                        )}
                                                    />
                                                </div>
                                                <div className="form-group skel-z-index">
                                                    <label htmlFor="apptname" className="filter-form-label control-label">Service Category</label>
                                                    <Controller
                                                        control={control}
                                                        name="serviceCat"
                                                        render={({ field: { onChange, onBlur, value, ref } }) => (
                                                            <ReactSelect
                                                                inputRef={ref}
                                                                className="w-100"
                                                                menuPortalTarget={document.body}
                                                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                                options={serviceCategories}
                                                                isMulti={true}
                                                                value={value ? serviceCategories.find(c => c.value === value) : null}
                                                                onChange={val => {
                                                                    onChange(val)
                                                                    handleOnChangeServiceCat(val);
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="apptname" className="filter-form-label control-label">Service Type</label>
                                                    <Controller
                                                        control={control}
                                                        name="serviceType"
                                                        render={({ field: { onChange, onBlur, value, ref } }) => (
                                                            <ReactSelect
                                                                inputRef={ref}
                                                                className="w-100"

                                                                menuPortalTarget={document.body}
                                                                styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                                                options={serviceTypes && serviceTypes.length > 0 ? serviceTypes : serviceTypeList}
                                                                isMulti={true}
                                                                value={value ? serviceTypes.find(c => c.value === value) : null}
                                                                onChange={val => onChange(val)}
                                                            />
                                                        )}
                                                    />
                                                </div>
                                                {submitError && <span className="errormsg">{submitError}</span>}
                                                <div className="form-group skel-filter-frm-btn">
                                                    <button className="skel-btn-cancel" onClick={handleClear}>
                                                        Clear
                                                    </button>
                                                    <button className="skel-btn-submit" onClick={() => { formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })) }}>
                                                        Filter
                                                    </button>
                                                </div>
                                            </Form>
                                        </div>
                                    </div>
                                    <div className="col-lg-10 col-md-12 col-xs-12 skel-resp-w-100">
                                        <div className="tabbable">
                                            <ul className="nav nav-tabs" id="myTab" role="tablist">
                                                <li className="nav-item">
                                                    <a className="nav-link active" id="me-tab" data-toggle="tab" role="tab" aria-controls="me" aria-selected="true" onClick={() => setMeOrMyTeam('Me')}>Me</a>
                                                </li>
                                                <li className="nav-item">
                                                    <a className="nav-link" id="team-tab" data-toggle="tab" role="tab" aria-controls="team" aria-selected="false" onClick={() => setMeOrMyTeam('MyTeam')}>My Team</a>
                                                </li>
                                            </ul>

                                            {/*                                                 
                                                <div className="skel-rht-btns-page">
                                                    <button className="skel-btn-submit skel-btn-outline">Edit</button>
                                                    <button className="skel-btn-submit" id="dashboard-create">Dashboard
                                                        <i className="material-icons">expand_more</i>
                                                    </button>
                                                </div> */}

                                            <div className="skel-create-dashboard">
                                                <ul className="skel-ul-data-dashboard-mnu" id="dashboard-skel" style={{ "display": "none" }}>
                                                    <li><i className="material-icons">drag_indicator</i> <a >Default</a></li>
                                                    <hr />
                                                    <li><i className="material-icons">drag_indicator</i> <a href="viewdashboard.html">View all dashboards</a></li>
                                                    <li><i className="material-icons">drag_indicator</i> <a data-target="#modalcreatedashboard" data-toggle="modal">Create dashboard</a></li>
                                                </ul>
                                            </div>

                                        </div>
                                        <div className="tab-content">
                                            <div className="tab-pane fade show active" id="me" role="tabpanel" aria-labelledby="me-tab">
                                                <div className="skle-swtab-sect">
                                                    <div className="db-list mb-0 pl-0">
                                                        <a className="skel-fr-sel-cust">
                                                            <div className={`list-dashboard skel-self ${viewType === 'skel-interactive' ? 'db-list-active' : ''}`} onClick={() => setViewType('skel-interactive')}>
                                                                <span className="db-title">Interactive View</span>
                                                            </div>
                                                        </a>
                                                        <a className="skel-fr-sel-serv">
                                                            <div className={`list-dashboard skel-informative ${viewType === 'skel-informative' ? 'db-list-active' : ''}`} onClick={() => setViewType('skel-informative')}>
                                                                <span className="db-title">Informative View</span>
                                                            </div>
                                                        </a>
                                                    </div>
                                                    <form className="form-inline">
                                                        <span className="ml-1">Auto Refresh</span>
                                                        <div className="switchToggle ml-1">
                                                            <input id="switch1" type="checkbox" checked={isChecked} onChange={handleAutoRefresh} />
                                                            <label htmlFor="switch1">Toggle</label>
                                                        </div>
                                                        <button type="button" className="ladda-button  btn btn-secondary btn-xs ml-1" dir="ltr" data-style="slide-left">
                                                            <span className="ladda-label"
                                                                onClick={() => setIsPageRefresh(!isPageRefresh)}
                                                            ><i className="material-icons">refresh</i>
                                                            </span><span className="ladda-spinner"></span>
                                                        </button>
                                                        <select className="custom-select custom-select-sm ml-1" value={pageRefreshTime} onChange={handleSetRefreshTime} >
                                                            <option value="Set">Set</option>
                                                            <option value={Number(1)}>1 Min</option>
                                                            <option value={Number(5)}>5 Min</option>
                                                            <option value={Number(15)}>15 Min</option>
                                                            <option value={Number(30)}>30 Min</option>
                                                        </select>
                                                    </form>
                                                </div>
                                                {/* m-h-vh */}
                                                <div className="">
                                                    {(viewType === 'skel-interactive') ? (
                                                        <div className="skel-self-data">
                                                            <div className="row">
                                                                {meOrMyTeam === 'Me' && appsConfig?.clientConfig?.operational_dashboard?.interactiveView?.assignedToMe?.isActive && (
                                                                    <div className="col-md-12">
                                                                        <AssignToMe data={{ appsConfig }} />
                                                                    </div>
                                                                )}
                                                                {appsConfig?.clientConfig?.operational_dashboard?.interactiveView?.upcomingAppointments?.isActive && <div className={!!!statusConstantCode?.bussinessSetup.includes(appConfig?.businessSetup?.[0]) ? 'col-md-12 mt-3' : "d-none"}>
                                                                    <Suspense fallback={SuspenseFallbackLoader}>
                                                                        <UpcomingAppoinments
                                                                            data={{
                                                                                masterLookupData
                                                                            }}
                                                                        />
                                                                    </Suspense>
                                                                </div>}
                                                                {appsConfig?.clientConfig?.operational_dashboard?.interactiveView?.pendingRequest?.isActive && <div className="col-md-12 mt-3">
                                                                    <Suspense fallback={SuspenseFallbackLoader}>
                                                                        <div className="cmmn-skeleton">
                                                                            <div className="skel-dashboard-title-base">
                                                                                <span className="skel-header-title">Pending Requests ({requestTotalCount})</span>
                                                                                <div className="skel-dashboards-icons">
                                                                                    <a><i className="material-icons" onClick={() => setRequestRefresh(!requestRefresh)}>refresh</i></a>
                                                                                </div>
                                                                            </div>
                                                                            <hr className="cmmn-hline" />
                                                                            <div className="">
                                                                                <RequestTable
                                                                                    requestStatus={"open"}
                                                                                    selectedTab={"my-request"}
                                                                                    screenAction={"Manage Request"}
                                                                                    setRequestTotalCount={setRequestTotalCount}
                                                                                    requestRefresh={requestRefresh}
                                                                                    setRequestRefresh={setRequestRefresh}
                                                                                />
                                                                            </div>
                                                                            <hr className="cmmn-hline" />
                                                                            <div className="skel-refresh-info">
                                                                                <span><i className="material-icons">refresh</i> Updated {moment(requestLastUpdatedAt).fromNow()}</span>
                                                                                <div className="skel-data-records"></div>
                                                                            </div>
                                                                        </div>
                                                                    </Suspense>
                                                                </div>}
                                                            </div>
                                                            <div className="row">
                                                                {appsConfig?.clientConfig?.operational_dashboard?.interactiveView?.pooledInteractions?.isActive && <div className="col-lg-6 col-md-12 mt-3">
                                                                    <Suspense fallback={SuspenseFallbackLoader}>
                                                                        <AssignInteractions data={{ type: 'POOLED', isFullScreen }} handlers={{ setIsFullScreen, setScreenType }}
                                                                        />
                                                                    </Suspense>
                                                                </div>}
                                                                {appsConfig?.clientConfig?.operational_dashboard?.interactiveView?.assignedInteractions?.isActive && <div className="col-lg-6 col-md-12 mt-3">
                                                                    <Suspense fallback={SuspenseFallbackLoader}>
                                                                        <AssignInteractions data={{ type: 'ASSIGNED', isFullScreen }} handlers={{ setIsFullScreen, setScreenType }} />
                                                                    </Suspense>
                                                                </div>}
                                                            </div>
                                                            <div className={!!!statusConstantCode?.bussinessSetup.includes(appConfig?.businessSetup?.[0]) ? 'row' : "d-none"}>
                                                                {appsConfig?.clientConfig?.operational_dashboard?.interactiveView?.assignedOrders?.isActive && <div className="col-lg-6 col-md-12 mt-3">
                                                                    <Suspense fallback={SuspenseFallbackLoader}>
                                                                        <AssignedOrders data={{ type: 'POOLED', isFullScreen }} handlers={{ setIsFullScreen, setScreenType }} />
                                                                    </Suspense>
                                                                </div>}
                                                                {appsConfig?.clientConfig?.operational_dashboard?.interactiveView?.pooledOrders?.isActive && <div className="col-lg-6 col-md-12 mt-3">
                                                                    <Suspense fallback={SuspenseFallbackLoader}>
                                                                        <AssignedOrders data={{ type: 'ASSIGNED', isFullScreen }} handlers={{ setIsFullScreen, setScreenType }} />
                                                                    </Suspense>
                                                                </div>}
                                                            </div>

                                                        </div>
                                                    ) : (viewType === 'skel-informative') ? (
                                                        <div className="skel-informative-data">
                                                            {meOrMyTeam === "Me" && (
                                                                <Insights />
                                                            )}
                                                            {meOrMyTeam !== 'Me' && appsConfig?.clientConfig?.operational_dashboard?.informativeView?.top5Performance?.isActive && <> <span className="skel-header-title">Top 5 Performance</span>
                                                                <div className="skel-top-5-perf-sect">
                                                                    {appsConfig?.clientConfig?.operational_dashboard?.informativeView?.top5Performance?.byInteractions?.isActive && <Suspense fallback={SuspenseFallbackLoader}>
                                                                        <AgentPerformance
                                                                            data={{
                                                                                source: statusConstantCode?.entityCategory?.INTERACTION,
                                                                                agentPerformance: agentInteractionPerformance
                                                                            }}
                                                                            handlers={{
                                                                                setAgentPerformance: setAgentInteractionPerformance
                                                                            }} />
                                                                    </Suspense>}
                                                                    {!!!statusConstantCode?.bussinessSetup.includes(appConfig?.businessSetup?.[0]) && appsConfig?.clientConfig?.operational_dashboard?.informativeView?.top5Performance?.byOrders?.isActive &&
                                                                        <Suspense fallback={SuspenseFallbackLoader}>
                                                                            <AgentPerformance
                                                                                data={{
                                                                                    source: statusConstantCode?.entityCategory?.ORDER,
                                                                                    agentPerformance: agentOrderPerformance
                                                                                }}
                                                                                handlers={{
                                                                                    setAgentPerformance: setagentOrderPerformance
                                                                                }} />
                                                                        </Suspense>
                                                                    }
                                                                    {!!!statusConstantCode?.bussinessSetup.includes(appConfig?.businessSetup?.[0]) && appsConfig?.clientConfig?.operational_dashboard?.informativeView?.top5Performance?.byAppointments?.isActive &&
                                                                        <Suspense fallback={SuspenseFallbackLoader}>
                                                                            <AgentPerformance
                                                                                data={{
                                                                                    source: statusConstantCode?.entityCategory?.APPOINTMENT,
                                                                                    agentPerformance: agentAppointmentPerformance
                                                                                }}
                                                                                handlers={{
                                                                                    setAgentPerformance: setagentAppointmentPerformance
                                                                                }} />
                                                                        </Suspense>
                                                                    }
                                                                </div></>}
                                                            <div className="skel-oper-flex">
                                                                {/* {meOrMyTeam === 'Me' && <div className="col-md-6">
                                                                        <PerformanceActivity />
                                                                    </div>} */}
                                                                {appsConfig?.clientConfig?.operational_dashboard?.informativeView?.interactionCorner?.isActive && <div className="skel-wrap-sect">
                                                                    <Suspense fallback={SuspenseFallbackLoader}>
                                                                        <InteractionHistory />
                                                                    </Suspense>
                                                                </div>}
                                                                {appsConfig?.clientConfig?.operational_dashboard?.informativeView?.orderCorner?.isActive && <div className={!!!statusConstantCode?.bussinessSetup.includes(appConfig?.businessSetup?.[0]) ? 'skel-wrap-sect' : "d-none"}>
                                                                    <Suspense fallback={SuspenseFallbackLoader}>
                                                                        <OrderHistory />
                                                                    </Suspense>
                                                                </div>}

                                                                {appsConfig?.clientConfig?.operational_dashboard?.informativeView?.appointmentsCorner?.isActive && <div className={!!!statusConstantCode?.bussinessSetup.includes(appConfig?.businessSetup?.[0]) ? 'skel-wrap-sect' : "d-none"}>
                                                                    <Suspense fallback={SuspenseFallbackLoader}>
                                                                        <AppoinmentHistory />
                                                                    </Suspense>
                                                                </div>}
                                                                {meOrMyTeam !== 'Me' && appsConfig?.clientConfig?.operational_dashboard?.informativeView?.topPerformanceActivity?.isActive && <div className="skel-wrap-sect">
                                                                    <Suspense fallback={SuspenseFallbackLoader}>
                                                                        <TopFivePerformer />
                                                                    </Suspense>
                                                                </div>}
                                                                {meOrMyTeam === 'Me' && appsConfig?.clientConfig?.operational_dashboard?.informativeView?.top5Interactions?.isActive &&
                                                                    <div className="skel-wrap-sect">
                                                                        <Suspense fallback={SuspenseFallbackLoader}>
                                                                            <TopPerformanceInteraction />
                                                                        </Suspense>
                                                                    </div>
                                                                }

                                                                {
                                                                    meOrMyTeam !== 'Me' &&
                                                                    <>
                                                                        {appsConfig?.clientConfig?.operational_dashboard?.informativeView?.topPerformerChat?.isActive && <div className="skel-wrap-sect">
                                                                            <Suspense fallback={SuspenseFallbackLoader}>
                                                                                <TopPerformanceChat />
                                                                            </Suspense>
                                                                        </div>}
                                                                        {appsConfig?.clientConfig?.operational_dashboard?.informativeView?.teamCategoryPerformance?.isActive && <div className="skel-wrap-sect">
                                                                            <Suspense fallback={SuspenseFallbackLoader}>
                                                                                <OverAllPerformance />
                                                                            </Suspense>
                                                                        </div>}
                                                                    </>
                                                                }
                                                                {
                                                                    meOrMyTeam === 'Me' && appsConfig?.clientConfig?.operational_dashboard?.informativeView?.top5Orders?.isActive &&
                                                                    <div className={!!!statusConstantCode?.bussinessSetup.includes(appConfig?.businessSetup?.[0]) ? 'skel-wrap-sect' : "d-none"} >
                                                                        <Suspense fallback={SuspenseFallbackLoader}>
                                                                            <TopPerformanceOrder />
                                                                        </Suspense>
                                                                    </div>
                                                                }
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {selectedInteraction && selectedInteraction.length > 0 && selectedEntityType === 'Interaction' &&
                                <Suspense fallback={SuspenseFallbackLoader}>
                                    <InteractionsRightModal
                                        data={{
                                            selectedInteraction
                                        }}
                                    />
                                </Suspense>
                            }
                            {selectedOrder && selectedOrder.length > 0 && selectedEntityType === 'Order' &&
                                <Suspense fallback={SuspenseFallbackLoader}>
                                    <OrdersRightModal
                                        data={{
                                            selectedOrder
                                        }}
                                    />
                                </Suspense>
                            }
                        </div>
                    </div>

                </div>
            </div>
            <Modal show={isFullScreen} backdrop="static" keyboard={false} onHide={handleClose} className="modal-fullscreen-xl">
                <Modal.Body>
                    <Suspense fallback={SuspenseFallbackLoader}>
                        <AssignInteractions data={{ type: screenType, isFullScreen }} handlers={{ setIsFullScreen, setScreenType }}
                        />
                    </Suspense>
                </Modal.Body>
            </Modal>
        </OpsDashboardContext.Provider>
    )
}

export default OperationalDashboard;