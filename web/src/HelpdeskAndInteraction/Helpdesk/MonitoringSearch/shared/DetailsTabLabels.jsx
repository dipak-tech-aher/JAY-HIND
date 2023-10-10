import React, { memo } from 'react';
import moment from 'moment';

const DetailsTabLabels = memo((props) => {
    const { detailedViewItem } = props?.data;
    return (
        <>
            <div className="col-12 row">
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="field-2" className="control-label"> Helpdesk ID</label>
                        <p>{detailedViewItem?.helpdeskId}</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="field-2" className="control-label"> Channel</label>
                        <p className='text-capitalize'>{detailedViewItem?.source?.toLowerCase()}</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="field-2" className="control-label">Agent Name</label>
                        <p>{detailedViewItem?.agent?.firstName || '-'} {detailedViewItem?.agent?.lastName || '-'}</p>
                    </div>
                </div>
            </div>
            <div className="col-12 row">
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="field-2" className="control-label">Helpdesk Start</label>
                        <p>{detailedViewItem?.createdAt ? moment(detailedViewItem?.createdAt).format('DD-MMM-YYYY HH:MM') : '-'}</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="field-2" className="control-label">Helpdesk End</label>
                        <p>{detailedViewItem?.updatedAt ? moment(detailedViewItem?.updatedAt).format('DD-MMM-YYYY HH:MM') : '-'}</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="field-2" className="control-label">Helpdesk Duration</label>
                        <p>{detailedViewItem?.duration}</p>
                    </div>
                </div>
            </div>
            <div className="col-12 row">
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="field-2" className="control-label">Customer Name</label>
                        <p>{detailedViewItem?.customerDetails?.customer?.fullName || '-'}</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="field-2" className="control-label">Customer Contact Number</label>
                        <p>{detailedViewItem?.customerDetails?.customer?.contactNumber}</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group">
                        <label htmlFor="field-2" className="control-label">Helpdesk Status</label>
                        <p>{detailedViewItem?.status}</p>
                    </div>
                </div>
            </div>
        </>
    )
})

export default DetailsTabLabels;