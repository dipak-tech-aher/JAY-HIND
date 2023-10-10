import React, { useState, useEffect, useContext, useRef } from 'react'
import { Link, Element } from 'react-scroll'
import { Link as DomLink } from 'react-router-dom'
import SearchContract from '../../Contract/SearchContract'
import SearchInvoice from '../../Invoice/SearchInvoice'
import AccountOverview from './AccountOverview'
import AdjustmentHistory from './AdjustmentHistory'
import PaymentHistory from './PaymentHistory'
import CreateAdjustmentModal from './CreateAdjustmentModal';
import CreateContract from '../../Contract/CreateContract'
import { unstable_batchedUpdates } from 'react-dom';
import { AppContext } from '../../../AppContext';
import { useReactToPrint } from 'react-to-print';
import PdfARView from './PdfARView'
import { post } from '../../../common/util/restUtil';
import { properties } from '../../../properties';


const AccountBillingDetailsView = (props) => {
    const { auth } = useContext(AppContext)
    const [userPermission, setUserPermission] = useState({ createContract: false, editContract: false, viewContractList: false })
    const accountData = props?.location?.state?.data?.accountData
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false)
    const [customerData, setCustomerData] = useState({})
    const [refresh, setRefresh] = useState(false)
    const [isContractCreateModalOpen, setIsContractCreateModalOpen] = useState({ openModal: false })
    const [leftNavCounts, setLeftNavCounts] = useState({})
	const [selectedContractId, setSelectedContractId] = useState()
    const [quickLinks, setQuickLinks] = useState([{}])
    const [isQuickLinkEnabled, setIsQuickLinkEnabled] = useState(false)

    useEffect(()=>{
        const requestBody = {
            screenName:"Search Account",
            moduleName:"Accounting"
        }
        
        post(properties.MAINMENU_API + '/getQuickLinks',requestBody)
        .then((response)=>{
            setQuickLinks(response.data[0].links.QuickLinks)
        })
        .catch((error)=>{
            console.log("error", error)
        })
        .finally()
    },[])

    const pageRefresh = () => {
        unstable_batchedUpdates(() => {
            setRefresh(!refresh)
        })
    }
    useEffect(() => {
        // if (props.data === undefined) { setIsOpen(false) }
        let rolePermission = []
        
        auth && auth.permissions && auth.permissions.filter(function (e) {
            let property = Object.keys(e)

            if (property[0] === "Contract") {
                let value = Object.values(e)
                rolePermission = { ...rolePermission, billing: Object.values(value[0]) }
            }
        })

        let contractCreate, contractEdit, contractList;

        rolePermission?.billing?.map((screen) => {
            if (screen.screenName === "Create Contract") {
                contractCreate = screen.accessType
            }
            else if (screen.screenName === "Edit Contract") {
                contractEdit = screen.accessType
            }
            else if (screen.screenName === "View Contract List") {
                contractList = screen.accessType
            }

        })
        setUserPermission({ createContract: contractCreate, editContract: contractEdit, viewContractList: contractList })

        
    }, [auth])
    return (
        <>
            <div className="row">
                <div className="col">
                    <div className="page-title-box">
                        <h4 className="page-title">Account Receivable & Billing</h4>
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
                <div className='col-auto mx-auto'>
                    <DomLink className={`btn btn-labeled btn-primary btn-sm mt-1`}
                        to={{
                            pathname: `${process.env.REACT_APP_BASE}/account-receivable/preview-print`,
                            state: {
                                data: {
                                    accountData,
                                    customerData
                                }
                            }
                        }}>
                        <i className="fas fa-print" /><span className="btn-label" />
                        Preview and Print
                    </DomLink>
                </div>
            </div>
            <div className="row mt-1">
                <div className="col-lg-12 p-0">
                    <div className="card-box p-0">
                        <div className="row">
                            <div className={isQuickLinkEnabled ? "col-md-10 p-10 pt-2": "col-md-12 p-10 pt-2"}>
                                <div className="scrollspy-div">
                                    <Element name="accountSection">
                                        <div className="row">
                                            <section className="triangle col-12">
                                                <div className="row col-12">
                                                    <div className="col-12">
                                                        <h4 id="list-item-0" className="pl-1">Billable Reference Number : {accountData[0]?.billRefNo}  -  {accountData[0]?.customerName}</h4>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                        <AccountOverview
                                            data={{
                                                accountData: accountData,
                                                customerData: customerData,
                                                refresh: refresh
                                            }}
                                            handler={{
                                                setCustomerData: setCustomerData,
                                                pageRefresh: pageRefresh
                                            }}
                                        />
                                    </Element>
                                    <Element name="contractSection">
                                        <div className="row pt-1">
                                            <section className="triangle col-12">
                                                <div className="row col-12">
                                                    <div className="col-10">
                                                        <h4 id="list-item-1">Contract</h4>
                                                    </div>
                                                    <div className="col-2 usage pl-4 pt-1">
                                                        <div className="paybill2">

                                                            <button type="button" className={`btn btn-labeled btn-primary btn-sm ${((userPermission.createContract !== 'write') ? "d-none" : "")}`}
                                                                onClick={() => { setIsContractCreateModalOpen({ openModal: true }) }}
                                                            >
                                                                Create Contract
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                        {
                                            isContractCreateModalOpen.openModal === true &&
                                            <CreateContract
                                                data={{
                                                    isOpen: isContractCreateModalOpen,
                                                    customer: customerData,
                                                    refresh: refresh
                                                }}
                                                modalStateHandlers={{
                                                    setIsOpen: setIsContractCreateModalOpen,
                                                    setRefresh: setRefresh,
                                                    setSelectedContractId: setSelectedContractId
                                                }}
                                            />
                                        }
                                        <SearchContract
                                            data={{
                                                data: { billRefNo: accountData[0]?.billRefNo },
                                                hideForm: true,
                                                contractType: "billed",
                                                refresh: refresh,
                                                from: "AccountView",
                                                leftNavCounts
                                            }}
                                            handler={{
                                                pageRefresh: pageRefresh,
                                                setLeftNavCounts
                                            }}
                                        />
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
                                        <SearchContract
                                            data={{
                                                data: { billRefNo: accountData[0]?.billRefNo },
                                                hideForm: true,
                                                contractType: "unbilled",
                                                refresh: refresh,
                                                from: "AccountView",
                                                leftNavCounts
                                            }}
                                            handler={{
                                                pageRefresh: pageRefresh,
                                                setLeftNavCounts
                                            }}
                                        />
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
                                        <SearchContract
                                            data={{
                                                data: { billRefNo: accountData[0]?.billRefNo },
                                                hideForm: true,
                                                contractType: "history",
                                                refresh: refresh,
                                                from: "AccountView",
                                                leftNavCounts
                                            }}
                                            handler={{
                                                pageRefresh: pageRefresh,
                                                setLeftNavCounts
                                            }}
                                        />
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
                                        <SearchInvoice
                                            data={{
                                                data: { billRefNo: accountData[0]?.billRefNo },
                                                hideForm: true,
                                                refresh: refresh,
                                                from: "AccountView",
                                                leftNavCounts
                                            }}
                                            handler={{
                                                setLeftNavCounts
                                            }}
                                        />
                                    </Element>
                                    <Element name="paymentSection">
                                        <div className="row pt-1">
                                            <section className="triangle col-12">
                                                <div className="row col-12">
                                                    <div className="col-12">
                                                        <h4 id="list-item-5" className="pl-1">Payment History</h4>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                        <PaymentHistory
                                            data={{
                                                data: accountData[0]?.billRefNo,
                                                refresh: refresh
                                            }}
                                        />
                                    </Element>
                                    <Element name="adjustmentSection" className="pb-2">
                                        <div className="row pt-1">
                                            <section className="triangle col-12">
                                                <div className="row col-12">
                                                    <div className="col-10">
                                                        <h4 id="list-item-6">Adjusment History</h4>
                                                    </div>
                                                    <div className="col-2 usage pl-4 pt-1">
                                                        <div className="paybill2">
                                                            <button type="button" className="btn btn-primary btn-sm waves-effect waves-light"
                                                                onClick={() => { setIsAdjustmentModalOpen(true) }}
                                                            >
                                                                Create Adjustment
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                        <AdjustmentHistory
                                            data={{
                                                data: accountData,
                                                refresh: refresh
                                            }}
                                        />
                                        {
                                            isAdjustmentModalOpen &&
                                            <CreateAdjustmentModal
                                                data={{
                                                    isOpen: isAdjustmentModalOpen,
                                                    accountData: accountData
                                                }}
                                                handler={{
                                                    setIsOpen: setIsAdjustmentModalOpen,
                                                    pageRefresh: pageRefresh
                                                }}
                                            />
                                        }
                                    </Element>
                                </div>
                            </div>
                           {isQuickLinkEnabled && <div className="col-2 pt-2 sticky" style={{ background: "#FFF" }}>
                                <ul id="scroll-list" className="list-group">
                                {quickLinks && quickLinks.map((e)=>(
                                         <li>
                                         <Link activeclassName="active" key={e.to} className="list-group-item list-group-item-action" to={e.to} spy={true} offset={-120} smooth={true} duration={100} >{e.name}</Link>
                                     </li> 
                                    ))}
                                    {/* <li>
                                        <Link activeclassName="active" className="list-group-item list-group-item-action" to="accountSection" spy={true} offset={-120} smooth={true} duration={100} >Account</Link>
                                    </li>
                                    <li>
                                        <Link activeclassName="active" className="list-group-item list-group-item-action" to="contractSection" spy={true} offset={-120} smooth={true} duration={100} >Contract</Link>
                                    </li>
                                    <li>
                                        <Link activeclassName="active" className="list-group-item list-group-item-action" to="unbilledContractSection" spy={true} offset={-120} smooth={true} duration={100} >Unbilled Contract</Link>
                                    </li>
                                    <li>
                                        <Link activeclassName="active" className="list-group-item list-group-item-action" to="contractHistorySection" spy={true} offset={-120} smooth={true} duration={100} >Contract History</Link>
                                    </li>
                                    <li>
                                        <Link activeclassName="active" className="list-group-item list-group-item-action" to="invoiceSection" spy={true} offset={-120} smooth={true} duration={100} >Invoice</Link>
                                    </li>
                                    <li>
                                        <Link activeclassName="active" className="list-group-item list-group-item-action" to="paymentSection" spy={true} offset={-120} smooth={true} duration={100} >Payment History</Link>
                                    </li>
                                    <li>
                                        <Link activeclassName="active" className="list-group-item list-group-item-action" to="adjustmentSection" spy={true} offset={-120} smooth={true} duration={100} >Adjusment History</Link>
                                    </li> */}
                                    {/* <li>
                                        <Link activeclassName="active" className="test8"  className="list-group-item list-group-item-action" to="installmentSection" spy={true} offset={-120} smooth={true} duration={100} >Installment</Link>
                                    </li>
                                    <li>
                                        <Link activeclassName="active" className="test9"  className="list-group-item list-group-item-action" to="bankruptcySection" spy={true} offset={-120} smooth={true} duration={100} >Bankruptcy</Link>
                                    </li>
                                    <li>
                                        <Link activeclassName="active" className="test10"  className="list-group-item list-group-item-action" to="writeoffSection" spy={true} offset={-120} smooth={true} duration={100} >Write-off</Link>
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

export default AccountBillingDetailsView