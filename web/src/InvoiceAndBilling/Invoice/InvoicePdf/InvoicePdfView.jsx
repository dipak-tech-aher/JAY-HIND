import React, { useContext}  from 'react'
import logoLight from '../../../assets/images/logo-light.png';
import paperLess from '../../../assets/images/paperless.png';
import moment from 'moment';
import { USNumberFormat } from '../../../common/util/util';
import { AppContext } from "../../../AppContext";

const InvoicePdfView = React.forwardRef((props, ref) => {

    const invoiceData = props?.invoiceData;
    let {  appConfig } = useContext(AppContext);

    return (
        <div className='d-none'>
            <div ref={ref}>
                <div className="container p-5">
                    <div className=''>
                        <div className="d-flex justify-content-between align-items-center">
                            <img src={appConfig?.appLogo} alt="" height="64" />
                            <h3>Invoice</h3>
                        </div>
                        <br />
                        <div className="row mt-3">
                            <div className="col-6">
                                <h4>Billing Address</h4>
                                <address>
                                    <b>{invoiceData.address?.firstName} {invoiceData.address?.lastName}</b><br />
                                    {invoiceData.address?.city}<br />
                                    {invoiceData.address?.state}<br />
                                    {invoiceData.address?.country}<br />
                                    Zip Code : {invoiceData.address?.postCode}<br />
                                    {/* Home : {invoiceData.address?.home}<br />
                                    Mobile : {invoiceData.address?.mobile}<br /> */}
                                    <br />
                                </address>
                            </div>
                            <div className="col-6">
                                <h4>Invoice Details</h4>
                                {
                                    <address>
                                        Bill Ref No : {invoiceData?.invoice?.billRefNo}<br />
                                        Invoice No : {invoiceData?.invoice?.invoiceNo}<br />
                                        {/* SO#: {invoiceData?.invoice?.soNumber}<br /> */}
                                        Invoice Date : {invoiceData?.invoice?.invDate ? moment(invoiceData?.invoice?.invDate).format('DD-MMM-YYYY') : ''}<br />
                                        Invoice Period : {invoiceData?.invoice?.invStartDate ? moment(invoiceData?.invoice?.invStartDate).format('DD-MMM-YYYY') : ''} to {invoiceData?.invoice?.invEndDate ? moment(invoiceData?.invoice?.invEndDate).format('DD-MMM-YYYY') : ''} <br />
                                        <span className="text-danger font-weight-bold">Due Date : {invoiceData?.invoice?.dueDate ? moment(invoiceData?.invoice?.dueDate).format('DD-MMM-YYYY') : ''}</span>
                                    </address>
                                }
                            </div>
                        </div>
                        <br />
                        <br />
                        <div className="row mx-auto">
                            <table className="table border-grey-b2">
                                <thead>
                                    <tr>
                                        <th>Previous Outstanding</th>
                                        <th>Advance Payment</th>
                                        <th>Invoice Amount</th>
                                        <th>Total Outstanding</th>
                                        <th>Due Outstanding</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>{USNumberFormat(invoiceData.dueAmount?.previousOutstanding)}</td>
                                        <td>{USNumberFormat(invoiceData.dueAmount?.advancePayment)}</td>
                                        <td>{USNumberFormat(invoiceData.dueAmount?.invoiceAmount)}</td>
                                        <td>{USNumberFormat(invoiceData.dueAmount?.totalOutstnading)}</td>
                                        <td>{USNumberFormat(invoiceData.dueAmount?.dueOutStanding)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <br />
                        <br />
                        <div className="row">
                            <div className="col-6">
                                <img src={paperLess} alt="paper" />
                            </div>
                            <div className="col-auto ml-auto">
                                <table className="table border-grey-b2">
                                    <thead>
                                        <tr className="tableizer-firstrow">
                                            <th>Summary of Current Charges</th>
                                            <th>USD</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Monthly Rentals</td>
                                            <td>{USNumberFormat(invoiceData.summary?.monthlyRentals)}</td>
                                        </tr>
                                        <tr>
                                            <td>One Time Charge</td>
                                            <td>{USNumberFormat(invoiceData.summary?.oneTimeCharge)}</td>
                                        </tr>
                                        <tr>
                                            <td>Usage Charge</td>
                                            <td>{USNumberFormat(invoiceData.summary?.usageCharge)}</td>
                                        </tr>
                                        <tr>
                                            <td>Debit Adjustment</td>
                                            <td>{USNumberFormat(invoiceData.summary?.debitAdjustment)}</td>
                                        </tr>
                                        <tr>
                                            <td>Credit Adjustment</td>
                                            <td>{USNumberFormat(invoiceData.summary?.creditAdjustment)}</td>
                                        </tr>
                                        <tr>
                                            <td>TOTAL</td>
                                            <td>{USNumberFormat(invoiceData.summary?.total)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <br />
                        <br />
                        <div className="row  break-page">
                            <div className="col-6">
                                <h6 className="text-danger">Notes:</h6>
                                <p>
                                    <small className="text-dark">
                                        All accounts are to be paid within 15 days from receipt of
                                        invoice. To be paid by cheque or credit card or direct payment
                                        online. If account is not paid within due date interest amount charged the
                                        as per terms and conditions.
                                    </small>
                                </p>
                            </div>
                            <div className="col-auto ml-auto">
                                <b>Total :</b>
                                <h3>{USNumberFormat(invoiceData.summary?.finalTotalAmount)}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 card p-5">
                    {
                        invoiceData?.services?.map((service, idx) =>
                        (
                            <>
                                {
                                    idx > 0 && idx % 6 === 0 ?
                                        <><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /></>
                                        :
                                        null
                                }
                                <div className="row px-0 mx-0">
                                    <table className="table border-grey-b2">
                                        <thead>
                                            <tr className="tableizer-firstrow">
                                                <th width="90%">{service.name}</th>
                                                <th>Charges&nbsp;($.)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>{service.frequency} Charges from {service?.invStartDate ? moment(service?.invStartDate).format('DD/MM/YYYY') : ''} - {service?.invEndDate ? moment(service?.invEndDate).format('DD/MM/YYYY') : ''}</td>
                                                <td>{USNumberFormat(service?.monthlyRental)}</td>
                                            </tr>
                                            <tr>
                                                <td>One Time Charge</td>
                                                <td>{USNumberFormat(service?.oneTimeCharge)}</td>
                                            </tr>
                                            <tr>
                                                <td>Usage Amount</td>
                                                <td>{USNumberFormat(service?.usageCharge)}</td>
                                            </tr>
                                            <tr>
                                                <td>Credit Adjustment</td>
                                                <td>{USNumberFormat(service?.creditAdj)}</td>
                                            </tr>
                                            <tr>
                                                <td>Debit Adjustment</td>
                                                <td>{USNumberFormat(service?.debitAdj)}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ))
                    }
                </div>
            </div>
        </div>
    )
})

export default InvoicePdfView;