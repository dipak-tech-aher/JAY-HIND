import React, { useCallback, useEffect, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';
import { object, string } from 'yup';

import DynamicTable from '../../common/table/DynamicTable';
import { properties } from '../../properties';
import { post, put, get } from '../../common/util/restUtil';
import { AddEditMapWorkflowColumns, SelectConfirmMappingTemplateColumns } from './AddEditMapWorkflowColumns';
import ViewWorkflowModal from './ViewWorflowModal';
import ViewWorkflowModalTemplate from './ViewWorkflowTemplateModal';
import Swal from 'sweetalert2';
import moment from 'moment';
import { Link } from 'react-router-dom';

const AddEditMapWorkflow = (props) => {
    const propsLocationState = props?.location?.state;
    const isEdit = propsLocationState?.source === 'Edit' ? true : false;
    const initialValues = {
        templateMapName: "",
        module: "",
        serviceType: "",
        serviceCategory: "",
        interactionType: "",
        interactionCategory: "",
        intxnType: "",
        intxnCategory: "",
        priority: "",
        customerType: "",
        customerCategory: "",
        templateCategory: "",
        userFamily: "",
        userGroup: "",
        orderType: "",
        orderCategory: "",
    };

    const initialModuleRequirements = {
        serviceType: true,
        serviceCategory: true,
        interactionType: true,
        interactionCategory: true,
        priority: false,
        customerType: false,
        userFamily: false,
        userGroup: false,
        orderType: false,
        orderCategory: false,
        customerCategory: false,
    };
    const [initialModuleRequirement, setInitialModuleRequirement] = useState(initialModuleRequirements)
    const [addEditMapWorkflowInputs, setAddEditMapWorkflowInputs] = useState(initialValues);
    const [isTemplatedListChecked, setIsTemplatedListChecked] = useState({});
    const [addeEditMapWorkflowError, setAddeEditMapWorkflowError] = useState({});
    const [templateList, setTemplateList] = useState([]);
    const selectedTemplateRef = useRef({});
    const allEntityTypesRef = useRef({});
    const [confirmedTemplateList, setConfirmedTemplateList] = useState([]);
    const [isViewWorkflowOpen, setIsViewWorkflowOpen] = useState(false);
    const [isViewWorkflowTemplateOpen, setIsViewWorkflowTemplateOpen] = useState(false);

    const [disableInteractionEntityTypes, setDisableInteractionEntityTypes] = useState();
    const SuccessfullyMappedUIRef = useRef();

    const [AddEditMapWorkflowValidationSchema, setAddEditMapWorkflowValidationSchema] = useState(object().shape({
        templateMapName: string().required("Template Map Name is required."),
        module: string().required("Module is required."),
        serviceType: string().required("Service Type is required."),
        interactionType: string().required('Interaction Type is required.'),
        priority: string().required('Priority Type is required.'),
        customerType: string().required('Customer Type is required.'),
    }))

    const [entityTypes, setEntityTypes] = useState({
        module: [],
        serviceType: [],
        serviceCategory: [],
        interactionType: [],
        interactionCategory: [],
        priority: [],
        customerType: [],
        customerCategory: [],
        orderCategory: [],
        userFamily: [],
        userGroup: [],
        orderType: [],
    });

    const getEntityLookup = useCallback(() => {
        return new Promise((resolve, reject) => {
            get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=WORKFLOW_MODULE,HELPDESK_SOURCE,SERVICE_TYPE,INTXN_TYPE,TICKET_PRIORITY,CUSTOMER_TYPE,CUSTOMER_CATEGORY,INTXN_CATEGORY,ORDER_CATEGORY,USER_GROUP,USER_FAMILY,PROD_SUB_TYPE,ORDER_TYPE')
                .then((response) => {
                    const { data } = response;
                    allEntityTypesRef.current = data;
                    setEntityTypes({
                        ...entityTypes,
                        module: data['WORKFLOW_MODULE'],
                        interactionType: data['INTXN_TYPE'],
                        interactionCategory: data['INTXN_CATEGORY'],
                        priority: data['TICKET_PRIORITY'],
                        customerType: data['CUSTOMER_TYPE'],
                        customerCategory: data['CUSTOMER_CATEGORY'],
                        orderCategory: data['ORDER_CATEGORY'],
                        orderType: data['ORDER_TYPE'],
                        serviceType: data['SERVICE_TYPE'],
                        serviceCategory: data['PROD_SUB_TYPE'],
                        userGroup: data['USER_GROUP'],
                        userFamily: data['USER_FAMILY'],
                    });
                    resolve(true);
                })
                .catch(error => {
                    console.error(error);
                    reject(false);
                })
                .finally()
        })
    }, [])

    const getTemplateList = () => {

        const requestBody = {
            ...addEditMapWorkflowInputs
        }

        //console.log('data.........', requestBody)
        post(`${properties.WORKFLOW_DEFN_API}/workflow-mapping-list?editMapped=true`, requestBody)
            .then((response) => {
                const { status, data } = response;
                if (status === 200 && data) {
                    setTemplateList(data);
                }
            })
            .catch((error) => {
                console.error(error);
            })
            .finally()
    }

    const handleOnEditTemplate = useCallback(() => {
        const { mappingName, module, workflowId } = propsLocationState.data;
        unstable_batchedUpdates(() => {
            setAddEditMapWorkflowInputs({
                ...addEditMapWorkflowInputs,
                templateMapName: mappingName,
                module,
                serviceType: propsLocationState?.data?.mapping?.serviceType,
                interactionType: propsLocationState?.data?.mapping?.interactionType,
                priority: propsLocationState?.data?.mapping?.priority,
                customerType: propsLocationState?.data?.mapping?.customerType,
            })
            selectedTemplateRef.current = {
                workflowId,
                workflowName: mappingName
            }
            setIsTemplatedListChecked({
                workflowId,
                checked: true
            })
            getTemplateList();
        })
    }, [])

    useEffect(() => {
        const entityResponse = getEntityLookup();
        entityResponse.then((resolved, rejected) => {
            if (resolved) {
                if (isEdit) {
                    handleOnEditTemplate();
                }
                else {

                }
            }
        })
            .catch(error => {
                console.error(error);
            })
    }, [propsLocationState, getEntityLookup, isEdit, handleOnEditTemplate])

    useEffect(() => {
        if (addEditMapWorkflowInputs.module && addEditMapWorkflowInputs.module?.includes('HELPDESK')) {
            setDisableInteractionEntityTypes(true);
            setAddeEditMapWorkflowError({
                ...addeEditMapWorkflowError,
                interactionType: "",
                priority: "",
                customerType: ""
            })
        }
        else {
            setDisableInteractionEntityTypes(false)
        }
    }, [addEditMapWorkflowInputs.module])

    const handleInputChange = (e) => {
        const { target } = e;
        unstable_batchedUpdates(() => {
            if (target.id === 'module') {
                if (target.value) {
                    if (target.value === 'INTXN') {
                        setInitialModuleRequirement(initialModuleRequirements);
                        setAddEditMapWorkflowValidationSchema(object().shape({
                            templateMapName: string().required("Template Map Name is required."),
                            module: string().required("Module is required."),
                            serviceType: string().required("Service type is required."),
                            serviceCategory: string().required("Service category is required."),
                            interactionType: string().required('Interaction type is required.'),
                            interactionCategory: string().required('Interaction category is required.')
                        }))
                    }
                    else if (target.value === 'KnowledgeBaseSelfCare') {
                        setInitialModuleRequirement(initialModuleRequirements);
                        setAddEditMapWorkflowValidationSchema(object().shape({
                            templateMapName: string().required("Template Map Name is required."),
                            module: string().required("Module is required."),
                            serviceType: string().required("Service type is required."),
                            serviceCategory: string().required("Service category is required."),
                            interactionType: string().required('Interaction type is required.'),
                            interactionCategory: string().required('Interaction category is required.')
                        }))
                    }
                    else if (target.value === 'KnowledgeBaseMobileApp') {
                        setInitialModuleRequirement(initialModuleRequirements);
                        setAddEditMapWorkflowValidationSchema(object().shape({
                            templateMapName: string().required("Template Map Name is required."),
                            module: string().required("Module is required."),
                            serviceType: string().required("Service type is required."),
                            serviceCategory: string().required("Service category is required."),
                            interactionType: string().required('Interaction type is required.'),
                            interactionCategory: string().required('Interaction category is required.')
                        }))
                    }
                    else if (target.value === 'KnowledgeBase') {
                        setInitialModuleRequirement(initialModuleRequirements);
                        setAddEditMapWorkflowValidationSchema(object().shape({
                            templateMapName: string().required("Template Map Name is required."),
                            module: string().required("Module is required."),
                            serviceType: string().required("Service type is required."),
                            serviceCategory: string().required("Service category is required."),
                            interactionType: string().required('Interaction type is required.'),
                            interactionCategory: string().required('Interaction category is required.')
                        }))
                    }
                    else if (target.value === 'WHATSAPP') {
                        setInitialModuleRequirement({
                            serviceType: false,
                            serviceCategory: false,
                            interactionType: false,
                            interactionCategory: false,
                            priority: false,
                            customerType: false,
                            userFamily: true,
                            userGroup: true,
                            orderType: false,
                            orderCategory: false,
                            customerCategory: false,
                        });
                        setAddEditMapWorkflowValidationSchema(object().shape({
                            userFamily: string().required("User family is required."),
                            userGroup: string().required("User group is required."),
                        }))
                    }
                    else if (target.value === 'ORDERS') {
                        setInitialModuleRequirement({
                            serviceType: true,
                            serviceCategory: false,
                            interactionType: false,
                            interactionCategory: false,
                            priority: true,
                            customerType: false,
                            userFamily: false,
                            userGroup: false,
                            orderType: true,
                            orderCategory: true,
                            customerCategory: true,
                        });
                        setAddEditMapWorkflowValidationSchema(object().shape({
                            serviceType: string().required("Service type is required."),
                            priority: string().required("priority is required."),
                            orderType: string().required("Order type is required."),
                            orderCategory: string().required("Order category is required."),
                            customerCategory: string().required("Customer category is required."),
                        }))
                    }
                    setEntityTypes({
                        ...entityTypes,
                        serviceType: entityTypes?.serviceType
                    });
                } else {
                    setEntityTypes({
                        ...entityTypes,
                        serviceType: []
                    });
                }
            }
            setAddEditMapWorkflowInputs({
                ...addEditMapWorkflowInputs,
                [target.id]: target.value
            })
            setAddeEditMapWorkflowError({
                ...addeEditMapWorkflowError,
                [target.id]: ""
            })
        })
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Select") {
            return (
                <div className="custom-control custom-checkbox">
                    <input type="checkbox" id={`selectedTemplate${row?.original?.workflowId}`} name='selectedTemplate' className="custom-control-input" checked={row?.original?.workflowId === isTemplatedListChecked?.workflowId ? isTemplatedListChecked?.checked : false} onChange={(e) => { handleOnSelectChecked(e, row.original) }} />
                    <label className="custom-control-label cursor-pointer" htmlFor={`selectedTemplate${row?.original?.workflowId}`}></label>
                </div>
            )
        }
        else if (cell.column.Header === "Created By") {
            return (<span>{row?.original.createdByName?.firstName || ''} {row?.original.createdByName?.lastName || ''}</span>)
        }
        else if (cell.column.Header === "View Workflow") {
            return (
                <button type="button" className="btn btn-outline-primary waves-effect waves-light btn-sm mr-1" onClick={() => setIsViewWorkflowOpen(true)}>
                    <i className="mdi mdi-eye  ml-0 mr-2 font-10 vertical-middle" />
                    View Worflow
                </button>
            )
        }
        if (cell.column.Header === "View Workflow Template") {
            return (
                <button type="button" className="btn btn-outline-primary waves-effect waves-light btn-sm mr-1" onClick={() => setIsViewWorkflowTemplateOpen(true)}>
                    <i className="mdi mdi-eye  ml-0 mr-2 font-10 vertical-middle" />
                    View Worflow Template
                </button>
            )
        }
        else if (["Date"].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>)
        }
        else {
            return (<span>{cell.value || '-'}</span>)
        }
    }

    const handleOnSelectChecked = (e, row) => {
        const { target } = e;
        if (target.checked) {
            selectedTemplateRef.current = row;
            setIsTemplatedListChecked({
                workflowId: row?.workflowId,
                checked: target.checked
            });
        }
        else {
            selectedTemplateRef.current = {};
            setIsTemplatedListChecked({});
        }
    }

    const validate = (schema, data) => {
        try {
            setAddeEditMapWorkflowError({})
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setAddeEditMapWorkflowError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    const handleOnShowTemplate = () => {
        let error = validate(AddEditMapWorkflowValidationSchema, addEditMapWorkflowInputs)
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        getTemplateList();
    }

    const handleOnSelectConfirmWorkflowTemplate = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: `Confirm ${isEdit ? 'Edit' : ''} Workflow template Mapping!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: `Yes, ${isEdit ? 'Edit' : 'Submit'} it!`
        }).then((result) => {
            if (result.isConfirmed) {
                if (isEdit) {
                    confirmOnEditTemplate();
                }
                else {
                    confirmNewTemplate();
                }
            }
        }).catch((error) => {
            console.log(error)
        })
    }

    const confirmNewTemplate = () => {
        const { workflowId } = selectedTemplateRef.current;
        const { module, serviceType, interactionType, priority, customerType, templateMapName } = addEditMapWorkflowInputs;
        console.log('addEditMapWorkflowInputs--------->', addEditMapWorkflowInputs);

        post(`${properties.WORKFLOW_DEFN_API}/create-workflow-mapping`, { workflowId, ...addEditMapWorkflowInputs,status:'AC' })
            .then((response) => {
                const { status, data, message } = response;
                if (status === 200 && data) {
                    setConfirmedTemplateList(Array(data));
                    toast.success(message);
                    SuccessfullyMappedUIRef.current?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" })
                }
            })
            .catch((error) => {
                console.error(error);
            })
            .finally()
    }

    const confirmOnEditTemplate = () => {
        const { workflowId } = selectedTemplateRef.current;
        const { mappingId } = propsLocationState.data;
        const requestBody = {
            workflowId,
            mappingId
        }
        put(`${properties.WORKFLOW_DEFN_API}/update/mapped-workflow`, requestBody)
            .then((response) => {
                const { status, message } = response;
                if (status === 200) {
                    toast.success(message);
                    props.history.push(`${process.env.REACT_APP_BASE}/map-workflow-template-list`);
                }
            })
            .catch((error) => {
                console.error(error);
            })
            .finally()
    }

    const handleOnClear = () => {
        unstable_batchedUpdates(() => {
            setAddEditMapWorkflowInputs(initialValues);
            setTemplateList([]);
            setIsTemplatedListChecked({});
            selectedTemplateRef.current = {};
            setConfirmedTemplateList([]);
        })
    }

    return (
        <div className='search-result-box m-t-30 card-box p-0'>
            <div className="col-12 pr-0">
                <section className="triangle">
                    <h4 id="list-item-1" className="pl-2">Map Workflow Template to Module</h4>
                </section>
            </div>
            <div className='autoheight p-2'>
                <section>
                    <div className="row pb-2">
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="templateMapName" className="control-label">Template Map Name <span>*</span></label>
                                <input
                                    value={addEditMapWorkflowInputs.templateMapName}
                                    disabled={isEdit}
                                    onChange={handleInputChange}
                                    type="text"
                                    className={`form-control ${addeEditMapWorkflowError.templateMapName ? "error-border" : ""}`}
                                    id="templateMapName"
                                    placeholder="Enter Template Name" />
                                <span className="errormsg">{addeEditMapWorkflowError.templateMapName ? addeEditMapWorkflowError.templateMapName : ""}</span>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="module" className="control-label">Modules <span>*</span></label>
                                <select id='module' disabled={isEdit} className={`form-control ${addeEditMapWorkflowError.module ? "error-border" : ""}`}
                                    value={addEditMapWorkflowInputs.module} onChange={handleInputChange} >
                                    <option value="">Select Modules</option>
                                    {
                                        entityTypes?.module?.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                                <span className="errormsg">{addeEditMapWorkflowError.module ? addeEditMapWorkflowError.module : ""}</span>
                            </div>
                        </div>
                        {initialModuleRequirement.userGroup && <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="userGroup" className="control-label">User Group <span>*</span></label>
                                <select id='userGroup' disabled={isEdit} className={`form-control ${addeEditMapWorkflowError.userGroup ? "error-border" : ""}`}
                                    value={addEditMapWorkflowInputs.userGroup} onChange={handleInputChange} >
                                    <option value="">Select User Group</option>
                                    {
                                        entityTypes?.userGroup?.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                                <span className="errormsg">{addeEditMapWorkflowError.serviceType ? addeEditMapWorkflowError.serviceType : ""}</span>
                            </div>
                        </div>}
                        {initialModuleRequirement.userFamily && <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="userFamily" className="control-label">User Family <span>*</span></label>
                                <select id='userFamily' disabled={isEdit} className={`form-control ${addeEditMapWorkflowError.userFamily ? "error-border" : ""}`}
                                    value={addEditMapWorkflowInputs.userFamily} onChange={handleInputChange} >
                                    <option value="">Select User Family</option>
                                    {
                                        entityTypes?.userFamily?.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                                <span className="errormsg">{addeEditMapWorkflowError.serviceType ? addeEditMapWorkflowError.serviceType : ""}</span>
                            </div>
                        </div>}
                        {initialModuleRequirement.orderType && <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="orderType" className="control-label">Order Type <span>*</span></label>
                                <select id='orderType' disabled={isEdit} className={`form-control ${addeEditMapWorkflowError.orderType ? "error-border" : ""}`}
                                    value={addEditMapWorkflowInputs.orderType} onChange={handleInputChange} >
                                    <option value="">Select Order Type</option>
                                    {
                                        entityTypes?.orderType?.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                                <span className="errormsg">{addeEditMapWorkflowError.serviceType ? addeEditMapWorkflowError.serviceType : ""}</span>
                            </div>
                        </div>}
                        {initialModuleRequirement.orderCategory && <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="orderCategory" className="control-label">Order Category <span>*</span></label>
                                <select id='orderCategory' disabled={isEdit} className={`form-control ${addeEditMapWorkflowError.orderCategory ? "error-border" : ""}`}
                                    value={addEditMapWorkflowInputs.orderCategory} onChange={handleInputChange} >
                                    <option value="">Select order Category</option>
                                    {
                                        entityTypes?.orderCategory?.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                                <span className="errormsg">{addeEditMapWorkflowError.serviceType ? addeEditMapWorkflowError.serviceType : ""}</span>
                            </div>
                        </div>}
                        {initialModuleRequirement.serviceType && <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="serviceType" className="control-label">Service Type <span>*</span></label>
                                <select id='serviceType' disabled={isEdit} className={`form-control ${addeEditMapWorkflowError.serviceType ? "error-border" : ""}`}
                                    value={addEditMapWorkflowInputs.serviceType} onChange={handleInputChange} >
                                    <option value="">Select Service Type</option>
                                    {
                                        entityTypes?.serviceType?.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                                <span className="errormsg">{addeEditMapWorkflowError.serviceType ? addeEditMapWorkflowError.serviceType : ""}</span>
                            </div>
                        </div>}
                        {initialModuleRequirement.serviceCategory && <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="serviceType" className="control-label">Service Category <span>*</span></label>
                                <select id='serviceCategory' disabled={isEdit} className={`form-control ${addeEditMapWorkflowError.serviceType ? "error-border" : ""}`}
                                    value={addEditMapWorkflowInputs.serviceCategory} onChange={handleInputChange} >
                                    <option value="">Select Service Category</option>
                                    {
                                        entityTypes?.serviceCategory?.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                                <span className="errormsg">{addeEditMapWorkflowError.serviceCategory ? addeEditMapWorkflowError.serviceCategory : ""}</span>
                            </div>
                        </div>}
                        {initialModuleRequirement.interactionType && <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="interactionType" className="control-label">Interaction Type <span>{disableInteractionEntityTypes ? '' : '*'}</span></label>
                                <select id='interactionType' disabled={disableInteractionEntityTypes || isEdit} className={`form-control ${addeEditMapWorkflowError.interactionType ? "error-border" : ""}`}
                                    value={addEditMapWorkflowInputs.interactionType} onChange={handleInputChange} >
                                    <option value="">Select Interaction Type</option>
                                    {
                                        entityTypes?.interactionType?.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                                <span className="errormsg">{addeEditMapWorkflowError.interactionType ? addeEditMapWorkflowError.interactionType : ""}</span>
                            </div>
                        </div>}
                        {initialModuleRequirement.interactionCategory && <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="interactionCategory" className="control-label">Interaction Category <span>{disableInteractionEntityTypes ? '' : '*'}</span></label>
                                <select id='interactionCategory' disabled={disableInteractionEntityTypes || isEdit} className={`form-control ${addeEditMapWorkflowError.interactionCategory ? "error-border" : ""}`}
                                    value={addEditMapWorkflowInputs.interactionCategory} onChange={handleInputChange} >
                                    <option value="">Select Interaction Category</option>
                                    {
                                        entityTypes?.interactionCategory?.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                                <span className="errormsg">{addeEditMapWorkflowError.interactionCategory ? addeEditMapWorkflowError.interactionCategory : ""}</span>
                            </div>
                        </div>}
                        {initialModuleRequirement.priority && <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="priority" className="control-label">Priority <span>{disableInteractionEntityTypes ? '' : '*'}</span></label>
                                <select id='priority' disabled={disableInteractionEntityTypes || isEdit} className={`form-control ${addeEditMapWorkflowError.priority ? "error-border" : ""}`}
                                    value={addEditMapWorkflowInputs.priority} onChange={handleInputChange} >
                                    <option value="">Select Priority</option>
                                    {
                                        entityTypes?.priority?.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                                <span className="errormsg">{addeEditMapWorkflowError.priority ? addeEditMapWorkflowError.priority : ""}</span>
                            </div>
                        </div>}
                        {initialModuleRequirement.customerCategory && <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="customerCategory" className="control-label">Customer Category <span>{disableInteractionEntityTypes ? '' : '*'}</span></label>
                                <select id='customerCategory' disabled={disableInteractionEntityTypes || isEdit} className={`form-control ${addeEditMapWorkflowError.customerCategory ? "error-border" : ""}`}
                                    value={addEditMapWorkflowInputs.customerCategory} onChange={handleInputChange} >
                                    <option value="">Select Customer Category</option>
                                    {
                                        entityTypes?.customerCategory?.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                                <span className="errormsg">{addeEditMapWorkflowError.customerCategory ? addeEditMapWorkflowError.customerCategory : ""}</span>
                            </div>
                        </div>}
                        {initialModuleRequirement.customerType && <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="customerType" className="control-label">Customer Type <span>{disableInteractionEntityTypes ? '' : '*'}</span></label>
                                <select id='customerType' disabled={disableInteractionEntityTypes || isEdit} className={`form-control ${addeEditMapWorkflowError.customerType ? "error-border" : ""}`}
                                    value={addEditMapWorkflowInputs.customerType} onChange={handleInputChange} >
                                    <option value="">Select Customer Type</option>
                                    {
                                        entityTypes?.customerType?.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                                <span className="errormsg">{addeEditMapWorkflowError.customerType ? addeEditMapWorkflowError.customerType : ""}</span>
                            </div>
                        </div>}
                        <div className='col-12 my-3 text-center'>
                            {
                                !isEdit &&
                                <button type="button" className="skel-btn-cancel" onClick={handleOnClear}>
                                    Clear
                                </button>
                            }
                            {
                                !isEdit &&
                                <button type="button" className="skel-btn-submit" onClick={handleOnShowTemplate}>
                                    Show Workflow Templates
                                </button>
                            }
                            {
                                !!templateList.length && isTemplatedListChecked?.checked && !confirmedTemplateList.length && (
                                    <button type="button" className="btn btn-primary btn-sm waves-effect waves-light pt-1 mx-1" onClick={handleOnSelectConfirmWorkflowTemplate}>
                                        Confirm Selected Workflow Template Mapping
                                    </button>
                                )
                            }
                            {
                                ((isEdit && !!templateList.length) || !!confirmedTemplateList.length) &&
                                <Link className="btn btn-primary btn-sm waves-effect waves-light pt-1 mx-1" to={`${process.env.REACT_APP_BASE}/map-workflow-template-list`}>
                                    Back to Mapped Template List
                                </Link>
                            }

                        </div>
                    </div>
                </section>
                {
                    !confirmedTemplateList.length &&
                    <section>
                        <div className='col-md-12'>
                            {
                                !!templateList.length &&
                                <DynamicTable
                                    row={templateList}
                                    header={AddEditMapWorkflowColumns}
                                    rowCount={templateList.length}
                                    itemsPerPage={10}
                                    handler={{
                                        handleCellRender: handleCellRender
                                    }}
                                />
                            }
                        </div>
                    </section>
                }
                <section ref={SuccessfullyMappedUIRef}>
                    <div className='row justify-content-center'>
                        {
                            !!confirmedTemplateList.length &&
                            <>
                                <h4 className="text-success">Template Mapping Successfully Created</h4>
                                <DynamicTable
                                    row={confirmedTemplateList}
                                    header={SelectConfirmMappingTemplateColumns}
                                    rowCount={confirmedTemplateList.length}
                                    itemsPerPage={10}
                                    handler={{
                                        handleCellRender: handleCellRender
                                    }}
                                />
                            </>
                        }
                    </div>
                </section>
            </div >
            {
                isViewWorkflowOpen &&
                <ViewWorkflowModal
                    data={{
                        isOpen: isViewWorkflowOpen
                    }}
                    handlers={{
                        setIsOpen: setIsViewWorkflowOpen
                    }} />
            }
            {
                isViewWorkflowTemplateOpen &&
                <ViewWorkflowModalTemplate
                    data={{
                        isOpen: isViewWorkflowTemplateOpen
                    }}
                    handlers={{
                        setIsOpen: setIsViewWorkflowTemplateOpen
                    }}
                />
            }
        </div >
    )
}

export default AddEditMapWorkflow;