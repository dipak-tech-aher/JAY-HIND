import React, { useEffect, useRef, useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { properties } from '../../properties';
import { post } from '../../common/util/restUtil';
import { unstable_batchedUpdates } from 'react-dom';

import { NumberFormatBase } from 'react-number-format';
import { history } from '../../common/util/history';
import DynamicTable from '../../common/table/DynamicTable';
import { AccountSearchColumns } from './AccountSearchColumns';
import { formFilterObject } from '../../common/util/util';
import { AppContext } from '../../AppContext';

const SearchAccount = () => {

    const initialValues = {
        soNumber: "",
        billRefNo: '',
        customerNumber: '',
        customerName: '',
        contractId: ''
    }

    const { auth } = useContext(AppContext)
    const [userPermission, setUserPermission] = useState({ searchAccount: false, viewAccount: false })
    const [accountSearchParams, setAccountSearchParams] = useState(initialValues)
    const [accountList, setAccountList] = useState([])
    const [displayForm, setDisplayForm] = useState(true);
    const [exportBtn, setExportBtn] = useState(true)
	const [listSearch, setListSearch] = useState([])
    const [isNormalSearch, setIsNormalSearch] = useState(true)
    const isFirstRender = useRef(true);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);

    useEffect(() => {
        if (!isFirstRender.current) {
            getAccountSearchData();
        }
        else {
            isFirstRender.current = false;
        }
    }, [currentPage, perPage])


    useEffect(() => {
        // if (props.data === undefined) { setIsOpen(false) }
        let rolePermission = []
        
        auth && auth.permissions && auth.permissions.filter(function (e) {
            let property = Object.keys(e)
            if (property[0] === "Account") {
                let value = Object.values(e)
                rolePermission = Object.values(value[0])
            }
        })

        let search, view;
        rolePermission.map((screen) => {
            if (screen.screenName === "Search Account") {
                search = screen.accessType
            }

        })
        rolePermission.map((screen) => {
            if (screen.screenName === "View Account") {
                view = screen.accessType
            }

        })
        setUserPermission({ searchAccount: search, viewAccount: view })

        
    }, [auth])
    const getAccountSearchData = () => {
        
        const requestBody = {
            ...accountSearchParams,
            filters: formFilterObject(filters)
        }
		setListSearch(requestBody);
        post(`${properties.CONTRACT_API}/account/search?limit=${perPage}&page=${currentPage}`, requestBody)
            .then((resp) => {
                if (resp.data) {
                    if (Number(resp?.data?.count) > 0) {
                        const { count, rows } = resp.data;
                
                        unstable_batchedUpdates(() => {
                            setTotalCount(count)
                            setAccountList(rows);
                        })
                    }
                    else {
                        toast.error('Record Not Found')
                        //setAccountList([])
                        setFilters([])
                        if (filters.length == 0) {
                            setAccountList([])
                        }
                    }
                }
            }).catch(error => console.log(error)).finally(() => {
                
                //isFirstRender.current = true
                isTableFirstRender.current = false;
            });
    }

    const handlePageSelect = (pageNo) => {
        //isFirstRender.current = false
        setCurrentPage(pageNo)
    }

    const handleInputChange = (e) => {
        const target = e.target;
        setAccountSearchParams({
            ...accountSearchParams,
            [target.id]: target.value
        })
    }

    const handleAccountDetailsView = (data) => {
        let body = {
            billRefNo: data?.accountNo,
            contractId: data?.contract[0]?.contractId,
            customerNumber: data?.customer?.crmCustomerNo,
            customerName: data?.customer?.firstName + " " + data?.customer?.lastName,
            customerData: data?.customer
        }
        if (userPermission?.viewAccount !== "deny") {
            history.push(`${process.env.REACT_APP_BASE}/account-billing-details-view`, {
                data: {
                    accountData: [body]
                }
            })
        } else return

    }

    const handleCellRender = (cell, row) => {

        if (cell.column.Header === "Billable Reference Number") {
            let billRefNo = row?.original?.accountNo
            return (
                <span className="text-secondary cursor-pointer"
                    onClick={() => { handleAccountDetailsView(row.original) }}
                >
                    {billRefNo}
                </span>
            )
        }
        else if (cell.column.Header === "Customer Number") {
            let cNo = row?.original?.customer?.crmCustomerNo
            return (
                <span>{cNo}</span>
            )
        }
        else if (cell.column.Header === "Currency") {
            let currencyDesc = row?.original?.customer?.billableDetails[0]?.currencyDesc?.description || '-'
            return (
                <span>{currencyDesc}</span>
            )
        }
        else if (cell.column.Header === "Customer Name") {
            let name = row?.original?.customer?.firstName + " " + row?.original?.customer?.lastName
            return (
                <span>{name}</span>
            )
        }
        else if (cell.column.Header === "Service ID") {
            let no = row?.original?.contract[0]?.contractDetail[0]?.soNumber
            return (
                <span>{no}</span>
            )
        }
        return (
            <span>{cell.value}</span>
        )
    }

    const handleClear = () => {
        setAccountSearchParams(initialValues)
        setAccountList([])
        setFilters([])
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        //isFirstRender.current = false
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

    return (
        <div>{userPermission?.searchAccount !== "deny" &&
            <div className="container-fluid">
                <div className="row">
                    <div className="col-12">
                        <div className="page-title-box">
                            <h4 className="page-title">Account Search</h4>
                        </div>
                    </div>
                </div>

                <div className="row mt-1">
                    <div className="col-lg-12">
                        <div className="search-result-box m-t-30 card-box">
                            {
                                isNormalSearch && (
                                    <>
                                        <div className="d-flex justify-content-end">
                                            <div id="showHideText" style={{ float: "right" }}>
                                                <h6 className="cursor-pointer" style={{ color: "blue" }} onClick={() => { setDisplayForm(!displayForm) }}>{displayForm ? "Hide Search" : "Show Search"}</h6>
                                            </div>
                                        </div>
                                        <div id="searchBlock" className="modal-body p-2 d-block">
                                            {
                                                displayForm && (
                                                    <>
                                                        <div className="row">
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="billRefNo" className="control-label">Billable Reference Number</label>
                                                                    <input type="text" className="form-control" id="billRefNo" placeholder="Please Enter Billable Reference Number"
                                                                        value={accountSearchParams.billRefNo}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="soNumber" className="control-label">Service ID</label>
                                                                    <input type="text" className="form-control" id="soNumber" placeholder="Please Enter Service ID"
                                                                        value={accountSearchParams.soNumber}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="customerNumber" className="control-label">Customer Number</label>
                                                                    <input type="text" className="form-control" id="customerNumber" placeholder="Please Enter Customer Number"
                                                                        value={accountSearchParams.customerNumber}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-group">
                                                                    <label htmlFor="customerName" className="control-label">Customer Name</label>
                                                                    <input type="text" className="form-control" id="customerName" placeholder="Please Enter Customer Name"
                                                                        value={accountSearchParams.customerName}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4 d-none">
                                                                <div className="form-group">
                                                                    <label htmlFor="contractId" className="control-label">Contract ID</label>
                                                                    <NumberFormatBase className="form-control" id="contractId" placeholder="Please Enter Contract Id"
                                                                        value={accountSearchParams.contractId}
                                                                        onChange={handleInputChange}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="row">
                                                            <div className="col-md-12">
                                                                <div className="pt-1 pb-1">
                                                                    <div className="text-center">
                                                                        <button type="button" className="btn waves-effect waves-light btn-primary mr-2" onClick={handleSubmit}><i className="fa fa-search mr-1"></i> Search</button>
                                                                        <button type="button" className="btn waves-effect waves-light btn-secondary" onClick={handleClear}>Clear</button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </>
                                                )
                                            }
                                        </div>
                                    </>
                                )
                            }
                            <div className="col-md-12 card-box m-0" id="datatable">
                                <div className="card">
                                    <div className="data-scroll1">
                                        {
                                            !!accountList.length &&
                                            <div className="card-body" id="datatable">
                                                <DynamicTable
													listSearch={listSearch}
                                                    listKey={"Account List"}
                                                    row={accountList}
                                                    rowCount={totalCount}
                                                    header={AccountSearchColumns}
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
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        }</div>
    )
}

export default SearchAccount;