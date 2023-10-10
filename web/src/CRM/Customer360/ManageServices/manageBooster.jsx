import React, { useState, useRef, useEffect } from 'react'
import { get, post } from "../../common/util/restUtil";
import { properties } from "../../properties";
import { toast } from "react-toastify";

import { formatISODateDDMMMYY } from '../../common/util/dateUtil'
import PurchaseHistoryTable from './purchaseHistoryTable'
import { unstable_batchedUpdates } from 'react-dom';

const ManageBooster = (props) => {
    
    //const CachedPurchaseHistoryTable = React.memo(PurchaseHistoryTable)
    const handleServicePopupClose = props.handler.handleServicePopupClose
    //const [renderState, setRenderState] = useState({ activeBoosters: 'show', purchaseHistory: 'hide', newBoosters: 'hide' })
    const renderState = props.data.renderState
    const setRenderState = props.handler.setRenderState
    const setRefreshPage = props.handler.setRefreshPage
    const [paymentMethodLookup, setPaymentMethodLookup] = useState([])

    const [currentTopUps, setCurrentTopUps] = useState([])

    const [refreshPurchaseHistory, setRefreshPurchaseHistory] = useState(true)

    const newBoosters = useRef([])

    const [selectedBooster, setSelectedBooster] = useState({})
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState({})

    const [purchaseHistoryData, setPurchaseHistoryData] = useState({})

    const [pageSelect, setPageSelect] = useState()
    const [perPage, setPerPage] = useState(10);

    const purchaseRef = useRef(null)

    const selectedAccount = props.data.selectedAccount
    const serviceDetails = props.data.serviceDetails
    const setRefreshServiceList = props.handler.setRefreshServiceList
    const setRenderChange = props.setRenderChange
    useEffect(() => {
        if (serviceDetails && serviceDetails.serviceId !== undefined) {
            
            get(properties.ACTIVE_BOOSTERS_API + '/' + selectedAccount.customerId + '?account-id=' + selectedAccount.accountId + '&service-id=' + serviceDetails.serviceId)
                .then((resp) => {
                    if (resp && resp.data) {
                        let cTopUps = []
                        for (let t of resp.data) {
                            if (serviceDetails.realtime.offers && serviceDetails.realtime.offers.length > 0) {
                                let found = false
                                if (t.prodType === 'Prepaid' || t.prodType === 'Postpaid') {
                                    for (let o of t.offers) {
                                        for (let r of serviceDetails.realtime.offers) {
                                            if (o.offerId === r.offerId && t.txnReference === String(r.productId)) {
                                                t.startDate = r.startDate
                                                t.expiryDate = r.expiryDate
                                                found = true
                                                break
                                            }
                                        }
                                        if (found) {
                                            break
                                        }
                                    }
                                }
                                if (t.prodType === 'Fixed') {
                                    for (let r of serviceDetails.realtime.offers) {
                                        if (t.txnReference === r.UsageType) {
                                            if (r.startDate) {
                                                t.startDate = r.startDate
                                            }
                                            if (r.ExpiryDate) {
                                                t.expiryDate = r.ExpiryDate
                                            }
                                            found = true
                                            break
                                        }
                                    }
                                }
                            }
                            cTopUps.push(t)
                        }
                        setCurrentTopUps(cTopUps)
                    } else {
                        toast.error("Failed to fetch current topup Details - " + resp.status);
                    }
                }).catch((error) => {
                    console.log(error)
                }).finally();
        }
    }, [serviceDetails]);

    useEffect(() => {
            
            post(properties.BUSINESS_ENTITY_API, ['BOOSTER_TOPUP_PAYMNT'])
                .then((resp) => {
                    if (resp.data) {
                        setPaymentMethodLookup(resp.data['BOOSTER_TOPUP_PAYMNT'])
                    }
                }).catch((error) => {
                    console.log(error)
                }).finally();
    },[])

    const handleTopupClick = () => {
        
        get(properties.PLANS_API + '?plantype=BALANCE&prodtype=' + serviceDetails.prodType)
            .then((resp) => {
                if (resp && resp.status === 200 && resp.data) {
                    if (resp.data.length > 0) {
                        newBoosters.current = resp.data
                        setRenderState({ ...renderState, newBoosters: 'show' })
                        purchaseRef.current.scrollIntoView({ top: purchaseRef.current.offsetTop, behavior: 'smooth', block: "start" })
                    } else {
                        toast.error("No topups available at this moment");
                    }
                } else {
                    if (resp && resp.status) {
                        toast.error("Error fetching topups - " + resp.status + ', ' + resp.message);
                    } else {
                        toast.error("Unexpected error fetching topups");
                    }
                }
            }).catch((error) => {
                console.log(error)
            }).finally();
    }

    // useEffect(() => {
    //     setInlineSpinnerData({ state: true, message: 'Loading plans...please wait...' })
    //     if (serviceDetails) {
    //         get(properties.PLAN_UPGRADE_API + '?customer-id=' + selectedAccount.customerId
    //             + '&' + 'account-id=' + selectedAccount.accountId
    //             + '&' + 'service-id=' + serviceDetails.serviceId)
    //             .then((resp) => {
    //                 if (resp && resp.data) {
    //                     setUpgradePlanList(resp.data)
    //                     setActionState({ ...actionState, dataFetch: true })
    //                 } else {
    //                     toast.error("Failed to fetch Plans available for upgrade - " + resp.status);
    //                 }
    //                 setInlineSpinnerData({ state: false, message: '' })
    //             }).finally();
    //     }
    // }, []);

    const handleCancelTopup = () => {
        setSelectedBooster({ planId: null, planType: "" })
        setSelectedPaymentMethod({ paymentMethod: "", paymentMethodDesc: null })
        setRenderState({ ...renderState, newBoosters: 'hide' })
    }

    const handleSubmitTopup = () => {
        if (!selectedBooster || !selectedBooster.planId || selectedBooster.planId === '') {
            toast.error("Please select a booster/topup to proceed");
        } else if (serviceDetails.prodType === 'Prepaid' && (!selectedPaymentMethod.paymentMethod || selectedPaymentMethod.paymentMethod === '')) {
            toast.error("Please select a payment method to proceed");
        } else {
            
            post(properties.CREATE_TOPUP_API, {
                customerId: selectedAccount.customerId,
                accountId: selectedAccount.accountId,
                serviceId: serviceDetails.serviceId,
                topUpPaymentType: selectedPaymentMethod.paymentMethod,
                booster: [{
                    planId: selectedBooster.planId
                }]
            })
                .then((resp) => {
                    if (resp.data) {
                        if (resp.status === 200) {
                            toast.success(resp.message)
                            unstable_batchedUpdates(() => {
                                setSelectedBooster({})
                                setRefreshServiceList(serviceDetails.serviceId)
                                setRenderChange({ ...renderState, booster: 'hide', service: 'show', vas: 'hide', serviceDetails: 'show', planUpgrade: 'hide', planDowngrade: 'hide', changeSIM: 'hide', teleportAndRelocate: 'hide', changeServiceNbr: 'hide', termination: 'hide' })
                                handleServicePopupClose()
                                setRefreshPage((prevState) => (!prevState))
                                //window.location.reload(false)
                            })
                        } else {
                            toast.error("Failed to process topup request - " + resp.status + ' - ' + resp.message);
                        }
                    } else {
                        toast.error("Uexpected error ocurred " + resp.statusCode);
                    }
                }).catch((error) => {
                    console.log(error)
                }).finally(() => {
                    unstable_batchedUpdates(() => {
                        setRefreshPurchaseHistory(true)
                    })
                    
                });
        }
    }

    return (
        <div>

            <ul className="nav nav-tabs">
                <li key="activeBooster" className="nav-item pl-0">
                    <button
                        className={"nav-link " + ((renderState.activeBoosters === 'show') ? "active" : "")}
                        onClick={() => setRenderState({ ...renderState, activeBoosters: 'show', purchaseHistory: 'hide' })}
                    >
                        Active Boosters
                    </button>
                </li>
                <li key="purchaseHistory" className="nav-item">
                    <button
                        className={"nav-link " + ((renderState.purchaseHistory === 'show') ? "active" : "")}
                        onClick={() => {
                            if(renderState.purchaseHistory !== "show")
                            {
                                setRenderState({ ...renderState, activeBoosters: 'hide', purchaseHistory: 'show' })
                            }
                        }
                        }
                    >
                        Purchase History
                    </button>
                </li>
            </ul>

            <div className="tab-content p-2 panelbg border">
                <div className="tab-pane show active">
                    {
                        (renderState.activeBoosters === 'show') ?
                            <>
                                <div className="card border p-2 col-lg-12 mt-2">
                                    <div className="row mb-2">
                                        <div className="col-md-9">
                                            <h5>Active Boosters</h5>
                                        </div>
                                        <div className="col-md-3 text-right mt-auto">
                                            {
                                                (/*serviceDetails.status === 'ACTIVE' && */ !['WONC', 'WONC-ACCSER', 'WONC-SER', 'BAR', 'UNBAR', 'UPGRADE', 'DOWNGRADE', 'TELEPORT', 'RELOCATE','TERMINATE'].includes(serviceDetails.badge))?
                                                    <button className="btn btn-sm btn-primary" type="button" onClick={handleTopupClick}>
                                                        <i className="mr-1 fas fa-shopping-cart "></i>Purchase Boosters/Topups
                                                    </button>
                                                    :
                                                    <button disabled="disabled" className="btn btn-sm btn-primary" type="button">
                                                        <i className="mr-1 fas fa-shopping-cart "></i>Purchase Boosters/Topups
                                                    </button>
                                            }
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-12 row">

                                            {
                                                (currentTopUps && currentTopUps.length > 0) ?
                                                    currentTopUps.map((t) => {
                                                        return (
                                                            <div className="col-md-4 mt-2">
                                                                <div className="card-header">
                                                                    <div className="text-center">
                                                                        <h5 className="p-0 m-0">{t.planName}</h5>
                                                                    </div>
                                                                </div>
                                                                <div className="card-body border bg-white data-box" style={{ minHeight: "255px" }}>
                                                                    <div className="row">
                                                                        <div className="col-md-6">
                                                                            <p>Status</p>
                                                                        </div>
                                                                        <div className="col-md-6">
                                                                            <p>{t.status}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="row">
                                                                        <div className="col-md-6">
                                                                            <p>Start Date</p>
                                                                        </div>
                                                                        <div className="col-md-6">
                                                                            <p>{(t.startDate) ? formatISODateDDMMMYY(t.startDate) : '-'}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="row">
                                                                        <div className="col-md-6">
                                                                            <p>Expiry Date</p>
                                                                        </div>
                                                                        <div className="col-md-6">
                                                                            <p>{(t.expiryDate) ? formatISODateDDMMMYY(t.expiryDate) : '-'}</p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="row">
                                                                        <div className="col-md-6 mt-auto">
                                                                            <p>Charges</p>
                                                                        </div>
                                                                        <div className="col-md-6">
                                                                            <h4 className="text-dark">${(t.charge) ? Number(t.charge).toFixed(2) : ''}</h4>
                                                                        </div>
                                                                        <div className="mt-2 table-responsive booster-box">
                                                                            <table className="table border mb-0">

                                                                                <thead className="bg-light">
                                                                                    <tr>
                                                                                        <th className="text-center">Type</th>
                                                                                        <th className="text-center">Quota</th>
                                                                                        <th className="text-center">Usage</th>
                                                                                        <th className="text-center">Balance</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {
                                                                                        (t.prodType === 'Prepaid' || t.prodType === 'Postpaid') ?
                                                                                            t.offers.map((o) => {
                                                                                                return (
                                                                                                    (serviceDetails.realtime.offers && serviceDetails.realtime.offers.length > 0) ?
                                                                                                        serviceDetails.realtime.offers.map((ro) => {
                                                                                                            return (

                                                                                                                (o.offerId === ro.offerId && t.txnReference === String(ro.productId)) ?
                                                                                                                    <tr>
                                                                                                                        <td className="text-center bold">{o.offerType}</td>
                                                                                                                        <td className="text-center">{o.quota} {o.units}</td>
                                                                                                                        {
                                                                                                                            (ro.value !== undefined && !isNaN(ro.value) && o.quota !== undefined && !isNaN(o.quota)) ?
                                                                                                                                (o.offerType === 'Data') ?
                                                                                                                                    <td className="text-center">{Number(o.quota - ro.value / (1024 * 1024 * 1024)).toFixed(1)} {o.units}</td>
                                                                                                                                    :
                                                                                                                                    <td className="text-center">{o.quota - ro.value} {o.units}</td>
                                                                                                                                :
                                                                                                                                <td>&nbsp;</td>
                                                                                                                        }
                                                                                                                        {
                                                                                                                            (ro.value !== undefined && !isNaN(ro.value)) ?
                                                                                                                                (o.offerType === 'Data') ?
                                                                                                                                    <td className="text-center">{Number(ro.value / (1024 * 1024 * 1024)).toFixed(1)} {o.units}</td>
                                                                                                                                    :
                                                                                                                                    <td className="text-center">{ro.value} {o.units}</td>
                                                                                                                                :
                                                                                                                                <td>&nbsp;</td>
                                                                                                                        }
                                                                                                                    </tr>
                                                                                                                    :
                                                                                                                    <></>
                                                                                                            )
                                                                                                        })
                                                                                                        :
                                                                                                        <tr>
                                                                                                            <td className="text-center bold">{o.offerType}</td>
                                                                                                            <td className="text-center">{o.quota} {o.units}</td>
                                                                                                            <td className="text-center">-</td>
                                                                                                            <td className="text-center">-</td>
                                                                                                        </tr>
                                                                                                )
                                                                                            })

                                                                                            :
                                                                                            <></>
                                                                                    }
                                                                                    {
                                                                                        (t.prodType === 'Fixed') ?
                                                                                            (serviceDetails.realtime.offers && serviceDetails.realtime.offers.length > 0) ?
                                                                                                serviceDetails.realtime.offers.map((ro) => {
                                                                                                    return (

                                                                                                        (t.txnReference && ro.UsageType && t.txnReference === ro.UsageType) ?
                                                                                                            <tr>
                                                                                                                <td className="text-center bold">Data</td>
                                                                                                                {
                                                                                                                    (ro.Limit !== undefined && !isNaN(ro.Limit)) ?
                                                                                                                        <td className="text-center">{Number(ro.Limit / (1024 * 1024 * 1024)).toFixed(1)} GB</td>
                                                                                                                        :
                                                                                                                        <td>&nbsp;</td>
                                                                                                                }
                                                                                                                {
                                                                                                                    (ro.AccumulatedUsage !== undefined && !isNaN(ro.AccumulatedUsage)) ?
                                                                                                                        <td className="text-center">{Number(ro.AccumulatedUsage / (1024 * 1024 * 1024)).toFixed(1)} GB</td>
                                                                                                                        :
                                                                                                                        <td>&nbsp;</td>
                                                                                                                }
                                                                                                                {
                                                                                                                    (ro.Limit !== undefined && !isNaN(ro.Limit) && ro.AccumulatedUsage !== undefined && !isNaN(ro.AccumulatedUsage)) ?
                                                                                                                        <td className="text-center">{Number((ro.Limit - ro.AccumulatedUsage) / (1024 * 1024 * 1024)).toFixed(1)} GB</td>
                                                                                                                        :
                                                                                                                        <td>&nbsp;</td>
                                                                                                                }
                                                                                                            </tr>
                                                                                                            :
                                                                                                            <></>
                                                                                                    )
                                                                                                })
                                                                                                :
                                                                                                <></>
                                                                                            :
                                                                                            <></>
                                                                                    }
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                    :
                                                    <p className="ml-auto mr-auto"><strong>No Boosters added yet.</strong></p>
                                            }

                                        </div>
                                    </div>
                                </div>
                                {
                                    (renderState.newBoosters === 'show') ?
                                        <>
                                            <div className="row pr-1 pb-2" ref={purchaseRef}>
                                                <div className="col-md-12">
                                                    <div className="card border p-2 col-lg-12 mt-2">
                                                        <div className="row align-items-center">
                                                            <div className="col-md-7">
                                                                <div className="text-left">
                                                                    <h5>Add New Boosters/Topups</h5>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="row mt-2">
                                                            {
                                                                (newBoosters && newBoosters.current && newBoosters.current.length > 0) ?
                                                                    newBoosters.current.map((e) => {
                                                                        return (
                                                                            <div className="col-lg-3 mt-2">
                                                                                <div className="card-body border p-0 box-card" style={{ minHeight: "178px" }}>
                                                                                    <div className=" row col-md-12 card-header">
                                                                                        <div className="col-md-8">
                                                                                            <h5>{e.planName}</h5>
                                                                                        </div>
                                                                                        <div className="col-md-4 pt-1">
                                                                                            <div className="radio radio-primary">
                                                                                                <input key={e.planId} type="radio" id={e.planId + ""}
                                                                                                    className="form-check-input" name="optBooster" value={e.planId}
                                                                                                    checked={(Number(e.planId) === Number(selectedBooster.planId))}
                                                                                                    onChange={(p) => setSelectedBooster({ planId: p.target.value, planType: e.planType })} />
                                                                                                <label htmlFor={e.planId + ""}></label>

                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="text-center pt-1">
                                                                                        {
                                                                                            (e.planType === 'BOOSTER') ?
                                                                                                <div className="row">
                                                                                                    <div className="col-md-6">
                                                                                                        <p>Quota</p>
                                                                                                    </div>
                                                                                                    <div className="col-md-6">
                                                                                                        {
                                                                                                            (e.planoffer && e.planoffer.length > 0) ?
                                                                                                                <p>{e.planoffer[0].quota} {e.planoffer[0].units}</p>
                                                                                                                :
                                                                                                                <></>
                                                                                                        }
                                                                                                    </div>
                                                                                                </div>
                                                                                                :
                                                                                                <></>
                                                                                        }
                                                                                        <div className="row">
                                                                                            <div className="col-md-6">
                                                                                                <p>Validity</p>
                                                                                            </div>
                                                                                            <div className="col-md-6">
                                                                                                <p>{e.validity}</p>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div className="row">
                                                                                            <div className="col-md-6 mt-auto">
                                                                                                <p>Charges</p>
                                                                                            </div>
                                                                                            <div className="col-md-6">
                                                                                                <h3 className="text-dark">${e.charge}</h3>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )
                                                                    })
                                                                    :
                                                                    <></>
                                                            }
                                                        </div>
                                                        {
                                                            (serviceDetails.prodType === 'Prepaid') ?
                                                                <>
                                                                    <div className="row align-items-center mt-2">
                                                                        <div className="col-md-7">
                                                                            <div className="text-left">
                                                                                <h5>Payment</h5>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="row">
                                                                        <div className="col-md-3 mt-0 pt-2">
                                                                            <div className="form-group">
                                                                                <label htmlFor="paymentMethod" className="col-form-label">Payment Method<span>*</span></label>
                                                                                <select id="paymentMethod" className="form-control" value={selectedPaymentMethod.paymentMethod}
                                                                                    onChange={e => setSelectedPaymentMethod({ paymentMethod: e.target.value, paymentMethodDesc: e.target.options[e.target.selectedIndex].label })}>
                                                                                    <option key="pmthd" value="">Select Payment Method</option>
                                                                                    {
                                                                                        paymentMethodLookup.map((e) => (
                                                                                            e.mapping.plan_type.includes(selectedBooster.planType) ?
                                                                                                <option key={e.code} value={e.code}>{e.description}</option>
                                                                                                :
                                                                                                <></>
                                                                                        ))
                                                                                    }
                                                                                </select>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                                :
                                                                <></>
                                                        }
                                                        <div className="d-flex justify-content-center mt-2 p-0">
                                                            <button className="btn btn-primary text-center float-right ml-2 mr-2" onClick={handleSubmitTopup}>Purchase Selected</button>
                                                            <button className="btn btn-secondary text-center float-right" onClick={handleCancelTopup}>Cancel</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                        :
                                        <></>
                                }
                            </>
                            :
                            <></>
                    }
                    {
                        (renderState.purchaseHistory === 'show') ?
                            <div className="row mt-2">
                                <div className="col-lg-12">
                                    {
                                        <PurchaseHistoryTable
                                            data={{
                                                refreshPurchaseHistory: refreshPurchaseHistory,
                                                purchaseHistoryState: renderState.purchaseHistory,
                                                selectedAccount: selectedAccount,
                                                serviceDetails: serviceDetails,
                                                purchaseHistoryData: purchaseHistoryData,
                                                pageSelect: pageSelect,
                                                perPage
                                            }}
                                            handler={{
                                                setRefreshPurchaseHistory: setRefreshPurchaseHistory,
                                                setPurchaseHistoryData: setPurchaseHistoryData,
                                                setPageSelect: setPageSelect,
                                                setPerPage
                                            }}
                                        />
                                    }
                                </div>
                            </div>
                            :
                            <></>
                    }
                </div>
            </div >
        </div >
    )
}
export default ManageBooster;