import React, { useEffect, useState, useRef } from 'react';
import LiveStream from "../../assets/images/livestream.svg";
import DashboardIcons from "../../assets/images/dashboard-icons.svg";
import FilterBtn from "../../assets/images/filter-btn.svg";
import Overview from './overview';
import Priority from './by-priority';
import StatementWise from './statement-wise';
import AgeingVsFollowups from './ageing-vs-followups';
import ResMttrWaiting from './res-mttr-waiting';
import CategoryType from './category-and-type';
import ProjectWise from './project-wise';
import AgentWise from './agent-wise';
import DeptVsRole from './dept-vs-role';
import CustomerWise from './customer-wise';
import LocationWise from './location-wise';
import NetCsatChamp from './net-csat-champ';
import StatusVsType from './status-vs-type';
import ChannelWise from './channel-wise';
import Filter from './filter';
import LiveOverview from './live/overview';
import LivePriority from './live/priority';
import LiveType from './live/type';
import LiveStatus from './live/status';
import LiveProjectWise from './live/project-wise-live';
import LiveCustomerWise from './live/customer-wise-live';
import { toast } from "react-toastify";
import { unstable_batchedUpdates } from 'react-dom';
import { InteractionDashboardContext } from "../../AppContext";
import moment from "moment";
import { properties } from "../../properties";
import { get } from "../../common/util/restUtil";

