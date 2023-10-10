import React, { useEffect, useState } from "react";
import { properties } from "../../../properties";
import { get } from "../../../common/util/restUtil";
import { history } from '../../../common/util/history';
import profile from '../../../assets/images/profile.png';
import moment from 'moment';
import Dropdown from 'react-bootstrap/Dropdown'

const InteractionsRightModal = (props) => {
    let { selectedStatus, selectedInteraction, interactionData, statuses, statusReason, isCancelOpen } = props.data;
    const { setSelectedStatus, setSelectedInteraction, setSelectedEntityType, setIsReScheduleOpen, setInteractionData, setIsCancelOpen } = props.handlers;

    selectedInteraction = selectedInteraction[0];

    useEffect(() => {
        // console.log('selectedInteraction-------->', selectedInteraction)
        get(`${properties.INTERACTION_API}/search?q=${selectedInteraction?.tran_category_no?.trim()}`)
            .then((resp) => {
                if (resp?.status === 200) {
                    // console.log('interaction data------->', resp.data);
                    if (resp?.data && resp?.data?.length > 0) {
                        setInteractionData(resp?.data[0])
                    }
                }
            }).catch(error => {
                console.log(error)
            }).finally();

        get(`${properties.INTERACTION_API}/history/${selectedInteraction?.tran_category_no}?getFollowUp=false`)
            .then((response) => {
                if (response?.data && response?.data) {
                    setWorkflowHistory(response?.data)
                }
            })
            .catch((error) => {
                console.error(error)
            })
            .finally()
    }, []);

    const [workflowHistory, setWorkflowHistory] = useState([]);
    const [followUpHistory, setFollowUpHistory] = useState([]);

    useEffect(() => {
        get(`${properties.INTERACTION_API}/history/${selectedInteraction?.tran_category_no}?getFollowUp=true`)
            .then((response) => {
                if (response?.data && response?.data) {
                    setFollowUpHistory(response?.data)
                }
            })
            .catch((error) => {
                console.error(error)
            })
            .finally()
    }, [])

    const getCustomerData = (customerNo) => {
        get(`${properties.CUSTOMER_API}/search?q=${customerNo.trim()}`)
            .then((resp) => {
                if (resp.status === 200) {
                    const button = document.getElementById("modalButton");
                    button.click();
                    setSelectedInteraction([])
                    setSelectedEntityType('')

                    const data = {
                        ...resp?.data[0],
                        sourceName: 'customer360'
                    }
                    if (resp?.data[0]?.customerUuid) {
                        sessionStorage.setItem("customerUuid", resp.data[0].customerUuid)
                    }
                    history.push(`${process.env.REACT_APP_BASE}/view-customer`, { data })
                }
            }).catch(error => {
                console.log(error)
            }).finally();
    }

    const handleOpenRescheduleModal = () => {
        const button = document.getElementById("modalButton");
        button.click();
        setIsReScheduleOpen(true)
    }

    const handleCancelAppoinment = (e) => {
        const button = document.getElementById("modalButton");
        button.click();
        setIsCancelOpen(true)
    }

    return (
        <div className="modal right fade skel-view-rh-modal" id="view-right-modal" tabIndex="-1" role="dialog" aria-labelledby="viewrightmodal">
            <div className="modal-dialog" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <button id="modalButton" type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                    </div>
                    <div className="modal-body">
                        <div className="skel-profile-base">
                            <img src={profile} alt="" className="img-fluid" width="50" height="50" />
                            <div className="skel-profile-info">
                                <span className="skel-profile-name">{selectedInteraction?.customer_no}</span>
                                <span>{selectedInteraction?.first_name + ' ' + selectedInteraction?.last_name}</span>
                                <a onClick={() => getCustomerData(selectedInteraction?.customer_no)} className="skel-txt-dec-underline">View full profile</a>
                            </div>
                        </div>
                        <hr className="cmmn-hline mt-2" />
                        {interactionData &&
                            <div className="skel-inter-statement">
                                <p className="mt-2">
                                    <span className="skel-lbl-flds">Statement</span>
                                    <span>{interactionData?.requestStatement}</span>
                                </p>
                                <div className="skel-inter-st-types">
                                    <table className="w-100">
                                        <tr><td className="p-1"><span className="font-weight-bold">Interaction No:</span> {interactionData?.intxnNo}</td></tr>
                                        <tr><td className="p-1"><span className="font-weight-bold">Appointment Date:</span> {selectedInteraction?.appoint_date + '- ' + selectedInteraction?.appoint_start_time + ' : ' + selectedInteraction?.appoint_end_time}</td></tr>
                                        <tr><td className="p-1"><span className="font-weight-bold">Interaction Category:</span> {interactionData?.intxnCategory?.description}</td></tr>
                                        <tr><td className="p-1"><span className="font-weight-bold">Interaction Type:</span> {interactionData?.intxnType?.description}</td></tr>
                                        <tr><td className="p-1"><span className="font-weight-bold">Service Type:</span> {interactionData?.serviceType?.description}</td></tr>
                                        <tr><td className="p-1"><span className="font-weight-bold">Channel:</span> {interactionData?.intxnChannel?.description}</td></tr>
                                        {/* <tr><td className="p-1"><span className="font-weight-bold">Cause:</span> {selectedInteraction?.oIntxnCauseDesc}</td></tr> */}
                                    </table>
                                </div>

                                {["AS_SCHED", "AS_TEMP"].includes(selectedInteraction?.status) ? (
                                    <React.Fragment>
                                        {statuses?.length > 0 && (
                                            <div className="form-group">
                                                <label className="control-label">Appointment Status<span className="text-danger font-20 fld-imp">*</span></label>
                                                <select className="form-control" value={selectedInteraction?.status}
                                                    onChange={(e) => {
                                                        let description = statuses.find(x => x.code == e.target.value)?.description;
                                                        setSelectedStatus({ code: e.target.value, description })
                                                        if (e.target.value == 'AS_RESCH') {
                                                            handleOpenRescheduleModal();
                                                        } else {
                                                            handleCancelAppoinment();
                                                        }
                                                    }}
                                                >
                                                    <option value={null}>Select status</option>
                                                    {statuses.filter(x => !["AS_SCHED", "AS_TEMP"].includes(x.code)).map((e, k) => (
                                                        <option key={k} value={e.code}>{e.description}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                        {["AUDIO_CONF", "VIDEO_CONF"].includes(selectedInteraction?.appoint_mode) ? (
                                            <a href={selectedInteraction?.appoint_mode_value} target="_blank">
                                                Click here
                                                <button className={`skel-btn-submit ${selectedInteraction?.appoint_mode == "AUDIO_CONF" ? "btn-mic" : "btn-video"}`}>
                                                    <i className="material-icons ml-0">videocam</i>Join
                                                </button>
                                            </a>
                                        ) : (
                                            <a>{selectedInteraction?.appoint_mode_value}</a>
                                        )}
                                    </React.Fragment>
                                ) : (
                                    <div className="form-group">
                                        <label className="control-label">Appointment Status: <span className="font-20">{statuses.find(x => x.code == selectedInteraction?.status)?.description}</span></label>
                                    </div>
                                )}
                            </div>
                        }

                        <hr className="cmmn-hline mt-2 mb-2" />
                        <span className="skel-lbl-flds mb-3">Workflow</span>
                        <ul id="workflow" className="skel-vl-workflow" role="tablist">
                            {workflowHistory?.rows && workflowHistory?.rows.length > 0 && workflowHistory?.rows.map((ele, i) => {
                                return <li key={i} className="active"><div className="skel-wf">{ele?.statusDescription?.description}<span>Assign To Self on {moment(ele?.intxnCreatedDate).format('DD MMM YYYY hh:mm:ss A')}</span></div></li>
                            })}
                        </ul>
                    </div>
                </div>
            </div>

        </div>

    )
}

export default InteractionsRightModal;


