import React, { useEffect, useRef, useState, useCallback } from 'react';
import Modal from 'react-modal';
import { object, string } from 'yup';

import DynamicTable from '../../../../common/table/DynamicTable';
import { properties } from '../../../../properties';
import { post, get } from '../../../../common/util/restUtil';
import { RegularModalCustomStyles } from '../../../../common/util/util';
import moment from 'moment';
import { history } from '../../../../common/util/history';
import { toast } from 'react-toastify';
import PriorityBadge from './PriorityBadge';

const SimilarSearchInputValidationSchema = object().shape({
    searchInput: string().required("Input is required.")
})


const SimilarSearch = (props) => {

    const [searchInput, setSearchInput] = useState("");
    const [searchInputError, setSearchInputError] = useState({});
    const [searchSimilarTicketList, setSearchSimilarTicketList] = useState([]);
    const [isSearchSimilarTicketsOpen, setIsSearchSimilarTicketsOpen] = useState(false);
    const isFirstRender = useRef(true);
    const similarCategoryCounts = useRef();

    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const isTableFirstRender = useRef(true);
    const { screenType } = props.data

    const getSearchResults = () => {
        
        const requestBody = {
            userInput: searchInput,
            ScreenType: screenType
        }
        post(`${properties.HELPDESK_API}/similar-tickets?page=${currentPage}&limit=${perPage}`, requestBody)
            .then((response) => {
                const { status, data } = response;
                if (status === 200 && data) {
                    similarCategoryCounts.current = data?.catagoryCounts
                    setTotalCount(data?.count);
                    if (screenType === "Helpdesk") {
                        let rowData = []
                        for (let e of data?.rows) {
                            rowData.push({
                                helpdeskId: e?.helpdeskId || '',
                                intxnId: e?.helpdeskId || '',
                                customerDetails: { firstName: e?.name || '' },
                                description: e?.title|| '',
                                currStatus: e?.statusDesc?.description || '',
                                createdAt: e?.createdAt || '',
                                helpdeskSubject: e?.helpdeskSubject || '',
                                currUserDetails: {
                                    firstName: e?.assignedAgentDetails?.firstName || '',
                                    lastName: e?.assignedAgentDetails?.lastName || ''
                                },
                                updatedByDetails:{
                                    firstName: e?.updatedByDetails?.firstName || '',
                                    lastName: e?.updatedByDetails?.lastName || ''
                                },
                                priority: "-"
                            })

                        }
                        setSearchSimilarTicketList(rowData);
                    }
                    else {
                        setSearchSimilarTicketList(data?.rows);
                    }
                    setIsSearchSimilarTicketsOpen(true);
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally(() => {
                isTableFirstRender.current = true;
                
            })
    }

    useEffect(() => {
        if (!isFirstRender.current) {
            getSearchResults();
        }
        else {
            isFirstRender.current = false
        }
    }, [currentPage, perPage])

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const validate = (schema, data) => {
        try {
            setSearchInputError({})
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setSearchInputError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    const handleOnSimilarSearch = (e) => {
        e.preventDefault();
        let error = validate(SimilarSearchInputValidationSchema, { searchInput })
        if (error) {
            return;
        }
        getSearchResults();
    }

    const handleOnInputChange = (e) => {
        const { target } = e;
        setSearchInput(target.value)
    }

    const handleCellRender = (cell, row) => {
        if (['Requested By'].includes(cell.column.Header)) {
            return (
                <span>{row?.original?.customerDetails?.firstName || ''} {row?.original?.customerDetails?.lastName || ''}</span>
            )
        } else if (['Assignee'].includes(cell.column.Header)) {
            return (
                <span>{row?.original?.currUserDetails?.firstName || ''} {row?.original?.currUserDetails?.lastName || ''}</span>
            )
        }
        else if (['Created Date', 'Due Date'].includes(cell.column.Header)) {
            return (
                <span>{moment(cell?.value).format('DD-MMM-YYYY') || '-'}</span>
            )
        } else if (['Updated By'].includes(cell.column.Header)){
            return (
                <span>{row?.original?.updatedByDetails?.firstName || ''} {row?.original?.updatedByDetails?.lastName || ''}</span>
            )
        }
        else if (['Priority', 'Status'].includes(cell.column.Header)) {
            return (
                <span>
                    <PriorityBadge data={{ priority: cell.value }} />
                </span>
            )
        }
        else if (cell.column.Header === "Action") {
            return (
                <button type="button" className="skel-btn-submit" onClick={() => handleCellLinkClick(row?.original)}>
                    <i className="mdi mdi-eye  ml-0 mr-2 font-10 vertical-middle" />
                    View
                </button>
            )
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    const getInteractionDataById = useCallback((interactionId) => {
        
        return new Promise((resolve, reject) => {
            if (interactionId) {
                const requestBody = {
                    searchType: "ADV_SEARCH",
                    interactionId,
                    filters: []
                }
                post(`${properties.INTERACTION_API}/search?limit=${10}&page=${0}`, requestBody)
                    .then((response) => {
                        if (response.data) {
                            if (Number(response.data.count) > 0) {
                                const { rows } = response.data;
                                const { intxnId, customerId, intxnType, intxnTypeDesc, serviceId, accountId, woType, woTypeDesc } = rows[0];
                                if (intxnType === 'REQCOMP' || intxnType === 'REQINQ' || intxnType === 'REQSR') {
                                    const isAdjustmentOrRefund = ['Adjustment', 'Refund'].includes(woTypeDesc) ? true : ['Fault'].includes(woTypeDesc) && intxnType === 'REQSR' ? true : false;
                                    let data = {
                                        customerId,
                                        serviceId,
                                        interactionId: intxnId,
                                        accountId,
                                        type: isAdjustmentOrRefund ? 'complaint' : intxnTypeDesc.toLowerCase(),
                                        woType,
                                        isAdjustmentOrRefund,
                                        row: rows[0]
                                    }
                                    resolve(data);
                                }
                            }
                            else {
                                reject(undefined);
                                toast.error("Records not Found")
                            }
                        }
                    }).catch((error)=>{
                        console.error(error)
                    })
                    .finally(() => {
                        
                    })
            }
            else {
                
                resolve({ noInteraction: true })
            }
        })
    }, [])

    const getHelpdeskData = useCallback((helpdeskId) => {
        return new Promise((resolve, reject) => {
            
            get(`${properties.HELPDESK_API}/${helpdeskId}`)
                .then((response) => {
                    const { status, data } = response;
                    if (status === 200) {
                        resolve(data);
                    }
                })
                .catch(error => {
                    console.error(error);
                    reject(true);
                })
                .finally()
        })
    }, [])

    const handleOnViewTicket = (row) => {
        const { intxnId } = row;
        if (screenType === "Interaction") {
            const interactionResponse = getInteractionDataById(intxnId);
            interactionResponse.then((resolved, rejected) => {
                if (resolved) {
                    history.push(`${process.env.REACT_APP_BASE}/edit-${resolved?.type}`, {
                        data: {
                            ...resolved
                        }
                    })
                }
            }).catch(error => console.log(error))
        }
        else if (screenType === "Helpdesk") {
            const helpdeskResponse = getHelpdeskData(intxnId);
            helpdeskResponse.then((resolvedHD, rejectedHD) => {
                if (resolvedHD) {
                    const interactionResponse = getInteractionDataById(null);
                    interactionResponse.then((resolvedIntxn, rejectedIntxn) => {
                        if (resolvedIntxn) {
                            history.push(`${process.env.REACT_APP_BASE}/edit-${resolvedIntxn?.type?.toLowerCase()?.replace(' ', '-') || 'complaint'}`, {
                                data: {
                                    ...resolvedIntxn,
                                    detailedViewItem: resolvedHD,
                                    fromHelpDesk: true,
                                    helpDeskView: 'Search'
                                }
                            })
                        }
                    }).catch(error => console.log(error))
                }
            }).catch(error => console.log(error))
        }
    }

    const handleCellLinkClick = (rowData) => {
        history.push(`${process.env.REACT_APP_BASE}/view-helpdesk-ticket`, {
            data: rowData
        })
    }


    return (
        <>
            <form className="app-search pt-1">
                <div className="app-search-box dropdown">
                    <div className="input-group">
                        <input id="myInput" type="text" className={`form-control ${searchInputError.searchInput ? "error-border" : "border"}`} placeholder="Search Similar Problems/Tickets" value={searchInput} onChange={handleOnInputChange} />
                        <div className="input-group-append p-0">
                            <button className={`btn btn-sm ${searchInputError.searchInput ? "error-border" : "border"}`} onClick={handleOnSimilarSearch} >
                                <i className="fe-search text-dark"></i>
                            </button>
                        </div>
                    </div>
                    <span className="errormsg">{searchInputError.searchInput ? searchInputError.searchInput : ""}</span>
                </div>
            </form>
            {
                isSearchSimilarTicketsOpen &&
                <Modal isOpen={isSearchSimilarTicketsOpen} contentLabel="Worflow History Modal" style={RegularModalCustomStyles}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">Similar Helpdesk - Search Results</h4>
                                <button type="button" className="close" onClick={() => setIsSearchSimilarTicketsOpen(!isSearchSimilarTicketsOpen)}>×</button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-3">
                                        <div className="widget-rounded-circle card-box">
                                            <div className="row">
                                                {/* <div className="col-6">
                                                    <div className="avatar-lg rounded-circle bg-soft-primary">
                                                        <i className="fe-tag font-22 avatar-title text-primary"></i>
                                                    </div>
                                                </div> */}
                                                <div className="col-12">
                                                    <div className="text-center">
                                                        <h3 className="text-dark mt-1"><span data-plugin="counterup">{similarCategoryCounts.current}</span></h3>
                                                        <p className="text-muted mb-1 text-truncate">Helpdesk in this Category</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="widget-rounded-circle card-box">
                                            <div className="row">
                                                {/* <div className="col-6">
                                                    <div className="avatar-lg rounded-circle bg-soft-success">
                                                        <i className="fe-check-circle font-22 avatar-title text-success"></i>
                                                    </div>
                                                </div> */}
                                                <div className="col-12">
                                                    <div className="text-center">
                                                        <h3 className="text-dark mt-1"><span data-plugin="counterup">{totalCount}</span></h3>
                                                        <p className="text-muted mb-1 text-truncate">Similar Helpdesk</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className='row pt-2'>
                                    <div className='col-12'>
                                        <div className='card-box'>
                                            <h3 className="header-title mb-4">Similar Tickets</h3>
                                            {
                                                !!searchSimilarTicketList?.length &&
                                                <div className="card">
                                                    <div className="card-body" id="datatable">
                                                        <DynamicTable
                                                            row={searchSimilarTicketList}
                                                            header={SimilarSearchColumnList}
                                                            rowCount={totalCount}
                                                            itemsPerPage={perPage}
                                                            backendPaging={true}
                                                            backendCurrentPage={currentPage}
                                                            isTableFirstRender={isTableFirstRender}
                                                            handler={{
                                                                handleCellRender: handleCellRender,
                                                                handlePageSelect: handlePageSelect,
                                                                handleItemPerPage: setPerPage,
                                                                handleCurrentPage: setCurrentPage
                                                            }}
                                                        />
                                                    </div>
                                                </div>

                                            }
                                        </div>
                                    </div>
                                </div>
                                {/* <div className="row pt-4 text-center d-block">
                                    <button className="skel-btn-cancel" type="button" data-dismiss="modal" onClick={() => setIsSearchSimilarTicketsOpen(!isSearchSimilarTicketsOpen)}>Close</button>
                                </div> */}
                            </div>
                        </div>
                    </div>
                </Modal>
            }
        </>
    )
}

const SimilarSearchColumnList = [
    {
        Header: "ID",
        accessor: "intxnId",
        disableFilters: true,
        click: true,
        id: "intxnId",
    },
    {
        Header: "Subject",
        accessor: "helpdeskSubject",
        disableFilters: true,
        id: 'helpdeskSubject'
    },
    {
        Header: "Assignee",
        accessor: "currUserDetails",
        disableFilters: true,
        id: "currUser"
    },
    // {
    //     Header: "Priority",
    //     accessor: "priorityDescription.description",
    //     disableFilters: true,
    //     id: "priority"
    // },
    {
        Header: "Status",
        accessor: "currStatus",
        disableFilters: true,
        id: "currStatus"
    },
    {
        Header: "Created Date",
        accessor: "createdAt",
        disableFilters: true,
        id: "createdAt"
    },
    {
        Header: "Updated By",
        accessor: "updatedByDetails",
        disableFilters: true,
        id: 'updatedByDetails'
    },
    // {
    //     Header: "Due Date",
    //     accessor: "dueDate",
    //     disableFilters: true,
    //     id: "dueDate"
    // },
    {
        Header: "Action"
    }
]

export default SimilarSearch;