import { isEmpty } from 'lodash';
import moment from 'moment';
import React, { memo, useContext, useState } from 'react';
import { useEffect } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';
import { AppContext } from "../../../AppContext";

import { properties } from '../../../properties';
import { post } from '../../../common/util/restUtil';
import CannedMessageModal from '../CannedMessageModal';
import { Markup } from 'interweave';

const FacebookDetails = memo((props) => {
    const { detailedViewItem, isDisabled } = props.data;
    const { doSoftRefresh } = props.handlers;
    const [isCannedOpen, setIsCannedOpen] = useState(false);
    const [text, setText] = useState('');
    const [status, setStatus] = useState("");
    const [comment, setComment] = useState(false)
    const [like, setLike] = useState(true)
    const { auth } = useContext(AppContext)
    const [conversationIndex, setConversationIndex] = useState(-1);

    const { userId } = auth?.user;


    const handleOnRichTextChange = (e) => {
        const { target } = e
        setText(target.value)
    }
    const handleOnStatusChange = (e) => {
        const { value } = e.target;
        setStatus(value);
    }
    const handleOnCancel = () => {
        doSoftRefresh('CANCEL_VIEW');
    }

    const handleOnSubmit = () => {
        if (detailedViewItem?.status === status && (!text || text.trim() === '')) {
            toast.error('There is no change in status and reply to customer has not been specified')
            return false
        }
        if(isEmpty(text)){
            toast.error('Please Provide the Comments')
            return false
        }
        
        const requestBody = {
            message: text,
            referenceId: detailedViewItem?.referenceId,
            helpdeskId : detailedViewItem?.helpdeskId,
            userId
        }

        post(`${properties.INTEGRATION_API}/facebook/add-comment`, requestBody)
        .then((resp)=>{
            const { status, message } = resp
            if(status === 200){
                unstable_batchedUpdates(()=>{
                    setText('')
                    setComment(false)
                })
                doSoftRefresh('UPDATE_DETAILED_VIEW', detailedViewItem?.helpdeskId)
                toast.success(message);
            }
        }).catch(error => console.log(error))
        .finally()

    }

    useEffect(()=>{
        if (detailedViewItem?.conversation && !!detailedViewItem.conversation.length) {
            for (let idx = 0; idx < detailedViewItem.conversation.length; idx++) {
                if (detailedViewItem.conversation[idx].inOut === 'OUT') {
                    setConversationIndex(idx)
                    break
                }
            }
        }
    },[detailedViewItem])

    return (
        <>
            <div className="col-12 row pl-2 pt-2 m-0 helpdesk-padding-left-0">
                <div className="row col-12">
                    <div className="col-2 form-label">Subject:</div>
                    <div className="col-9 form-vtext">{detailedViewItem?.title}</div>
                </div>
                <div className="col-12 row pt-2">
                    <div className="col-4 form-label">Mail Content:</div>
                    <div className="col-12 form-vtext">{detailedViewItem?.content}</div>
                </div>
                <div className="col-12 row pt-2">
                    <div className="col-2 form-label">Action:</div>
                    <div>
                        {comment ?
                            <img className="fb-icon-comment" style={{ cursor:"pointer"}} src="https://img.icons8.com/material/24/000000/comments--v1.png" alt="..." title="Comment" onClick={() => { setComment(!comment) }} />
                            :
                            <img className="fb-icon-comment" style={{ cursor:"pointer"}} src="https://img.icons8.com/material-outlined/24/000000/comments--v1.png" alt="..." title="Comment" onClick={() => { setComment(!comment) }} />

                        }
                        {
                            like ?
                                <img className="fb-icon-like" style={{ cursor:"pointer"}} src="https://img.icons8.com/material-outlined/24/000000/facebook-like--v1.png" alt="..." title="unlike" onClick={() => { setLike(!like) }} />
                                :
                                <img className="fb-icon-like" style={{ cursor:"pointer"}} src="https://img.icons8.com/material/24/000000/facebook-like--v1.png" alt="..." title="like" onClick={() => { setLike(!like) }} />
                        }
                    </div>
                </div>
                {comment &&
                    <>
                        <div className='col-12 row pt-2'>
                            <div className="col-4 form-label">Reply Message:</div>
                            <div className={`form-vtext col-auto p-0 ml-auto ${isDisabled ? 'd-none' : ''}`}>
                                <button className='badge badge-pill badge-primary p-1' onClick={() => setIsCannedOpen(true)}>Reply from Canned Message</button>
                            </div>
                        </div>
                        <div className='col-12 mb-1'>
                        {
                    detailedViewItem?.conversation && !!detailedViewItem?.conversation?.length && conversationIndex > -1 && (
                        <>
                            <div className="col-12 row pt-2">
                                <div className="col-3 form-vtext">
                                    {detailedViewItem?.conversation[conversationIndex]?.sender}
                                    <div className='badge badge-pill badge-success'>{detailedViewItem?.conversation[conversationIndex]?.messageDateTime ? moment(detailedViewItem?.conversation[conversationIndex]?.messageDateTime).format('DD-MMM-YYYY HH:MM A') : ''}</div>
                                </div>
                                <div className="col-9 form-vtext">
                                    <Markup content={detailedViewItem?.conversation[conversationIndex]?.content} />
                                </div>
                            </div>
                        </>
                    )
                }
            </div>
                        <div className={`col-12 mt-2 pb-2 ${isDisabled ? 'd-none' : ''}`}>
                            <textarea rows="4" cols="78" id='description' className='form-control' name='description' onChange={handleOnRichTextChange}
                                value={text} placeholder="Add a Comment..."></textarea>
                        </div>
                    </>
                }

                <div className={`col p-0 mb-2 ${detailedViewItem?.laneSource === undefined || detailedViewItem?.laneSource === 'QUEUE' ? 'd-none' : ''}`}>
                    <div className="ds-form-group2 clearfix pt-2">
                        <div className="form-label">Update Status :</div>

                        <select id="mailStatus" className="form-control" value={status} onChange={handleOnStatusChange}>
                            {
                                (detailedViewItem && detailedViewItem.status === 'HOLD') ?
                                    <>
                                        <option value="">Select Status</option>
                                        <option value="WIP">Work In Progress</option>
                                    </>
                                    :
                                    <>
                                        <option value="WIP">Work In Progress</option>
                                        <option value="CLOSED">Closed</option>
                                    </>
                            }
                        </select>
                    </div>
                </div>
                <div className={`row col-12 justify-content-center ${detailedViewItem?.laneSource === undefined || detailedViewItem?.laneSource === 'QUEUE' ? 'd-none' : ''}`}>
                    <button type="button" className="btn waves-effect waves-light btn-primary mr-1" onClick={handleOnSubmit}>Post</button>
                    <button type="button" className="btn waves-effect waves-light btn-secondary" onClick={handleOnCancel}>Cancel</button>
                </div>
                {
                    isCannedOpen &&
                    <CannedMessageModal
                        data={{
                            isCannedOpen
                        }}
                        handlers={{
                            setIsCannedOpen,
                            setText
                        }}
                    />
                }
            </div>
        </>
    )

})

export default FacebookDetails