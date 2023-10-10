const Finish = (props) => {

    const { livechatSettings, generatedButtonId , finish} = props.data

    return (
        <>
            {generatedButtonId && finish && <div className="tab-pane text-center p-2" id="finish-3">
                <h3 className="text-success pb-2">Livechat Settings Success!</h3>
                <div className="col-12 form-group row">
                    <label htmlFor="email_address" className="col-md-4 col-form-label text-md-left">Live Chat ID
                    </label>
                    <div className="col-md-4 text-left">
                        {livechatSettings?.LiveChatId}
                    </div>
                </div>
                {/* <div className="col-12 form-group row">
                    <label htmlFor="email_address" className="col-md-4 col-form-label text-md-left">Department
                    </label>
                    <div className="col-md-4 text-left">
                        {whatsappSettings?.accountNumber}
                    </div>
                </div> */}

                <div className="col-12 form-group row">
                    <label htmlFor="email_address" className="col-md-4 col-form-label text-md-left">Generated Code</label>
                    <div className="col-md-4 text-left">
                        <textarea disabled="" className="form-control mb-2" readOnly rows="3" value={`[bcae_button id="${generatedButtonId}"]`}></textarea>
                    </div>
                </div>
            </div>}
        </>
    )
}

export default Finish;