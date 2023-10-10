/* eslint-disable react-hooks/exhaustive-deps */
import React, { memo, useEffect, useState, useContext } from 'react';
import { Link } from "react-router-dom";
import Modal from 'react-modal';
import FileUpload from '../../../../common/uploadAttachment/fileUpload';
import { Element } from 'react-scroll';
import { post, get, put } from "../../../../common/util/restUtil";
import { properties } from '../../../../properties';
import { toast } from 'react-toastify';
import { AppContext } from "../../../../AppContext";

import moment from 'moment';
import { unstable_batchedUpdates } from 'react-dom';
import { getServiceCategoryMappingBasedOnProdType, RegularModalCustomStyles } from '../../../../common/util/util';
import AddressPreview from '../../CustomerAddressPreview';
import SalesOrderDetails from './SalesOrder/SalesOrderDetails';
import BillingContractDetails from './ContractDetails/BillingContractDetails';
import FullfillmentTable from '../fullfillment';

const OrderDetails = memo((props) => {

    const { auth } = useContext(AppContext);
    const { ticketDetailsInputs, customerData, complaintData, permissions, interactionData, isRoleChangedByUserRef, currentFiles, existingFiles, currentWorkflowRef, currentTicketUserRef, entityRef, orderTaskDetailsList, serverApplianceDetailsList, networkDetailsList, networkList, applicationList, saasList, otherServicesList, editedTaskIdList, editedNetworkIdList, editedServerApplianceIdList, customerContract, billingContractDetails } = props.data;
    const { handleOnTicketDetailsInputsChange, handleTicketDetailsSubmit, initialize, setTicketDetailsInputs, setCurrentFiles, setExistingFiles, setTicketDetailsError, setFlowValue, setPermissions, setOrderTaskDetailsList, setServerApplianceDetailsList, setNetworkDetailsList, setNetworkList, setApplicationList, setSaasList, setOtherServicesList, setEditedTaskIdList, setEditedNetworkIdList, setEditedServerApplianceIdList, setBillingContractDetails } = props.handlers;
    const { error } = props;
    const [workflowLookup, setWorkflowLookup] = useState()
    const [wait, setWait] = useState(false);
    const [isReAssignOpen, setIsReAssignOpen] = useState(false);
    const [priorityLookup, setPriorityLookup] = useState();
    const [sourceLookup, setSourceLookup] = useState();
    const [roleLookup, setRoleLookup] = useState();
    const [userLookup, setUserLookup] = useState();
    const [currStatusLookup, setCurrStatusLookup] = useState();
    const [reAssignUserLookup, setReAssignUserLookup] = useState();
    const [serviceCategory, setServiceCategory] = useState("");
    const [fulfillmentData, setFullfillmentData] = useState()
    const [allowEditFulfilment,setAllowEditFulfilment]  = useState(false)
    const [reAssignInputs, setReAssignInputs] = useState({
        userId: ""
    })

    //const currStatusLookupRef = useRef()
    const [isTaskDetailsBulkUploadOpen, setIsTaskDetailsBulkUploadOpen] = useState(false)
    const [isCustomerContractUploadOpen, setIsCustomerContractUploadOpen] = useState(false)
    // useEffect(() => {
    //     if (customerData) {
    //         
    //         post(properties.BUSINESS_ENTITY_API, [
    //             'TICKET_SOURCE',
    //             'TICKET_PRIORITY',
    //             'PROD_TYPE'
    //             //'INTERACTION_STATUS'
    //         ])
    //             .then((response) => {
    //                 if (response.data) {
    //                     let lookupData = response.data;
    //                     unstable_batchedUpdates(() => {
    //                         setSourceLookup(lookupData['TICKET_SOURCE']);
    //                         setPriorityLookup(lookupData['TICKET_PRIORITY']);
    //                         if (['complaint', 'inquiry'].includes(interactionData.type)) {
    //                             let serviceCategoryMapping = getServiceCategoryMappingBasedOnProdType(lookupData['PROD_TYPE'], customerData?.serviceType || complaintData?.businessEntityCode);
    //                             setServiceCategory(serviceCategoryMapping.hasOwnProperty('serviceCategory') ? serviceCategoryMapping?.serviceCategory : "")
    //                         }
    //                     })
    //                     //currStatusLookupRef.current = lookupData['INTERACTION_STATUS'].filter((data) => ['ASSIGNED', 'NEW', 'CLOSED'].includes(data.code))
    //                 }
    //             })
    //             .finally()
    //     }
    // }, [customerData])

    // useEffect(() => {
    //     if (['order'].includes(interactionData.type) && complaintData.currStatus && complaintData.currStatus !== '' && permissions.readOnly === false) {
    //         setTicketDetailsInputs({
    //             ...ticketDetailsInputs,
    //             currStatus: "",
    //             assignRole: "",
    //             user: ""
    //         })
    //         const tktText = 'Work Order'
    //         
    //         get(`${properties.WORKFLOW_API}/${interactionData.interactionId}`)
    //             .then((response) => {
    //                 if (response.data) {
    //                     const { flow, flwId, transactionName } = response?.data;
    //                     setFlowValue(flow)
    //                     if (flow !== 'END' && flow !== 'WAIT') {
    //                         const { entity, status } = response?.data;
    //                         currentWorkflowRef.current = { flwId, transactionName }
    //                         let statusArray = []
    //                         setWorkflowLookup(response.data)
    //                         response?.data?.enities && response?.data?.enities.map((node) => {
    //                             node?.status?.map((st) => {
    //                                 statusArray.push(st)
    //                             })
    //                         })
    //                         let statusLookup = [...new Map(statusArray.map(item => [item["code"], item])).values()]
    //                         unstable_batchedUpdates(() => {
    //                             setRoleLookup([]);
    //                             setCurrStatusLookup(statusLookup)
    //                         })
    //                         if (wait) {
    //                             setWait(false)
    //                         }
    //                     }
    //                     else if (flow === 'END') {
    //                         setPermissions({
    //                             assignToSlef: false,
    //                             followup: false,
    //                             readOnly: true,
    //                             reAssign: false
    //                         })
    //                     }
    //                     else {

    //                         if (flow === 'WAIT') {
    //                             setWait(true)
    //                             if (complaintData && auth && auth.user && complaintData.taskStatus !== 'ERROR'
    //                                 && permissions.assignToSlef === false && permissions.readOnly === false
    //                                 && complaintData.currUser === auth.user.userId
    //                                 && complaintData.currRole === auth.currRoleId
    //                                 && complaintData.currEntity === auth.currDeptId) {

    //                                 toast.info('This ' + tktText + ' cannot     be edited currently as system is waiting for a background process to complete.')
    //                             } else {
    //                                 setWait(false)
    //                             }
    //                         } else {
    //                             //toast.info(`${response.message}`)
    //                             setWait(false)
    //                         }
    //                     }
    //                     if (complaintData.currStatus === "CLOSED") {
    //                         setPermissions({
    //                             ...permissions,
    //                             assignToSlef: false,
    //                             followup: false,
    //                             readOnly: true,
    //                             reAssign: false
    //                         })
    //                     }
    //                 }
    //             })
    //             .finally()
    //     }
    // }, [permissions])

    const getUsersBasedOnRole = (source = undefined) => {
        
        const data = source ? {
            roleId: currentTicketUserRef.current.currRole,
            deptId: currentTicketUserRef.current.currDept
        } : {
            roleId: ticketDetailsInputs.assignRole,
            deptId: entityRef.unitId
        }
        get(`${properties.USER_LOOKUP_API}?role-id=${data.roleId}&dept=${data.deptId}`)
            .then((userResponse) => {
                const { data } = userResponse;
                if (source) {
                    setReAssignUserLookup(data);
                }
                else {
                    setUserLookup(data);
                    if (isRoleChangedByUserRef.current) {
                        if (data.length === 1) {
                            setTicketDetailsInputs({
                                ...ticketDetailsInputs,
                                user: data[0].userId,
                                //currStatus: 'ASSIGNED'
                            })
                        }
                    }
                }
            }).catch(error => console.log(error))
            .finally()
    }

    const handleStatusChange = (e) => {
        let entity = []
        handleOnTicketDetailsInputsChange(e)
        workflowLookup && workflowLookup.enities.map((unit) => {
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
        if (ticketDetailsInputs.assignRole !== "") {
            getUsersBasedOnRole();
        }
        else {
            setUserLookup();
        }
        if (isReAssignOpen) {
            getUsersBasedOnRole('RE-ASSIGN');
        }
    }, [ticketDetailsInputs.assignRole, isReAssignOpen])

    // useEffect(() => {
    //     if (currStatusLookupRef.current) {
    //         if (ticketDetailsInputs.assignRole === "" && ticketDetailsInputs.user === "") {
    //             setCurrStatusLookup(currStatusLookupRef.current.filter((data) => ['CLOSED'].includes(data.code)))
    //         }
    //         else if (ticketDetailsInputs.assignRole !== "" && ticketDetailsInputs.user === "") {
    //             setCurrStatusLookup(currStatusLookupRef.current.filter((data) => ['NEW', 'CLOSED'].includes(data.code)))
    //         }
    //         else {
    //             setCurrStatusLookup(currStatusLookupRef.current.filter((data) => ['CLOSED', 'ASSIGNED'].includes(data.code)))
    //         }
    //     }
    // }, [currStatusLookupRef.current, ticketDetailsInputs.assignRole, ticketDetailsInputs.user])


    const handleOnAssignToSelf = () => {
        
        put(`${properties.INTERACTION_API}/assignSelf/${complaintData.intxnId}?type=REQWO`)
            .then((response) => {
                toast.success(`${response.message}`);
                initialize();
            }).catch(error => console.log(error))
            .finally(() => {
                
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
        const { intxnId } = complaintData;
        let payload = {
            userId
        }
        
        put(`${properties.INTERACTION_API}/reassign/${intxnId}`, { ...payload })
            .then((response) => {
                toast.success(`${response.message}`);
                setIsReAssignOpen(false);
                initialize();
            }).catch(error => console.log(error))
            .finally(() => {
                
            })
    }

    const doOnSubmit = (e) => {
        handleTicketDetailsSubmit(e);
    }
    return (
        <>
            <Element name="ticketDetailsSection">
                <div className="full-width-bg row">
                    <section className="row triangle col-12">
                        <div className="col">
                            <h4 id="list-item-1">Work Order Details - {interactionData.interactionId}</h4>
                        </div>
                        <div className="col-auto m-auto assig-btn">
                            {
                                complaintData.currStatus !== "CLOSED" ?
                                    <>
                                        <button type="button" className={`btn btn-labeled btn-primary btn-sm mr-1 ml-1 ${!permissions.assignToSlef && 'd-none'}`} onClick={handleOnAssignToSelf} >
                                            Assign to Self
                                        </button>
                                        <button type="button" className={`btn btn-outline-primary waves-effect waves-light btn-sm mr-1 ${(!(permissions.reAssign) || wait) && 'd-none'}`} onClick={() => setIsReAssignOpen(true)}>
                                            Re-Assign
                                        </button>
                                    </>
                                    :
                                    <></>
                            }
                        </div>
                    </section>
                </div>
                <div className="row pl-2">
                    <div className="col-12">
                        <div className="row pt-1">
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label htmlFor="ticketNo" className="col-form-label">Work Order Number</label>
                                    <p>{interactionData?.interactionId || '-'}</p>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label htmlFor="ticketNo" className="col-form-label">Customer Name</label>
                                    <p>{customerData?.customerName || '-'}</p>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label htmlFor="createdOn" className="col-form-label">Work Order Create On</label>
                                    <p>{complaintData?.ticketCreatedOn || '-'}</p>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label htmlFor="createdBy" className="col-form-label">Work Order Create By</label>
                                    <p>{complaintData?.ticketCreatedBy || '-'}</p>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label htmlFor="currDeptRole" className="col-form-label">Current Department / Role</label>
                                    <p>{complaintData?.departmentDetials?.unit_desc}/{complaintData?.roleDetails?.role_desc}</p>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label htmlFor="currentUser" className="col-form-label">Current User</label>
                                    <p>{complaintData?.currUserName}</p>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label htmlFor="currStatus" className="col-form-label">Current Status</label>
                                    <p>{(complaintData?.currentStatusDesc && complaintData?.currentStatusDesc) || (complaintData?.currStatusDesc && complaintData?.currStatusDesc?.description)}</p>
                                    {/* <p>-</p> */}
                                </div>
                            </div>
                        </div>
                        {
                            ['order'].includes(interactionData.type) && (
                                <div className="row">
                                    {
                                        permissions.readOnly !== true && wait !== true &&
                                        <>
                                            <div className="col-3">
                                                <div className="form-group">
                                                    <label htmlFor="currStatus" className="col-form-label">Choose Status<span>*</span></label>
                                                    <select disabled={permissions.readOnly || wait} id="currStatus" value={ticketDetailsInputs.currStatus}
                                                        onChange={(e) => {
                                                            handleStatusChange(e)
                                                            setTicketDetailsError({ ...error, [e.target.id]: "" })
                                                        }}
                                                        className={`form-control ${error.currStatus && "error-border"}`}>
                                                        <option key="status" value="">Select Status</option>
                                                        <option value='COMPLETED'>Completed</option>

                                                    </select>
                                                    <span className="errormsg">{error.currStatus ? error.currStatus : ""}</span>
                                                </div>
                                            </div>
                                            <div className="col-3">
                                                <div className="form-group">
                                                    <label htmlFor="startDate" className="col-form-label">Contract Start Date<span>*</span></label>
                                                    <input disabled={permissions.readOnly || wait} type="date" id="startDate" value={ticketDetailsInputs.startDate}
                                                        min={moment(new Date()).format('YYYY-MM-DD')}
                                                        onChange={(e) => {
                                                            handleStatusChange(e)
                                                            setTicketDetailsError({ ...error, [e.target.id]: "" })
                                                        }}
                                                        className={`form-control ${error.startDate && "error-border"}`}
                                                    />
                                                    <span className="errormsg">{error.startDate ? error.startDate : ""}</span>
                                                </div>
                                            </div>
                                            <div className="col-3">
                                                <div className="form-group">
                                                    <label htmlFor="endDate" className="col-form-label">Contract End Date<span>*</span></label>
                                                    <input disabled={permissions.readOnly || wait} type="date" id="endDate" value={ticketDetailsInputs.endDate}
                                                        onChange={(e) => {
                                                            handleStatusChange(e)
                                                            setTicketDetailsError({ ...error, [e.target.id]: "" })
                                                        }}
                                                        className={`form-control ${error.endDate && "error-border"}`}
                                                    />
                                                    <span className="errormsg">{error.endDate ? error.endDate : ""}</span>
                                                </div>
                                            </div>
                                            <div className="col-3 d-none">
                                                <div className="form-group">
                                                    <label htmlFor="assignRole" className="col-form-label">Assign to Department/Role<span>*</span></label>
                                                    <select disabled={permissions.readOnly || wait} id="assignRole" value={ticketDetailsInputs.assignRole}
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
                                                    {/* <span className="errormsg">{error.assignRole ? error.assignRole : ""}</span> */}
                                                </div>
                                            </div>
                                            <div className="col-3 d-none">
                                                <div className="form-group">
                                                    <label htmlFor="user" className="col-form-label">Assign To User</label>
                                                    <select disabled={permissions.readOnly || wait} id="user" value={ticketDetailsInputs.user} onChange={handleOnTicketDetailsInputsChange} className="form-control">
                                                        <option key="user" value="">Select User</option>
                                                        {
                                                            userLookup && userLookup.map((user) => (
                                                                <option key={user.userId} value={user.userId}>{user.firstName} {user.lastName}</option>
                                                            ))
                                                        }
                                                    </select>
                                                </div>
                                            </div>
                                            {
                                                ticketDetailsInputs.currStatus === 'PEND-CLOSE' && (
                                                    <div className="col-3">
                                                        <div className="form-group">
                                                            <label htmlFor="surveyReq" className="col-form-label">Is Survey Required</label>
                                                            <select id="surveyReq" value={ticketDetailsInputs.surveyReq} onChange={handleOnTicketDetailsInputsChange} className="form-control">
                                                                <option key="survey" value="">Select Survey Required</option>
                                                                <option key="surveyYes" value="Y">Yes</option>
                                                                <option key="surveyNo" value="N">No</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                )
                                            }
                                            <div className="col-md-12 mt-2">
                                                <div className="form-group ">
                                                    <label htmlFor="additionalRemarks" className="col-form-label pt-0">Add Additional Remarks</label>
                                                    <textarea disabled={permissions.readOnly || wait} maxLength="2500" className="form-control" id="additionalRemarks" name="additionalRemarks" rows="4" value={ticketDetailsInputs.additionalRemarks} onChange={handleOnTicketDetailsInputsChange}></textarea>
                                                    <span>Maximum 2500 characters</span>
                                                </div>
                                            </div>
                                        </>
                                    }
                                </div>
                            )
                        }
                    </div>
                </div>
            </Element>


            <Element name="salesOrderSection" /*className={(permissions.readOnly || wait) && 'cursor-not-allowed'}*/>
                <div className="mt-2">
                    <div className="full-width-bg row">
                        <section className="row triangle col-12">
                            <div className="row col-12">
                                <div className="col-10">
                                    <h4 id="list-item-4">Service Details</h4>
                                </div>
                            </div>
                        </section>
                    </div>
                    <SalesOrderDetails
                        data={{
                            complaintData,
                            customerData
                        }}
                    />
                </div>
            </Element>

            <Element name="customerSection">
                <div className="full-width-bg row">
                    <section className="row triangle col-12">
                        <div className="col">
                            <h4 id="list-item-1">Customer Details</h4>
                        </div>
                    </section>
                </div>
                <div className="row pt-1">
                    <div className="col-12 p-2">
                        <div className="row pt-1">
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label htmlFor="crmCustomerNo" className="col-form-label">Customer Number</label>
                                    <p>{customerData && customerData?.crmCustomerNo}</p>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label htmlFor="crmCustomerNo" className="col-form-label">Customer Name</label>
                                    <p>{customerData && customerData?.customerName}</p>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label htmlFor="customerType" className="col-form-label">Customer Type</label>
                                    <p>{customerData && customerData?.customerTypeDesc?.description || '-'}</p>
                                </div>
                            </div>
                            <div className="col-md-3 d-none">
                                <div className="form-group">
                                    <label htmlFor="accountNbr" className="col-form-label">Account Number</label>
                                    <p>{customerData && customerData?.accountNumber}</p>
                                </div>
                            </div>
                            <div className="col-md-3 d-none">
                                <div className="form-group  p-0 m-0">
                                    <label htmlFor="AccountName" className="col-form-label">Account Name</label>
                                    <p>{customerData && customerData?.accountName}</p>
                                </div>
                            </div>
                            <div className="col-md-3 d-none">
                                <div className="form-group">
                                    <label htmlFor="serviceNbr" className="col-form-label">Access Number</label>
                                    <p>{customerData && customerData?.serviceNumber}</p>
                                </div>
                            </div>
                            <div className="col-md-3 d-none">
                                <div className="form-group">
                                    <label htmlFor="serviceStatus" className="col-form-label">Service Status</label>
                                    <p>{customerData && customerData?.serviceStatus}</p>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label htmlFor="contactNbr" className="col-form-label">Contact Number</label>
                                    <p>{customerData && customerData?.accountContactNbr}</p>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label htmlFor="email" className="col-form-label">Email ID</label>
                                    <p>{customerData && customerData?.accountEmail}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {
                    (customerData && customerData?.address) ?
                        <AddressPreview
                            data={{
                                title: "customer_address",
                                addressData: customerData?.address
                            }}
                        />
                        :
                        <></>
                }
            </Element>


            <Element name="attachmentsSection" className={(permissions.readOnly || wait) && 'cursor-not-allowed'}>
                <div className="full-width-bg row">
                    <section className="row triangle col-12">
                        <div className="col">
                            <h4 id="list-item-4">Attachments</h4>
                        </div>
                    </section>
                </div>

                <div className="col">
                    <FileUpload
                        data={{
                            currentFiles,
                            existingFiles,
                            entityType: "ORDER",
                            interactionId: interactionData.interactionId,
                            permission: permissions.readOnly || wait
                        }}
                        handlers={{
                            setCurrentFiles,
                            setExistingFiles
                        }}
                    />
                </div>
            </Element>

            <Element name="fulfilmentSection">
                <div className="full-width-bg row">
                    <section className="row triangle col-12">
                        <div className="row col-12">
                            <div className="col-10">
                                <h4 id="list-item-4">Fulfilment</h4>
                            </div>
                            <div className="col-2 pb-2">
                                <span className="float-right">
                                    <button type="button"
                                        disabled={permissions?.readOnly} 
                                        className="btn btn-primary waves-effect waves-light btn-sm mt-1 float-right" onClick={() => { setAllowEditFulfilment(!allowEditFulfilment)}}>Edit</button>
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
                <div className={ allowEditFulfilment ? 'col' : 'col cursor-not-allowed'} style={allowEditFulfilment ? {} : {pointerEvents: 'none'}}>
                    {
                        complaintData && 
                        <FullfillmentTable
                            data = {{
                                complaintData,
                                allowEditFulfilment,
                                billingContractDetails
                            }}
                            handler = {{
                                setBillingContractDetails
                            }}
                        />
                    }
                </div>
            </Element>

            <Element name="contractDetailsSection">
                <div className="full-width-bg row">
                    <section className="row triangle col-12">
                        <div className="row col-12">
                            <div className="col-10">
                                <h4 id="list-item-4">Billing Contract Details - Preview</h4>
                            </div>
                        </div>
                    </section>
                </div>
                <div className='col'>
                    {
                        complaintData && 
                        <BillingContractDetails
                            data = {{
                                complaintData,
                                billingContractDetails
                            }}
                            handler = {{
                                setBillingContractDetails
                            }}
                        />
                    }
                </div>
            </Element>


            <div className="mt-2">
                <div className={`row justify-content-center mt-2 ${((permissions.readOnly || wait)) && 'd-none'}`}>
                    <button disabled={(permissions.readOnly || wait)} onClick={doOnSubmit} className="btn btn-primary waves-effect waves-light mr-2" >Submit</button>
                    <Link className="btn btn-secondary waves-effect waves-light" to={`${process.env.REACT_APP_BASE}/`}>Cancel</Link>
                </div>
            </div>

            <>
                <Modal isOpen={isReAssignOpen} contentLabel="Followup Modal" style={RegularModalCustomStyles}>
                    <div className="modal-content tick-det">
                        <div className="page-title-box">
                            <h4 className="page title">Re-assign for Work Order Number - {interactionData.interactionId}</h4>
                            <button type="button" className="close-btn" onClick={() => setIsReAssignOpen(false)}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body overflow-auto">
                            <form className="d-flex justify-content-center mt-2" onSubmit={handleOnReAssign}>
                                <div className="row">
                                    <div className="col-md-12 mb-3">
                                        <div className="row form-group">
                                            <label htmlFor="reAssignUser" className="col-form-label">User <span>*</span></label>
                                            <div className="col-md-10">
                                                <select required value={reAssignInputs.userId} id="reAssignUser" className="form-control" onChange={handleOnReAssignInputsChange}>
                                                    <option key="reAssignUser" value="">Select User</option>
                                                    {
                                                        reAssignUserLookup && reAssignUserLookup.map((user) => (
                                                            <option key={user.userId} value={user.userId}>{user.firstName} {user.lastName}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12 pl-2">
                                        <div className="form-group pb-1">
                                            <div className="d-flex justify-content-center">
                                                <button type="submit" className="btn btn-primary waves-effect waves-light mr-2">Submit</button>
                                                <button type="button" className="btn btn-secondary waves-effect waves-light" onClick={() => setIsReAssignOpen(false)}>Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </Modal>
            </>
        </>
    )
})

export default OrderDetails;