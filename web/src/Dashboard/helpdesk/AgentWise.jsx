import React, { useEffect, useState, useRef } from 'react';
import { properties } from "../../properties";
import { post } from "../../common/util/restUtil";
import { Modal } from 'react-bootstrap';
import DynamicTable from "../../common/table/DynamicTable";
import { AgentWiseColumns } from "./Columns";
import moment from 'moment'

const AgentWise = (props) => {
    const { searchParams, isParentRefresh,modalStyle } = props?.data;
    const { handleOpenRightModal } = props?.handlers;
    const [agentWiseData, setAgentWiseData] = useState([]);
    const [agentCounts, setAgentCounts] = useState([]);
    const [filteredAgentsData, setFilteredAgentsData] = useState([]);
    const [isRefresh, setIsRefresh] = useState(false);
    const [show, setShow] = useState(false);
    const tableRef = useRef(true);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);

    useEffect(() => {
        post(properties.HELPDESK_API + '/agent-wise', searchParams)
            .then((response) => {
                setAgentWiseData(response?.data?.rows);
                const AgentCounts = {};
                response?.data?.rows?.forEach(item => {
                    const description = item?.assignedAgentDetails?.firstName + ' ' + item?.assignedAgentDetails?.lastName;
                    if (AgentCounts[description]) {
                        AgentCounts[description]++;
                    } else {
                        AgentCounts[description] = 1;
                    }
                });
                setAgentCounts(AgentCounts)
            })
            .catch(error => {
                console.error(error);
            });
    }, [isRefresh, searchParams, isParentRefresh])

    const showDetails = (agentName) => {
        const filteredAgentData = agentWiseData?.filter((item) => item?.assignedAgentDetails?.firstName + ' ' + item?.assignedAgentDetails?.lastName === agentName);
        console.log('filteredAgentData------>', filteredAgentData)
        setFilteredAgentsData(filteredAgentData)
        setShow(true)
    }

    const handleClose = () => {
        setShow(false);
        setFilteredAgentsData([]);
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
                // <div title='View' onClick={() => handleOpenRightModal(row.original?.oHelpdeskId)} className="action-view" data-toggle="modal" data-target="#view-right-modal">{cell?.value}</div>
            )
        }
        if (cell.column.id === "assignedAgentDetails") {
            return (<span>
                {cell?.value?.firstName + ' ' + cell?.value?.lastName}
            </span>)
        }
        if (cell.column.id === "currUser") {
            return (<span>
                {cell?.value?.firstName + ' ' + cell?.value?.lastName}
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
            <div className="cmmn-skeleton mh-480">
                <div className="card-body">
                    <div className="skel-dashboard-title-base">
                        <span className="skel-header-title"> Agent wise Open Helpdesk </span>
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
                    <div id="cardCollpase5cz" className='mt-4 mh-min-310'>
                        <table className="table table-hover mb-0 table-centered table-nowrap">
                            <tbody>
                                {Object.entries(agentCounts).map(([description, count]) => (<tr key={description}>
                                    <td>
                                        <h5 className="font-size-14 mb-0 skel-font-sm-bold" > {description} </h5>
                                    </td>
                                    <td>
                                        <p className="text-dark mb-0 cursor-pointer" onClick={(e) => showDetails(description)}> {count} </p>
                                    </td>
                                </tr>))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Modal show={show} backdrop="static" keyboard={false} onHide={handleClose} style={modalStyle}>
                <Modal.Header>
                    <b>Agent wise Open Helpdesk</b>
                    <button type="button" className="close mr-2" keyboard={false} onClick={handleClose}>
                        <span aria-hidden="true">×</span>
                    </button>
                </Modal.Header>
                <Modal.Body>
                    <DynamicTable
                        listKey={"Assigned"}
                        row={filteredAgentsData}
                        rowCount={filteredAgentsData?.length}
                        header={AgentWiseColumns}
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

export default AgentWise;