import React, { useState} from 'react';
import { properties } from '../../properties';
import { post } from '../../common/util/restUtil';

import { toast } from 'react-toastify';


const CloseHelpdeskTicket = (props) => {
    const [status, setStatus] = useState("");
    const { detailedViewItem } = props.data;
    const { doSoftRefresh } = props.handlers;
    

    const handleOnSubmit = () => {

        if (detailedViewItem?.status === status) {
            toast.error('There is no change in status')
            return false
        }

        
        const requestBody = {
            helpdeskId: detailedViewItem?.helpdeskId,
            status
        }
        post(`${properties.HELPDESK_API}/update/${detailedViewItem?.helpdeskId}/UPDATE`, requestBody)
            .then((response) => {
                const { status, message } = response;
                if (status === 200) {
                    doSoftRefresh('UPDATE_DETAILED_VIEW', detailedViewItem?.helpdeskId)
                    toast.success(message);
                }
            })
            .catch(error => {
                console.log(error);
            })
            .finally()
    }

    const handleOnStatusChange = (e) => {
        const { value } = e.target;
        setStatus(value);
    }

    const handleOnCancel = () => {
        doSoftRefresh('CANCEL_VIEW');
    }

    return (
        <div className="col-12 row pl-2 pt-2 m-0 helpdesk-padding-left-0">
            <div className={`col p-0 mb-2 ${detailedViewItem?.laneSource === undefined || detailedViewItem?.laneSource === 'QUEUE' ? 'd-none' : ''}`}>
                <div className="ds-form-group2 clearfix">
                    <div className="form-label">Update Status :</div>

                    <select id="mailStatus" className="form-control" value={status} onChange={handleOnStatusChange}>
                        {
                            (detailedViewItem && detailedViewItem.status === 'HOLD') ?
                                <>
                                    <option value="">Select Status</option>
                                    <option value="WIP">Work In Progress</option>
                                </>
                                :
                                <>
                                    <option value="WIP">Work In Progress</option>
                                    <option value="CLOSED">Closed</option>
                                </>
                        }
                    </select>
                </div>
            </div>
            <div className={`row col-12 justify-content-center ${detailedViewItem?.laneSource === undefined || detailedViewItem?.laneSource === 'QUEUE' ? 'd-none' : ''}`}>
                <button type="button" className="btn waves-effect waves-light btn-primary mr-1" onClick={handleOnSubmit}>Submit</button>
                <button type="button" className="btn waves-effect waves-light btn-secondary" onClick={handleOnCancel}>Cancel</button>
            </div>
        </div>
    )
}

export default CloseHelpdeskTicket;


