import moment from "moment"
const ViewTicketDetails = (props) => {

    const { ticketDetails } = props?.data

    return (
        <>
            <div className="modal-body overflow-auto cus-srch">
                <div className="row pl-2">
                    <div className="col-md-12">
                        <div className="form-group">
                            <label htmlFor="ticketTitile" id='ticketTitile' className="control-label">Ticket Title</label>
                            <input type="text" className="form-control" id="field-1" value={ticketDetails?.title} disabled />
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="form-group">
                            <label htmlFor="ticketDetails" id="ticketDetails" className="control-label">Ticket Details</label>
                            <textarea className="form-control" rows="3" disabled value={ticketDetails?.description}></textarea>
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="form-group">
                            <label htmlFor="department" id="department" className="control-label">Assigned Department</label>
                            <input type="text" className="form-control" id="field-1" value={ticketDetails?.departmentDetials?.unitName} disabled />
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="form-group">
                            <label htmlFor="serviceType" id="serviceType" className="control-label">Service Type</label>
                            <input type="text" className="form-control" id="field-1" value={ticketDetails?.serviceTypeDesc?.description} disabled />
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="form-group">
                            <label htmlFor="problemCode" id="problemCode" className="control-label">Problem Code</label>
                            <input type="text" className="form-control" id="field-1" value={ticketDetails?.problemCodeDesc?.description} disabled />
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="form-group">
                            <label htmlFor="priority" id="priority" className="control-label">Priority</label>
                            <input type="text" className="form-control" id="field-1" value={ticketDetails?.priorityDescription?.description} disabled />
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="form-group">
                            <label htmlFor="childTickets" id="childTickets" className="control-label">Number of Child Tickets</label>
                            <input type="text" className="form-control" id="field-1" value={ticketDetails?.childTicketCount} disabled />
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="form-group">
                            <label htmlFor="updatedBy" id="updatedBy" className="control-label">Updated By</label>
                            <input type="text" className="form-control" id="field-1" value={ticketDetails?.createdByDetails?.firstName || '' + ' ' + ticketDetails?.createdByDetails?.lastName || ''} disabled />
                        </div>
                    </div>
                    <div className="col-md-12">
                        <div className="form-group">
                            <label htmlFor="updatedOn" id="updatedOn" className="control-label">Updated On</label>
                            <input type="text" className="form-control" id="field-1" value={ticketDetails?.createdAt ? moment(ticketDetails?.createdAt).format('DD MMM YYYY') : '-'} disabled />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ViewTicketDetails