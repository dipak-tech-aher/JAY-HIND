const InstagramSettingsFinish = (props) => {

    const {instagramSettings,finish} = props.data


    return (
        <>
           { finish && <div className="tab-pane text-center p-2"
                id="finish-3">
                <h3 className="text-success pb-2">Instagram
                    Settings Success!</h3>

                <div className="col-12 form-group row">
                    <label htmlFor="email_address"
                        className="col-md-4 col-form-label text-md-left">Instagram
                        User ID</label>
                    <div className="col-md-4 text-left">
                        {instagramSettings.instagramUserName}
                    </div>
                </div>

                <div className="col-12 form-group row">
                    <label htmlFor="email_address"
                        className="col-md-4 col-form-label text-md-left">Instagram
                        Page Name</label>
                    <div className="col-md-4 text-left">
                       {instagramSettings.instagramPageName}
                    </div>
                </div>

            </div>}
        </>

    )
}

export default InstagramSettingsFinish;