import Select from 'react-select';
import React, { useState } from "react";

const EmailAccountInfo = (props) => {
    const { channel, userDeparmentMapping, emailSettings, emailSettingError, Mode } = props?.data
    const { handleOnChange, setEmailSettings } = props.handle


    const handleChange = (selectedOptions) => {
        let userList = [...selectedOptions]
        setEmailSettings({
            ...emailSettings,
            userDepartment: userList
        })
    }

    return (
        <>
            <div className="tab-pane" id="account-2">
                <div className="row">
                    <div className="col-12">
                        <form>
                            <div className="form-group row">
                                <label htmlFor="emailGroupName" className="col-md-5 col-form-label text-md-left">Email Group Name<span className="text-danger"> *</span></label>
                                <div className="col-md-5">
                                    <input type="text" id="emailGroupName" disabled={Mode === "EMAIL_VIEW" ? true : ""} className={`form-control ${emailSettingError.emailGroupName && "error-border"}`} name="emailGroupName" value={emailSettings?.emailGroupName} onChange={handleOnChange} />
                                    <span className="errormsg">{emailSettingError.emailGroupName ? emailSettingError.emailGroupName : ""}</span>
                                </div>
                            </div><br>
                            </br>
                        </form>
                        <form>
                            <div className="form-group row">
                                <label htmlFor="emailDescription" className="col-md-5 col-form-label text-md-left">Description<span className="text-danger"> *</span></label>
                                <div className="col-md-5">
                                    <input type="text" id="emailDescription" disabled={Mode === "EMAIL_VIEW" ? true : ""} className={`form-control ${emailSettingError?.emailDescription && "error-border"}`} name="emailDescription" value={emailSettings?.emailDescription} onChange={handleOnChange} />
                                    <span className="errormsg">{emailSettingError?.emailDescription ? emailSettingError?.emailDescription : ""}</span>
                                </div>
                            </div><br>
                            </br>
                        </form>
                        <form>
                            <div className="form-group row">
                                <label htmlFor="channelCategory" className="col-md-5 col-form-label text-md-left">Channel Category<span className="text-danger"> *</span></label>
                                <div className="col-md-5">
                                    <select name="channelCategory" disabled={Mode === "EMAIL_VIEW" ? true : ""} className={`form-control ${emailSettingError?.channelCategory && "error-border"}`} id="channelCategory" value={emailSettings?.channelCategory} onChange={handleOnChange}>
                                        <option value="">Select Channel</option>
                                        {channel && channel?.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))}
                                    </select>
                                    <span className="errormsg">{emailSettingError?.channelCategory ? emailSettingError?.channelCategory : ""}</span>
                                </div>
                            </div><br>
                            </br>
                        </form>
                        <form>
                            <div className="form-group row" >
                                <label htmlFor="orgUnit" className="col-md-5 col-form-label text-md-left">Select Department and Users Mapping</label>
                                <div className="col-md-5">
                                    {userDeparmentMapping && <Select
                                        closeMenuOnSelect={false}

                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        
                                        defaultValue={emailSettings?.userDepartment.length>0 ? emailSettings?.userDepartment : ""}
                                        options={userDeparmentMapping}
                                        getOptionLabel={options => `${options.label}`}
                                        onChange={handleChange}
                                        isDisabled={Mode === "EMAIL_VIEW" ? true : false}
                                        isMulti
                                        isClearable
                                        name="User"
                                        menuPortalTarget={document.Modal}

                                    />}
                                </div>
                            </div>
                        </form>
                        <br></br>
                        <form>
                            <div className="form-group row">
                                <label htmlFor="name" className="col-md-5 col-form-label text-md-left">Name<span className="text-danger"> *</span></label>
                                <div className="col-md-5">
                                    <input type="text" id="name" disabled={Mode === "EMAIL_VIEW" ? true : ""} className={`form-control ${emailSettingError?.name && "error-border"}`} name="name" value={emailSettings?.name} onChange={handleOnChange} />
                                    <span className="errormsg">{emailSettingError?.name ? emailSettingError?.name : ""}</span>
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
export default EmailAccountInfo;