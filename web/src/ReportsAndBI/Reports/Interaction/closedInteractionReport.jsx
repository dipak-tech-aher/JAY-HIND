/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify';

import DynamicTable from '../../../common/table/DynamicTable';
import { properties } from '../../../properties';
import { post, get } from '../../../common/util/restUtil';
import { unstable_batchedUpdates } from 'react-dom';
// import { formFilterObject } from '../../../common/util/util';
import closedInteractionColumns from './Columns/closedInteractionColumns';
import { formatISODateDDMMMYY } from "../../../common/util/dateUtil";
import moment from 'moment';
import { removeEmptyKey } from '../../../common/util/util';

const ClosedInteractionReport = (props) => {

    const initialValues = {
        interactionId: "",
        interactionType: "",
        interactionStatus: "",
        customerCategory: "",
        customerNo: "",
        customerName: "",
        dateFrom: moment().subtract('1', 'month').format('YYYY-MM-DD'),
        dateTo: moment().format('YYYY-MM-DD'),
    }
    const [searchInputs, setSearchInputs] = useState(initialValues);
    const [displayForm, setDisplayForm] = useState(true);
    const [listSearch, setListSearch] = useState({ excel: true });
    const [searchData, setSearchData] = useState([]);

    const isFirstRender = useRef(true);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(true)

    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);

    const [interactionTypeLookup, setInteractionTypeLookup] = useState([]);
    // const [woTypeLookup, setWoTypeLookup] = useState([]);
    const [statusLookup, setStatusLookup] = useState([]);
    const [custTypeLookup, setCustTypeLookup] = useState([]);
    // const [problemTypeLookup, setProblemTypeLookup] = useState([]);

    useEffect(() => {
        get(properties.BUSINESS_ENTITY_API + '?searchParam=code_type&valueParam=INTXN_TYPE,INTERACTION_STATUS,CUSTOMER_CATEGORY')
            .then((response) => {
                if (response.data) {
                    let lookupData = response.data;
                    setInteractionTypeLookup(lookupData['INTXN_TYPE']);
                    setCustTypeLookup(lookupData['CUSTOMER_CATEGORY']);
                    setStatusLookup(lookupData['INTERACTION_STATUS']);
                }
            }).catch(error => console.log(error))
    }, [])

    useEffect(() => {
        if (!isFirstRender.current) {
            getLoginDetails();
        }
        else {
            isFirstRender.current = false;
        }
    }, [currentPage, perPage])

    const getLoginDetails = () => {

        let requestBody = {
            ...searchInputs,
            excel: false
        }
        requestBody = Object.fromEntries(
            Object.entries(requestBody).filter(([_, value]) => value !== undefined && value !== null && value !== "")
          );
          setListSearch({...requestBody,  excel: true})

        //setSearchInputs(initialValues)
        post(`${properties.REPORTS_API}/closed-interactions?limit=${perPage}&page=${currentPage}`, requestBody)
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

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Created On" || cell.column.Header === "Closed On") {
            return (
                <span>{cell.value ? formatISODateDDMMMYY(cell.value) : '-'}</span>
            )
        }
        else
            return (<span>{cell.value}</span>)
    }

    const handleOnCellActionsOrLink = (event, rowData, header) => {

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
                                                    <label htmlFor="interactionID" className="control-label">Interaction ID</label>
                                                    <input value={searchInputs.interactionID}
                                                        // onKeyPress={(e) => {
                                                        //     if (e.key === "Enter") {
                                                        //         handleSubmit(e)
                                                        //     };
                                                        // }}
                                                        onChange={handleInputChange} type="text" className="form-control" id="interactionId"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="interactionType" className="control-label">Interaction Type</label>
                                                    <select className="form-control" id="interactionType" value={searchInputs.interactionType} onChange={handleInputChange}>
                                                        <option value="">Select Interaction Type</option>
                                                        {
                                                            interactionTypeLookup && interactionTypeLookup.map((e) => (
                                                                <option key={e.code} value={e.code}>{e.description}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>
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
                                            {/* <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="Customer Category" className="control-label">Customer Category</label>
                                                    <select className="form-control" id="customerCategory" value={searchInputs.customerCategory} onChange={handleInputChange}>
                                                        <option value="">Select Customer Category</option>
                                                        {
                                                            custTypeLookup && custTypeLookup.map((e) => (
                                                                <option key={e.code} value={e.code}>{e.description}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div> */}
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="customerNo" className="control-label">Customer No</label>
                                                    <input value={searchInputs.customerNo} onChange={handleInputChange} type="text" className="form-control" id="customerNo"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="Customer Name" className="control-label">Customer Name</label>
                                                    <input type="text" value={searchInputs.customerName} onChange={handleInputChange} className="form-control" id="customerName"
                                                    />
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
                            searchData && searchData.length > 0 && <>
                                <div className="card">
                                    <div className="card-body" id="datatable">
                                        <div style={{}}>
                                            <DynamicTable
                                                listSearch={listSearch}
                                                listKey={"closed Interaction Report"}
                                                row={searchData}
                                                rowCount={totalCount}
                                                header={closedInteractionColumns}
                                                itemsPerPage={perPage}
                                                backendPaging={true}
                                                backendCurrentPage={currentPage}
                                                isTableFirstRender={isTableFirstRender}
                                                hasExternalSearch={hasExternalSearch}
                                                exportBtn={exportBtn}
                                                url={properties.REPORTS_API + '/closed-interactions'}
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


        // <div className="card pt-1">
        //     <div className="container-fluid">
        //         <div className="form-row pb-2">
        //             <div className="col-12">
        //                 <section className="triangle">
        //                     <div className="col-12 row">
        //                         <div className="col-12"><h4 className="pl-3">Closed Interaction Report</h4></div>
        //                     </div>
        //                 </section>
        //             </div>
        //         </div>
        //         <div className="border p-2">
        //             <div className="col-12 p-2">
        //                 <div className="bg-light border pr-0 p-0 row"><div className="col"><h5 className="text-primary pl-2 pt-1">Search</h5></div>
        //                     <div className="col pt-1">
        //                         <div className="d-flex justify-content-end">
        //                             <h6 className="cursor-pointer" style={{ color: "#142cb1", float: "right" }} onClick={() => { setDisplayForm(!displayForm) }}>{displayForm ? "Hide Search" : "Show Search"}</h6>
        //                         </div>
        //                     </div>
        //                 </div>
        //                 <div id="searchBlock" className="modal-body p-2 d-block">
        //                     {
        //                         displayForm && (
        //                             <form onSubmit={handleSubmit}>
        //                                 <div className="search-result-box p-0">
        //                                     <div className="autoheight p-1">
        //                                         <section>
        //                                             <div className="form-row pb-2 col-12">
        //                                                 <div className="col-3">
        //                                                     <div className="form-group">
        //                                                         <label htmlFor="interactionID" className="control-label">Interaction ID</label>
        //                                                         <input
        //                                                             value={searchInputs.interactionID}
        //                                                             onKeyPress={(e) => {
        //                                                                 if (e.key === "Enter") {
        //                                                                     handleSubmit(e)
        //                                                                 };
        //                                                             }}
        //                                                             onChange={handleInputChange}
        //                                                             type="text"
        //                                                             className="form-control"
        //                                                             id="interactionID"
        //                                                         />
        //                                                     </div>
        //                                                 </div>
        //                                                 <div className="col-3">
        //                                                     <div className="form-group">
        //                                                         <label htmlFor="interactionType" className="control-label">Interaction Type</label>
        //                                                         <select className="form-control" id="interactionType" value={searchInputs.interactionType} onChange={handleInputChange}>
        //                                                             <option value="">Select Interaction Type</option>
        //                                                             {
        //                                                                 interactionTypeLookup && interactionTypeLookup.map((e) => (
        //                                                                     <option key={e.code} value={e.code}>{e.description}</option>
        //                                                                 ))
        //                                                             }
        //                                                         </select>
        //                                                     </div>
        //                                                 </div>
        //                                                 <div className="col-3">
        //                                                     <div className="form-group">
        //                                                         <label htmlFor="woType" className="control-label">Work Order Type</label>
        //                                                         <select className="form-control" id="woType" value={searchInputs.woType} onChange={handleInputChange}>
        //                                                             <option value="">Select Work Order Type</option>
        //                                                             {
        //                                                                 woTypeLookup && woTypeLookup.map((e) => (
        //                                                                     <option key={e.code} value={e.code}>{e.description}</option>
        //                                                                 ))
        //                                                             }
        //                                                         </select>
        //                                                     </div>
        //                                                 </div>
        //                                                 <div className="col-3">
        //                                                     <div className="form-group">
        //                                                         <label htmlFor="status" className="control-label">Status</label>
        //                                                         <select className="form-control" id="status" value={searchInputs.status} onChange={handleInputChange}>
        //                                                             <option value="">Select Status</option>
        //                                                             {
        //                                                                 statusLookup && statusLookup.map((e) => (
        //                                                                     <option key={e.code} value={e.code}>{e.description}</option>
        //                                                                 ))
        //                                                             }
        //                                                         </select>
        //                                                     </div>
        //                                                 </div>
        //                                                 <div className="col-3">
        //                                                     <div className="form-group">
        //                                                         <label htmlFor="customerType" className="control-label">Customer Type</label>
        //                                                         <select className="form-control" id="customerType" value={searchInputs.customerType} onChange={handleInputChange}>
        //                                                             <option value="">Select Customer Type</option>
        //                                                             {
        //                                                                 customerTypeLookup && customerTypeLookup.map((e) => (
        //                                                                     <option key={e.code} value={e.code}>{e.description}</option>
        //                                                                 ))
        //                                                             }
        //                                                         </select>
        //                                                     </div>
        //                                                 </div>
        //                                                 <div className="col-3">
        //                                                     <div className="form-group">
        //                                                         <label htmlFor="problemType" className="control-label">Problem Type</label>
        //                                                         <select className="form-control" id="problemType" value={searchInputs.problemType} onChange={handleInputChange}>
        //                                                             <option value="">Select Problem Type</option>
        //                                                             {
        //                                                                 problemTypeLookup && problemTypeLookup.map((e) => (
        //                                                                     <option key={e.code} value={e.code}>{e.description}</option>
        //                                                                 ))
        //                                                             }
        //                                                         </select>
        //                                                     </div>
        //                                                 </div>
        //                                                 <div className="col-3">
        //                                                     <div className="form-group">
        //                                                         <label htmlFor="customerNo" className="control-label">Customer No</label>
        //                                                         <input
        //                                                             value={searchInputs.customerNo}
        //                                                             onKeyPress={(e) => {
        //                                                                 if (e.key === "Enter") {
        //                                                                     handleSubmit(e)
        //                                                                 };
        //                                                             }}
        //                                                             onChange={handleInputChange}
        //                                                             type="text"
        //                                                             className="form-control"
        //                                                             id="customerNo"
        //                                                         />
        //                                                     </div>
        //                                                 </div>
        //                                                 <div className="col-3">
        //                                                     <div className="form-group">
        //                                                         <label htmlFor="customerNumber" className="control-label">Customer Name</label>
        //                                                         <input
        //                                                             value={searchInputs.customerName}
        //                                                             onKeyPress={(e) => {
        //                                                                 if (e.key === "Enter") {
        //                                                                     handleSubmit(e)
        //                                                                 };
        //                                                             }}
        //                                                             onChange={handleInputChange}
        //                                                             type="text"
        //                                                             className="form-control"
        //                                                             id="customerName"
        //                                                         />
        //                                                     </div>
        //                                                 </div>
        //                                                 <div className="col-3">
        //                                                     <div className="form-group">
        //                                                         <label htmlFor="billRefNumber" className="control-label">Billable Referance Number</label>
        //                                                         <input
        //                                                             value={searchInputs.billRefNumber}
        //                                                             onKeyPress={(e) => {
        //                                                                 if (e.key === "Enter") {
        //                                                                     handleSubmit(e)
        //                                                                 };
        //                                                             }}
        //                                                             onChange={handleInputChange}
        //                                                             type="text"
        //                                                             className="form-control"
        //                                                             id="billRefNumber"
        //                                                         />
        //                                                     </div>
        //                                                 </div>
        //                                                 <div className="col-3">
        //                                                     <div className="form-group">
        //                                                         <label htmlFor="customerNumber" className="control-label">Service No</label>
        //                                                         <input
        //                                                             value={searchInputs.serviceNo}
        //                                                             onKeyPress={(e) => {
        //                                                                 if (e.key === "Enter") {
        //                                                                     handleSubmit(e)
        //                                                                 };
        //                                                             }}
        //                                                             onChange={handleInputChange}
        //                                                             type="text"
        //                                                             className="form-control"
        //                                                             id="serviceNo"
        //                                                         />
        //                                                     </div>
        //                                                 </div>
        //                                                 <div className="col-3">
        //                                                     <div className="form-group">
        //                                                         <label htmlFor="dateFrom" className="control-label">Date From</label>
        //                                                         <input type="date" id="dateFrom" className="form-control"
        //                                                             value={searchInputs.dateFrom}
        //                                                             onKeyPress={(e) => {
        //                                                                 if (e.key === "Enter") {
        //                                                                     handleSubmit(e)
        //                                                                 };
        //                                                             }}
        //                                                             onChange={handleInputChange}
        //                                                         />
        //                                                     </div>
        //                                                 </div>
        //                                                 <div className="col-3">
        //                                                     <div className="form-group">
        //                                                         <label htmlFor="dateTo" className="control-label">Date To</label>
        //                                                         <input type="date" id="dateTo" className="form-control"
        //                                                             value={searchInputs.dateTo}
        //                                                             onKeyPress={(e) => {
        //                                                                 if (e.key === "Enter") {
        //                                                                     handleSubmit(e)
        //                                                                 };
        //                                                             }}
        //                                                             onChange={handleInputChange}
        //                                                         />
        //                                                     </div>
        //                                                 </div>
        //                                             </div>
        //                                             <div className="col-md-12 text-center mt-2">
        //                                                 <button type="submit" className="btn btn-primary waves-effect waves- mr-2" >Search</button>
        //                                                 <button type="button" className="btn btn-secondary waves-effect waves-light" onClick={() => { setSearchInputs(initialValues); setSearchData([]); }}>Clear</button>
        //                                             </div>
        //                                         </section>
        //                                     </div>
        //                                 </div>
        //                             </form>
        //                         )
        //                     }
        //                 </div>
        //             </div>
        //         </div>
        //         {
        //             !!searchData.length &&
        //             <div className="row mt-2">
        //                 <div className="col-lg-12">
        //                     {
        //                         !!searchData.length &&
        //                         <div className="card">
        //                             <div className="card-body" id="datatable">
        //                                 <div style={{}}>
        //                                     <DynamicTable
        //                                         listSearch={listSearch}
        //                                         listKey={"Closed Interaction Report"}
        //                                         row={searchData}
        //                                         rowCount={totalCount}
        //                                         header={closedInteractionColumns}
        //                                         itemsPerPage={perPage}
        //                                         backendPaging={true}
        //                                         backendCurrentPage={currentPage}
        //                                         isTableFirstRender={isTableFirstRender}
        //                                         hasExternalSearch={hasExternalSearch}
        //                                         exportBtn={exportBtn}
        //                                         url={properties.REPORTS_API + '/closedInteractionSearch'}
        //                                         method={'POST'}
        //                                         handler={{
        //                                             handleCellRender: handleCellRender,
        //                                             handlePageSelect: handlePageSelect,
        //                                             handleItemPerPage: setPerPage,
        //                                             handleCurrentPage: setCurrentPage,
        //                                             handleFilters: setFilters,
        //                                             handleExportButton: setExportBtn
        //                                         }}
        //                                     />
        //                                 </div>
        //                             </div>
        //                         </div>
        //                     }
        //                 </div>
        //             </div>
        //         }
        //     </div>
        // </div>
    );
}

export default ClosedInteractionReport;