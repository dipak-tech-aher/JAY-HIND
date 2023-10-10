import React, { useEffect, useState, useRef } from 'react';
import { properties } from "../../../properties";
import { post } from "../../../common/util/restUtil";
import { Modal } from 'react-bootstrap';
import DynamicTable from "../../../common/table/DynamicTable";
import { StatusWiseColumns } from "../Columns";
import moment from 'moment'

import PieChart from './PieChart';

const ByStatus = (props) => {
    const { searchParams, isParentRefresh, modalStyle } = props?.data;
    const { handleOpenRightModal } = props?.handlers;
    const [statusCounts, setStatusCounts] = useState([]);
    const [filteredStatusData, setFilteredStatusData] = useState([]);
    const [isRefresh, setIsRefresh] = useState(false);
    const [show, setShow] = useState(false);
    const tableRef = useRef(true);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        post(properties.HELPDESK_API + '/helpdesk-by-status', { ...searchParams, type: 'COUNT' })
            .then((response) => {
                setStatusCounts(response?.data);
                const chartData = response?.data?.map((ele) => {
                    return {
                        value: ele?.oCnt,
                        name: ele?.oStatus
                    }
                });
                setChartData(chartData)
            })
            .catch(error => {
                console.error(error);
            });
    }, [isRefresh, searchParams, isParentRefresh])

    const showDetails = (status) => {
        post(properties.HELPDESK_API + '/helpdesk-by-status', { ...searchParams, status, type: 'LIST' })
            .then((response) => {
                setFilteredStatusData(response?.data);
                setShow(true)
            })
            .catch(error => {
                console.error(error);
            });
    }

    const handleClose = () => {
        setShow(false);
        setFilteredStatusData([]);
    };


    const handleCellRender = (cell, row) => {
        if (cell.column.id === "createdAt") {
            return (<span>
                {moment(cell.value).format('YYYY-MM-DD')}
            </span>)
        }
        if (cell.column.id === "oHelpdeskNo") {
            return (
                <a href="javascript:void(null)" onClick={() => handleOpenRightModal(row.original)}>{cell?.value}</a>
            )
        }
        if (cell.column.id === "assignedAgentDetails") {
            return (<span>
                {cell?.value?.assignedAgentDetails?.firstName + ' ' + cell?.value?.assignedAgentDetails?.lastName}
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
        <div className="col-md-4">
            <div className="cmmn-skeleton">
                <div className="card-body">
                    <div className="skel-dashboard-title-base">
                        <span className="skel-header-title"> Helpdesk by Status </span>
                        <div className="skel-dashboards-icons">
                            <span>
                                <i className="material-icons" onClick={() => setIsRefresh(!isRefresh)}>refresh</i>
                            </span>
                            {/* <span>
                                <i className="material-icons"> filter_alt </i>
                            </span> */}
                        </div>
                    </div>
                    <hr className="cmmn-hline" />
                </div>
                <div className="card-body py-0">
                    <div className="row">
                        {statusCounts.map((ele) => (<div className="col-3" key={ele?.oStatus}>
                            <div className="text-center" key={ele.oStatus}>
                                <p className="mb-2 text-truncate">{ele?.oStatus}</p>
                                <h4 className="text-dark cursor-pointer skel-font-sm-bold" onClick={() => showDetails(ele?.oStatusCode)}> {ele?.oCnt} </h4>
                            </div>
                        </div>))}

                        <div className="col-12 text-center">
                            <div className="skel-graph-sect mt-4 mh-400">
                                <PieChart data={{ chartData }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal show={show} backdrop="static" keyboard={false} onHide={handleClose} style={modalStyle}>
                <Modal.Header>
                    <b>Status Wise Helpdesk Details</b>
                    <button type="button" className="close mr-2" keyboard={false} onClick={handleClose}>
                        <span aria-hidden="true">×</span>
                    </button>
                </Modal.Header>
                <Modal.Body>
                    <DynamicTable
                        listKey={"Assigned"}
                        row={filteredStatusData}
                        rowCount={filteredStatusData?.length}
                        columnFilter={true}
                        header={StatusWiseColumns}
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
        </div>
    )
}

export default ByStatus;