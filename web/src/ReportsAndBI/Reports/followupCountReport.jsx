import React, { useEffect, useRef, useState, useContext } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';

import DynamicTable from '../../common/table/DynamicTable';
import { properties } from '../../properties';
import { formatISODateDDMMMYY } from "../../common/util/dateUtil";
import { get, post } from '../../common/util/restUtil';
import { formFilterObject } from '../../common/util/util';
import { FollowupColumns } from './followupCountColumns';
import { AppContext } from '../../AppContext';
import FollowupCountDetailsReport from './followupCountDetailsReport'

const FollowupCountReport = () => {
    const { auth } = useContext(AppContext)
    const initialValues = {
        entity: "",
        reportType: "FollowUp Count"
    }
    const [searchInputs, setSearchInputs] = useState(initialValues);
    const [displayForm, setDisplayForm] = useState(true);
    const [listSearch, setListSearch] = useState([]);
    const [searchData, setSearchData] = useState([]);
    const isFirstRender = useRef(true);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(true)
    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);
    const [entityLookup, setEntityLookup] = useState()
    const [ticketEntity, setTicketEntity] = useState()
    const [interactionsearchInputs, setInteractionSearchInputs] = useState(initialValues);
    const [interactionsearchData, setInteractionSearchData] = useState([]);
    const [interactiontotalCount, setInteractionTotalCount] = useState(0);
    const isInteractionFirstRender = useRef(true);
    
    useEffect(() => {
        get(properties.ENTITY_LOOkUP_API)
            .then((response) => {
                if (response.data) {
                    let lookupData = []
                    for (let e of response.data) {
                        if (e.unitId === auth.currDeptId) {
                            if (e.unitType === 'OU') {
                                for (let d of response.data) {
                                    if (e.unitId === d.parentUnit) {
                                        lookupData.push(d)
                                    }
                                }
                            }
                            else {
                                lookupData.push(e)
                            }
                        }
                    }
                    if (lookupData && lookupData?.length === 1) {
                        setSearchInputs({
                            ...searchInputs,
                            entity: auth && auth.currDeptDesc

                        });
                    }
                    setEntityLookup(lookupData);
                }
            }).catch(error => console.log(error));
    }, [])

    useEffect(() => {
        if (!isFirstRender.current) {
            getfollowupDetails();
        }
        else {
            isFirstRender.current = false;
        }
    }, [currentPage, perPage])

    const getfollowupDetails = () => {
        
        const requestBody = {
            "searchType": "ADV_SEARCH",
            ...searchInputs,
            filters: formFilterObject(filters)
        }
        setListSearch(requestBody);
        post(`${properties.REPORTS_API}/followUpCount?limit=${perPage}&page=${currentPage}`, searchInputs)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        const { count, rows } = resp.data;
                        const { message } = resp
                        unstable_batchedUpdates(() => {
                            setTotalCount(count)
                            setSearchData(rows);
                        })
                        if (count < 1) {
                            toast.error("No Records Found")
                        }
                    } else {
                        setSearchData([])
                        toast.error("Records Not Found")
                    }
                } else {
                    setSearchData([])
                    toast.error("Records Not Found")
                }
            }).catch(error => console.log(error)).finally(() => {
                
                isTableFirstRender.current = false;
            });
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleInputChange = (e) => {
        const target = e.target;
        if (target.id === "entity") {
            setTicketEntity(initialValues)
        }
        setSearchInputs({
            ...searchInputs,
            [target.id]: target.value
        })
    }

    const handleSubmit = (e) => {
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
            // isInteractionFirstRender.current = true
            setInteractionSearchData([]);
            setInteractionTotalCount(0)
        })
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Created On") {
            return (
                <span>{cell.value ? formatISODateDDMMMYY(cell.value) : '-'}</span>
            )
        }
        else if (cell.column.Header === "Ticket Count") {
            return (
                <span className="text-secondary" style={{ cursor: 'pointer' }} onClick={() => handleOnEdit(row)}>{cell.value}</span>
            )
        }
        else
            return (<span>{cell.value}</span>)
    }

    const handleOnEdit = (row) => {

        unstable_batchedUpdates(() => {
            setTicketEntity({
                ...searchInputs,
                entity: row.original.department
            })
        })
    }

    const handleClear = () => {
        setSearchInputs(initialValues);
        setSearchData([]);
        isInteractionFirstRender.current = true
        setInteractionSearchData([]);
        setInteractionTotalCount(0)
    }

    return (

        <div className="card pt-1">
            <div className="container-fluid">
                <div className="form-row pb-2">
                    <div className="col-12">
                        <section className="triangle">
                            <div className="col-12 row">
                                <div className="col-12"><h4 className="pl-3">FollowUp Count Report</h4></div>
                            </div>
                        </section>
                    </div>
                </div>
                <div className="border p-2">
                    <div className="col-12 p-2">
                        <div className="bg-light border pr-0 p-0 row"><div className="col"><h5 className="text-primary pl-2 pt-1">Search</h5></div>
                            <div className="col pt-1">
                                <div className="d-flex justify-content-end">
                                    <h6 className="cursor-pointer" style={{ color: "#142cb1", float: "right" }} onClick={() => { setDisplayForm(!displayForm) }}>{displayForm ? "Hide Search" : "Show Search"}</h6>
                                </div>
                            </div>
                        </div>
                        <div id="searchBlock" className="modal-body p-2 d-block">
                            {
                                displayForm && (
                                    <form onSubmit={handleSubmit}>
                                        <div className="search-result-box p-0">
                                            <div className="autoheight p-1">
                                                <section>
                                                    <div className="form-row pb-2 col-12">
                                                        <div className="col-3">
                                                            <div className="form-group">
                                                                <label htmlFor="entity" className="control-label">Entity</label>
                                                                <select className="form-control" id="entity" value={searchInputs.entity} onChange={handleInputChange}>
                                                                    {entityLookup && entityLookup?.length > 1 && <option value="">Select Entity</option>}
                                                                    {
                                                                        entityLookup && entityLookup.map((e) => (
                                                                            <option key={e.unitId} value={e.unitDesc}>{e.unitDesc}</option>
                                                                        ))
                                                                    }
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12 text-center mt-2">
                                                        <button type="submit" className="btn btn-primary waves-effect waves- mr-2" >Search</button>
                                                        <button type="button" className="btn btn-secondary waves-effect waves-light" onClick={handleClear}>Clear</button>
                                                    </div>
                                                </section>
                                            </div>
                                        </div>
                                    </form>
                                )
                            }
                        </div>
                    </div>
                </div>
                {
                    // !!searchData.length &&
                    <div className="row mt-2">
                        <div className="col-lg-12">
                            {
                                (searchData && searchData.length > 0) ?
                                    <div className="card">
                                        <div className="card-body" id="datatable">
                                            <div style={{}}>
                                                <DynamicTable
                                                    listSearch={listSearch}
                                                    listKey={"FollowUp Count Report"}
                                                    row={searchData}
                                                    rowCount={totalCount}
                                                    header={FollowupColumns}
                                                    itemsPerPage={perPage}
                                                    backendPaging={true}
                                                    backendCurrentPage={currentPage}
                                                    isTableFirstRender={isTableFirstRender}
                                                    hasExternalSearch={hasExternalSearch}
                                                    exportBtn={exportBtn}
                                                    url={properties.REPORTS_API + '/followUpCount'}
                                                    method={'POST'}
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
                                        <FollowupCountDetailsReport
                                            data={{
                                                ticketEntity,
                                                interactionsearchInputs,
                                                interactionsearchData,
                                                interactiontotalCount,
                                                isInteractionFirstRender
                                            }}
                                            handler={{
                                                setInteractionSearchInputs,
                                                setInteractionSearchData,
                                                setInteractionTotalCount

                                            }}
                                        ></FollowupCountDetailsReport>
                                    </div>
                                    :
                                    <span className="msg-txt">No Record Available</span>
                            }
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default FollowupCountReport;