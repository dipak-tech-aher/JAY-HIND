import { useCallback, useEffect, useRef, useState } from "react"
import PopUpView from "./PopUpView"
import { unstable_batchedUpdates } from "react-dom"
import { properties } from "../../properties"
import { slowGet, slowPut } from "../../common/util/restUtil"
import moment from "moment"
import { nanoid } from 'nanoid';
import { toast } from "react-toastify"
import Skeleton from "react-loading-skeleton"
import animationData from '../../assets/images/NotificationAllRead.json';

const NotificationView = () => {
    const [pageRefresh, setPageRefresh] = useState(false)
    const [notifications, setNotifications] = useState({
        count: 0,
        today: [],
        yesterday: [],
        rows: []
    })
    const [activeTab, setActiveTab] = useState('SELF')
    const [perPage, setPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(0)
    const mergeQueuePrevList = useRef(false)
    const hasMoreQueueList = useRef(true);
    const [isHideAllRead, setIsHideAllRead] = useState(true)

    const [isQueueListLoading, setIsQueueListLoading] = useState(false)
    const [notificationCount, setNotificationCount] = useState({
        total: 0,
        unread: 0,
        notificationSource: [],
        self: 0,
        pool: 0
    })
    const [entity, setEntity] = useState(null)
    const [lastDataRefreshTime, setLastDataRefreshTime] = useState(moment().format('DD-MM-YYYY HH:mm:ss'))
    const [isChecked, setIsChecked] = useState(false);
    const [pageRefreshTime, setPageRefreshTime] = useState(30);


    const getNotificationsCount = useCallback(() => {
        //${entity && '&entity='entity}
        slowGet(`${properties.NOTIFICATION_API}/count?category=${activeTab}&isRead=${!isHideAllRead}&type=POPUP`)
            .then(resp => {
                if (resp?.data) {
                    setNotificationCount({ ...notificationCount, ...resp.data })
                }
            }).catch((error) => {
                console.error(error)
            }).finally()
    }, [activeTab, isHideAllRead])

    const getNotifications = useCallback((id = undefined) => {
        setIsQueueListLoading(true)
        slowGet(`${properties.NOTIFICATION_API}/list?category=${activeTab}&isRead=${!isHideAllRead}&limit=${perPage}&page=${currentPage}&type=POPUP&sortBy=DATE_DESC${entity ? `&entity=${entity}` : ''}`)
            .then(resp => {
                if (resp.status === 200 && resp?.data) {
                    unstable_batchedUpdates(() => {
                        setNotifications((prevItems) => {
                            let updatedLength = prevItems?.rows ? prevItems?.rows?.length + resp?.data?.rows?.length : resp?.data?.rows?.length;
                            hasMoreQueueList.current = updatedLength < Number(resp?.data?.count) ? true : false;
                            // get Filter Notification

                            const existingCombainedArry = (prevItems?.today ? prevItems?.today?.concat(prevItems?.yesterday)?.concat(prevItems?.rows) : prevItems?.yesterday) || []
                            const existingRemoveIds = existingCombainedArry?.map((e) => e.notificationId)

                            const today = prevItems?.today ? [...prevItems?.today.filter((t) => t.notificationId !== id), ...resp.data.rows.filter((e) => moment(e.createdAt).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD') &&
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
                                pinned: resp.data?.pinned,
                                rows: rows || []
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
            })
    }, [activeTab, isHideAllRead, perPage, currentPage, entity])

    useEffect(() => {
        // if (hasMoreQueueList.current) {
        getNotifications()
        // }
    }, [activeTab, isHideAllRead, perPage, currentPage, getNotifications, entity, pageRefresh])

    useEffect(() => {
        getNotificationsCount()
    }, [activeTab, getNotificationsCount, isHideAllRead, entity, pageRefresh])

    // Auto-Refresh Interval Timer
    useEffect(() => {
        if (pageRefreshTime && typeof (pageRefreshTime) === 'number') {
            const intervalId = setInterval(() => {
                if (isChecked) {
                    // setPageRefresh(!pageRefresh)
                    getNotifications()
                    getNotificationsCount()
                    const currentTime = moment().format('DD-MM-YYYY HH:mm:ss')
                    setLastDataRefreshTime(currentTime)
                }
            }, Number(pageRefreshTime) * 60 * 1000)
            return () => clearInterval(intervalId);
        }

    }, [isChecked])

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
        slowPut(`${properties.NOTIFICATION_API}/update/status/${status ? 'unread' : 'read'}`, { notificationId })
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

        slowPut(`${properties.NOTIFICATION_API}/update/pinned/${isPinned ? 'unPin' : 'pin'}`, { notificationId })
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
        if ((((scrollHeight - Math.ceil(scrollTop)) === clientHeight)) && hasMoreQueueList.current) {
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
                rows: []
            })
            setCurrentPage(0)
            setPerPage(10)
            setEntity(null)
            mergeQueuePrevList.current = false;
            hasMoreQueueList.current = true;
        })
    }

    const handleOnClickEntity = (data) => {
        unstable_batchedUpdates(() => {
            setEntity(data)
            setNotifications({
                count: 0,
                today: [],
                yesterday: [],
                rows: []
            })
            setCurrentPage(0)
            setPerPage(10)
            mergeQueuePrevList.current = false;
            hasMoreQueueList.current = true;
        })
    }

    const handleAutoRefresh = (event) => {
        if (!pageRefreshTime) {
            toast.error("Refresh Time Is Require!");
            return
        }
        setIsChecked(event.target.checked);
    }

    const handleSetRefreshTime = (e) => {
        unstable_batchedUpdates(() => {
            setIsChecked(false)
            setPageRefreshTime(parseInt(e.target.value));
        })
    }

    const handleMarkAllAsRead = () => {
        slowPut(`${properties.NOTIFICATION_API}/update/status/read`, { category: activeTab })
            .then(({ status }) => {
                if (status === 200) {
                    getNotificationsCount();
                    setNotifications({
                        count: 0,
                        today: [],
                        yesterday: [],
                        rows: []
                    })
                }
            }).catch(error => {
                console.error(error)
            })
    }

    return (
        <>
            <div class="cnt-wrapper bg-light">
                <div class="card-skeleton">
                    <div class="bg-light">
                        <div class="mt-1">
                            <div class="row">
                                <div class="skel-configuration-settings">
                                    <div class="col-md-12 card-box">
                                        {/* Header Set */}
                                        <div class="tab-content bg-grey">
                                            <div class="tab-pane fade show active" id="me" role="tabpanel" aria-labelledby="me-tab">
                                                {/* Tools */}
                                                <div class="skle-swtab-sect">
                                                    <div class="db-list mb-0 pl-0">
                                                        <span class="skel-fr-sel-cust">
                                                            <div class={`list-dashboard skel-self ${activeTab === 'SELF' ? 'db-list-active' : ''}`} onClick={() => { handleActiveTabs('SELF') }}>
                                                                <span class="db-title">Self</span>
                                                            </div>
                                                        </span>
                                                        <span class="skel-fr-sel-serv">
                                                            <div class={`list-dashboard skel-informative ${activeTab === 'POOL' ? 'db-list-active' : ''}`} onClick={() => { handleActiveTabs('POOL') }}>
                                                                <span class="db-title">Pool</span>
                                                            </div>
                                                        </span>
                                                    </div>
                                                    <div className="form-group pr-3">
                                                        <form class="form-inline">
                                                            <span class="ml-1">Auto Refresh</span>
                                                            <div class="switchToggle ml-1">
                                                                <input type="checkbox" id="switch1" checked={isChecked} onChange={handleAutoRefresh} />
                                                                <label for="switch1">Toggle</label>
                                                            </div>
                                                            <button type="button" className="ladda-button  btn btn-secondary btn-xs ml-1" dir="ltr" data-style="slide-left" onClick={() => { setPageRefresh(!pageRefresh); setLastDataRefreshTime(moment().format('DD-MM-YYYY HH:mm:ss')) }}>
                                                                <span className="ladda-label"><i className="material-icons">refresh</i>
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
                                                        <span style={{ fontSize: '12px', paddingLeft: '90px' }}>Last Refreshed : {lastDataRefreshTime}</span>
                                                    </div>
                                                </div>
                                                {/* Header */}
                                                <div class="col-12 row">
                                                    <div class="col-6">
                                                        <div class="tabbable ">
                                                            <ul class="nav nav-tabs" id="myTab" role="tablist">
                                                                <li class="nav-item" onClick={() => { handleOnClickEntity(null) }}>
                                                                    <span class="nav-link active " id={nanoid()} data-toggle="tab" role="tab" aria-controls="BC" aria-selected="true">All
                                                                        <span class="badge badge-primary border ml-2  mb-1 pt-1 rounded font-12 font-weight-normal">{activeTab === 'SELF' ? notificationCount?.self || 0 : activeTab === 'POOL' ? notificationCount?.pool || 0 : 0}</span>
                                                                    </span>
                                                                </li>
                                                                {console.log('notificationCount?.notificationSource-------->', notificationCount?.notificationSource)}
                                                                {notificationCount?.notificationSource?.length > 0 && notificationCount?.notificationSource.map((s, i) => {
                                                                    return (
                                                                        <li class="nav-item" onClick={() => { handleOnClickEntity(s?.source?.code) }}>
                                                                            <span class="nav-link cursor-pointer" id={`key` + i} name={s?.source?.code} data-toggle="tab" role="tab" aria-controls="UBC" aria-selected="false">{s?.source?.description || 'Others'}
                                                                                <span class="badge badge-primary border ml-2  mb-1 pt-1 rounded font-12 font-weight-normal">{s?.count || 0}</span></span>
                                                                        </li>
                                                                    )
                                                                })}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                    <div class="col-3 ">
                                                        {
                                                            ((activeTab === 'SELF' && notificationCount?.self > 10) ||
                                                                (activeTab === 'POOL' && notificationCount?.pool > 10)) && isHideAllRead &&
                                                            <div class="pull-right mt-2 cursor-pointer" onClick={() => { handleMarkAllAsRead() }}>
                                                                <span class="badge badge-light font-14 p-1">Mark all as read</span>
                                                            </div>}
                                                    </div>
                                                    <div className="col-3">
                                                        <div className="pull-right custom-control custom-switch">
                                                            <input type="checkbox" className="custom-control-input" checked={isHideAllRead} name='sameAsCustomerAddres' id="sameAsCustomerAddres" onChange={() => { handleOnChangeHideAllRead() }} />
                                                            <label className="custom-control-label mt-1 font-weight-normal" htmlFor="sameAsCustomerAddres">Show only unread</label>
                                                        </div>
                                                    </div>
                                                    {/* <div class="switchToggle ml-1">
                                                        <input type="checkbox" id="switch1" checked={isChecked} onChange={handleAutoRefresh} />
                                                        <label for="switch1">Toggle</label>
                                                    </div> */}

                                                </div>
                                                {<> <PopUpView
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
                                                    {isQueueListLoading && <Skeleton count={5} />}</>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>


            </div >
            {/* </div> */}
            {/* 
                </div>
            </div> */}
        </>
    )
}
export default NotificationView