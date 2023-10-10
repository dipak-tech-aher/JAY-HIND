import React, { memo, useEffect, useState } from 'react';
import moment from 'moment';
import MailEditor from './MailEditor';
import { unstable_batchedUpdates } from 'react-dom';
import InteractionDeatilsPart1 from './shared/InteractionDeatilsPart1';
import ChatEditor from './ChatEditor';
import ChatDetailsTab from './shared/ChatDetailsTab';
import EmailDetailsTab from './shared/EmailDetailsTab';
import CloseHelpdeskTicket from './CloseHelpdeskTicket'
import WhatsappChatTab from './shared/WhatsappChatTab';
import FacebookDetails from './shared/FacebookDetailsTab';

const DetailedView = memo((props) => {

    const { detailedViewItem, socket } = props.data;
    const { doSoftRefresh } = props.handlers;
    const [customerDetails, setCustomerDetails] = useState(null);
    const [isDisabled, setIsDisabled] = useState(false);
    const [isVerified, setIsVerified] = useState(false);


    useEffect(() => {
        unstable_batchedUpdates(() => {
            // console.log('Detailed View Use Effect', detailedViewItem.customerDetails)
            setCustomerDetails(detailedViewItem.customerDetails);
            setIsDisabled(detailedViewItem?.laneSource === 'QUEUE' || ['HOLD', 'CLOSED'].includes(detailedViewItem.status) ? true : false);
        })
    }, [detailedViewItem])

    useEffect(() => {
        setIsVerified(['HOLD', 'NEW'].includes(detailedViewItem.status) ? true : customerDetails && !!Object.keys(customerDetails).length ? true : false);
    }, [customerDetails, detailedViewItem])

    return (
        <div className="helpdesk-detail bg-white skel-helpdesk-sortable-list" id="server-details1">
            <div className="helpdesk-title">
                <div className="row">
                    <div className="col-md-7">
                        <h3>{detailedViewItem?.helpdeskSubject || detailedViewItem?.name || detailedViewItem?.customerName}</h3>
                    </div>
                    <div className="col-md-5 pt-1">
                        <div className="tic-id">
                            <p>Help Desk No #{detailedViewItem?.helpdeskNo}</p>
                            <p>Created on {detailedViewItem?.createdAt ? moment(detailedViewItem.createdAt).format('DD/MM/YYYY HH:mm') : ''}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className='col-12'>
                <ul className="nav nav-tabs nav-bordered nav-justified">
                    <li className="nav-item text-capitalize">
                        <a key="helpdeskInfo" href="#details" data-toggle="tab" aria-expanded="false" className={`nav-link active`}>
                            Helpdesk Info
                        </a>
                    </li>
                    <li className="nav-item">
                        <a key="moreDetails" href="#interactionDetails" data-toggle="tab" aria-expanded="true" className={`nav-link`}>
                            More Details
                        </a>
                    </li>
                </ul>
                <div className="tab-content p-0">
                    <div className="tab-pane active skel-helpdesk-mh" id="details">
                        <div className="">
                            <div className="col-12">
                                <div className="">
                                    <div className="card-body p-0 pl-4 ml-2">
                                        {
                                            // detailedViewItem?.source === 'LIVECHAT' ? (
                                            //     <ChatDetailsTab
                                            //         data={{
                                            //             detailedViewItem
                                            //         }}
                                            //     />
                                            // ) : detailedViewItem?.source === 'WHATSAPP' ? (
                                            //     <WhatsappChatTab
                                            //         data={{
                                            //             detailedViewItem,
                                            //             socket
                                            //         }}
                                            //     />
                                            // )
                                            //     :
                                                 (

                                                    <EmailDetailsTab
                                                        data={{
                                                            detailedViewItem
                                                        }}
                                                    />
                                                )
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="tab-pane skel-helpdesk-mh" id="interactionDetails">
                        <InteractionDeatilsPart1
                            data={{
                                detailedViewItem,
                                customerDetails
                            }}
                            handlers={{
                                doSoftRefresh
                            }}
                        />
                        {
                            ['LIVECHAT', 'WHATSAPP', 'TELEGRAM'].includes(detailedViewItem?.source) ? (
                                <ChatEditor
                                    data={{
                                        isVerified,
                                        detailedViewItem
                                    }}
                                    handlers={{
                                        doSoftRefresh
                                    }}
                                />
                            ) : detailedViewItem?.source === 'Email' ? (
                                <MailEditor
                                    data={{
                                        isDisabled,
                                        isVerified,
                                        detailedViewItem,
                                    }}
                                    handlers={{
                                        doSoftRefresh
                                    }}
                                />
                            )
                            : detailedViewItem?.source === 'FACEBOOK' ? (
                                <FacebookDetails
                                    data={{
                                        isDisabled,
                                        isVerified,
                                        detailedViewItem,
                                    }}
                                    handlers={{
                                        doSoftRefresh
                                    }}
                                />
                            )
                                : <CloseHelpdeskTicket data={{
                                    isDisabled,
                                    isVerified,
                                    detailedViewItem,
                                }}
                                    handlers={{
                                        doSoftRefresh
                                    }}>
                                </CloseHelpdeskTicket>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
})

export default DetailedView;