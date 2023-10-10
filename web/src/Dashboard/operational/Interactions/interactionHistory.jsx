/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext, useEffect, useState, useRef } from "react";
import Chart from "../Chart";
import FilterComponent from "../../components/FilterComponent";
import { OpsDashboardContext, AppContext } from "../../../AppContext";
import { properties } from "../../../properties";
import { post } from "../../../common/util/restUtil";
import { unstable_batchedUpdates } from "react-dom";
import moment from "moment";
import ReactSelect from "react-select";
import { isEmpty } from 'lodash'
import DynamicTable from "../../../common/table/DynamicTable";
import { InteractionHistoryColumns } from '../Columns'
import { Modal } from 'react-bootstrap';
const modalStyle = {
    'width': '94%',
    'top': '19%',
    'left': '3%',
    'paddingLeft': '2px'
}
const entityTypes = [{
    label: "Status",
    value: "currStatusDesc"
}, {
    label: "Service Category",
    value: "categoryDescription"
}, {
    label: 'Interaction Category',
    value: "intxnCategoryDesc"
}, {
    label: 'Interaction Type',
    value: "intxnTypeDesc"
}, {
    label: 'Request Statement',
    value: 'requestStatement'
}, {
    label: 'Channel',
    value: 'channelDesc'
}, {
    label: 'Service Type',
    value: 'serviceTypeDesc'
}, {
    label: 'Priority',
    value: 'priorityDesc'
}]


