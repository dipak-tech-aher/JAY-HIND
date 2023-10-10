import React from 'react';
import Modal from 'react-modal';
import { RegularModalCustomStyles } from '../../../common/util/util';
import ChatEditor from '../ChatEditor';
import MailEditor from '../MailEditor';
import ChatDeatilsTab from '../shared/ChatDetailsTab';
import InteractionDeatilsPart1 from '../shared/InteractionDeatilsPart1';
import moment from 'moment';
import EmailDetailsTab from '../shared/EmailDetailsTab';

const ViewTicketDetailsModal = (props) => {

    const { isViewTicketDetailsOpen, detailedViewItem } = props.data;

    const { setIsViewTicketDetailsOpen } = props.handlers;

    return (
        <>
            <Modal isOpen={isViewTicketDetailsOpen} contentLabel="Worflow History Modal" style={RegularModalCustomStyles}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">View Helpdesk Ticket</h5>
                            <button type="button" className="close" onClick={() => setIsViewTicketDetailsOpen(!isViewTicketDetailsOpen)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="helpdesk-detail2 bg-white" id="server-details2x">
                                <div className="helpdesk-title">
                                    <div className="row">
                                        <div className="col-md-7">
                                            <h3>{detailedViewItem?.title || detailedViewItem?.name || detailedViewItem?.customerName}</h3>
                                        </div>
                                        <div className="col-md-5">
                                            <div className="tic-id">
                                                <p>Help Desk No #{detailedViewItem?.helpdeskNo || detailedViewItem?.chatId}</p>
                                                <p>Created on {detailedViewItem?.createdAt ? moment(detailedViewItem.createdAt).format('DD/MM/YYYY HH:mm') : ''}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-xl-12">
                                    <ul className="nav nav-tabs nav-bordered nav-justified">
                                        <li className="nav-item text-capitalize">
                                            <a href="#details" data-toggle="tab" aria-expanded="false" className="nav-link active">
                                                {detailedViewItem?.source?.toLowerCase()} Details
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a href="#helpdeskTicketDetails" data-toggle="tab" aria-expanded="true" className="nav-link">
                                                More Details
                                            </a>
                                        </li>
                                    </ul>
                                    <div className="tab-content p-0">
                                        <div className="tab-pane active" id="details">
                                            {
                                                detailedViewItem?.source === 'LIVECHAT' ? (
                                                    <ChatDeatilsTab
                                                        data={{
                                                            detailedViewItem,
                                                            readOnly: true
                                                        }}
                                                    />
                                                )
                                                    : (
                                                        <EmailDetailsTab
                                                            data={{
                                                                detailedViewItem
                                                            }}
                                                        />
                                                    )
                                            }
                                        </div>
                                        <div className="tab-pane" id="helpdeskTicketDetails">
                                            <InteractionDeatilsPart1
                                                data={{
                                                    detailedViewItem,
                                                    customerDetails: detailedViewItem?.customerDetails,
                                                    readOnly: true
                                                }}
                                                handlers={{
                                                    doSoftRefresh: () => { }
                                                }}
                                            />
                                            {
                                                detailedViewItem?.source === 'LIVECHAT' ? (
                                                    <ChatEditor
                                                        data={{
                                                            isDisabled: true,
                                                            detailedViewItem
                                                        }}
                                                        handlers={{
                                                            doSoftRefresh: () => { }
                                                        }}
                                                    />
                                                )
                                                    : (
                                                        <MailEditor
                                                            data={{
                                                                isDisabled: true,
                                                                isVerified: true,
                                                                detailedViewItem,
                                                            }}
                                                            handlers={{
                                                                doSoftRefresh: () => { }
                                                            }}
                                                        />
                                                    )
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <hr className="cmmn-hline" />
                <div className="col-12 row justify-content-center">
                    <button className="skel-btn-cancel" type="button" onClick={() => setIsViewTicketDetailsOpen(!isViewTicketDetailsOpen)}>Close</button>
                </div>
            </Modal>
        </>
    )
}

export default ViewTicketDetailsModal;