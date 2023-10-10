import React, { useRef, useState } from 'react';
import DynamicTable from '../../../../common/table/DynamicTable';
import { PreviewInvoiceColumnList } from './PreviewInvoiceColumnList';
import { unstable_batchedUpdates } from 'react-dom';
import moment from 'moment';
import { history } from '../../../../common/util/history.js';
import { USNumberFormat } from '../../../../common/util/util';
import { useReactToPrint } from 'react-to-print';
import tInvoice from "../../../../assets/images/icons/total-invoice.png";
import tAdvance from "../../../../assets/images/icons/total-advance.png";
import tPrevious from "../../../../assets/images/icons/total-previous.png";
import tOutstanding from "../../../../assets/images/icons/total-outstanding.png";
import InvoicePdfView from '../../../Invoice/InvoicePdf/InvoicePdfView';

import { properties } from '../../../../../src/properties.js';
import { get } from '../../../../common/util/restUtil';

const PreviewInvoice = (props) => {

    const { isHistory } = props;
    const { previewInvoiceList = [], previewInvoiceInputs, previewInvoiceTotalRowCount, previewInvoicePerPage, previewInvoiceCurrentPage, previewInvoiceCounts, listSearch } = props.data;
    const { setPreviewInvoicePerPage, setPreviewInvoiceCurrentPage, setPreviewInvoiceInputs } = props.handler;

    const [showSummary, setShowSummary] = useState(true);
    const [showSearch, setShowSearch] = useState(true);
    const [exportBtn, setExportBtn] = useState(true);
    const [generatePdf, setGeneratePdf] = useState(false)
    const [invoicePdfData, setInvoicePdfData] = useState({})

    const componentRef = useRef()
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        onAfterPrint: () => document.title = 'dtWorks'
    });

    const handleOnPreviewInvoiceInputsChange = (e) => {
        const { target } = e;
        setPreviewInvoiceInputs({
            ...previewInvoiceInputs,
            [target.id]: target.value
        })
    }

    const handleOnPreviewInvoiceInputsClear = () => {
        setPreviewInvoiceInputs({
            invoiceId: "",
            customerNumber: "",
            customerName: "",
            billRefNo: "",
            invoiceStartDate: "",
            invoiceEndDate: "",
        })
        handleOnPreviewInvoiceSearch()
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
                            document.title = `DTWORKS_${data.address.firstName ? data?.address?.firstName : ''} ${data.address?.lastName ? data.address?.lastName : ''}_${moment(data?.invoice?.invDate).format('DD-MMM-YYYY')}`

                            handlePrint();
                            setGeneratePdf(false);
                        }, 10)
                    })
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

    const handleCellRender = (cell, row) => {
        if (['Invoice Start Date', 'Invoice End Date', 'Invoice Date', 'Due Date'].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : ''}</span>)
        }
        else if (['Invoice Amount', 'Advance Amount', 'Previous Balance Amount', 'Total Outstanding'].includes(cell.column.Header)) {
            return (<span>{USNumberFormat(cell.value)}</span>)
        }
        else if (['Customer Name'].includes(cell.column.Header)) {
            return (<span>{row?.original?.customer[0]?.firstName + " " + row?.original?.customer[0]?.lastName}</span>)
        }
        else if (['View Invoice Details'].includes(cell.column.Header)) {
            return (
                <button type="button" className="skel-btn-submit" onClick={() => handleOnDetailsClick(row.original)}>
                    <i className="mdi mdi-file-document-outline font10 mr-1" />
                    <small>Details</small>
                </button>
            )
        }
        else if (['View Invoice PDF'].includes(cell.column.Header)) {
            return (
                <button type="button" className="skel-btn-submit"
                    onClick={() => { handleGeneratePdf(row?.original) }}
                >
                    <i className="mdi mdi-eye font10 mr-1" />
                    <small>PDF</small>
                </button>
            )
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    const handleOnDetailsClick = (invoiceData) => {
        history.push(`${process.env.REACT_APP_BASE}/invoice-details-view`, {
            data: {
                invoiceData: Array(invoiceData)
            }
        })
    }

    const handlePreviewInvoicePageSelect = (pageNo) => {
        setPreviewInvoiceCurrentPage(pageNo)
    }

    const handleOnPreviewInvoiceSearch = () => {
        unstable_batchedUpdates(() => {
            setPreviewInvoicePerPage(10);
            setPreviewInvoiceCurrentPage((previewInvoiceCurrentPage) => {
                if (previewInvoiceCurrentPage === 0) {
                    return '0'
                }
                return 0
            });
        })
    }

    return (
        <div className="row">
            <div className="text-left col-12">
                <div className="col-12 p-0">
                    <fieldset className="scheduler-border2">
                        <div className="col-12 row pt-1">
                            <div className="offset-10 col-2 text-right h-search">
                                <div className="text-primary cursor-pointer" onClick={() => setShowSummary(!showSummary)}>
                                    {showSummary ? 'Hide' : 'Show'} Summary
                                </div>
                            </div>
                        </div>
                        {
                            showSummary &&
                            <div className="row stat-cards col-md-12 p-0" id="infodata3">
                                <div className="col-12 p-0">
                                    <div className="row blog">
                                        <div className="col-md-12 p-0">
                                            <div>
                                                <div className="row pb-2">
                                                    <div className="col-3">
                                                        <article className="stat-cards-item border">
                                                            <div className="stat-cards-icon primary">
                                                                <img src={tInvoice} alt="total-invoice" />
                                                            </div>
                                                            <div className="stat-cards-info">
                                                                <p className="stat-cards-info__num">{USNumberFormat(previewInvoiceCounts?.totalInvoiceAmount)}</p>
                                                                <p className="stat-cards-info__title">Total Invoice Amount</p>
                                                            </div>
                                                        </article>
                                                    </div>
                                                    <div className="col-3">
                                                        <article className="stat-cards-item border">
                                                            <div className="stat-cards-icon primary">
                                                                <img src={tAdvance} alt="total-advance" />
                                                            </div>
                                                            <div className="stat-cards-info">
                                                                <p className="stat-cards-info__num">{USNumberFormat(previewInvoiceCounts?.totalAdvanceAmount)}</p>
                                                                <p className="stat-cards-info__title">Total Advance Amount</p>
                                                            </div>
                                                        </article>
                                                    </div>
                                                    <div className="col-3">
                                                        <article className="stat-cards-item border">
                                                            <div className="stat-cards-icon primary">
                                                                <img src={tPrevious} alt="total-previous" />
                                                            </div>
                                                            <div className="stat-cards-info">
                                                                <p className="stat-cards-info__num">{USNumberFormat(previewInvoiceCounts?.totalPreviousBalanceAmount)}</p>
                                                                <p className="stat-cards-info__title">Total Previous Balance Amount</p>

                                                            </div>
                                                        </article>
                                                    </div>

                                                    <div className="col-3">
                                                        <article className="stat-cards-item border">
                                                            <div className="stat-cards-icon primary">
                                                                <img src={tOutstanding} alt="total-outstanding" />
                                                            </div>
                                                            <div className="stat-cards-info">
                                                                <p className="stat-cards-info__num">{USNumberFormat(previewInvoiceCounts?.totalOutstandingAmount)}</p>
                                                                <p className="stat-cards-info__title">Total Outstanding Amount</p>
                                                            </div>
                                                        </article>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    </fieldset>
                </div>
                <section>
                    <div className="col-12 pr-0 pt-2">
                        <section className="triangle">
                            <div className="col-12 row">
                                <div className="col-10">
                                    <h4 id="list-item-1" className="pl-1">Invoice</h4>
                                </div>
                                <div className="col-2 pt-2 text-right">
                                    <div className="text-primary cursor-pointer" onClick={() => setShowSearch(!showSearch)}>
                                        {showSearch ? 'Hide' : 'Show'} Search
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                    {
                        showSearch &&
                        <div className="row border align-items-center" id="searchBlock3">
                            <div className="col">
                                <div className="form-group">
                                    <label htmlFor="invoiceId" className="col-form-label">Invoice<br />ID</label>
                                    <input type="text" id="invoiceId" className="form-control" placeholder="Invoice Id" value={previewInvoiceInputs.invoiceId} onChange={handleOnPreviewInvoiceInputsChange} />
                                </div>
                            </div>
                            <div className="col">
                                <div className="form-group">
                                    <label htmlFor="customerNumber" className="col-form-label">Customer<br />Number</label>
                                    <input type="text" id="customerNumber" className="form-control" placeholder="Customer No" value={previewInvoiceInputs.customerNumber} onChange={handleOnPreviewInvoiceInputsChange} />
                                </div>
                            </div>
                            <div className="col">
                                <div className="form-group">
                                    <label htmlFor="customerName" className="col-form-label">Customer<br />Name</label>
                                    <input type="text" id="customerName" className="form-control" placeholder="Customer Name" value={previewInvoiceInputs.customerName} onChange={handleOnPreviewInvoiceInputsChange} />
                                </div>
                            </div>
                            <div className="col">
                                <div className="form-group">
                                    <label htmlFor="billRefNo" className="col-form-label">Billable<br />Ref Number</label>
                                    <input type="text" id="billRefNo" className="form-control" placeholder="Billable Ref No" value={previewInvoiceInputs.billRefNo} onChange={handleOnPreviewInvoiceInputsChange} />
                                </div>
                            </div>
                            {/* <div className="col">
                                <div className="form-group">
                                    <label htmlFor="billableRefName" className="col-form-label">Billable<br />Ref Name</label>
                                    <input type="text" id="billableRefName" className="form-control" placeholder="Billable Ref Name" value={previewInvoiceInputs.billableRefName} onChange={handleOnPreviewInvoiceInputsChange} />
                                </div>
                            </div> */}
                            <div className="col">
                                <div className="form-group">
                                    <label htmlFor="invoiceStartDate" className="col-form-label">Invoice<br />Start Date</label>
                                    <input type="date" id="invoiceStartDate" className="form-control" value={previewInvoiceInputs.invoiceStartDate} onChange={handleOnPreviewInvoiceInputsChange} />
                                </div>
                            </div>
                            <div className="col">
                                <div className="form-group">
                                    <label htmlFor="invoiceEndDate" className="col-form-label">Invoice<br />End Date</label>
                                    <input type="date" id="invoiceEndDate" className="form-control" value={previewInvoiceInputs.invoiceEndDate} onChange={handleOnPreviewInvoiceInputsChange} />
                                </div>
                            </div>
                                <div className="col">
                                    <div className='form-group mb-0'>
                                        <label>&nbsp;</label>
                                <button type="button" className="skel-btn-cancel" onClick={handleOnPreviewInvoiceInputsClear}>
                                    <small>Clear</small>
                                </button>
                                <button type="button" className="skel-btn-submit" onClick={handleOnPreviewInvoiceSearch}>
                                    <small>Search</small>
                                </button>
                                    </div>
                            </div>
                        </div>
                    }
                    {
                        !!previewInvoiceList.length &&
                        <DynamicTable
                            listSearch={listSearch}
                            listKey={`${isHistory ? 'Invoice Preview List History' : 'Invoice Preview List'}`}
                            row={previewInvoiceList}
                            rowCount={previewInvoiceTotalRowCount}
                            header={PreviewInvoiceColumnList}
                            itemsPerPage={previewInvoicePerPage}
                            backendPaging={true}
                            backendCurrentPage={previewInvoiceCurrentPage}
                            exportBtn={exportBtn}
                            handler={{
                                handleCellRender: handleCellRender,
                                handlePageSelect: handlePreviewInvoicePageSelect,
                                handleItemPerPage: setPreviewInvoicePerPage,
                                handleCurrentPage: setPreviewInvoiceCurrentPage,
                                handleExportButton: setExportBtn
                            }}
                        />
                    }
                    {
                        generatePdf &&
                        <InvoicePdfView
                            invoiceData={invoicePdfData}
                            ref={componentRef}
                        />
                    }
                </section>
            </div>
        </div>
    )
}

export default PreviewInvoice;