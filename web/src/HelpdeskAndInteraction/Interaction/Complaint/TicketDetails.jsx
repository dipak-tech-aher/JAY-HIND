/* eslint-disable react-hooks/exhaustive-deps */
import React, { memo, useEffect, useState, useContext } from 'react';
import { Link } from "react-router-dom";
import Modal from 'react-modal';
import FileUpload from '../../../common/uploadAttachment/fileUpload';
import { Element } from 'react-scroll';
import { post, get, put } from "../../../common/util/restUtil";
import { properties } from '../../../properties';
import { toast } from 'react-toastify';
import { AppContext } from "../../../AppContext";

import AddEditAppointmentForm from './AddEditAppointmentForm';
import { formatISODateDDMMMYY, formatISODateTime } from '../../../common/util/dateUtil';
import ServiceRequestActions from '../ServiceRequestActions';
import ResolveStatus from '../InteractionSearch/resolveStatus';
import ServiceRequestPreview from '../InteractionSearch/ServiceRequestPreview';
import moment from 'moment';
import { unstable_batchedUpdates } from 'react-dom';
import { getServiceCategoryMappingBasedOnProdType, RegularModalCustomStyles } from '../../../common/util/util';
import AddressPreview from '../CustomerAddressPreview';
import DesignatedStaffDetails from '../../Helpdesk/Interactions/shared/DesignatedStaffDetails';

const TicketDetails = memo((props) => {

    const { auth } = useContext(AppContext);
    const { ticketDetailsInputs, customerData, showInquiryCustomer, complaintData, permissions, interactionData, isRoleChangedByUserRef, currentFiles, existingFiles, currentWorkflowRef, currentTicketUserRef, entityRef, detailedViewItem, fromHelpDesk, helpDeskView } = props.data;
    const { handleOnTicketDetailsInputsChange, handleTicketDetailsSubmit, initialize, setTicketDetailsInputs, setCurrentFiles, setExistingFiles, setTicketDetailsError, setFlowValue, setPermissions } = props.handlers;
    const { error } = props;
    const [workflowLookup, setWorkflowLookup] = useState()
    const [wait, setWait] = useState(false);
    const [isFollowupOpen, setIsFollowupOpen] = useState(false);
    const [isReAssignOpen, setIsReAssignOpen] = useState(false);
    const [priorityLookup, setPriorityLookup] = useState();
    const [sourceLookup, setSourceLookup] = useState();
    const [roleLookup, setRoleLookup] = useState();
    const [userLookup, setUserLookup] = useState();
    const [currStatusLookup, setCurrStatusLookup] = useState();
    const [reAssignUserLookup, setReAssignUserLookup] = useState();
    const [problemTypeLookup, setProblemTypeLookup] = useState([]);
    const [problemCauseLookup, setProblemCauseLookup] = useState();
    const [serviceCategory, setServiceCategory] = useState("");
    const [filedAccess, setFieldAccess] = useState(false);
    const [attachmentRefresh, setAttachmentRefresh] = useState(false)

    // console.log('TicketDetails', ticketDetailsInputs, detailedViewItem)

    const [followupInputs, setFollowupInputs] = useState({
        priority: "",
        source: "",
        remarks: ""
    })

    const [reAssignInputs, setReAssignInputs] = useState({
        userId: ""
    })

    //const currStatusLookupRef = useRef()

    const hasFutureAppoinment = complaintData.latestAppointment ?
        new Date(`${complaintData.latestAppointment.toDate} ${complaintData.latestAppointment.toTime}`).getTime() > new Date().getTime() ?
            true :
            false :
        false

    const [isAppointmentEdit, setIsAppointmentEdit] = useState(false);

    const [isResolveOpen, setIsResolveOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [serviceRequestData, setServiceRequestData] = useState({});
    const [resolveData, setResolveData] = useState({});

    useEffect(() => {
        if (customerData) {
            
            post(properties.BUSINESS_ENTITY_API, [
                'TICKET_SOURCE',
                'TICKET_PRIORITY',
                'PROD_TYPE',
                //'INTERACTION_STATUS'
                'PROBLEM_TYPE',
                'PROBLEM_CAUSE'
            ])
                .then((response) => {
                    if (response.data) {
                        let lookupData = response.data;
                        unstable_batchedUpdates(() => {
                            setSourceLookup(lookupData['TICKET_SOURCE']);
                            setPriorityLookup(lookupData['TICKET_PRIORITY']);
                            if (['complaint', 'inquiry'].includes(interactionData.type)) {
                                let serviceCategoryMapping = getServiceCategoryMappingBasedOnProdType(lookupData['PROD_TYPE'], customerData?.serviceType || complaintData?.businessEntityCode);
                                setServiceCategory(serviceCategoryMapping?.serviceCategory ? serviceCategoryMapping?.serviceCategory : "")
                            }
                            setProblemTypeLookup(lookupData['PROBLEM_TYPE']);
                            setProblemCauseLookup(lookupData['PROBLEM_CAUSE'])
                        })
                        //currStatusLookupRef.current = lookupData['INTERACTION_STATUS'].filter((data) => ['ASSIGNED', 'NEW', 'CLOSED'].includes(data.code))
                    }
                }).catch(error => console.log(error))
                .finally()
        }
    }, [customerData])

    useEffect(()=>{
        if (['complaint', 'inquiry','service request'].includes(interactionData.type) && (complaintData.currStatus && complaintData.currStatus !== '') && permissions.readOnly === false) {
            const tktText = interactionData.isAdjustmentOrRefund ? 'Order' : interactionData.type === 'complaint' ? 'Incident' : interactionData.type === 'inquiry' ? 'Lead' : 'Order'
            
            get(`${properties.WORKFLOW_GET_STATE_API}?entityId=${interactionData?.interactionId}&entity=Interaction`)
            .then((response)=>{
                if(response.data){
                    const {flow, flwId } = response?.data;
                    setFlowValue(flow)
                    if (flow!== 'DONE'){
                        currentWorkflowRef.current = { flwId }
                        let statusArray = []
                        setWorkflowLookup(response.data)
                        console.log('node >>> 1',response.data)

                        response?.data?.entities && response?.data?.entities.map((node) => {
                            node?.status?.map((st) => {
                                statusArray.push(st)
                            })
                        })
                        let statusLookup = [...new Map(statusArray.map(item => [item["code"], item])).values()]
                        unstable_batchedUpdates(() => {
                            setRoleLookup([]);
                            setCurrStatusLookup(statusLookup)
                        })
                        if (wait) {
                            setWait(false)
                        }
    
                    }
                    else if (flow === 'DONE') {
                        setPermissions({
                            assignToSlef: false,
                            followup: false,
                            readOnly: true,
                            reAssign: false
                        })
                    }

                    if (complaintData.currStatus === "CLOSED") {
                        setPermissions({
                            assignToSlef: false,
                            followup: false,
                            readOnly: true,
                            reAssign: false
                        })
                    }
                }
            }).catch(error => console.log(error))
            .finally()
        }

    },[permissions,complaintData.currStatus])

/*
    useEffect(() => {
        if (['complaint', 'inquiry'].includes(interactionData.type) && complaintData.currStatus && complaintData.currStatus !== '' && permissions.readOnly === false) {
            const tktText = interactionData.isAdjustmentOrRefund ? 'Order' : interactionData.type === 'complaint' ? 'Incident' : interactionData.type === 'inquiry' ? 'Lead' : 'Order'
            
            get(`${properties.WORKFLOW_API}/${interactionData.interactionId}`)
                .then((response) => {
                    if (response.data) {
                        const { flow, flwId, transactionName } = response?.data;
                        setFlowValue(flow)
                        if (flow !== 'END' && flow !== 'WAIT') {
                            const { entity, status } = response?.data;
                            currentWorkflowRef.current = { flwId, transactionName }
                            let statusArray = []
                            setWorkflowLookup(response.data)
                            response?.data?.enities && response?.data?.enities.map((node) => {
                                node?.status?.map((st) => {
                                    statusArray.push(st)
                                })
                            })
                            let statusLookup = [...new Map(statusArray.map(item => [item["code"], item])).values()]
                            unstable_batchedUpdates(() => {
                                setRoleLookup([]);
                                setCurrStatusLookup(statusLookup)
                            })
                            if (wait) {
                                setWait(false)
                            }
                        }
                        else if (flow === 'END') {
                            setPermissions({
                                assignToSlef: false,
                                followup: false,
                                readOnly: true,
                                reAssign: false
                            })
                        }
                        else {

                            if (flow === 'WAIT') {
                                setWait(true)
                                if (complaintData && auth && auth.user && complaintData.taskStatus !== 'ERROR'
                                    && permissions.assignToSlef === false && permissions.readOnly === false
                                    && complaintData.currUser === auth.user.userId
                                    && complaintData.currRole === auth.currRoleId
                                    && complaintData.currEntity === auth.currDeptId) {

                                    toast.info('This ' + tktText + ' cannot     be edited currently as system is waiting for a background process to complete.')
                                } else {
                                    setWait(false)
                                }
                            } else {
                                //toast.info(`${response.message}`)
                                setWait(false)
                            }
                        }
                        if (complaintData.currStatus === "CLOSED") {
                            setPermissions({
                                assignToSlef: false,
                                followup: false,
                                readOnly: true,
                                reAssign: false
                            })
                        }
                    }
                })
                .finally()
        }
    }, [permissions])
*/
    const getUsersBasedOnRole = (source = undefined) => {
        
        const data = source ? {
            roleId: currentTicketUserRef.current.currRole,
            deptId: currentTicketUserRef.current.currDept
        } : {
            roleId: ticketDetailsInputs.assignRole,
            deptId: entityRef.unitId
        }
        get(`${properties.USER_LOOKUP_API}?role-id=${data.roleId}&dept="${data.deptId}"`)
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


    useEffect(() => {
        if (isAppointmentEdit) {
            const { fromDate, toDate, fromTime, toTime, contactNo, contactPerson, remarks } = complaintData.latestAppointment;
            setTicketDetailsInputs({
                ...ticketDetailsInputs,
                fromDate,
                fromTime: fromTime.slice(0, 5),
                toDate,
                toTime: toTime.slice(0, 5),
                contactPerson,
                contactNumber: contactNo,
                appointmentRemarks: remarks
            })
        }
        else {
            setTicketDetailsInputs({
                ...ticketDetailsInputs,
                fromDate: "",
                fromTime: "",
                toDate: "",
                toTime: "",
                contactPerson: "",
                contactNumber: "",
                appointmentRemarks: ""
            })
        }
    }, [isAppointmentEdit])

    const handleParentModalState = () => {
        setIsPreviewOpen(false);
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
        const { intxnId } = complaintData;
        let payload = {
            priorityCode: priority,
            slaCode: source,
            remarks,
            intxnStatus: 'NEW',
            intxnId: intxnId,
            attachments: [...existingFiles.map((currentFiles) => currentFiles.entityId), ...currentFiles.map((currentFiles) => currentFiles.entityId)]
        }
        
        post(`${properties.INTERACTION_API}/followUp`, { ...payload })
            .then((response) => {
                toast.success("Follow Up Created Successfully");
                setIsFollowupOpen(false);
                setFollowupInputs({
                    priority: "",
                    source: "",
                    remarks: ""
                })
                initialize();
                setAttachmentRefresh(true)
            }).catch(error => console.log(error))
            .finally(() => {
                
            })
    }

    const handleOnAssignToSelf = () => {
        
        put(`${properties.INTERACTION_API}/assignSelf/${complaintData.intxnId}`)
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
        handleTicketDetailsSubmit(e, isAppointmentEdit);
        if (isAppointmentEdit)
            setIsAppointmentEdit(false);
    }

    return (
        <>
            <Element name="ticketDetailsSection">
                <div className="full-width-bg row">
                    <section className="row triangle col-12">
                        <div className="col">
                            <h4 id="list-item-1">{fromHelpDesk ? 'Interaction' : interactionData.isAdjustmentOrRefund ? 'Order' : interactionData.type === 'complaint' ? 'Incident' : interactionData.type === 'inquiry' ? 'Lead' : 'Order'} Details - {interactionData.interactionId}</h4>
                        </div>
                        <div className="col-auto m-auto assig-btn">
                            {
                                ['complaint', 'inquiry'].includes(interactionData.type) ? (
                                    <>
                                        {
                                            (complaintData.woType === 'FAULT' && (complaintData.currStatus === 'FAILED' || (complaintData.taskStatus && complaintData.taskStatus === 'ERROR')) && complaintData.currUser === auth.user.userId && !permissions.readOnly) ?
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary waves-effect waves-light btn-sm mr-1"
                                                    onClick={() => {
                                                        setIsResolveOpen(true); setResolveData({
                                                            accountId: interactionData.accountId,
                                                            customerId: interactionData.customerId,
                                                            intxnId: interactionData.interactionId,
                                                            serviceId: interactionData.serviceId,
                                                            currStatus: complaintData.currStatus,
                                                            woType: complaintData.woType,
                                                            intxnType: complaintData.intxnType && complaintData.intxnType
                                                        });
                                                    }}>
                                                    Resolve
                                                </button>
                                                :
                                                <></>
                                        }
                                        {
                                            complaintData.currStatus !== "CLOSED" ?
                                                <>
                                                    <button type="button" className={`btn btn-labeled btn-primary btn-sm mr-1 ml-1 ${!permissions.assignToSlef && 'd-none'}`} onClick={handleOnAssignToSelf} >
                                                        Assign to Self
                                                    </button>
                                                    <button type="button" className={`btn btn-outline-primary waves-effect waves-light btn-sm mr-1 ${(!(permissions.reAssign) || wait) && 'd-none'}`} onClick={() => setIsReAssignOpen(true)}>
                                                        Re-Assign
                                                    </button>
                                                    <button type="button" className={`btn btn-labeled btn-primary btn-sm  ${(!permissions.followup) && 'd-none'}`} onClick={() => setIsFollowupOpen(true)}>
                                                        <small>Add Followup</small>
                                                    </button>
                                                </>
                                                :
                                                <></>
                                        }

                                    </>
                                )
                                    : (
                                        <ServiceRequestActions
                                            data={{
                                                row: {
                                                    accountId: interactionData?.accountId,
                                                    customerId: interactionData?.customerId,
                                                    intxnId: interactionData?.interactionId,
                                                    serviceId: interactionData?.serviceId,
                                                    currStatus: complaintData?.currentStatusDesc && complaintData?.currentStatusDesc,
                                                    intxnType: complaintData?.intxnType && complaintData?.intxnType,
                                                    woType: complaintData?.workOrderType && complaintData?.workOrderType?.code,
                                                    externalRefSys1: complaintData?.externalRefSys1 && complaintData?.externalRefSys1,
                                                    externalRefNo1: complaintData?.externalRefNo1 && complaintData?.externalRefNo1,
                                                    woTypeDescription: complaintData?.workOrderType && complaintData?.workOrderType?.description,
                                                    accessNbr: customerData && customerData?.serviceNumber,
                                                    serviceTypeDesc: customerData && customerData?.serviceTypeDesc,
                                                    createdAt: complaintData && complaintData?.ticketCreatedOn,
                                                    createdBy: complaintData && complaintData?.ticketCreatedBy  
                                                },
                                                permissions,
                                                    wait
                                            }}
                                            handlers={{
                                                setIsResolveOpen,
                                                setIsPreviewOpen,
                                                setResolveData,
                                                setServiceRequestData,
                                                handleOnAssignToSelf, 
                                                setIsReAssignOpen, 
                                                setIsFollowupOpen 
                                            }}
                                        />
                                    )
                            }
                        </div>
                    </section>
                </div>
                <div className="row pl-2">
                    <div className="col-12">
                        <div className="row pt-1">
                           {!fromHelpDesk && <div className="col-md-3">
                                <div className="form-group">
                                    <label htmlFor="ticketNo" className="col-form-label">{fromHelpDesk ? 'Interaction' : (interactionData.isAdjustmentOrRefund ? 'Order' : interactionData.type === 'complaint' ? 'Incident' : interactionData.type === 'inquiry' ? 'Lead' : 'Order')} Number</label>
                                    <p>{/*interactionData.isAdjustmentOrRefund ? 'SR' : interactionData.type === 'complaint' ? 'TKT' : interactionData.type === 'inquiry' ? 'INQ' : 'SR'}{*/interactionData.interactionId}</p>
                                </div>
                            </div>}
                            {
                                interactionData.type === 'complaint' ? (
                                    <>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="ticketType" className="col-form-label">{fromHelpDesk ? 'Interaction' : 'Ticket'} Type</label>
                                                <p>{complaintData?.ticketType}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="serviceOrProduct" className="col-form-label">Problem Category</label>
                                                <p>{complaintData && complaintData?.categoryDescription}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                {console.log()}
                                                <label htmlFor="commentType" className="col-form-label">Problem Type</label>
                                                {
                                                    fromHelpDesk && helpDeskView === 'ASSIGNED' ? (
                                                        <select value={ticketDetailsInputs?.commentType || detailedViewItem?.commentType} id="commentType" className={`form-control `} onChange={handleOnTicketDetailsInputsChange}>
                                                            <option key="commentType" value="" data-object={JSON.stringify({})}>Select Problem Type</option>
                                                            {
                                                                problemTypeLookup && problemTypeLookup.map((e) => (
                                                                    <option key={e.code} value={e.code} data-object={JSON.stringify(e)}>{e.description}</option>
                                                                ))
                                                            }
                                                        </select>
                                                    ) :
                                                    <p>{(complaintData && complaintData.commentTypeDescription) ? complaintData.commentTypeDescription:
                                                        (detailedViewItem && detailedViewItem.problemTypeDescription)? detailedViewItem.problemTypeDescription.description : (complaintData && complaintData.problemTypeDescription) ? complaintData.problemTypeDescription : ''}</p>
                                                        /* <p>{(detailedViewItem && detailedViewItem.problemTypeDescription) ? detailedViewItem.problemTypeDescription.description : (complaintData && complaintData.problemTypeDescription) ? complaintData.problemTypeDescription : ''}</p>*/


                                                }
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group  p-0 m-0">
                                                <label htmlFor="commentCause" className="col-form-label">Problem Cause</label>
                                                {
                                                    fromHelpDesk && helpDeskView === 'ASSIGNED' ? (
                                                        <select value={detailedViewItem?.commentCause} id="commentCause" className={`form-control`} onChange={handleOnTicketDetailsInputsChange}>
                                                            <option key="commentCause" value="" data-object={JSON.stringify({})}>Select Problem Cause</option>
                                                            {
                                                                problemCauseLookup && problemCauseLookup.map((e) => (

                                                                    <option key={e.code} value={e.code} data-object={JSON.stringify(e)}>{e.description}</option>
                                                                ))
                                                            }
                                                        </select>
                                                    )
                                                        :
                                                        <p>{(complaintData && complaintData.commentCauseDescription) ? complaintData.commentCauseDescription:
                                                            (detailedViewItem && detailedViewItem.problemCauseDescription)? detailedViewItem.problemCauseDescription.description : (complaintData && complaintData.problemCauseDescription) ? complaintData.problemCauseDescription : ''}</p>
                                                       /* <p>{(detailedViewItem && detailedViewItem.problemCauseDescription) ? detailedViewItem.problemCauseDescription.description : (complaintData && complaintData.problemCauseDescription) ? complaintData.problemCauseDescription : ''}</p>*/
                                                }
                                            </div>
                                        </div>
                                    </>
                                )
                                    : interactionData.type === 'inquiry' ? (
                                        <>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="ticketType" className="col-form-label">{fromHelpDesk ? 'Interaction' : 'Ticket'} Type</label>
                                                    <p>{complaintData?.ticketType}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="serviceOrProduct" className="col-form-label">Inquiry Category</label>
                                                    <p>{complaintData && complaintData?.categoryDescription}</p>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="enquiryAbout" className="col-form-label">Inquiry About</label>
                                                    <p>{complaintData && complaintData?.aboutDescription}</p>
                                                </div>
                                            </div>
                                        </>
                                    )
                                        : (
                                            <>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="woType" className="col-form-label">Work Order Type</label>
                                                        <p>{complaintData?.workOrderType && complaintData?.workOrderType?.description}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="serviceNbr" className="col-form-label">Access Number</label>
                                                        <p>{customerData && customerData?.serviceNumber}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label htmlFor="serviceTyoe" className="col-form-label">Service Type</label>
                                                        <p>{customerData && customerData?.serviceTypeDesc}</p>
                                                    </div>
                                                </div>
                                            </>
                                        )
                            }
                            {
                                ['complaint', 'inquiry'].includes(interactionData.type) && (
                                    <>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="crmCustomerNo" className="col-form-label">Service Type</label>
                                                <p>{complaintData && complaintData?.serviceTypeDesc}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="ticketServiceType" className="col-form-label">Service Category</label>
                                                <p>{serviceCategory}</p>
                                            </div>
                                        </div>
                                        {!fromHelpDesk && <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="ticketUserLocation" className="col-form-label">{fromHelpDesk ? 'Interaction' : 'Ticket'} Location</label>
                                                <p>{complaintData?.ticketUserLocation}</p>
                                            </div>
                                        </div>}
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="serviceOrProduct" className="col-form-label">{fromHelpDesk ? 'Interaction' : 'Ticket'} Channel</label>
                                                <p>{complaintData?.ticketChannel && complaintData?.ticketChannel}</p>
                                            </div>
                                        </div>
                                        {!fromHelpDesk && <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="ticketSource" className="col-form-label">{fromHelpDesk ? 'Interaction' : 'Ticket'} Source</label>
                                                <p>{complaintData?.ticketSource}</p>
                                            </div>
                                        </div>}
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="ticketPriority" className="col-form-label">{fromHelpDesk ? 'Interaction' : 'Ticket'} Priority</label>
                                                <p>{complaintData?.ticketPriority}</p>
                                            </div>
                                        </div>
                                        {/*
                                            fromHelpDesk &&
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="ticketPriority" className="col-form-label">Interaction Severity</label>
                                                    <p>{complaintData?.sevearity}</p>
                                                </div>
                                            </div>
                                */ }
                                    </>
                                )
                            }
                            {
                                ['complaint'].includes(interactionData.type) && (
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="preference" className="col-form-label">Contact Preference</label>
                                            <p>{complaintData && complaintData?.contactPreferenceDescription}</p>
                                        </div>
                                    </div>
                                )
                            }
                            {
                                ['inquiry'].includes(interactionData.type) && (
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="preference" className="col-form-label">Contact Preference</label>
                                            <p>{customerData && customerData?.contactTypeDesc}</p>
                                        </div>
                                    </div>
                                )
                            }
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label htmlFor="createdOn" className="col-form-label">Created On</label>
                                    <p>{complaintData?.ticketCreatedOn}</p>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label htmlFor="createdBy" className="col-form-label">Created By</label>
                                    <p>{complaintData?.ticketCreatedBy}</p>
                                </div>
                            </div>
                            <div className="col-md-3">
                                <div className="form-group">
                                    <label htmlFor="currStatus" className="col-form-label">{interactionData.type === 'service request' && 'SR'} Current Status</label>
                                    <p>{(complaintData?.currentStatusDesc && complaintData?.currentStatusDesc) || (complaintData?.currStatusDesc && complaintData?.currStatusDesc?.description)}</p>
                                </div>
                            </div>
                            {
                                ['complaint', 'inquiry'].includes(interactionData.type) && (
                                    <>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="currDeptRole" className="col-form-label">Current Department/Role</label>
                                                <p>{complaintData?.currentDeptRoleDesc && complaintData?.currentDeptRoleDesc}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="currentUser" className="col-form-label">Current User</label>
                                                <p>{complaintData?.currentUser}</p>
                                            </div>
                                        </div>
                                    </>
                                )
                            }
                            {/* <div className="col-md-3">
                                <div className="form-group">
                                    <label htmlFor="ticketType" className="col-form-label">Request Type</label>
                                    <p className="text-capitalize">{interactionData.type}</p>
                                </div>
                            </div> */}
                        </div>
                        {

                            ['complaint', 'inquiry'].includes(interactionData.type) && (
                                <div className="row mt-2">
                                    <div className="col-md-12 form-group detailsbg-grey">
                                        <label className="col-form-label pt-0">Ticket Description</label>
                                        <textarea disabled={true} className="form-control mb-2" rows="3" value={complaintData?.ticketDescription}></textarea>
                                    </div>
                                </div>
                            )
                        }

                        {
                            ['complaint', 'inquiry','service request'].includes(interactionData.type) && (
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
                                                    <label htmlFor="assignRole" className="col-form-label">Assign to Department/Role<span>*</span></label>
                                                    <select disabled={permissions.readOnly || wait} id="assignRole" value={ticketDetailsInputs.assignRole}
                                                        onChange={(e) => {
                                                            handleOnTicketDetailsInputsChange(e)
                                                            setTicketDetailsError({ ...error, [e.target.id]: "" })
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
                                                                <option key="survey" value="">Select Servey Required</option>
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
                        {
                            ['complaint', 'service request'].includes(interactionData.type) &&
                            !!Object.keys(complaintData.realTimeDetails).length && (
                                <>
                                    <div className="row inner-title">
                                        <div className="col-12 pl-2 bg-light border">
                                            <h5 className="text-primary">UNN Status</h5>
                                        </div>
                                    </div>
                                    <div className="row pt-1">
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="ticketNo" className="col-form-label">{fromHelpDesk ? 'Interaction' : 'Ticket'} Number</label>
                                                <p>{complaintData?.realTimeDetails?.ticketNumber}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="status" className="col-form-label">Status</label>
                                                <p>{complaintData?.realTimeDetails?.status}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="currentDept" className="col-form-label">Current department</label>
                                                <p>{complaintData?.realTimeDetails?.currentDepartment}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group  p-0 m-0">
                                                <label htmlFor="currentRole" className="col-form-label">Current Role</label>
                                                <p>{complaintData?.realTimeDetails?.currentRole}</p>
                                            </div>

                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="currentUser" className="col-form-label">Current User</label>
                                                <p>{complaintData?.realTimeDetails?.currentUser}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="currentUser" className="col-form-label">Created Date</label>
                                                <p>{complaintData?.realTimeDetails?.createdAt}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="currentUser" className="col-form-label">UNN Problem Code</label>
                                                <p>{complaintData?.realTimeDetails?.unnProblemCode}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <label htmlFor="inputState" className="col-form-label">{fromHelpDesk ? 'Interaction' : 'Ticket'} Description</label>
                                                <textarea className="form-control" readOnly="true" maxLength='2500' id="remarks" value={complaintData?.realTimeDetails?.remarks} name="remarks" rows="3">

                                                </textarea>
                                            </div>
                                        </div>
                                        {/* <div className="col-md-12">
                                            <div className="form-group detailsbg-grey">
                                                <label htmlFor="remarks" className="col-form-label pt-0">Remarks</label>
                                                <p>{complaintData.realTimeDetails.remarks}</p>
                                            </div>
                                        </div> */}
                                        {/* <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="remarksCreatedBy" className="col-form-label">Remark Created by</label>
                                                <p>{complaintData.realTimeDetails.remarkCreatedBy}</p>
                                            </div>
                                        </div> */}
                                        {/* <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="dept" className="col-form-label">Department</label>
                                                <p>{complaintData.realTimeDetails.department}</p>
                                            </div>
                                        </div> */}
                                    </div>
                                </>
                            )
                        }
                    </div>
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
                {
                    showInquiryCustomer === false ?

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
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="accountNbr" className="col-form-label">Account Number</label>
                                            <p>{customerData && customerData?.accountNumber}</p>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group  p-0 m-0">
                                            <label htmlFor="AccountName" className="col-form-label">Account Name</label>
                                            <p>{customerData && customerData?.accountName}</p>
                                        </div>

                                    </div>
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="serviceNbr" className="col-form-label">Access Number</label>
                                            <p>{customerData && customerData?.serviceNumber}</p>
                                        </div>
                                    </div>
                                    {/* <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="servieType" className="col-form-label">Service type</label>
                                            <p>{customerData && customerData.serviceType}</p>
                                        </div>
                                    </div> */}
                                    {/*  Commented for Demo Purpose 
                                    <div className="col-md-3">
                                        <div className="form-group">
                                            <label htmlFor="planName" className="col-form-label">Plan Name</label>
                                            <p>{customerData && customerData.planName}</p>
                                        </div>
                                    </div> */}
                                    <div className="col-md-3">
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
                        :
                        <>
                            <div className="row pt-1">
                                <div className="col-12 p-2">
                                    <div className="row pt-1">
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="crmCustomerNo" className="col-form-label">Customer Name</label>
                                                <p>{customerData && customerData?.lastName} {customerData && customerData?.firstName}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="crmCustomerNo" className="col-form-label">Customer Type</label>
                                                <p>{customerData && customerData?.custType === 'RESIDENTIAL' ? 'Residential' : customerData?.custType === 'BUSINESS' ? 'Business' : 'Government'}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="crmCustomerNo" className="col-form-label">Email</label>
                                                <p>{customerData && customerData?.contact?.email}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="crmCustomerNo" className="col-form-label">Contact Number</label>
                                                <p>{customerData && customerData?.contact?.contactNo}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                }
                {
                    (showInquiryCustomer === false && customerData && customerData?.address) ?
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
            {
                ['complaint', 'inquiry'].includes(interactionData.type) &&
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
                                entityType: interactionData.type.toUpperCase(),
                                interactionId: interactionData.interactionId,
                                permission: permissions.readOnly || wait,
                                refresh:attachmentRefresh
                            }}
                            handlers={{
                                setCurrentFiles,
                                setExistingFiles
                            }}
                        />
                    </div>
                </Element>
            }
            {
                interactionData.type === 'complaint' ||  interactionData.type === 'service request'?
                    <Element name="AppointmentSection">
                        <form className="detailsbg-grey" onSubmit={doOnSubmit}>
                            {filedAccess && <div className="full-width-bg row mt-2">
                                <section className="triangle col-12">
                                    <h4 id="list-item-5" className="pl-1">Appointments</h4>
                                </section>
                            </div>}
                            {filedAccess && <div className="row">
                                <div className="col-12 pl-2 pt-1 pr-2 pb-0 mb-0">
                                    {
                                        complaintData.latestAppointment && hasFutureAppoinment && isAppointmentEdit === false &&
                                        <ul key="apptul" className="event-list">
                                            <li key="appt1">
                                                <div className="col-12 row">
                                                    <div className="col-2 text-center bggrey">
                                                        <h3 className="bold">{formatISODateDDMMMYY(complaintData.latestAppointment.fromDate)}</h3>
                                                        <h5 className="pt-2">{moment(`${complaintData.latestAppointment.fromDate} ${complaintData.latestAppointment.fromTime}`).format('hh:mm:ss A')}</h5>

                                                    </div>
                                                    <div className="col-10 bg-light p-2">
                                                        <div className="row">
                                                            <div className="col">
                                                                <p><span className="bold">Comments : &nbsp;</span>{complaintData.latestAppointment.remarks}</p>
                                                                <p><span className="bold">Start :&nbsp;</span>{formatISODateTime(complaintData.latestAppointment.fromDate + " " + complaintData.latestAppointment.fromTime)}</p>
                                                                <p><span className="bold">End :&nbsp;</span>{formatISODateTime(complaintData.latestAppointment.toDate + " " + complaintData.latestAppointment.toTime)}</p>
                                                            </div>
                                                            {
                                                                !permissions.readOnly && !wait &&
                                                                <div className="col-auto">
                                                                    <button type="button" className="btn btn-primary btn-sm" onClick={() => setIsAppointmentEdit(!isAppointmentEdit)}><span className="fa fa-pen p-0 text-white" /> Edit</button>
                                                                </div>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        </ul>
                                    }
                                    {
                                        !hasFutureAppoinment && (permissions.readOnly === true || wait === true) &&
                                        <div className="col-12 msg-txt">
                                            <p className="pt-2 pb-1">No Latest Appointment Found.</p>
                                        </div>
                                    }
                                </div>
                                {
                                    (hasFutureAppoinment === false || isAppointmentEdit) && permissions.readOnly !== true && wait !== true &&
                                    <AddEditAppointmentForm
                                        data={{
                                            ticketDetailsInputs,
                                            isAppointmentEdit,
                                            permissions
                                        }}
                                        handlers={{
                                            handleOnTicketDetailsInputsChange,
                                            setIsAppointmentEdit
                                        }}
                                    />
                                }
                            </div>}
                            <div className={`row justify-content-center mt-2 ${(permissions.readOnly || wait) && 'd-none'}`}>
                                <button disabled={permissions.readOnly} type="submit" className="btn btn-primary waves-effect waves-light mr-2" >Submit</button>
                                <Link className="btn btn-secondary waves-effect waves-light" to={`${process.env.REACT_APP_BASE}/`}>Cancel</Link>
                            </div>
                        </form>
                    </Element>
                    :
                    <div className={`row justify-content-center mt-2 ${((permissions.readOnly || wait) || interactionData.type === 'service request') && 'd-none'}`}>
                        <button disabled={(permissions.readOnly || wait)} onClick={doOnSubmit} className="btn btn-primary waves-effect waves-light mr-2" >Submit</button>
                        <Link className="btn btn-secondary waves-effect waves-light" to={`${process.env.REACT_APP_BASE}/`}>Cancel</Link>
                    </div>
            }
            {filedAccess && <>{
                fromHelpDesk &&
                <DesignatedStaffDetails
                    data={{
                        detailedViewItem,
                        helpDeskView
                    }}
                />
            }</>}
            {
                ['complaint', 'inquiry'].includes(interactionData.type) &&
                <>
                    <Modal isOpen={isFollowupOpen} contentLabel="Followup Modal" style={RegularModalCustomStyles}>
                        <div className="modal-content tick-det">
                            <div className="page-title-box">
                                <h4 className="page title">Followup for {interactionData.type === 'complaint' ? 'Ticket Number' : interactionData.type === 'inquiry' ? 'Inquiry Number' : 'Service Request Number'} {interactionData.interactionId}</h4>
                                <button type="button" className="close-btn" onClick={() => setIsFollowupOpen(false)}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body overflow-auto">
                                <form className="d-flex justify-content-center" onSubmit={handleOnAddFollowup}>
                                    <div className="col-md-12 row form-group detailsbg-grey">
                                        <div className="col-md-3 pl-0">
                                            <div className="form-group">
                                                <label htmlFor="priority" className="col-form-label">Priority<span>*</span></label>
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
                                        <div className="col-md-3">
                                            <div className="form-group">
                                                <label htmlFor="source" className="col-form-label">Source<span>*</span></label>
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
                                        <div className="col-md-12 p-0">
                                            <div className="form-group">
                                                    <h4 id="list-item-4">Attachments</h4>
                                                <div className="col">
                                                    <FileUpload
                                                        data={{
                                                            currentFiles,
                                                            existingFiles,
                                                            entityType: interactionData.type.toUpperCase(),
                                                            interactionId: interactionData.interactionId,
                                                            permission:  wait,
                                                            refresh:attachmentRefresh
                                                        }}
                                                        handlers={{
                                                            setCurrentFiles,
                                                            setExistingFiles
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-12 p-0">
                                            <div className="form-group ">
                                                <label htmlFor="inputState" className="col-form-label pt-0">Remarks</label>
                                                <textarea className="form-control" maxLength='2500' id="remarks" value={followupInputs.remarks} onChange={handleOnFollowupInputsChange} name="remarks" rows="4"></textarea>
                                                <span>Maximum 2500 characters</span>
                                            </div>
                                        </div>
                                        <div className="col-md-12 pl-2">
                                            <div className="form-group pb-1">
                                                <div className="d-flex justify-content-center">
                                                    <button type="submit" className="btn btn-primary waves-effect waves-light mr-2">Add Followup</button>
                                                    <button type="button" className="btn btn-secondary waves-effect waves-light" onClick={() => setIsFollowupOpen(false)}>Cancel</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </Modal>
                    <Modal isOpen={isReAssignOpen} contentLabel="Followup Modal" style={RegularModalCustomStyles}>
                        <div className="modal-content tick-det">
                            <div className="page-title-box">
                                <h4 className="page title">Re-assign for {interactionData.type === 'complaint' ? 'Ticket Number' : interactionData.type === 'inquiry' ? 'Inquiry Number' : 'Service Request Number'} {interactionData.interactionId}</h4>
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
                                                    <button type="button" className="btn btn-secondary waves-effect waves-light" onClick={() => setIsFollowupOpen(false)}>Cancel</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </Modal>
                </>
            }
            {
                isResolveOpen &&
                <ResolveStatus value={resolveData} isOpen={isResolveOpen} setIsOpen={setIsResolveOpen} refreshSearch={initialize} />
            }
            {
                isPreviewOpen &&
                <ServiceRequestPreview data={{ serviceRequestData }} stateHandlers={{ handleParentModalState }} />
            }
        </>
    )
})

export default TicketDetails;