import React, { useEffect, useState } from 'react'
import { Link, Element } from 'react-scroll'
import moment from 'moment'
import { ContractDetailCols } from './contractSerachCols';
import DynamicTable from '../../common/table/DynamicTable';

import { get, post } from '../../common/util/restUtil';
import { properties } from '../../properties';
import { USNumberFormat } from '../../common/util/util';

const ContractDetailsForm = (props) => {

    const { contractData } = props?.location?.state?.data
    const [contractDetailHiddenColumns, setContractDetailHiddenColumns] = useState(['ageingDays','contractRefId', 'totalCharge', 'billPeriod', 'select', 'remove'])
    const [exportBtn, setExportBtn] = useState(false)
    const [customerData, setCustomerData] = useState({})
    const [quickLinks, setQuickLinks] = useState([{}])
    const [isQuickLinkEnabled, setIsQuickLinkEnabled] = useState(false)

    useEffect(() => {
        // const requestBody = {
        //     billRefNo: contractData?.billRefNo,
        //     //customerName : contractData?.customer?.firstName + " " + contractData?.customer?.lastName
        //     customerNumber: contractData?.customer?.crmCustomerNo
        // }
        const requestBody = {
            screenName: "Search Contract",
            moduleName: "Contract"
        }
        
        post(properties.MAINMENU_API + '/getQuickLinks', requestBody)
            .then((response) => {
                setQuickLinks(response.data[0].links.QuickLinks)
            })
            .catch((error) => {
                console.log("error", error)
            })
            .finally()

        
        get(properties.CUSTOMER360_API + '/' + contractData?.customer?.customerId)
        .then((response) => {
            setCustomerData(response?.data)
        }).catch(error => console.log(error))
        .finally()
        // 
        // post(properties.CONTRACT_API + '/customer/search', requestBody)
        //     .then((resp) => {
        //         if (resp.data) {
        //             setCustomerData(resp?.data[0])
        //         }
        //     })
        //     .catch((error) => {
        //         console.log("error", error)
        //     })
        //     .finally()
    }, [])

    const handleCellRender = (cell, row) => {

        if (cell.column.Header === "Last Bill Period" || cell.column.Header === "Next Bill Period" || cell.column.Header === "Bill Period") {
            return (
                <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (["Contract Start Date","Contract End Date"].includes(cell.column.Header)) {
            return (
                <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
            )
        }
        // else if (cell.column.Header === "Actual Start Date" || cell.column.Header === "Contract Start Date") {
        //     let date = row?.original?.actualStartDate
        //     return (
        //         <span>{date ? moment(date).format('DD MMM YYYY') : '-'}</span>
        //     )
        // }
        // else if (cell.column.Header === "Actual End Date") {
        //     return (
        //         <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
        //     )
        // }
        // else if (cell.column.Header === "Contract End Date" || cell.column.Header === "End Date") {
        //     let date = row?.original?.endDate
        //     return (
        //         <span>{date ? moment(date).format('DD MMM YYYY') : '-'}</span>
        //     )
        // }
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
        else if (cell.column.Header === "RC" || cell.column.Header === "OTC" || cell.column.Header === "Usage" || cell.column.Header === "Credit Adjustment" || cell.column.Header === "Debit Adjustment" || cell.column.Header === "Total Amount") {
            return (
                <span>{USNumberFormat(cell.value)}</span>
            )
        }
        else if (cell.column.Header === "Balance Amount") {
            return (
                <span>{row?.original?.chargeType === 'CC_USGC' ? "" : USNumberFormat(cell.value)}</span>
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
            return (<span>{row?.original?.createdByName?.firstName + " " + row?.original?.createdByName?.lastName}</span>)
        }
        else if (cell.column.Header === "Updated By") {
            return (<span>{row?.original?.updatedByName?.firstName + " " + row?.original?.updatedByName?.lastName}</span>)
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
                <div className="col-9">
                    <div className="page-title-box">
                        <h4 className="page-title">Contract Details</h4>
                    </div>
                </div>
                <div className="form-inline">
                            <span className="ml-1" >Quick Link</span>
                            <div className="switchToggle ml-1">
                                <input type="checkbox" id="quickLink" checked={isQuickLinkEnabled} onChange={() => {
                                    setIsQuickLinkEnabled(!isQuickLinkEnabled)
                                }} />
                                <label htmlFor="quickLink">Toggle</label>
                            </div>
                        </div>
                <div className="col-1">
                    <button className="btn btn-labeled btn-primary btn-sm mt-1" onClick={() => { props.history.goBack() }}>Back</button>
                </div>
            </div>
            <div className="row mt-1">
                <div className="col-lg-12 p-0">
                    <div className="card-box p-0">
                        <div className="row">
                            
                            <div className={isQuickLinkEnabled ? "col-md-10 p-10":"col-md-12 p-10"}>
                                <div className="scrollspy-div ac-screen">
                                    <Element name="customer">
                                        <div className="row mt-2">
                                            <section className="triangle col-12">
                                                <div className="row col-12">
                                                    <div className="col-12">
                                                        <h4 id="list-item-0" className="pl-1">Customer Details</h4>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                        <div className="col-md-12 card-box m-0 ">
                                            <div className="row pt-1">
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="crmCustomerNo" className="col-form-label">Customer Number</label>
                                                        <p>{contractData && contractData?.customer?.crmCustomerNo}</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="customerName" className="col-form-label">Customer Name</label>
                                                        <p>{customerData && (customerData?.firstName || "") + " " + (customerData?.lastName || "")}</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="billRefNo" className="col-form-label">Billable Referance Number</label>
                                                        <p>{contractData && contractData?.billRefNo}</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="custType" className="col-form-label">Customer Type</label>
                                                        <p>{customerData && customerData?.customerTypeDesc?.description}</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="createdAt" className="col-form-label">Customer Created Date</label>
                                                        <p>{customerData && moment(customerData?.createdAt).format('DD MMM YYYY')}</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="accountManager" className="col-form-label">Account Manager</label>
                                                        <p>{customerData?.billableDetails?.salesAgent}</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="currency" className="col-form-label">Currency</label>
                                                        <p>{customerData?.billableDetails?.currencyDesc?.description}</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="status" className="col-form-label">Customer Status</label>
                                                        <p>{customerData && customerData?.statusDesc?.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Element>
                                    {/*
                                    <Element name="service">
                                        <div className="row">
                                            <section className="triangle col-12 pb-2">
                                                <div className="row col-12">
                                                    <div className="col-12">
                                                        <h4 id="list-item-1" className="pl-1">Service Order Details </h4>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                        <div className="col-md-12 card-box m-0 ">
					                        <div className="row pt-1">
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="serviceOrderNumber" className="col-form-label">Service Order Number</label>
                                                        <p>2238600</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="serviceOrderType" className="col-form-label">Service Order Type</label>
                                                        <p>New Connection</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="serviceType" className="col-form-label">Service Type</label>
                                                        <p>Colocation</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="createdOn" className="col-form-label">Created On</label>
                                                        <p>1-Sep-21</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="createdBy" className="col-form-label">Created By</label>
                                                        <p>Mohamed</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="status" className="col-form-label">Status</label>
                                                        <p>Closed</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="closureDate" className="col-form-label">Service Order closure Date</label>
                                                        <p>30-Sep-21</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Element>
                                    */}
                                    <Element name="contract">
                                        <div className="row">
                                            <section className="triangle col-12">
                                                <div className="row col-12">
                                                    <div className="col-12">
                                                        <h4 id="list-item-2" className="pl-1">Contract </h4>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                        <div className="col-md-12 card-box m-0 ">
                                            <div className="row pt-1">
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="contractId" className="col-form-label">Contract ID</label>
                                                        <p>{contractData && contractData?.contractId}</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="startDate" className="col-form-label">Contract Start Date</label>
                                                        <p>{contractData && contractData?.startDate ? moment(contractData?.startDate).format('DD MMM YYYY') : '-'}</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="endDate" className="col-form-label">Contract End Date</label>
                                                        <p>{contractData && contractData?.endDate ? moment(contractData?.endDate).format('DD MMM YYYY') : '-'}</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="status" className="col-form-label">Status</label>
                                                        <p>{contractData && contractData?.statusDesc?.description}</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="rcAmount" className="col-form-label">RC Amount</label>
                                                        <p>{USNumberFormat(contractData?.rcAmount)}</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="otcAmount" className="col-form-label">OTC Amount</label>
                                                        <p>{USNumberFormat(contractData?.otcAmount)}</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="usageAmount" className="col-form-label">Usage Amount</label>
                                                        <p>{USNumberFormat(contractData?.usageAmount)}</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="lastBillPeriod" className="col-form-label">Last Bill Period</label>
                                                        <p>{contractData && contractData?.lastBillPeriod ? moment(contractData?.lastBillPeriod).format('DD MMM YYYY') : '-'}</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="nextBillPeriod" className="col-form-label">Next Bill Period</label>
                                                        <p>{contractData && contractData?.nextBillPeriod ? moment(contractData?.nextBillPeriod).format('DD MMM YYYY') : '-'}</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="status" className="col-form-label">Created By</label>
                                                        <p>{contractData && contractData?.createdByName?.firstName + " " + contractData?.createdByName?.lastName}</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="status" className="col-form-label">Created At</label>
                                                        <p>{contractData && contractData?.createdAt ? moment(contractData?.createdAt).format('DD MMM YYYY hh:mm:ss A') : '-'}</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="status" className="col-form-label">Updated By</label>
                                                        <p>{contractData && contractData?.updatedByName?.firstName + " " + contractData?.updatedByName?.lastName}</p>
                                                    </div>
                                                </div>
                                                <div className="col-3">
                                                    <div className="form-group">
                                                        <label htmlFor="status" className="col-form-label">Updated At</label>
                                                        <p>{contractData &&  contractData?.updatedAt ? moment(contractData?.updatedAt).format('DD MMM YYYY hh:mm:ss A') : '-'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Element>
                                    <Element>
                                        <div className="row">
                                            <section className="triangle col-12">
                                                <div className="row col-12">
                                                    <div className="col-12">
                                                        <h4 id="list-item-3" className="pl-1">Contract Details</h4>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                        <div className="col-md-12 card-box m-0 ">
                                            {
                                                contractData && contractData?.contractDetail && !!contractData?.contractDetail.length ?
                                                    <div className="card">
                                                        <DynamicTable
                                                            listKey={"Contract List"}
                                                            row={contractData?.contractDetail}
                                                            header={ContractDetailCols}
                                                            itemsPerPage={10}
                                                            exportBtn={exportBtn}
                                                            hiddenColumns={contractDetailHiddenColumns}
                                                            handler={{
                                                                handleCellRender: handleCellRender,
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
                            {isQuickLinkEnabled && <div className="col-2 pt-2 sticky" style={{ background: "#FFF" }}>
                                <ul id="scroll-list" className="list-group">
                                {quickLinks && quickLinks.map((e) => (
                                            <li>
                                                <Link activeclassName="active" key={e.to} className="list-group-item list-group-item-action" to={e.to} spy={true} offset={-120} smooth={true} duration={100} >{e.name}</Link>
                                            </li>
                                        ))}
                                    {/* <li>
                                        <Link activeclassName="active" className="test1" className="list-group-item list-group-item-action" to="customer" spy={true} offset={-120} smooth={true} duration={100} >Customer Details</Link>
                                    </li> */}
                                    {/* <li>
                                        <Link activeclassName="active" className="test2" className="list-group-item list-group-item-action" to="service" spy={true} offset={-120} smooth={true} duration={100} >Service Order Details</Link>
                                    </li> */}
                                    {/* <li>
                                        <Link activeclassName="active" className="test3" className="list-group-item list-group-item-action" to="contract" spy={true} offset={-120} smooth={true} duration={100} >Contract</Link>
                                    </li>
                                    <li>
                                        <Link activeclassName="active" className="test4" className="list-group-item list-group-item-action" to="contractDetail" spy={true} offset={-120} smooth={true} duration={100} >Contract Details</Link>
                                    </li> */}
                                </ul>
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ContractDetailsForm