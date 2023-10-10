import React from 'react';
import Modal from 'react-modal';
import { RegularModalCustomStyles } from '../../common/util/util';

const ViewWorkflowModal = (props) => {
    const { isOpen } = props.data;
    const { setIsOpen } = props.handlers;

    return (
        <Modal isOpen={isOpen} contentLabel="Worflow History Modal" style={RegularModalCustomStyles}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">Uploaded Data</h4>
                        <button type="button" className="close" onClick={() => setIsOpen(!isOpen)}>×</button>
                    </div>
                    <div className="modal-body">
                        <div className="row">

                        </div>
                        <div className="row pt-4">
                            <button className="btn btn-secondary btn-sm mx-auto" type="button" data-dismiss="modal" onClick={() => setIsOpen(!isOpen)}>Close</button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default ViewWorkflowModal;