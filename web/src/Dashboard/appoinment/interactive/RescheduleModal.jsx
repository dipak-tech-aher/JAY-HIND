import React, { useState, useContext, useEffect } from 'react';
import { properties } from "../../../properties";
import { post, get } from "../../../common/util/restUtil";
import { AppContext } from "../../../AppContext";
import { toast } from 'react-toastify';


const RescheduleModal = (props) => {
    const { selectedCustomer, isOpen, isRefresh } = props.data;
    const { setIsOpen, setIsRefresh } = props.handlers;
    console.log('selectedCustomer------>', selectedCustomer)
    const { auth } = useContext(AppContext);
    const [reAssignInputs, setReAssignInputs] = useState({
        userId: ""
    });
    const [reAssignUserLookup, setReAssignUserLookup] = useState();
    useEffect(() => {
        getAvailableAgents();
    }, [])

    const getAvailableAgents = () => {
        post(`${properties.APPOINTMENT_API}/available-agent`, {
            "startTime": selectedCustomer?.appoint_start_time,
            "endTime": selectedCustomer?.appoint_end_time,
            "mode": selectedCustomer?.appoint_mode,
            "location": selectedCustomer?.location
        })
            .then((userResponse) => {
                const { data } = userResponse;
                setReAssignUserLookup(data)
            }).catch((error) => {
                console.log(error)
            })
            .finally()
    }


    const handleOnReAssignInputsChange = (e) => {
        const { target } = e;
        setReAssignInputs({
            userId: target.value
        })
    }

    const reAssignAppoinment = (e) => {
        post(`${properties.APPOINTMENT_API}/re-assign-appoinment`, {
            "appointTxnId": selectedCustomer?.appoint_txn_id,
            "agentId": reAssignInputs?.userId,
            // "departmentId": selectedCustomer?.appoinmentModeDesc?.code,
            // "roleId": selectedCustomer?.appointmentHdrDetails?.location
        })
            .then((userResponse) => {
                toast.success(userResponse?.message);
                document.getElementById('reAssignBtn').click();
                setIsOpen(!isOpen)
                setIsRefresh(!isRefresh);
            }).catch((error) => {
                console.log(error)
            })
            .finally()
    }


    return (
        <>
            <div className="modal fade modal-center" id="reassignModal" tabindex="-1" role="dialog" aria-labelledby="reassignModal"
                aria-modal="true">
                <div className="modal-dialog cust-xs-modal" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="reassignModal">Re-assign for Interaction ID {selectedCustomer?.tran_category_no}</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close"
                                data-target="#view-right-modal" data-toggle="modal">
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="clearfix"></div>
                            <span className="skel-lbl-flds">{selectedCustomer?.first_name + ' ' + selectedCustomer?.last_name}</span>
                            <span>Appt. Type - {selectedCustomer?.appoint_mode_description}</span>
                            <div className="row pt-2">

                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label for="Contactpreferenece" className="control-label">User <span
                                            className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                        <div className="custselect">
                                            <select required value={reAssignInputs.userId} id="reAssignUser" className="form-control" onChange={handleOnReAssignInputsChange}>
                                                <option key="reAssignUser" value="">Select User</option>
                                                {
                                                    reAssignUserLookup && reAssignUserLookup?.length > 0 && reAssignUserLookup?.map((user) => (
                                                        <option key={user.user_id} value={user.user_id}>{user?.first_name || ""} {user?.last_name || ""}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer mb-4">
                            <div>
                                <button type="button" className="skel-btn-cancel" data-dismiss="modal">Cancel</button>
                                <button type="button" className="skel-btn-submit" id="btn-save-event"
                                    onClick={() => reAssignAppoinment()}>Submit</button>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default RescheduleModal;


