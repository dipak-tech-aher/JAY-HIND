import React, { useEffect, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom';
import Modal from 'react-modal'
import { toast } from 'react-toastify';

import { properties } from '../../../properties';
import { post } from '../../../common/util/restUtil';
import { RegularModalCustomStyles, validateEmail } from '../../../common/util/util';

const TestSmtpEmailModal = (props) => {

    const { isOpen, validationSchema, testInputs, testInputsError, settingType } = props.data;
    const { setIsOpen, validate, setTestInputsError} = props.handler;

    const [messageInputs,setMessageInputs] = useState({
        to: "",
        testMessage: ""
    })

    useEffect(() => {
        setTestInputsError({
            ...testInputsError,
            to: "",
            testMessage: ""
        })
    },[])

    const handleSendEmail = () => {
        let error = validate(validationSchema, messageInputs);
        if (error) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        let requestBody = {
            ...testInputs,
            ...messageInputs
        }
        
        post(`${properties.PORTAL_SETTING_API}/${settingType === 'SMTP' ? 'send-email' : 'send-sms'}`,requestBody)
        .then((response) => {
            if(response.status === 200)
            {
                toast.success(`${settingType === 'SMTP' ? 'Mail' : 'SMS'} Sent Successfully`)
                setIsOpen(false)
            }
        })
        .catch((error) => {
            console.error(error)
        })
        .finally()
    }

    const handleOnChange = (e) => {
        const { target } = e;
        unstable_batchedUpdates(() => {
            setMessageInputs({
                ...messageInputs,
                [target.id]: target.value
            })
            setTestInputsError({
                ...testInputsError,
                [target.id]: ""
            })
        })
    }

    return (
        <Modal isOpen={isOpen} contentLabel="Worflow History Modal" style={RegularModalCustomStyles}>
            <div>
                <div className="modal-dialog modal-dialog-scrollable" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Send Test { settingType === 'SMTP' ? 'Mail' : 'SMS'}</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={() => setIsOpen(false)}>
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div> 
                        <div>
                        </div>
                        <div className="modal-body">
                            <div id="searchBlock" className="modal-body">
                                <div className="col-md-12">
                                    <div className="form-group">
                                        <label htmlFor="to" className="control-label">To { settingType === 'SMTP' ? 'Email' : 'Number'} </label>
                                        <input type={`${settingType === 'SMTP' ? 'email' : 'text'}`} id="to" onKeyPress={(e) => {settingType === 'SMTP' && validateEmail(e)}} name="to" className={`form-control ${testInputsError.to && "error-border"}`} value={messageInputs.to} onChange={handleOnChange}/>
                                        <span className="errormsg">{testInputsError.to ? testInputsError.to : ""}</span>
                                    </div>
                                </div>
                                <div className="col-md-12 mt-2">
                                    <div className="form-group">
                                        <label htmlFor="testMessage" className="control-label">Test Message</label>
                                        <textarea id="testMessage" name="testMessage" className={`form-control ${testInputsError.testMessage && "error-border"}`} value={messageInputs.testMessage} rows="4" onChange={handleOnChange}></textarea>
                                        <span className="errormsg">{testInputsError.testMessage ? testInputsError.testMessage : ""}</span>
                                    </div>
                                </div>
                                <div className="col-12 pt-2 text-center">
                                    <button type="button" className="btn btn-sm waves-effect waves-light btn-primary" onClick={handleSendEmail}>
                                        Send Test { settingType === 'SMTP' ? 'Mail' : 'SMS'} Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
} 

export default TestSmtpEmailModal