import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify';

import DynamicTable from '../../../common/table/DynamicTable';
import { properties } from '../../../properties';
import { post, get } from '../../../common/util/restUtil';
import { unstable_batchedUpdates } from 'react-dom';
// import { formFilterObject } from '../../../common/util/util';
import { formatISODateDDMMMYY } from "../../../common/util/dateUtil";
import moment from 'moment';
import openOrderColumns from './Columns/OpenOrderColumns'
import { removeEmptyKey } from '../../../common/util/util';

const OpenOrderReport = () => {
    const initialValues = {
        orderNo: '',
        orderStatus: '',
        currEntity: '',
        currRole: '',
        currUser: '',
        orderFamily: '',
        orderCategory: '',
        orderType: '',
        serviceType: '',
        orderPriority: '',
        orderSource: '',
        dateFrom: moment().subtract('1', 'month').format('YYYY-MM-DD'),
        dateTo: moment().format('YYYY-MM-DD')
    }
    const isFirstRender = useRef(true);
    const [searchInputs, setSearchInputs] = useState(initialValues);
    const [displayForm, setDisplayForm] = useState(true);
    const [listSearch, setListSearch] = useState({excel: true });
    const [searchData, setSearchData] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(true)

    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);

    const [orderStatusLookup, setorderStatusLookup] = useState([])
    const [orderCategoryLookup, setOrderCategoryLookup] = useState([])
    const [orderTypeLookup, setOrderTypeLookup] = useState([])
    const [serviceTypeLookup, setServiceTypeLookup] = useState([])
    const [orderPriorityLookup, setOrderPriorityLookup] = useState([])
    const [orderSourceLookup, setOrderSourceLookup] = useState([])

    useEffect(() => {
        get(properties.BUSINESS_ENTITY_API + '?searchParam=code_type&valueParam=ORDER_TYPE,ORDER_SOURCE,SERVICE_TYPE,PRIORITY,ORDER_CATEGORY,ORDER_STATUS')
            .then((response) => {
                if (response.data) {
                    let lookupData = response.data;
                    setorderStatusLookup(lookupData['ORDER_STATUS'])
                    setOrderCategoryLookup(lookupData['ORDER_CATEGORY'])
                    setOrderTypeLookup(lookupData['ORDER_TYPE'])
                    setServiceTypeLookup(lookupData['SERVICE_TYPE'])
                    setOrderPriorityLookup(lookupData['PRIORITY'])
                    setOrderSourceLookup(lookupData['ORDER_SOURCE'])
                }
            }).catch(error => console.log(error))
    }, [])

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleInputChange = (e) => {
        const target = e.target;
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
        })
    }

    useEffect(() => {
        if (!isFirstRender.current) {
            getOrderDetails();
        }
        else {
            isFirstRender.current = false;
        }
    }, [currentPage, perPage])

    const getOrderDetails = () => {
        let requestBody = {
            ...searchInputs,
            excel: false
        }
        requestBody = Object.fromEntries(
            Object.entries(requestBody).filter(([_, value]) => value !== undefined && value !== null && value !== "")
          );

        setListSearch({ ...requestBody, excel: true});
        post(`${properties.REPORTS_API}/open-orders?limit=${perPage}&page=${currentPage}`, requestBody)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        const { count, rows } = resp.data;
                        unstable_batchedUpdates(() => {
                            setTotalCount(count)
                            setSearchData(rows);
                        })
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

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Created At") {
            return (
                <span>{cell.value ? formatISODateDDMMMYY(cell.value) : '-'}</span>
            )
        }
        else
            return (<span>{cell.value}</span>)
    }

    return (
        <div className="container-fluid">
            <div className="row mt-1">
                <div className="col-lg-12">
                    <div className="search-result-box m-t-30 card-box">
                        <div id="searchBlock" className="modal-body p-2 d-block">
                            <div className="d-flex justify-content-end">
                                <h6 className="text-primary cursor-pointer" onClick={() => { setDisplayForm(!displayForm) }}>{displayForm ? "Hide Search" : "Show Search"}</h6>
                            </div>
                            {
                                displayForm && (
                                    <form>
                                        <div className="row">
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="orderNo" className="control-label">Order No</label>
                                                    <input value={searchInputs.orderNo}
                                                        // onKeyPress={(e) => {
                                                        //     if (e.key === "Enter") {
                                                        //         handleSubmit(e)
                                                        //     };
                                                        // }}
                                                        onChange={handleInputChange} type="text" className="form-control" id="orderNo"
                                                    />
                                                </div>
                                            </div>
                                            {/* <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="orderStatus" className="control-label">Order Status</label>
                                                    <select className="form-control" id="orderStatus" value={searchInputs.orderStatus} onChange={handleInputChange}>
                                                        <option value="">Select Interaction Type</option>
                                                        {
                                                            orderStatusLookup && orderStatusLookup.map((e) => (
                                                                <option key={e.code} value={e.code}>{e.description}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div> */}
                                            {/* <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="interactionStatus" className="control-label">Interaction Status</label>
                                                    <select className="form-control" id="interactionStatus" value={searchInputs.interactionStatus} onChange={handleInputChange}>
                                                        <option value="">Select Interaction Status</option>
                                                        {
                                                            statusLookup && statusLookup.map((e) => (
                                                                <option key={e.code} value={e.code}>{e.description}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div> */}
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="Order Category" className="control-label">Order Category</label>
                                                    <select className="form-control" id="orderCategory" value={searchInputs.orderCategory} onChange={handleInputChange}>
                                                        <option value="">Select Order Category</option>
                                                        {
                                                            orderCategoryLookup && orderCategoryLookup.map((e) => (
                                                                <option key={e.code} value={e.code}>{e.description}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="Order Type" className="control-label">Order Type</label>
                                                    <select className="form-control" id="orderType" value={searchInputs.orderType} onChange={handleInputChange}>
                                                        <option value="">Select Order Type</option>
                                                        {
                                                            orderTypeLookup && orderTypeLookup.map((e) => (
                                                                <option key={e.code} value={e.code}>{e.description}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="Service Type" className="control-label">Service Type</label>
                                                    <select className="form-control" id="serviceType" value={searchInputs.serviceType} onChange={handleInputChange}>
                                                        <option value="">Select Service Type</option>
                                                        {
                                                            serviceTypeLookup && serviceTypeLookup.map((e) => (
                                                                <option key={e.code} value={e.code}>{e.description}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="Order Priority" className="control-label">Order Priority</label>
                                                    <select className="form-control" id="orderPriority" value={searchInputs.orderPriority} onChange={handleInputChange}>
                                                        <option value="">Select Order Priority</option>
                                                        {
                                                            orderPriorityLookup && orderPriorityLookup.map((e) => (
                                                                <option key={e.code} value={e.code}>{e.description}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="Order Source" className="control-label">Order Source</label>
                                                    <select className="form-control" id="orderSource" value={searchInputs.orderSource} onChange={handleInputChange}>
                                                        <option value="">Select Order Priority</option>
                                                        {
                                                            orderSourceLookup && orderSourceLookup.map((e) => (
                                                                <option key={e.code} value={e.code}>{e.description}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="Date From" className="control-label">From Date</label>
                                                    <input type="date" value={searchInputs.dateFrom} onChange={handleInputChange} className="form-control" id="dateFrom"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="To From" className="control-label">To Date</label>
                                                    <input type="date" value={searchInputs.dateTo} onChange={handleInputChange} className="form-control" id="dateTo"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-12 text-center mt-2">
                                            <button type="button" className="skel-btn-cancel" onClick={() => { setSearchInputs(initialValues); setSearchData([]) }}>Clear</button>
                                            <button type="button" className="skel-btn-submit" onClick={handleSubmit}>Search</button>

                                        </div>
                                    </form>
                                )
                            }
                        </div>
                        {
                            searchData && Array.isArray(searchData) && searchData?.length > 0 && <>
                                <div className="card">
                                    <div className="card-body" id="datatable">
                                        <div style={{}}>
                                            <DynamicTable
                                                listSearch={listSearch}
                                                listKey={"Open Order Report"}
                                                row={searchData}
                                                rowCount={totalCount}
                                                header={openOrderColumns}
                                                itemsPerPage={perPage}
                                                backendPaging={true}
                                                backendCurrentPage={currentPage}
                                                isTableFirstRender={isTableFirstRender}
                                                hasExternalSearch={hasExternalSearch}
                                                exportBtn={exportBtn}
                                                url={properties.REPORTS_API + '/open-orders'}
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
                                </div>

                            </>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OpenOrderReport