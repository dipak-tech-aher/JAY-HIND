const EmailSubmit = (props) => {

    const {emailSettings, finish} = props.data

    return (
        <>
           { finish && <div className="tab-pane text-center p-2" id="finish-3">
                <h3 className="text-success pb-2">Email Settings Success!</h3>
                <div className="col-12 form-group row">
                    <label htmlFor="email_address" className="col-md-4 col-form-label text-md-left">Email Configuration
                    </label>
                    <div className="col-md-4 text-left">
                        {emailSettings?.emailId}
                    </div>
                </div>
            </div>}
        </>
    )
}

export default EmailSubmit;