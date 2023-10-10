import React from 'react';
import { Element } from 'react-scroll';
import ChatEditor from '../ChatEditor';
import CustomerDetailsView from '../CustomerDetailsView';
// import EmailDetailsTab from '../shared/EmailDetailsTab';
import HelpdeskInfoTab from './HelpdeskInfoTab';

const MoreDetailsTab = (props) => {
    const { detailedViewItem } = props?.data;
    const doSoftRefresh = props?.handlers?.doSoftRefresh

    return (
        <Element name="ticketDetailsSection">
            {
                detailedViewItem ? (
                    <div className="full-width-bg mt-2 skel-helpdesk-ticket">
                        <div className="skel-interaction-details-search-sect">
                            
                            <h5 id="list-item-1" className='mb-2'>Interaction Details</h5>

                            <CustomerDetailsView
                                data={{
                                    customerDetails: detailedViewItem?.customerDetails,
                                    helpdeskId: undefined,
                                    readOnly: true,
                                    detailedViewItem
                                }}
                                handler={{
                                    doSoftRefresh: () => { }
                                }}

                            />
                        
                        {
                            detailedViewItem?.source === '' ? (
                                <ChatEditor
                                    data={{
                                        isDisabled: true,
                                        isVerified: false,
                                        detailedViewItem: !!detailedViewItem?.chat?.length ? detailedViewItem?.chat[0] : detailedViewItem
                                    }}
                                    handlers={{
                                        doSoftRefresh: () => { }
                                    }}
                                />
                            )
                                : (
                                    // <EmailDetailsTab
                                    //     data={{
                                    //         detailedViewItem
                                    //     }}
                                    // />
                                        <></>
                                )
                            }
                        </div>
                        <div className="skel-helpdeskinfo-search">
                        {
                            <HelpdeskInfoTab
                                data={{
                                    detailedViewItem
                                }}
                                handlers={{
                                    doSoftRefresh: doSoftRefresh
                                }}
                            />
                            }
                        </div>
                    </div>
                )
                    : (
                        <h5 className='text-center py-2'>Loading...</h5>
                    )
            }
        </Element>
    )
}

export default MoreDetailsTab;