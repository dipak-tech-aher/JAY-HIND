import React, { useState } from 'react'
import Modal from 'react-modal'
import DynamicTable from '../../common/table/DynamicTable';
import moment from 'moment'
import { RegularModalCustomStyles, USNumberFormat } from '../../common/util/util';
import { InvoiceSearchColumns, InvoiceSearchHiddenColumns } from '../Invoice/InvoiceSearchColumns';
import { InvoiceDetailListColumns } from '../Invoice/InvoiceTables/InvoiceDetailList'

const BillingScheduleModal = (props) => {

    const { isOpen, billingData } = props.data
    const { setIsOpen } = props.handler
    const [exportBtn, setExportBtn] = useState(false)

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Invoice Start Date" || cell.column.Header === "Invoice End Date" || cell.column.Header === "Invoice Date" || cell.column.Header === "Due Date") {
            return (
                <span>{cell.value && cell.value !== null ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (cell.column.Header === "Customer Number") {
            return (
                <span>{row?.original?.customer[0]?.crmCustomerNo}</span>
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
        else if (cell.column.Header === "Invoice Status") {
            return (
                <>
                    <span>{cell?.value === 'SCHEDULED' ? 'Scheduled' : 'Generated'}</span>
                </>
            )
        }
        else if (cell.column.Header === "Service ID") {
            return (
                <span>{row?.original?.invoiceDetails[0] && row?.original?.invoiceDetails[0]?.monthlyContractDet && row?.original?.invoiceDetails[0]?.monthlyContractDet?.soNumber}</span>
            )
        }
        else {
            return (
                <span>{cell.value}</span>
            )
        }
    }

    const handleCellRenderDetail = (cell, row) => {
        if (cell.column.Header === "Billable Reference Number") {
            let billRefNo = billingData?.billRefNo
            return (
                <span>{billRefNo}</span>
            )
        }
        else if (cell.column.Header === "Invoice Start Date" || cell.column.Header === "Invoice End Date") {
            return (
                <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (cell.column.Header === "Charge Amount" || cell.column.Header === "Credit Adjustment" || cell.column.Header === "Debit Adjustment" || cell.column.Header === "Invoice O/S Amount" || cell.column.Header === "Invoice Amount") {
            return (
                <span>{USNumberFormat(cell.value)}</span>
            )
        }
        else if (cell.column.Header === "Fee Type") {
            let frequency = row?.original?.monthlyContractDet?.frequencyDesc?.description
            return (
                <span>{frequency || "-"}</span>
            )
        }
        else if (cell.column.Header === "Charge Name") {
            return (
                <span>{row?.original?.contractDetail?.charge?.chargeName ? row?.original?.contractDetail?.charge?.chargeName : row?.original?.contractDetail?.chargeName}</span>
            )
        }
        else if (cell.column.Header === "Prorated") {
            return (
                <span>{row?.original?.monthlyContractDet?.prorated === 'Y' ? 'Yes' : row?.original?.monthlyContractDet?.prorated === 'N' ? 'No' : '-'}</span>
            )
        }
        else if (cell.column.Header === "Service Number") {
            let sNo = row?.original?.contractDetail?.identificationNo
            return (
                <span>{sNo}</span>
            )
        }
        else if (cell.column.Header === "Contract Name") {
            let sNo = row?.original?.contractDetail?.itemName
            return (
                <span>{sNo}</span>
            )
        }
        else if (cell.column.Header === "Invoice Status") {
            return (
                <>
                    <span>{cell?.value === 'SCHEDULED' ? 'Scheduled' : 'Generated'}</span>
                </>
            )
        }
        else {
            return (
                <span>{cell.value}</span>
            )
        }
    }

    return (
        <Modal isOpen={isOpen} contentLabel="Contract Search Modal" style={RegularModalCustomStyles}>
            <div className="modal-content">
                <div className="modal-header">
                    <div className="row col-md-12">
                        <h5>View Billing Schedule</h5>
                    </div>   
                    <button className="close-btn" onClick={() => setIsOpen(false)} >&times;</button>
                </div>
                <div className="adjusment modal-body">
                <div className="row">
                        <section className="triangle col-12">
                            <div className="row col-12">
                                <div className="col-19">
                                    <h4 id="" className="pl-3">Billing Schedule</h4>
                                </div>
                            </div>
                        </section>
                    </div>
                    <div className="modal-body overflow-auto cus-srch">
                        {
                            billingData && [billingData]?.length > 0 &&
                            <div className="card">
                                <DynamicTable
                                    row={[billingData]}
                                    filterRequired={false}
                                    itemsPerPage={10}
                                    header={InvoiceSearchColumns}
                                    hiddenColumns={InvoiceSearchHiddenColumns}
                                    exportBtn={exportBtn}
                                    handler={{
                                        handleCellRender: handleCellRender,
                                        handleExportButton: setExportBtn
                                    }}
                                />
                            </div>
                        }
                    </div>
                    <div className="row">
                        <section className="triangle col-12">
                            <div className="row col-12">
                                <div className="col-12">
                                    <h4 id="" className="pl-3">Schedule Detail</h4>
                                </div>
                            </div>
                        </section>
                    </div>
                    <div className="modal-body overflow-auto cus-srch">
                        {
                            billingData && billingData?.invoiceDetails?.length > 0 &&
                            <div className="card">
                                <DynamicTable
                                    row={billingData?.invoiceDetails}
                                    filterRequired={false}
                                    itemsPerPage={10}
                                    header={InvoiceDetailListColumns}
                                    exportBtn={exportBtn}
                                    hiddenColumns={['select']}
                                    handler={{
                                        handleCellRender: handleCellRenderDetail,
                                        handleExportButton: setExportBtn
                                    }}
                                />
                            </div>
                        }
                    </div>
                </div>
            </div>
        </Modal>    
        
    ) 
}

export default BillingScheduleModal