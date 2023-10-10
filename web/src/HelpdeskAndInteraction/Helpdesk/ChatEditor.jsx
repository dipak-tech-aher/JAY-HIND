import React, { useState } from 'react';
import { toast } from 'react-toastify';

import { properties } from '../../properties';
import { put } from '../../common/util/restUtil';

const ChatEditor = (props) => {

    const { isDisabled = false, isVerified, detailedViewItem } = props.data;
    const { doSoftRefresh } = props.handlers;

    const [chatStatus, setChatStatus] = useState(detailedViewItem?.status);

    const handleOnChatStatusChange = (e) => {
        const { value } = e.target;
        setChatStatus(value);
    }

    const handleOnChatSubmit = () => {
        
        const requestBody = {
            chatId: detailedViewItem?.chatId
        }
        put(`${properties.CHAT_API}/end`, requestBody)
            .then((response) => {
                const { status, message } = response;
                if (status === 200) {
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
        doSoftRefresh('CANCEL_VIEW');
    }

    return (
        <div className="col-12 row pl-2 pt-2 m-0 ">
            <div className="row col-12 px-0">
                <div className="col-3 form-label">Chat Category:</div>
                <div className="col-9 form-vtext">{detailedViewItem?.category}</div>
            </div>
            <div className="col-12 row pt-2 px-0">
                <div className="col-3 form-label">Chat Request:</div>
                <div className="col-9 form-vtext">{detailedViewItem?.request}</div>
            </div>
            {
                !isDisabled &&
                <>
                    <div className="col-12 clearfix pt-2 px-0">
                        <div className="form-label">Update Status:</div>
                        <select id="chatStatus" className="form-control" value={chatStatus} onChange={handleOnChatStatusChange}>
                            <option value="CLOSED">Closed</option>
                        </select>
                    </div>
                    <div className="col-12 row">
                        <div className="col-md-12">
                            <div className="pt-1 pb-1">
                                <div className="text-center">
                                    <button type="button" className="btn waves-effect waves-light btn-primary mr-1" onClick={handleOnChatSubmit}>Submit</button>
                                    <button type="button" className="btn waves-effect waves-light btn-secondary" onClick={handleOnCancel}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            }
        </div>
    )
}

export default ChatEditor;