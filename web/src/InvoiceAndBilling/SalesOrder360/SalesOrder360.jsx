import React, { useEffect, useState } from 'react'
import { Link, Element } from 'react-scroll'
import SearchContract from '../Contract/SearchContract'
import SearchInvoice from '../Invoice/SearchInvoice'
import BillingSchedule from './BillingSchedule'
import SalesOrderOverview from './SalesOrderOverview'
import moment from 'moment'
import { unstable_batchedUpdates } from 'react-dom';
import WorkOrderList from './WorkOrderList'
import { post } from "../../common/util/restUtil";
import { properties } from "../../properties";


const SalesOrder360 = (props) => {

    const soData = props?.location?.state?.soData
    const [refresh, setRefresh] = useState(false)
    const [leftNavCounts, setLeftNavCounts] = useState({
        productDetails: "",
        contract: "",
        unbilledContract: "",
        contractHistory: "",
        invoice: "",
        billingSchedule: ""
    })
    const [woCounts, setWoCounts] = useState({
        srCount: ""
    })
    const [billInputs, setBillInputs] = useState({
        startDate: moment().startOf('year').format('YYYY-MM-DD'),
        endDate: moment().format('YYYY-MM-DD'),
        soId: soData?.soId
    })
    const [quickLinks, setQuickLinks] = useState([{}])
    const [isQuickLinkEnabled, setIsQuickLinkEnabled] = useState(true)

    const pageRefresh = () => {
        unstable_batchedUpdates(() => {
            setLeftNavCounts({
                ...leftNavCounts,
                contract: "",
                unbilledContract: "",
                contractHistory: "",
                invoice: "",
                billingSchedule: ""
            })
            setRefresh(!refresh)
        })
    }

    useEffect(() => {
        const requestBody = {
            screenName: "Search Services",
            moduleName: "Manage Services "
        }
        
        post(properties.MAINMENU_API + '/getQuickLinks', requestBody)
            .then((response) => {
                setQuickLinks(response.data[0].links.SalesOrder)
            })
            .catch((error) => {
                console.log("error", error)
            })
            .finally()
    },[])

    const handleQuickLinks = (e) => {
        if (e.name === "Product Details") {
            return (
                <li>
                    <Link activeclassName="active" className="list-group-item list-group-item-action" to={e.to} spy={true} offset={-160} smooth={true} duration={100} >{e.name}
                        <span className="badge badge-primary badge-pill float-right">{(leftNavCounts && leftNavCounts?.productDetails !== undefined && leftNavCounts?.productDetails !== 0) ? leftNavCounts?.productDetails : ''}</span>
                    </Link>
                </li>
            )
        }
        else if (e.name === "Work Order") {
            return (
                <li>
                    <Link activeclassName="active" className="list-group-item list-group-item-action" to={e.to} spy={true} offset={-120} smooth={true} duration={100} >{e.name}
                        <span className="badge badge-primary badge-pill float-right">{(woCounts && woCounts?.srCount !== undefined && woCounts?.srCount !== 0) ? woCounts?.srCount : ''}</span>
                    </Link>
                </li>
            )
        }
        else if (e.name === "Contract") {
            return (
                <li>
                    <Link activeclassName="active" className="list-group-item list-group-item-action" to={e.to} spy={true} offset={-120} smooth={true} duration={100} >{e.name}
                        <span className="badge badge-primary badge-pill float-right">{(leftNavCounts && leftNavCounts?.contract !== undefined && leftNavCounts?.contract !== 0) ? leftNavCounts?.contract : ''}</span>
                    </Link>
                </li>
            )
        }
        else if (e.name === "Unbilled Contract") {
            return(<li>
                <Link activeclassName="active" className="list-group-item list-group-item-action" to={e.to} spy={true} offset={-120} smooth={true} duration={100} >{e.name}
                    <span className="badge badge-primary badge-pill float-right">{(leftNavCounts && leftNavCounts?.unbilledContract !== undefined && leftNavCounts?.unbilledContract !== 0) ? leftNavCounts?.unbilledContract : ''}</span>
                </Link>
            </li>)
        }
        else if (e.name === "Contract History") {
            return( <li>
                <Link activeclassName="active" className="list-group-item list-group-item-action" to={e.to} spy={true} offset={-120} smooth={true} duration={100} >{e.name}
                    <span className="badge badge-primary badge-pill float-right">{(leftNavCounts && leftNavCounts?.contractHistory !== undefined && leftNavCounts?.contractHistory !== 0) ? leftNavCounts?.contractHistory : ''}</span>
                </Link>
            </li>)
        }
        else if (e.name === "Invoice") {
            return(<li>
                <Link activeclassName="active" className="list-group-item list-group-item-action" to={e.to} spy={true} offset={-120} smooth={true} duration={100} >{e.name}
                    <span className="badge badge-primary badge-pill float-right">{(leftNavCounts && leftNavCounts?.invoice !== undefined && leftNavCounts?.invoice !== 0) ? leftNavCounts?.invoice : ''}</span>
                </Link>
            </li>)
        }
        else if (e.name === "Billing Schedule") {
            return(<li>
                <Link activeclassName="active" className="list-group-item list-group-item-action" to={e.to} spy={true} offset={-120} smooth={true} duration={100} >{e.name}
                    <span className="badge badge-primary badge-pill float-right">{(leftNavCounts && leftNavCounts?.billingSchedule !== undefined && leftNavCounts?.billingSchedule !== 0) ? leftNavCounts?.billingSchedule : ''}</span>
                </Link>
            </li>)
        }
        else {
            return (
                <li>
                    <Link activeclassName="active" className="list-group-item list-group-item-action" to={e.to} spy={true} offset={-120} smooth={true} duration={100} >{e.name}</Link>
                </li>
            )
        }
    }
    return (
        <>
            <div className="row">
                <div className="col-10">
                    <div className="page-title-box">
                        <h4 className="page-title">Service Details</h4>
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
            </div>
            <div className="row mt-1">
                <div className="col-lg-12 p-0">
                    <div className="card-box p-0">
                        <div className="row">
                            <div className={isQuickLinkEnabled ? "col-md-10 p-10 pt-2" : "col-md-12 p-10 pt-2"}>
                                <div className="scrollspy-div ac-screen order-sale salev1">
                                    <Element name="salesOrderSection">
                                        <SalesOrderOverview
                                            data={{
                                                soData,
                                                leftNavCounts,
                                                billInputs,
                                                refresh
                                            }}
                                            handler={{
                                                setLeftNavCounts,
                                                setBillInputs,
                                                pageRefresh
                                            }}
                                        />
                                    </Element>
                                    <Element name="workOrderSection">
                                        <div className="row pt-1">
                                            <section className="triangle col-12">
                                                <div className="row col-12">
                                                    <div className="col-12">
                                                        <h4 id="list-item-5" className="pl-1">Work Order</h4>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                        <div className="col-md-12 m-0 p-1">
                                            <WorkOrderList
                                                data={{
                                                    customerDetails: soData,
                                                    leftNavCounts: woCounts,
                                                }}
                                                handler={{
                                                    setLeftNavCounts: setWoCounts
                                                }}
                                            />
                                        </div>
                                    </Element>
                                    <div className="mb-0 cont-bill">
                                        <div className=" bg-light border"><h2 className="bill-cont">Billing Contract</h2> </div>
                                    </div>
                                    <Element name="contractSection">
                                        <div className="row">
                                            <section className="triangle col-12">
                                                <div className="row col-12">
                                                    <div className="col-10">
                                                        <h4 id="list-item-1">Contract</h4>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                        {
                                            leftNavCounts?.productDetails !== "" &&
                                            <SearchContract
                                                data={{
                                                    data: billInputs,
                                                    //data: { soId: soData?.soId },
                                                    hideForm: true,
                                                    contractType: "billed",
                                                    refresh: refresh,
                                                    from: "s360",
                                                    leftNavCounts
                                                }}
                                                handler={{
                                                    pageRefresh: pageRefresh,
                                                    setLeftNavCounts
                                                }}
                                            />
                                        }
                                    </Element>
                                    <Element name="unbilledContractSection">
                                        <div className="row pt-1">
                                            <section className="triangle col-12">
                                                <div className="row col-12">
                                                    <div className="col-12">
                                                        <h4 id="list-item-2" className="pl-1">Unbilled Contract</h4>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                        {
                                            leftNavCounts?.contract !== "" &&
                                            <SearchContract
                                                data={{
                                                    data: billInputs,
                                                    //data: { soId: soData?.soId },
                                                    hideForm: true,
                                                    contractType: "unbilled",
                                                    refresh: refresh,
                                                    from: "s360",
                                                    leftNavCounts
                                                }}
                                                handler={{
                                                    pageRefresh: pageRefresh,
                                                    setLeftNavCounts
                                                }}
                                            />
                                        }
                                    </Element>
                                    <Element name="contractHistorySection">
                                        <div className="row pt-1">
                                            <section className="triangle col-12">
                                                <div className="row col-12">
                                                    <div className="col-12">
                                                        <h4 id="list-item-3" className="pl-1">Contract History</h4>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                        {
                                            leftNavCounts?.unbilledContract !== "" &&
                                            <SearchContract
                                                data={{
                                                    data: billInputs,
                                                    //data: { soId: soData?.soId },
                                                    hideForm: true,
                                                    contractType: "history",
                                                    refresh: refresh,
                                                    from: "s360",
                                                    leftNavCounts
                                                }}
                                                handler={{
                                                    pageRefresh: pageRefresh,
                                                    setLeftNavCounts
                                                }}
                                            />
                                        }
                                    </Element>
                                    <Element name="invoiceSection">
                                        <div className="row pt-1">
                                            <section className="triangle col-12">
                                                <div className="row col-12">
                                                    <div className="col-12">
                                                        <h4 id="list-item-4" className="pl-1">Invoice</h4>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                        {
                                            leftNavCounts?.contractHistory !== "" &&
                                            <SearchInvoice
                                                data={{
                                                    data: billInputs,
                                                    //data: { soId: soData?.soId },
                                                    hideForm: true,
                                                    refresh: refresh,
                                                    from: "s360",
                                                    leftNavCounts
                                                }}
                                                handler={{
                                                    setLeftNavCounts
                                                }}
                                            />
                                        }

                                    </Element>
                                    <Element name="billingScheduleSection">
                                        <div className="row pt-1">
                                            <section className="triangle col-12">
                                                <div className="row col-12">
                                                    <div className="col-12">
                                                        <h4 id="list-item-5" className="pl-1">Billing Schedule</h4>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                        {
                                            leftNavCounts?.invoice !== "" &&
                                            <BillingSchedule
                                                data={{
                                                    soData,
                                                    leftNavCounts,
                                                    refresh,
                                                    billInputs
                                                }}
                                                handler={{
                                                    setLeftNavCounts
                                                }}
                                            />
                                        }
                                    </Element>
                                </div>
                            </div>
                           {isQuickLinkEnabled && <div className="col-2 pt-2 sticky" style={{ background: "#FFF" }}>
                                <ul id="scroll-list" className="list-group">
                                    {quickLinks && quickLinks.map((e) => (
                                        handleQuickLinks(e)
                                    ))}
                                    {/* <li>
                                        <Link activeclassName="active" className="list-group-item list-group-item-action" to="salesOrderSection" spy={true} offset={-120} smooth={true} duration={100} >Sales Order</Link>
                                    </li>
                                    <li>
                                        <Link activeclassName="active" className="list-group-item list-group-item-action" to="productDetailsSection" spy={true} offset={-160} smooth={true} duration={100} >Product Details
                                            <span className="badge badge-primary badge-pill float-right">{(leftNavCounts && leftNavCounts?.productDetails !== undefined && leftNavCounts?.productDetails !== 0) ? leftNavCounts?.productDetails : ''}</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link activeclassName="active" className="list-group-item list-group-item-action" to="workOrderSection" spy={true} offset={-120} smooth={true} duration={100} >Work Order
                                            <span className="badge badge-primary badge-pill float-right">{(woCounts && woCounts?.srCount !== undefined && woCounts?.srCount !== 0) ? woCounts?.srCount : ''}</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link activeclassName="active" className="list-group-item list-group-item-action" to="contractSection" spy={true} offset={-120} smooth={true} duration={100} >Contract
                                            <span className="badge badge-primary badge-pill float-right">{(leftNavCounts && leftNavCounts?.contract !== undefined && leftNavCounts?.contract !== 0) ? leftNavCounts?.contract : ''}</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link activeclassName="active" className="list-group-item list-group-item-action" to="unbilledContractSection" spy={true} offset={-120} smooth={true} duration={100} >Unbilled Contract
                                            <span className="badge badge-primary badge-pill float-right">{(leftNavCounts && leftNavCounts?.unbilledContract !== undefined && leftNavCounts?.unbilledContract !== 0) ? leftNavCounts?.unbilledContract : ''}</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link activeclassName="active" className="list-group-item list-group-item-action" to="contractHistorySection" spy={true} offset={-120} smooth={true} duration={100} >Contract History
                                            <span className="badge badge-primary badge-pill float-right">{(leftNavCounts && leftNavCounts?.contractHistory !== undefined && leftNavCounts?.contractHistory !== 0) ? leftNavCounts?.contractHistory : ''}</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link activeclassName="active" className="list-group-item list-group-item-action" to="invoiceSection" spy={true} offset={-120} smooth={true} duration={100} >Invoice
                                            <span className="badge badge-primary badge-pill float-right">{(leftNavCounts && leftNavCounts?.invoice !== undefined && leftNavCounts?.invoice !== 0) ? leftNavCounts?.invoice : ''}</span>
                                        </Link>
                                    </li>
                                    <li>
                                        <Link activeclassName="active" className="list-group-item list-group-item-action" to="billingScheduleSection" spy={true} offset={-120} smooth={true} duration={100} >Billing Schedule
                                            <span className="badge badge-primary badge-pill float-right">{(leftNavCounts && leftNavCounts?.billingSchedule !== undefined && leftNavCounts?.billingSchedule !== 0) ? leftNavCounts?.billingSchedule : ''}</span>
                                        </Link>
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

export default SalesOrder360;

