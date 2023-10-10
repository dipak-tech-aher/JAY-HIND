import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { unstable_batchedUpdates } from 'react-dom';
import DynamicTable from '../../../common/table/DynamicTable';
import { get, post } from '../../../common/util/restUtil';
import { properties } from '../../../properties';
// import { formFilterObject } from '../../../common/util/util';
import moment from 'moment';
import { formatISODateDDMMMYY } from "../../../common/util/dateUtil";
import { removeEmptyKey } from '../../../common/util/util';
import createdCustomerColumns from './Columns/CreatedCustomerColumns';

const CreatedCustomerReport = () => {
    const initialValues = {
        dateFrom: moment().subtract('1', 'month').format('YYYY-MM-DD'),
        dateTo: moment().format('YYYY-MM-DD')
    }
    const isFirstRender = useRef(true);
    const [searchInputs, setSearchInputs] = useState(initialValues);
    const [displayForm, setDisplayForm] = useState(true);
    const [listSearch, setListSearch] = useState([]);
    const [searchData, setSearchData] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(true)

    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);

    const [customerCategory, setCustomerCategory] =useState()
    const [customerStatus, setCustomerStatus] =useState()
    const [customerIdType, setCustomerIdType] =useState()

 
    useEffect(() => {
        get(properties.BUSINESS_ENTITY_API + '?searchParam=code_type&valueParam=CUSTOMER_CATEGORY,CUSTOMER_STATUS,CUSTOMER_ID_TYPE')
            .then((response) => {
                if (response.data) {
                    let lookupData = response.data;
                    setCustomerCategory(lookupData['CUSTOMER_CATEGORY'])
                    setCustomerStatus(lookupData['CUSTOMER_STATUS'])
                    setCustomerIdType(lookupData['CUSTOMER_ID_TYPE'])
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

    const getOrderDetails = useCallback(() => {
        let requestBody = {
            ...searchInputs,
            excel: false
        }
        requestBody = Object.fromEntries(
            Object.entries(requestBody).filter(([_, value]) => value !== undefined && value !== null && value !== "")
          );
          
        setListSearch({...requestBody, excel: true});
        post(`${properties.REPORTS_API}/created-customer?limit=${perPage}&page=${currentPage}`, requestBody)
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
    }, [currentPage, perPage])

    useEffect(() => {
        if (!isFirstRender.current) {
            getOrderDetails();
        }
        else {
            isFirstRender.current = false;
        }
    }, [currentPage, getOrderDetails, perPage])

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
                                                    <label htmlFor="customerNo" className="control-label">Customer No</label>
                                                    <input value={searchInputs.customerNo}
                                                        // onKeyPress={(e) => {
                                                        //     if (e.key === "Enter") {
                                                        //         handleSubmit(e)
                                                        //     };
                                                        // }}
                                                        onChange={handleInputChange} type="text" className="form-control" id="customerNo"
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
                                                    <label htmlFor=" Id Type" className="control-label">Id Type</label>
                                                    <select className="form-control" id="idType" value={searchInputs.idType} onChange={handleInputChange}>
                                                        <option value="">Select Id Type</option>
                                                        {
                                                            customerIdType && customerIdType.map((e) => (
                                                                <option key={e.code} value={e.description} >{e.description}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="Customer Category" className="control-label">Customer Category</label>
                                                    <select className="form-control" id="customerCategory" value={searchInputs.customerCategory} onChange={handleInputChange}>
                                                        <option value="">Select Customer Category</option>
                                                        {
                                                            customerCategory && customerCategory.map((e) => (
                                                                <option key={e.code} value={e.description} >{e.description}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="Customer Status" className="control-label">Customer Status</label>
                                                    <select className="form-control" id="customerStatus" value={searchInputs.customerStatus} onChange={handleInputChange}>
                                                        <option value="">Select Customer Status</option>
                                                        {
                                                            customerStatus && customerStatus.map((e) => (
                                                                <option key={e.code} value={e.description} >{e.description}</option>
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
                            searchData && Array.isArray(searchData) && searchData?.length > 0 ? <>
                                <div className="card">
                                    <div className="card-body" id="datatable">
                                        <div style={{}}>
                                            <DynamicTable
                                                listSearch={listSearch}
                                                listKey={"Created Customer Report"}
                                                row={searchData}
                                                rowCount={totalCount}
                                                header={createdCustomerColumns}
                                                itemsPerPage={perPage}
                                                backendPaging={true}
                                                backendCurrentPage={currentPage}
                                                isTableFirstRender={isTableFirstRender}
                                                hasExternalSearch={hasExternalSearch}
                                                exportBtn={exportBtn}
                                                url={properties.REPORTS_API + '/created-customer'}
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

                            </> :
                                <></>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CreatedCustomerReport