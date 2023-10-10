import React from 'react'
import accountCreation from "../../assets/images/acct-creation.svg";

const AccountOtherDetailsForm = (props) => {

    const { accountData, error, priorityLookup, accountClassLookup, accountLevelLookup, accountTypeLookup, accountCategoryLookup, accountStatusReasonLookup, billLanguageLookup, notificationLookup, currencyLookup } = props?.data
    const { handleAccountInputChange } = props?.handler

    return (
        <div className="cmmn-skeleton skel-cr-cust-form">
            <div className="form-row">
                <div className="col-md-2 skel-cr-lft-sect-img">
                    <div className="skel-step-process"><span>Account Creation</span></div>
                    <img src={accountCreation} alt="" className="img-fluid" width="250" height="250" />
                </div>
                <div className="col-md-10 skel-cr-rht-sect-form">
                    <hr className="cmmn-hline" />
                    {
                        accountData?.isAccountCreate === 'Y' ?
                            <>
                                <div className="row col-md-12 mt-3 pl-0">
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label htmlFor="accountCategory" className="control-label">Account Category<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <select id="accountCategory" className={`form-control ${(error.accountCategory ? "input-error" : "")}`}
                                                value={accountData.accountCategory}
                                                onChange={handleAccountInputChange}
                                            >
                                                <option value="">Select Account Category</option>
                                                {
                                                    accountCategoryLookup && accountCategoryLookup.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                            <span className="errormsg">{error.accountCategory ? error.accountCategory : ""}</span>
                                        </div>
                                    </div>
                                    {/* <div className="col-6">
                                        <div className="form-group">
                                            <label htmlFor="accountClass" className="control-label">Account Class<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <select id="accountClass" className={`form-control ${(error.accountClass ? "input-error" : "")}`}
                                                value={accountData.accountClass}
                                                onChange={handleAccountInputChange}
                                            >
                                                <option value="">Select Account Class</option>
                                                {
                                                    accountClassLookup && accountClassLookup.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                            <span className="errormsg">{error.accountClass ? error.accountClass : ""}</span>
                                        </div>
                                    </div> */}
                                    {/* <div className="col-6">
                                        <div className="form-group">
                                            <label htmlFor="accountPriority" className="control-label">Account Priority<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <select id="accountPriority" className={`form-control ${(error.accountPriority ? "input-error" : "")}`}
                                                value={accountData.accountPriority}
                                                onChange={handleAccountInputChange}
                                            >
                                                <option value="">Select Priority</option>
                                                {
                                                    priorityLookup && priorityLookup.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                            <span className="errormsg">{error.accountPriority ? error.accountPriority : ""}</span>
                                        </div>
                                    </div> */}
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label htmlFor="accountLevel" className="control-label">Account Level<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <select id="accountLevel" className={`form-control ${(error.accountLevel ? "input-error" : "")}`}
                                                value={accountData.accountLevel}
                                                onChange={handleAccountInputChange}
                                            >
                                                <option value="">Select Account Level</option>
                                                {
                                                    accountLevelLookup && accountLevelLookup.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                            <span className="errormsg">{error.accountLevel ? error.accountLevel : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label htmlFor="billLanguage" className="control-label">Bill Language<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <select id="billLanguage" className={`form-control ${(error.billLanguage ? "input-error" : "")}`}
                                                value={accountData.billLanguage}
                                                onChange={handleAccountInputChange}
                                            >
                                                <option value="">Select Bill Language</option>
                                                {
                                                    billLanguageLookup && billLanguageLookup.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                            <span className="errormsg">{error.billLanguage ? error.billLanguage : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label htmlFor="accountType" className="control-label">Account Type<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <select id="accountType" className={`form-control ${(error.accountType ? "input-error" : "")}`}
                                                value={accountData.accountType}
                                                onChange={handleAccountInputChange}
                                            >
                                                <option value="">Select Account Type</option>
                                                {
                                                    accountTypeLookup && accountTypeLookup.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                            <span className="errormsg">{error.accountType ? error.accountType : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label htmlFor="notificationPreference" className="control-label">Notification Preference<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <select id="notificationPreference" className={`form-control ${(error.notificationPreference ? "input-error" : "")}`}
                                                value={accountData.notificationPreference}
                                                onChange={handleAccountInputChange}
                                            >
                                                <option value="">Select Notification Preference</option>
                                                {
                                                    notificationLookup && notificationLookup.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                            <span className="errormsg">{error.notificationPreference ? error.notificationPreference : ""}</span>
                                        </div>
                                    </div>
                                    {/* <div className="col-6">
                                        <div className="form-group">
                                            <label htmlFor="accountStatusReason" className="control-label">Account Status Reason<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <select id="accountStatusReason" className={`form-control ${(error.accountStatusReason ? "input-error" : "")}`}
                                                value={accountData.accountStatusReason}
                                                onChange={handleAccountInputChange}
                                            >
                                                <option value="">Select Account Status Reason</option>
                                                {
                                                    accountStatusReasonLookup && accountStatusReasonLookup.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                            <span className="errormsg">{error.accountStatusReason ? error.accountStatusReason : ""}</span>
                                        </div>
                                    </div> */}
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label htmlFor="currency" className="control-label">Currency<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <select id="currency" className={`form-control ${(error.currency ? "input-error" : "")}`}
                                                value={accountData.currency}
                                                onChange={handleAccountInputChange}
                                            >
                                                <option value="">Select Currency</option>
                                                {
                                                    currencyLookup && currencyLookup.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                            <span className="errormsg">{error.currency ? error.accountStatusReason : ""}</span>
                                        </div>
                                    </div>
                                    {/* <div className="col-6">
                                        <div className="form-group">
                                            <label htmlFor="creditLimit" className="control-label">Credit Limit<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <input type="text" id="creditLimit" className={`form-control ${(error.creditLimit ? "input-error" : "")}`} value={accountData.creditLimit} placeholder="Forename"
                                                maxLength="40"
                                                onChange={handleAccountInputChange}
                                            />
                                            <span className="errormsg">{error.creditLimit ? error.creditLimit : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label htmlFor="accountBalance" className="control-label">Account Balance<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <input type="text" id="accountBalance" className={`form-control ${(error.accountBalance ? "input-error" : "")}`} value={accountData.accountBalance} placeholder="Forename"
                                                maxLength="40"
                                                onChange={handleAccountInputChange}
                                            />
                                            <span className="errormsg">{error.accountBalance ? error.accountBalance : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label htmlFor="accountOutstanding" className="control-label">Account Outstanding<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <input type="text" id="accountOutstanding" className={`form-control ${(error.accountOutstanding ? "input-error" : "")}`} value={accountData.accountOutstanding} placeholder="Forename"
                                                maxLength="40"
                                                onChange={handleAccountInputChange}
                                            />
                                            <span className="errormsg">{error.accountOutstanding ? error.accountOutstanding : ""}</span>
                                        </div>
                                    </div> */}
                                </div>
                            </>
                            :
                            <>
                            </>
                    }
                </div>
            </div>
        </div>
    )
}

export default AccountOtherDetailsForm;