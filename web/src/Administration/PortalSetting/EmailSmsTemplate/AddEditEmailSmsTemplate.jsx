import React, { useEffect, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom';
import Modal from 'react-modal'
import { toast } from 'react-toastify';
import { object, string } from 'yup';

import { properties } from '../../../properties';
import { post, put } from '../../../common/util/restUtil';
import { RegularModalCustomStyles } from '../../../common/util/util';

const AddEditEmailSmsTemplate = (props) => {

    const { isOpen, emailSmsTemplateData, isEdit } = props.data;
    const { setIsOpen } = props.handler;

    const [templateData,setTemplateData] = useState({
        templateType: "",
        templateName: "",
        subject: "",
        body: "",
        templateStatus: "",
        mappingPayload: {}
    })
    const [templateDataError,setTemplateDataError] = useState({})

    const validationSchema = object().shape({
        templateType: string().required("Template Type is required"),
        templateName: string().required("Template Name is required"),
        subject: string().required("Subject is required"),
        body: string().required("Body is required"),
        templateStatus: string().required("Template Status is required") 
    });

    useEffect(() => {
        if(isEdit)
        {
            setTemplateData(emailSmsTemplateData)
        }
    },[props])

    const handleSubmit = () => {
        let error = validate(validationSchema, templateData);
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        if(isEdit === false)
        {
            
            post(properties.EMAIL_TEMPLATE_API, templateData)
            .then((response) => {
                if(response.status === 200)
                {
                    toast.success("Template Created Successfully")
                    setIsOpen(false)
                }
            })
            .catch((error) => {
                console.error(error)
            })
            .finally()
        }
        else
        {
            
            put(properties.EMAIL_TEMPLATE_API, templateData)
            .then((response) => {
                if(response.status === 200)
                {
                    toast.success("Template Updated Successfully")
                    setIsOpen(false)
                }
            })
            .catch((error) => {
                console.error(error)
            })
            .finally()
        }
    }

    const handleOnChange = (e) => {
        const { target } = e;
        unstable_batchedUpdates(() => {
            setTemplateData({
                ...templateData,
                [target.id]: target.value
            })
            setTemplateDataError({
                ...templateDataError,
                [target.id]: ""
            })
        })
    }

    const validate = (schema, data) => {
        try {
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setTemplateDataError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    return (
        <Modal isOpen={isOpen} contentLabel="Worflow History Modal" style={RegularModalCustomStyles}>
            <div>
                <div className="modal-dialog modal-dialog-scrollable" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{isEdit ? 'Edit' : 'Add'} Email / SMS Template</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setIsOpen(false)}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div id="searchBlock" className="modal-body">
                                <div className="row pl-2">
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label htmlFor="templateType" className="control-label">Template Type</label>
                                            <select type="templateType" id="templateType" name="templateType" className={`form-control ${templateDataError.templateType && "error-border"}`} value={templateData.templateType} onChange={handleOnChange}>
                                                <option value="">Select Template Type</option>
                                                <option value="Email">Email</option>
                                                <option value="SMS">SMS</option>
                                            </select>
                                            <span className="errormsg">{templateDataError.templateType ? templateDataError.templateType : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label htmlFor="templateName" className="control-label">Template Name</label>
                                            <input type="templateName" id="templateName" name="templateName" className={`form-control ${templateDataError.templateName && "error-border"}`} value={templateData.templateName} onChange={handleOnChange}/>
                                            <span className="errormsg">{templateDataError.templateName ? templateDataError.templateName : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label htmlFor="templateStatus" className="control-label">Template Status</label>
                                            <select type="templateStatus" id="templateStatus" name="templateStatus" className={`form-control ${templateDataError.templateStatus && "error-border"}`} value={templateData.templateStatus} onChange={handleOnChange}>
                                                <option value="">Select Template Status</option>
                                                <option value="ACTIVE">Active</option>
                                                <option value="INACTIVE">Inactive</option>
                                            </select>
                                            <span className="errormsg">{templateDataError.templateStatus ? templateDataError.templateStatus : ""}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-12 mt-2">
                                    <div className="form-group">
                                        <label htmlFor="subject" className="control-label">Subject</label>
                                        <input type="subject"id="subject" name="subject" className={`form-control ${templateDataError.subject && "error-border"}`} value={templateData.subject} onChange={handleOnChange}/>
                                        <span className="errormsg">{templateDataError.subject ? templateDataError.subject : ""}</span>
                                    </div>
                                </div>
                                <div className="col-md-12 mt-2">
                                    <div className="form-group">
                                        <label htmlFor="body" className="control-label">Body</label>
                                        <textarea id="body" name="body" className={`form-control ${templateDataError.body && "error-border"}`} value={templateData.body} rows="4" onChange={handleOnChange}></textarea>
                                        <span className="errormsg">{templateDataError.body ? templateDataError.body : ""}</span>
                                    </div>
                                </div>
                                <div className="col-12 pt-2 text-center">
                                    <button type="button" className="btn waves-effect waves-light btn-primary mr-2" onClick={handleSubmit}>Submit</button>
                                    <button type="button" className="btn waves-effect waves-light btn-secondary" onClick={() => {setIsOpen(false)}}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
} 

export default AddEditEmailSmsTemplate