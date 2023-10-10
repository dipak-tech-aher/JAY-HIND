const InstagramAPI = (props) => {

    const { instagramSettingError, instagramSettings } = props?.data
    const { handleOnChange, handleOnAPISubmit } = props.handle

    const apiType = [
        { key: "INSTA_BSIC_DISPLY_API", value: "INSTA_BSIC_DISPLY_API", Description: "Instagram Basic Display API" },
        { key: "INSTA_DISPLY_API", value: "INSTA_DISPLY_API", Description: "Instagram Display API" }
    ];
    
    return (
        <>
            <div className="tab-pane" id="account-2">
                <div className="row">
                    <div className="col-12">
                        <form>
                            <div className="form-group row">
                                <label htmlFor="emailGroupName" className="col-md-5 col-form-label text-md-left">Enable Instagram</label>
                                <div className="col-md-5">
                                    <fieldset className="question">
                                        <input id="enableInstagram" type="checkbox" name="enableInstagram" checked={instagramSettings.enableInstagram === 'Y' ? true : false} onChange={handleOnChange} />
                                    </fieldset>
                                </div>
                            </div><br>
                            </br>
                        </form>
                        <form>
                            <div className="form-group row">
                                <label htmlFor="instagramApiType" className="col-md-5 col-form-label text-md-left">Instagram API Type</label>
                                <div className="col-md-5">
                                <select name="instagramApiType" className={`form-control ${instagramSettingError.instagramApiType && "error-border"}`} id="instagramApiType" value={instagramSettings.instagramApiType} onChange={handleOnChange}>
                                        <option value="">Select API</option>
                                        {apiType && apiType.map((e) => (
                                            <option key={e.key} value={e.value}>{e.Description}</option>
                                        ))}
                                    </select>
                                    <span className="errormsg">{instagramSettingError.instagramApiType ? instagramSettingError.instagramApiType : ""}</span>
                                </div>
                            </div><br>
                            </br>
                        </form>
                        <form>
                            <div className="form-group row">
                                <label htmlFor="instagramApiId" className="col-md-5 col-form-label text-md-left">App ID</label>
                                <div className="col-md-5">
                                    <input type="text" id="instagramApiId" className={`form-control ${instagramSettingError.instagramApiId && "error-border"}`} name="instagramApiId" defaultValue={instagramSettings?.instagramApiId} onChange={handleOnChange} />
                                    <span className="errormsg">{instagramSettingError.instagramApiId ? instagramSettingError.instagramApiId : ""}</span>
                                </div>
                            </div><br>
                            </br>
                        </form>
                        <form>
                            <div className="form-group row">
                                <label htmlFor="instagramAppKey" className="col-md-5 col-form-label text-md-left">App Secret Key</label>
                                <div className="col-md-5">
                                    <input type="text" id="instagramAppKey" className={`form-control ${instagramSettingError.instagramAppKey && "error-border"}`} name="instagramAppKey" defaultValue={instagramSettings?.instagramAppKey} onChange={handleOnChange} />
                                    <span className="errormsg">{instagramSettingError.instagramAppKey ? instagramSettingError.instagramAppKey : ""}</span>
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

export default InstagramAPI