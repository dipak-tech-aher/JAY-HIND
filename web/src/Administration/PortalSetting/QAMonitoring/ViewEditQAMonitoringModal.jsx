import React from 'react';
import Modal from 'react-modal';
import { RegularModalCustomStyles } from '../../../common/util/util';
import AddEditViewEvaluationSection from './shared/AddEditViewEvaluationSection';
import AddEditViewGuidelines from './shared/AddEditViewGuidelines';

const ViewEditQAMonitoringModal = (props) => {
    const { isOpen, viewScreen, source, helperValues, viewEditData } = props.data;
    const { setIsOpen, doSoftRefresh } = props.handlers;

    return (
        <Modal isOpen={isOpen} contentLabel="Worflow History Modal" style={RegularModalCustomStyles}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title text-capitalize">{viewScreen.toLowerCase()} {helperValues[source]['title']}</h4>
                        <button type="button" className="close" onClick={() => setIsOpen(!isOpen)}>×</button>
                    </div>
                    <div className="modal-body">
                        {
                            source === 'EVALUATION' ? (
                                <AddEditViewEvaluationSection
                                    data={{
                                        viewScreen,
                                        source,
                                        helperValues,
                                        viewEditData
                                    }}
                                    handlers={{
                                        setIsOpen,
                                        doSoftRefresh
                                    }}
                                />
                            ) : (
                                <AddEditViewGuidelines
                                    data={{
                                        viewScreen,
                                        source,
                                        helperValues,
                                        viewEditData
                                    }}
                                    handlers={{
                                        setIsOpen,
                                        doSoftRefresh
                                    }}
                                />
                            )
                        }
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default ViewEditQAMonitoringModal;