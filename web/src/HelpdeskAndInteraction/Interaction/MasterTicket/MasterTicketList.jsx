import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import Modal from 'react-modal';
import { toast } from 'react-toastify';

import DynamicTable from '../../../common/table/DynamicTable';
import { properties } from '../../../properties';
import { post } from '../../../common/util/restUtil';
import { formFilterObject, RegularModalCustomStyles } from '../../../common/util/util';
import ViewMasterTickets from './ViewMasterTickets';


const MasterTicketList = (props) => {

    //const { sourceName } = props?.location?.data?.sourceName || null;
    // const setActiveTab  = props?.handler
    const { intialValue } = props?.data
    const { setActiveTab, setIntialValue } = props?.handler;
    // const [userPermission, setUserPermission] = useState({
    //     chargeList: "",
    //     addCharge: "",
    // })
    const [tableRowData, setTableRowData] = useState([]);
    const [title, setTitle] = useState("");
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(false)
    const [listSearch, setListSearch] = useState([]);
    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);
    const [isModalOpen, setIsModalOpen] = useState()
    const [masterTicketData, setMasterTicketData] = useState({})

    const getMasterTicketList = useCallback((name = title) => {
        
        const requestBody = {
            title: name,
            filters: formFilterObject(filters)
        }
        setListSearch(requestBody)
        post(`${properties.INTERACTION_API}/master-tickets-list?limit=${perPage}&page=${currentPage}`, requestBody)
            .then((response) => {
                const { count, rows } = response?.data
                if (Number(count) > 0) {
                    unstable_batchedUpdates(() => {
                        setTotalCount(count)
                        setTableRowData(rows)
                    })
                }
                else {
                    toast.error("Records not Found")
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [perPage, currentPage])

    useEffect(() => {
        getMasterTicketList();
    }, [getMasterTicketList]
    )

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Ticket Id") {
            return (<span className="text-secondary cursor-pointer" onClick={(e) => handleViewMasterTicket('VIEW', row.original.mstIntxnId)}>{cell.value}</span>)
        }
        else if (cell.column.Header === "Action") {
            return (
                <button type="button" className="btn btn-labeled btn-primary btn-sm"
                    onClick={(e) => handleCellLinkClick('EDIT', row.original.mstIntxnId)}>
                    <span className="btn-label"><i className="fa fa-edit text-white"></i></span>Edit
                </button>
            )
        }
        else if (["Updated At", "Created Date"].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>)
        }
        else {
            return (<span>{cell.value ? cell.value : '-'}</span>)
        }
    }

    const handleCellLinkClick = (mode, id) => {
        setActiveTab('create-master-ticket')
        setIntialValue({
            ...intialValue,
            mstIntxnId: id,
            mode: mode
        })
    }

    const handleViewMasterTicket = (mode, id) => {
        unstable_batchedUpdates(() => {
            setIsModalOpen(true)
            setMasterTicketData({
                mstIntxnId: id,
                mode: mode
            })
        })
    }

    const handleOnChargeNameSearch = () => {
        unstable_batchedUpdates(() => {
            setPerPage((perPage) => {
                if (perPage === 10) {
                    return '10';
                }
                return 10;
            });
            setCurrentPage((currentPage) => {
                if (currentPage === 0) {
                    return '0';
                }
                return 0;
            });
        })
    }

    return (
        <>
            {
                isModalOpen ?
                    <Modal style={RegularModalCustomStyles} isOpen={isModalOpen}>
                        <ViewMasterTickets
                            data={{
                                isOpen: isModalOpen,
                                masterTicketData,
                                headerName: 'Master Ticket View'
                            }}
                        ></ViewMasterTickets>
                        <button className="close-btn" onClick={() => setIsModalOpen(!isModalOpen)}>&times;</button>
                    </Modal>
                    : <></>
            }
            <div className="row mt-1">
                <div className="col-12">
                    <div className="m-t-30 card-box">
                        <div className="col-12 pr-0">
                            <section className="triangle">
                                <div className="row align-items-center">
                                    <div className="col mx-auto">
                                        <h4 id="list-item-1" className="pl-1">Master Tickets List</h4>
                                    </div>
                                    <div className="col-auto mx-auto">
                                        <div className="input-group input-group-sm p-1 form-inline">
                                            <input type="text" className="form-control border-0" placeholder="Search Titile" value={title} onChange={(e) => setTitle(e.target.value)} />
                                            <div className="input-group-append">
                                                <div className="btn-group" role="group" aria-label="Search Title">
                                                    <button className="btn btn-primary btn-sm btn-sm append-button" onClick={handleOnChargeNameSearch}>
                                                        <i className="fe-search" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className='pl-2'>
                                                <button type="button" className="btn btn-labeled btn-primary btn-sm" onClick={(e) => handleCellLinkClick('ADD', '')}>
                                                    Create Master Ticket
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                        <div className="row mt-2 pr-2">
                            <div className="col-lg-12">
                                <div className="card">
                                    {
                                        (tableRowData && tableRowData?.length > 0) ?
                                            <div>
                                                <DynamicTable
                                                    listSearch={listSearch}
                                                    listKey={"Master Ticket List"}
                                                    row={tableRowData}
                                                    rowCount={totalCount}
                                                    header={MasterTicketListColumns}
                                                    itemsPerPage={perPage}
                                                    backendPaging={true}
                                                    backendCurrentPage={currentPage}
                                                    isTableFirstRender={isTableFirstRender}
                                                    hasExternalSearch={hasExternalSearch}
                                                    exportBtn={exportBtn}
                                                    handler={{
                                                        handleCellRender: handleCellRender,
                                                        handlePageSelect: handlePageSelect,
                                                        handleItemPerPage: setPerPage,
                                                        handleCurrentPage: setCurrentPage,
                                                        handleFilters: setFilters,
                                                        handleExportButton: setExportBtn
                                                    }}
                                                />
                                            </div>
                                            :
                                            <p className="p-1" style={{ textAlign: "center" }}>No Record Found</p>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
const MasterTicketListColumns = [
    {
        Header: "Ticket Id",
        accessor: "mstIntxnId",
        disableFilters: false,
        id: "mstIntxnId",

    },
    {
        Header: "Ticket Title",
        accessor: "title",
        disableFilters: false,
        id: 'title'
    },
    {
        Header: "Child Tickets",
        accessor: "childTicketCount",
        disableFilters: true,
        id: 'childTicketCount'
    },
    {
        Header: "Department",
        accessor: "department",
        disableFilters: true,
        id: "department"
    },
    {
        Header: "Service Type",
        accessor: "serviceType",
        disableFilters: false,
        id: "serviceType"
    },
    {
        Header: "Problem Code",
        accessor: "problemCode",
        disableFilters: false,
        id: "problemCode"
    },
    {
        Header: "Priority",
        accessor: "priority",
        disableFilters: false,
        id: "priority"
    },
    {
        Header: "Status",
        accessor: "status",
        disableFilters: true,
        id: "status"
    },
    {
        Header: "Created Date",
        accessor: "createdAt",
        disableFilters: true,
        id: "createdAt"
    },
    {
        Header: "Action",
        accessor: "action",
        disableFilters: true,
    }
]

export default MasterTicketList;

