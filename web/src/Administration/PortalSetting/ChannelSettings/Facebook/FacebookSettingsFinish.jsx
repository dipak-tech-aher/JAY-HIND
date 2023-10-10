const FacebookSettingsFinish = (props) => {

    const {facebookSettings,finish} = props.data


    return (
        <>
           { finish && <div className="tab-pane text-center p-2"
                id="finish-3">
                <h3 className="text-success pb-2">Facebook
                    Settings Success!</h3>

                <div className="col-12 form-group row">
                    <label htmlFor="email_address"
                        className="col-md-4 col-form-label text-md-left">Facebook
                        User ID</label>
                    <div className="col-md-4 text-left">
                        {facebookSettings.facebookUserName}
                    </div>
                </div>

                <div className="col-12 form-group row">
                    <label htmlFor="email_address"
                        className="col-md-4 col-form-label text-md-left">Facebook
                        Page Name</label>
                    <div className="col-md-4 text-left">
                       {facebookSettings.facebookPageName}
                    </div>
                </div>

            </div>}
        </>

    )
}

export default FacebookSettingsFinish;