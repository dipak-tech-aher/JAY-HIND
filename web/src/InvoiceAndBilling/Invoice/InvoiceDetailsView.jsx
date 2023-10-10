import React, { useEffect, useRef, useState } from 'react'
import moment from 'moment'
import { useReactToPrint } from 'react-to-print';
import { history } from '../../common/util/history';
import DynamicTable from '../../common/table/DynamicTable';

import { InvoiceSearchColumns, InvoiceSearchHiddenColumns } from './InvoiceSearchColumns';
import InvoiceDetailList from './InvoiceTables/InvoiceDetailList';
import InvoiceChargeList from './InvoiceTables/InvoiceChargeList';
import InvoicePaymentList from './InvoiceTables/InvoicePaymentList';
import InvoiceAdjustmentList from './InvoiceTables/InvoiceAdjustmentList';
import InvoicePdfView from './InvoicePdf/InvoicePdfView';
import { USNumberFormat } from '../../common/util/util';
import { properties } from '../../properties';
import { get } from '../../common/util/restUtil';

const InvoiceDetailsView = (props) => {

    const [activeTab, setActiveTab] = useState(0)
    const invoiceData = props?.location?.state?.data?.invoiceData
    const [exportBtn, setExportBtn] = useState(false)
    const [invoicePdfData, setInvoicePdfData] = useState({})
    const componentRef = useRef()
    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });
    const [generatePdf, setGeneratePdf] = useState(false)

    const [invoicePaymentList, setInvoicePaymentList] = useState([]);
    const [invoiceAdjustmentList, setInvoiceAdjustmentList] = useState([]);

    useEffect(() => {
        getInvoicePaymentList();
        getInvoiceAdjustmentList();
    }, [])

    const getInvoicePaymentList = () => {
        
        get(`${properties.INVOICE_API}/payment/${invoiceData[0]?.invoiceId}`)
            .then((response) => {
                if (response.data) {
                    const { inovicePayment } = response.data;
                    setInvoicePaymentList(response.data)
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

    const getInvoiceAdjustmentList = () => {
        
        get(`${properties.INVOICE_API}/adjustment/${invoiceData[0]?.billRefNo}`)
            .then((response) => {
                if (response.data) {
                    const { postBillAdjustment } = response.data;
                    setInvoiceAdjustmentList(postBillAdjustment)
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

    const handleGeneratePdf = (data) => {
        setInvoicePdfData(data)
        
        setGeneratePdf(true)
        setTimeout(() => {
            
            handlePrint()
            setGeneratePdf(false)
        }, 2000)
    }

    const handleTabChange = (tabIndex) => {
        setActiveTab(tabIndex)
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
        }
        else if (cell.column.Header === "Usage") {
            return (
                <button className="skel-btn-submit"
                    onClick={() => {
                        history.push(`${process.env.REACT_APP_BASE}/billing-usage`, {
                            data: {}
                        })
                    }}
                >
                    Billed Usage
                </button>
            )
        }
        else if (cell.column.Header === "Invoice Start Date" || cell.column.Header === "Invoice End Date" || cell.column.Header === "Invoice Date" || cell.column.Header === "Invoice Due Date") {
            return (
                <span>{cell.value && cell.value !== null ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (cell.column.Header === "Customer Number") {
            return (
                <span>{row?.original?.customer[0]?.customerNo}</span>
            )
        }
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
        else if (cell.column.Header === "Service ID") {
            let no = row?.original?.invoiceDetails && row?.original?.invoiceDetails[0]?.monthlyContractDet && row?.original?.invoiceDetails[0]?.monthlyContractDet?.soNumber
            return (
                <span>{no}</span>
            )
        }
        else {
            return (
                <span>{cell.value}</span>
            )
        }
    }

    return (
        <>
            <div className="row inv">
                {/* <div className="col-11">
                    <div className="page-title-box">
                        <h4 className="page-title">Invoice Details</h4>
                    </div>
                </div>
                <div className="col-1 pt-2">
                    <button className="btn btn-labeled btn-primary btn-sm" onClick={() => props.history.goBack()}>Back</button>
                </div> */}
            </div>
            <div className="row mt-1">
                <div className="col-lg-12 p-0">
                    <div className="card-box p-0">
                        <div className="row">
                            <div className="col-2 pt-2" style={{ background: "#FFF" }}>
                                <div id="scroll-list2" className="list-group cursor-pointer">
                                    <div className={`list-group-item list-group-item-action ${activeTab === 0 ? "active" : ""}`}
                                        onClick={() => { handleTabChange(0) }}
                                    >
                                        Invoice Details
                                    </div>
                                    {/* <div className={`list-group-item list-group-item-action ${activeTab === 1 ? "active" : ""}`}
                                        onClick={() => {handleTabChange(1)}}
                                    >
                                        Invoice Charge Details
                                    </div> */}
                                    <div className={`list-group-item list-group-item-action ${activeTab === 2 ? "active" : ""}`}
                                        onClick={() => { handleTabChange(2) }}
                                    >
                                        Invoice Payment
                                    </div>
                                    <div className={`list-group-item list-group-item-action ${activeTab === 3 ? "active" : ""}`}
                                        onClick={() => { handleTabChange(3) }}
                                    >
                                        Invoice Post Bill Adjustment
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-10 p-10 mt-2">
                                <div data-spy="scroll" data-target="#scroll-list" data-offset="0" className="scrollspy-div ac-screen">
                                    <div className="row">
                                        <section className="triangle col-12">
                                            <div className="row col-12">
                                                <div className="col-12">
                                                    <h4 id="list-item-0" className="pl-1">Invoice</h4>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                    <div className="col-md-12 card-box m-0" id="datatable">
                                        <div className="card">
                                            <div className="data-scroll1">
                                                {
                                                    !!invoiceData.length &&
                                                    <div className="card-body" id="datatable">
                                                        <DynamicTable
                                                            listKey={"Invoice List"}
                                                            row={invoiceData}
                                                            header={InvoiceSearchColumns}
                                                            hiddenColumns={InvoiceSearchHiddenColumns}
                                                            itemsPerPage={10}
                                                            exportBtn={exportBtn}
                                                            filterRequired={false}
                                                            handler={{
                                                                handleCellRender: handleCellRender,
                                                                handleExportButton: setExportBtn
                                                            }}
                                                        />
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <section className="triangle col-12">
                                            <div className="row col-12">
                                                <div className="col-12">
                                                    <h4 id="list-item-0" className="pl-1">
                                                        {
                                                            activeTab === 0 && "Invoice Detail"
                                                        }
                                                        {
                                                            activeTab === 1 && "Invoice Charge Details"
                                                        }
                                                        {
                                                            activeTab === 2 && "Invoice Payment"
                                                        }
                                                        {
                                                            activeTab === 3 && "Invoice Post Bill Adjustment"
                                                        }
                                                    </h4>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                    <div className="col-md-12 card-box m-0" id="datatable2">
                                        <div className="card">
                                            <div className="data-scroll1">
                                                {(() => {
                                                    switch (activeTab) {
                                                        case 0:
                                                            return (<InvoiceDetailList
                                                                data={{
                                                                    invoiceData: invoiceData
                                                                }}
                                                            />
                                                            );
                                                        case 1:
                                                            return (<InvoiceChargeList
                                                                data={{
                                                                    invoiceData: invoiceData
                                                                }}
                                                            />
                                                            );
                                                        case 2:
                                                            return (<InvoicePaymentList
                                                                data={{
                                                                    invoiceData: invoiceData,
                                                                    invoicePaymentList
                                                                }}
                                                            />
                                                            );
                                                        case 3:
                                                            return (<InvoiceAdjustmentList
                                                                data={{
                                                                    invoiceData: invoiceData,
                                                                    invoiceAdjustmentList
                                                                }}
                                                            />
                                                            );
                                                        default:
                                                            return (<InvoiceDetailList
                                                                data={{
                                                                    invoiceData: invoiceData
                                                                }}
                                                            />
                                                            );
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    </div>
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
                </div>
            </div>
        </>
    )
}

export default InvoiceDetailsView;