import React from 'react';
import Select from 'react-select';

const SelectLiveChatId = (props) => {

    const { livechatSettingsError, livechatSettings, userDeparmentMapping, setLiveChatSettings } = props.data
    const { handleOnChange } = props.handle

    const handleChange = (selectedOptions) => {
        let userList = [...selectedOptions]
        setLiveChatSettings({
            ...livechatSettings,
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
                                <label htmlFor="LiveChatId" className="col-md-5 col-form-label text-md-left">Channel Category</label>
                                <div className="col-md-5">
                                    <select name="LiveChatId" className={`form-control ${livechatSettingsError.LiveChatId && "error-border"}`} id="LiveChatId" value={livechatSettings.LiveChatId} onChange={handleOnChange}>
                                        <option value="">Select Channel</option>
                                        {livechatSettings && livechatSettings?.livechat.map((e) => (
                                            <option key={e.newliveChatId} value={e.newliveChatId}>{e.newliveChatId}</option>
                                        ))}
                                    </select>
                                    <span className="errormsg">{livechatSettingsError.LiveChatId ? livechatSettingsError.LiveChatId : ""}</span>
                                </div>
                            </div>
                        </form>
                        <br />
                        <form>
                            <div className="form-group row" >
                                <label htmlFor="orgUnit" className="col-md-5 col-form-label text-md-left">Select Department and Users Mapping</label>
                                <div className="col-md-5">
                                    {userDeparmentMapping && livechatSettings.userDepartment && <Select
                                        closeMenuOnSelect={false}
                                        defaultValue={livechatSettings.userDepartment.length > 0 ? livechatSettings.userDepartment : ""}
                                        options={userDeparmentMapping}
                                        getOptionLabel={options => `${options.label}`}
                                        onChange={handleChange}
                                        isMulti
                                        isClearable
                                        name="User"

                                        menuPortalTarget={document.body} 
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        

                                    />}
                                </div>
                            </div>
                        </form>
                        <br />
                        <form>
                            <div className="form-group row">
                                <label htmlFor="title" className="col-md-5 col-form-label text-md-left">Title</label>
                                <div className="col-md-5">
                                    <input type="text" id="title" className={`form-control ${livechatSettingsError?.title && "error-border"}`} name="title" onChange={handleOnChange} defaultValue={livechatSettings?.title} />
                                    <span className="errormsg">{livechatSettingsError?.title ? livechatSettingsError.title : ""}</span>
                                </div>
                            </div>
                        </form>
                        <br />
                        <form>
                            <div className="form-group row">
                                <label htmlFor="predefineText" className="col-md-5 col-form-label text-md-left">Predefined Text</label>
                                <div className="col-md-5">
                                    <input type="text" id="predefineText" className={`form-control ${livechatSettingsError?.predefineText && "error-border"}`} name="predefineText" onChange={handleOnChange} defaultValue={livechatSettings?.predefineText} />
                                    <span className="errormsg">{livechatSettingsError?.predefineText ? livechatSettingsError?.predefineText : ""}</span>
                                </div>
                            </div>
                        </form>
                        <br />
                    </div>
                </div>
            </div>
        </>
    )
}
export default SelectLiveChatId