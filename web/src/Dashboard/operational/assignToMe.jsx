/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useContext, useState, useRef } from "react";
import { post } from "../../common/util/restUtil";
import { AppContext, OpsDashboardContext } from '../../AppContext';
import { unstable_batchedUpdates } from 'react-dom';
import { history } from "../../common/util/history";
import { properties } from "../../properties";
import FilterComponent from "../components/FilterComponent";
import moment from 'moment';
import { Dropdown, Badge } from 'react-bootstrap';
import DynamicTable from "../../common/table/DynamicTable";
import { AssignedOperationsColumns } from "./Columns";
import { toast } from "react-toastify";
// import EquiSvg from "../../assets/images/ops/equi.svg"
// import SuccessCalSvg from "../../assets/images/ops/success-cal.svg"
// import WarnCalSvg from "../../assets/images/ops/warn-cal.svg"
// import DangerCalSvg from "../../assets/images/ops/danger-cal.svg"
import ColumnFilterComponent from "../components/ColumnFilterComponent";
import DashboardOverview from "./components/InteractionOverview";
import { statusConstantCode } from "../../AppConstants";

const AssignToMe = (props) => {
    const { appsConfig } = props?.data
    // console.log("hii  from assign to me")
    const { auth, appConfig } = useContext(AppContext)
    const [isRefresh, setIsRefresh] = useState(false);
    const [allIds, setAllIds] = useState([])
    const { data, handlers } = useContext(OpsDashboardContext);
    const { meOrMyTeam, viewType, pageRefreshTime, masterLookupData, lastDataRefreshTime, searchParams: globalSearchParams, assignedInteractionAge, assignedOrderAge, assignedRequestAge, isPageRefresh } = data;
    const { setSelectedInteraction, setSelectedOrder, setSelectedEntityType, setLastDataRefreshTime, setSearchParams: setGlobalSearchParams, setAssignedInteractionAge, setAssignedOrderAge, setIsPageRefresh } = handlers;

    const redirectToRespectivePages = (response) => {
        // console.log('response-------->', response)
        let data = {
            customerUid: response?.oCustomerUuid,
            sourceName: 'customer360'
        }

        if (response?.oEntityType === 'Order') {
            data.orderNo = response?.oNo
            data.childOrderId = response?.oChildOrderNo

            if (data?.customerUid) {
                sessionStorage.setItem("customerUuid", response.oCustomerUuid)
            }
            history.push(`${process.env.REACT_APP_BASE}/order360`, { data })
        } else if (response?.oEntityType === 'Interaction') {
            data.intxnNo = response?.oNo

            if (data?.customerUid) {
                sessionStorage.setItem("customerUuid", response.oCustomerUuid)
            }
            history.push(`${process.env.REACT_APP_BASE}/interaction360`, { data })
        } else {
            toast.error(`there is no specific screen for ${response?.oEntityType}`)
        }
    }

    const [lastUpdatedAt, setLastUpdatedAt] = useState(moment());

    useEffect(() => {
        const interval = setInterval(() => setLastUpdatedAt(moment(lastDataRefreshTime.assignedToMe, "DD-MM-YYYY HH:mm:ss")), 60 * 1000);
        return () => clearInterval(interval);
    }, [lastDataRefreshTime]);

    const handleOpenRightModal = (ele) => {
        // console.log('ele---------->', ele)
        if (ele?.oEntityType === 'Order') {
            setSelectedEntityType('Order')
            setSelectedOrder([ele]);
        } else if (ele?.oEntityType === 'Interaction') {
            setSelectedEntityType('Interaction')
            setSelectedInteraction([ele]);
        }
    }

    const [interactions, setInteractions] = useState([])
    const tableRef = useRef(true);
    const hasExternalSearch = useRef(false);
    const [columns, setColumns] = useState(AssignedOperationsColumns);
    const [filters, setFilters] = useState([]);
    const [filtering, setFiltering] = useState(false);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [searchParams, setSearchParams] = useState({
        userId: auth?.user?.userId,
        roleId: auth?.currRoleId,
        entityType: 'all',
        departmentId: auth?.currDeptId
    });
    const intxnSearchAPI = `${properties.INTERACTION_API}/get-assigned-to-me-tickets`;

    useEffect(() => {
        // console.log(globalSearchParams, "from assign to me component")
        setSearchParams({
            ...searchParams,
            ...globalSearchParams
        });
    }, [globalSearchParams])

    const fetchData = async (currentPage, perPage) => {
        // console.log(searchParams, "============== assigntome ===================");
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
                    if (count > 0) {
                        const uniqueRecords = [...new Map(rows.map(item => [item['oNo'], item])).values()];
                        const allIds = uniqueRecords.map(ele => ele?.oNo).filter(Boolean);

                        //grouping interaction based on age
                        // const orderList = uniqueRecords.filter((e) => e.oEntityType === "Order")
                        // const InteractionList = uniqueRecords.filter((e) => e.oEntityType === "Interaction")
                        // const interactionGrouped = groupbyDate(InteractionList)
                        // const orderGrouped = groupbyDate(orderList)
                        // setAssignedInteractionAge({ ...assignedInteractionAge, ...interactionGrouped })
                        // setAssignedOrderAge({ ...assignedOrderAge, ...orderGrouped })
                        setTotalCount(count);
                        setInteractions([...uniqueRecords]);
                        setAllIds(allIds);
                    } else {
                        setTotalCount(0);
                        setInteractions([]);
                        setAllIds([])
                    }
                    setLastDataRefreshTime({ ...lastDataRefreshTime, assignedToMe: moment().format('DD-MM-YYYY HH:mm:ss') })
                })
            }
        }).catch((error) => {
            console.log(error)
        }).finally(() => {
            setFiltering(false);
        })
    };

    useEffect(() => {
        fetchData(currentPage, perPage);
    }, [meOrMyTeam, isRefresh, currentPage, perPage, searchParams, isPageRefresh]);

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

    // console.log({ masterLookupData })
    const handleCellRender = (cell, row) => {
        if (cell.column.id === "oIntxnSeverityDesc") {
            let lookUpData = (row.original?.oEntityType == "Order") ? masterLookupData.ORDER_STATUS : masterLookupData.INTERACTION_STATUS;
            let colorClass = lookUpData?.find(x => x.description == row.original?.oIntxnSeverityDesc)?.mapping?.colorClass;
            return (
                <span className={colorClass}>
                    {cell.value}
                </span>
            )
        }
        else if (cell.column.id === "oIntxnStatusDesc") {
            let lookUpData = (row.original?.oEntityType == "Order") ? masterLookupData.ORDER_STATUS : masterLookupData.INTERACTION_STATUS;
            let colorClass = lookUpData?.find(x => x.description == row.original?.oIntxnStatusDesc)?.mapping?.colorClass;
            return (
                <span className={colorClass}>
                    {cell.value}
                </span>
            )
        }
        else if (cell.column.id === "oNo-Action") {
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

    const groupbyDate = (payload) => {
        let threeDays = 0; let fiveDays = 0; let morethan = 0
        payload.forEach((ele) => {
            const dateDiff = parseInt((moment() - moment(ele?.oCreatedAt)) / (1000 * 60 * 60 * 24), 10)
            if (dateDiff <= 3) {
                threeDays += 1
            } else if (dateDiff > 3 && dateDiff <= 5) {
                fiveDays += 1
            } else {
                morethan += 1
            }
        })
        return { threeDays, fiveDays, morethan, total: payload.length }
    }

    const capitalizeFirstLetter = (string) => {
        return string?.charAt(0)?.toUpperCase() + string?.slice(1);
    }

    const [selectedEntity, setSelectedEntity] = useState(null);

    const updateSearchParams = (entityType, startDate, endDate, filterDesc) => {
        console.log({ entityType, startDate, endDate })
        setSearchParams({
            ...searchParams,
            entityType: entityType,
            fromDate: endDate,
            toDate: startDate
        })
    }

    const clearSearchParam = () => {
        setSelectedEntity(null);
        setSearchParams({
            ...searchParams,
            entityType: 'all',
            fromDate: undefined,
            toDate: undefined
        })
    }

    return (
        <div className="cmmn-skeleton">
            <div className="skel-dashboard-title-base">
                <span className="skel-header-title">Assigned To {meOrMyTeam} ({totalCount})</span>
                <div className="skel-dashboards-icons">
                    <a><i className="material-icons" onClick={() => setIsRefresh(!isRefresh)}>refresh</i></a>
                    <FilterComponent
                        data={{
                            filtering,
                            componentName: 'SELF'
                        }}
                        handlers={{
                            setSearchParams,
                            setFiltering
                        }}
                    />
                    <ColumnFilterComponent
                        data={{
                            sourceColumns: AssignedOperationsColumns
                        }}
                        handlers={{
                            setColumns
                        }}
                    />
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="row mb-2">
                {appsConfig?.clientConfig?.operational_dashboard?.interactiveView?.assignedToMe?.interactionOverview && <DashboardOverview
                    data={
                        {
                            assignedAge: assignedInteractionAge,
                            type: 'Interaction'
                        }
                    }
                    handler={
                        {
                            setSelectedEntity,
                            updateSearchParams
                        }
                    }
                />}
                {!!!(statusConstantCode?.bussinessSetup.includes(appConfig?.businessSetup?.[0])) && appsConfig?.clientConfig?.operational_dashboard?.interactiveView?.assignedToMe?.orderOverview && <DashboardOverview
                    data={
                        {
                            assignedAge: assignedOrderAge,
                            type: 'Order'
                        }
                    }
                    handler={
                        {
                            setSelectedEntity,
                            updateSearchParams
                        }
                    }
                />}
                {appsConfig?.clientConfig?.operational_dashboard?.interactiveView?.assignedToMe?.requestOverview && <DashboardOverview
                    data={
                        {
                            assignedAge: assignedRequestAge,
                            type: 'Request'
                        }
                    }
                    handler={
                        {
                            setSelectedEntity,
                            updateSearchParams
                        }
                    }
                />}
                {/* <div className="col-lg-6 col-md-12 col-xs-12">
                    <div className="skel-dashboard-tiles">
                        <span className="skel-header-title">Interaction Overview</span>
                        <div className="skel-tile-sect">
                            <div className="skel-tile-info" onClick={() => {
                                setSelectedEntity(`Interaction - All`);
                                updateSearchParams("Interaction", undefined, undefined, "All")
                            }}>
                                <div className="skel-tile-icon skel-tile-b-color">
                                    <img src={EquiSvg} />
                                </div>
                                <div className="skel-tile-data">
                                    <p>Total Interaction</p>
                                    <span>{assignedInteractionAge?.interactionTotal || 0}</span>
                                </div>
                            </div>
                            <div className="skel-tile-info" onClick={() => {
                                setSelectedEntity(`Interaction - 0 to 3 Days`);
                                updateSearchParams("Interaction", todayDate, thirdDate, "0 to 3 Days")
                            }}>
                                <div className="skel-tile-icon skel-tile-g-color">
                                    <img src={SuccessCalSvg} />
                                </div>
                                <div className="skel-tile-data">
                                    <p>0 to 3 Days</p>
                                    <span>{assignedInteractionAge?.interactionThreeDays || 0}</span>
                                </div>
                            </div>
                        </div>
                        <div className="skel-tile-sect">
                            <div className="skel-tile-info" onClick={() => {
                                setSelectedEntity(`Interaction - 3 to 5 Days`);
                                updateSearchParams("Interaction", thirdDate, fifthDate, "3 to 5 Days")
                            }}>
                                <div className="skel-tile-icon skel-tile-y-color">
                                    <img src={WarnCalSvg} />
                                </div>
                                <div className="skel-tile-data">
                                    <p>3 to 5 Days</p>
                                    <span>{assignedInteractionAge?.interactionFiveDays || 0}</span>
                                </div>
                            </div>
                            <div className="skel-tile-info" onClick={() => {
                                setSelectedEntity(`Interaction - More than 5 Days`);
                                updateSearchParams("Interaction", fifthDate, undefined, "More than 5 Days")
                            }}>
                                <div className="skel-tile-icon skel-tile-r-color">
                                    <img src={DangerCalSvg} />
                                </div>
                                <div className="skel-tile-data">
                                    <p>&gt; 5 Days</p>
                                    <span>{assignedInteractionAge?.interactionMorethan || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <div className="col-lg-6 col-md-12 col-xs-12">
                    <div className="skel-dashboard-tiles">
                        <span className="skel-header-title">Order Overview</span>
                        <div className="skel-tile-sect">
                            <div className="skel-tile-info" onClick={() => {
                                setSelectedEntity(`Order - All`);
                                updateSearchParams("order", undefined, undefined, "all")
                            }}>
                                <div className="skel-tile-icon skel-tile-b-color">
                                    <img src={EquiSvg} />
                                </div>
                                <div className="skel-tile-data">
                                    <p>Total Order</p>
                                    <span>{assignedInteractionAge?.orderTotal || 0}</span>
                                </div>
                            </div>
                            <div className="skel-tile-info" onClick={() => {
                                setSelectedEntity(`Order - 0 to 3 Days`);
                                updateSearchParams("order", undefined, thirdDate, "0 to 3 Days")
                            }}>
                                <div className="skel-tile-icon skel-tile-g-color">
                                    <img src={SuccessCalSvg} />
                                </div>
                                <div className="skel-tile-data">
                                    <p>0 to 3 days</p>
                                    <span>{assignedInteractionAge?.orderThreeDays || 0}</span>
                                </div>
                            </div>
                            <div className="skel-tile-info" onClick={() => {
                                setSelectedEntity(`Order - 3 to 5 Days`);
                                updateSearchParams("order", thirdDate, fifthDate, "3 to 5 Days")
                            }}>
                                <div className="skel-tile-icon skel-tile-y-color">
                                    <img src={WarnCalSvg} />
                                </div>
                                <div className="skel-tile-data">
                                    <p>3 to 5 days</p>
                                    <span>{assignedInteractionAge?.orderFiveDays || 0}</span>
                                </div>
                            </div>
                            <div className="skel-tile-info" onClick={() => {
                                setSelectedEntity(`Order - More than 5 Days`);
                                updateSearchParams("order", fifthDate, undefined, "More than 5 Days")
                            }}>
                                <div className="skel-tile-icon skel-tile-r-color">
                                    <img src={DangerCalSvg} />
                                </div>
                                <div className="skel-tile-data">
                                    <p>&gt; 5 days</p>
                                    <span>{assignedInteractionAge?.orderMorethan || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div> */}
            </div>
            <div className="skel-dashboard-data" >
                {selectedEntity && (
                    <Badge pill bg="secondary filter-pills">
                        {selectedEntity} <span onClick={clearSearchParam} className="c-pointer filter-pills-close ml-1">x</span>
                    </Badge>
                )}
                <DynamicTable
                    listKey={"Assigned Operations"}
                    row={interactions}
                    rowCount={totalCount}
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
                <span></span>
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

export default AssignToMe;