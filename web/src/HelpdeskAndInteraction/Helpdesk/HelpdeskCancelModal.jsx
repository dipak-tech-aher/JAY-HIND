import { useEffect, useState } from 'react';
import { RegularModalCustomStyles } from '../../common/util/util';
import Modal from 'react-modal';
import { get, put } from '../../common/util/restUtil';
import { properties } from '../../properties';
import { toast } from 'react-toastify';
import { unstable_batchedUpdates } from 'react-dom';
import { statusConstantCode } from '../../AppConstants';

const HelpdeskCancelModal = (props) => {
    const helpDeskId = props?.data?.helpDeskId
    const { isCancelOpen, refresh } = props?.data
    const { setIsCancelOpen, setRefresh } = props?.handler

    const [cancellationReason, setCancellationReason] = useState()
    const [cancellationReasonLookup, setCancellationReasonLookup] = useState([])

    useEffect(() => {
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=HELPDESK_CANCEL_REASON')
            .then((response) => {
                const { data } = response;
                setCancellationReasonLookup(
                    data['HELPDESK_CANCEL_REASON']
                );
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }, [])

    const initialize = () => {
        unstable_batchedUpdates(() => {
            setCancellationReasonLookup([])
            setCancellationReason()
            setRefresh(!refresh)
        })
    }

    const handleOnCancel = () => {
        if (!cancellationReason) {
            toast.warn('Cancellation Reason is Mandatory')
            return
        }
        const payload = {
            status: statusConstantCode.status.HELPDESK_CANCEL,
            cancelReason: cancellationReason
        }

        put(`${properties.HELPDESK_API}/update/${helpDeskId}`, payload)
            .then((response) => {
                toast.success(`${response.message}`);
                setIsCancelOpen(false);
                initialize()
            })
            .catch((error) => {
                console.error(error)
            })
            .finally()
    }

    return (
        <Modal isOpen={isCancelOpen} contentLabel="Followup Modal" style={RegularModalCustomStyles}>
            <div className="modal-center" id="followupModal" tabindex="-1" role="dialog" aria-labelledby="followupModal" aria-hidden="true">
                <div className="modal-dialog" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="followupModal">Cancellation for Helpdesk No - {helpDeskId}</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setIsCancelOpen(false)}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <hr className="cmmn-hline" />
                            <div className="clearfix"></div>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="cancel-info">
                                        Once you cancel you can't change the status again. <br />Before proceeding to "Cancel" you must agree to proceed!
                                    </div>
                                </div>
                            </div>
                            <div className="row pt-3">
                                <div className="col-md-12 pb-3">
                                    <div className="form-group ">
                                        <label htmlFor="cancellationReason" className="col-form-label">Reason for Cancellation <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                        <select value={cancellationReason} id="cancellationReason" className="form-control" onChange={(e) => setCancellationReason(e.target.value)} required>
                                            <option key="cancellationReason" value="">Select Reason</option>
                                            {
                                                cancellationReasonLookup && cancellationReasonLookup.map((e) => (
                                                    <option key={e.code} value={e.code}>{e.description}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                </div>
                                <div className="col-md-12 pl-2">
                                    <div className="form-group pb-1">
                                        <div className="d-flex justify-content-center">
                                            <button type="button" className="skel-btn-cancel" onClick={() => setIsCancelOpen(false)}>Cancel</button>
                                            <button type="button" className="skel-btn-submit" onClick={handleOnCancel}>Submit</button>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default HelpdeskCancelModal