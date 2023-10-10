import React, { useEffect, useContext, useState } from "react";
import { toast } from 'react-toastify';
import { properties } from "../../../properties";
import { get, put, post } from "../../../common/util/restUtil";

import { history } from '../../../common/util/history';
import profile from '../../../assets/images/profile.png';
import { RegularModalCustomStyles } from '../../../common/util/util';
import Modal from 'react-modal';
import { AppContext, OpsDashboardContext } from "../../../AppContext";
import moment from 'moment'

const InteractionsRightModal = (props) => {
    let { selectedInteraction } = props.data;
    const { handlers } = useContext(OpsDashboardContext);
    const { setSelectedInteraction, setSelectedEntityType } = handlers;

    // console.log('selectedInteraction--------->', selectedInteraction)
    selectedInteraction = selectedInteraction[0];
    useEffect(() => {

        get(`${properties.INTERACTION_API}/history/${selectedInteraction?.oIntxnNo || selectedInteraction?.oNo}?getFollowUp=false`)
            .then((response) => {
                if (response?.data && response?.data) {
                    setWorkflowHistory(response?.data)
                }
            })
            .catch((error) => {
                console.error(error)
            })
            .finally()
        getUsersBasedOnRole('RE-ASSIGN');
    }, [props]);

    const { auth } = useContext(AppContext);
    const [workflowHistory, setWorkflowHistory] = useState([]);
    const [isReAssignOpen, setIsReAssignOpen] = useState(false);
    const [isFollowupOpen, setIsFollowupOpen] = useState(false);
    const [reAssignUserLookup, setReAssignUserLookup] = useState();
    const [reAssignInputs, setReAssignInputs] = useState({
        userId: ""
    });
    const [followUpHistory, setFollowUpHistory] = useState({
        rows: [],
        count: 0
    })
    const [followupInputs, setFollowupInputs] = useState({
        priority: "",
        source: "",
        remarks: ""
    })
    const [priorityLookup, setPriorityLookup] = useState([]);
    const [sourceLookup, setSourceLookup] = useState([]);
    const [permissions, setPermissions] = useState({
        // assignToSlef: false,
        followup: false,
        // readOnly: false,
        reAssign: false
    })

    const handleOnFollowupInputsChange = (e) => {
        const { target } = e;
        setFollowupInputs({
            ...followupInputs,
            [target.id]: target.value
        })
    }

    useEffect(() => {

        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=TICKET_SOURCE,TICKET_PRIORITY,INTXN_STATUS_REASON').then((resp) => {
            if (resp.data) {
                setSourceLookup(resp.data['TICKET_SOURCE']);
                setPriorityLookup(resp.data['TICKET_PRIORITY']);
            }
            else {
                toast.error("Error while fetching address details")
            }
        })
            .catch((error) => {
                console.error(error)
            })
            .finally()


        get(`${properties.INTERACTION_API}/history/${selectedInteraction?.oIntxnNo || selectedInteraction?.oNo}?getFollowUp=true`)
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
                        ...resp?.data?.[0],
                        sourceName: 'customer360'
                    }
                    if (resp?.data?.[0]?.customerUuid) {
                        sessionStorage.setItem("customerUuid", resp.data[0].customerUuid)
                    }
                    history.push(`${process.env.REACT_APP_BASE}/view-customer`, { data })
                }
            }).catch(error => {
                console.log(error)
            }).finally();
    }

    const grantPermissions = (assignedRole, assignedUserId, status, assignedDept) => {
        if (["CLOSED", "CANCELLED"].includes(status)) {
            setPermissions({
                // assignToSlef: false,
                followup: false,
                // readOnly: true,
                reAssign: false
            })
        } else {
            const { user, currRoleId, currDeptId } = auth;
            if (Number(assignedRole) === Number(currRoleId) && assignedDept === currDeptId) {
                if (assignedUserId !== "" && (Number(assignedUserId) === Number(user.userId))) {
                    setPermissions({
                        followup: false,
                        reAssign: true
                    })
                }
                else {
                    setPermissions({
                        followup: true,
                        reAssign: false
                    })
                }
            }
            else {
                setPermissions({
                    followup: true,
                    reAssign: false
                })
            }
        }
    }

    const handleSetIsOpenReAssignModal = () => {
        const button = document.getElementById("modalButton");
        button.click();
        setIsReAssignOpen(true)
    }

    const handleSetIsOpenFollowUpModal = () => {
        const button = document.getElementById("modalButton");
        button.click();
        setIsFollowupOpen(true)
    }

    const handleOnReAssign = (e) => {
        // console.log('selectedInteraction----------->', selectedInteraction)
        const { user, currRoleId, currDeptId } = auth;
        e.preventDefault();
        const { userId } = reAssignInputs;
        let payload = {
            userId: userId,
            roleId: currRoleId,
            departmentId: currDeptId,
            status: "REASSIGNED",
            remarks: "Reassigned to User"
        }
        if (!userId) {
            toast.error('User is Mandatory')
            return
        }

        put(`${properties.INTERACTION_API}/update/${selectedInteraction?.oIntxnNo || selectedInteraction?.oNo}`, { ...payload })
            .then((response) => {
                toast.success(`${response.message}`);
                setIsReAssignOpen(false);
                setSelectedInteraction([])
                setSelectedEntityType('')
            })
            .catch((error) => {
                console.error(error)
            })
            .finally()
    }

    const handleOnReAssignInputsChange = (e) => {
        const { target } = e;
        setReAssignInputs({
            userId: target.value
        })
    }

    const getUsersBasedOnRole = (source = undefined) => {
        const { user, currRoleId, currDeptId } = auth;
        const data = {
            roleId: currRoleId,
            deptId: currDeptId
        }

        get(`${properties.USER_API}/by-role?roleId=${data.roleId}&deptId=${data.deptId}`)
            .then((userResponse) => {
                const { data } = userResponse;
                if (source) {
                    setReAssignUserLookup(data.filter((x) => x.userId !== user?.userId));
                }
            }).catch((error) => {
                console.log(error)
            })
            .finally()
    }

    const handleOnAddFollowup = (e) => {
        e.preventDefault();
        const { priority, source, remarks } = followupInputs;
        if (!priority || !source || !remarks) {
            toast.error('Please provide mandatory fields')
            return
        }
        let payload = {
            priorityCode: priority,
            source,
            remarks,
            interactionNumber: selectedInteraction?.oIntxnNo || selectedInteraction?.oNo,
        }

        post(`${properties.INTERACTION_API}/followUp`, { ...payload })
            .then((response) => {
                if (response?.status === 200) {
                    toast.success("Follow Up Created Successfully");
                    setIsFollowupOpen(false);
                    setFollowupInputs({
                        priority: "",
                        source: "",
                        remarks: ""
                    })
                }
            })
            .catch((error) => {
                console.error(error)
            })
            .finally()
    }

    return (
        <div className="modal right fade skel-view-rh-modal" id="view-right-modal" tabIndex="-1" role="dialog" aria-labelledby="viewrightmodal">
            <div className="modal-dialog" role="document">
                <div className="modal-content">                    
                    <div className="modal-body">
                        <div className="skel-profile-base">
                            <img src={selectedInteraction?.oCustomerPhoto || profile} alt="" className="img-fluid" width="50" height="50" />
                            <div className="skel-profile-info">
                                <span className="skel-profile-name">{selectedInteraction?.oCustomerNo}</span>
                                <span>{selectedInteraction?.oCustomerName}</span>
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <a mailto="">{(selectedInteraction?.oCustomerEmail && selectedInteraction?.oCustomerEmail || selectedInteraction?.oEmailId) || 'NA'}</a>
                                <span>{(selectedInteraction?.oCustomerContactNo && selectedInteraction?.oCustomerContactNo || selectedInteraction?.oContactNo) || 'NA'}</span>
                                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                                <a onClick={() => getCustomerData(selectedInteraction?.oCustomerNo)} className="skel-txt-dec-underline">View full profile</a>
                            </div>
                            <button id="modalButton" type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        </div>
                        <hr className="cmmn-hline mt-2" />
                        <div className="skel-inter-statement">
                            <p className="mt-2">
                                <span className="skel-lbl-flds">Statement</span>
                                <span>{selectedInteraction?.oRequestStatement || selectedInteraction?.oRequestStatementDesc}</span>
                            </p>
                            <div className="skel-inter-st-types">
                                <table className="w-100">
                                    <tr><td className="p-1"><span className="font-weight-bold">Interaction No:</span> {selectedInteraction?.oNo}</td></tr>
                                    <tr><td className="p-1"><span className="font-weight-bold">Interaction Category:</span> {selectedInteraction?.oIntxnCategoryDesc}</td></tr>
                                    <tr><td className="p-1"><span className="font-weight-bold">Interaction Type:</span> {selectedInteraction?.oIntxnTypeDesc}</td></tr>
                                    <tr><td className="p-1"><span className="font-weight-bold">Service Type:</span> {selectedInteraction?.oServiceTypeDesc}</td></tr>
                                    <tr><td className="p-1"><span className="font-weight-bold">Channel:</span> {selectedInteraction?.oIntxnChannelDesc || selectedInteraction?.oIntxnChannel}</td></tr>
                                    {/* <tr><td className="p-1"><span className="font-weight-bold">Cause:</span> {selectedInteraction?.oIntxnCauseDesc}</td></tr> */}
                                </table>
                            </div>
                            <button className="skel-btn-submit" onClick={() => handleSetIsOpenReAssignModal()}>Re-Assign</button>
                            <button className="skel-btn-submit" onClick={() => handleSetIsOpenFollowUpModal()} >Add Followup</button>
                        </div>

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
            <Modal isOpen={isReAssignOpen} contentLabel="Followup Modal" style={RegularModalCustomStyles}>
                <div className="modal-center" id="reassignModal" tabIndex="-1" role="dialog" aria-labelledby="reassignModal" aria-hidden="true">
                    <div className="modal-dialog " role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="reassignModal">Re-assign for Interaction No - {selectedInteraction?.oIntxnNo}</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => {
                                    setIsReAssignOpen(false)
                                    setSelectedInteraction([])
                                    setSelectedEntityType('')
                                }}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <hr className="cmmn-hline" />
                                <div className="clearfix"></div>
                                <div className="row pt-4">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label htmlFor="reAssignUser" className="control-label">User <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <select required value={reAssignInputs.userId} id="reAssignUser" className="form-control" onChange={handleOnReAssignInputsChange}>
                                                <option key="reAssignUser" value="">Select User</option>
                                                {
                                                    reAssignUserLookup && reAssignUserLookup.map((user) => (
                                                        <option key={user.userId} value={user.userId}>{user?.firstName || ""} {user?.lastName || ""}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-12 pl-2 mt-2">
                                    <div className="form-group pb-1">
                                        <div className="d-flex justify-content-center">
                                            <button type="button" className="skel-btn-cancel" onClick={() => {
                                                setIsReAssignOpen(false)
                                                setSelectedInteraction([])
                                                setSelectedEntityType('')
                                            }}>Cancel</button>
                                            <button type="button" className="skel-btn-submit" onClick={handleOnReAssign}>Submit</button>
                                            
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
            <Modal isOpen={isFollowupOpen} contentLabel="Followup Modal" style={RegularModalCustomStyles}>
                <div className="modal-center" id="cancelModal" tabIndex="-1" role="dialog" aria-labelledby="cancelModal" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="cancelModal">Followup for Interaction No {selectedInteraction?.oIntxnNo}</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setIsFollowupOpen(false)}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <hr className="cmmn-hline" />
                                <div className="clearfix"></div>
                                <div className="row">
                                    <div className="col-md-12 pt-2">
                                        <p style={{ fontWeight: "600" }}>You Currently have {(followUpHistory?.count || 0)} {" "}<a style={{ textDecoration: "underline" }}>Followup(s)</a></p>
                                    </div>
                                </div>
                                <div className="row pt-3">
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label htmlFor="priority" className="col-form-label">Priority <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <select required value={followupInputs.priority} id="priority" className="form-control" onChange={handleOnFollowupInputsChange}>
                                                <option key="priority" value="">Select Priority</option>
                                                {
                                                    priorityLookup && priorityLookup.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label htmlFor="source" className="col-form-label">Source <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <select required id="source" className="form-control" value={followupInputs.source} onChange={handleOnFollowupInputsChange}>
                                                <option key="source" value="">Select Source</option>
                                                {
                                                    sourceLookup && sourceLookup.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>
                                    <div className="col-md-12 ">
                                        <div className="form-group ">
                                            <label htmlFor="inputState" className="col-form-label pt-0">Remarks <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <textarea required className="form-control" maxLength='2500' id="remarks" value={followupInputs.remarks} onChange={handleOnFollowupInputsChange} name="remarks" rows="4"></textarea>
                                            <span>Maximum 2500 characters</span>
                                        </div>
                                    </div>
                                    <div className="col-md-12 pl-2">
                                        <div className="form-group pb-1">
                                            <div className="d-flex justify-content-center">

                                                <button type="button" className="skel-btn-cancel" onClick={() => setIsFollowupOpen(false)}>Cancel</button>
                                                <button type="button" className="skel-btn-submit" onClick={handleOnAddFollowup}>Submit</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>

    )
}

export default InteractionsRightModal;


