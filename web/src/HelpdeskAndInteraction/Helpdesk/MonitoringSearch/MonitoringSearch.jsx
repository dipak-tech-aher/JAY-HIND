import React, { useRef, useEffect, useState, useCallback } from 'react';

import DynamicTable from '../../../common/table/DynamicTable';
import { properties } from '../../../properties';
import { get, post } from '../../../common/util/restUtil';
import { unstable_batchedUpdates } from 'react-dom';
import { useHistory } from "react-router-dom";
import { toast } from 'react-toastify';
import { NumberFormatBase } from 'react-number-format';
import { formFilterObject } from '../../../common/util/util';
import { validateNumber } from '../../../common/util/validateUtil';
import moment from 'moment';
import { MonitoringSearchColumns, MonitoringSearchHiddenColumns } from './MonitoringSearchColumns';

const MonitoringSearch = (props) => {

    const history = useHistory();

    const initialValues = {
        helpdeskId: "",
        supervisor: "",
        agent: "",
        startDate: "",
        endDate: "",
        channel: ""
    };

    const [searchInputs, setSearchInputs] = useState(initialValues);
    const [entityTypes, setEntityTypes] = useState({
        supervisor: [],
        agent: [],
        channel: []
    });
    const [tableRowData, setTableRowData] = useState([]);
    const [displayForm, setDisplayForm] = useState(true);

    const isFirstRender = useRef(true);
    const [totalCount, setTotalCount] = useState(0);
    const [listSearch, setListSearch] = useState([]);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(true)

    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);

    useEffect(() => {
        if (!isFirstRender.current) {
            getHelpdeskSearchData();
        }
        else {
            isFirstRender.current = false
            const hdSourceresponse = getEntityLookup();
            hdSourceresponse.then((hdResp) => {
                if (hdResp) {
                    const agentAndSupervisorResponse = getAgentAndSupervisor();
                    agentAndSupervisorResponse.then((agentAndSupervisorResp) => {
                        if (agentAndSupervisorResp) {
                            setEntityTypes({
                                ...entityTypes,
                                channel: hdResp,
                                agent: agentAndSupervisorResp?.agent,
                                supervisor: agentAndSupervisorResp?.supervisor
                            })
                        }
                    }).catch(error => console.log(error))
                }
            }).catch(error => console.log(error))
        }
    }, [currentPage, perPage])

    const getEntityLookup = useCallback(() => {
        return new Promise((resolve, reject) => {
            
            post(properties.BUSINESS_ENTITY_API, ['TICKET_CHANNEL'])
                .then((response) => {
                    const { data } = response;
                    resolve(data['TICKET_CHANNEL']);
                })
                .catch(error => {
                    console.error(error);
                })
                .finally(() => {
                    
                })
        })
    }, [])

    const getAgentAndSupervisor = () => {
        return new Promise((resolve, reject) => {
            
            get(`${properties.QUALITY_MONITORING}/supervisor-agent`)
                .then((response) => {
                    const { status, data } = response;
                    if (status === 200 && data) {
                        resolve(data)
                    }
                })
                .catch(error => {
                    console.error(error);
                })
                .finally(() => {
                    
                })
        })
    }

    const getHelpdeskSearchData = (fromCallback = false) => {
        
        const { helpdeskId, supervisor, agent, startDate, endDate, channel } = searchInputs;
        const requestBody = {
            helpdeskId,
            agent,
            supervisor,
            startDate,
            endDate,
            source: channel,
            filters: formFilterObject(filters)
        }
        setListSearch(requestBody);
        post(`${properties.HELPDESK_API}/search?evaluation=${true}&limit=${perPage}&page=${fromCallback ? 0 : Number(currentPage)}`, requestBody)
            .then((response) => {
                if (response.data) {
                    if (Number(response.data.count) > 0) {
                        unstable_batchedUpdates(() => {
                            setTotalCount(response.data.count)
                            setTableRowData(response.data.rows)
                        })
                    }
                    else {
                        toast.error("Records not Found")
                    }
                }
            }).catch(error => {
                console.error(error);
            })
            .finally(() => {
                
                isTableFirstRender.current = false;
            })
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleOnKeyPress = (e) => {
        const { key } = e;
        validateNumber(e);
        if (key === "Enter") {
            handleSubmit(e)
        };
    }

    const handleInputChange = (e) => {
        const target = e.target;
        setSearchInputs({
            ...searchInputs,
            [target.id]: target.type === 'checkbox' ? target.checked : target.value
        })
    }

    const handleSubmit = (e) => {
        if (e) {
            e.preventDefault();
            isTableFirstRender.current = true;
            unstable_batchedUpdates(() => {
                setFilters([])
                setCurrentPage((currentPage) => {
                    if (currentPage === 0) {
                        return '0'
                    }
                    return 0
                });
            })
        }
    }

    const getIsAgent = (userRole) => {
        return userRole === 'AGENT' ? true : false;
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header.includes('Date')) {
            return (
                <span>{cell.value ? moment(cell.value).format('DD-MMM-YYYY HH:MM') : '-'}</span>
            )
        }
        else if (cell.column.Header.includes('Name')) {
            return (
                cell.column.Header.includes('Customer') ? (
                    <span>
                        {
                            !!row?.original?.contactDetails?.length ?
                                !!row.original.contactDetails[0].customerDetails?.length ?
                                    `${row.original.contactDetails[0].customerDetails[0]?.firstName || ''} ${row.original.contactDetails[0].customerDetails[0]?.lastName || ''}`
                                    : '-'
                                : '-'
                        }
                    </span>
                )
                    : (
                        <span>{row?.original?.updatedByDetails?.firstName || ''} {row?.original?.updatedByDetails?.lastName || ''}</span>
                    )
            )
        }
        else if (cell.column.Header === "Action") {
            return (
                <div className="btn-group">
                    <button type="button" id="evaluate"
                        className="btn btn-sm btn-primary"
                        onClick={(e) => handleOnEvaluateOrReview(e, row.original)}>
                        {
                            getIsAgent(row?.original?.userRole) ? 'Agent Self Review/Reply' : 'View Details and Evaluate'
                        }
                    </button>
                </div >
            )
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

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

    const handleOnEvaluateOrReview = (event, rowData) => {
        const { helpdeskId, userRole } = rowData;
        const helpdeskResponse = getHelpdeskData(helpdeskId);
        helpdeskResponse.then((resolvedHD, rejectedHD) => {
            if (resolvedHD) {
                props.history.push(`${process.env.REACT_APP_BASE}/quality-monitoring-view`, {
                    data: {
                        detailedViewItem: resolvedHD,
                        isAgent: getIsAgent(userRole)
                    }
                })
            }
        }).catch(error => console.log(error))
    }


    return (
        <div className="container-fluid cmmn-skeleton mt-2">
            {/* <div className="row">
                <div className="col">
                    <div className="page-title-box">
                        <h4 className="page-title">Helpdesk Quality Monitoring</h4>
                    </div>
                </div>
            </div> */}
            <div className="row mt-1">
                <div className="col-lg-12">
                    <div className="search-result-box m-t-30">
                        <div id="searchBlock" className="modal-body p-2 d-block">
                            <div className="d-flex justify-content-end">
                                <h6 className='cursor-pointer' onClick={() => { setDisplayForm(!displayForm) }}>
                                    {displayForm ? "Hide Search" : "Show Search"}
                                </h6>
                            </div>
                            {
                                displayForm &&
                                <form onSubmit={handleSubmit}>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="helpdeskId" className="control-label">Helpdesk ID</label>
                                                <NumberFormatBase
                                                    value={searchInputs.helpdeskId}
                                                    onKeyPress={(e) => handleOnKeyPress(e)}
                                                    onChange={handleInputChange}
                                                    type="text"
                                                    className="form-control"
                                                    id="helpdeskId"
                                                    placeholder="Enter Call Helpdesk ID" />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="supervisor" className="control-label">Select Supervisor</label>
                                                <select id='supervisor' className='form-control' value={searchInputs.supervisor} onChange={handleInputChange} >
                                                    <option value="">Select Supervisor</option>
                                                    {
                                                        entityTypes?.supervisor?.map((e) => (
                                                            <option key={e.userId} value={e.userId}>{e.firstName} {e.lastName}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="agent" className="control-label">Select Agent</label>
                                                <select id='agent' className='form-control' value={searchInputs.agent} onChange={handleInputChange} >
                                                    <option value="">Select Agent</option>
                                                    {
                                                        entityTypes?.agent?.map((e) => (
                                                            <option key={e.userId} value={e.userId}>{e.firstName} {e.lastName}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="startDate" className="control-label">Helpdesk Start Date</label>
                                                <input type="date" className="form-control" id="startDate" name='startDate' placeholder="Enter Start Date"
                                                    value={searchInputs.startDate}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="fullName" className="control-label">Helpdesk To Date</label>
                                                <input type="date" className="form-control" id="endDate" name='endDate' placeholder="Enter Start Date"
                                                    value={searchInputs.endDate}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="channel" className="control-label">Helpdesk Channel</label>
                                                <select className='form-control' id='channel' value={searchInputs.channel} onChange={handleInputChange} >
                                                    <option value="">Select Channel</option>
                                                    {
                                                        entityTypes?.channel?.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        </div>

                                    </div>
                                    <div className='row justify-content-center'>
                                            <div className="text-center mt-3">

                                                <button type="button" className="skel-btn-cancel" onClick={() => { setSearchInputs(initialValues); setTableRowData([]) }}>Clear</button>
                                            <button type="submit" className="skel-btn-submit">Search</button>
                                        </div>
                                    </div>
                                </form>
                            }
                        </div>
                        {
                            !!tableRowData.length &&
                            <div className="row mt-2">
                                <div className="col-lg-12">
                                    {
                                        !!tableRowData.length &&
                                        <div className="card">
                                            <div className="card-body" id="datatable">
                                                <DynamicTable
                                                    listKey={"Helpdesk Search"}
                                                    listSearch={listSearch}
                                                    row={tableRowData}
                                                    header={MonitoringSearchColumns}
                                                    rowCount={totalCount}
                                                    itemsPerPage={perPage}
                                                    backendPaging={true}
                                                    hiddenColumns={MonitoringSearchHiddenColumns}
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
                                        </div>
                                    }
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MonitoringSearch;