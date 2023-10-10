const FacebookAPI = (props) => {

    const { facebookSettingError, facebookSettings } = props?.data
    const { handleOnChange, handleOnAPISubmit } = props.handle

    const apiType = [
        { key: "FB_BSIC_DISPLY_API", value: "FB_BSIC_DISPLY_API", Description: "Facebook Basic Display API" },
        { key: "FB_DISPLY_API", value: "FB_DISPLY_API", Description: "Facebook Display API" }
    ];
    
    return (
        <>
            <div className="tab-pane" id="account-2">
                <div className="row">
                    <div className="col-12">
                        <form>
                            <div className="form-group row">
                                <label htmlFor="emailGroupName" className="col-md-5 col-form-label text-md-left">Enable Facebook</label>
                                <div className="col-md-5">
                                    <fieldset className="question">
                                        <input id="enableFacebook" type="checkbox" name="enableFacebook" checked={facebookSettings.enableFacebook === 'Y' ? true : false} onChange={handleOnChange} />
                                    </fieldset>
                                </div>
                            </div><br>
                            </br>
                        </form>
                        <form>
                            <div className="form-group row">
                                <label htmlFor="facebookApiType" className="col-md-5 col-form-label text-md-left">Facebook API Type</label>
                                <div className="col-md-5">
                                <select name="facebookApiType" className={`form-control ${facebookSettingError.facebookApiType && "error-border"}`} id="facebookApiType" value={facebookSettings.facebookApiType} onChange={handleOnChange}>
                                        <option value="">Select API</option>
                                        {apiType && apiType.map((e) => (
                                            <option key={e.key} value={e.value}>{e.Description}</option>
                                        ))}
                                    </select>
                                    <span className="errormsg">{facebookSettingError.facebookApiType ? facebookSettingError.facebookApiType : ""}</span>
                                </div>
                            </div><br>
                            </br>
                        </form>
                        <form>
                            <div className="form-group row">
                                <label htmlFor="facebookApiId" className="col-md-5 col-form-label text-md-left">App ID</label>
                                <div className="col-md-5">
                                    <input type="text" id="facebookApiId" className={`form-control ${facebookSettingError.facebookApiId && "error-border"}`} name="facebookApiId" defaultValue={facebookSettings?.facebookApiId} onChange={handleOnChange} />
                                    <span className="errormsg">{facebookSettingError.facebookApiId ? facebookSettingError.facebookApiId : ""}</span>
                                </div>
                            </div><br>
                            </br>
                        </form>
                        <form>
                            <div className="form-group row">
                                <label htmlFor="facebookAppKey" className="col-md-5 col-form-label text-md-left">App Secret Key</label>
                                <div className="col-md-5">
                                    <input type="text" id="facebookAppKey" className={`form-control ${facebookSettingError.facebookAppKey && "error-border"}`} name="facebookAppKey" defaultValue={facebookSettings?.facebookAppKey} onChange={handleOnChange} />
                                    <span className="errormsg">{facebookSettingError.facebookAppKey ? facebookSettingError.facebookAppKey : ""}</span>
                                </div>
                            </div><br>
                            </br>
                        </form>
                        <form>
                            <div className="form-group row">
                                <label htmlFor="SubmitApi" className="col-md-5 col-form-label text-md-left"></label>
                                <div className="col-md-5">
                                    <button className="btn btn-primary" id="SubmitApi" onClick={handleOnAPISubmit}>Save</button>
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

export default FacebookAPI