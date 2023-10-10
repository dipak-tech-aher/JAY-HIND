import moment from 'moment';
import React from 'react';

const SubmitMasterTicket = (props) => {

    const { masterTicketDetails } = props?.data

    return (
        <div>
            <div className="tab-pane" id="basictab5">

                <div className="tab-pane text-center p-2 active" id="finish-3">
                    <h3 className="text-success pb-2">{masterTicketDetails?.mstIntxnId ? "Master Ticket Created Successfully" : ""}</h3>
                    <div className="row">
                        <div className="col-6 form-group">
                            <div className="col-12 form-group row">
                                <label htmlFor="title" id="title" name="title" className="col-md-4 col-form-label text-md-left">Ticket Title
                                </label>
                                <div className="col-md-6 text-left pt-2">{masterTicketDetails?.title}</div>
                            </div>
                            <div className="col-12 form-group row">
                                <label htmlFor="description" id="description" name="description" className="col-md-4 col-form-label text-md-left">Ticket Description</label>
                                <div className="col-md-6 text-left pt-2">
                                    {masterTicketDetails?.description}
                                </div>
                            </div>
                            <div className="col-12 form-group row">
                                <label htmlFor="email_address" id="" name="" className="col-md-4 col-form-label text-md-left">No. of Child Tickets</label>
                                <div className="col-md-6 text-left pt-2">

                                </div>
                            </div>
                            <div className="col-12 form-group row">
                                <label htmlFor="createdBy" id="createdBy" name="createdBy" className="col-md-4 col-form-label text-md-left">Created by</label>
                                <div className="col-md-6 text-left pt-2">
                                    {(masterTicketDetails?.createdByDetails?.firstName || '') + ' ' + (masterTicketDetails?.createdByDetails?.lastName || '')}
                                </div>
                            </div>
                        </div>
                        <div className="col-6 form-group">
                            <div className="col-12 form-group row">
                                <label htmlFor="priority" id="priority" name="priority" className="col-md-4 col-form-label text-md-left">Ticket Priority</label>
                                <div className="col-md-6 text-left pt-2">{masterTicketDetails?.priorityDescription?.description}</div>
                            </div>
                            <div className="col-12 form-group row">
                                <label htmlFor="department" id="department" name="department" className="col-md-4 col-form-label text-md-left">Assigned Dept</label>
                                <div className="col-md-6 text-left pt-2"> {masterTicketDetails?.departmentDetials?.unitName} </div>
                            </div>
                            <div className="col-12 form-group row">
                                <label htmlFor="DeptUser" id="DeptUser" name="DeptUser" className="col-md-4 col-form-label text-md-left">Assigned Dept User</label>
                                <div className="col-md-6 text-left pt-2"> {(masterTicketDetails?.userDetails?.firstName || '') + ' ' + (masterTicketDetails?.userDetails?.lastName || '')} </div>
                            </div>
                            <div className="col-12 form-group row">
                                <label htmlFor="createdDate" id="createdDate" name="createdDate" className="col-md-4 col-form-label text-md-left">Created Date</label>
                                <div className="col-md-6 text-left pt-2">{masterTicketDetails?.createdAt ? moment(masterTicketDetails?.createdAt).format('DD-MM-YYYY') : "-"}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default SubmitMasterTicket;