import React from 'react';

const MasterTicketSettings = (props) => {

    const { masterTicketData } = props?.data
    const { setMasterTicketData } = props?.handler

    const handleOnChange = (e) => {
        const { target } = e
        setMasterTicketData({
            ...masterTicketData,
            [target.id]: target.checked
        })
    }

    return (
        <div>
            <div className="tab-pane" id="basictab4">
                <div className="col-12 pl-2 bg-light border">
                    <h5 className="text-primary">Department Settings</h5>
                </div>
                <div className="col-12">
                    <div className="form-group row pt-2">
                        <label htmlFor="replyToChildTicket" className="col-4 col-form-label text-md-left">Allow Department Reply to Child Ticket Users</label>
                        <div className="col-4 text-left">
                            <label className="container2 mt-2">
                                <input type="checkbox" id="replyToChildTicket" name="replyToChildTicket" checked={masterTicketData?.replyToChildTicket} onChange={handleOnChange}></input>
                                <span className="checkmark"></span>
                            </label>
                        </div>
                    </div>
                    <div className="form-group row pt-2">
                        <label htmlFor="editTicket" className="col-4 col-form-label text-md-left">Allow Department to Edit Ticket</label>
                        <div className="col-4 text-left">
                            <label className="container2 mt-2">
                                <input type="checkbox" id="editTicket" name="editTicket" checked={masterTicketData?.editTicket} onChange={handleOnChange}></input>
                                <span className="checkmark"></span>
                            </label>
                        </div>
                    </div>
                </div>
                <div className="col-12 pt-2">
                    <div className="form-group row">
                        <label htmlFor="closeAllChildTicket" className="col-4 col-form-label text-md-left">Allow Department to Close All Child Tickets</label>
                        <div className="col-4 text-left">
                            <label className="container2 mt-2">
                                <input type="checkbox" id="closeAllChildTicket" name="closeAllChildTicket" checked={masterTicketData?.closeAllChildTicket} onChange={handleOnChange}></input>
                                <span className="checkmark"></span>
                            </label>
                        </div>
                    </div>
                </div>
                <div className="col-12 pt-2 pb-2">
                    <div className="form-group row">
                        <label htmlFor="closeMasterTicket" className="col-4 col-form-label text-md-left">Allow Department to Close Master Ticket</label>
                        <div className="col-4 text-left">
                            <label className="container2 mt-2">
                                <input type="checkbox" id="closeMasterTicket" name="closeMasterTicket" checked={masterTicketData?.closeMasterTicket} onChange={handleOnChange}></input>
                                <span className="checkmark"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default MasterTicketSettings;