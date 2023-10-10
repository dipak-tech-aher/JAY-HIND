import React, { useState, useEffect, useContext } from 'react';
import DynamicTable from '../../../../common/table/DynamicTable';
import { ViewContractColumnList, ViewContractHiddenColumns } from './ViewContractColumnList';
import moment from 'moment';
import { unstable_batchedUpdates } from 'react-dom';
import ViewContractTable from '../../../Contract/viewContract'
import EditContract from '../../../Contract/EditContract';
import { USNumberFormat } from '../../../../common/util/util';
import { AppContext } from '../../../../AppContext';
import cCount from "../../../../assets/images/icons/contract-count.png";
import cValue from "../../../../assets/images/icons/total-contract.png";
import tRevenue from "../../../../assets/images/icons/total-revenues.png";
import tCust from "../../../../assets/images/icons/total-customer.png";
import NCust from "../../../../assets/images/icons/new-customer.png";
import RCAmt from "../../../../assets/images/icons/total-recurring.png";
import NRCAmt from "../../../../assets/images/icons/total-non-recurring.png";
import UAmt from "../../../../assets/images/icons/total-usage.png";


const ViewContract = (props) => {
    const { auth } = useContext(AppContext)
    const [userPermission, setUserPermission] = useState({ contractSearch: false, viewContractList: false })
    const { isReview } = props;
    const { viewContractList, viewContractInputs, viewContractCounts, viewContractTotalRowCount, viewContractPerPage, viewContractCurrentPage, viewContractRegenerateCount, billingReadOnly } = props.data;
    const { handleOnViewContractsInputsChange, handleOnViewContractSearch, handleViewContractPageSelect, setViewContractPerPage, setViewContractCurrentPage, doSoftRefreshForContract, handleOnViewContractsInputsClear } = props.handler;
    const [showSummary, setShowSummary] = useState(true);
    const [showSearch, setShowSearch] = useState(true);
    const [exportBtn, setExportBtn] = useState(false);
    const [isHold, setIsHold] = useState(true);
    const [isViewEditContractOpen, setIsViewEditContractOpen] =  useState(false);
    const [contractToView, setContractToView] = useState({});
    const [isContractViewOpen, setIsContractViewOpen] = useState({ openModal: false });
    const [contractSearchHiddenColumns, setContractSearchHiddenColumns] = useState(['edit'])

    useEffect(() => {
        // if (props.data === undefined) { setIsOpen(false) }
        let rolePermission = []
        
        auth && auth.permissions && auth.permissions.filter(function (e) {
            let property = Object.keys(e)
            if (property[0] === "Contract") {
                let value = Object.values(e)
                rolePermission = Object.values(value[0])
            }
        })

        let search, viewList;
        rolePermission.map((screen) => {
            if (screen.screenName === "Search Contract") {
                search = screen.accessType
            } else if (screen.screenName === "View Contract List") {
                viewList = screen.accessType
            }

        })

        setUserPermission({ contractSearch: search, viewContractList: viewList })

        
    }, [auth])

    const handleCellRender = (cell, row) => {
        if (['Contract Start Date', 'Contract End Date'].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : ''}</span>)
        }
        else if (["Total RC", "Total NRC", "Total Usage", "Credit Adjustment", "Debit Adjustment"].includes(cell.column.Header)) {
            return (
                <span>{USNumberFormat(cell.value)}</span>
            )
        }
        else if (cell.column.Header === "Total Charge") {
            let amount = Number(row?.original?.rcAmount) + Number(row?.original?.otcAmount) + Number(row?.original?.usageAmount)
            return (
                <span>{USNumberFormat(amount)}</span>
            )
        }
        else if (cell.column.Header === "Customer Name") {
            let name = row?.original?.customer?.firstName + " " + row?.original?.customer?.lastName
            return (
                <span>{name}</span>
            )
        }
        else if (cell.column.Header === "Customer Number") {
            let name = row?.original?.customer?.customerNo
            return (
                <span>{name}</span>
            )
        }
        else if (cell.column.Header === "Service ID") {
            let soNo = row?.original?.monthlyContractDtl[0]?.soNumber
            return (
                <span>{soNo}</span>
            )
        }
        else if (['View'].includes(cell.column.Header)) {
            return (
                <button type="button" className="skel-btn-submit d-flex"
                    onClick={() => handleOnViewContract(row.original)}
                >
                    <i className="mdi mdi-file-document-edit-outline font10 mr-1"></i>
                    <small>
                        {
                            isReview ? 'View/Edit' : 'View'
                        }
                    </small>
                </button>
            )
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    const handleViewEditCellRender = (cell, row) => {

        if (cell.column.Header === "Status") {
            return (
                <span>{row?.original?.statusDesc?.description}</span>
            )
        }
        else if (["Actual Contract Start Date", "Actual Contract End Date", "Contract End Date", "Last Bill Period", "Next Bill Period"].includes(cell.column.Header)) {
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
        else if (cell.column.Header === "Contract Start Date") {
            return (
                <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (["RC", "OTC", "Usage", "Credit Adjustment", "Debit Adjustment", "Total Charge", "Charge Amount"].includes(cell.column.Header)) {
            return (
                <span>{USNumberFormat(cell.value)}</span>
            )
        }
        else if (cell.column.Header === "Customer Name") {
            let name = row?.original?.customer?.firstName + " " + row?.original?.customer?.lastName
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
        else if (['Updated At Date and Time', 'Created At Date and Time'].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>)
        }
        else if (cell.column.Header === "Created By") {
            return (<span>{(row?.original?.createdByName?.firstName || '') + " " + (row?.original?.createdByName?.lastName || '')}</span>)
        }
        else if (cell.column.Header === "Updated By") {
            return (<span>{(row?.original?.updatedByName?.firstName || '') + " " + (row?.original?.updatedByName?.lastName || '')}</span>)
        }
        else if (cell.column.Header === "Service Number") {
            let sNo = row?.original?.serviceNo
            return (
                <span>{sNo}</span>
            )
        }
        else {
            return (
                <span>{cell.value}</span>
            )
        }
    }

    const handleOnViewContract = (contract) => {
        unstable_batchedUpdates(() => {
            setContractToView(contract);
            if (isReview) {
                setIsViewEditContractOpen(true);
            }
            else {
                setIsContractViewOpen({ openModal: true })
            }
        })
    }

    const handleOnReGenerate = (e) => {
    }

    return (
        <div className="row">
            <div className="col-12">
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
                            <div className="row stat-cards col-md-12 m-0" id="infodata">
                                <div className="col-12">
                                    <div className="row blog">
                                        <div className="col-md-12">
                                            <div>
                                                <div className="row">
                                                    <div className="col-3">
                                                        <article className="stat-cards-item border">
                                                            <div className="stat-cards-icon primary">
                                                                <img src={cCount} alt="cntract-contact" />
                                                            </div>
                                                            <div className="stat-cards-info">
                                                                <p className="stat-cards-info__num">{viewContractCounts?.contractCount || 0}</p>
                                                                <p className="stat-cards-info__title">Total Contract Count</p>
                                                            </div>
                                                        </article>
                                                    </div>
                                                    <div className="col-3">
                                                        <article className="stat-cards-item border">
                                                            <div className="stat-cards-icon primary">
                                                                <img src={cValue} alt="cntract-value" />
                                                            </div>
                                                            <div className="stat-cards-info">
                                                                <p className="stat-cards-info__num">{USNumberFormat(viewContractCounts?.contractValue)}</p>
                                                                <p className="stat-cards-info__title">Total Contract Value</p>
                                                            </div>
                                                        </article>
                                                    </div>
                                                    <div className="col-3">
                                                        <article className="stat-cards-item border">
                                                            <div className="stat-cards-icon primary">
                                                                <img src={tRevenue} alt="total-revenue" />
                                                            </div>
                                                            <div className="stat-cards-info">
                                                                <p className="stat-cards-info__num">{USNumberFormat(viewContractCounts?.revenue)}</p>
                                                                <p className="stat-cards-info__title">Total Revenue</p>
                                                            </div>
                                                        </article>
                                                    </div>
                                                    <div className="col-3">
                                                        <article className="stat-cards-item border">
                                                            <div className="stat-cards-icon primary">
                                                                <img src={tCust} alt="total-customer" />
                                                            </div>
                                                            <div className="stat-cards-info">
                                                                <p className="stat-cards-info__num">{viewContractCounts?.customers || 0}</p>
                                                                <p className="stat-cards-info__title">Total Customers</p>
                                                            </div>
                                                        </article>
                                                    </div>
                                                </div>
                                                <div className="row pt-2 pb-2">
                                                    <div className="col-3">
                                                        <article className="stat-cards-item border">
                                                            <div className="stat-cards-icon primary">
                                                                <img src={NCust} alt="new-customer" />
                                                            </div>
                                                            <div className="stat-cards-info">
                                                                <p className="stat-cards-info__num">{viewContractCounts?.newCustomers || 0}</p>
                                                                <p className="stat-cards-info__title">New Customers</p>
                                                            </div>
                                                        </article>
                                                    </div>
                                                    <div className="col-3">
                                                        <article className="stat-cards-item border">
                                                            <div className="stat-cards-icon primary">
                                                                <img src={RCAmt} alt="rcAmount" />
                                                            </div>
                                                            <div className="stat-cards-info">
                                                                <p className="stat-cards-info__num">{USNumberFormat(viewContractCounts?.rcAmount)}</p>
                                                                <p className="stat-cards-info__title">Total RC Amount
                                                                </p>
                                                            </div>
                                                        </article>
                                                    </div>
                                                    <div className="col-3">
                                                        <article className="stat-cards-item border">
                                                            <div className="stat-cards-icon primary">
                                                                <img src={NRCAmt} alt="nrcAmount" />
                                                            </div>
                                                            <div className="stat-cards-info">
                                                                <p className="stat-cards-info__num">{USNumberFormat(viewContractCounts?.nrcAmount)}</p>
                                                                <p className="stat-cards-info__title">Total NRC Amount
                                                                </p>
                                                            </div>
                                                        </article>
                                                    </div>
                                                    <div className="col-3">
                                                        <article className="stat-cards-item border">
                                                            <div className="stat-cards-icon primary">
                                                                <img src={UAmt} alt="usageAmount" />
                                                            </div>
                                                            <div className="stat-cards-info">
                                                                <p className="stat-cards-info__num">{USNumberFormat(viewContractCounts?.usageAmount)}</p>
                                                                <p className="stat-cards-info__title">Total Usage Amount
                                                                </p>
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
                            <div className="row">
                                <div className="col-4">
                                    <h4 id="list-item-1" className="pl-1">Search Contracts</h4>
                                </div>
                                <div className="col-5 pt-1 text-center">
                                    {
                                        viewContractRegenerateCount > 0 &&
                                        <span className="blink_me pr-5">{viewContractRegenerateCount} Contracts update Found, Please Re-generate.</span>
                                    }
                                    <button type="button" className="btn btn-labeled btn-primary btn-sm d-none" onClick={handleOnReGenerate}>
                                        <small>Re-generate</small>
                                    </button>
                                </div>
                                <div className="col-2 pt-2 text-right h-search">

                                    <div className={`text-primary cursor-pointer ${((userPermission.contractSearch === 'deny') ? "d-none" : "")}`} onClick={() => setShowSearch(!showSearch)}>
                                        {showSearch ? 'Hide' : 'Show'} Search
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                    {
                        showSearch && userPermission?.contractSearch !== 'deny' &&
                        <div className="row col-12 border p-2 m-0 align-items-center" id="searchBlock">
                            <div className="col">
                                <div className="form-group">
                                    <label htmlFor="contractId" className="col-form-label">Contract<br />ID</label>
                                    <input type="text" id='contractId' className="form-control" placeholder="Contract ID" value={viewContractInputs.contractId} onChange={handleOnViewContractsInputsChange} />
                                </div>
                            </div>
                            {/* <div className="col">
                                <div className="form-group">
                                    <label htmlFor="soNumber" className="col-form-label">Service<br />ID</label>
                                    <input type="text" id='soNumber' className="form-control" placeholder="Service ID" value={viewContractInputs.soNumber} onChange={handleOnViewContractsInputsChange} />
                                </div>
                            </div> */}
                            <div className="col">
                                <div className="form-group">
                                    <label htmlFor="customerNumber" className="col-form-label">Customer<br />Number</label>
                                    <input type="text" id='customerNumber' className="form-control" placeholder="Customer Number" value={viewContractInputs.customerNumber} onChange={handleOnViewContractsInputsChange} />
                                </div>
                            </div>

                            <div className="col">
                                <div className="form-group">
                                    <label htmlFor="customerName" className="col-form-label">Customer<br />Name</label>
                                    <input type="text" id="customerName" className="form-control" placeholder="Customer Name" value={viewContractInputs.customerName} onChange={handleOnViewContractsInputsChange} />
                                </div>
                            </div>
                            {/* <div className="col">
                                <div className="form-group">
                                    <label htmlFor="billRefNo" className="col-form-label">Billable<br />Ref Number</label>
                                    <input type="text" id="billRefNo" className="form-control" placeholder="Billable Ref No" value={viewContractInputs.billRefNo} onChange={handleOnViewContractsInputsChange} />
                                </div>
                            </div>
                            <div className="col">
                                <div className="form-group">
                                    <label htmlFor="billRefName" className="col-form-label">Billable<br />Ref Name</label>
                                    <input type="text" id="billRefName" className="form-control" placeholder="Billable Ref Name" value={viewContractInputs.billRefName} onChange={handleOnViewContractsInputsChange} />
                                </div>
                            </div> */}
                            <div className="col">
                                <div className="form-group">
                                    <label htmlFor="startDate" className="col-form-label">Contract<br />Start Date</label>
                                    <input type="date" id="startDate" className="form-control" value={viewContractInputs.startDate} onChange={handleOnViewContractsInputsChange} />
                                </div>
                            </div>
                            <div className="col">
                                <div className="form-group">
                                    <label htmlFor="endDate" className="col-form-label">Contract<br />End Date</label>
                                    <input type="date" id="endDate" className="form-control" value={viewContractInputs.endDate} onChange={handleOnViewContractsInputsChange} />
                                </div>
                            </div>
                                <div className="col">
                                    <div className="form-group mb-0">
                                        <label>&nbsp;</label>
                                    <button type="button" className="skel-btn-cancel" onClick={handleOnViewContractsInputsClear}>
                                        <small>Clear</small>
                                    </button>
                                <button type="button" className="skel-btn-submit" onClick={handleOnViewContractSearch} >
                                    <small>Search</small>
                                        </button>
                                        </div>
                            </div>
                        </div>  
                    }
                    <div className="border">
                        {
                            !!viewContractList?.length && userPermission?.viewContractList !== "deny" &&
                            <DynamicTable
                                listKey={"Contract List"}
                                row={viewContractList}
                                rowCount={viewContractTotalRowCount}
                                header={ViewContractColumnList}
                                hiddenColumns={ViewContractHiddenColumns}
                                itemsPerPage={viewContractPerPage}
                                backendPaging={true}
                                backendCurrentPage={viewContractCurrentPage}
                                exportBtn={exportBtn}
                                handler={{
                                    handleCellRender: handleCellRender,
                                    handlePageSelect: handleViewContractPageSelect,
                                    handleItemPerPage: setViewContractPerPage,
                                    handleCurrentPage: setViewContractCurrentPage,
                                    handleExportButton: setExportBtn
                                }}
                            />
                        }
                    </div>
                </section>
            </div>
            {/* {
                isViewEditContractOpen &&
                <ViewEditContractModal
                    data={{
                        isViewEditContractOpen,
                        contractList: contractToView,
                        isEdit: isReview
                    }}
                    handler={{
                        setIsViewEditContractOpen,
                        pageRefresh: doSoftRefreshForContract
                    }}
                />
            } */}
            {
                isContractViewOpen?.openModal &&
                <ViewContractTable
                    data={{
                        isOpen: isContractViewOpen,
                        contract: contractToView,
                        type: 'unbilled',
                        contractSearchHiddenColumns: contractSearchHiddenColumns,
                    }}
                    handler={{
                        setIsOpen: setIsContractViewOpen,
                        handleCellRender: handleViewEditCellRender,
                        setContractSearchHiddenColumns: setContractSearchHiddenColumns,
                        pageRefresh: doSoftRefreshForContract
                    }}
                />
            }
            {
                isViewEditContractOpen &&
                <EditContract
                    data={{
                        isOpen: isViewEditContractOpen,
                        contract: contractToView,
                        type: 'unbilled',
                        contractSearchHiddenColumns: contractSearchHiddenColumns,
                        billingReadOnly
                    }}
                    handler={{
                        setIsOpen: setIsViewEditContractOpen,
                        setContractSearchHiddenColumns: setContractSearchHiddenColumns,
                        pageRefresh: doSoftRefreshForContract
                    }}
                />
            }
        </div>
    )
}

export default ViewContract;