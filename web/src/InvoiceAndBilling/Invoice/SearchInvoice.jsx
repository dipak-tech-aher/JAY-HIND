import React, { useEffect, useRef, useState, useContext } from 'react';
import { toast } from 'react-toastify';
import { properties } from '../../properties';
import { post, get } from '../../common/util/restUtil';
import { unstable_batchedUpdates } from 'react-dom';

import moment from 'moment'
import { NumberFormatBase } from 'react-number-format';
import { history } from '../../common/util/history';
import { useReactToPrint } from 'react-to-print';
import DynamicTable from '../../common/table/DynamicTable';
import { InvoiceSearchColumns } from './InvoiceSearchColumns';
import InvoicePdfView from './InvoicePdf/InvoicePdfView';
import { formFilterObject, pageStyle, USNumberFormat } from '../../common/util/util';
import { AppContext } from '../../AppContext';

const SearchInvoice = (props) => {

    const { auth } = useContext(AppContext)
    const [userPermission, setUserPermission] = useState({ searchInvoice: false, viewInvoiceList: false })
    const hideForm = props?.data?.hideForm || false
    const refresh = props?.data?.refresh || false
    const fromPage = props?.data?.from || null
    const isScroll = props?.data?.isScroll ?? true
    const leftNavCounts = props?.data?.leftNavCounts || {}
    const setLeftNavCounts = props?.handler?.setLeftNavCounts
    const tabType = props?.data?.tabType
    const customerDetails = props?.data?.data?.customerDetails

    const initialValues = {
        // soNumber: null,
        invoiceNo: null,
        // customerNo: null,
        // customerName: null,
        invoiceStartDate: props?.data?.data?.startDate || '',
        invoiceEndDate: props?.data?.data?.endDate || '',
        billRefNo: props?.data?.data?.billRefNo || '',
        // soId: props?.data?.data?.soId || null,
        // customerUuid: props?.data?.data?.customerUuid || '',
        customerId: props?.data?.data?.customerId || '',
        customerName: '',
        invoiceId: '',
        customerNumber: props?.data?.data?.customerDetails?.customerNo || null
    }

    const [generatePdf, setGeneratePdf] = useState(false)
    const [invoiceSearchParams, setInvoiceSearchParams] = useState(initialValues)
    const [invoiceList, setInvoiceList] = useState([])
    const [displayForm, setDisplayForm] = useState(true);
    const [exportBtn, setExportBtn] = useState(true);
    const [listSearch, setListSearch] = useState([]);
    const [invoicePdfData, setInvoicePdfData] = useState()
    const [isNormalSearch, setIsNormalSearch] = useState(true)
    const isFirstRender = useRef(true);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);

    const componentRef = useRef()
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        onAfterPrint: () => document.title = 'dtWorks',
        pageStyle: pageStyle
    });

    useEffect(() => {
        // if (props.data === undefined) { setIsOpen(false) }
        let rolePermission = []

        auth && auth.permissions && auth.permissions.filter(function (e) {
            let property = Object.keys(e)
            if (property[0] === "Invoice") {
                let value = Object.values(e)
                rolePermission = Object.values(value[0])
            }
        })

        let search, viewList;
        rolePermission.map((screen) => {
            if (screen.screenName === "Search Invoice") {
                search = screen.accessType
            } else if (screen.screenName === "View Invoice List") {
                viewList = screen.accessType
            }
        })
        setUserPermission({ searchInvoice: search, viewInvoiceList: viewList })


    }, [auth])


    useEffect(() => {
        if (hideForm !== '' && hideForm !== null && hideForm !== undefined) {
            if (hideForm === true) {
                if (fromPage === 's360') {
                    setExportBtn(true)
                }
                else {
                    setExportBtn(false)
                }
                setIsNormalSearch(false)
                if (fromPage !== null && fromPage === "s360") {
                    getSalesOrderInvoiceSearchData()
                }
                else {
                    getInvoiceSearchData()
                }
            }
            else {
                setIsNormalSearch(true)
            }
        }
    }, [hideForm, perPage, currentPage, refresh])

    useEffect(()=>{
        if(  tabType && tabType=== 'Invoice')
        getInvoiceSearchData()

    }, [tabType])

    useEffect(() => {
        if (!isFirstRender.current && hideForm === false) {
            getInvoiceSearchData()
        }
        else {
            isFirstRender.current = false
        }
    }, [currentPage, perPage, refresh])

    const getInvoiceSearchData = (fromCallback = false) => {
        let requestBody = {
            ...invoiceSearchParams,
            //  filters: formFilterObject(filters)
        }
        setListSearch(requestBody);

        post(`${properties.INVOICE_API}/search?limit=${perPage}&page=${fromCallback ? 0 : currentPage}`, requestBody)
            .then((response) => {
                if (Number(response?.data?.count) > 0) {
                    const { rows, count } = response?.data

                    unstable_batchedUpdates(() => {
                        setInvoiceList(rows);
                        setTotalCount(count)
                        if (hideForm && hideForm === true && fromPage === 'AccountView') {
                            setLeftNavCounts({
                                ...leftNavCounts,
                                invoice: count
                            })
                        }
                    })
                }
                else {
                    if (hideForm === false) {
                        toast.error('Record Not Found')
                        setInvoiceList([])
                        setFilters([])
                    }
                    if (hideForm === true) {
                        if (filters.length) {
                            toast.error('Record Not Found')
                        }
                    }
                }
            })
            .catch((error) => {
                toast.error("Error while getting Invoice List")
            })
            .finally(() => {

                //isFirstRender.current = true
                isTableFirstRender.current = false;
            })
    }

    const getSalesOrderInvoiceSearchData = (fromCallback = false) => {
        let requestBody = {
            ...invoiceSearchParams,
            filters: formFilterObject(filters)
        }
        setListSearch(requestBody);

        post(`${properties.INVOICE_API}/sales-order/search?limit=${perPage}&page=${fromCallback ? 0 : currentPage}`, requestBody)
            .then((response) => {
                if (response?.data) {
                    const { rows, count } = response?.data
                    if (hideForm === true) {
                        if (filters.length) {
                            if (count > 0) {
                                unstable_batchedUpdates(() => {
                                    setInvoiceList(rows);
                                    setTotalCount(count)
                                })
                                if (hideForm && hideForm === true && fromPage === "s360") {
                                    setLeftNavCounts({
                                        ...leftNavCounts,
                                        invoice: count || 0
                                    })
                                }
                            }
                            else {
                                toast.error('Record Not Found')
                            }
                        }
                        else {
                            if (hideForm && hideForm === true && fromPage === "s360") {
                                unstable_batchedUpdates(() => {
                                    setInvoiceList(rows);
                                    setTotalCount(count)
                                })
                                setLeftNavCounts({
                                    ...leftNavCounts,
                                    invoice: count || 0
                                })
                            }
                        }
                    }
                }
            })
            .catch((error) => {
                toast.error("Error while getting Invoice List")
            })
            .finally(() => {

                //isFirstRender.current = true
                isTableFirstRender.current = false;
            })
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleInputChange = (e) => {
        const target = e.target;
        setInvoiceSearchParams({
            ...invoiceSearchParams,
            [target.id]: target.value
        })
    }

    const handleGeneratePdf = (data) => {
        getInvoiceData(data.invoiceId);
    }

    const getInvoiceData = (id) => {

        get(`${properties.INVOICE_API}/${id}`)
            .then((response) => {
                const { data, status } = response;
                if (status === 200 && data) {
                    unstable_batchedUpdates(() => {
                        setInvoicePdfData(data);
                        setGeneratePdf(true);
                        setTimeout(() => {
                            document.title = `${data.address.firstName ? data?.address?.firstName : ''} ${data.address?.lastName ? data.address?.lastName : ''}_${moment(data?.invoice?.invDate).format('DD-MMM-YYYY')}`

                            handlePrint();
                            setGeneratePdf(false);
                        }, 1000)
                    })
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

    const handleCellRender = (cell, row) => {

        if (cell.column.Header === "Invoice PDF") {
            return (
                <button type="button" className="skel-btn-submit"
                    onClick={() => { handleGeneratePdf(row?.original) }}
                >
                    Bill
                </button>
            )
        } else if (cell.column.Header === "Service ID") {
            let no = row?.original?.invoiceDetails && row?.original?.invoiceDetails[0]?.monthlyContractDet && row?.original?.invoiceDetails[0]?.monthlyContractDet?.soNumber
            return (
                <span>{no}</span>
            )
        }
        else if (cell.column.Header === "Usage") {
            return (
                <button className="btn waves-effect waves-light btn-primary btn-sm"
                    onClick={() => {
                        history.push(`${process.env.REACT_APP_BASE}/billing-usage`, {
                            data: {
                                invoiceData: row?.original
                            }
                        })
                    }}
                >
                    Billed Usage
                </button>
            )
        }
        else if (cell.column.Header === "Invoice No") {
            return (
                <>
                    <>
                        {/* {
                            fromPage !== null && fromPage === "s360" &&
                            <span className={`tooltip1  status-${['Paid'].includes(row?.original?.newInvoiceStatus) ? 'paid2' : ['Generated'].includes(row?.original?.newInvoiceStatus) ? 'generated2' : row?.original?.newInvoiceStatus === 'Overpaid' ? 'underpaid2' : 'unpaid2'}`}>
                                <span className=" tooltiptext1">{row?.original?.newInvoiceStatus}</span>
                                {row?.original?.newInvoiceStatus}
                            </span>
                        } */}
                        <span className=" ml-2 text-secondary cursor-pointer"
                            onClick={() => {
                                history.push(`${process.env.REACT_APP_BASE}/invoice-details-view`, {
                                    data: {
                                        invoiceData: [row?.original]
                                    }
                                })
                            }}
                        >
                            {cell.value}
                        </span>
                    </>
                </>
            )
        }
        else if (cell.column.Header === "Invoice Start Date" || cell.column.Header === "Invoice End Date" || cell.column.Header === "Invoice Date" || cell.column.Header === "Invoice Due Date") {
            return (
                <span>{cell.value && cell.value !== null ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
            )
        }
        // else if (cell.column.Header === "Customer Number") {
        //     return (
        //         <span>{row?.original?.customer[0]?.crmCustomerNo}</span>
        //     )
        // }
        else if (cell.column.Header === "Customer Name") {
            let name = row?.original?.customer[0]?.firstName + " " + row?.original?.customer[0]?.lastName
            return (
                <span>{name}</span>
            )
        }
        else if (cell.column.Header === "Invoice O/S Amount" || cell.column.Header === "Invoice Amount") {
            return (
                <span>{USNumberFormat(cell.value)}</span>
            )
        }
        // else if (cell.column.Header === "Invoice Status") {
        //     return (
        //         <>
        //             {
        //                 fromPage !== null && fromPage === "s360" ?
        //                     <span
        //                         className={`${['Paid'].includes(row?.original?.newInvoiceStatus) ? 'paid' : ['Generated'].includes(row?.original?.newInvoiceStatus) ? 'generated' : row?.original?.newInvoiceStatus === 'Overpaid' ? 'upaid' : 'unpaid'}`}>
        //                         {row?.original?.newInvoiceStatus}
        //                     </span>
        //                     :
        //                     <span>{cell.value}</span>
        //             }
        //         </>

        //     )
        // }
        else {
            return (
                <span>{cell.value}</span>
            )
        }
    }

    const handleClear = () => {
        unstable_batchedUpdates(() => {
            setInvoiceSearchParams(initialValues)
            setInvoiceList([])
            setFilters([])
        })
    }

    const handleSubmit = (e) => {
        if (e) {
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
        else {
            getInvoiceSearchData(true)
        }
    }

    return (
        <div className="">
            {/* {
                isNormalSearch && (
                    <div className="row">
                        <div className="col-12">
                            <div className="page-title-box">
                                <h4 className="page-title">Invoice Search</h4>
                            </div>
                        </div>
                    </div>
                )
            } */}

            <div className="row mt-1">
                <div className="col-lg-12">
                    <div className="search-result-box m-t-30 card-box">
                        {
                            isNormalSearch && (
                                <>
                                    <div className="d-flex justify-content-end">
                                        <div id="showHideText" style={{ float: "right" }}>
                                            <div className={`text-primary cursor-pointer ${((userPermission.searchInvoice === 'deny') ? "d-none" : "")}`} onClick={() => { setDisplayForm(!displayForm) }}>{displayForm ? "Hide Search" : "Show Search"}</div>
                                        </div>
                                    </div>
                                    <div id="searchBlock" className="modal-body p-2 d-block">
                                        {
                                            displayForm && userPermission?.searchInvoice !== 'deny' && (
                                                <>
                                                    <div className="row">
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="invoiceId" className="control-label">Invoice ID</label>
                                                                <NumberFormatBase className="form-control" id="invoiceId" placeholder="Please Enter Invoice Id"
                                                                    value={invoiceSearchParams?.invoiceId}
                                                                    onChange={handleInputChange}
                                                                />
                                                            </div>
                                                        </div>
                                                        {/* <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="soNumber" className="control-label">Sevice ID</label>
                                                                <input type="text" className="form-control" id="soNumber" placeholder="Please Enter Service ID"
                                                                    value={invoiceSearchParams.soNumber}
                                                                    onChange={handleInputChange}
                                                                />
                                                            </div>
                                                        </div> */}
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="customerNumber" className="control-label">Customer Number</label>
                                                                <input type="text" className="form-control" id="customerNumber" placeholder="Please Enter Customer Number"
                                                                    value={invoiceSearchParams?.customerNumber}
                                                                    onChange={handleInputChange}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="customerName" className="control-label">Customer Name</label>
                                                                <input type="text" className="form-control" id="customerName" placeholder="Please Enter Customer Name"
                                                                    value={invoiceSearchParams?.customerName}
                                                                    onChange={handleInputChange}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="invoiceStartDate" className="control-label">Invoice Start Date</label>
                                                                <input type="date" className="form-control" id="invoiceStartDate" placeholder=""
                                                                    value={invoiceSearchParams?.invoiceStartDate}
                                                                    onChange={handleInputChange}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="invoiceEndDate" className="control-label">Invoice End Date	</label>
                                                                <input type="date" className="form-control" id="invoiceEndDate" placeholder=""
                                                                    value={invoiceSearchParams?.invoiceEndDate}
                                                                    onChange={handleInputChange}
                                                                />
                                                            </div>
                                                        </div>
                                                        {/* <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="serviceNumber" className="control-label">Service Number</label>
                                                            <input type="text" className="form-control" id="serviceNumber" placeholder="Please Enter Service Number"
                                                                value={invoiceSearchParams.serviceNumber}
                                                                onChange={handleInputChange}
                                                            />
                                                        </div>
                                                    </div> */}
                                                        <div className="col-md-4">
                                                            <div className="form-group">
                                                                <label htmlFor="billRefNo" className="control-label">Billable Reference Number</label>
                                                                <input type="text" className="form-control" id="billRefNo" placeholder="Please Enter Billable Reference Number"
                                                                    value={invoiceSearchParams?.billRefNo}
                                                                    onChange={handleInputChange}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-12">
                                                            <div className="pt-1 pb-1">
                                                                <div className="text-center">
                                                                    <button type="button" className="skel-btn-cancel" onClick={handleClear}>Clear</button>
                                                                    <button type="button" className="skel-btn-submit" onClick={handleSubmit}><i className="fa fa-search mr-1"></i> Search</button>

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
                        {
                            !!invoiceList.length && userPermission?.viewInvoiceList !== "deny" ?
                                < div className="card">
                                    <DynamicTable
                                        isScroll={isScroll}
                                        listSearch={listSearch}
                                        //   listKey={`${(hideForm === false || (fromPage !== null && fromPage !== 's360')) ? "Invoice List" : (fromPage !== null && fromPage === 's360') ? "Sales Order Invoice List" : ""}`}
                                        listKey="Invoice List"
                                        row={invoiceList}
                                        rowCount={totalCount}
                                        itemsPerPage={perPage}
                                        backendPaging={true}
                                        filterRequired={fromPage === 's360' || fromPage === "Customer360" ? false : true}
                                        backendCurrentPage={currentPage}
                                        isTableFirstRender={isTableFirstRender}
                                        hasExternalSearch={hasExternalSearch}
                                        hiddenColumns={['select']}
                                        header={InvoiceSearchColumns}
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
                                hideForm === true &&
                                <span className="msg-txt">No Invoice Available</span>
                        }
                        {
                            generatePdf &&
                            <InvoicePdfView
                                invoiceData={invoicePdfData}
                                ref={componentRef}
                            />
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SearchInvoice;