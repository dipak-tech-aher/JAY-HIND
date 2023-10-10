import React, { memo, useCallback, useState } from 'react';
import moment from 'moment';
import { Markup } from 'interweave';
import DesignatedStaffDetails from './DesignatedStaffDetails';
import ChatDetailsTab from '../../shared/ChatDetailsTab';
import SendMessage from './SendMessage';
import MultipleAttachments from './MultipleAttachments';

import { post } from '../../../../common/util/restUtil';
import { properties } from '../../../../properties';
import { Element } from 'react-scroll';

const HelpDeskHistory = memo((props) => {
    const { detailedViewItem, helpDeskView } = props.data;

    const [helpdeskDetailedViewItem, setHelpdeskDetailedViewItem] = useState(detailedViewItem);

    const helpdeskOrChat = helpdeskDetailedViewItem?.helpdeskDetails ? 'helpdeskDetails' : 'chatDetails';

    const mappingObject = helpdeskDetailedViewItem[helpdeskOrChat]?.txnDetails || helpdeskDetailedViewItem?.conversation;

    const getInteractionAssignedQueueList = () => {
        
        return new Promise((resolve, reject) => {
            const requestBody = {
                status: "",
                assign: true
            }
            post(`${properties.INTERACTION_API}/helpdesk`, requestBody)
                .then((response) => {
                    const { status, data } = response;
                    if (status === 200 && !!Object.keys(data).length) {
                        data?.rows?.forEach((d) => {
                            d?.chatDetails?.message?.forEach((m, i) => {
                                if (i === 0) {
                                    d.chatDetails.messageColorAlign = []
                                }
                                d.chatDetails.messageColorAlign.push({ ...m })
                            })
                        })
                        // console.log(data?.rows);
                        resolve(data.rows);
                    }
                })
                .catch(error => {
                    console.error(error);
                    reject(error);
                })
                .finally()
        })
    }

    const doSoftRefresh = useCallback(() => {
        const response = getInteractionAssignedQueueList();
        response.then((resolved, rejected) => {
            if (resolved) {
                const item = resolved?.find((view) => view?.intxnId === helpdeskDetailedViewItem?.intxnId)
                if (item) {
                    setHelpdeskDetailedViewItem({
                        ...item,
                        laneSource: helpdeskDetailedViewItem?.laneSource
                    })
                }
            }
        }).catch(error => console.log(error))
    }, [helpdeskDetailedViewItem?.intxnId, helpdeskDetailedViewItem?.laneSource])

    const getFistNameUsingSplit = (name) => {
        let textArray = name?.split(' ') || [];
        let firstCharText = "";
        textArray?.forEach((ele) => {
            firstCharText = firstCharText + ele?.toLocaleUpperCase()?.charAt();
        })
        return firstCharText;
    }

    const getFirstCharOfNameBasedOnStructure = (data) => {
        if (data?.customerDetails?.customer) {
            return getFistNameUsingSplit(data?.customerDetails?.customer?.fullName);
        }
        else {
            let firstName = getFistNameUsingSplit(data?.customerDetails?.firstName || '');
            let lastName = getFistNameUsingSplit(data?.customerDetails?.lastName || '');
            return `${firstName?.concat(lastName)}`
        }
    }

    return (
        <Element name="HelpdeskInfoSection">
        <div className="col-12 p-0">
            {
                (helpdeskDetailedViewItem?.chatDetails || (!!detailedViewItem?.chat?.length && ['Search', 'Incident', 'QA-View', 'Customer360'].includes(helpDeskView))) &&
                <ChatDetailsTab
                    data={{
                        detailedViewItem: helpdeskDetailedViewItem.chatDetails || detailedViewItem?.chat[0],
                        readOnly: true
                    }}
                />
            }
            <div className="m-0">
                {
                    (helpdeskDetailedViewItem?.helpdeskDetails || (helpdeskDetailedViewItem?.source === 'E-MAIL' && ['Search', 'Incident', 'QA-View', 'Customer360'].includes(helpDeskView))) && (
                        <div className="mb-3 pt-2 helpd-history">
                            <h5 className="font-18 pl-2">{helpdeskDetailedViewItem?.helpdeskDetails?.title || helpdeskDetailedViewItem?.title}</h5>
                            <hr />
                            <div className="row">
                                <div className="col-1 text-left pt-2">
                                    <span className="avatar-title1 bg-soft-secondary text-secondary font-16 rounded-circle">
                                        {
                                            `${getFistNameUsingSplit(helpdeskDetailedViewItem?.helpdeskDetails?.name || helpdeskDetailedViewItem?.name)}`
                                        }
                                    </span>
                                </div>
                                <div className="col-11">
                                    <div className="col-12 row">
                                        <div className="col-6">
                                            <span>
                                                <h5 className="text-blue text-left">{helpdeskDetailedViewItem?.helpdeskDetails?.name || helpdeskDetailedViewItem?.name}</h5>
                                            </span>
                                            <span>-</span>
                                        </div>
                                        <div className="col-6 text-right">
                                            <p>{helpdeskDetailedViewItem?.helpdeskDetails?.createdAt || helpdeskDetailedViewItem?.createdAt ? moment(helpdeskDetailedViewItem?.helpdeskDetails?.createdAt || helpdeskDetailedViewItem?.createdAt).format('MMM DD, YYYY, HH:mm A') : ''}</p>
                                            <p>{helpdeskDetailedViewItem?.helpdeskDetails?.email || helpdeskDetailedViewItem?.email}</p>
                                        </div>
                                    </div>
                                    <hr />
                                    <div className="row col-12 bg-light p-2">
                                        <Markup content={helpdeskDetailedViewItem?.helpdeskDetails?.content || helpdeskDetailedViewItem?.content} />
                                        <hr />
                                        <MultipleAttachments
                                            data={{
                                                entityId: helpdeskDetailedViewItem?.helpdeskDetails?.helpdeskId || helpdeskDetailedViewItem?.helpdeskId,
                                                entityType: 'HELPDESK'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }
                <div className="mb-3 mt-4">
                    {
                        (!!helpdeskDetailedViewItem[helpdeskOrChat]?.txnDetails?.length || (!!helpdeskDetailedViewItem?.conversation?.length && ['Search', 'Incident', 'QA-View', 'Customer360'].includes(helpDeskView))) &&
                        mappingObject?.map((reply, idx) => (
                            <div className="row col-12 p-2" key={idx}>
                                <div className="col-1 text-left pt-2">
                                    <span className="avatar-title1 bg-soft-secondary text-secondary font-16 rounded-circle">
                                        {
                                            reply?.inOut === 'OUT' ? (
                                                `${getFistNameUsingSplit(reply?.createdByDetails?.firstName || '')}${getFistNameUsingSplit(reply?.createdByDetails?.lastName || '')}`
                                            ) : (
                                                getFirstCharOfNameBasedOnStructure(helpdeskDetailedViewItem)
                                            )
                                        }

                                    </span>
                                </div>
                                <div className="col-11">
                                    <div className="col-12 row">
                                        <div className="col-6">
                                            <span>
                                                <h5 className="text-blue text-capitalize">
                                                    {
                                                        reply?.inOut === 'OUT' ? (
                                                            `${reply?.createdByDetails?.firstName || ''} ${reply?.createdByDetails?.lastName || ''}`
                                                        )
                                                            : (
                                                                (`${helpdeskDetailedViewItem?.customerDetails?.customer?.fullName || ''}`) || (`${helpdeskDetailedViewItem?.customerDetails?.firstName || ''} ${helpdeskDetailedViewItem?.customerDetails?.lastName || ''}`)
                                                            )
                                                    }
                                                </h5>
                                            </span>
                                            <span>-</span>
                                        </div>
                                        <div className="col-6 text-right">
                                            <p>{reply?.createdAt ? moment(reply?.createdAt).format('MMM DD, YYYY, HH:mm A') : ''}</p>
                                            <p>{reply?.createdByDetails?.email}</p>
                                        </div>
                                    </div>
                                    <hr />
                                    <div className="row col-12 bg-light p-2">
                                        <Markup content={reply?.content} />
                                        <hr />
                                        <MultipleAttachments
                                            data={{
                                                entityId: reply?.helpdeskTxnId,
                                                entityType: 'HELPDESKTXN'
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                    }
                </div>
                {
                    helpDeskView !== 'QA-View' &&
                    <DesignatedStaffDetails
                        data={{
                            detailedViewItem: helpdeskDetailedViewItem,
                            helpDeskView
                        }}
                    />
                }
                {
                    helpDeskView === 'ASSIGNED' &&
                    <SendMessage
                        data={{
                            detailedViewItem: helpdeskDetailedViewItem
                        }}
                        handlers={{
                            doSoftRefresh
                        }}
                    />
                }
            </div>
        </div>
        </Element>
    )
})

export default HelpDeskHistory;