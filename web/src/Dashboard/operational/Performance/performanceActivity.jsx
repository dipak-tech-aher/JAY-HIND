/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useContext, useEffect, useState } from "react";
import Slider from "react-slick";
import Performance from "./Performance";
import FilterComponent from "../../components/FilterComponent";
import { OpsDashboardContext, AppContext } from "../../../AppContext";
import moment from "moment";
import { properties } from "../../../properties";
import { post } from "../../../common/util/restUtil";
import { unstable_batchedUpdates } from "react-dom";

const PerformanceActivity = (props) => {
    const { auth } = useContext(AppContext)
    const [isRefresh, setIsRefresh] = useState(false);
    const [filtering, setFiltering] = useState(false);
    const [searchParams, setSearchParams] = useState({
        entityName: "all",
        userId: auth?.user?.userId,
        roleId: auth?.currRoleId,
        fromDate: moment().startOf('month').format("YYYY-MM-DD"),
        toDate: moment().endOf('month').format("YYYY-MM-DD")
    });
    // const [showFilter, setShowFilter] = useState(false)
    // const [entityType, setEntityType] = useState('')
    const [handlerDetails, setHandlerDetails] = useState([{
        oEntityName: "Helpdesk",
        oTotalCnt: 0
    }, {
        oEntityName: "Appointment",
        oTotalCnt: 0
    }, {
        oEntityName: "Order",
        oTotalCnt: 0
    }, {
        oEntityName: "chat",
        oTotalCnt: 0
    }, {
        oEntityName: "Interaction",
        oTotalCnt: 0
    }])
    const { data, handlers } = useContext(OpsDashboardContext);
    const { meOrMyTeam, lastDataRefreshTime, currentTime, searchParams: globalSearchParams } = data;
    const { setLastDataRefreshTime, setCurrentTime } = handlers;
    const [interactions, setInteractions] = useState([])


    // const performanceActivitySettings = {
    //     dots: false,
    //     infinite: true,
    //     arrows: true,
    //     speed: 500,
    //     slidesToShow: 1,
    //     slidesToScroll: 1,
    //     initialSlide: 0,
    //     autoplay: true,
    //     autoplaySpeed: 5000,
    //     responsive: [
    //         {
    //             breakpoint: 1024,
    //             settings: {
    //                 slidesToShow: 1,
    //                 slidesToScroll: 1,
    //                 infinite: true,
    //                 dots: false
    //             }
    //         },
    //         {
    //             breakpoint: 600,
    //             settings: {
    //                 slidesToShow: 1,
    //                 slidesToScroll: 1,
    //                 initialSlide: 1
    //             }
    //         },
    //         {
    //             breakpoint: 480,
    //             settings: {
    //                 slidesToShow: 1,
    //                 slidesToScroll: 1
    //             }
    //         }
    //     ]
    // };

    const getinformativeDetails = useCallback(() => {
        const intxnHandlingAPI = `${properties.INTERACTION_API}/${meOrMyTeam === 'Me' ? 'get-infomative-details' : 'get-team-infomative-details'}`
        let searchParamss = {
            ...searchParams,
        }

        post(intxnHandlingAPI, {
            "searchParams": searchParamss,
        }).then((res) => {
            if (res?.data) {
                const rows = res?.data?.rows.length > 0 ? res?.data?.rows : []
                setHandlerDetails(rows)
            }
        }).catch((error) => {
            console.log(error)

        }).finally(() => {
        })
    }, [meOrMyTeam, searchParams])

    useEffect(() => {
        // console.log(globalSearchParams, "from assign to me component")
        setSearchParams({
            ...searchParams,
            ...globalSearchParams
        });
    }, [globalSearchParams])

    const fetchData = useCallback(() => {
        const intxnSearchAPI = `${properties.INTERACTION_API}/get-assigned-to-me-tickets`;
        let searchParamss = {
            ...searchParams,
        }
        post(intxnSearchAPI, {
            "searchParams": searchParamss,
        }).then((resp) => {
            if (resp.data) {
                unstable_batchedUpdates(() => {
                    let count = resp?.data?.count;
                    let rows = resp?.data?.rows;
                    if (count > 0) {
                        const uniqueRecords = [...new Map(rows.map(item => [item['oNo'], item])).values()];
                        const statusGroupedOrders = groupBy(uniqueRecords, 'oIntxnStatusDesc');
                        let keys = [], orders = [], interactions = []
                        for (let e in statusGroupedOrders) {
                            const o = statusGroupedOrders[e].filter((r) => r.oEntityType === "Order")
                            const i = statusGroupedOrders[e].filter((n) => n.oEntityType === "Interaction")
                            keys.push(e)
                            orders.push(o.length)
                            interactions.push(i.length)
                        }
                        setInteractions([{ keys, orders, interactions }]);
                    } else {
                        setInteractions([]);
                    }
                    setCurrentTime(moment().format('DD-MM-YYYY HH:mm:ss'))
                    setLastDataRefreshTime({ ...lastDataRefreshTime, performanceActivity: moment().format('DD-MM-YYYY HH:mm:ss') })
                })
            }
        }).catch((error)=>{
            console.log(error)
        }).finally(() => {
            setFiltering(false);
        })
    }, [meOrMyTeam, searchParams])

    useEffect(() => {
        fetchData()
        getinformativeDetails()
    }, [isRefresh, meOrMyTeam, getinformativeDetails, fetchData, searchParams]);

    useEffect(() => {
        if (filtering) {
            fetchData()
            getinformativeDetails()
        }
    }, [fetchData, filtering, getinformativeDetails, searchParams])


    const groupBy = (items, key) => items.reduce(
        (result, item) => ({
            ...result,
            [item[key]]: [
                ...(result[item[key]] || []),
                item,
            ],
        }),
        {},
    );

    const [lastUpdatedAt, setLastUpdatedAt] = useState(moment());

    useEffect(() => {
        const interval = setInterval(() => setLastUpdatedAt(moment(lastDataRefreshTime?.performanceActivity, "DD-MM-YYYY HH:mm:ss")), 60 * 1000);
        return () => clearInterval(interval);
    }, [lastDataRefreshTime]);

    return (
        <div className="cmmn-skeleton">
            <div className="skel-dashboard-title-base">
                <span className="skel-header-title">Assigned Interaction</span>
                <div className="skel-dashboards-icons">
                    {/* <a><i className="material-icons">fullscreen</i></a> */}
                    <a><i className="material-icons" onClick={() => setIsRefresh(!isRefresh)}>refresh</i></a>
                    <FilterComponent
                        data={{
                            filtering
                        }}
                        handlers={{
                            setSearchParams,
                            setFiltering
                        }}
                    />
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-perf-sect">
                <div className="skel-perf-data j-center">
                    {/* <Slider {...performanceActivitySettings}> */}

                    {
                        handlerDetails.map((val, idx) => {
                            return (
                                <div className="card">
                                    <div className="skel-avg-perf" id={idx}>
                                        <span>{val?.oEntityName}</span>
                                        <span className="skel-txt-bold">{val?.oTotalCnt || 0}</span>
                                    </div>
                                </div>
                            )
                        })
                    }
                    {/* <div className="skel-avg-perf">
                        <span>Appointment</span>
                        <span className="skel-txt-bold">{0}</span>
                    </div>
                    <div className="skel-avg-perf">
                        <span>Orders</span>
                        <span className="skel-txt-bold">30%</span>
                    </div>
                    <div className="skel-avg-perf">
                        <span>chat</span>
                        <span className="skel-txt-bold">40%</span>
                    </div>
                    <div className="skel-avg-perf">
                        <span>Interaction</span>
                        <span className="skel-txt-bold">50%</span>
                    </div> */}
                    {/* <div className="skel-avg-perf">
                        <span>Pending Appointments</span>
                        <span className="skel-txt-bold">60%</span>
                    </div> */}
                    {/* </Slider> */}
                </div>
                <div className="skel-perf-graph">
                    {interactions.length > 0 && <Performance
                        data={{
                            chartData: interactions
                        }}
                    />}
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-refresh-info">
                <span><i className="material-icons">refresh</i> Updated {moment(lastUpdatedAt).fromNow()}</span>
            </div>
        </div>
    )
}

export default PerformanceActivity;