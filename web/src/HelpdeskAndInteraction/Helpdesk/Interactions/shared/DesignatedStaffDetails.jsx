import React, { memo } from 'react';

const DesignatedStaffDetails = memo((props) => {
    const { detailedViewItem, helpDeskView = undefined } = props.data;
    const viewData = ['ASSIGNED', 'QUEUE'].includes(helpDeskView) ? detailedViewItem?.designatedSupportStaff
        : ['Search', 'Incident', 'Customer360'].includes(helpDeskView) ?
            !!detailedViewItem?.interactionDetails?.length ?
                detailedViewItem?.interactionDetails[0]?.designatedSupportStaff
                : detailedViewItem?.designatedSupportStaff
            : detailedViewItem?.designatedSupportStaff;
    return (
        <div className="row mt-2">
            <section className="triangle col-12">
                <div className="row col-12">
                    <div className="col-8">
                        <h5 id="list-item-5" className="pl-1">Designated Support Staff Details</h5>
                    </div>
                    <div className="col-4">
                        <span>&nbsp;</span>
                    </div>
                </div>
            </section>
            <div className="row col-12 pl-2">
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="inputId" className="col-form-label">Agent Name</label>
                        <p>{viewData?.name || '-'}</p>
                    </div>
                </div>
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="inputId" className="col-form-label">Role Name</label>
                        <p>{viewData?.role || '-'}</p>
                    </div>
                </div>
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="inputState" className="col-form-label">Email ID</label>
                        <p>{viewData?.email || '-'}</p>
                    </div>
                </div>
                <div className="col-3">
                    <div className="form-group">
                        <label htmlFor="inputAccountNo" className="col-form-label">Contact No</label>
                        <p>{viewData?.contact || '-'}</p>
                    </div>
                </div>
            </div>
        </div>
    )
})

export default DesignatedStaffDetails;