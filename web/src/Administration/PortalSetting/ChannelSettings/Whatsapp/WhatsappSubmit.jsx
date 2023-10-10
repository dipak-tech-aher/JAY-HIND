import React from "react";

const WhatsappSubmit = (props) => {

    const { whatsappSettings, generatedButtonId } = props.data

    return (
        <>
            {generatedButtonId && <div className="tab-pane text-center p-2" id="finish-3">
                <h3 className="text-success pb-2">Whatsapp Settings Success!</h3>
                <div className="col-12 form-group row">
                    <label htmlFor="email_address" className="col-md-4 col-form-label text-md-left">Support Group Name
                    </label>
                    <div className="col-md-4 text-left">
                        {whatsappSettings?.supportGroup}
                    </div>
                </div>
                <div className="col-12 form-group row">
                    <label htmlFor="email_address" className="col-md-4 col-form-label text-md-left">Account Number or group chat URL
                    </label>
                    <div className="col-md-4 text-left">
                        {whatsappSettings?.accountNumber}
                    </div>
                </div>

                <div className="col-12 form-group row">
                    <label htmlFor="email_address" className="col-md-4 col-form-label text-md-left">Generated Code</label>
                    <div className="col-md-4 text-left">
                        <textarea disabled="" className="form-control mb-2" rows="3" value={`[bcae_button id="${generatedButtonId}"]`}></textarea>
                    </div>
                </div>
            </div>}
        </>
    )

}

export default WhatsappSubmit;