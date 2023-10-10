/***********************************Product Module- Map to Bundle- Srinivasan.N-19-June-2023********************************/

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

const AddEditMapBundle = (props) => {

    const propsLocationState = props?.location?.state;
    const isEdit = propsLocationState?.source === 'Edit' ? true : false;
    const initialValues = {
        bundleName: "",
        mappedProductList: []
    };

    const [inputData, setInputData] = useState(initialValues);
    const [isTemplatedListChecked, setIsTemplatedListChecked] = useState({});
    const [searchParams, setSearchParams] = useState({});
    const [inputDataError, setInputDataError] = useState({});
    const [templateList, setTemplateList] = useState([]);
    const selectedTemplateRef = useRef({});
    const allEntityTypesRef = useRef({});
    const [confirmedTemplateList, setConfirmedTemplateList] = useState([]);
    const [isViewWorkflowOpen, setIsViewWorkflowOpen] = useState(false);
    const [isViewWorkflowTemplateOpen, setIsViewWorkflowTemplateOpen] = useState(false);

    const [disableInteractionEntityTypes, setDisableInteractionEntityTypes] = useState();
    const SuccessfullyMappedUIRef = useRef();

    const validationSchema = object().shape({
        // templateMapName: string().required("Template Map Name is required."),
        // module: string().required("Module is required."),
        serviceType: string().required("Service Type is required."),
        // productType: string().test('Type', 'Interaction Type is required.', (interactionType) => interactionType ? true : disableInteractionEntityTypes),

    })

    const [entityTypes, setEntityTypes] = useState({
        productType: [],
        serviceType: [],
        productSubType: [],
        customerType: []
    });

    const getEntityLookup = useCallback(() => {
        
        return new Promise((resolve, reject) => {
            get(properties.MASTER_API+'/lookup?searchParam=code_type&valueParam=PROD_SUB_TYPE,PRODUCT_TYPE,SERVICE_TYPE,CUSTOMER_TYPE')
                .then((response) => {
                    const { data } = response;
                    allEntityTypesRef.current = data;
                    setEntityTypes({
                        ...entityTypes,
                        productSubType: data['PROD_SUB_TYPE'],
                        productType: data['PRODUCT_TYPE'],
                        serviceType: data['SERVICE_TYPE'],
                        customerType: data['CUSTOMER_TYPE']
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
        
        const reqBody = {
            ...searchParams
        }
        const queryString = Object.entries(reqBody)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');

            console.log(queryString);
        get(`${properties.PRODUCT_API}/mapping-list?${queryString}`)
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
            setInputData({
                ...inputData,
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

 
    const handleInputChange = (e) => {
        const { target } = e;
        unstable_batchedUpdates(() => {       
            setSearchParams({
                ...searchParams,
                [target.id]: target.value
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
            setInputDataError({})
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setInputDataError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    const handleOnShowTemplate = () => {
        let error = validate(validationSchema, searchParams)
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
        }).catch(error => console.log(error))
    }

    const confirmNewTemplate = () => {
        
        const { workflowId } = selectedTemplateRef.current;
        const { module, serviceType, interactionType, priority, customerType, templateMapName } = inputData;
        const requestBody = {
            workflowId,
            templateMapName,
            module,
            serviceType,
            interactionType,
            priority,
            customerType
        }
        post(`${properties.WORKFLOW_DEFN_API}/create-workflow-mapping`, requestBody)
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
            setInputData(initialValues);
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
                    <h4 id="list-item-1" className="pl-2">Create Product Bundle</h4>
                </section>
            </div>
            <div className='autoheight p-2'>
                <section>
                    <div className="row pb-2">
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="templateMapName" className="control-label">Bundle Name <span>*</span></label>
                                <input
                                    value={inputData.templateMapName}
                                    disabled={isEdit}
                                    onChange={handleInputChange}
                                    type="text"
                                    className={`form-control ${inputDataError.templateMapName ? "error-border" : ""}`}
                                    id="templateMapName"
                                    placeholder="Enter Template Name" />
                                <span className="errormsg">{inputDataError.templateMapName ? inputDataError.templateMapName : ""}</span>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="productType" className="control-label">Product Type </label>
                                <select id='productType' className={`form-control ${inputDataError.productType ? "error-border" : ""}`}
                                    value={inputData.productType} onChange={handleInputChange} >
                                    <option value="">Select...</option>
                                    {
                                        entityTypes?.productType?.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                                <span className="errormsg">{inputDataError.productType ? inputDataError.productType : ""}</span>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="productSubType" className="control-label">Product Sub Type </label>
                                <select id='productSubType' className={`form-control ${inputDataError.productSubType ? "error-border" : ""}`}
                                    value={inputData.productSubType} onChange={handleInputChange} >
                                    <option value="">Select Interaction Type</option>
                                    {
                                        entityTypes?.productSubType?.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                                <span className="errormsg">{inputDataError.productSubType ? inputDataError.productSubType : ""}</span>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="serviceType" className="control-label">Service Type <span>*</span></label>
                                <select id='serviceType' disabled={isEdit} className={`form-control ${inputDataError.serviceType ? "error-border" : ""}`}
                                    value={inputData.serviceType} onChange={handleInputChange} >
                                    <option value="">Select Service Type</option>
                                    {
                                        entityTypes?.serviceType?.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                                <span className="errormsg">{inputDataError.serviceType ? inputDataError.serviceType : ""}</span>
                            </div>
                        </div>
                        <div className="col-md-4">
                            <div className="form-group">
                                <label htmlFor="customerType" className="control-label">Customer Type </label>
                                <select id='customerType' className={`form-control ${inputDataError.customerType ? "error-border" : ""}`}
                                    value={inputData.customerType} onChange={handleInputChange} >
                                    <option value="">Select Customer Type</option>
                                    {
                                        entityTypes?.customerType?.map((e) => (
                                            <option key={e.code} value={e.code}>{e.description}</option>
                                        ))
                                    }
                                </select>
                                <span className="errormsg">{inputDataError.customerType ? inputDataError.customerType : ""}</span>
                            </div>
                        </div>
                        <div className='col-12 my-3 text-center'>
                            {
                                !isEdit &&
                                <button type="button" className="btn btn-primary btn-sm waves-effect waves-light pt-1 mx-1" onClick={handleOnShowTemplate}>
                                    Show Products
                                </button>
                            }
                            {
                                !!templateList.length && isTemplatedListChecked?.checked && !confirmedTemplateList.length && (
                                    <button type="button" className="btn btn-primary btn-sm waves-effect waves-light pt-1 mx-1" onClick={handleOnSelectConfirmWorkflowTemplate}>
                                        Confirm Selected Products
                                    </button>
                                )
                            }
                            {
                                ((isEdit && !!templateList.length) || !!confirmedTemplateList.length) &&
                                <Link className="btn btn-primary btn-sm waves-effect waves-light pt-1 mx-1" to={`${process.env.REACT_APP_BASE}/map-workflow-template-list`}>
                                    Back to Mapped Product List
                                </Link>
                            }
                            {
                                !isEdit &&
                                <button type="button" className="btn btn-secondary btn-sm waves-effect waves-light pt-1 mx-1" onClick={handleOnClear}>
                                    Clear
                                </button>
                            }
                        </div>
                    </div>
                </section>
                {
                    !confirmedTemplateList.length &&
                    <section>
                        <div className='row'>
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
            </div>
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
        </div>
    )
}

export default AddEditMapBundle;