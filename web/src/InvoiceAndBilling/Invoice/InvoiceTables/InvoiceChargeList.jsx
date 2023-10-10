import React, { useEffect, useState } from 'react'
import DynamicTable from '../../../common/table/DynamicTable';
import { USNumberFormat } from '../../../common/util/util';

const InvoiceChargeList = (props) => {

    const { invoiceData } = props?.data
    const [exportBtn, setExportBtn] = useState(false)
    const [invoiceChargeList, setInvoiceChargeList] = useState([])

    useEffect(() => {
        let dummyInvoiceChargeList = [
            {
                serviceNumber: 254862,
                chargeName: "DST Peak Usage",
                chargeType: "Usage",
                chargeAmount: "20",
                outstandingAmount: "0"
            },
            {
                serviceNumber: 354123,
                chargeName: "DST OffPeak Usage",
                chargeType: "Usage",
                chargeAmount: "25",
                outstandingAmount: "0"
            },
            {
                serviceNumber: 156320,
                chargeName: "Local Usage",
                chargeType: "Usage",
                chargeAmount: "20",
                outstandingAmount: "0"
            }
        ]
        setInvoiceChargeList(dummyInvoiceChargeList)
    }, [])

    const handleCellRender = (cell, row) => {

        if (cell.column.Header === "Charge Amount" || cell.column.Header === "Outstanding Amount") {
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
                !!invoiceChargeList.length &&
                <div className="card-body" id="datatable">
                    <DynamicTable
                        listKey={"Invoice Charge List"}
                        row={invoiceChargeList}
                        header={InvoiceChargeListColumns}
                        itemsPerPage={10}
                        exportBtn={exportBtn}
                        handler={{
                            handleCellRender: handleCellRender,
                            handleExportButton: setExportBtn
                        }}
                    />
                </div>
            }
        </>
    )
}

export default InvoiceChargeList

export const InvoiceChargeListColumns = [
    {
        Header: "Service Number",
        accessor: "serviceNumber",
        disableFilters: false,
        id: 'serviceNumber'
    },
    {
        Header: "Charge Name",
        accessor: "chargeName",
        disableFilters: false,
        id: 'chargeName'
    },
    {
        Header: "Charge Type",
        accessor: "chargeType",
        disableFilters: false,
        id: 'chargeType'
    },
    {
        Header: "Charge Amount",
        accessor: "chargeAmount",
        disableFilters: true
    },
    {
        Header: "Outstanding Amount",
        accessor: "outstandingAmount",
        disableFilters: true
    }
]