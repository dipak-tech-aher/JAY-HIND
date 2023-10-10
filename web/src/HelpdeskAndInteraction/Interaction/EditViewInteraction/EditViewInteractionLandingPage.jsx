import React, { useEffect, useRef, useState, useContext } from 'react'
import { toast } from 'react-toastify';
import { string, object } from "yup";
import profileLogo from '../../../assets/images/profile.png';

import { get, post, put } from '../../../common/util/restUtil';
import { properties } from '../../../properties';
import InteractionDetails from './InteractionDetails';
import InteractionWorkflowHistory from './InteractionWorkflowHistory';
import { AppContext } from "../../../AppContext";

const EditViewInteractionLandingPage = (props) => {

    const search = window.location.search;
    const params = new URLSearchParams(search);
    const { auth } = useContext(AppContext);
    const [interactionData,setInteractionData] = useState({})
    const [interactionInputs,setInteractionInputs] = useState({
        user: "",
        assignRole: "",
        assignDept: "",
        currStatus: "",
        remarks: ""
    })
    const [error,setError] = useState({})
    const [workflowHistory,setWorkflowHistory] = useState({
        rows: [],
        count: 0
    })
    const [followUpHistory,setFollowUpHistory] = useState({
        rows: [],
        count: 0
    })
    const [permissions, setPermissions] = useState({
        assignToSlef: false,
        followup: false,
        readOnly: false,
        reAssign: false
    });

    const isRoleChangedByUserRef = useRef(false);
    const currentWorkflowRef = useRef();
    const ticketDetailsValidationSchema = object().shape({
        assignRole: string().required("Assgin to Department/Role is required"),
        currStatus: string().required("Current Status is required")
    });

    const initialize = () => {
        
        isRoleChangedByUserRef.current = false;
        post(`${properties.INTERACTION_API}/search?limit=1&page=0`, { searchParams: { interactionNumber: params.get('interactionId') }})
        .then((response) => {
            if(response?.data?.rows && response?.data?.rows.length > 0) {
                setInteractionData(response?.data?.rows[0])
                let assignRole = !!response?.data?.rows[0]?.currentRole?.code ? parseInt(response?.data?.rows[0]?.currentRole?.code) : "";
                let assignDept = !!response?.data?.rows[0]?.currentDepartment?.code ? response?.data?.rows[0]?.currentDepartment?.code : "";
                let user = !!response?.data?.rows[0]?.currentUser?.code ? parseInt(response?.data?.rows[0]?.currentUser?.code) : "";
                grantPermissions(assignRole, user, response?.data?.rows[0]?.intxnStatus?.code, assignDept);
            }
        })
        .catch((error) => {
            console.error(error)
        })
        .finally()

        
        get(`${properties.INTERACTION_API}/history/${params.get('interactionId')}?getFollowUp=false`)
        .then((response) => {
            if(response?.data && response?.data) {
                setWorkflowHistory(response?.data)
            }
        })
        .catch((error) => {
            console.error(error)
        })
        .finally()

        
        get(`${properties.INTERACTION_API}/history/${params.get('interactionId')}?getFollowUp=true`)
        .then((response) => {
            if(response?.data && response?.data) {
                setFollowUpHistory(response?.data)
            }
        })
        .catch((error) => {
            console.error(error)
        })
        .finally()
    }

    useEffect(() => {
        if(params.get('interactionId')) {
            initialize()
        } else {
            toast.error("Please Provide Interaction Id in URL")
        }
    },[])

    const handleOnTicketDetailsInputsChange = (e) => {
        const { target } = e
        if (target.id === 'assignRole') {
            const { unitId = "" } = target.value !== "" && JSON.parse(target.options[target.selectedIndex].dataset.entity)
            setInteractionInputs({
                ...interactionInputs,
                [target.id]: target.value,
                assignDept: unitId,
            })
            isRoleChangedByUserRef.current = true;
        } else {
            setInteractionInputs({
                ...interactionInputs,
                [target.id]: target.value
            })
        }
        setError({
            ...error,
            [target.id]: ""
        })
    }

    const validate = (section, schema, data) => {
        try {
            if (section === 'DETAILS') {
                setError({})
            }
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                if (section === 'DETAILS') {
                    setError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
            });
            return e;
        }
    };

    const checkTicketDetails = () => {
        let error = validate('DETAILS', ticketDetailsValidationSchema, interactionInputs);
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        return true;
    }

    const grantPermissions = (assignedRole, assignedUserId, status, assignedDept) => {
        const fromHelpDesk = false 
        const helpDeskView = 'QUEUE'
        if (fromHelpDesk && helpDeskView === 'QUEUE') {
            setPermissions({
                assignToSlef: false,
                followup: false,
                readOnly: true,
                reAssign: false
            })
        } else if (["CLOSED", "CANCELLED"].includes(status)) {
            setPermissions({
                assignToSlef: false,
                followup: false,
                readOnly: true,
                reAssign: false
            })
        }
        else {
            const { user, currRoleId, currDeptId } = auth;
            if (Number(assignedRole) === Number(currRoleId) && assignedDept === currDeptId) {
                if (assignedUserId !== "") {
                    if (Number(assignedUserId) === Number(user.userId)) {
                        setPermissions({
                            assignToSlef: false,
                            followup: false,
                            readOnly: false,
                            reAssign: true
                        })
                    }
                    else {
                        setPermissions({
                            assignToSlef: false,
                            followup: true,
                            readOnly: true,
                            reAssign: false
                        })
                    }
                }
                else {
                    setPermissions({
                        assignToSlef: true,
                        followup: true,
                        readOnly: true,
                        reAssign: false
                    })
                }
            }
            else {
                if (assignedUserId !== "") {
                    setPermissions({
                        assignToSlef: false,
                        followup: true,
                        readOnly: true,
                        reAssign: false
                    })
                }
                else {
                    setPermissions({
                        assignToSlef: false,
                        followup: true,
                        readOnly: true,
                        reAssign: false
                    })
                }
            }
        }
    }

    const handleTicketDetailsSubmit = (e) => {
        e.preventDefault();
        if (checkTicketDetails()) {
            let reqBody = {
                roleId: Number(interactionInputs?.assignRole),
                departmentId: interactionInputs?.assignDept,
                status: interactionInputs?.currStatus
            }
            if(interactionInputs?.user) {
                reqBody.userId = Number(interactionInputs?.user)
            }
            if(interactionInputs?.remarks) {
                reqBody.remarks = interactionInputs?.remarks
            }
            
            put(properties.INTERACTION_API + '/update/' + interactionData.intxnNo, { ...reqBody })
            .then((response) => {
                toast.success(`${response?.message}`);
                props.history.push(`${process.env.REACT_APP_BASE}/`);
            })
            .catch((error) => {
                console.error(error);
                toast.error(error);
            })
            .finally()
        }
    }

    return (
        <div className="cnt-wrapper">
            <div className="card adv-srh-sect">
                <div className="adv-search pl-3">
                    <h4>Interaction Number - {params.get('interactionId')}</h4>
                    <button type="button" className="btn waves-effect waves-light btn-primary back-btn" onClick={() => props.history.goBack()}><i className="fas fa-arrow-left mr-1"></i> Back</button>
                </div>
                <div className="interactions-sect">
                    <div className="cust-interaction-details">
                        <div className="cust-profile">
                            <img src={profileLogo} alt="Profile" className="img-fluid profile-img"/>
                            <div className="profile-info-rht">
                                <div className="cust-profile-top no-brd skel-edit-cust-profile-top">
                                    <div className="profile-top-head">
                                        <span className="profile-name">{(interactionData?.customerDetails?.firstName || "")} {(interactionData?.customerDetails?.lastName || "")}</span>
                                        <p>Customer Id: {(interactionData?.customerId || "")}</p>
                                    </div>                      
                                </div>                                                                    
                            </div>                                    
                        </div>
                    </div>
                </div>
                <div className="tabbable-responsive pl-2">
                    <div className="tabbable">
                        <ul className="nav nav-tabs" id="myTab" role="tablist">
                            <li className="nav-item">
                                <a className="nav-link active" id="lead-details" data-toggle="tab" href="#leaddetails" role="tab" aria-controls="lead-details" aria-selected="true">Interaction Details</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" id="work-flow-history" data-toggle="tab" href="#workflowhistory" role="tab" aria-controls="work-flow-history" aria-selected="false">Workflow History</a>
                            </li>
                        </ul>
                    </div>
                    <div className="card-body">    
                        <div className="tab-content">
                            <div className="tab-pane fade show active" id="leaddetails" role="tabpanel" aria-labelledby="lead-details">
                                <InteractionDetails
                                    data={{
                                        interactionData,
                                        interactionInputs,
                                        permissions,
                                        followUpHistory,
                                        error,
                                        isRoleChangedByUserRef, 
                                        currentWorkflowRef,
                                    }}
                                    handler={{
                                        initialize,
                                        handleOnTicketDetailsInputsChange,
                                        setPermissions,
                                        setInteractionInputs,
                                        handleTicketDetailsSubmit
                                    }}
                                />
                            </div>
                            <div className="tab-pane fade" id="workflowhistory" role="tabpanel" aria-labelledby="work-flow-history">
                                <InteractionWorkflowHistory
                                    data={{
                                        interactionData,
                                        workflowHistory,
                                        followUpHistory
                                    }}
                                />
                            </div> 
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditViewInteractionLandingPage