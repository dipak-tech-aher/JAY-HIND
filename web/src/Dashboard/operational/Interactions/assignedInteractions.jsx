import React, { useEffect, useContext, useState, useRef } from "react";
import { properties } from "../../../properties";
import { post, put } from "../../../common/util/restUtil";
import { AppContext, OpsDashboardContext } from '../../../AppContext';
import { history } from '../../../common/util/history';
import { unstable_batchedUpdates } from 'react-dom';
import FilterComponent from "../../components/FilterComponent";
import moment from 'moment';
import { Dropdown } from 'react-bootstrap';
import DynamicTable from "../../../common/table/DynamicTable";
import { AssignedInteractionsColumns, PooledInteractionsColumns } from "../Columns";
import ColumnFilterComponent from "../../components/ColumnFilterComponent";
import { toast } from 'react-toastify'
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'

const AssignInteractions = (props) => {
    const { isFullScreen } = props?.data
    const { setIsFullScreen, setScreenType } = props?.handlers
    const type = props.data?.type
    const { auth } = useContext(AppContext)
    const [allIds, setAllIds] = useState([])
    const [isRefresh, setIsRefresh] = useState(false);

    const { data, handlers } = useContext(OpsDashboardContext);
    const { meOrMyTeam, pageRefreshTime, masterLookupData, lastDataRefreshTime, currentTime, searchParams: globalSearchParams, isPageRefresh } = data;
    const { setSelectedInteraction, setSelectedEntityType, setLastDataRefreshTime, setCurrentTime, setIsPageRefresh } = handlers;

    const redirectToRespectivePages = (response) => {
        // console.log('response-------->', response)
        const data = {
            intxnNo: response?.oIntxnNo,
            customerUid: response?.oCustomerUuid,
            sourceName: 'customer360'
        }
        if (response?.oCustomerUuid) {
            sessionStorage.setItem("customerUuid", response.oCustomerUuid)
        }
        history.push(`${process.env.REACT_APP_BASE}/interaction360`, { data })
    }

    const handleOpenRightModal = (ele) => {
        setSelectedInteraction([ele]);
        setSelectedEntityType('Interaction')
    }

    const [lastUpdatedAt, setLastUpdatedAt] = useState(moment());

    useEffect(() => {
        const interval = setInterval(() => setLastUpdatedAt(moment(meOrMyTeam === 'Me' ? lastDataRefreshTime?.assignedInteraction : lastDataRefreshTime?.assignedToTeamInteraction, "DD-MM-YYYY HH:mm:ss")), 60 * 1000);
        return () => clearInterval(interval);
    }, [lastDataRefreshTime]);

    const [assignedInteractions, setAssignedInteractions] = useState([])
    const [pooledInteractions, setPooledInteractions] = useState([])
    const tableRef = useRef(true);
    const hasExternalSearch = useRef(false);
    const [filtering, setFiltering] = useState(false);
    const [filters, setFilters] = useState([]);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [listSearch, setListSearch] = useState([]);
    const [totalAssignedCount, setTotalAssignedCount] = useState(0);
    const [totalPooledCount, setTotalPooledCount] = useState(0);
    const [searchParams, setSearchParams] = useState({
        userId: auth?.user?.userId,
        roleId: auth?.currRoleId,
        departmentId: auth?.currDeptId
    });

    const handleFullScreen = () => {
        setScreenType(type);
        setIsFullScreen(!isFullScreen);
    }

    const intxnSearchAPI = `${properties.INTERACTION_API}/${meOrMyTeam === 'Me' ? 'get-assigned-interactions' : 'get-team-assigned-interactions'}`;
    const pooledIntxnSearchAPI = `${properties.INTERACTION_API}/${meOrMyTeam === 'Me' ? 'get-pooled-interactions' : 'get-team-pooled-interactions'}`;

    useEffect(() => {
        // console.log(globalSearchParams, "from assign to me component")
        setSearchParams({
            ...searchParams,
            ...globalSearchParams
        });
    }, [globalSearchParams])

    const fetchData = async (currentPage, perPage) => {
        let searchParamss = {
            ...searchParams,
            "limit": perPage,
            "page": currentPage
        }
        post(intxnSearchAPI, {
            "searchParams": searchParamss,
        }).then((resp) => {
            if (resp.data) {
                unstable_batchedUpdates(() => {
                    let count = resp?.data?.count;
                    let rows = resp?.data?.rows;
                    if (count) {
                        const uniqueRecords = [...new Map(rows.map(item => [item['oIntxnNo'], item])).values()];
                        const allIds = uniqueRecords.map(ele => ele?.oIntxnNo).filter(Boolean);
                        setTotalAssignedCount(count)
                        setAssignedInteractions([...uniqueRecords]);
                        setAllIds(allIds);
                    } else {
                        setTotalAssignedCount(0)
                        setAssignedInteractions([])
                        setAllIds([])
                    }
                    setCurrentTime(moment().format('DD-MM-YYYY HH:mm:ss'))
                    if (meOrMyTeam === 'Me') {
                        setLastDataRefreshTime({ ...lastDataRefreshTime, assignedInteraction: moment().format('DD-MM-YYYY HH:mm:ss') })
                    } else {
                        setLastDataRefreshTime({ ...lastDataRefreshTime, assignedToTeamInteraction: moment().format('DD-MM-YYYY HH:mm:ss') })
                    }
                })
            }
        }).catch((error) => {
            console.log(error)
        }).finally(() => {
            setFiltering(false);
        })

        post(pooledIntxnSearchAPI, {
            "searchParams": searchParamss,
        }).then((resp) => {
            if (resp.data) {
                unstable_batchedUpdates(() => {
                    let count = resp?.data?.count;
                    let rows = resp?.data?.rows;
                    if (count) {
                        const uniqueRecords = [...new Map(rows.map(item => [item['oIntxnNo'], item])).values()];
                        const allIds = uniqueRecords.map(ele => ele?.oIntxnNo).filter(Boolean);
                        setTotalPooledCount(count);
                        setPooledInteractions([...uniqueRecords]);
                        setAllIds(allIds);
                    } else {
                        setTotalPooledCount(0)
                        setPooledInteractions([])
                        setAllIds([])
                    }
                    setCurrentTime(moment().format('DD-MM-YYYY HH:mm:ss'))
                    if (meOrMyTeam === 'Me') {
                        setLastDataRefreshTime({ ...lastDataRefreshTime, assignedInteraction: moment().format('DD-MM-YYYY HH:mm:ss') })
                    } else {
                        setLastDataRefreshTime({ ...lastDataRefreshTime, assignedToTeamInteraction: moment().format('DD-MM-YYYY HH:mm:ss') })
                    }
                })
            }
        }).catch((error) => {
            console.log(error)
        }).finally(() => {
            setFiltering(false);
        })
    };

    Array.prototype.insert = function (index, ...items) {
        this.splice(index, 0, ...items);
    };

    const [columns, setColumns] = useState(AssignedInteractionsColumns);

    useEffect(() => {
        /**  Bug ID - IS_ID_166, IS_ID_167  - Added type in "if" condition */
        if (meOrMyTeam !== "MyTeam" && type !== 'ASSIGNED') {
            let filteredColumns = AssignedInteractionsColumns.filter(x => x.id !== 'oCurrUserDesc')
            setColumns([...filteredColumns]);
        }
    }, [meOrMyTeam]);

    useEffect(() => {
        fetchData(currentPage, perPage);
    }, [currentPage, perPage, isRefresh, meOrMyTeam, searchParams, isPageRefresh]);

    useEffect(() => {
        if (filtering) {
            setCurrentPage(0);
            setPerPage(10);
            fetchData(0, 10);
        }
    }, [filtering])

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const assignToSelf = (data) => {
        // console.log('data ', data)
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className="alert">
                        <fieldset className="scheduler-border1">
                            <h4 className="alert__title">Would you like to assign the interaction ?</h4>
                            <div className="d-flex justify-content-center">

                                <button onClick={onClose} type="button" className="skel-btn-cancel">Cancel</button>
                                <button onClick={
                                    () => {
                                        if (data) {
                                            put(`${properties.INTERACTION_API}/assignSelf/${data.oIntxnNo}`, {
                                                type: 'SELF'
                                            }).then((res) => {
                                                if (res.status === 200) {
                                                    toast.success("Interaction assigned to self")
                                                    setIsRefresh(true)
                                                    setIsPageRefresh(true)
                                                }
                                            }).catch((error) => {
                                                console.log(error)
                                            })
                                        }
                                        onClose();
                                    }
                                } type="button" className="skel-btn-submit" >Yes</button>
                            </div>
                        </fieldset>
                    </div>
                );
            }
        });

    }

    const handleCellRender = (cell, row) => {
        if (cell.column.id === "oIntxnSeverityDesc") {
            let colorClass = masterLookupData.INTERACTION_STATUS?.find(x => x.description == row.original?.oIntxnSeverityDesc)?.mapping?.colorClass;
            return (
                <span className={colorClass}>
                    {cell.value}
                </span>
            )
        }
        else if (cell.column.id === "oIntxnStatusDesc") {
            let colorClass = masterLookupData.INTERACTION_STATUS?.find(x => x.description == row.original?.oIntxnStatusDesc)?.mapping?.colorClass;
            return (
                <span className={colorClass}>
                    {row.original?.oIntxnStatusDesc}
                </span>
            )
        }
        else if (cell.column.id === "oIntxnNo-Action") {
            return (
                // <Dropdown className="assigned-ops-menu skel-filter-dropdown">
                //     <Dropdown.Toggle variant="success" id="dropdown-basic">
                //         <i className="material-icons">more_horiz</i>
                //     </Dropdown.Toggle>
                //     <Dropdown.Menu>
                //         <Dropdown.Item onClick={() => redirectToRespectivePages(row.original)}><i className="material-icons">edit</i> Edit</Dropdown.Item>
                //         <Dropdown.Item onClick={() => handleOpenRightModal(row.original)}><a data-toggle="modal" data-target="#view-right-modal"><i className="material-icons">visibility</i> View</a></Dropdown.Item>
                //     </Dropdown.Menu>
                // </Dropdown>
                <>
                    <div className="skel-action-btn">
                        <div onClick={() => assignToSelf(row.original)} className="action-edit"><i className="material-icons">trending_flat</i></div>
                        <div onClick={() => redirectToRespectivePages(row.original)} className="action-edit"><i className="material-icons">edit</i></div>
                        <div onClick={() => handleOpenRightModal(row.original)} className="action-view" data-toggle="modal" data-target="#view-right-modal"><a><i className="material-icons">visibility</i></a></div>
                    </div>
                </>
            )
        }
        else if (cell.column.id === "oCreatedAt") {
            return (<span>{moment(row.original?.oCreatedAt).fromNow()}</span>)
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    return (
        <div className="cmmn-skeleton">
            <div className="skel-dashboard-title-base">
                <span className="skel-header-title">{type === 'POOLED' ? 'Pooled' : 'Assigned'} Interactions ({type === 'POOLED' ? totalPooledCount : totalAssignedCount})</span>
                <div className="skel-dashboards-icons skel-max-sect">
                    <a>
                        <i className="material-icons" onClick={() => handleFullScreen()}>
                            {isFullScreen ? 'fullscreen_exit' : 'fullscreen'}
                        </i>
                    </a>
                    <a ><i className="material-icons" onClick={() => setIsRefresh(!isRefresh)}>refresh</i></a>
                    <FilterComponent
                        data={{
                            filtering,
                            componentName: 'INTERACTIONS'
                        }}
                        handlers={{
                            setSearchParams,
                            setFiltering
                        }}
                    />
                    <ColumnFilterComponent
                        data={{
                            type: type,
                            sourceColumns: type === 'POOLED' ? PooledInteractionsColumns : AssignedInteractionsColumns
                        }}
                        handlers={{
                            setColumns
                        }}
                    />
                </div>
            </div>
            <hr className="cmmn-hline" />
            {/* <div className="skel-dashboard-data"> */}
            <div className="">
                <DynamicTable
                    listSearch={listSearch}
                    listKey={"Assigned Interactions"}
                    row={type === 'POOLED' ? pooledInteractions : assignedInteractions}
                    rowCount={type === 'POOLED' ? totalPooledCount : totalAssignedCount}
                    header={columns}
                    fixedHeader={true}
                    // columnFilter={true}
                    customClassName={'table-sticky-header'}
                    itemsPerPage={perPage}
                    isScroll={false}
                    backendPaging={true}
                    isTableFirstRender={tableRef}
                    hasExternalSearch={hasExternalSearch}
                    backendCurrentPage={currentPage}
                    url={intxnSearchAPI + `?limit=${perPage}&page=${currentPage}`}
                    method='POST'
                    handler={{
                        handleCellRender: handleCellRender,
                        handlePageSelect: handlePageSelect,
                        handleItemPerPage: setPerPage,
                        handleCurrentPage: setCurrentPage,
                        handleFilters: setFilters
                    }}
                />
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-refresh-info">
                <span><i className="material-icons">refresh</i> Updated {moment(lastUpdatedAt).fromNow()}</span>
                <div className="skel-data-records">
                    <div className="skel-img-circle">
                        <span className="skel-data-img">
                            <img src="./assets/images/banner2.jpg" alt="" className="img-fluid" />
                        </span>
                        <span className="skel-data-img">
                            <img src="./assets/images/banner2.jpg" alt="" className="img-fluid" />
                        </span>
                        <span className="skel-data-img">
                            <img src="./assets/images/banner2.jpg" alt="" className="img-fluid" />
                        </span>
                        <span className="skel-data-img">
                            <img src="./assets/images/banner2.jpg" alt="" className="img-fluid" />
                        </span>
                        <span className="skel-data-img">
                            <img src="./assets/images/banner2.jpg" alt="" className="img-fluid" />
                        </span>
                        <span className="skel-data-img">
                            <img src="./assets/images/banner2.jpg" alt="" className="img-fluid" />
                        </span>
                        <span className="skel-data-img">
                            <img src="./assets/images/banner2.jpg" alt="" className="img-fluid" />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AssignInteractions;


