import React, { useState } from 'react'
import DynamicTable from '../../../common/table/DynamicTable';
import moment from 'moment'
import { USNumberFormat } from '../../../common/util/util';

const InvoiceDetailList = (props) => {

    const { invoiceData } = props?.data
    const [exportBtn, setExportBtn] = useState(false)
    const invoiceDetailList = invoiceData[0]?.invoiceDetails
    // useEffect(() => {
    //     setInvoiceDetailList(invoiceData[0]?.invoiceDetails)
    // }, [])

    const handleCellRender = (cell, row) => {

        // if (cell.column.Header === "Prorated") {
        //     return (
        //         <span>{cell.value === "Y" ? "Yes" : cell.value === "N" ? "No" : "-"}</span>
        //     )
        // }
        if (cell.column.Header === "Billable Reference Number") {
            let billRefNo = invoiceData[0].billRefNo
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
        /*else if (cell.column.Header === "Charge Type") {
            return (
                <span>{row?.original?.contractDetail?.charge?.chargeCat ? row?.original?.contractDetail?.charge?.chargeCatDesc?.description : row?.original?.contractDetail?.chargeTypeDesc?.description}</span>
            )
        }*/
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
        } else if (cell.column.Header === "Quantity"){
            return(
                <span>{cell?.value ? Number(cell.value).toFixed(0) :'-'}</span>
            )
        }
        else {
            return (
                <span>{cell?.value ? cell?.value : '-' }</span>
            )
        }
    }

    return (
        <>
            {
                !!invoiceDetailList.length &&
                <div className="card-body" id="datatable">
                    <DynamicTable
                        listKey={"Invoice Details List"}
                        row={invoiceDetailList}
                        header={InvoiceDetailListColumns}
                        itemsPerPage={10}
                        hiddenColumns={['select']}
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

export default InvoiceDetailList

export const InvoiceDetailListColumns = [
    {
        Header: "Select",
        accessor: "select",
        disableFilters: true,
    },
    {
        Header: "Invoice ID",
        accessor: "invoiceId",
        disableFilters: true,
        id: 'invoiceId'
    },
    // {
    //     Header: "Service ID",
    //     accessor: "monthlyContractDet.soNumber",
    //     disableFilters: true
    // },
    // {
    //     Header: "Product Name",
    //     accessor: "monthlyContractDet.prodDetails.planName",
    //     disableFilters: true
    // },
    // {
    //     Header: "Product Description",
    //     accessor: "monthlyContractDet.itemName",
    //     disableFilters: true,
    //     id: 'contractName'
    // },
    {
        Header: "Invoice Start Date",
        accessor: "invStartDate",
        disableFilters: true
    },
    {
        Header: "Invoice End Date",
        accessor: "invEndDate",
        disableFilters: true
    },
    {
        Header: "Minimum Commitment",
        accessor: "monthlyContractDet.minCommitment",
        disableFilters: true
    },
    {
        Header: "Total Consumption",
        accessor: "monthlyContractDet.totalConsumption",
        disableFilters: true
    },
    {
        Header: "Charge Type",
        accessor: "charge.chargeCatDesc.description",
        disableFilters: true
    },
    {
        Header: "Charge Amount",
        accessor: "chargeAmt",
        disableFilters: true
    },
    {
        Header: "Fee Type",
        accessor: "monthlyContractDet.frequencyDesc.description",
        disableFilters: true
    },
    {
        Header: "Prorated",
        accessor: "monthlyContractDet.prorated",
        disableFilters: true
    },
    {
        Header: "Quantity",
        accessor: "monthlyContractDet.quantity",
        disableFilters: true
    },
    {
        Header: "Advance Flag",
        accessor: "monthlyContractDet.upfrontPaymentDesc.description",
        disableFilters: true
    },
    {
        Header: "Credit Adjustment",
        accessor: "creditAdj",
        disableFilters: true
    },
    {
        Header: "Debit Adjustment",
        accessor: "debitAdj",
        disableFilters: true
    },
    {
        Header: "Invoice Amount",
        accessor: "invAmt",
        disableFilters: true
    },
    {
        Header: "Invoice O/S Amount",
        accessor: "invOsAmt",
        disableFilters: true
    },
    {
        Header: "Invoice Status",
        accessor: "invoiceStatus",
        disableFilters: true
    }
]
