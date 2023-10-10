import Select from 'react-select';

const ChannelConfiguration = (props) => {
    const { userDeparmentMapping, facebookSettings, facebookSettingError } = props.data
    const { handleOnChange, setFacebookSettings } = props.handle

    const handleChange = (selectedOptions) => {
        let userList = [...selectedOptions]
        setFacebookSettings({
            ...facebookSettings,
            userDepartment: userList
        })
    }

    return (
        <>
            <div className="tab-pane" id="finish-2">
                <div className=" bg-light border m-2 pr-2"><h5 className="text-primary pl-2">Channel Settings</h5></div>
                <div className="row mb-3">
                    <div className="col-md-3">
                        <div className="form-group">
                            <label htmlFor="facebookPageName" className="control-label">Facebook Page Name</label>
                            <input type="text" id="facebookPageName" className={`form-control ${facebookSettingError?.facebookPageName && "error-border"}`} name="facebookPageName"
                                value={facebookSettings?.facebookPageName} onChange={handleOnChange} />
                            <span className="errormsg">{facebookSettingError?.facebookPageName ? facebookSettingError?.facebookPageName : ""}</span>
                        </div>
                    </div>
                </div>
                <div className="row mb-3">
                    <div className="col-md-12">
                        <div className="form-group">
                            <label htmlFor="userDepartment" className="control-label">Default Notification Recipients</label>
                            <p>Select staff users will receive email notification on all conversations that have not been assigned.</p>
                            <div className="row col-12">
                                <div className="col-4">
                                    {userDeparmentMapping && facebookSettings.userDepartment &&
                                        <Select
                                            closeMenuOnSelect={false}
                                            defaultValue={facebookSettings.userDepartment ? facebookSettings.userDepartment : ""}
                                            options={userDeparmentMapping}
                                            getOptionLabel={options => `${options.label}`}
                                            onChange={handleChange}
                                            isMulti
                                            isClearable
                                            name="User"
                                            menuPortalTarget={document.Modal}

                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                            

                                        />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className=" bg-light border m-2 pr-2"><h5 className="text-primary pl-2">Import Settings</h5></div>
                <div className="row mx-3" name="import">
                    <div className="col-md-12">
                        <label className="radio-btn mx-2">Smart -only import comments that are questions or mention this instagram account
                            <input type="radio" id="importSmart" onChange={handleOnChange} className='checkmark' checked={facebookSettings.importSmart === "Y" ? true : false} name="importSmart" />
                        </label>
                    </div>
                    <div className="col-md-12">
                        <label className="radio-btn mx-2">All - import all comments.
                            <input type="radio" id="importAll" onChange={handleOnChange} className='checkmark' checked={facebookSettings.importAll === "Y" ? true : false} name="importAll" />
                        </label>
                    </div>
                </div>
                <div className=" bg-light border m-2 pr-2 mb-3"> <h5 className="text-primary pl-2"> Notification Mode</h5>
                </div>
                <div className="row mx-3" name="notification">
                    <div className="col-md-12" >
                        <label className="radio-btn mx-2">Smart - only notify htmlFor imported comments that are questions or mention this instagram account.
                            <input type="radio" className='checkmark' onChange={handleOnChange} id="notificationSmart" checked={facebookSettings.notificationSmart === "Y" ? true : false} name="notificationSmart" />
                        </label>
                    </div>
                    <div className="col-md-12">
                        <label className="radio-btn mx-2">All - Notify on all imported comments.
                            <input type="radio" className='checkmark' onChange={handleOnChange} id="notificationAll" checked={facebookSettings.notificationAll === "Y" ? true : false} name="notificationAll" />
                        </label>
                    </div>
                    <div className="col-md-12">
                        <label className="radio-btn mx-2">Off - No notifications
                            <input type="radio" className='checkmark' onChange={handleOnChange} id="notificationOff" checked={facebookSettings.notificationOff === "Y" ? true : false} name="notificationOff" />

                        </label>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ChannelConfiguration