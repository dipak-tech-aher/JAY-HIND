import React, { useState, useEffect } from 'react'
import { useTranslation } from "react-i18next";

const BillableDetailsFormView = (props) => {
    
    const data = props?.billingData
    return (
        <div className="cust-sect-fullgrid">                            
        <div className="cust-rht-info">
            <div className="cmmn-container-base">
                <div className="container-heading">
                    <span className="container-title"><i className="fe-pocket"></i> Billing Properties</span>                
                </div>
                <div className="container-three-row">
                    <div className="container-label">
                        <span className="label-container-style">Bill Group</span>
                        <span>{data?.grp || 'NA'}</span>
                    </div>
                    <div className="container-label">
                        <span className="label-container-style">Currency</span>
                        <span>{data?.currency|| 'NA'}</span>
                    </div>
                    <div className="container-label">
                        <span className="label-container-style">Account Credit Limit</span>
                        <span>{data?.accountCredLimit|| 'NA'}</span>
                    </div>
                    <div className="container-label">
                        <span className="label-container-style">Exempt Credit Control</span>
                        <span>{data?.exemptCredCtrl|| 'NA'}</span>
                    </div>
                    <div className="container-label">
                        <span className="label-container-style">Bill Language</span>
                        <span>{data?.billLanguage|| 'NA'}</span>
                    </div>
                    <div className="container-label">
                        <span className="label-container-style">Bill Notification</span>
                        <span>{data?.notification|| 'NA'}</span>
                    </div>
                     <div className="container-label">
                        <span className="label-container-style">No. of Copies</span>
                        <span>{data?.noOfCopies|| 'NA'}</span>
                    </div>
                    <div className="container-label">
                        <span className="label-container-style">Source of Registration</span>
                        <span>{data?.sourceOfReg|| 'NA'}</span>
                    </div>
                    <div className="container-label">
                        <span className="label-container-style">Sales Agent</span>
                        <span>{data?.salesAgent|| 'NA'}</span>
                    </div>
                </div>
            </div>
        </div>                            
    </div>
    )

}
export default BillableDetailsFormView;