import React, { useContext, useEffect, useState, useRef } from "react";
import { AppContext, OpsDashboardContext } from "../../AppContext";
import { properties } from "../../properties";
import { get, post } from "../../common/util/restUtil";
import { Button, Modal, Dropdown } from 'react-bootstrap';
import { toast } from "react-toastify";
import moment from 'moment';
import { AssignedOperationsColumns } from "./Columns";
import DynamicTable from "../../common/table/DynamicTable";
import { history } from "../../common/util/history";

const Insights = () => {
    const { auth } = useContext(AppContext)
    const { data, handlers } = useContext(OpsDashboardContext);

    const tableRef = useRef(true);
    const [show, setShow] = useState(false);
    const [selectedInsightRecords, setSelectedInsightRecords] = useState([]);

    const handleClose = () => {
        setShow(false);
        setSelectedInsightRecords([]);
    };
    const handleShow = (resultKey, description) => {
        let results = sourceTickets.filter(x => x[resultKey] == description);
        if (results?.length) {
            setSelectedInsightRecords([...results]);
            setShow(true);
            return;
        }
        // toast.error(`No records found for the selection`)
    }

    let { masterLookupData, searchParams, meOrMyTeam, viewType } = data;
    const { setSelectedInteraction, setSelectedOrder, setSelectedEntityType, setLastDataRefreshTime, setAssignedInteractionAge, setAssignedOrderAge } = handlers;

    const insights = [
        { code: "INTXN_CATEGORY", resultKey: "oIntxnCategoryDesc", description: "Interaction Category" },
        { code: "INTXN_TYPE", resultKey: "oIntxnTypeDesc", description: "Interaction Type" },
        { code: "ORDER_CATEGORY", resultKey: "oIntxnCategoryDesc", description: "Order Category" },
        { code: "ORDER_TYPE", resultKey: "oIntxnTypeDesc", description: "Order Type" },
        { code: "PRODUCT_FAMILY", resultKey: "oServiceCategoryDesc", description: "Service Category" },
        { code: "SERVICE_TYPE", resultKey: "oServiceTypeDesc", description: "Service Type" },
        { code: "PRIORITY", resultKey: "oIntxnSeverityDesc", description: "Priority" },
        { code: "TICKET_CHANNEL", resultKey: "oIntxnChannelDesc", description: "Channel" }
    ]

    insights.map(x => x['children'] = masterLookupData[x.code])

    const [sourceTickets, setSourceTickets] = useState([]);
    const [tickets, setTickets] = useState([]);

    useEffect(() => {
        if (meOrMyTeam === "Me" && viewType === "skel-informative") {
            const intxnSearchAPI = `${properties.INTERACTION_API}/get-assigned-to-me-tickets`;
            // console.log({ searchParams, meOrMyTeam, viewType })
            let searchParamss = {
                ...searchParams,
                userId: auth?.user?.userId,
                roleId: auth?.currRoleId,
                limit: undefined,
                page: undefined
            }
            post(intxnSearchAPI, {
                "searchParams": searchParamss,
            }).then((resp) => {
                // console.log("response from insights compoen", resp);
                if (resp.data?.count) {
                    let ticketss = []
                    const uniqueRecords = [...new Map(resp.data.rows.map(item => [item['oNo'], item])).values()];
                    setSourceTickets([...uniqueRecords]);
                    insights.map(e1 => {
                        let totalCount = 0;
                        let children = [];
                        e1.children.map(e2 => {
                            let count = uniqueRecords.filter(x => x[e1.resultKey] == e2.description).length;
                            totalCount += count;
                            children.push({
                                description: e2.description,
                                colorClass: e2.mapping?.colorClass,
                                count: count
                            })
                        })
                        ticketss.push({
                            code: e1.code,
                            resultKey: e1.resultKey,
                            description: e1.description,
                            count: totalCount,
                            children: children
                        })
                    })
                    setTickets([...ticketss]);
                }
            }).catch(err => {
                console.log(err);
            })
        }
    }, [searchParams, meOrMyTeam])

    const [filters, setFilters] = useState([]);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleOpenRightModal = (ele) => {
        // console.log('ele---------->', ele)
        handleClose();
        if (ele?.oEntityType === 'Order') {
            setSelectedEntityType('Order')
            setSelectedOrder([ele]);
        } else if (ele?.oEntityType === 'Interaction') {
            setSelectedEntityType('Interaction')
            setSelectedInteraction([ele]);
        }
    }

    const fetchInteractionDetail = (intxnNo) => {
        get(`${properties.INTERACTION_API}/search?q=${intxnNo}`).then((resp) => {
            if (resp.status === 200) {
                const response = resp.data?.[0];
                const data = {
                    ...response,
                    sourceName: 'customer360'
                }
                if (response.customerUuid) {
                    sessionStorage.setItem("customerUuid", response.customerUuid)
                    sessionStorage.setItem("customerIds", response.customerId)
                }
                history.push(`${process.env.REACT_APP_BASE}/interaction360`, { data })
            } else {
                //
            }
        }).catch(error => {
            console.log(error);
        });
    }

    const redirectToRespectivePages = (response) => {
        // console.log('response-------->', response)
        let data = {
            customerUid: response?.oCustomerUuid,
            sourceName: 'customer360'
        }

        if (response?.oEntityType === 'Order') {
            data.orderNo = response?.oNo

            if (data?.customerUid) {
                sessionStorage.setItem("customerUuid", response.oCustomerUuid)
            }
            history.push(`${process.env.REACT_APP_BASE}/edit-order`, { data })
        } else if (response?.oEntityType === 'Interaction') {
            fetchInteractionDetail(data.intxnNo)
        } else {
            toast.error(`there is no specific screen for ${response?.oEntityType}`)
        }
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.id === "oIntxnStatusDesc") {
            // console.log(row.original);
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
                <Dropdown className="assigned-ops-menu skel-filter-dropdown">
                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                        <i className="material-icons">more_horiz</i>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={() => redirectToRespectivePages(row.original)}><i className="material-icons">edit</i> Edit</Dropdown.Item>
                        <Dropdown.Item onClick={() => handleOpenRightModal(row.original)}><a data-toggle="modal" data-target="#view-right-modal"><i className="material-icons">visibility</i> View</a></Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            )
        }
        else if (cell.column.id === "oCreatedAt") {
            return (<span>{moment(row.original?.oCreatedAt).fromNow()}</span>)
        }
        else if (cell.column.id === "oIntxnSeverityDesc") {
            let lookUpData = (row.original?.oEntityType == "Order") ? masterLookupData.ORDER_STATUS : masterLookupData.INTERACTION_STATUS;
            let colorClass = lookUpData?.find(x => x.description == row.original?.oIntxnSeverityDesc)?.mapping?.colorClass;
            return (
                <span className={`skel-counts-bg ${colorClass} s-c-n`}>
                    {cell.value}
                </span>
            )
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    return (
        <React.Fragment>
            <div className="row">
                {tickets.map((e1, idx1) => (
                    <div key={idx1} className="col-md-3 mb-2">
                        <div className="skel-dashboard-tiles-mr-info-base">
                            <span className="skel-header-title">{e1.description} ({e1.count})</span>
                            <hr className="cmmn-hline" />
                            <div className="skel-mr-i-sect">
                                {e1.children?.length && e1.children.map((e2, idx2) => (
                                    <div key={idx2} className="skel-mr-i-f-d" onClick={() => handleShow(e1.resultKey, e2.description)}>
                                        <span className="skel-lbl-info">{e2.description}</span>
                                        <span className={`skel-counts-bg ${e2.colorClass} s-c-n c-pointer`}>{e2.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal show={show} backdrop="static" keyboard={false} onHide={handleClose} dialogClassName="wsc-cust-mdl-temp-prev">

                <Modal.Header>
                    <button type="button" className="close mr-2" keyboard={false} onClick={handleClose}>
                        <span aria-hidden="true">×</span>
                    </button>
                </Modal.Header>
                <Modal.Body>
                    <DynamicTable
                        listKey={"Assigned"}
                        row={selectedInsightRecords}
                        rowCount={selectedInsightRecords?.length}
                        header={AssignedOperationsColumns}
                        fixedHeader={true}
                        // columnFilter={true}
                        customClassName={'table-sticky-header'}
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
        </React.Fragment>
    )
}

export default Insights;