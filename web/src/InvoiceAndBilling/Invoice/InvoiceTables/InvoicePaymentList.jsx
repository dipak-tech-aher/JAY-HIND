import React, { useState } from 'react'
import DynamicTable from '../../../common/table/DynamicTable';
import moment from 'moment';
import { USNumberFormat } from '../../../common/util/util';

const InvoicePaymentList = (props) => {

    const { invoicePaymentList } = props?.data
    const [exportBtn, setExportBtn] = useState(false)

    const handleCellRender = (cell, row) => {

        if (cell.column.Header === "Payment Date") {
            return (
                <span>{moment(cell.value).format('DD MMM YYYY')}</span>
            )
        }
        else if (cell.column.Header === "Amount Paid") {
            return (
                <span>{USNumberFormat(cell.value)}</span>
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
            {
                !!invoicePaymentList.length ?
                <div className="card-body" id="datatable">
                    <DynamicTable
                        listKey={"Invoice Payment List"}
                        row={invoicePaymentList}
                        header={InvoicePaymentListColumns}
                        itemsPerPage={10}
                        exportBtn={exportBtn}
                        handler={{
                            handleCellRender: handleCellRender,
                            handleExportButton: setExportBtn
                        }}
                    />
                </div>
                :
                <span className="msg-txt">No Invoice Payment Records Available</span>
            }
        </>
    )
}

export default InvoicePaymentList

export const InvoicePaymentListColumns = [
    {
        Header: "Payment Receipt Number",
        accessor: "paymentId",
        disableFilters: true,
        id: 'paymentId'
    },
    {
        Header: "Payment Date",
        accessor: "createdAt",
        disableFilters: true
    },
    {
        Header: "Currency",
        accessor: "currencyDesc",
        disableFilters: true,
        id: 'currency'
    },
    {
        Header: "Amount Paid",
        accessor: "paymentAmount",
        disableFilters: true
    },
    {
        Header: "Payment Mode",
        accessor: "paymentModeDesc",
        disableFilters: true
    },
    {
        Header: "Payment Location",
        accessor: "paymentLocation",
        disableFilters: true
    }
]
