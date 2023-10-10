import React, { useEffect, useContext, useState } from "react";
import { toast } from 'react-toastify';
import { properties } from "../../../properties";
import { get, put, post } from "../../../common/util/restUtil";

import { history } from '../../../common/util/history';
import profile from '../../../assets/images/profile.png';
import { RegularModalCustomStyles } from '../../../common/util/util';
import Modal from 'react-modal';
import { AppContext, OpsDashboardContext } from "../../../AppContext";
import Products from "../Orders/Products";
import OrderJourney from '../Orders/OrderJourney';


const OrdersRightModal = (props) => {
    let { selectedOrder } = props.data;
    // console.log('selectedOrder---------->', selectedOrder)
    selectedOrder = selectedOrder[0];

    const { auth } = useContext(AppContext);
    const { handlers } = useContext(OpsDashboardContext);
    const { setSelectedOrder, setSelectedEntityType } = handlers;
    const [selectedProduct, setSelectedProduct] = useState([]);
    const [isReAssignOpen, setIsReAssignOpen] = useState(false);
    const [reAssignUserLookup, setReAssignUserLookup] = useState();
    const [reAssignInputs, setReAssignInputs] = useState({
        userId: ""
    });
    const [workflowHistory, setWorkflowHistory] = useState([]);
    const [priorityLookup, setPriorityLookup] = useState([]);
    const [sourceLookup, setSourceLookup] = useState([]);
    const [followUpHistory, setFollowUpHistory] = useState({
        rows: [],
        count: 0
    })
    const [followupInputs, setFollowupInputs] = useState({
        priority: "",
        source: "",
        remarks: ""
    })
    const [isFollowupOpen, setIsFollowupOpen] = useState(false);
    const [orderWorkflow, setOrderWorkflow] = useState({})
    const [permissions, setPermissions] = useState({
        // assignToSlef: false,
        followup: false,
        // readOnly: false,
        reAssign: false
    });

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
        getUsersBasedOnRole('RE-ASSIGN');
    }, [isReAssignOpen]);

    useEffect(() => {
        if (selectedProduct?.childOrder?.orderNo) {
            // console.log('selectedProduct ==========>', selectedProduct)
            post(`${properties.ORDER_API}/flow/${selectedProduct?.childOrder?.orderNo}`)
                .then((resp) => {
                    if (resp.data) {
                        setOrderWorkflow({ ...resp.data, source: 'ORDER' });
                    }
                })
                .catch(error => console.error(error))
                .finally(() => console.log())

            grantPermissions(selectedProduct?.childOrder?.currRole?.roleId, selectedProduct?.childOrder?.currUser?.userId, selectedProduct?.childOrder?.orderStatus?.code, selectedProduct?.childOrder?.currEntity?.unitId);

        }

    }, [selectedProduct])

    const getCustomerData = (customerNo) => {
        // console.log('customerNo------->', customerNo)
        get(`${properties.CUSTOMER_API}/search?q=${customerNo.trim()}`)
            .then((resp) => {
                if (resp.status === 200) {
                    const button = document.getElementById("modalButton");
                    button.click();
                    setSelectedEntityType('')
                    setSelectedOrder([])
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
        if (["CLS", "CNCLED"].includes(status)) {
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

    const handleOnReAssign = (e) => {
        // console.log('selectedProduct---------xxxxx----------->', selectedProduct)
        e.preventDefault();
        const { user, currRoleId, currDeptId } = auth;
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

        put(`${properties.ORDER_API}/edit/${selectedProduct?.childOrder?.orderNo}`, { ...payload })
            .then((response) => {
                toast.success(`${response.message}`);
                const button = document.getElementById("reAssignModalBtn");
                button.click();
                setSelectedEntityType('')
                setSelectedOrder([])
                setIsReAssignOpen(false);
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

    const handleSetIsOpenFollowUpModal = () => {
        const button = document.getElementById("modalButton");
        button.click();
        setIsFollowupOpen(true)
    }

    const handleOnFollowupInputsChange = (e) => {
        const { target } = e;
        setFollowupInputs({
            ...followupInputs,
            [target.id]: target.value
        })
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
            orderNo: selectedOrder?.oChildOrderNo,
        }

        post(`${properties.ORDER_API}/followUp`, { ...payload })
            .then((response) => {
                if (response?.status === 200) {
                    toast.success("Follow Up Created Successfully");
                    setIsFollowupOpen(false);
                    setSelectedEntityType('')
                    setSelectedOrder([])
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
                            <img src={selectedOrder?.oCustomerPhoto || profile} alt="" className="img-fluid" width="50" height="50" />
                            <div className="skel-profile-info">
                                <span className="skel-profile-name">{selectedOrder?.oCustomerNo}</span>
                                <span>{selectedOrder?.oCustomerName}</span>
                                <a mailto="">{(selectedOrder?.oCustomerEmail && selectedOrder?.oCustomerEmail || selectedOrder?.oEmailId) || 'NA'}</a>
                                <span>{(selectedOrder?.oCustomerContactNo && selectedOrder?.oCustomerContactNo || selectedOrder?.oContactNo) || 'NA'}</span>
                                <a onClick={() => getCustomerData(selectedOrder?.oCustomerNo)} className="skel-txt-dec-underline">View full profile</a>
                            </div>
                            <button id="modalButton" type="button" className="close" data-dismiss="modal" aria-label="Close" /*onClick={() => {
                            setSelectedEntityType('')
                        }}*/><span aria-hidden="true">&times;</span></button>
                        </div>
                        <hr className="cmmn-hline mt-2" />
                        <div className="skel-inter-statement">                          
                            <div className="skel-inter-st-types">
                                <table className="w-100">
                                    <tr><td className="p-1"><span className="font-weight-bold">Order No:</span> {selectedOrder?.oNo}</td></tr>
                                    <tr><td className="p-1"><span className="font-weight-bold">Order Category:</span> {selectedOrder?.oIntxnCategoryDesc}</td></tr>
                                    <tr><td className="p-1"><span className="font-weight-bold">Order Type:</span> {selectedOrder?.oIntxnTypeDesc}</td></tr>
                                    <tr><td className="p-1"><span className="font-weight-bold">Service Type:</span> {selectedOrder?.oServiceTypeDesc}</td></tr>
                                    <tr><td className="p-1"><span className="font-weight-bold">Channel:</span> {selectedOrder?.oIntxnChannelDesc || selectedOrder?.oIntxnChannel}</td></tr>
                                </table>                               
                            </div>
                            <Products data={{ selectedOrder }} handlers={{ setSelectedProduct }} />
                            <button className={`skel-btn-submit  ${(!permissions.reAssign) && 'd-none'}`} data-target="#reassignModal" data-toggle="modal" data-dismiss="modal" onClick={() => handleSetIsOpenReAssignModal()}>Re-Assign</button>
                            <button className={`skel-btn-submit ${(!permissions.followup) && 'd-none'}`} data-target="#reassignModal" data-toggle="modal" data-dismiss="modal" onClick={() => handleSetIsOpenFollowUpModal()}>Add Followup</button>

                        </div>

                        <hr className="cmmn-hline mt-2 mb-2" />
                        <span className="skel-lbl-flds mb-3">Workflow</span>
                        <div className="col-md-12">
                            <div className="skel-view-base-card">
                                <span className="skel-profile-heading">Order workflow</span>
                                <div className="skel-ai-sect">
                                    <OrderJourney data={orderWorkflow} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={isReAssignOpen} contentLabel="Followup Modal" style={RegularModalCustomStyles}>
                <div className="modal-center" id="reassignModal" tabIndex="-1" role="dialog" aria-labelledby="reassignModal" aria-hidden="true">
                    <div className="modal-dialog " role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="reassignModal">Re-assign for Order No -  {selectedOrder?.oOrderNo}</h5>
                                <button type="button" id="reAssignModalBtn" className="close" data-dismiss="modal" aria-label="Close" onClick={() => {
                                    setIsReAssignOpen(false)
                                    setSelectedEntityType('')
                                    setSelectedOrder([])
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
                                            <button type="button" className="btn btn-primary waves-effect waves-light mr-2" onClick={handleOnReAssign}>Submit</button>
                                            <button type="button" className="btn btn-light waves-effect waves-light" data-dismiss="modal" aria-label="Close" onClick={() => {
                                                setIsReAssignOpen(false)
                                                setSelectedEntityType('')
                                                setSelectedOrder([])
                                            }}>Cancel</button>
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
                                <h5 className="modal-title" id="cancelModal">Followup for Interaction No {selectedOrder?.oIntxnNo}</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => {
                                    setIsFollowupOpen(false)
                                    setSelectedEntityType('')
                                    setSelectedOrder([])
                                }}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <hr className="cmmn-hline" />
                                <div className="clearfix"></div>
                                <div className="row">
                                    <div className="col-md-12 pt-2">
                                        <p style={{ fontWeight: "600" }}>You Currently have {(followUpHistory?.count || 0)}{" "}<a style={{ textDecoration: "underline" }}>Followup(s)</a></p>
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
                                                
                                                <button type="button" className="skel-btn-cancel" onClick={() => {
                                                    setIsFollowupOpen(false)
                                                    setSelectedEntityType('')
                                                    setSelectedOrder([])
                                                }
                                                }>Cancel</button>
                                                <button type="button" className="skel-btn-submit" onClick={handleOnAddFollowup}>Submit</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal >
        </div >)
}

export default OrdersRightModal;