const InteractionDashboard = () => {
    const [masterLookupData, setMasterLookupData] = useState([]);
    const [showRealTime, setShowRealTime] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [searchParams, setSearchParams] = useState({});
    const [isChecked, setIsChecked] = useState(false);
    const [pageRefreshTime, setPageRefreshTime] = useState(1);
    const [isParentRefresh, setIsParentRefresh] = useState(false);
    const [lastDataRefreshTime, setLastDataRefreshTime] = useState({
        AgeingVsFollowups: moment().format('DD-MM-YYYY HH:mm:ss'),
        StatusVsType: moment().format('DD-MM-YYYY HH:mm:ss'),
        Priority: moment().format('DD-MM-YYYY HH:mm:ss'),
        CategoryType: moment().format('DD-MM-YYYY HH:mm:ss'),
        ProjectWise: moment().format('DD-MM-YYYY HH:mm:ss'),
        AgentWise: moment().format('DD-MM-YYYY HH:mm:ss'),
        DeptVsRole: moment().format('DD-MM-YYYY HH:mm:ss'),
        CustomerWise: moment().format('DD-MM-YYYY HH:mm:ss'),
        LocationWise: moment().format('DD-MM-YYYY HH:mm:ss'),
        StatementWise: moment().format('DD-MM-YYYY HH:mm:ss'),
        ChannelWise: moment().format('DD-MM-YYYY HH:mm:ss')
    })

    const contextProvider = {
        data: {
            lastDataRefreshTime,
            showFilter,
            searchParams,
            isParentRefresh,
            masterLookupData
        },
        handlers: {
            setLastDataRefreshTime,
            setShowFilter,
            setSearchParams
        }
    }
    const toggleRealTimeView = () => {
        setShowRealTime(!showRealTime);
    }

    const handleAutoRefresh = (event) => {
        console.log('here live streming')
        if (!pageRefreshTime) {
            toast.error("Refresh Time Is Require!");
            return
        }
        setIsChecked(!isChecked);
        // setIsChecked(event.target.checked);
    }

    const handleSetRefreshTime = (e) => {
        unstable_batchedUpdates(() => {
            setIsChecked(false)
            setPageRefreshTime(parseInt(e.target.value));
        })
    }


    useEffect(() => {
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=PROJECT,INTERACTION_STATUS,PRIORITY,SEVERITY,INTXN_CATEGORY,INTXN_TYPE,PROD_SUB_TYPE,SERVICE_TYPE,TICKET_CHANNEL')
            .then((response) => {
                const { data } = response;
                setMasterLookupData(data)
            })
            .catch(error => {
                console.error(error);
            });
    }, [])

    useEffect(() => {
        unstable_batchedUpdates(() => {
            if (pageRefreshTime && typeof (pageRefreshTime) === 'number') {
                const intervalId = setInterval(() => {
                    if (isChecked) {

                        // const currentTime = moment().format('DD-MM-YYYY HH:mm:ss')
                        setIsParentRefresh(!isParentRefresh);
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
                    }
                }, Number(pageRefreshTime) * 60 * 1000);
                console.log("Component refreshed!-------->", pageRefreshTime);
                // return () => clearInterval(intervalId);
            }
        })
    }, [isChecked]);

    return (
        <InteractionDashboardContext.Provider value={contextProvider}>
            <div className="content">
                <div className="container-fluid pr-1">
                    <div className="cnt-wrapper">
                        <div className="card-skeleton">
                            <div className="customer-skel mt-0">
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="tab-content">
                                            <div className="tab-pane fade show active">
                                                <div className="skle-swtab-sect">
                                                    <div className="db-list mb-0 pl-0">
                                                        <div className="list-dashboard db-list-active cursor-pointer" onClick={toggleRealTimeView}>
                                                            <span className="db-title">
                                                                {!showRealTime ? (
                                                                    <React.Fragment><img src={LiveStream} className="img-fluid pr-1" />Switch to Live Stream</React.Fragment>
                                                                ) : (
                                                                    <React.Fragment><img src={DashboardIcons} className="img-fluid pr-1" />Switch to Insight View</React.Fragment>
                                                                )}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <form className="form-inline">
                                                        <span className="ml-1">Auto Refresh</span>
                                                        <div className="switchToggle ml-1">
                                                            <input id="switch1" type="checkbox" checked={isChecked} onChange={handleAutoRefresh} />
                                                            <label htmlFor="switch1">Toggle</label>
                                                        </div>
                                                        <select className="custom-select custom-select-sm ml-1" value={pageRefreshTime} onChange={handleSetRefreshTime} >
                                                            <option value="Set">Set</option>
                                                            <option value={Number(1)}>1 Min</option>
                                                            <option value={Number(5)}>5 Min</option>
                                                            <option value={Number(15)}>15 Min</option>
                                                            <option value={Number(30)}>30 Min</option>
                                                        </select>
                                                        <div className="db-list mb-0 pl-1">
                                                            <a className="skel-fr-sel-cust cursor-pointer" onClick={() => setShowFilter(!showFilter)}>
                                                                <div className="list-dashboard db-list-active skel-self">
                                                                    <span className="db-title">
                                                                        Filter<img src={FilterBtn} className="img-fluid pl-1" />
                                                                    </span>
                                                                </div>
                                                            </a>
                                                        </div>
                                                    </form>
                                                </div>

                                                <Filter data={{ showFilter, searchParams, isParentRefresh }} handler={{ setShowFilter, setSearchParams, isParentRefresh }} />
                                                {!showRealTime ? (
                                                    <div className="skel-self-data">
                                                        <div className="skel-interaction-dashboard-rht-base">
                                                            <div className="row">
                                                                <div className="col-md-6">
                                                                    <Overview data={{ searchParams, isParentRefresh }} />
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <AgeingVsFollowups data={{ searchParams, isParentRefresh }} />
                                                                    <ResMttrWaiting data={{ searchParams, isParentRefresh }} />
                                                                </div>
                                                            </div>
                                                            <div className="row mt-3">
                                                                <div className="col-md-8">
                                                                    <StatusVsType data={{ searchParams, isParentRefresh }} />
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <Priority data={{ searchParams, isParentRefresh }} />
                                                                </div>
                                                            </div>
                                                            <div className="row mt-3">
                                                                <div className="col-md-4">
                                                                    <CategoryType data={{ height: '350px', mode: 'interaction', level: 'category', searchParams, isParentRefresh, color: '#5470c6' }} />
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <CategoryType data={{ height: '350px', mode: 'interaction', level: 'type', searchParams, isParentRefresh, color: '#26a0fc' }} />
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <CategoryType data={{ height: '350px', mode: 'service', level: 'category', searchParams, isParentRefresh, color: '#5470c6' }} />

                                                                </div>
                                                            </div>
                                                            <div className="row mt-3">
                                                                <div className="col-md-4">
                                                                    <CategoryType data={{ height: '240px', mode: 'service', level: 'type', searchParams, isParentRefresh, color: '#26a0fc' }} />
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <ProjectWise data={{ searchParams, isParentRefresh }} />
                                                                </div>
                                                                <div className="col-md-4">
                                                                    <AgentWise data={{ searchParams, isParentRefresh }} />
                                                                </div>
                                                            </div>
                                                            <div className="row mt-3">
                                                                <div className="col-md-6">
                                                                    <DeptVsRole data={{ searchParams, isParentRefresh }} />
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <div className="row">
                                                                        <div className="col-md-6">
                                                                            <CustomerWise data={{ searchParams, isParentRefresh }} />
                                                                        </div>
                                                                        <div className="col-md-6">
                                                                            <LocationWise data={{ searchParams, isParentRefresh }} />
                                                                        </div>
                                                                    </div>
                                                                    <NetCsatChamp data={{ searchParams, isParentRefresh }} />
                                                                </div>
                                                            </div>
                                                            <div className="row mt-3">
                                                                <div className="col-md-7">
                                                                    <StatementWise data={{ searchParams, isParentRefresh }} />
                                                                </div>
                                                                <div className="col-md-5">
                                                                    <ChannelWise data={{ searchParams, isParentRefresh }} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="skel-informative-data">
                                                        <div className="row">
                                                            <div className="col-md-6">
                                                                <LiveOverview data={{ searchParams, isParentRefresh }} />
                                                            </div>
                                                            <div className="col-md-6">
                                                                <LivePriority data={{ searchParams, isParentRefresh }} />
                                                            </div>
                                                        </div>
                                                        <div className="row mt-3">
                                                            <div className="col-md-6">
                                                                <LiveStatus data={{ searchParams, isParentRefresh }} />
                                                            </div>
                                                            <div className="col-md-6">
                                                                <LiveType data={{ searchParams, isParentRefresh }} />
                                                            </div>
                                                        </div>
                                                        <div className="row mt-3">
                                                            <div className="col-md-6">
                                                                <LiveProjectWise data={{ searchParams, isParentRefresh }} />
                                                            </div>
                                                            <div className="col-md-6">
                                                                <LiveCustomerWise data={{ searchParams, isParentRefresh }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </InteractionDashboardContext.Provider>
    )
}

export default InteractionDashboard;