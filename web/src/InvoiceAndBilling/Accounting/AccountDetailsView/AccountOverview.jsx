import React, { useEffect, useState } from 'react'
import moment from 'moment'
import TOut from "../../../assets/images/icons/total-outstanding.png";
import AdAmt from "../../../assets/images/icons/total-recurring.png";
import DOut from "../../../assets/images/icons/total-non-recurring.png";
import NofAc from "../../../assets/images/icons/total-usage.png";
import PayNow from './PayNow';

import { get } from '../../../common/util/restUtil';
import { properties } from '../../../properties';
import { USNumberFormat } from '../../../common/util/util';
// import { post } from '../../common/util/restUtil';
// import { properties } from '../../properties';
// 

const AccountOverview = (props) => {

    const { accountData, customerData, refresh, isPrintView = false } = props.data;
    const { setCustomerData, pageRefresh } = props.handler;
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    const [invoiceCounts, setInvoiceCounts] = useState({
        totoalOutstanding: "0",
        dueOutStanding: "0",
        advancePayment: "0",
        noOfActvieServices: "0"
    })

    const handlePayNow = () => {
        setIsPaymentModalOpen(true)
    }

    useEffect(() => {
        
        get(properties.CUSTOMER360_API + '/' + accountData[0]?.customerData.customerId)
            .then((resp) => {
                if (resp && resp.data) {
                    const customerDataDet = {}
                    customerDataDet.customerId = resp?.data?.customerId
                    customerDataDet.billRefNo = (resp?.data?.crmCustomerNo) ? resp?.data?.crmCustomerNo : ''
                    customerDataDet.firstName = resp?.data?.firstName || ""
                    customerDataDet.lastName = resp?.data?.lastName || ""
                    customerDataDet.customerType = resp?.data?.custType || ""
                    customerDataDet.customerTypeDesc = resp?.data?.customerTypeDesc?.description || ""
                    customerDataDet.email = resp?.data?.contact?.email || ""
                    customerDataDet.contactNbr = resp?.data?.contact?.contactNo || ""
                    customerDataDet.registrationDate = resp?.data?.regDate || ""
                    customerDataDet.registrationNbr = resp?.data?.registeredNo || ""
                    customerDataDet.isBillable = resp?.data?.isBillable || ""
                    customerDataDet.status = resp?.data?.status || ""
                    customerDataDet.statusDesc = {}//resp?.data?.status || ""
                    customerDataDet.statusDesc.description = resp?.data?.status || ""
                    customerDataDet.billableDetails = resp?.data?.billableDetails || {}

                    setCustomerData(customerDataDet)

                    if (!customerData?.customerId) {//!customerData?.customerId
                        setCustomerData(accountData[0]?.customerData)
                    }
                }
            }).catch(error => console.log(error)).finally();

        
        get(properties.INVOICE_API + '/ar-bill/' + accountData[0]?.billRefNo)
            .then((response) => {
                if (response.data) {
                    setInvoiceCounts(response.data)
                }
            })
            .catch(error => {
                console.error(error)
            })
            .finally()
    }, [accountData, refresh])

    return (
        <>
            <div className="col-md-12 card-box m-0 ">
                <div className="row p-0 bg-light border">
                    <div className="col-10 pl-2">
                        <h5 className="text-primary">Account Overview</h5>
                    </div>
                    <div className="col-2 usage pl-5 p-1">
                        <div className="paybill">
                            <button type="button" className={`btn btn-primary btn-sm waves-effect waves-light ${isPrintView ? 'd-none' : ''}`}
                                onClick={() => { handlePayNow() }}
                            >
                                Pay Now
                            </button>
                        </div>
                    </div>
                </div>
                <div className="col-12">
                    <div className="row pt-1">
                        <div className="col-3">
                            <div className="form-group">
                                <label htmlFor="billableRefNo" className="col-form-label">Billable Reference Number</label>
                                <p>{accountData[0]?.billRefNo}</p>
                            </div>
                        </div>
                        <div className="col-3">
                            <div className="form-group">
                                <label htmlFor="accountName" className="col-form-label">Customer Number</label>
                                <p>{accountData[0]?.customerNumber}</p>
                            </div>
                        </div>
                        <div className="col-3">
                            <div className="form-group">
                                <label htmlFor="accountName" className="col-form-label">Customer Name</label>
                                <p>{customerData && (customerData?.firstName || "") + " " + (customerData?.lastName || "")}</p>
                            </div>
                        </div>
                        <div className="col-3 pl-3 pt-2 bold">
                            Status<span className="ml-1 badge badge-outline-success font-17">{customerData && customerData?.statusDesc?.description}</span>
                        </div>
                    </div>
                    <div className="row pt-1">
                        <div className="col-3">
                            <div className="form-group">
                                <label htmlFor="createdDate" className="col-form-label">Customer Created Date</label>
                                <p>{customerData && moment(customerData?.createdAt).format('DD MMM YYYY')}</p>
                            </div>
                        </div>
                        <div className="col-3">
                            <div className="form-group">
                                <label htmlFor="customerType" className="col-form-label">Customer Type</label>
                                <p>{customerData && customerData?.customerTypeDesc?.description || customerData?.customerTypeDesc || '-'}</p>
                            </div>
                        </div>
                        <div className="col-3 d-none">
                            <div className="form-group">
                                <label htmlFor="customerCategory" className="col-form-label">Customer Category</label>
                                <p>-</p>
                            </div>
                        </div>
                        <div className="col-3">
                            <div className="form-group">
                                <label htmlFor="accountManager" className="col-form-label">Account Manager</label>
                                <p>{accountData[0]?.customerData?.billableDetails[0]?.salesAgent}</p>
                            </div>
                        </div>
                        <div className="col-3">
                            <div className="form-group">
                                <label htmlFor="billGroup" className="col-form-label">Bill Group</label>
                                <p>{accountData[0]?.customerData?.billableDetails[0]?.billGroupDesc?.description || '-'}</p>
                            </div>
                        </div>
                        <div className="col-3">
                            <div className="form-group">
                                <label htmlFor="currency" className="col-form-label">Currency</label>
                                <p>{accountData[0]?.customerData?.billableDetails[0]?.currencyDesc?.description || '-'}</p>
                            </div>
                        </div>
                        <div className="col-3">
                            <div className="form-group">
                                <label htmlFor="creditLimit" className="col-form-label">Credit Limit</label>
                                <p>{accountData[0]?.customerData?.billableDetails[0]?.accountCredLimit}</p>
                            </div>
                        </div>
                    </div>
                    <div className="row out-stand">
                        <div className="col-3">
                            <article className="ac-sec stat-cards-item border">
                                <div className="stat-cards-icon primary">
                                    <img src={TOut} alt="totalOS" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="inputState" className="col-form-label">Total Outstanding</label>
                                    <p className="outstand">{USNumberFormat(invoiceCounts?.totoalOutstanding)}</p>
                                </div>
                            </article>
                        </div>
                        <div className="col-3">
                            <article className="ac-sec stat-cards-item border">
                                <div className="stat-cards-icon primary">
                                    <img src={DOut} alt="dueOS" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="inputState" className="col-form-label">Due Outstanding</label>
                                    <p>{USNumberFormat(invoiceCounts?.dueOutStanding)}</p>
                                </div>
                            </article>
                        </div>
                        <div className="col-3">
                            <article className="ac-sec stat-cards-item border">
                                <div className="stat-cards-icon primary">
                                    <img src={AdAmt} alt="advanceAmt" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="inputState" className="col-form-label">Advanced Amount</label>
                                    <p className="advance">{USNumberFormat(invoiceCounts?.advancePayment)}</p>
                                </div>
                            </article>
                        </div>
                        <div className="col-3">
                            <article className="ac-sec stat-cards-item border">
                                <div className="stat-cards-icon primary">
                                    <img src={NofAc} alt="noOfActiveService" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="inputState" className="col-form-label">No of Active Services</label>
                                    <p className="">{invoiceCounts?.noOfActvieServices}</p>
                                </div>
                            </article>
                        </div>
                    </div>
                </div>
                {
                    isPaymentModalOpen &&
                    <PayNow
                        data={{
                            isOpen: isPaymentModalOpen,
                            accountData: accountData,
                            invoiceCounts
                        }}
                        handler={{
                            setIsOpen: setIsPaymentModalOpen,
                            pageRefresh: pageRefresh
                        }}
                    />
                }
            </div>
        </>
    )
}

export default AccountOverview