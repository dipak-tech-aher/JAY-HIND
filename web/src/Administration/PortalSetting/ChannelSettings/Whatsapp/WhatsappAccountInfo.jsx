import React, { useState } from "react";
import Select from 'react-select';

const WhatsappAccountInfo = (props) => {

    const { channel, organization, userDeparmentMapping, whatsappSettings, whatsappSettingError, Mode } = props?.data
    const { handleOnChange, setWhatsappSettings } = props.handle

    const handleChange = (selectedOptions) => {
        let userList = [...selectedOptions]
        setWhatsappSettings({
            ...whatsappSettings,
            deptUser: userList
        })
    }

    return (
        <>
            <div className="tab-pane" id="account-2">
                <div className="row">
                    <div className="col-12">
                        <form>
                            <div className="form-group row">
                                <label htmlFor="supportGroup" className="col-md-5 col-form-label text-md-left">Support Group Name<span className="text-danger"> *</span></label>
                                <div className="col-md-5">
                                    <input type="text" id="supportGroup" disabled={Mode === "VIEW" ? true : ""} className={`form-control ${whatsappSettingError.supportGroup && "error-border"}`} name="supportGroup" value={whatsappSettings?.supportGroup} onChange={handleOnChange} />
                                    <span className="errormsg">{whatsappSettingError.supportGroup ? whatsappSettingError.supportGroup : ""}</span>
                                </div>
                            </div><br>
                            </br>
                        </form>
                        <form>
                            <div className="form-group row">
                                <label htmlFor="channel" className="col-md-5 col-form-label text-md-left">Channel Category<span className="text-danger"> *</span></label>
                                <div className="col-md-5">
                                    <select name="channel" disabled={Mode === "VIEW" ? true : ""} className={`form-control ${whatsappSettingError.channel && "error-border"}`} id="channel" value={whatsappSettings.channel} onChange={handleOnChange}>
                                        <option value="">Select Channel</option>
                                        {channel && channel.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))}
                                    </select>
                                    <span className="errormsg">{whatsappSettingError.channel ? whatsappSettingError.channel : ""}</span>
                                </div>
                            </div><br>
                            </br>
                        </form>
                        <form action="" method="">
                            <div className="form-group row">
                                <label htmlFor="orgUnit" className="col-md-5 col-form-label text-md-left">Select Org/Unit<span className="text-danger"> *</span></label>
                                <div className="col-md-5">
                                    <select name="organization" disabled={Mode === "VIEW" ? true : ""} className={`form-control ${whatsappSettingError.organization && "error-border"}`} id="organization" value={whatsappSettings.organization} onChange={handleOnChange}>
                                        <option value="">Select Organization</option>
                                        {organization && organization.map((e) => (
                                            <option key={e.unitId} value={e.unitId}>{e.unitDesc}</option>
                                        ))}
                                    </select>
                                    <span className="errormsg">{whatsappSettingError.organization ? whatsappSettingError.organization : ""}</span>
                                </div>
                            </div><br>
                            </br>
                        </form>
                        <form>
                            <div className="form-group row" >
                                <label htmlFor="orgUnit" className="col-md-5 col-form-label text-md-left">Select Department and Users Mapping</label>
                                <div className="col-md-5">
                                    {userDeparmentMapping && whatsappSettings.deptUser && <Select disabled={Mode === "VIEW" ? true : ""}
                                        closeMenuOnSelect={false}
                                        defaultValue={whatsappSettings.deptUser ? whatsappSettings.deptUser : ""}
                                        options={userDeparmentMapping}
                                        getOptionLabel={options => `${options.label}`}
                                        onChange={handleChange}
                                        isDisabled={Mode === "VIEW" ? true : false}
                                        isMulti
                                        isClearable
                                        name="User"
                                        menuPortalTarget={document.Modal}

                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        
                                    />}
                                </div>
                            </div>
                        </form>
                        <br></br>
                        <form action="" method="">
                            <div className="form-group row">
                                <label htmlFor="accountNumber" className="col-md-5 col-form-label text-md-left">Whatsapp Support Account Number<span className="text-danger"> *</span></label>
                                <div className="col-md-5">
                                    <input type="text" max="10" disabled={Mode === "VIEW" ? true : ""} className={`form-control ${whatsappSettingError.accountNumber && "error-border"}`} id="accountNumber" name="accountNumber" value={whatsappSettings.accountNumber} onChange={handleOnChange} />
                                    <span className="errormsg">{whatsappSettingError.accountNumber ? whatsappSettingError.accountNumber : ""}</span>
                                </div>
                            </div><br>
                            </br>
                        </form>
                        <form action="" method="">
                            <div className="form-group row">
                                <label htmlFor="title" className="col-md-5 col-form-label text-md-left">Title<span className="text-danger"> *</span></label>
                                <div className="col-md-5">
                                    <input type="text" disabled={Mode === "VIEW" ? true : ""} className={`form-control ${whatsappSettingError.title && "error-border"}`} id="title" name="title" value={whatsappSettings.title} onChange={handleOnChange} />
                                    <span className="errormsg">{whatsappSettingError.title ? whatsappSettingError.title : ""}</span>
                                </div>
                            </div><br>
                            </br>
                        </form>
                        <form action="" method="">
                            <div className="form-group row">
                                <label htmlFor="predefinedText" className="col-md-5 col-form-label text-md-left">Predefined Text<span className="text-danger"> *</span></label>
                                <div className="col-md-5">
                                    <input type="text" disabled={Mode === "VIEW" ? true : ""} className={`form-control ${whatsappSettingError.predefinedText && "error-border"}`} id="predefinedText" name="predefinedText" value={whatsappSettings.predefinedText} onChange={handleOnChange} />
                                    <span className="errormsg">{whatsappSettingError.predefinedText ? whatsappSettingError.predefinedText : ""}</span>
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

export default WhatsappAccountInfo;