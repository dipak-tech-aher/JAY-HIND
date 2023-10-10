import React from 'react';
import Modal from 'react-modal';
import { RegularModalCustomStyles } from '../../common/util/util';

const ViewWorkflowModal = (props) => {
    const { isViewWorflowOpen, setIsViewWorflowOpen, workflowData } = props;
    return (
        <Modal isOpen={isViewWorflowOpen} onRequestClose={() => setIsViewWorflowOpen(false)} contentLabel="Worflow History Modal" style={RegularModalCustomStyles}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">Workflow Details</h4>
                        <button type="button" className="close" onClick={() => setIsViewWorflowOpen(false)}>×</button>
                    </div>
                    <div className="modal-body">
                        <div className="col-md-12 card-box m-0 ">
                            <div className="col-12 p-2">
                                <div className="timeline">
                                    {
                                        workflowData?.map((data, index) => (
                                            <div className="timeline-container primary" key={index}>
                                                <div className="timeline-icon">
                                                    1
                                                </div>
                                                <div className="timeline-body">
                                                    <h4 className="timeline-title m-0"><span className="badge text-white">Billing Initiated : 15 Sep 2021 10:00</span></h4>
                                                    <div className="bg-white border p-2">
                                                        <p className="p-0 m-0"><label htmlFor="user" className="col-form-label">User : &nbsp;</label>Mohammad</p>
                                                        <p className="p-0 m-0"><label htmlFor="dept" className="col-form-label">Department : &nbsp;</label> Accounts</p>
                                                        <p className="p-0 m-0"><label htmlFor="status" className="col-form-label">Status :&nbsp;</label>Submitted</p>
                                                        <p className="p-0 m-0"><label htmlFor="reason" className="col-form-label">Reason :&nbsp;</label>Bills Submitted for current Cycle</p>
                                                        <p className="p-0 m-0"><label htmlFor="time" className="col-form-label">Update Time :&nbsp;</label> 15 Sep 2021 10:00</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default ViewWorkflowModal;