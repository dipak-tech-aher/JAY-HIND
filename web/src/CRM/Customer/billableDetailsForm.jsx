import React, { useState, useEffect } from 'react'
import { useTranslation } from "react-i18next";
import { validateNumber, handlePaste } from "../../common/util/validateUtil";
const BillableDetailsForm = (props) => {
    const { t } = useTranslation();

    const setData = props?.setData
    const detailsValidate = props?.detailsValidate
    const data = props?.data
    const currencyType = props.currency
    const billGroups = props.billGroups
    const notificationType = props.notificationType
    const registrationType = props.registrationType
    const billLanguages = props.billLanguages
    const error = props.error
    const setError = props.setError


    return (
        <div className="row ">
            <div className="col-12">
                <div className="p-2">
                    <div className="">
                        <div className="form-row">
                            <div className="col-12 pl-2 bg-light border"><h5 className="text-primary">{t("Billing Details")}</h5> </div>
                        </div>
                        <div className="col-12 pr-2 pt-2">
                            <fieldset className="scheduler-border scheduler-box mt-2 bg-white border pb-2 ml-2 mr-2">
                                <form>
                                    <div className="row">
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="flatHouseUnitNo" className="col-form-label">Bill Group<span>*</span></label>
                                                <select id="billGroup" value={data.group} className={`form-control ${(error.group ? "input-error" : "")}`}
                                                    onChange={(e) => {
                                                        setData({ ...data, group: e.target.value , groupDesc: e.target.options[e.target.selectedIndex].label })
                                                        setError({ ...error, group: '' })
                                                    }}
                                                >
                                                    <option value="">Select Bill Group</option>
                                                    {
                                                        billGroups.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                <span className="errormsg">{error.group ? error.group : ""}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="building" className="col-form-label">Currency<span>*</span></label>
                                                <select id="billGroup" value={data.currency} className={`form-control ${(error.currency ? "input-error" : "")}`}
                                                    onChange={(e) => {
                                                        setData({ ...data, currency: e.target.value , currencyDesc: e.target.options[e.target.selectedIndex].label })
                                                        setError({ ...error, currency: '' })
                                                    }}
                                                >
                                                    <option value="">Select Currency</option>
                                                    {
                                                        currencyType.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                <span className="errormsg">{error.currency ? error.currency : ""}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="simpang" className="col-form-label">Account Credit Limit<span>*</span></label>
                                                <input type="text" value={data.accountCredLimit} className={`form-control ${(error.accountCredLimit ? "input-error" : "")}`} id="accountCreditLimit" placeholder="Account Credit Limit"
                                                    maxlength="50"
                                                    onPaste={(e) => handlePaste(e)}
                                                    onKeyPress={(e) => { validateNumber(e) }}
                                                    onChange={(e) => {
                                                        setError({ ...error, accountCredLimit: '' })
                                                        setData({ ...data, accountCredLimit: e.target.value })
                                                    }}
                                                />
                                                <span className="errormsg">{error.accountCredLimit ? error.accountCredLimit : ""}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="cityTown" className="col-form-label">
                                                    Exempt Credit Control<span>*</span></label>
                                                <select type="text" value={data.exemptCredCtrl} className={`form-control ${(error.exemptCredCtrl ? "input-error" : "")}`}
                                                    id="cityTown"
                                                    placeholder="Exempt Credit Control"
                                                    maxlength="30"
                                                    onChange={(e) => {
                                                        setError({ ...error, exemptCredCtrl: '' })
                                                        setData({ ...data, exemptCredCtrl: e.target.value })
                                                    }}

                                                >
                                                <option value="">Select Exempt Credit Control</option>
                                                <option value="Y">Yes</option>
                                                <option value="N">No</option>
                                                </select>
                                                <span className="errormsg">{error.exemptCredCtrl ? error.exemptCredCtrl : ""}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="simpang" className="col-form-label">Bill Language<span>*</span></label>
                                                <select id="billGroup" value={data.language} className={`form-control ${(error.language ? "input-error" : "")}`}
                                                    onChange={(e) => {
                                                        setError({ ...error, language: ''  })
                                                        setData({ ...data, language: e.target.value, languageDesc: e.target.options[e.target.selectedIndex].label })
                                                    }}
                                                >
                                                    <option value="">Select Bill Language</option>
                                                    {
                                                        billLanguages.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                <span className="errormsg">{error.language ? error.language : ""}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="simpang" className="col-form-label">Bill Notifications<span>*</span></label>
                                                <select id="billGroup" value={data.notification} className={`form-control ${(error.notification ? "input-error" : "")}`}
                                                    onChange={(e) => {
                                                        setError({ ...error, notification: ''  })
                                                        setData({ ...data, notification: e.target.value ,notificationDesc: e.target.options[e.target.selectedIndex].label})
                                                    }}
                                                >
                                                    <option value="">Select Bill Notification</option>
                                                    {
                                                        notificationType.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                <span className="errormsg">{error.notification ? error.notification : ""}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="noOfCopies" className="col-form-label">No of Copies<span>*</span></label>
                                                <input type="text" value={data.noOfCopies} className={`form-control ${(error.noOfCopies ? "input-error" : "")}`} id="noOfCopies" placeholder="Number of copies"
                                                    maxlength="99"
                                                    onChange={(e) => {
                                                        setError({ ...error, noOfCopies: '' })
                                                        setData({ ...data, noOfCopies: e.target.value })
                                                    }}
                                                />
                                                <span className="errormsg">{error.noOfCopies ? error.noOfCopies : ""}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="simpang" className="col-form-label">Source of Registration<span>*</span></label>
                                                <select id="registrationSource" value={data.sourceOfReg} className={`form-control ${(error.sourceOfReg ? "input-error" : "")}`}
                                                    onChange={(e) => {
                                                        setError({ ...error, sourceOfReg: '' })
                                                        setData({ ...data, sourceOfReg: e.target.value, sourceOfRegDesc: e.target.options[e.target.selectedIndex].label  })
                                                    }}
                                                >
                                                    <option value="">Select Source of Resgistration</option>
                                                    {
                                                        registrationType.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                <span className="errormsg">{error.sourceOfReg ? error.sourceOfReg : ""}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="simpang" className="col-form-label">Sales Agent<span>*</span></label>
                                                <input type="text" value={data.salesAgent} className={`form-control ${(error.salesAgent ? "input-error" : "")}`} id="salesAgent" placeholder="Sales agent"
                                                    maxlength="80"
                                                    onChange={(e) => {
                                                        setError({ ...error, salesAgent: '' })
                                                        setData({ ...data, salesAgent: e.target.value })
                                                    }}
                                                />
                                                <span className="errormsg">{error.salesAgent ? error.salesAgent : ""}</span>
                                            </div>
                                        </div>

                                    </div>
                                </form>
                            </fieldset>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}
export default BillableDetailsForm;