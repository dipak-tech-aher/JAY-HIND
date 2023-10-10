import React, { useState } from 'react'
import { Link, Element } from 'react-scroll'
import moment from 'moment'
import { ContractSerachCols, ContractDetailEditCols } from './contractSerachCols';
import DynamicTable from '../../common/table/DynamicTable';
import { USNumberFormat } from '../../common/util/util';

const UnbilledSearchContractView = (props) => {

    const { contractData } = props?.location?.state?.data


    const unbilledContractList = [contractData]
    const contractSearchHiddenColumns = ['startDate', 'endDate', 'nextBillPeriod', 'lastBillPeriod', 'status', 'contractRefId', 'chargeName', 'totalCharge', 'edit', 'itemName', 'serviceNumber', 'select', 'billPeriod']
    const contractDetailHiddenColumns = ['lastBillPeriod', 'nextBillPeriod', 'contractRefId', 'totalCharge', 'edit', 'select', 'remove', 'action', 'billPeriod', 'balanceAmount']
    const [exportBtn, setExportBtn] = useState(false)

    const handleCellRender = (cell, row) => {

        if (cell.column.Header === "Status") {
            return (
                <span>{row?.original?.statusDesc?.description}</span>
            )
        }
        if (cell.column.Header === "Service ID") {
            return (
                <span>{row?.original?.monthlyContractDtl && row?.original?.monthlyContractDtl[0]?.soNumber}</span>
            )
        }
        else if (["Contract Start Date", "Contract End Date", "Last Bill Period", "Next Bill Period"].includes(cell.column.Header)) {
            return (
                <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (["Bill Period"].includes(cell.column.Header)) {
            let date = row?.original?.lastBillPeriod
            return (
                <span>{date ? moment(date).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (cell.column.Header === "Product Start Date") {
            let data = row?.original?.actualStartDate
            return (
                <span>{data ? moment(data).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (["RC", "OTC", "Usage", "Credit Adjustment", "Debit Adjustment", "Total Charge"].includes(cell.column.Header)) {
            return (
                <span>{USNumberFormat(cell.value)}</span>
            )
        }
        else if (cell.column.Header === "Customer Name") {
            let name = (row?.original?.customer?.firstName || '') + " " + (row?.original?.customer?.lastName || '')
            return (
                <span>{name}</span>
            )
        }
        else if (cell.column.Header === "Customer Number") {
            let cNo = row?.original?.customer?.customerNo
            return (
                <span>{cNo}</span>
            )
        }
        else if (cell.column.Header === "Service Number") {
            let sNo = row?.original?.identificationNo
            return (
                <span>{sNo}</span>
            )
        }
        else if (['Updated At Date and Time', 'Created At Date and Time'].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>)
        }
        else if (cell.column.Header === "Created By") {
            return (<span>{(row?.original?.createdByName?.firstName || '')  + " " + (row?.original?.createdByName?.lastName|| '')}</span>)
        }
        else if (cell.column.Header === "Updated By") {
            return (<span>{(row?.original?.updatedByName?.firstName || '')  + " " + (row?.original?.updatedByName?.lastName|| '')}</span>)
        }
        else {  
            return (
                <span>{cell.value}</span>
            )
        }
    }

    const handleCellRenderDetail = (cell, row) => {

        if (["Contract Start Date", "Contract End Date", "End Date", "Actual End Date", "Actual Start Date", "Last Bill Period", "Next Bill Period", "Bill Period"].includes(cell.column.Header)) {
            return (
                <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (cell.column.Header === "Start Date") {
            let date = row?.original?.actualStartDate
            return (
                <span>{date ? moment(date).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (cell.column.Header === "Billable Reference Number") {
            let billRefNo = contractData?.billRefNo
            return (
                <span>{billRefNo}</span>
            )
        }
        else if (cell.column.Header === "Tier Type") {
            return (
                <span>{cell.value === 'Y' ? 'Yes' : cell.value === 'N' ? 'No' : '-'}</span>
            )
        }
        else if (cell.column.Header === "Status") {
            return (
                <span>{row?.original?.statusDesc?.description}</span>
            )
        }
        else if (["RC", "OTC", "Usage", "Credit Adjustment", "Debit Adjustment", "Total Amount"].includes(cell.column.Header)) {
            return (
                <span>{USNumberFormat(cell.value)}</span>
            )
        }
        else if (["Balance Amount"].includes(cell.column.Header)) {
            return (
                <span>{row?.original?.chargeType === 'CC_USGC' ? "" : USNumberFormat(cell.value)}</span>
            )
        }
        else if (cell.column.Header === "Prorated") {
            return (
                <span>{cell.value === 'Y' ? 'Yes' : cell.value === 'N' ? 'No' : '-'}</span>
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
        else if (cell.column.Header === "Service Number") {
            let sNo = row?.original?.identificationNo
            return (
                <span>{sNo}</span>
            )
        }
        else if (['Updated At Date and Time', 'Created At Date and Time'].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>)
        }
        else if (cell.column.Header === "Created By") {
            return (<span>{(row?.original?.createdByName?.firstName || '') + " " +( row?.original?.createdByName?.lastName|| '') }</span>)
        }
        else if (cell.column.Header === "Updated By") {
            return (<span>{(row?.original?.updatedByName?.firstName || '') + " " + (row?.original?.updatedByName?.lastName|| '') }</span>)
        }
        else {
            return (
                <span>{cell.value}</span>
            )
        }
    }

    return (
        <>
            {/* <div className="row inv">
                <div className="col-11">
                    <div className="page-title-box">
                        <h4 className="page-title">Unbilled Contract Details</h4>
                    </div>
                </div>
                <div className="col-1">
                    <button className="btn btn-labeled btn-primary btn-sm mt-1" onClick={() => { props.history.goBack() }}>Back</button>
                </div>
            </div> */}
            <div className="row mt-1">
                <div className="col-lg-12 p-0">
                    <div className="card-box p-0">
                        <div className="row">
                            {/* <div className="col-2 pt-2 sticky" style={{ background: "#FFF" }}>
                                <ul id="scroll-list" className="list-group">
                                    <li>
                                        <Link activeclassName="active" className="list-group-item list-group-item-action" to="contract" spy={true} offset={-120} smooth={true} duration={100} >Unbilled Contract</Link>
                                    </li>
                                    <li>
                                        <Link activeclassName="active" className="list-group-item list-group-item-action" to="details" spy={true} offset={-120} smooth={true} duration={100} >Unbilled Contract Details</Link>
                                    </li>
                                </ul>
                            </div> */}
                            <div className="col-md-12">
                                <div className="scrollspy-div ac-screen">
                                    <Element name="contract">
                                        <div className="row mt-2">
                                            <section className="triangle col-12">
                                                <div className="row col-12">
                                                    <div className="col-12">
                                                        <h4 id="list-item-0" className="pl-1">Unbilled Contract</h4>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                        <div className="col-md-12 card-box m-0 ">
                                            {
                                                unbilledContractList && !!unbilledContractList.length &&
                                                <div className="card">
                                                    <DynamicTable
                                                        listKey={"Contract List"}
                                                        row={unbilledContractList}
                                                        filterRequired={false}
                                                        itemsPerPage={10}
                                                        exportBtn={exportBtn}
                                                        header={ContractSerachCols}
                                                        hiddenColumns={contractSearchHiddenColumns}
                                                        handler={{
                                                            handleCellRender: handleCellRender,

                                                        }}
                                                    />
                                                </div>
                                            }
                                        </div>
                                    </Element>
                                    <Element name="details">
                                        <div className="row">
                                            <section className="triangle col-12">
                                                <div className="row col-12">
                                                    <div className="col-12">
                                                        <h4 id="list-item-0" className="pl-1">Unbilled Contract Detail</h4>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                        <div className="col-md-12 card-box m-0 ">
                                            {
                                                contractData && contractData?.monthlyContractDtl && !!contractData?.monthlyContractDtl.length ?
                                                    <div className="card">
                                                        <DynamicTable
                                                            listKey={"Contract List"}
                                                            row={contractData?.monthlyContractDtl}
                                                            itemsPerPage={10}
                                                            header={ContractDetailEditCols}
                                                            exportBtn={exportBtn}
                                                            hiddenColumns={contractDetailHiddenColumns}
                                                            handler={{
                                                                handleCellRender: handleCellRenderDetail,
                                                                handleExportButton: setExportBtn
                                                            }}
                                                        />
                                                    </div>
                                                    :
                                                    <p class="skel-widget-warning">No records found!!!</p>
                                            }
                                        </div>
                                    </Element>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default UnbilledSearchContractView