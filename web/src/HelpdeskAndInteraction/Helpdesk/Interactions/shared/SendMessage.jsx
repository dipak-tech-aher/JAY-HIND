import React, { useCallback, useEffect, useState, memo } from 'react';
import Select from 'react-select';
import ReactQuill from 'react-quill';
import { get, post } from '../../../../common/util/restUtil';

import { properties } from '../../../../properties';
import { toast } from 'react-toastify';

const SendMessage = memo((props) => {

    const { detailedViewItem } = props.data;
    const { doSoftRefresh } = props.handlers;

    const initialState = {
        deptUser: [],
        sendCustomer: false,
        mail: "",
        selectedDeptUser: []
    }

    const [sendMessageInputs, setSendMessageInputs] = useState(initialState);

    const getUsers = useCallback(() => {
        
        get(properties.DEPT_USER)
            .then((response) => {
                const { status, data } = response;
                if (status === 200 && !!data?.length) {
                    setSendMessageInputs({
                        ...sendMessageInputs,
                        deptUser: formLookupForDeptUser(data)
                    })
                }
            })
            .catch((error) => {
                console.error(error);
            })
            .finally()
    }, []);

    useEffect(() => {
        getUsers()
    }, [getUsers])

    const formLookupForDeptUser = (data) => {
        return data?.map((user) => ({ label: `${user.unitName}-${user.firstName} ${user?.lastName ? user.lastName : ""}`, value: user }))
    }

    const handleOnDeptUserChange = (selectedDeptUser) => {
        let newselectedDeptUser = []
        if(selectedDeptUser && selectedDeptUser.length > 0) {
            newselectedDeptUser = selectedDeptUser.map((x) => x.value)
        }
        // console.log(selectedDeptUser)
        setSendMessageInputs({
            ...sendMessageInputs,
            selectedDeptUser: newselectedDeptUser
        })
    }

    const handleOnInputChange = (e) => {
        const { target } = e;
        setSendMessageInputs({
            ...sendMessageInputs,
            [target.id]: target.id === 'sendCustomer' ? target.checked : target.value
        })
    }

    const handleOnRichTextChange = (text) => {
        setSendMessageInputs({
            ...sendMessageInputs,
            mail: text
        })
    }

    const handleOnSend = () => {
        
        const requestBody = {
            sourcePage: 'INTERACTION',
            helpdeskId: detailedViewItem?.helpdeskDetails?.helpdeskId || "",
            chatId: detailedViewItem?.chatDetails?.chatId || "",
            content: sendMessageInputs.mail,
            toCustomer: sendMessageInputs.sendCustomer,
            payload: sendMessageInputs.sendCustomer === false ? sendMessageInputs.selectedDeptUser : []
        }
        post(`${properties.HELPDESK_API}/reply`, requestBody)
            .then((response) => {
                const { status, message, data } = response;
                if (status === 200) {
                    handleOnCancel();
                    doSoftRefresh();
                    toast.success(message);
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

    const handleOnCancel = () => {
        setSendMessageInputs(initialState);
    }

    return (
        <div className="row mt-2 pb-1 col-12">
            <section className="triangle col-12">
                <div className="row col-12">
                    <div className="col-8">
                        <h5 id="list-item-5" className="pl-1">Send Message </h5>
                    </div>
                    <div className="col-4">
                        <span>&nbsp;</span>
                    </div>
                </div>
            </section>
            <div className="row col-12">
                <div className="col-6">
                    <div className="form-group">
                        <label htmlFor="sendCustomer" className="col-form-label cursor-pointer">
                            <input className="cursor-pointer" type="checkbox" id="sendCustomer" checked={sendMessageInputs.sendCustomer} onChange={handleOnInputChange} />
                            Send This Reply to Customer Directly
                        </label>
                    </div>
                </div>
                {
                    sendMessageInputs.sendCustomer === false && (
                        <div className="col-6">
                            <div className="form-group">
                                <label htmlFor="inputId" className="col-form-label">Select Department and Users</label>
                                <Select
                                    closeMenuOnSelect={false}
                                    options={sendMessageInputs.deptUser}
                                    getOptionLabel={option => `${option.label}`}
                                    onChange={handleOnDeptUserChange}
                                    isMulti
                                    isClearable
                                    name="deptUser"
                                    classNamePrefix="Select Department User"

                                    menuPortalTarget={document.body} 
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    
                                />
                            </div>
                        </div>
                    )
                }
            </div>
            <div className='row col-12 mb-4 mt-2'>
                <ReactQuill
                    className='w-100'
                    placeholder='Write Something...'
                    value={sendMessageInputs.mail} modules={SendMessage.modules}
                    formats={SendMessage.formats}
                    onChange={handleOnRichTextChange} />
            </div>
            <div className="row col-12 px-2 my-3">
                <button className="btn btn-primary waves-effect waves-light" onClick={handleOnSend}>
                    <span className='text-white' >Send</span>
                    <i className="mdi mdi-send ml-2"></i>
                </button> &nbsp;
                <button type="button" className="btn btn-secondary waves-effect waves-light m-r-5" onClick={handleOnCancel}>
                    <span className='text-white' >Clear</span>
                    <i className="mdi mdi-delete font-16 ml-2"></i>
                </button>
            </div>
        </div>
    )
})

SendMessage.modules = {
    toolbar: [
        [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' },
        { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'video', { 'color': ['#000000', '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff', '#ffffff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff', '#bbbbbb', '#f06666', '#ffc266', '#ffff66', '#66b966', '#66a3e0', '#c285ff', '#888888', '#a10000', '#b26b00', '#b2b200', '#006100', '#0047b2', '#6b24b2', '#444444', '#5c0000', '#663d00', '#666600', '#003700', '#002966', '#3d1466', 'custom-color'] }, { 'background': [] }],
        ['clean']
    ],
    clipboard: {
        matchVisual: true,
    }
}

SendMessage.formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'video', 'color', 'background'
]

export default SendMessage;