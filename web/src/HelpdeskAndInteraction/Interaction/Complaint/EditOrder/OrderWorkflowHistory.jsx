import React, { memo } from 'react';
import { formatISODateTime } from '../../../../common/util/dateUtil';

const OrderWorkflowHistory = memo((props) => {
    const {  workflowHistory } = props.data;

    return (
        <>
            <div className="full-width-bg row">
                <section className="row triangle col-12">
                    <div className="col">
                        <h4 id="list-item-1">Workflow History</h4>
                    </div>
                </section>
            </div>
            <div className="col-12 p-2">
                <div className="timeline">
                    {
                        workflowHistory &&
                        workflowHistory.map((data, index) => {
                            return (
                                <div key={index} className="timeline-container primary">
                                    <div className="timeline-icon">
                                        {++index}
                                    </div>
                                    <div className="timeline-body">
                                        <h4 className="timeline-title m-0">
                                            <span className="badge text-white">Workflow on {formatISODateTime(data.flwCreatedAt)}</span>
                                        </h4>
                                        <div className="bg-white border p-2">
                                            <div className="col-md-12 row text-dark">
                                                <div className="col-md-3">
                                                    <label htmlFor="inputState" className="col-form-label pt-0">From Department/Role</label>
                                                    <p>{data.fromEntityName.unitDesc + " - " + data.fromRoleName.roleDesc}</p>
                                                </div>
                                                <div className="col-md-3">
                                                    <label htmlFor="inputState" className="col-form-label pt-0">To Department/Role</label>
                                                    <p>{data.toEntityName.unitDesc + " - " + data.toRoleName.roleDesc}</p>
                                                </div>
                                                <div className="col-md-3">
                                                    <label htmlFor="inputState" className="col-form-label pt-0">User</label>
                                                    <p>{data.flwCreatedby.flwCreatedBy}</p>
                                                </div>
                                                <div className="col-md-3">
                                                    <label htmlFor="inputState" className="col-form-label pt-0">Status</label>
                                                    <p>{data.statusDescription.description}</p>
                                                </div>
                                                <div className="col-md-3"><label htmlFor="inputState" className="col-form-label pt-0">Action Performed</label>
                                                    <p>{data.flwAction}</p>
                                                </div>
                                                <div className="col-md-12 pb-0 mb-0 pt-1">
                                                    <div className="form-group detailsbg-grey p-2">
                                                        <label htmlFor="inputState" className="col-form-label pt-0">Comments</label>
                                                        {
                                                            (data.flwAction === "Assign to self") ?
                                                                <p>Assigned to self</p>
                                                                :
                                                                <p style={{ textAlign: "justify" }}>{data.remarks}</p>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </>
    )
})

export default OrderWorkflowHistory;