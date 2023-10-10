/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState, useEffect, useRef } from 'react'
import { NumberFormatBase } from 'react-number-format';
import { toast } from 'react-toastify';

import DynamicTable from '../../common/table/DynamicTable';
import { properties } from '../../properties';
import { post } from '../../common/util/restUtil';
import { CustomerSearchColumns as CustomerSearchColumnsProp, CustomerSearchHiddenColumns } from "./customerSearchColumns";
import { unstable_batchedUpdates } from 'react-dom';
import { validateNumber } from '../../common/util/validateUtil';
import { formFilterObject } from '../../common/util/util';
import moment from 'moment'
import { history } from '../../common/util/history';

const SearchCustomer = (props) => {
    const { appsConfig } = props;
    const source = props?.data?.source
    const sourceName = props?.location?.data?.sourceName || ""
    // const setDisplaySearchCustomer = props?.data?.setDisplaySearchCustomer || ''
    const [CustomerSearchColumns, setCustomerSearchColumns] = useState([])
    const [isRefresh, setIsRefresh] = useState(false)

    useEffect(() => {
        setCustomerSearchColumns(CustomerSearchColumnsProp?.map(x => {
            if (["customerUuid", "customerNo", "customerName", "customerServiceStatus"].includes(x.id)) {
                if (appsConfig && appsConfig.clientFacingName && appsConfig.clientFacingName['Customer'.toLowerCase()]) {
                    x.Header = x.Header?.replace('Customer', appsConfig?.clientFacingName['Customer'.toLowerCase()] || 'Customer');
                }
            }
            return x;
        }))
    }, [isRefresh])

    const initialValues = {
        customerName: "",
        customerNo: "",
        customerRefNo: "",
        mobileNo: "",
        emailId: ""

    }
    const [hideAccount, setHideAccount] = useState(false)

    // const [customerTypeLookup, setCustomerTypeLookup] = useState([])
    const [searchInput, setSearchInput] = useState(initialValues);
    const [displayForm, setDisplayForm] = useState(true);
    const [listSearch, setListSearch] = useState([]);
    const [customerSearchData, setCustomerSearchData] = useState([]);
    const [userPermission, setUserPermission] = useState({
        searchCustomer: "write",
        viewCustomer: "write",
        createComplaint: "write",
        createServiceRequest: "write",
        createInquiry: "write",
    })
    const isFirstRender = useRef(true);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(false)

    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);

    useEffect(() => {
        if (source === 'CUSTOMER_CREATION') {
            getCustomerData()
        }

    }, [source])

    // useEffect(() => {
    //     
    //     post(properties.BUSINESS_ENTITY_API, ['CUSTOMER_TYPE'])
    //         .then((response) => {
    //             if (response.data) {
    //                 setCustomerTypeLookup(response.data['CUSTOMER_TYPE'])
    //             }
    //         })
    //         .finally()
    // }, [])

    useEffect(() => {
        if (!isFirstRender.current) {
            getCustomerData()
        }
        else {
            isFirstRender.current = false;
        }
    }, [perPage, currentPage])

    // useEffect(() => {
    //     if (!isFirstRender.current) {
    //         getCustomerData();
    //     }
    //     else {
    //         isFirstRender.current = false;
    //     }
    // }, [currentPage, perPage])

    const getCustomerData = () => {
        let statuses = []
        if (sourceName === 'existing_application') {
            statuses = ['CS_TEMP', 'CS_PROSPECT']
        } else {
            statuses = ['CS_ACTIVE', 'CS_PEND']
            if (!searchInput.customerName && !searchInput.mobileNo && !searchInput.customerNo && !searchInput.customerRefNo && !searchInput?.emailId) {
                toast.error("Validation errors found. Please provide any one field");
                return false
            }
        }

        const requestBody = {
            filters: formFilterObject(filters),
            ...searchInput,
            status: statuses
        }

        setListSearch(requestBody);
        post(`${properties.CUSTOMER_API}/get-customer?limit=${perPage}&page=${currentPage}`, requestBody)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        const { count, rows } = resp.data;
                        unstable_batchedUpdates(() => {
                            setTotalCount(0)
                            setCustomerSearchData([]);
                        })

                        if (Number(count) > 0) {
                            unstable_batchedUpdates(() => {
                                setTotalCount(count)
                                setCustomerSearchData(rows);
                            })
                        }
                        else {
                            toast.error("Records Not found");
                            setFilters([]);
                        }
                    } else {
                        setCustomerSearchData([]);
                        toast.error("Records Not Found");
                    }
                } else {
                    setCustomerSearchData([]);
                    toast.error("Records Not Found");
                }
            }).catch((error) => {
                console.error(error)
                toast.error(error.message)
            })
            .finally(() => {
                isTableFirstRender.current = false;
            });

    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleInputChange = (e) => {
        const target = e.target;
        if (e.target.id === "idType") {
            setSearchInput({
                ...searchInput,
                [target.id]: target.value,
                idValue: ""
            })
            return;
        }
        setSearchInput({
            ...searchInput,
            [target.id]: target.value
        })
    }


    const handleSubmit = (e) => {
        setIsRefresh(!isRefresh)
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

    const handleDecision = (e) => {
        e.preventDefault();
        // setDisplaySearchCustomer(false)
    }



    const handleCellRender = (cell, row) => {
        if (cell.column.id === "customerNo") {
            return (<span className="text-secondary cursor-pointer" id="CUSTOMERID" onClick={(e) => handleOnCellActionsOrLink(row.original)}>{cell.value}</span>)
        }
        else if (cell.column.Header === "Account Id") {
            if (!row?.original?.account[0]?.accountId) {
                setHideAccount(true)
            }
            let accountId = (row?.original?.account[0]?.accountId)
            return (<span>{accountId}</span>);
        }
        else if (cell.column.id === "customerName") {
            let name = (row?.original?.firstName || "") + " " + (row?.original?.lastName || "")
            return (<span>{name}</span>);
        }
        else if (['Updated At', 'Created At'].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>);
        }
        else if (['Created By'].includes(cell.column.Header)) {
            let name = (row?.original?.createdByName?.firstName || "") + " " + (row?.original?.createdByName?.lastName || "")
            return (<span>{name}</span>);
        }
        else if (['Updated By'].includes(cell.column.Header)) {
            let name = (row?.original?.updatedByName?.firstName || "") + " " + (row?.original?.updatedByName?.lastName || "")
            return (<span>{name}</span>);
        }
        return (<span>{cell.value}</span>);
    }

    const handleOnCellActionsOrLink = (rowData) => {
        console.log('rowData?.customerId--------->', rowData);
        sessionStorage.setItem("customerUuid", rowData?.customerUuid || null);
        sessionStorage.setItem("customerIds", rowData?.customerId || null)
        if (sourceName && sourceName === 'customerDetailView') { //customerDetailView
            const data = {
                ...rowData,
                sourceName: 'customer360'
            }
            history.push(`${process.env.REACT_APP_BASE}/customer360`, { data })
        } else if (sourceName && sourceName === 'existing_application') {
            const data = {
                customerDetails: rowData,
                pageIndex: 1,
                edit: true
            }
            history.push(`${process.env.REACT_APP_BASE}/new-customer`, { data })
        } else {
            const data = {
                customerDetails: rowData,
                pageIndex: 1,
                edit: true
            }
            history.push(`${process.env.REACT_APP_BASE}/view-customer`, { data })
        }

    }


    const [customizedLable, setCustomizedLable] = useState('')
    useEffect(() => {
        console.log('------xxx---------->', appsConfig?.clientFacingName)
        if (appsConfig?.clientFacingName) {
            for (const key in appsConfig.clientFacingName) {
                console.log('appsConfig.clientFacingName[key]-------->',key)
                if (key === 'Customer'.toLowerCase()) {
                    console.log('appsConfig?.clientFacingName[key]------>',appsConfig?.clientFacingName[key])
                    setCustomizedLable(appsConfig?.clientFacingName[key]);
                    break;
                } else {
                    setCustomizedLable('Customer')
                }
            }
        }

        // console.log('------typeof---------->',typeof(appsConfig.clientFacingName['Customer'.toLowerCase()])==="string")
        // if (appsConfig && appsConfig.clientFacingName && typeof(appsConfig.clientFacingName['Customer'.toLowerCase()])==="string") {
        //     console.log('herx------------>',appsConfig?.clientFacingName)
        //     setCustomizedLable(appsConfig?.clientFacingName['Customer'.toLowerCase()] || 'Customer')
        // }
    }, [appsConfig])


    return (
        <>{userPermission?.searchCustomer !== 'deny' &&
            <div className="container-fluid cmmn-skeleton mt-2">
                <div className="row mt-1">
                    <div className="col-lg-12">
                        <div className="search-result-box m-t-30">
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
                                                        <label htmlFor="customerNo" className="control-label">{customizedLable} No</label>
                                                        <input type="text" className="form-control" placeholder={`${customizedLable} No`} autoComplete="off"
                                                            onChange={(e) => { setSearchInput({ ...searchInput, customerNo: e.target.value }); }}
                                                            value={searchInput?.customerNo} onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleSubmit(e)
                                                                }
                                                            }}
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="customerRefNo" className="control-label">{customizedLable} Reference No</label>
                                                        <input type="text" className="form-control" placeholder={`${customizedLable} Reference No`} autoComplete="off"
                                                            onChange={(e) => { setSearchInput({ ...searchInput, customerRefNo: e.target.value }); }}
                                                            value={searchInput?.customerRefNo} onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleSubmit(e)
                                                                }
                                                            }}
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="customerName" className="control-label">{customizedLable} Name</label>
                                                        <input type="text" className="form-control" placeholder={`${customizedLable} Name`} autoComplete="off"
                                                            onChange={(e) => { setSearchInput({ ...searchInput, customerName: e.target.value }); }} onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleSubmit(e)
                                                                }
                                                            }}
                                                            value={searchInput?.customerName}
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="cntnumber" className="control-label">Contact No</label>
                                                        <NumberFormatBase className="form-control" placeholder="Contact Number" autoComplete="off"
                                                            onChange={(e) => { setSearchInput({ ...searchInput, mobileNo: e.target.value }); }}
                                                            value={searchInput?.mobileNo} onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleSubmit(e)
                                                                }
                                                            }}
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="emailId" className="control-label">Email ID</label>
                                                        <input type="email" className="form-control" placeholder="Email ID" autoComplete="off"
                                                            onChange={(e) => { setSearchInput({ ...searchInput, emailId: e.target.value }); }}
                                                            value={searchInput?.emailId} onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    handleSubmit(e)
                                                                }
                                                            }}
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-12 text-center mt-2 skel-customer-search-btn-list">
                                                <button type="button" className="skel-btn-cancel" onClick={() => { setSearchInput(initialValues); setCustomerSearchData([]); }}>Clear</button>
                                                {/* <button type="button" className="skel-btn-submit" onClick={() => { setCurrentPage(0); getCustomerData() }}>Search</button> */}
                                                <button type="button" className="skel-btn-submit" onClick={handleSubmit}>Search</button>
                                                {
                                                    sourceName === 'existing_application' &&
                                                    <button type="button" className="skel-btn-submit" onClick={() => { history.push(`${process.env.REACT_APP_BASE}/new-customer`) }}>Skip and proceed <i className="material-icons">arrow_forward</i></button>
                                                }

                                                {/* <button type="button" className="btn btn-secondary waves-effect waves-light" onClick={() => { setSearchInput(initialValues); setCustomerSearchData([]); setHideAccount(false) }}>Clear</button> */}
                                            </div>
                                        </form>
                                    )
                                }
                            </div>
                            {
                                customerSearchData.length > 0 ?
                                    <div className="row mt-2">
                                        <div className="col-lg-12">
                                            {
                                                !!customerSearchData.length &&
                                                < div className="">
                                                    <div className="" id="datatable">
                                                        <div style={{}}>
                                                            <DynamicTable
                                                                listSearch={listSearch}
                                                                listKey={"Search Customer"}
                                                                row={customerSearchData}
                                                                rowCount={totalCount}
                                                                header={CustomerSearchColumns}
                                                                itemsPerPage={perPage}
                                                                backendPaging={true}
                                                                backendCurrentPage={currentPage}
                                                                isTableFirstRender={isTableFirstRender}
                                                                hasExternalSearch={hasExternalSearch}
                                                                method={"POST"}
                                                                exportBtn={exportBtn}
                                                                hiddenColumns={CustomerSearchHiddenColumns}
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
                                            }
                                        </div>
                                    </div> : sourceName && sourceName === 'existing_application' ?
                                        <div className='col-md-12 text-center mt-4'>
                                            {/* <span className='skel-widget-warning'>No Record Found!!! Do you want to create new customer? <button type="button" className="skel-btn-submit skel-cust-circle" onClick={handleDecision}>Yes, please proceed <i className="material-icons">arrow_forward</i></button></span>                                          */}
                                        </div> :
                                        <></>
                            }
                        </div>
                    </div >
                </div >
            </div >}
        </>
    );
}

export default SearchCustomer;