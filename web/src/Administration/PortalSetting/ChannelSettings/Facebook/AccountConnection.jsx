import React, { useState } from "react";

const AccountConnection = (props) => {
    const { facebookSettingError, facebookSettings } = props?.data
    const { handleOnChange, handleOnDisConnect, handleOnConnect } = props?.handle

    const [showPassword, setShowPassword] = useState(false);

    const handleOnShowPassword = () => {
        setShowPassword(!showPassword);
    }

    return (
        <>
            <div className="tab-pane" id="account-2">
                <div className="row">
                    <div className="col-12">
                        <div className="form-group row">
                            <label htmlFor="facebookUserName" className="col-md-3 col-form-label text-md-left">Facebook User ID</label>
                            <div className="col-md-5">
                                <input type="text" id="facebookUserName" autoComplete="new-password" className={`form-control ${facebookSettingError?.facebookUserName && "error-border"}`} name="facebookUserName" value={facebookSettings?.facebookUserName} onChange={handleOnChange} />
                                <span className="errormsg">{facebookSettingError?.facebookUserName ? facebookSettingError?.facebookUserName : ""}</span>
                            </div>
                        </div><br>
                        </br>
                        <div className="form-group row">
                            <label htmlFor="password" className="col-md-3 col-form-label text-md-left">Password<span className="text-danger"> *</span> </label>
                            <div className="col-md-5 input-group input-group-merge">
                                <input type={showPassword ? 'text' : 'password'} id="password" autoComplete="new-password" className={`form-control ${facebookSettingError?.password && "error-border"}`} value={facebookSettings?.password} onChange={handleOnChange} />
                                <div className={`input-group-append ${showPassword === false ? "" : "show-password"}`} data-password="false" onClick={handleOnShowPassword}>
                                    <div className="input-group-text cursor-pointer">
                                        <span className="password-eye font-12"></span>
                                    </div>
                                </div>
                                <span className="errormsg">{facebookSettingError?.password ? facebookSettingError?.password : ""}</span>
                            </div>
                        </div>
                        <br>
                        </br>
                        <div className="text-center">
                            <button type="submit" className="btn btn-primary mx-1" id="finish" onClick={(e) => { handleOnConnect(e) }}>Connect</button> 
                            <button  type="submit" className="btn btn-primary mx-1" id="finish" onClick={(e) => { handleOnDisConnect(e) }}>DisConnect</button>
                        </div>
                        <br></br>
                    </div>
                </div>
            </div>
        </>
    )
}

export default AccountConnection