import React, { useState } from 'react'
import DynamicTable from '../../../common/table/DynamicTable';
import moment from 'moment';
import { USNumberFormat } from '../../../common/util/util';

const InvoiceAdjustmentList = (props) => {

    const { invoiceAdjustmentList } = props?.data
    const [exportBtn, setExportBtn] = useState(false)

    const handleCellRender = (cell, row) => {

        if (cell.column.Header === "Adjustment Date") {
            return (
                <span>{moment(cell.value).format('DD MMM YYYY')}</span>
            )
        }
        else if (cell.column.Header === "Amount") {
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
                !!invoiceAdjustmentList.length ?
                <div className="card-body" id="datatable">
                    <DynamicTable
                        listKey={"Invoice Adjustment List"}
                        row={invoiceAdjustmentList}
                        header={InvoiceAdjustmentListColumns}
                        itemsPerPage={10}
                        exportBtn={exportBtn}
                        handler={{
                            handleCellRender: handleCellRender,
                            handleExportButton: setExportBtn
                        }}
                    />
                </div>
                :
                <span className="msg-txt">No Invoice Post Bill Adjustment Records Available</span>
            }
        </>
    )
}

export default InvoiceAdjustmentList

export const InvoiceAdjustmentListColumns = [
    {
        Header: "Adjustment Number",
        accessor: "adjustmentId",
        disableFilters: true,
        id: 'adjustmentId'
    },
    {
        Header: "Adjustment Date",
        accessor: "createdAt",
        disableFilters: true
    },
    {
        Header: "Charge Name",
        accessor: "chargeName",
        disableFilters: true,
        id: 'chargeName'
    },
    {
        Header: "Charge Type",
        accessor: "chargeType",
        disableFilters: true,
        id: 'chargeType'
    },
    {
        Header: "Adjustment Type",
        accessor: "adjustmentType",
        disableFilters: true,
        id: 'adjustmentType'
    },
    {
        Header: "Amount",
        accessor: "maxAdjAmount",
        disableFilters: true
    },
    {
        Header: "Status",
        accessor: "status",
        disableFilters: true
    },
    {
        Header: "Reason",
        accessor: "reason",
        disableFilters: true
    },
    {
        Header: "Remarks",
        accessor: "remarks",
        disableFilters: true
    }
]