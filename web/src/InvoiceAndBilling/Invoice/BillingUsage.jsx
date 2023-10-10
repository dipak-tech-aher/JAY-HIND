import React, { useState } from 'react'
import moment from 'moment'
import InvoiceRcNrcChargeView from './InvoiceBilledUsage/InvoiceRcNrcChargeView'
import InvoiceUsageChargeView from './InvoiceBilledUsage/InvoiceUsageChargeView'
import { USNumberFormat } from '../../common/util/util'

const BillingUsage = (props) => {

    const invoiceData = props?.location?.state?.data?.invoiceData
    const [activeTab, setActiveTab] = useState(0)
    const [billingUsageList, setBillingUsageList] = useState([])
    const [showChargeTable, setShowChargeTable] = useState(false)

    const handleTabChange = (index) => {
        setShowChargeTable(false)
        setBillingUsageList([])
        setActiveTab(index)
    }

    const handleCellRender = (cell, row) => {

        if (["Start Date", "End Date", "Charge Date", "Date"].includes(cell.column.Header)) {
            return (
                <span>{cell.value && cell.value !== null ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (["Charge Amount", "Charges", "Charge Date", "Rate (Per MB)"].includes(cell.column.Header)) {
            return (
                <span>{USNumberFormat(cell.value)}</span>
            )
        }
        if (["Time Zone"].includes(cell.column.Header)) {
            return (
                <span>{cell.value && cell.value !== null ? moment(cell.value).format('hh:mm A') : '-'}</span>
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
                <div className="col-11">
                    <div className="page-title-box">
                        <h4 className="page-title">{activeTab === 0 ? "Recurring Charges" : activeTab === 1 ? "One Time Recurring Charges" : "Usage"}</h4>
                    </div>
                </div>
                <div className="col-1 pt-2">
                    <button className="btn btn-labeled btn-primary btn-sm" onClick={() => props.history.goBack()}>Back</button>
                </div>
            </div>
            <div className="row mt-1">
                <div className="col-lg-12 p-0">
                    <div className="card-box p-0">
                        <div className="row">
                            <div className="col-2 pt-2 left-column" style={{ background: "#FFF" }}>
                                <h4 className='pl-3'>{activeTab === 0 ? "Recurring Summary" : activeTab === 1 ? "OTC Summary" : "Usage Summary"}</h4>
                                <div className="col-md-12 list-group cursor-pointer" id="scroll-list2" >
                                    <div className={`list-group-item list-group-item-action ${activeTab === 0 ? 'active' : ''}`}>
                                        <div onClick={() => { handleTabChange(0) }}>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="me-3">
                                                    <div className="tp-text">Recurring Charges</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`list-group-item list-group-item-action ${activeTab === 1 ? 'active' : ''}`}>
                                        <div onClick={() => { handleTabChange(1) }}>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="me-3">
                                                    <div className="tp-text">One Time Recurring Charges</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`list-group-item list-group-item-action ${activeTab === 2 ? 'active' : ''} mb-2`}>
                                        <div onClick={() => { handleTabChange(2) }}>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div className="me-3">
                                                    <div className="tp-text">Usage</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-10 p-10" style={{ paddingTop: '20px' }}>
                                <div data-spy="scroll" data-target="#scroll-list" data-offset="0" className="scrollspy-div ac-screen">
                                    <div className="row">
                                        <section className="triangle col-12">
                                            <div className="row col-12">
                                                <div className="col-12">
                                                    <h4 id="list-item-0" className="pl-1">Billed Usage</h4>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                    <div className="col-md-12 card-box m-0">
                                        <div className="row p-0 bg-light border">
                                            <div className="col-10 pl-2"><h5 className="text-primary">{activeTab === 0 ? "Recurring Charges" : activeTab === 1 ? "One Time Recurring Charges" : "Usage Type"}</h5> </div>
                                        </div>
                                    </div>
                                    <div id="searchBlock" className="modal-body p-2" style={{ display: "block" }}>
                                        {(() => {
                                            switch (activeTab) {
                                                case 0:
                                                    return (<InvoiceRcNrcChargeView
                                                        data={{
                                                            chargeType: "RC",
                                                            hiddenColumns: ['chargeDate'],
                                                            billingUsageList: billingUsageList,
                                                            showChargeTable: showChargeTable,
                                                            invoiceData: invoiceData
                                                        }}
                                                        handler={{
                                                            setBillingUsageList: setBillingUsageList,
                                                            handleCellRender: handleCellRender,
                                                            setShowChargeTable: setShowChargeTable
                                                        }}
                                                    />
                                                    );
                                                case 1:
                                                    return (<InvoiceRcNrcChargeView
                                                        data={{
                                                            chargeType: "NRC",
                                                            hiddenColumns: ['startDate', 'endDate'],
                                                            billingUsageList: billingUsageList,
                                                            showChargeTable: showChargeTable,
                                                            invoiceData: invoiceData
                                                        }}
                                                        handler={{
                                                            setBillingUsageList: setBillingUsageList,
                                                            handleCellRender: handleCellRender,
                                                            setShowChargeTable: setShowChargeTable
                                                        }}
                                                    />
                                                    );
                                                case 2:
                                                    return (<InvoiceUsageChargeView
                                                        data={{
                                                            chargeType: "Usage",
                                                            billingUsageList: billingUsageList,
                                                            showChargeTable: showChargeTable,
                                                            invoiceData: invoiceData
                                                        }}
                                                        handler={{
                                                            setBillingUsageList: setBillingUsageList,
                                                            handleCellRender: handleCellRender,
                                                            setShowChargeTable: setShowChargeTable
                                                        }}
                                                    />
                                                    );
                                                default:
                                                    return (<InvoiceRcNrcChargeView
                                                        data={{
                                                            chargeType: "RC",
                                                            hiddenColumns: ['chargeDate'],
                                                            billingUsageList: billingUsageList,
                                                            showChargeTable: showChargeTable,
                                                            invoiceData: invoiceData
                                                        }}
                                                        handler={{
                                                            setBillingUsageList: setBillingUsageList,
                                                            handleCellRender: handleCellRender,
                                                            setShowChargeTable: setShowChargeTable
                                                        }}
                                                    />
                                                    );
                                            }
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default BillingUsage