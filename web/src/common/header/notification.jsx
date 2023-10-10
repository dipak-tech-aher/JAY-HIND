import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { put, slowGet, slowPut } from "../../common/util/restUtil";
import { properties } from "../../properties";
import useDropDownArea from "./useDropDownArea";

import moment from "moment";
import { unstable_batchedUpdates } from "react-dom";
import Skeleton from "react-loading-skeleton";
import { Link } from 'react-router-dom';
import PopUpView from "../../Administration/Notification/PopUpView";
import animationData from '../../assets/images/NotificationAllRead.json';
import { AppContext } from '../../AppContext'

const Notification = (props) => {
    const [pageRefresh, setPageRefresh] = useState(false)
    const [display, setDisplay] = useDropDownArea('switchNotification')
    const [notifications, setNotifications] = useState({
        count: 0,
        today: [],
        yesterday: [],
        rows: [],
        pinned: []
    })
    //New States
    const [isHideAllRead, setIsHideAllRead] = useState(true)
    const [activeTab, setActiveTab] = useState('SELF')
    const [perPage, setPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(0)
    const mergeQueuePrevList = useRef(false)
    const hasMoreQueueList = useRef(true);
    let { auth } = useContext(AppContext)

    const [isQueueListLoading, setIsQueueListLoading] = useState(false)
    const [notificationCount, setNotificationCount] = useState({
        total: 0,
        unread: 0,
        notificationSource: [],
        self: 0,
        pool: 0
    })

    const getNotificationsCount = useCallback(() => {
        slowGet(`${properties.NOTIFICATION_API}/count?category=${activeTab}&isRead=${!isHideAllRead}&type=POPUP`)
            .then(resp => {
                if (resp?.data) {
                    setNotificationCount({ ...notificationCount, ...resp.data })
                }
            }).catch((error) => {
                console.error(error)
            }).finally()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, isHideAllRead, auth])

    const getNotifications = useCallback((id = undefined) => {
        setIsQueueListLoading(true)
        slowGet(`${properties.NOTIFICATION_API}/list?category=${activeTab}&isRead=${!isHideAllRead}&limit=${perPage}&page=${currentPage}&type=POPUP&sortBy=DATE_DESC`)
            .then(resp => {
                if (resp.status === 200 && resp?.data) {
                    unstable_batchedUpdates(() => {
                        setNotifications((prevItems) => {
                            if (resp?.data?.count === 0) {
                                return {
                                    count: 0,
                                    today: [],
                                    yesterday: [],
                                    rows: [],
                                    pinned: []
                                }
                            }
                            let updatedLength = prevItems?.rows ? prevItems?.rows?.length + resp?.data?.rows?.length : resp?.data?.rows?.length;
                            hasMoreQueueList.current = updatedLength < Number(resp?.data?.count) ? true : false;
                            // get Filter Notification

                            const existingCombainedArry = (prevItems?.today ? prevItems?.today?.concat(prevItems?.yesterday)?.concat(prevItems?.rows) : prevItems?.yesterday) || []
                            const existingRemoveIds = existingCombainedArry?.map((e) => e.notificationId)

                            const today = prevItems?.today ? [...prevItems?.today?.filter((t) => t.notificationId !== id), ...resp.data.rows.filter((e) => moment(e.createdAt).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD') &&
                                !existingRemoveIds.includes(e.notificationId))]
                                : resp.data.rows.filter((e) => moment(e.createdAt).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD') &&
                                    !existingRemoveIds.includes(e.notificationId))


                            const yesterday = prevItems?.yesterday ? [...prevItems?.yesterday.filter((t) => t.notificationId !== id), ...resp.data.rows.filter((e) => moment(e.createdAt).format('YYYY-MM-DD') === moment().subtract(1, 'days').format('YYYY-MM-DD') &&
                                !existingRemoveIds.includes(e.notificationId))]
                                : resp.data.rows.filter((e) => moment(e.createdAt).format('YYYY-MM-DD') === moment().subtract(1, 'days').format('YYYY-MM-DD') &&
                                    !existingRemoveIds.includes(e.notificationId))
                            const combainedArry = today.concat(yesterday)
                            const removeIds = combainedArry.map((e) => e.notificationId)

                            const rows = prevItems?.rows ? [...prevItems?.rows.filter((t) => t.notificationId !== id), ...resp.data.rows.filter((e) => !removeIds.includes(e.notificationId) && !existingRemoveIds.includes(e.notificationId))]
                                : resp.data.rows.filter((e) => !removeIds.includes(e.notificationId))
                            return {
                                count: resp.data?.count,
                                today: today || [],
                                yesterday: yesterday || [],
                                rows: rows || [],
                                pinned: resp.data?.pinned || [],
                            }
                            // rows: prevItems?.rows ? [...prevItems?.rows, ...resp?.data?.rows] : resp?.data?.rows
                        })
                        setIsQueueListLoading(false);
                    })
                }
                mergeQueuePrevList.current = false;
            })
            .catch(error => {
                console.error(error)
            }).finally()
    }, [activeTab, isHideAllRead, perPage, currentPage, auth])

    useEffect(() => {
        // if (hasMoreQueueList.current) {
        getNotifications()
        // }
    }, [activeTab, isHideAllRead, perPage, currentPage, getNotifications, pageRefresh, auth])

    useEffect(() => {
        getNotificationsCount()
    }, [activeTab, getNotificationsCount, isHideAllRead, pageRefresh, auth])

    /** Hide All Read onchange function */
    const handleOnChangeHideAllRead = () => {
        setIsHideAllRead(!isHideAllRead)
        setNotifications({
            count: 0,
            today: [],
            yesterday: [],
            rows: [],
            pinned: []
        })
        setCurrentPage(0)
        setPerPage(10)
        mergeQueuePrevList.current = false;
    }

    const handleMarkAsReadAndUnRead = (status, notificationId) => {
        if (status === undefined) {
            console.warn('Please provice notification Status')
            return
        }
        put(`${properties.NOTIFICATION_API}/update/status/${status ? 'unread' : 'read'}`, { notificationId })
            .then(({ status }) => {
                if (status === 200) {
                    getNotificationsCount();
                    getNotifications(notificationId)
                }
            }).catch(error => {
                console.error(error)
            })
    }

    const handleisPinned = (isPinned, notificationId) => {
        if (isPinned === undefined) {
            console.warn('Please provice notification Status')
            return
        }

        put(`${properties.NOTIFICATION_API}/update/pinned/${isPinned ? 'unPin' : 'pin'}`, { notificationId })
            .then(({ status }) => {
                if (status === 200) {
                    getNotificationsCount();
                    getNotifications(!!!isPinned && notificationId)
                }
            }).catch(error => {
                console.error(error)
            })
    }

    const handleOnScroll = (e) => {
        const { scrollHeight, scrollTop, clientHeight } = e.target
        if ((((scrollHeight - Math.ceil(scrollTop)) + 1 === clientHeight)) && hasMoreQueueList.current) {
            mergeQueuePrevList.current = true;
            setCurrentPage(Number(currentPage) + 1);
        }
    }

    const handleActiveTabs = (info) => {
        unstable_batchedUpdates(() => {
            setActiveTab(info)
            setNotifications({
                count: 0,
                today: [],
                yesterday: [],
                rows: [],
                pinned: []
            })
            setCurrentPage(0)
            setPerPage(10)
            mergeQueuePrevList.current = false;
            hasMoreQueueList.current = true;
        })
    }

    const handleMarkAllAsRead = () => {
        put(`${properties.NOTIFICATION_API}/update/status/read`, { category: activeTab })
            .then(({ status }) => {
                if (status === 200) {
                    getNotificationsCount();
                    setNotifications({
                        count: 0,
                        today: [],
                        yesterday: [],
                        rows: [],
                        pinned: []
                    })
                }
            }).catch(error => {
                console.error(error)
            })
    }

    return (
        <>
            <li className={`dropdown notification-list topbar-dropdown ${display && "show"}`} id="switchNotification">
                <span className="nav-link dropdown-toggle waves-effect waves-light" onClick={() => { setDisplay(!display); setPageRefresh(!pageRefresh) }}>
                    <i className="fe-bell noti-icon mt-1 ml-2"></i>
                    {
                        <span className="badge badge-danger rounded-circle noti-icon-badge">{(notificationCount?.self + notificationCount?.pool) ? (notificationCount?.self + notificationCount?.pool) <= 99 ? (notificationCount?.self + notificationCount?.pool) : `99+` : 0}</span>

                    }
                </span>

                <div className={`dropdown-menu dropdown-menu-right notification-menu dropdown-lg noti-large bg-light p-1 shadow2 ${display && "show"}`}>
                    <div className="row px-2 py-2">
                        <div className="col-6 d-flex">
                            <span><h5>Notification</h5></span>
                            {/* <span className ="badge badge-primary font-14 ml-2 h24 mt-1 py-1 font-weight-normal">12</span> */}
                        </div>
                        <div className="col-6">
                            <div id="sameAsCustomerAddress" className="pull-right custom-control custom-switch">
                                <input type="checkbox" className="custom-control-input" checked={isHideAllRead} id="acccountsameSwitch" onClick={() => { handleOnChangeHideAllRead() }} />
                                <label className="custom-control-label mt-1 font-weight-normal" htmlFor="acccountsameSwitch">Show only unread</label>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white radius8">
                        <div className="row">

                            <div className="col-12 tabbable px-3 pt-2">
                                {/* <div className="tabbable pt-2 px-2"> */}
                                <ul className="nav nav-tabs" id="myTab" role="tablist">
                                    <li className="nav-item" onClick={() => { handleActiveTabs('SELF') }}>
                                        <span className={`nav-link ${activeTab === 'SELF' ? 'active' : ''}`} id="BC-tab" /*data-toggle="tab"*/
                                            role="tab" aria-controls="BC"
                                            aria-selected="true">Self<span
                                                className="badge badge-primary border ml-2  mb-1 pt-1 rounded font-12 font-weight-normal">{notificationCount?.self ? notificationCount?.self : 0}
                                            </span></span>
                                    </li>
                                    <li className="nav-item" onClick={() => { handleActiveTabs('POOL') }}>
                                        <span className={`nav-link ${activeTab === 'POOL' ? 'active' : ''}`} id="UBC-tab" /*data-toggle="tab"*/
                                            role="tab" aria-controls="UBC"
                                            aria-selected="false" >Pool<span
                                                className="badge badge-primary border ml-2  mb-1 pt-1 rounded font-12 font-weight-normal">{notificationCount?.pool ? notificationCount?.pool : 0}
                                            </span></span>
                                    </li>
                                    <li className="col-6 pull-right cursor-pointer" onClick={() => { handleMarkAllAsRead() }}><span>Mark all as read</span></li>
                                </ul>
                            </div>

                        </div>
                        <div className="tab-content">
                            {activeTab === 'SELF' && <div className={`tab-pane fade ${activeTab === 'SELF' && 'show active'}`} id="BC" role="tabpanel" aria-labelledby="BC-tab">
                                <React.Fragment>
                                    <PopUpView
                                        data={{
                                            notifications,
                                            isQueueListLoading,
                                            pageRefresh,
                                            animationData
                                        }}
                                        handler={{
                                            handleMarkAsReadAndUnRead,
                                            handleisPinned,
                                            handleOnScroll,
                                            getNotifications,
                                            getNotificationsCount
                                        }}
                                    />
                                    {isQueueListLoading && <div> <Skeleton count={5} /></div>}
                                </React.Fragment>
                            </div>
                            }
                            {activeTab === 'POOL' && <div className={`tab-pane fade ${activeTab === 'POOL' && 'show active'}`} id="UBC" role="tabpanel" aria-labelledby="BC-tab">
                                <React.Fragment>
                                    <PopUpView
                                        data={{
                                            notifications,
                                            isQueueListLoading,
                                            pageRefresh,
                                            animationData
                                        }}
                                        handler={{
                                            handleMarkAsReadAndUnRead,
                                            handleisPinned,
                                            handleOnScroll,
                                            setPageRefresh,
                                            getNotifications,
                                            getNotificationsCount
                                        }}
                                    />
                                    {isQueueListLoading && <Skeleton count={5} />}
                                </React.Fragment>
                            </div>}
                        </div>
                    </div>
                    <Link className="dropdown-item text-center text-primary notify-item notify-all" to={`${process.env.REACT_APP_BASE}/notification`} onClick={() => { setDisplay(!display) }}>
                        View all<i className="fe-arrow-right"></i>
                    </Link>

                </div>
            </li>
        </>
    );
};

export default Notification;