const InteractionHistory = (props) => {
    const { auth } = useContext(AppContext)
    // const [allIds, setAllIds] = useState([])
    const [isRefresh, setIsRefresh] = useState(false);
    const { data, handlers } = useContext(OpsDashboardContext);
    const { meOrMyTeam, lastDataRefreshTime, currentTime, searchParams: globalSearchParams, isPageRefresh } = data;
    const { setLastDataRefreshTime, setCurrentTime } = handlers;
    const [filtering, setFiltering] = useState(false);
    const [searchParams, setSearchParams] = useState({
        userId: auth?.user?.userId,
        //    roleId: auth?.currRoleId,
        // fromDate: moment().startOf('month').format("YYYY-MM-DD"),
        // toDate: moment().endOf('month').format("YYYY-MM-DD")
    });
    const [interactions, setInteractions] = useState([])
    const [intxnKpi, setIntxnKpi] = useState({
        oUserDesc: '',
        oTotalHandlingTime: 0,
        oavgHandlingTime: 0,
        oIntxnCnt: 0
    })

    // const [showFilter, setShowFilter] = useState(false)
    const [entityType, setEntityType] = useState('intxnCategoryDesc')
    const [show, setShow] = useState(false);
    const tableRef = useRef(true);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [countData, setCountData] = useState([]);

    /** The function is for grouping object based on "Key"
     * @param {object} items 
     * @param {string} key 
     * @returns {object}
     */
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

    useEffect(() => {
        // console.log(globalSearchParams, "from assign to me component")
        setSearchParams({
            ...searchParams,
            ...globalSearchParams
        });
    }, [globalSearchParams])

    const fetchData = async () => {
        const intxnSearchAPI = `${properties.INTERACTION_API}/${meOrMyTeam === 'Me' ? 'interaction-history-graph' : 'interaction-history-graph-team'}`
        let searchParamss = {
            ...searchParams,
        }
        if (meOrMyTeam === 'Me') {
            if (searchParamss?.departmentId) {
                delete searchParamss?.departmentId
            }
            if (searchParamss?.roleId) {
                delete searchParamss?.roleId
            }
        }
        post(intxnSearchAPI, {
            "searchParams": searchParamss,
        }).then((resp) => {
            if (resp?.data) {
                unstable_batchedUpdates(() => {
                    let count = resp?.data?.count;
                    let rows = resp?.data?.rows;
                    if (count) {
                        const uniqueRecords = [...new Map(rows.map(item => [item['intxnNo'], item])).values()];
                        const statusGroupedInteraction = groupBy(uniqueRecords, entityType);
                        const xAxisData = []
                        const yAxisData = []
                        for (var key in statusGroupedInteraction) {
                            if (statusGroupedInteraction.hasOwnProperty(key)) {
                                xAxisData.push(key)
                                yAxisData.push(statusGroupedInteraction[key].length)
                            }
                        }

                        setInteractions([{ xAxisData, yAxisData }]);
                    } else {
                        setInteractions([])
                    }
                })
            } else {
                setInteractions([])
            }
            unstable_batchedUpdates(() => {
                if (meOrMyTeam === 'Me') {
                    setLastDataRefreshTime({ ...lastDataRefreshTime, interactionHistory: moment().format('DD-MM-YYYY HH:mm:ss') })
                } else {
                    setLastDataRefreshTime({ ...lastDataRefreshTime, interactionHistoryTeam: moment().format('DD-MM-YYYY HH:mm:ss') })
                }
            })
        }).catch((error) => {
            console.log(error)
        }).finally(() => {
            setFiltering(false);
        })
    };

    const fetchIntxnKPI = () => {
        const intxnHandlingAPI = `${properties.INTERACTION_API}/${meOrMyTeam === 'Me' ? 'get-handling-time' : 'get-team-handling-time'}`
        let searchParamss = {
            ...searchParams,
        }
        if (meOrMyTeam === 'Me') {
            if (searchParamss?.departmentId) {
                delete searchParamss?.departmentId
            }
            if (searchParamss?.roleId) {
                delete searchParamss?.roleId
            }
        }
        post(intxnHandlingAPI, {
            "searchParams": searchParamss,
        }).then((res) => {
            if (res?.data) {
                setCountData(res?.data?.rows)
                const rows = res?.data?.rows.length > 0 ? res?.data?.rows[0] : {}
                setIntxnKpi(rows)
            }
        }).catch((error) => {
            console.log(error)
        }).finally(() => {

        })
    }

    useEffect(() => {
        fetchData();
        fetchIntxnKPI()
    }, [isRefresh, meOrMyTeam, entityType, searchParams, isPageRefresh]);

    useEffect(() => {
        if (filtering) {
            fetchData();
            fetchIntxnKPI()
        }
    }, [filtering])

    const [lastUpdatedAt, setLastUpdatedAt] = useState(moment());

    useEffect(() => {
        const interval = setInterval(() => setLastUpdatedAt(moment(meOrMyTeam === 'Me' ? lastDataRefreshTime?.interactionHistory : lastDataRefreshTime?.interactionHistoryTeam, "DD-MM-YYYY HH:mm:ss")), 60 * 1000);
        return () => clearInterval(interval);
    }, [lastDataRefreshTime]);

    const showDetail = () => {
        setShow(true);
    }

    const handleClose = () => {
        setShow(false);
    };

    const handleCellRender = (cell, row) => {
        if (cell.column.id === "oCreatedAt") {
            return (<span>
                {moment(cell.value).format('YYYY-MM-DD')}
            </span>)
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    return (
        <div className="cmmn-skeleton">
            <div className="skel-dashboard-title-base">
                <span className="skel-header-title">Interactions Corner</span>
                <ReactSelect
                    className="skel-cust-graph-select"
                    placeholder="Search..."
                    options={entityTypes}

                    menuPortalTarget={document.body}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                    value={entityType ? entityTypes.find(c => c.value === entityType) : null}
                    onChange={(val) => setEntityType(val.value)}
                />
                <div className="skel-dashboards-icons">
                    {/* <a><i className="material-icons" onClick={() => { setShowFilter(!showFilter) }}>filter</i></a> */}
                    {/* <a ><i className="material-icons">fullscreen</i></a> */}
                    {/* <a ><i className="material-icons"></i></a> */}
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
                    {/* <div className="card" style={{ width: "10em" }}>
                            <div className="card-body">
                                <span className="skel-header-title">Total Handling Time</span>
                                <p className="text-center">{((
                                    intxnKpi?.oTotalHandlingTime
                                        ? intxnKpi?.oTotalHandlingTime < 0
                                            ? 0
                                            : intxnKpi?.oTotalHandlingTime
                                        : 0) * 60).toFixed(2)} min</p>
                            </div>
                        </div>
                        <div className="card" style={{ width: "10em" }}>
                            <div className="card-body">
                                <span className="skel-header-title">Avg Handling Time</span>
                                <p className="text-center">{((
                                    intxnKpi?.oavgHandlingTime
                                        ? intxnKpi?.oavgHandlingTime < 0
                                            ? 0
                                            : intxnKpi?.oavgHandlingTime
                                        : 0) * 60).toFixed(2)} min</p>
                            </div>
                        </div>
                        <div className="card" style={{ width: "10em" }}>
                            <div className="card-body">
                                <span className="skel-header-title">Count</span>
                                <p className="text-center">{(intxnKpi?.oIntxnCnt || 0).toFixed(2)} min</p>
                            </div>
                        </div> */}
                    <div className="card" style={{ padding: '10px', margin: '10px', height: '100px', width: '160px' }}>
                        <div className="skel-avg-perf">
                            <span>Total Handling Time</span>
                            <span className="skel-txt-bold">{
                                intxnKpi?.oTotalHandlingTime && !isEmpty(intxnKpi?.oTotalHandlingTime)
                                    ? intxnKpi?.oTotalHandlingTime
                                    : '0 min'} </span>
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
                            <span>Count</span>{console.log('intxnKpi--------->', intxnKpi)}
                            <span className="skel-txt-bold" onClick={() => showDetail()}>{(intxnKpi?.oIntxnCnt || 0)}</span>
                        </div>
                    </div>
                </div>

                <div className="skel-perf-graph">
                    <Chart
                        data={{
                            chartData: interactions
                        }}
                    />
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-refresh-info">
                <span><i className="material-icons">refresh</i> Updated {moment(lastUpdatedAt).fromNow()}</span>
            </div>
            <Modal show={show} backdrop="static" keyboard={false} onHide={handleClose} style={modalStyle}>
                <Modal.Header>
                    <b>Interaction History Details</b>
                    <button type="button" className="close mr-2" keyboard={false} onClick={handleClose}>
                        <span aria-hidden="true">×</span>
                    </button>
                </Modal.Header>
                <Modal.Body>
                    {console.log('countData----->', countData)}
                    <DynamicTable
                        listKey={"Interaction History"}
                        row={countData}
                        rowCount={countData?.length}
                        header={InteractionHistoryColumns}
                        fixedHeader={true}
                        // columnFilter={true}
                        itemsPerPage={perPage}
                        isScroll={true}
                        isTableFirstRender={tableRef}
                        backendCurrentPage={currentPage}
                        handler={{
                            handleCellRender: handleCellRender,
                            handlePageSelect: handlePageSelect,
                            handleItemPerPage: setPerPage,
                            handleCurrentPage: setCurrentPage,
                            handleFilters: setFilters
                        }}
                    />
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default InteractionHistory;