import React from 'react'

const BillingDetails = (props) => {

    const billableDetails = props?.data?.billableDetails


    return (
        <div>
            <div className="col-12 pl-2 bg-light border">
                <h5 className="text-primary">Billing Details</h5>
            </div>
            <div className="scheduler-border scheduler-box p-1 bg-white border mt-2">
                <div className="row col-12 pl-1 pt-1 m-0">
                    <div className="col-3">
                        <div className="form-group">
                            <label htmlFor="billgroup" className="col-form-label">Bill Group</label>
                            <p>{billableDetails && billableDetails?.groupDesc || '-'}</p>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="form-group">
                            <label htmlFor="currency" className="col-form-label">Currency</label>
                            <p>{billableDetails && billableDetails?.currencyDesc || '-'}</p>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="form-group">
                            <label htmlFor="accountCreditLimit" className="col-form-label">Account Credit Limit</label>
                            <p>{billableDetails && billableDetails?.accountCredLimit || '-'}</p>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="form-group">
                            <label htmlFor="exemptCreditControl" className="col-form-label">Exempt Credit Control</label>
                            <p>{billableDetails && billableDetails?.exemptCredCtrl === "Y" ? "Yes" : billableDetails?.exemptCredCtrl === "N" ? "No" : '-'}</p>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="form-group">
                            <label htmlFor="billLanguage" className="col-form-label">Bill Language</label>
                            <p>{billableDetails && billableDetails?.languageDesc || '-'}</p>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="form-group">
                            <label htmlFor="billNotification" className="col-form-label">Bill Notification</label>
                            <p>{billableDetails && billableDetails?.notificationDesc || '-'}</p>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="form-group">
                            <label htmlFor="noOfCopies" className="col-form-label">No of Copies</label>
                            <p>{billableDetails && billableDetails?.noOfCopies || '-'}</p>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="form-group">
                            <label htmlFor="sourceOfRegistration" className="col-form-label">Source of Registration</label>
                            <p>{billableDetails && billableDetails?.sourceOfRegDesc || '-'}</p>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="form-group">
                            <label htmlFor="salesAgent" className="col-form-label">Sales Agent</label>
                            <p>{billableDetails && billableDetails?.salesAgent || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default BillingDetails