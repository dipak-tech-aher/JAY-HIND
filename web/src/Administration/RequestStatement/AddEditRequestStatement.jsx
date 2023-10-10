import React, { useEffect, useState } from 'react'
import ReactModal from 'react-modal';
import ReactSwitch from "react-switch";
import { toast } from 'react-toastify';
import { string, object } from "yup";
import { RegularModalCustomStyles } from '../../common/util/util';
import { properties } from "../../properties";
import { get, put, post } from "../../common/util/restUtil";

const AddEditRequestStatement = (props) => {

    const { isOpen, data } = props?.data
    const { setIsOpen, softRefresh } = props?.handler
    const [requestStatementData,setRequestStatementData] = useState({
        requestStatement: "",
        intxnType: "",
        intxnCategory: "",
        serviceType: "",
        serviceCategory: "",
        intxnCause: "",
        priorityCode: "",
        intxnResolution: "",
        isDropdown: 'Y'
    })
    const [error,setError] = useState({})

    const requestStatementValidationSchema = object().shape({
        requestStatement: string().required("Please Enter Interaction Statement"),
        intxnType: string().required("Please Enter Interaction Category"),
        intxnCategory: string().required("Please Enter Interaction Type"),
        serviceType: string().required("Please Enter Service Category"),
        serviceCategory: string().required("Please Enter Service Type"),
        intxnCause: string().required("Please Enter Problem Cause"),
        priorityCode: string().required("Please Enter Priority"),
        intxnResolution: string().required("Please Enter Interaction Resolution"),
    })
    const [intxnTypeLookup, setIntxnTypeLookup] = useState([]);
    const [intxnCategoryLookup, setIntxnCategoryLookup] = useState([]);
    const [serviceTypeLookup, setServiceTypeLookup] = useState([]);
    const [priorityLookup, setPriorityLookup] = useState([]);
    const [intxnResolutionLookup, setIntxnResolutionLookup] = useState([]);
    const [problemCaseLookup, setProblemCauseLookup] = useState([]);
    const [serviceCategoryLookup, setServiceCategoryLookup] = useState([]);

    useEffect(() => {
        if(data.mode === 'EDIT') {
            setRequestStatementData({
                ...requestStatementData,
                ...data
            })
        }
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=INTXN_TYPE,INTXN_CATEGORY,SERVICE_TYPE,PRODUCT_FAMILY,PRIORITY,INTXN_CAUSE,INTXN_RESOLUTION')
        .then((resp) => {
            if (resp.data) {
                setIntxnTypeLookup(resp.data.INTXN_TYPE || [])
                setIntxnCategoryLookup(resp.data.INTXN_CATEGORY || [])
                setPriorityLookup(resp.data.PRIORITY || [])
                setIntxnResolutionLookup(resp.data.INTXN_RESOLUTION || [])
                setServiceTypeLookup(resp.data.SERVICE_TYPE || [])
                setServiceCategoryLookup(resp.data.PRODUCT_FAMILY || [])
                setProblemCauseLookup(resp.data.INTXN_CAUSE || [])
            }
            else {
                toast.error("Error while fetching lookup details")
            }
        }).catch((error) => {
            console.log(error)
        })
        .finally()
    },[])

    const handleChange = (e) => {
        const { target } = e
        setRequestStatementData({
            ...requestStatementData,
            [target.id]: target.value
        })
        setError({
            ...error,
            [target.id]: ""
        })
    }

    const validate = (schema, data) => {
        try {
            setError({})
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    const handleSubmit = () => {
        const error = validate(requestStatementValidationSchema, requestStatementData);
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        let reqBody = {}
        if (data?.mode === 'CREATE') {
            reqBody = requestStatementData
        } else {
            reqBody = requestStatementData
            delete reqBody.requestId
        }
        console.log('reqBody',reqBody)
        if (data?.mode === 'CREATE') {
            post(properties.KNOWLEDGE_API + '/create-request-statement', reqBody)
                .then((resp) => {
                    if (resp) {
                        if (resp.status === 200) {
                            toast.success(resp.message);
                            setIsOpen(false)
                            softRefresh()
                        } else {
                            toast.error(resp.message);
                        }
                    }
                }).catch((error) => {
                    console.log(error)
                }).finally();
        } else {
            put(properties.KNOWLEDGE_API + "/edit-request-statement/" + data.requestId, reqBody)
                .then((resp) => {
                    if (resp) {
                        if (resp.status === 200) {
                            toast.success(resp.message);
                            setIsOpen(false)
                            softRefresh()
                        } else {
                            toast.error(resp.message);
                        }
                    }
                }).catch((error) => {
                    console.log(error)
                }).finally();
        }
    }

    return (
        <ReactModal isOpen={isOpen} onRequestClose={() => setIsOpen(false)} contentLabel="Followup Modal" style={RegularModalCustomStyles}>
            <div className="modal-center" id="followhistoryModal" tabIndex="-1" role="dialog" aria-labelledby="followupModal" aria-hidden="true">
                <div className="modal-dialog " role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="followupModal">Request Statement</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setIsOpen(false)}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className={`skel-form-heading-bar mt-2`}>
                                <span className="messages-page__title">{data?.mode === 'CREATE' ? 'Add' : 'Edit' }</span>
                            </div>
                            <div className={`cmmn-skeleton skel-br-tp-r0`}>
                                <div className="form-row px-0 py-0 mt-1">
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor="requestStatement" className="control-label">Interaction Statement <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <input type="text" id="requestStatement" className={`form-control ${error.requestStatement ? "input-error" : ""}`} onChange={handleChange} value={requestStatementData.requestStatement}/>
                                            {error.requestStatement ? <span className="error-msg">{error.requestStatement}</span> : ""}
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label htmlFor="intxnCategory" className="control-label">Interaction Category <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="custselect">
                                                <select className={`form-control ${error.intxnCategory ? "input-error" : ""}`} id="intxnCategory" onChange={handleChange} value={requestStatementData.intxnCategory}>
                                                    <option value={null}>Select Interaction Category</option>
                                                    {
                                                        intxnCategoryLookup.map((e, k) => (
                                                            <option key={k} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                {error.intxnCategory ? <span className="error-msg">{error.intxnCategory}</span> : ""}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label htmlFor="intxnType" className="control-label">Interaction Type <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="custselect">
                                                <select className={`form-control ${error.intxnType ? "input-error" : ""}`} id="intxnType" onChange={handleChange} value={requestStatementData.intxnType}>
                                                    <option value={null}>Select Interaction Type</option>
                                                    {
                                                        intxnTypeLookup.map((e, k) => (
                                                            <option key={k} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                {error.intxnType ? <span className="error-msg">{error.intxnType}</span> : ""}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label htmlFor="serviceCategory" className="control-label">Service Category <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="custselect">
                                                <select className={`form-control ${error.serviceCategory ? "input-error" : ""}`} id="serviceCategory" onChange={handleChange} value={requestStatementData.serviceCategory}>
                                                    <option value={null}>Select Service Category</option>
                                                    {
                                                        serviceCategoryLookup.map((e, k) => (
                                                            <option key={k} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                {error.serviceCategory ? <span className="error-msg">{error.serviceCategory}</span> : ""}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label htmlFor="serviceType" className="control-label">Service Type <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="custselect">
                                                <select className={`form-control ${error.serviceType ? "input-error" : ""}`} id="serviceType" onChange={handleChange} value={requestStatementData.serviceType}>
                                                    <option value={null}>Select Service Type</option>
                                                    {
                                                        serviceTypeLookup.map((e, k) => (
                                                            <option key={k} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                {error.serviceType ? <span className="error-msg">{error.serviceType}</span> : ""}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label htmlFor="intxnCause" className="control-label">Problem Cause <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="custselect">
                                                <select className={`form-control ${error.intxnCause ? "input-error" : ""}`} id="intxnCause" onChange={handleChange} value={requestStatementData.intxnCause}>
                                                    <option value={null}>Select Problem Cause</option>
                                                    {
                                                        problemCaseLookup.map((e, k) => (
                                                            <option key={k} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                {error.intxnCause ? <span className="error-msg">{error.intxnCause}</span> : ""}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label htmlFor="priorityCode" className="control-label">Priority <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="custselect">
                                                <select className={`form-control ${error.priorityCode ? "input-error" : ""}`} id="priorityCode" onChange={handleChange} value={requestStatementData.priorityCode}>
                                                    <option value={null}>Select Priority</option>
                                                    {
                                                        priorityLookup.map((e, k) => (
                                                            <option key={k} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                {error.priorityCode ? <span className="error-msg">{error.priorityCode}</span> : ""}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label htmlFor="intxnResolution" className="control-label">
                                                Interaction Resolution 
                                                <span className="text-danger font-20 pl-1 fld-imp">*</span>
                                                <ReactSwitch
                                                    onColor="#4C5A81"
                                                    offColor="#6c757d"
                                                    activeBoxShadow="0px 0px 1px 5px rgba(245, 133, 33, 0.7)"
                                                    height={20}
                                                    width={48}
                                                    className="inter-toggle skel-inter-toggle " id="smartSwitch" checked={requestStatementData.isDropdown === 'Y' ? true : false}
                                                    onChange={(e) => setRequestStatementData({ ...requestStatementData, isDropdown: e ? "Y" : "N" })}
                                                />
                                            </label>
                                            {
                                                requestStatementData.isDropdown === 'Y' ?
                                                    <div className="custselect">
                                                        <select className={`form-control ${error.intxnResolution ? "input-error" : ""}`} id="intxnResolution" onChange={handleChange} value={requestStatementData.intxnResolution}>
                                                            <option value={null}>Select Interaction Resolution</option>
                                                            {
                                                                intxnResolutionLookup.map((e, k) => (
                                                                    <option key={k} value={e.code}>{e.description}</option>
                                                                ))
                                                            }
                                                        </select>
                                                    </div>
                                                :
                                                <textarea type="text" id="intxnResolution" className={`form-control ${error.intxnResolution ? "input-error" : ""}`} onChange={handleChange} value={requestStatementData.intxnResolution} />
                                            }
                                            {error.intxnResolution ? <span className="error-msg">{error.intxnResolution}</span> : ""}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-12 pl-2">
                            <div className="form-group pb-1">
                                <div className="text-center">
                                    <button type="button" className="skel-btn-cancel" onClick={() => setIsOpen(false)}>Cancel</button>
                                    <button type="button" className="skel-btn-submit" onClick={handleSubmit}>{data?.mode === 'CREATE' ? 'Add' : 'Edit' }</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ReactModal>
    )
}

export default AddEditRequestStatement