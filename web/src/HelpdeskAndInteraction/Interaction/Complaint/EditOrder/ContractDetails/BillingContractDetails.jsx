import React from 'react'
import moment from 'moment'
import { ContractDetailColumns } from '../EditOrderColumns'
import { USNumberFormat } from '../../../../../common/util/util'
import DynamicTable from '../../../../../common/table/DynamicTable'

const BillingContractDetails = (props) => {

    const { complaintData } = props.data
    const contractData = props?.data?.billingContractDetails

    const contractDetailHiddenColumns = ['contractRefId', 'totalCharge', 'billPeriod', 'contractStartDate', 'contractEndDate', 'select', 'remove']
    
    const handleCellRender = (cell, row) => {

        if (cell.column.Header === "Last Bill Period" || cell.column.Header === "Next Bill Period" || cell.column.Header === "Bill Period") {
            return (
                <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (cell.column.Header === "Actual Start Date" || cell.column.Header === "Contract Start Date") {
            let date = row?.original?.actualStartDate
            return (
                <span>{date ? moment(date).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (cell.column.Header === "Actual End Date") {
            return (
                <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (cell.column.Header === "Contract End Date" || cell.column.Header === "End Date") {
            return (
                <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (cell.column.Header === "Billable Reference Number") {
            let billRefNo = contractData?.billRefNo
            return (
                <span>{billRefNo}</span>
            )
        }
        else if (cell.column.Header === "Fee Type") {
            let frequency = row?.original?.frequencyDesc?.description
            return (
                <span>{frequency || "-"}</span>
            )
        }
        else if (cell.column.Header === "Charge Name") {
            return (
                <span>{row?.original?.charge?.chargeName ? row?.original?.charge?.chargeName : row?.original?.chargeName}</span>
            )
        }
        else if (cell.column.Header === "Charge Type") {
            return (
                <span>{row?.original?.charge?.chargeCat ? row?.original?.charge?.chargeCatDesc?.description : row?.original?.chargeTypeDesc?.description}</span>
            )
        }
        else if (cell.column.Header === "Status") {
            return (
                <span>{cell.value && (cell.value === 'COMPLETED' || cell.value === 'ACTIVE') ? 'Active' : (cell.value === 'INACTIVE' || cell.value === 'CANCEL') ? 'Inactive' : 'Pending'}</span>
            )
        }
        else if (cell.column.Header === "RC" || cell.column.Header === "OTC" || cell.column.Header === "Usage" || cell.column.Header === "Credit Adjustment" || cell.column.Header === "Debit Adjustment" || cell.column.Header === "Total Amount" || cell.column.Header === "Balance Amount") {
            return (
                <span>{USNumberFormat(cell.value)}</span>
            )
        }
        else if (cell.column.Header === "Prorated") {
            return (
                <span>{cell.value === 'Y' ? 'Yes' : cell.value === 'N' ? 'No' : '-'}</span>
            )
        }
        else if (cell.column.Header === "Service Number") {
            let sNo = row?.original?.identificationNo
            return (
                <span>{sNo}</span>
            )
        }
        else if (['Updated At', 'Created At'].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>)
        }
        else if (cell.column.Header === "Created By") {
            return (<span>{(row?.original?.createdByName?.firstName || "") + " " + (row?.original?.createdByName?.lastName || "")}</span>)
        }
        else if (cell.column.Header === "Updated By") {
            return (<span>{(row?.original?.updatedByName?.firstName || "") + " " + (row?.original?.updatedByName?.lastName || "")}</span>)
        } 
        else {
            return (
                <span>{cell.value}</span>
            )
        }
    }

    return (
        <>
            <div className="col-12 mt-2 pb-2">
            {
                contractData && contractData && !!contractData.length ?
                    <DynamicTable
                        row={contractData}
                        header={ContractDetailColumns}
                        itemsPerPage={10}
                        hiddenColumns={contractDetailHiddenColumns}
                        handler={{
                            handleCellRender: handleCellRender
                        }}
                    />
                    :
                        <p class="skel-widget-warning">No records found!!!</p>
            }
            </div>
        </>
    )
}

export default BillingContractDetails