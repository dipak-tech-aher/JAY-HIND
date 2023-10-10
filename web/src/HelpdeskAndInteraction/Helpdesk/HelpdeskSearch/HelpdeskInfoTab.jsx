import React from 'react';
import MailEditor from '../MailEditor';
import ChatDetailsTab from '../shared/ChatDetailsTab';

const HelpdeskInfoTab = (props) => {
    const { detailedViewItem } = props.data;
    const doSoftRefresh = props?.handlers?.doSoftRefresh

    console.log('detailedViewItem?.helpdeskSource', detailedViewItem?.helpdeskSource)
    return (
        <div className="full-width-bg mt-0">
            <section className="">

                <h5 id="list-item-1">Details</h5>

                {
                    detailedViewItem?.helpdeskSource?.code === 'LIVECHAT' ? (
                        <ChatDetailsTab
                            data={{
                                detailedViewItem: !!detailedViewItem?.chat?.length ? detailedViewItem?.chat[0] : detailedViewItem,
                                readOnly: true
                            }}
                        />
                    )
                        : (
                            <MailEditor
                                data={{
                                    isDisabled: detailedViewItem?.status?.code !== 'HS_ESCALATED',
                                    isVerified: true,
                                    detailedViewItem,
                                }}
                                handlers={{
                                    doSoftRefresh: doSoftRefresh
                                }}
                            />
                        )
                }
            </section>
        </div>
    )
}

export default HelpdeskInfoTab;