import React, { useState } from "react";
const EmailServerSettings = (props) => {

    const { emailSettings, emailSettingError, Mode, accountType } = props?.data
    const { handleOnChange } = props.handle
    const [showPassword, setShowPassword] = useState(false);

    const handleOnShowPassword = () => {
        setShowPassword(!showPassword);
    }

    return (
        <>
            <div className="tab-pane" id="account-2">
                <div className="row">
                    <div className="col-12">
                        <form>
                            <div className="form-group row">
                                <label htmlFor="emailId" className="col-md-5 col-form-label text-md-left">Log on Email ID <span className="text-danger">*</span></label>
                                <div className="col-md-5">
                                    <input type="text" id="emailId" disabled={Mode === "EMAIL_VIEW" ? true : ""} className={`form-control ${emailSettingError?.emailId && "error-border"}`} name="emailId" value={emailSettings?.emailId} onChange={handleOnChange} />
                                    <span className="errormsg">{emailSettingError?.emailId ? emailSettingError?.emailId : ""}</span>
                                </div>
                            </div><br>
                            </br>
                        </form>
                        <form>
                            <div className="form-group row">
                                <label htmlFor="password" className="col-md-5 col-form-label text-md-left">Password<span className="text-danger"> *</span></label>
                                <div className="col-md-5 input-group input-group-merge">
                                    <input type={showPassword ? 'text' : 'password'} disabled={Mode === "EMAIL_VIEW" ? true : ""} id="password" className={`form-control ${emailSettingError?.password && "error-border"}`} value={emailSettings?.password} onChange={handleOnChange} />
                                    <div className={`input-group-append ${showPassword === false ? "" : "show-password"}`} data-password="false" onClick={handleOnShowPassword}>
                                        <div className="input-group-text cursor-pointer">
                                            <span className="password-eye font-12"></span>
                                        </div>
                                    </div>
                                    <span className="errormsg">{emailSettingError?.password ? emailSettingError?.password : ""}</span>
                                </div>
                            </div>
                            <br>
                            </br>
                        </form>
                        <form>
                            <div className="form-group row">
                                <label htmlFor="AccountType" className="col-md-5 col-form-label text-md-left">Account Type<span className="text-danger"> *</span></label>
                                <div className="col-md-5">
                                    <select name="AccountType" disabled={Mode === "EMAIL_VIEW" ? true : ""} className={`form-control ${emailSettingError?.AccountType && "error-border"}`} id="AccountType" value={emailSettings?.AccountType} onChange={handleOnChange}>
                                        <option value="">Select Channel</option>
                                        {accountType && accountType.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))}
                                    </select>
                                    <span className="errormsg">{emailSettingError?.AccountType ? emailSettingError?.AccountType : ""}</span>
                                </div>
                            </div><br>
                            </br>
                        </form>
                        <form>
                            <div className="form-group row">
                                <label htmlFor="incomeServer" className="col-md-5 col-form-label text-md-left">Incoming Server<span className="text-danger"> *</span></label>
                                <div className="col-md-5">
                                    <input type="text" id="incomeServer" disabled={Mode === "EMAIL_VIEW" ? true : ""} className={`form-control ${emailSettingError?.incomeServer && "error-border"}`} name="incomeServer" value={emailSettings?.incomeServer} onChange={handleOnChange} />
                                    <span className="errormsg">{emailSettingError?.incomeServer ? emailSettingError?.incomeServer : ""}</span>
                                </div>
                            </div><br>
                            </br>
                        </form>
                        <form>
                            <div className="form-group row">
                                <label htmlFor="outgoingServer" className="col-md-5 col-form-label text-md-left">Outgoing Mail Server<span className="text-danger"> *</span></label>
                                <div className="col-md-5">
                                    <input type="text" id="outgoingServer" disabled={Mode === "EMAIL_VIEW" ? true : ""} className={`form-control ${emailSettingError?.outgoingServer && "error-border"}`} name="outgoingServer" value={emailSettings?.outgoingServer} onChange={handleOnChange} />
                                    <span className="errormsg">{emailSettingError?.outgoingServer ? emailSettingError?.outgoingServer : ""}</span>
                                </div>
                            </div><br>
                            </br>
                        </form>
                        <form>
                            <div className="form-group row">
                                <label htmlFor="Status" className="col-md-5 col-form-label text-md-left">Status</label>
                                <div className="col-md-5">
                                <select id="Status" name="Status" className="form-control" value={emailSettings.Status} disabled={Mode === "EMAIL_VIEW" ? true : ""} onChange={handleOnChange}>
                                    <option value="">Select Status</option>
                                    <option value="Active">Active</option>
                                    <option value="InActive">Inactive</option>
                                </select>
                                </div>
                            </div><br>
                            </br>
                        </form>
                        <form>
                            <div className="form-group row">
                                <label htmlFor="requiredLogin" className="col-md-5 col-form-label text-md-left"></label>
                                <div className="col-md-5 text-center">
                                    <label className="container2 mb-0">
                                        <input type="checkbox" name = "requiredLogin" id ="requiredLogin" checked={emailSettings?.requiredLogin === "Y" ? true : false} disabled={Mode === "EMAIL_VIEW" ? true : ""} onChange={handleOnChange} />
                                        <span className="checkmark"></span>
                                    </label><span>Require logon secure password authentication</span>
                                </div>
                            </div><br>
                            </br>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )

}

export default EmailServerSettings;