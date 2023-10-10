import React, { useEffect, useState, useRef } from 'react';
import { properties } from "../../../properties";
import { post } from "../../../common/util/restUtil";
import { Modal } from 'react-bootstrap';
import DynamicTable from "../../../common/table/DynamicTable";
import { ProjectWiseColumns } from "../Columns";

import moment from 'moment'
import Chart from './Chart';

const SupportTicketsPending = (props) => {
    const { searchParams, isParentRefresh, modalStyle } = props?.data;
    const { handleOpenRightModal } = props?.handlers;
    const [agentWiseData, setProjectWiseData] = useState([]);
    const [pendingTktsCounts, setPendingTktsCounts] = useState([]);
    const [filteredPendingTktsData, setFilteredPendingTktsData] = useState([]);
    const [isRefresh, setIsRefresh] = useState(false);
    const [show, setShow] = useState(false);
    const tableRef = useRef(true);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);

    useEffect(() => {
        post(properties.HELPDESK_API + '/support-tkt-pending', searchParams)
            .then((response) => {
                setProjectWiseData(response?.data?.rows);
                const pendingTktsCounts = {};
                response?.data?.rows?.forEach(item => {
                    // pendingTktsCounts.code = item?.project
                    const description = item?.projectDesc?.description ?? null;
                    if (pendingTktsCounts[description]) {
                        pendingTktsCounts[description]++;
                    } else {
                        pendingTktsCounts[description] = 1;
                    }
                });
                console.log('pendingTktsCounts------->', pendingTktsCounts)
                setPendingTktsCounts(pendingTktsCounts)
            })
            .catch(error => {
                console.error(error);
            });
    }, [isRefresh, searchParams, isParentRefresh])

    const getProjectCode = (desc) => {
        return agentWiseData?.find(x => x?.projectDesc?.description === desc)?.projectDesc?.code;
    }

    const showDetails = (projectName) => {
        projectName = projectName ? projectName : null;
        const filteredPendingTktsData = agentWiseData?.filter((item) => item?.project == projectName);
        console.log('filteredPendingTktsData------>', filteredPendingTktsData)
        setFilteredPendingTktsData(filteredPendingTktsData)
        setShow(true)
    }

    const handleClose = () => {
        setShow(false);
        setFilteredPendingTktsData([]);
    };


    const handleCellRender = (cell, row) => {
        if (cell.column.id === "createdAt") {
            return (<span>
                {moment(cell.value).format('YYYY-MM-DD')}
            </span>)
        }
        if (cell.column.id === "helpdeskNo") {
            return (
                <a href="javascript:void(null)" onClick={() => handleOpenRightModal(row.original)}>{cell?.value}</a>
            )
        }
        if (cell.column.id === "assignedAgentDetails") {
            return (
                <span>
                    {(cell?.value?.assignedAgentDetails?.firstName ?? '') + ' ' + (cell?.value?.assignedAgentDetails?.lastName ?? '')}
                </span>
            )
        }
        else if (cell.column.id === "currUser") {
            return (
                <span>
                    {(cell?.value?.firstName ?? '') + ' ' + (cell?.value?.lastName ?? '')}
                </span>
            )
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    console.log("pendingTktsCounts => ", pendingTktsCounts)

    return (
        <div className="col-md-4">
            <div className="cmmn-skeleton">
                <div className="card-body">
                    <div className="skel-dashboard-title-base">
                        <span className="skel-header-title"> Support Ticket Pending with </span>
                        <div className="skel-dashboards-icons">
                            <span>
                                <i className="material-icons" onClick={() => setIsRefresh(!isRefresh)}>refresh</i>
                            </span>
                            {/* <span>
                                <i className="material-icons" > filter_alt </i>
                            </span> */}
                        </div>
                    </div>
                    <hr className="cmmn-hline" />
                </div>
                <div className="card-body py-0">
                    <div className="row">
                        {Object.entries(pendingTktsCounts).map(([description, count], index) => (<div key={index} className="col-3">
                            <div className="text-center">
                                <p className="mb-2 text-truncate">{description == 'null' ? "Unclassfied" : description?.toUpperCase() === "DTWORKS" ? 'dtWorks' : description.charAt(0).toUpperCase() + description.slice(1).toLowerCase()}</p>
                                <h4 className="text-primary cursor-pointer" onClick={() => showDetails(getProjectCode(description))}> {count} </h4>
                            </div>
                        </div>))}
                        <div className="col-12 text-center">
                            <div className="skel-graph-sect mt-4">
                                <Chart data={{ chartData: pendingTktsCounts }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal show={show} backdrop="static" keyboard={false} onHide={handleClose} style={modalStyle}>
                <Modal.Header>
                    <b>Project Wise Open Helpdesk Details</b>
                    <button type="button" className="close mr-2" keyboard={false} onClick={handleClose}>
                        <span aria-hidden="true">×</span>
                    </button>
                </Modal.Header>
                <Modal.Body>
                    <DynamicTable
                        listKey={"Assigned"}
                        row={filteredPendingTktsData}
                        rowCount={filteredPendingTktsData?.length}
                        header={ProjectWiseColumns}
                        columnFilter={true}
                        fixedHeader={true}
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
        </div >

    )
}

export default SupportTicketsPending;