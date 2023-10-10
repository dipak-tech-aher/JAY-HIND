/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect, useRef } from 'react'
import { NumberFormatBase } from 'react-number-format';
import { toast } from 'react-toastify';

import DynamicTable from '../../common/table/DynamicTable';
import { properties } from '../../properties';
import { post } from '../../common/util/restUtil';
import { ServiceAdvanceSearchColumns, ServiceAdvanceSearchHiddenColumns } from './ServiceAdvanceSearchColumns';
import { unstable_batchedUpdates } from 'react-dom';
import { validateNumber } from '../../common/util/validateUtil';
import { formFilterObject } from '../../common/util/util';
import { AppContext } from '../../AppContext';
import { Link, useHistory } from "react-router-dom";
const ServiceAdvanceSearch = (props) => {

    const initialValues = {
        customerName: "",
        customerUuid: "",      
        contactNo: ""
    }
    const [isCustomerOrSalesOrderSearch,setIsCustomerOrSalesOrderSearch]  = useState('CUSTOMER')
    const [searchInputs, setSearchInputs] = useState();
    const [displayForm, setDisplayForm] = useState(true);
    const [listSearch, setListSearch] = useState([]);
    const [customerSearchData, setCustomerSearchData] = useState([]);
    const [userPermission, setUserPermission] = useState({
        searchCustomer: "",
        viewCustomer: "",
        createComplaint: '',
        createServiceRequest: '',
        createInquiry: "",
    })
    const isFirstRender = useRef(true);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(true)

    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);
    const history = useHistory();
    const { auth } = useContext(AppContext)

    useEffect(() => {
        if (!isFirstRender.current) {
            getCustomerData();
        }
        else {
            isFirstRender.current = false;
        }
    }, [currentPage, perPage])

    useEffect(() => {
        let rolePermission = []
        
        auth && auth.permissions && auth.permissions.filter(function (e) {
            let property = Object.keys(e)
            if (property[0] === "Customer") {
                let value = Object.values(e)
                rolePermission = { ...rolePermission, customer: Object.values(value[0]) }
            } else if (property[0] === "Complaint") {
                let value = Object.values(e)
                rolePermission = { ...rolePermission, complaint: Object.values(value[0]) }
            }
            else if (property[0] === "Inquiry") {
                let value = Object.values(e)
                rolePermission = { ...rolePermission, inquiry: Object.values(value[0]) }
            }
            else if (property[0] === "Service-Request") {
                let value = Object.values(e)
                rolePermission = { ...rolePermission, serviceRequest: Object.values(value[0]) }
            }
        })

        let searchCust, viewCust, addComplaint, addInquiry, addServiceRequest
        rolePermission?.customer.map((screen) => {
            if (screen.screenName === "Customer Search ") {
                searchCust = screen.accessType
            } else if (screen.screenName === "View Customer") {
                viewCust = screen.accessType
            }
        })
        rolePermission?.complaint.map((screen) => {
            if (screen.screenName === "Add Complaint") {
                addComplaint = screen.accessType
            }
        })
        rolePermission?.inquiry.map((screen) => {
            if (screen.screenName === "Add Inquiry") {
                addInquiry = screen.accessType
            }
        })
        rolePermission?.serviceRequest.map((screen) => {
            if (screen.screenName === "Create Service Request") {
                addServiceRequest = screen.accessType
            }
        })

        setUserPermission({
            searchCustomer: searchCust,
            viewCustomer: viewCust,
            createComplaint: addComplaint,
            createServiceRequest: addServiceRequest,
            createInquiry: addInquiry,
        })


        
        if (userPermission.viewCustomer === 'deny') {
            history.push(`${process.env.REACT_APP_BASE}}`)
        }
    }, [auth])

    const getCustomerData = () => {
        
        const requestBody = {
         //   "searchType": "ADV_SEARCH",
          //  "includeSO" : isCustomerOrSalesOrderSearch === "SALES_ORDER" ? true : false,
            ...searchInputs,
          //  filters: formFilterObject(filters)
        }
        setListSearch(requestBody);
        post(`${properties.ACCOUNT_DETAILS_API}/get-service-list?limit=${perPage}&page=${currentPage}`, requestBody)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {                                      
                        unstable_batchedUpdates(() => {
                            setCustomerSearchData(resp.data);
                        })
                    }
                } 
            }).catch((error) => {
                console.log(error)
            }).finally(() => {
                
                isTableFirstRender.current = false;
            });
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleInputChange = (e) => {
        const target = e.target;
        if (e.target.id === "idType") {
            setSearchInputs({
                ...searchInputs,
                [target.id]: target.value,
                idValue: ""
            })
            return;
        }
        setSearchInputs({
            ...searchInputs,
            [target.id]: target.value
        })
    }


    const handleSubmit = (e) => {
        e.preventDefault();
        // if (searchInputs.serviceNumber.length !== 0) {
        //     if (searchInputs.serviceNumber.length < 3) {
        //         toast.error("Please Enter Minimum 3 digits for Access Number")
        //         return
        //     }
        // }
        // if (searchInputs.accountNumber.length !== 0) {
        //     if (searchInputs.accountNumber.length < 3) {
        //         toast.error("Please Enter Minimum 3 digits for Account Number")
        //         return
        //     }
        // }
        if (searchInputs?.contactNo.length !== 0) {
            if (searchInputs?.contactNo.length < 3) {
                toast.error("Please Enter Minimum 3 digits for Contact Number")
                return
            }
        }
        isFirstRender.current = true;
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
        if (cell.column.id === "serviceNo") {
            return (<span className="text-secondary cursor-pointer" id="CUSTOMERID" onClick={(e) => handleOnCellActionsOrLink(e, row.original, cell.column.Header)}>{cell.value}</span>)
        }
        else if (cell.column.Header === "Action") {
            return (
                <div className="btn-group">
                    <button disabled={userPermission.createComplaint !== 'write'} type="button" id="Complaint"
                        className="skel-btn-submit"
                        onClick={(e) => handleOnCellActionsOrLink(e, row.original, cell.column.Header)}>
                        <i className="mdi mdi-pencil ml-0 mr-2 font-10 vertical-middle" />
                        Create Interaction
                    </button>                    
                </div>               
            )
        }
        return (<span>{cell.value}</span>);
    }

    const handleOnCellActionsOrLink = (event, rowData, header) => {
        const { id } = event.target;
        const { customerUuid, accountUuid, serviceUuid } = rowData;
        console.log('rowData', rowData)
        sessionStorage.setItem("customerUuid", customerUuid)
        sessionStorage.setItem("accountUuid", accountUuid)
        sessionStorage.setItem("serviceUuid", serviceUuid)
        const data = {
            serviceDetails: rowData,
            sourceName: 'customer360',
            type: id
        }
    
        if (userPermission.viewCustomer !== 'deny') {
            // <Link to={{pathname: `${process.env.REACT_APP_BASE}/customer360`, data: data }}/>
           history.push(`${process.env.REACT_APP_BASE}/customer360`, { data })
        }
        
    }

    const handleSearchChange = (type) => {
        setIsCustomerOrSalesOrderSearch(type)
        setSearchInputs(initialValues);
        setCustomerSearchData([]);
        setFilters([])
    }

    return (
        <>{userPermission?.searchCustomer !== 'deny' &&
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box">
                            <h4 className="page-title">Customer Advance Search</h4>
                        </div>
                    </div>
                </div>
                <div className="row mt-1">
                    <div className="col-lg-12">
                        <div className="search-result-box m-t-30 card-box">
                            {/* <div className="row">
                                <div className="text-center cus-srch clearfix">
                                    <button type="button" className={`search-btn1 btn waves-effect waves-light btn-primary ${isCustomerOrSalesOrderSearch === 'CUSTOMER' && 'active'}`}  onClick={() => {handleSearchChange('CUSTOMER')}}> Customer Search</button>
                                    <button type="button" className={`search-btn1 btn1 waves-effect waves-light btn-primary ${isCustomerOrSalesOrderSearch === 'SALES_ORDER' && 'active'}`} onClick={() => {handleSearchChange('SALES_ORDER')}}> Service Search</button>
                                </div>
                            </div> */}
                            <div id="searchBlock" className="modal-body p-2 d-block">
                                <div className="d-flex justify-content-end">
                                    <h6 className="text-primary cursor-pointer" onClick={() => { setDisplayForm(!displayForm) }}>{displayForm ? "Hide Search" : "Show Search"}</h6>
                                </div>
                                {
                                    displayForm && (
                                        <form onSubmit={handleSubmit}>
                                            <div className="row">                                                
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="serviceNo" className="control-label">Service Number</label>
                                                        <input
                                                            value={searchInputs?.serviceNo}
                                                            onKeyPress={(e) => {
                                                                validateNumber(e);
                                                                if (e.key === "Enter") {
                                                                    handleSubmit(e)
                                                                };
                                                            }}
                                                            onChange={handleInputChange}
                                                            type="text"
                                                            className="form-control"
                                                            id="serviceNo"
                                                            placeholder="Enter Service Number"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="serviceName" className="control-label">Service Name</label>
                                                        <input
                                                            value={searchInputs?.serviceName}
                                                            onChange={handleInputChange}
                                                            type="text"
                                                            className="form-control"
                                                            id="serviceName"
                                                            placeholder="Enter Service Name"
                                                        />
                                                    </div>
                                                </div>
                                                {/* <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="accountNo" className="control-label">Account Number</label>
                                                        <input
                                                            maxLength={7}
                                                            onKeyPress={(e) => {
                                                                validateNumber(e);
                                                                if (e.key === "Enter") {
                                                                    handleSubmit(e)
                                                                };
                                                            }}
                                                            value={searchInputs?.accountNo}
                                                            onChange={handleInputChange}
                                                            type="text"
                                                            className="form-control"
                                                            id="accountNo"
                                                            placeholder="Account Number"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="customerNo" className="control-label">Customer Number</label>
                                                        <input
                                                            maxLength={7}
                                                            onKeyPress={(e) => {
                                                                validateNumber(e);
                                                                if (e.key === "Enter") {
                                                                    handleSubmit(e)
                                                                };
                                                            }}
                                                            value={searchInputs?.accountNo}
                                                            onChange={handleInputChange}
                                                            type="text"
                                                            className="form-control"
                                                            id="customerNo"
                                                            placeholder="Customer Number"
                                                        />
                                                    </div>
                                                </div>                                                 */}
                                            </div>                                        
                                            <div className="col-md-12 text-center mt-2">
                                                <button type="submit" className="btn btn-primary waves-effect waves- mr-2" onClick={getCustomerData}>Search</button>
                                                <button type="button" className="btn btn-secondary waves-effect waves-light" onClick={() => { setSearchInputs(initialValues); setCustomerSearchData([]); }}>Clear</button>
                                            </div>
                                        </form>
                                    )
                                }
                            </div>                        
                            <div className="row mt-2">
                                <div className="col-lg-12">
                                    {
                                        customerSearchData?.length > 0 ?
                                        <div className="card">
                                            <div className="card-body" id="datatable">
                                                <div style={{}}>
                                                    <DynamicTable
                                                        listSearch={listSearch}
                                                        listKey={"Service Advance Search"}
                                                        row={customerSearchData}
                                                        rowCount={totalCount}
                                                        header={ServiceAdvanceSearchColumns }
                                                        itemsPerPage={perPage}
                                                        hiddenColumns={ServiceAdvanceSearchHiddenColumns} 
                                                        backendPaging={true}
                                                        columnFilter={true}
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
                                        </div>
                                        :<>
                                        <p> No Records to Display</p>
                                        </>
                                    }
                                </div>
                            </div>                                                       
                        </div>
                    </div >
                </div >
            </div >}
        </>
    );
}

export default ServiceAdvanceSearch;