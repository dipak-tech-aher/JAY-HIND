/* eslint-disable jsx-a11y/anchor-is-valid */
import moment from "moment";
import React, { useContext, useEffect, useState } from "react";
import { unstable_batchedUpdates } from "react-dom";
import ReactSelect from "react-select";
import { AppContext, OpsDashboardContext } from "../../../AppContext";
import { post } from "../../../common/util/restUtil";
import { properties } from "../../../properties";
import FilterComponent from "../../components/FilterComponent";
import Chart from "../Chart";
import {isEmpty} from 'lodash'

const OrderHistory = (props) => {
    const { auth } = useContext(AppContext)
    // const [allIds, setAllIds] = useState([])
    const [isRefresh, setIsRefresh] = useState(false);
    const { data, handlers } = useContext(OpsDashboardContext);
    const { meOrMyTeam, lastDataRefreshTime, currentTime, searchParams: globalSearchParams, isPageRefresh } = data;
    const { setLastDataRefreshTime, setCurrentTime } = handlers;
    const [filtering, setFiltering] = useState(false);
    const [orders, setOrders] = useState([]);
    const [searchParams, setSearchParams] = useState({
        userId: auth?.user?.userId,
        // roleId: auth?.currRoleId,
        // fromDate: moment().startOf('month').format("YYYY-MM-DD"),
        // toDate: moment().endOf('month').format("YYYY-MM-DD")
    });
    const [showFilter, setShowFilter] = useState(false)
    const [entityType, setEntityType] = useState('orderTypeDesc')
    const [intxnKpi, setIntxnKpi] = useState({
        oUserDesc: '',
        oTotalHandlingTime: 0,
        oavgHandlingTime: 0,
        oIntxnCnt: 0
    })
    const [lastUpdatedAt, setLastUpdatedAt] = useState(moment());

    const entityTypes = [{
        label: "Status",
        value: "orderStatusDesc"
    }, {
        label: "Service Type",
        value: "serviceTypeDesc"
    }, {
        label: 'Order Category',
        value: "orderCategoryDesc"
    }, {
        label: 'Order Type',
        value: "orderTypeDesc"
    },{
        label: 'Order Source',
        value: 'orderSourceDesc'
    },{
        label: 'Order Channel',
        value: 'orderChannelDesc'
    },{
        label: 'Order Priority',
        value: 'orderPriorityDesc'
    },{
        label: 'Order Family',
        value: 'orderFamilyDesc'
    }]

    const orderSearchAPI = `${properties.ORDER_API}/${meOrMyTeam === 'Me' ? 'order-history-graph' : 'order-history-graph-team'}`;
    const fetchData = async (currentPage, perPage) => {
        let searchParamss = {
            ...searchParams,
            "limit": perPage,
            "page": currentPage
        }
        post(orderSearchAPI, {
            "searchParams": searchParamss,
        }).then((resp) => {
            if (resp?.data) {
                unstable_batchedUpdates(() => {
                    let count = resp?.data?.count;
                    let rows = resp?.data?.rows;
                    if (count) {
                        const uniqueRecords = [...new Map(rows.map(item => [item['orderNo'], item])).values()];
                        const statusGroupedOrders = groupBy(uniqueRecords, entityType);
                        // const allIds = uniqueRecords.map(ele => ele?.oOrderId).filter(Boolean);
                        // setAllIds(allIds);
                        // console.log('entityType', entityType)
                        // console.log('statusGroupedInteraction', statusGroupedOrders)
                        // let groupedOrdersDetails = []
                        // for (var key in statusGroupedOrders) {
                        //     if (statusGroupedOrders.hasOwnProperty(key)) {
                        //         groupedOrdersDetails.push({
                        //             name: key,
                        //             value: statusGroupedOrders[key].length
                        //         })

                        //     }
                        // }

                        const xAxisData = []
                        const yAxisData = []
                         for (var key in statusGroupedOrders) {
                            if (statusGroupedOrders.hasOwnProperty(key)) {
                               // console.log('key', key)
                                xAxisData.push(key)
                                yAxisData.push(statusGroupedOrders[key].length)
                                // groupedInteractionCount.push({
                                //     name: key,
                                //     value: statusGroupedInteraction[key].length
                                // })

                            }
                        }

                        setOrders([{xAxisData, yAxisData}]);

                    } else {
                        setOrders([]);
                        // setAllIds([]);
                    }
                    // setCurrentTime(moment().format('DD-MM-YYYY HH:mm:ss'))
                   
                })
            }
            unstable_batchedUpdates(()=>{
                if (meOrMyTeam === 'Me') {
                    setLastDataRefreshTime({ ...lastDataRefreshTime, orderHistory: moment().format('DD-MM-YYYY HH:mm:ss') })
                } else {    
                    setLastDataRefreshTime({ ...lastDataRefreshTime, orderHistoryTeam: moment().format('DD-MM-YYYY HH:mm:ss') })
                }
            })
        }).catch((error)=>{
            console.log(error)
        }).finally(() => {
            setFiltering(false);
        })
    };

    useEffect(() => {
        fetchData();
        fetchIntxnKPI()
    }, [isRefresh, meOrMyTeam, entityType, isPageRefresh]);

    useEffect(() => {
        if (filtering) {
            fetchData()
            fetchIntxnKPI()
        }
    }, [filtering])


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

    const fetchIntxnKPI = () => {
        const intxnHandlingAPI = `${properties.ORDER_API}/${meOrMyTeam === 'Me' ? 'get-handling-time' : 'get-team-handling-time'}`
        let searchParamss = {
            ...searchParams,
        }

        post(intxnHandlingAPI, {
            "searchParams": searchParamss,
        }).then((res) => {
            if (res?.data) {
                const rows = res?.data?.rows.length > 0 ? res?.data?.rows[0] : {}
                setIntxnKpi(rows)
            }
        }).catch((error) => {
            console.log(error)
        }).finally(() => {

        })
    }
// console.log('lastUpdatedAt', lastUpdatedAt)
// console.log('lastDataRefreshTime', lastDataRefreshTime)

    useEffect(() => {
        const interval = setInterval(() => setLastUpdatedAt(moment(meOrMyTeam === 'Me' ? lastDataRefreshTime?.orderHistory : lastDataRefreshTime?.orderHistoryTeam, "DD-MM-YYYY HH:mm:ss")), 60 * 1000);
        return () => clearInterval(interval);
    }, [lastDataRefreshTime]);

    return (
        <div className="cmmn-skeleton">
            <div className="skel-dashboard-title-base">
                <span className="skel-header-title">Order Corner</span>
                <ReactSelect
                    className="skel-cust-graph-select skel-z-index-s1"
                    options={entityTypes}

                    menuPortalTarget={document.body} 
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    
                    value={entityType ? entityTypes.find(c => c.value === entityType) : null}
                    onChange={(val) => setEntityType(val.value)}
                />
                <div className="skel-dashboards-icons">
                    {/* <a><i className="material-icons" onClick={() => { setShowFilter(!showFilter) }}>filter</i></a> */}
                    
                    {/* <a ><i className="material-icons">fullscreen</i></a> */}
                   
                    <a ><i className="material-icons" onClick={() => setIsRefresh(!isRefresh)}>refresh</i></a>
                    {/* <FilterComponent
                        data={{
                            filtering
                        }}
                        handlers={{
                            setSearchParams,
                            setFiltering
                        }}
                    /> */}
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-perf-sect">
                <div className="skel-perf-data">
                    {/* <div className="card" style={{ width: "15em" }}>
                            <div className="card-body">
                                <h5 className="skel-header-title">Total Handling Time</h5>
                                <p className="text-center">{((
                                    intxnKpi?.oTotalHandlingTime
                                        ? intxnKpi?.oTotalHandlingTime < 0
                                            ? 0
                                            : intxnKpi?.oTotalHandlingTime
                                        : 0) * 60).toFixed(2)} min</p>
                            </div>
                        </div>
                        <div className="card" style={{ width: "15em" }}>
                            <div className="card-body">
                                <h5 className="skel-header-title">Avg Handling Time</h5>
                                <p className="text-center">{((
                                    intxnKpi?.oavgHandlingTime
                                        ? intxnKpi?.oavgHandlingTime < 0
                                            ? 0
                                            : intxnKpi?.oavgHandlingTime
                                        : 0) * 60).toFixed(2)} min</p>
                            </div>
                        </div>
                        <div className="card" style={{ width: "15em" }}>
                            <div className="card-body">
                                <h5 className="skel-header-title">Count</h5>
                                <p className="text-center">{(intxnKpi?.oIntxnCnt || 0).toFixed(2)} min</p>
                            </div>
                        </div> */}
                    <div className="card" style={{ padding: '10px', margin: '10px', height: '100px', width: '160px' }}>
                        <div className="skel-avg-perf">
                            <span>Total Handling Time</span>
                            <span className="skel-txt-bold">{ intxnKpi?.oTotalHandlingTime && !isEmpty(intxnKpi?.oTotalHandlingTime)
                                    ? intxnKpi?.oTotalHandlingTime
                                    : '0 min'}</span>
                        </div>
                    </div>
                    <div className="card" style={{ padding: '10px', margin: '10px', height: '100px', width: '160px' }}>
                        <div className="skel-avg-perf">
                            <span>Avg Handling Time</span>
                            <span className="skel-txt-bold">{
                                intxnKpi?.oAvgHandlingTime && !isEmpty(intxnKpi?.oAvgHandlingTime) 
                                ? intxnKpi?.oAvgHandlingTime 
                                : '0 min'}</span>
                        </div>
                    </div>
                    <div className="card" style={{ padding: '10px', margin: '10px', height: '100px', width: '160px' }}>
                        <div className="skel-avg-perf">
                            <span>Count</span>
                            <span className="skel-txt-bold">{(intxnKpi?.oOrderCnt || 0)}</span>
                        </div>
                    </div>
                </div>
                <div className="skel-perf-graph">
                     <Chart
                        data={{
                            chartData: orders
                        }}
                    />
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-refresh-info">
            <span><i className="material-icons">refresh</i> Updated {moment(lastUpdatedAt).fromNow()}</span>
            </div>
        </div>
    )
}

export default OrderHistory;