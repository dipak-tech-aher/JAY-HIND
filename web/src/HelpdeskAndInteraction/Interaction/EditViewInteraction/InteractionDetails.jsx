import React, { useContext, useEffect, useState } from 'react'
import { Link } from "react-router-dom";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import Modal from 'react-modal';

import { get, post, put } from '../../../common/util/restUtil';
import { properties } from '../../../properties';
import { RegularModalCustomStyles } from '../../../common/util/util';
import { AppContext } from "../../../AppContext";

const InteractionDetails = (props) => {

    const { auth } = useContext(AppContext);
    const { interactionData, permissions, interactionInputs, followUpHistory, error, isRoleChangedByUserRef, currentWorkflowRef } = props.data
    const { initialize, handleOnTicketDetailsInputsChange, setPermissions, setInteractionInputs, handleTicketDetailsSubmit } = props?.handler
    const [isFollowupOpen, setIsFollowupOpen] = useState(false);
    const [isReAssignOpen, setIsReAssignOpen] = useState(false);
    const [isCancelOpen,setIsCancelOpen] = useState(false)
    const [priorityLookup, setPriorityLookup] = useState([]);
    const [sourceLookup, setSourceLookup] = useState([]);
    const [reAssignUserLookup, setReAssignUserLookup] = useState();
    const [followupInputs, setFollowupInputs] = useState({
        priority: "",
        source: "",
        remarks: ""
    })
    const [reAssignInputs, setReAssignInputs] = useState({
        userId: ""
    })
    const [cancellationReason, setCancellationReason] = useState()
    const [cancellationReasonLookup,setCancellationReasonLookup] = useState([])
    const [workflowLookup, setWorkflowLookup] = useState()
    const [roleLookup, setRoleLookup] = useState();
    const [userLookup, setUserLookup] = useState();
    const [currStatusLookup, setCurrStatusLookup] = useState();

    useEffect(()=>{
        if ((interactionData?.currentDepartment?.code && interactionData?.currentDepartment?.code !== '') && permissions.readOnly === false) {
            
            get(`${properties.WORKFLOW_DEFN_API}/get-status?entityId=${interactionData?.intxnId}&entity=Interaction`)
            .then((response)=>{
                if(response.data){
                    const {flow, flwId } = response?.data;
                    currentWorkflowRef.current = { flwId }
                    if (flow !== 'DONE'){
                        let statusArray = []
                        setWorkflowLookup(response.data)
                        response?.data?.entities && response?.data?.entities.map((node) => {
                            node?.status?.map((st) => {
                                statusArray.push(st)
                            })
                        })
                        let statusLookup = [...new Map(statusArray.map(item => [item["code"], item])).values()]
                        setRoleLookup([]);
                        setCurrStatusLookup(statusLookup)
                    }
                    else if (flow === 'DONE') {
                        setPermissions({
                            assignToSlef: false,
                            followup: false,
                            readOnly: true,
                            reAssign: false
                        })
                    }

                    if (interactionData?.currentDepartment?.code === "CLOSED") {
                        setPermissions({
                            assignToSlef: false,
                            followup: false,
                            readOnly: true,
                            reAssign: false
                        })
                    }
                }
            })
            .catch(error => console.log(error)).finally()
        }

    },[permissions, interactionData?.currentDepartment?.code])

    useEffect(() => {
        
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=TICKET_SOURCE,TICKET_PRIORITY,INTXN_STATUS_REASON').then((resp) => {
            if (resp.data) {
                setSourceLookup(resp.data['TICKET_SOURCE']);
                setPriorityLookup(resp.data['TICKET_PRIORITY']);
                setCancellationReasonLookup(resp.data['INTXN_STATUS_REASON']);
            }
            else {
                toast.error("Error while fetching address details")
            }
        })
        .catch((error) => {
            console.error(error)
        })
        .finally()
    }, [])

    const handleOnCancel = () => {
        if(!cancellationReason) {
            toast.error('Cancellation Reason is Mandatory')
            return
        }
        const payload = {
            cancelReason: cancellationReason
        }
        
        put(`${properties.INTERACTION_API}/cancel/${interactionData?.intxnNo}`, payload)
        .then((response) => {
            console.log('response',response)
            toast.success(`${response.message}`);
            setIsCancelOpen(false);
            initialize();
        })
        .catch((error) => {
            console.error(error)
        })
        .finally()
    }

    const handleOnAssignToSelf = (type) => {
        
        put(`${properties.INTERACTION_API}/assignSelf/${interactionData.intxnNo}`, { type })
        .then((response) => {
            toast.success(`${response.message}`);
            initialize();
        })
        .catch((error) => {
            console.error(error)
        })
        .finally()
    }

    const handleOnAddFollowup = (e) => {
        e.preventDefault();
        const { priority, source, remarks } = followupInputs;
        if(!priority || !source || !remarks) {
            toast.error('Please provide mandatory fields')
            return
        }
        let payload = {
            priorityCode: priority,
            source,
            remarks,
            interactionNumber: interactionData?.intxnNo,
        }
        
        post(`${properties.INTERACTION_API}/followUp`, { ...payload })
        .then((response) => {
            if(response?.status === 200) {
                toast.success("Follow Up Created Successfully");
                setIsFollowupOpen(false);
                setFollowupInputs({
                    priority: "",
                    source: "",
                    remarks: ""
                })
                initialize();
            }
        })
        .catch((error) => {
            console.error(error)
        })
        .finally()
    }

    const handleOnFollowupInputsChange = (e) => {
        const { target } = e;
        setFollowupInputs({
            ...followupInputs,
            [target.id]: target.value
        })
    }

    const handleOnReAssignToSelf = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Confirm Re-Assign To Self`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: `Yes, Submit it!`,
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                handleOnAssignToSelf("REASSIGN")
            }
        })
    }

    const handleOnReAssignInputsChange = (e) => {
        const { target } = e;
        setReAssignInputs({
            userId: target.value
        })
    }

    const handleOnReAssign = (e) => {
        e.preventDefault();
        const { userId } = reAssignInputs;
        let payload = {
            userId: userId,
            roleId: interactionData?.currentRole?.code,
            departmentId: interactionData?.currentDepartment?.code,
            status: "REASSIGNED",
            remarks: "Reassigned to User"
        }
        if(!userId) {
            toast.error('User is Mandatory')
            return
        }
        
        put(`${properties.INTERACTION_API}/update/${interactionData?.intxnNo}`, { ...payload })
        .then((response) => {
            toast.success(`${response.message}`);
            setIsReAssignOpen(false);
            initialize();
        })
        .catch((error) => {
            console.error(error)
        })
        .finally()
    }

    const handleStatusChange = (e) => {
        let entity = []
        handleOnTicketDetailsInputsChange(e)
        workflowLookup && workflowLookup.entities.map((unit) => {
            for (const property in unit.status) {
                if (unit.status[property].code === e.target.value) {
                    entity.push(unit)
                    break
                }
            }
        })
        setRoleLookup(entity)
    }

    useEffect(() => {
        if (interactionInputs.assignRole !== "") {
            getUsersBasedOnRole();
        }
        else {
            setUserLookup([]);
        }
        if (isReAssignOpen) {
            getUsersBasedOnRole('RE-ASSIGN');
        }
    }, [interactionInputs.assignRole, isReAssignOpen])

    const getUsersBasedOnRole = (source = undefined) => {
        const data = source ? {
            roleId: interactionData?.currentRole?.code,
            deptId: interactionData?.currentDepartment?.code
        } : {
            roleId: interactionInputs.assignRole,
            deptId: interactionInputs.assignDept
        }
        
        get(`${properties.USER_API}/by-role?roleId=${data.roleId}&deptId=${data.deptId}`)
        .then((userResponse) => {
            const { data } = userResponse;
            if (source) {
                setReAssignUserLookup(data.filter((x) => x.userId !== interactionData?.currentUser?.code));
            }
            else {
                setUserLookup(data);
                if (isRoleChangedByUserRef.current) {
                    if (data.length === 1) {
                        setInteractionInputs({
                            ...interactionInputs,
                            user: data[0].userId,
                        })
                    }
                }
            }
        }).catch(error => console.log(error))
        .finally()
    }

    return (
        <>
        <div className="adv-search-fields">
            <div id="searchBlock" className="modal-body p-3" style={{display:"block"}}>
            <form>
                <div className="row">
                    <div className="col-12">
                        <div className="interaction-btns">
                        {
                            !["CLOSED","CANCELLED"].includes(interactionData?.intxnStatus?.code) ?
                            <>
                                <button type="button" className="skel-btn-delete mr-1" data-toggle="modal" data-target="#cancelModal" onClick={() => setIsCancelOpen(true)}>Cancel</button>
                                {
                                    permissions.readOnly && auth.currDeptId === interactionData?.currentDepartment?.code && /*Number(auth.currRoleId) === Number(interactionData?.currentRole?.code) &&*/ interactionData?.currentUser?.code &&
                                                    <button type="button" className="skel-btn-submit mr-1" data-toggle="modal" data-target="#cancelModal" onClick={handleOnReAssignToSelf}>Re-Assign to Self</button>
                                }
                                                <button type="button" className={`skel-btn-submit mr-1 ${!permissions.assignToSlef && 'd-none'}`} onClick={() => handleOnAssignToSelf( "SELF")} >
                                    Assign to Self
                                </button>
                                                <button type="button" className={`skel-btn-submit mr-1 ${(!(permissions.reAssign)) && 'd-none'}`} onClick={() => setIsReAssignOpen(true)}>
                                    Re-Assign
                                </button>
                                <button type="button" className={`skel-btn-submit ${(!permissions.followup) && 'd-none'}`} onClick={() => setIsFollowupOpen(true)}>
                                    <small>Add Followup</small>
                                </button>
                            </>
                            :
                            <></>
                        }            
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <div className="form-group">
                            <label htmlFor="Statement" className="control-label">Statement</label>
                            <span className="data-cnt">{(interactionData?.requestStatement || "")}</span>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-4 pt-2">
                        <div className="form-group">
                            <label htmlFor="Interactiontype" className="control-label">Interaction Category</label>
                            <span className="data-cnt">{(interactionData?.intxnCategory?.description || "")}</span>
                        </div>
                    </div>
                    <div className="col-md-4 pt-2">
                        <div className="form-group">
                            <label htmlFor="Interactiontype" className="control-label">Interaction Type</label>
                            <span className="data-cnt">{(interactionData?.intxnType?.description || "")}</span>
                        </div>
                    </div>
                    <div className="col-md-4 pt-2">
                        <div className="form-group">
                            <label htmlFor="Servicetype" className="control-label">Service Category</label>
                            <span className="data-cnt">{(interactionData?.serviceCategory?.description || "")}</span>
                        </div>
                    </div>
                    <div className="col-md-4 pt-2">
                        <div className="form-group">
                            <label htmlFor="Servicetype" className="control-label">Service Type</label>
                            <span className="data-cnt">{(interactionData?.serviceType?.description || "")}</span>
                        </div>
                    </div>
                    <div className="col-md-4 pt-2">
                        <div className="form-group">
                            <label htmlFor="Channel" className="control-label">Channel</label>
                            <span className="data-cnt">{(interactionData?.intxnChannel?.description || "")}</span>
                        </div>
                    </div>        
                    <div className="col-md-4 pt-2">
                        <div className="form-group">
                            <label htmlFor="Problemstatement" className="control-label">Problem Statement</label>
                            <span className="data-cnt">{(interactionData?.intxnCause?.description || "")}</span>
                        </div>
                    </div>          
                    <div className="col-md-4 pt-2">
                        <div className="form-group">
                            <label htmlFor="Priority" className="control-label">Priority</label>
                            <span className="data-cnt">{(interactionData?.intxnPriority?.description || "")}</span>
                        </div>
                    </div>     
                    <div className="col-md-4 pt-2">
                        <div className="form-group">
                            <label htmlFor="Contactpreferenece" className="control-label">Contact Type</label>
                            <span className="data-cnt">{(interactionData?.contactPreference && interactionData?.contactPreference[0]?.description || "")}</span>
                        </div>
                    </div>
                    <div className="col-md-4 pt-2">
                        <div className="form-group">
                            <label htmlFor="Contactpreferenece" className="control-label">Current Status</label>
                            <span className="data-cnt">{(interactionData?.intxnStatus?.description || "")}</span>
                        </div>
                    </div> 
                    <div className="col-md-4 pt-2">
                        <div className="form-group">
                            <label htmlFor="Contactpreferenece" className="control-label">Current Deparment / Role</label>
                            <span className="data-cnt">{(interactionData?.currentDepartment?.description?.unitDesc || "")} / {(interactionData?.currentRole?.description?.roleDesc || "")}</span>
                        </div>
                    </div>
                    <div className="col-md-4 pt-2">
                        <div className="form-group">
                            <label htmlFor="Contactpreferenece" className="control-label">Current User</label>
                            <span className="data-cnt">{(interactionData?.currentUser?.description?.firstName || "")} {(interactionData?.currentUser?.description?.lastName || "")}</span>
                        </div>
                    </div>                              
                </div>
                <div className="row mt-2">
                    <div className="col-md-12 form-group detailsbg-grey">
                        <label className="col-form-label pt-0">Remarks</label>
                        <textarea disabled={true} className="form-control mb-2" rows="3" value={interactionData?.intxnDescription}></textarea>
                    </div>
                </div>
                <div className="row">
                                    {
                                        permissions.readOnly !== true &&
                                        <>
                                            <div className="col-3">
                                                <div className="form-group">
                                                    <label htmlFor="currStatus" className="col-form-label">Choose Status<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                    <select disabled={permissions.readOnly} id="currStatus" value={interactionInputs.currStatus}
                                                        onChange={(e) => {
                                                            handleStatusChange(e)
                                                        }}
                                                        className={`form-control ${error.currStatus && "error-border"}`}>
                                                        <option key="status" value="">Select Status</option>
                                                        {
                                                            currStatusLookup && currStatusLookup.map((currStatus, index) => (
                                                                <option key={index} value={currStatus.code}>{currStatus.description}</option>
                                                            ))
                                                        }
                                                    </select>
                                                    <span className="errormsg">{error.currStatus ? error.currStatus : ""}</span>
                                                </div>
                                            </div>
                                            <div className="col-3">
                                                <div className="form-group">
                                                    <label htmlFor="assignRole" className="col-form-label">Assign to Department/Role<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                    <select disabled={permissions.readOnly} id="assignRole" value={interactionInputs.assignRole}
                                                        onChange={(e) => {
                                                            handleOnTicketDetailsInputsChange(e)
                                                        }}
                                                        className={`form-control ${error.assignRole && "error-border"}`}>
                                                        <option key="role" value="" data-entity="" >Select Role</option>
                                                        {
                                                            roleLookup && roleLookup.map((dept, key) => (
                                                                <optgroup key={key} label={dept?.entity[0]?.unitDesc}>
                                                                    {
                                                                        !!dept.roles.length && dept.roles.map((data, childKey) => (
                                                                            <option key={childKey} value={data.roleId} data-entity={JSON.stringify(dept.entity[0])}>{data.roleDesc}</option>
                                                                        ))
                                                                    }
                                                                </optgroup>
                                                            ))
                                                        }
                                                    </select>
                                                    <span className="errormsg">{error.assignRole ? error.assignRole : ""}</span>
                                                </div>
                                            </div>
                                            <div className="col-3">
                                                <div className="form-group">
                                                    <label htmlFor="user" className="col-form-label">Assign To User</label>
                                                    <select disabled={permissions.readOnly} id="user" className={`form-control ${error.user && "error-border"}`} value={interactionInputs.user} onChange={handleOnTicketDetailsInputsChange}>
                                                        <option key="user" value="">Select User</option>
                                                        {
                                                            userLookup && userLookup.map((user) => (
                                                                <option key={user.userId} value={user.userId}>{user.firstName} {user.lastName}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>
                                        </>
                                    }
                                </div>
                <div className="row">
                {
                    permissions.readOnly !== true &&
                    <>
                        <div className="col-md-12 mt-2">
                            <div className="form-group ">
                                <label htmlFor="remarks" className="col-form-label pt-0">Add Additional Remarks</label>
                                <textarea disabled={permissions.readOnly} maxLength="2500" className={`form-control ${error.remarks && "error-border"}`} id="remarks" name="remarks" rows="4" value={interactionInputs.remarks} onChange={handleOnTicketDetailsInputsChange}></textarea>
                                <span className="errormsg">{error.remarks ? error.remarks : ""}</span>
                                <span>Maximum 2500 characters</span>
                            </div>
                        </div>
                    </>
                }
                </div>
                <div className="row d-none">
                    <div className="col-md-12">
                        <div className="form-group uploader">
                            <label htmlFor="Contactpreferenece" className="control-label">Attachment</label>
                            <div className="attachment-details">
                                <span className="img-attachment"><i className="fa fa-paperclip" aria-hidden="true"></i> Screenshot.png</span>
                                <span className="img-attachment"><i className="fa fa-paperclip" aria-hidden="true"></i> Screenshot.png</span>
                                <span className="img-attachment"><i className="fa fa-paperclip" aria-hidden="true"></i> Screenshot.png</span>
                                <span className="img-attachment"><i className="fa fa-paperclip" aria-hidden="true"></i> Screenshot Screenshot Screenshot.png</span>
                                <span className="img-attachment"><i className="fa fa-paperclip" aria-hidden="true"></i> Screenshot asdsa dasd 21333.png</span>
                                <span className="img-attachment"><i className="fa fa-paperclip" aria-hidden="true"></i> Screenshot.png</span>
                                <span className="img-attachment"><i className="fa fa-paperclip" aria-hidden="true"></i> Screenshot.png</span>
                                <span className="img-attachment"><i className="fa fa-paperclip" aria-hidden="true"></i> Screenshot asfsdf34 asfsdf3432.png</span>
                            </div>
                        </div>
                    </div>  
                </div>
                <Modal isOpen={isFollowupOpen} contentLabel="Followup Modal" style={RegularModalCustomStyles}>
                    <div className="modal-center" id="followupModal" tabindex="-1" role="dialog" aria-labelledby="followupModal" aria-hidden="true">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="followupModal">Followup for Ticket Number {interactionData?.intxnNo}</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setIsFollowupOpen(false)}>
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <section className="multi_step_form">  
                                            <form id="msform"> 
                                                <div className="tittle">
                                                    <p>You are currently in this stage</p>
                                                </div>
                                                <ul id="progressbar">
                                                    <li className="active">Status 1</li>  
                                                    <li className="active">Status 2</li> 
                                                    <li className="active">Status 3</li>
                                                    <li>Status 4</li> 
                                                    <li>Status 5</li>
                                                </ul>
                                            </form>  
                                            </section>    
                                        </div>
                                    </div>
                                    <hr className="cmmn-hline"/>
                                    <div className="clearfix"></div>
                                    <div className="row">
                                        <div className="col-md-12 pt-2">
                                            <p style={{fontWeight: "600"}}>You Currently have {(followUpHistory?.count || 0)} <a  style={{textDecoration:"underline"}}>Followup(s)</a></p>
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
                                                    <button type="button" className="btn btn-primary waves-effect waves-light mr-2" onClick={handleOnAddFollowup}>Submit</button>
                                                    <button type="button" className="btn btn-light waves-effect waves-light" onClick={() => setIsFollowupOpen(false)}>Cancel</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
                <Modal isOpen={isReAssignOpen} contentLabel="Followup Modal" style={RegularModalCustomStyles}>
                    <div className="modal-center" id="reassignModal" tabindex="-1" role="dialog" aria-labelledby="reassignModal" aria-hidden="true">
                        <div className="modal-dialog " role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="reassignModal">Re-assign for Ticket Number - {interactionData?.intxnNo}</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setIsReAssignOpen(false)}>
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <section className="multi_step_form">  
                                            <form id="msform"> 
                                                <div className="tittle">
                                                    <p>You are currently in this stage</p>
                                                </div>
                                                <ul id="progressbar">
                                                    <li className="active">Status 1</li>  
                                                    <li className="active">Status 2</li> 
                                                    <li className="active">Status 3</li>
                                                    <li>Status 4</li> 
                                                    <li>Status 5</li>
                                                </ul>
                                            </form>  
                                            </section>   
                                        </div>
                                    </div>
                                    <hr className="cmmn-hline"/>
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
                                                <button type="button" className="btn btn-cmmn-primary-color mr-2" onClick={handleOnReAssign}>Submit</button>
                                                <button type="button" className="btn btn-light mr-1" onClick={() => setIsReAssignOpen(false)}>Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
                <Modal isOpen={isCancelOpen} contentLabel="Followup Modal" style={RegularModalCustomStyles}>
                    <div className="modal-center" id="followupModal" tabindex="-1" role="dialog" aria-labelledby="followupModal" aria-hidden="true">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="followupModal">Cancellation Ticket Number - {interactionData?.intxnNo}</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setIsCancelOpen(false)}>
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-12">
                                            <section className="multi_step_form">  
                                            <form id="msform"> 
                                                <div className="tittle">
                                                    <p>You are currently in this stage</p>
                                                </div>
                                                <ul id="progressbar">
                                                    <li className="active">Status 1</li>  
                                                    <li className="active">Status 2</li> 
                                                    <li className="active processing">Status 3</li>
                                                    <li>Status 4</li> 
                                                    <li>Status 5</li>
                                                </ul>
                                            </form>  
                                            </section>    
                                        </div>
                                    </div>
                                    <hr className="cmmn-hline"/>
                                    <div className="clearfix"></div>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="cancel-info">
                                                Once you cancel you can't reassign/change the status again. <br />Before proceeding to "Cancel" you must agree to proceed!
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
                                                    <button type="button" className="btn btn-primary waves-effect waves-light mr-2" onClick={handleOnCancel}>Submit</button>
                                                    <button type="button" className="btn btn-light waves-effect waves-light" onClick={() => setIsCancelOpen(false)}>Cancel</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
                <div className={`row justify-content-center mt-2 ${((permissions.readOnly)) && 'd-none'} pt-3`}>
                    <button disabled={(permissions.readOnly)} onClick={handleTicketDetailsSubmit} className="btn btn-primary waves-effect waves-light mr-2" >Submit</button>
                    <Link className="btn btn-secondary waves-effect waves-light" to={`${process.env.REACT_APP_BASE}/`}>Cancel</Link>
                </div>
            </form>
        </div>
    </div>
    </>
    )
}

export default InteractionDetails