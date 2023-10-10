import React, { useState } from 'react'
import moment from 'moment'
import Modal from 'react-modal';
import { RegularModalCustomStyles } from '../../../common/util/util';

const InteractionWorkflowHistory = (props) => {

    const { workflowHistory, followUpHistory, interactionData } = props.data
    const [isOpen, setIsOpen] = useState(false);
    return (
        <>
            <div className="row">
                <div className="col-md-12 pull-right">
                    <button type="button" className="skel-btn-submit" onClick={() => setIsOpen(true)}>Followup History - {(followUpHistory?.count || 0)}</button>
                </div>
            </div>
            <div className="timeline-workflow">
                <ul>
                {
                    workflowHistory?.rows && workflowHistory?.rows.length > 0 && workflowHistory?.rows.map((data) => (
                        <li>
                        <div className="content">            
                            <div className="row">
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label htmlFor="Interactiontype" className="control-label">From Department/Role</label>
                                        <span className="data-cnt">{(data?.fromEntityName?.unitDesc || "")} - {(data?.fromRoleName?.roleDesc || "")}</span>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label htmlFor="Servicetype" className="control-label">To Department/Role</label>
                                        <span className="data-cnt">{(data?.toEntityName?.unitDesc || "")} - {(data?.toRoleName?.roleDesc || "")}</span>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label htmlFor="Channel" className="control-label">User</label>
                                        <span className="data-cnt">{data.flwCreatedby.flwCreatedBy}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label htmlFor="Interactiontype" className="control-label">Status</label>
                                        <span className="data-cnt">{data?.statusDescription?.description}</span>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="form-group">
                                        <label htmlFor="Servicetype" className="control-label">Action Performed</label>
                                        <span className="data-cnt">{data?.flowActionDesc?.description}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label htmlFor="Interactiontype" className="control-label">Comments</label>
                                        <span className="data-cnt">{data?.remarks}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="time">
                            <h4>{moment(data?.intxnCreatedDate || new Date()).format('DD MMM YYYY hh:mm:ss A')}</h4>
                        </div>
                    </li>
                    ))
                }
                </ul>
            </div>
            <Modal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} contentLabel="Followup Modal" style={RegularModalCustomStyles}>
                <div className="modal-center" id="followhistoryModal" tabindex="-1" role="dialog" aria-labelledby="followupModal" aria-hidden="true">
                    <div className="modal-dialog " role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="followupModal">Followup History For Ticket Number {interactionData?.intxnNo}</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setIsOpen(false)}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">                        
                                <div className="row">
                                    <div className="col-md-12">
                                        <div className="cust-table">
                                            <table role="table" className="table table-responsive table-striped dt-responsive nowrap w-100" style={{ textAlign: "center", marginLeft: "0px"}}>
                                                <thead>
                                                    <tr role="row">
                                                        <th colspan="1" role="columnheader">
                                                            <div style={{ display: "flex", justifyContent: "center", flexDirection: "row"}}>Date Time<span></span></div>
                                                        </th>
                                                        <th colspan="1" role="columnheader">
                                                            <div style={{ display: "flex", justifyContent: "center", flexDirection: "row"}}>User<span></span></div>
                                                        </th>
                                                        <th colspan="1" role="columnheader">
                                                            <div style={{ display: "flex", justifyContent: "center", flexDirection: "row"}}>Department<span></span></div>
                                                        </th>
                                                        <th colspan="1" role="columnheader">
                                                            <div style={{ display: "flex", justifyContent: "center", flexDirection: "row"}}>Role<span></span></div>
                                                        </th>
                                                        <th colspan="1" role="columnheader">
                                                            <div style={{ display: "flex", justifyContent: "center", flexDirection: "row"}}>Source<span></span></div>
                                                        </th>
                                                        <th colspan="1" role="columnheader">
                                                            <div style={{ display: "flex", justifyContent: "center", flexDirection: "row"}}>Comments<span></span></div>
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody role="rowgroup">
                                                    {
                                                        followUpHistory?.rows && followUpHistory?.rows?.length > 0 ?
                                                        followUpHistory?.rows.map((data, index) => {
                                                                return (
                                                                    <tr role="row" className="" key={index}>
                                                                        <td>{moment(data.intxnCreatedDate || new Date()).format('DD MMM YYYY hh:mm:ss A')}</td>
                                                                        <td>{data.flwCreatedby.flwCreatedBy}</td>
                                                                        <td>{(data?.fromEntityName?.unitDesc || "")}</td>
                                                                        <td>{(data?.fromRoleName?.roleDesc || "")}</td>
                                                                        <td>{data?.channelDesc?.description}</td>
                                                                        <td>{data.remarks}</td>
                                                                    </tr>
                                                                )
                                                            })
                                                            : (
                                                                <p className="m-0 text-center">No Followp Found.</p>
                                                            )
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default InteractionWorkflowHistory