import React, { useEffect, useState, useRef } from 'react';
import { properties } from "../../../properties";
import { post } from "../../../common/util/restUtil";
import { Modal } from 'react-bootstrap';
import DynamicTable from "../../../common/table/DynamicTable";
import { StatusWiseColumns } from "../Columns";
import moment from 'moment'
import Chart from './Chart';


const HelpdeskSummary = (props) => {
    const { searchParams, isParentRefresh, modalStyle } = props?.data;
    const { handleOpenRightModal } = props?.handlers;
    const [summaryCounts, setSummaryCounts] = useState([]);
    const [summaryCount, setSummaryCount] = useState([]);
    const [filteredSummaryData, setFilteredSummaryData] = useState([]);
    const [isRefresh, setIsRefresh] = useState(false);
    const [show, setShow] = useState(false);
    const tableRef = useRef(true);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);

    useEffect(() => {
        post(properties.HELPDESK_API + '/summary', { ...searchParams, type: 'COUNT' })
            .then((response) => {
                setSummaryCounts(response?.data?.filter((ele) => ele?.oType === 'status'))
                const result = response?.data?.filter((ele) => ele?.oType === 'Helpdesk Type').reduce((acc, obj) => {
                    const existingObj = acc.find(item => item.oHelpdeskType === obj.oHelpdeskType);
                    if (existingObj) {
                        existingObj.oCnt += obj.oCnt;
                    } else {
                        acc.push({ oHelpdeskType: obj.oHelpdeskType, oCnt: obj.oCnt, oHelpdeskTypeCode: obj?.oHelpdeskTypeCode });
                    }
                    return acc;
                }, []);
                setSummaryCount(result)
            })
            .catch(error => {
                console.error(error);
            });
    }, [isRefresh, searchParams, isParentRefresh]);

    const showDetails = (helpdeskType) => {
        console.log('helpdeskType------->', { helpdeskType })
        post(properties.HELPDESK_API + '/summary', { ...searchParams, helpdeskType, type: 'LIST' })
            .then((response) => {
                let responseData = response?.data
                setFilteredSummaryData(responseData)
                setShow(true)
            })
            .catch(error => {
                console.error(error);
            });
    }

    const handleClose = () => {
        setShow(false);
        setFilteredSummaryData([]);
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
                // <div title='View' onClick={() => handleOpenRightModal(row.original?.oHelpdeskId)} className="action-view" data-toggle="modal" data-target="#view-right-modal">{cell?.value}</div>
            )
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
                        <span className="skel-header-title"> Helpdesk Summary </span>
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
                        {/* {console.log('summaryCount------->', summaryCount)} */}
                        {summaryCount?.map((ele) => <div className="col-3" key={ele?.oHelpdeskType}>
                            <div className="text-center">
                                <p className="mb-2 text-truncate"> {ele?.oHelpdeskType ? ele?.oHelpdeskType : 'Unclassified'} </p>
                                <h4 className="text-dark cursor-pointer skel-font-sm-bold" onClick={() => showDetails(ele?.oHelpdeskTypeCode)}> {ele?.oCnt} </h4>
                            </div>
                        </div>)}
                        <div className="col-12 text-center">
                            <div className="skel-graph-sect mt-4">
                                <div id="chartzz">
                                    <Chart data={{ chartData: summaryCounts }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal show={show} backdrop="static" keyboard={false} onHide={handleClose} style={modalStyle}>
                <Modal.Header>
                    <b>Summary Wise Helpdesk Details</b>
                    <button type="button" className="close mr-2" keyboard={false} onClick={handleClose}>
                        <span aria-hidden="true">×</span>
                    </button>
                </Modal.Header>
                <Modal.Body>
                    <DynamicTable
                        listKey={"Assigned"}
                        row={filteredSummaryData}
                        rowCount={filteredSummaryData?.length}
                        header={StatusWiseColumns}
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
        </div>
    )
}

export default HelpdeskSummary;