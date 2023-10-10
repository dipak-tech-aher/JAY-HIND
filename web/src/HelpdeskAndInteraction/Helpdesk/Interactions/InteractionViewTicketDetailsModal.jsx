import React from 'react';
import Modal from 'react-modal';
import EditTicketsLandingPage from '../../Interaction/Complaint/EditTicketsLandingPage';
import { RegularModalCustomStyles } from '../../../common/util/util';

const InteractionViewTicketDetailsModal = (props) => {
    const { isViewTicketDetailsOpen, interactionData, detailedViewItem } = props.data;

    // console.log('InteractionViewTicketDetailsModal', interactionData, detailedViewItem)

    const { setIsViewTicketDetailsOpen } = props.handlers;
    return (
        <Modal isOpen={isViewTicketDetailsOpen} contentLabel="Worflow History Modal" style={RegularModalCustomStyles}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">View Interaction</h4>
                        <button type="button" className="close" onClick={() => setIsViewTicketDetailsOpen(!isViewTicketDetailsOpen)}>×</button>
                    </div>
                    <div className="modal-body hd-ticket">
                        <EditTicketsLandingPage location={{
                            state: {
                                data: {
                                    fromHelpDesk: true,
                                    helpDeskView: 'QUEUE',
                                    detailedViewItem,
                                    ...interactionData?.current
                                }
                            }
                        }} />
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default InteractionViewTicketDetailsModal;