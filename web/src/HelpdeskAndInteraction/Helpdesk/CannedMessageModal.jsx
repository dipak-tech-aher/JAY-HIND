import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';

import { get } from '../../common/util/restUtil';
import { properties } from '../../properties';
import { RegularModalCustomStyles } from '../../common/util/util';
import { unstable_batchedUpdates } from 'react-dom';

const CannedMessageModal = (props) => {
    const { isCannedOpen } = props.data;
    const { setIsCannedOpen, setText } = props.handlers;

    const [cannedMessageLookup, setCannedMessageLookup] = useState([]);
    const [message, setMessage] = useState("")

    useEffect(() => {
        getCannedMessages();
    }, [])

    const getCannedMessages = () => {
        
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=CANNED_MESSAGE')
            .then((response) => {
                const { data } = response;
                setCannedMessageLookup(data['CANNED_MESSAGE']);
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

    const handleOnCannedMessageChange = (e) => {
        const { target } = e;
        setMessage(target.value);
    }

    const handleOnInsertMessage = () => {
        unstable_batchedUpdates(() => {
            setText(message);
            setIsCannedOpen(false);
        })
    }

    return (
        <Modal isOpen={isCannedOpen} contentLabel="Worflow History Modal" style={RegularModalCustomStyles}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">Canned Response Message</h4>
                        <button type="button" className="close" onClick={() => setIsCannedOpen(!isCannedOpen)}>×</button>
                    </div>
                    <div className="modal-body">
                        <div className="row">
                            <div className="col-lg-12 row">
                                {
                                    cannedMessageLookup.map((message) => (
                                        <div className="col-6" key={message.code}>
                                            <div className="mt-3">
                                                <div className="custom-control custom-radio pt-1">
                                                    <input type="radio" value={message.description} onChange={handleOnCannedMessageChange} id={`customRadio-${message.code}`} name='cannedNames' className="custom-control-input" />
                                                    <label className="custom-control-label" htmlFor={`customRadio-${message.code}`}>{message.description}</label>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                        <div className="col-12 row text-center offset-4 pt-4">
                            <button className="skel-btn-cancel" type="button" data-dismiss="modal" onClick={() => setIsCannedOpen(!isCannedOpen)}>Close</button>
                            <button className="skel-btn-submit" type="button" data-dismiss="modal" onClick={handleOnInsertMessage}>Insert message to reply text area</button>
                        
                            
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default CannedMessageModal;
