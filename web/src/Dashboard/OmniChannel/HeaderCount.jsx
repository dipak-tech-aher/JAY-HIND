import React from "react";

const HeaderCount = (props) => {
    let {
        iss,
        issueResolvedWalkin,
        InteractionChannel,
        corner,
        OrderChannel,
        order,
        AppointmentChannel,
        totalAppointment,
        SalesChannel,
        Averagechannel,
        viewType,
        totalRevenueByChannel,
        liveSupport,
        liveSupportData,
        topCustomersByChannel,
        prospect,
        averagePerformanceByChannel
    } = props?.data

    const { setIsInteractionByDynamicChannelPopupOpen, setIsOrderByDynamicChannelPopupOpen, setIsAppointmentByChannelPopupOpen,
        filterTopCustomerByChannel,
        setIsTopCustomerByChannelPopupOpen,
        setIsLiveSupportByChannelPopupOpen, filterAppointmentsByChannel, filterLiveSupportByChannel,
        filterProspectByChannel,
        setIsProspectByChannelPopupOpen,
        filterInteractionsByChannelAndBotOrHuman,
        setIsInteractionByChannelPopupOpen,
        filterLiveSupportDataByChannel
    } = props?.handlers;

    let viewTypes = viewType;
    console.log('viewTypes------>', viewTypes)
    switch (viewTypes) {
        case "WHATSAPP-LIVECHAT":
            viewTypes = 'Whatsapp Live Chat';
            break;
        case "FB-LIVECHAT":
            viewTypes = 'Facebook Live Chat';
            break;
        case "EMAIL":
            viewTypes = 'Email';
            break;
        case "MOBILEAPP":
            viewTypes = 'Mobile APP';
            break;
        case "SELFCARE":
            viewTypes = 'SelfCare';
            break;
        case "TELEGRAM":
            viewTypes = 'Telegram';
            break;
        case "INSTAGRAM":
            viewTypes = 'Instagram';
            break;

        default:
            viewTypes = viewType;
            break;
    }

    return (
        <>
            <div className="skel-top-indiv-chnl-list">
                <div className="skel-chnl-int-indiv skel-indiv-interaction">
                    <div className="skel-chnl-tot-indiv">
                        <span className="skel-omni-indiv-img">
                            <img src={InteractionChannel} />
                        </span>
                        <p>
                            <span>Interaction</span>
                            <span className="font-21" onClick={e => {
                                setIsInteractionByDynamicChannelPopupOpen(true);
                            }} >
                                {corner?.length}</span>
                        </p>
                    </div>
                </div>

                <div className="skel-chnl-int-indiv skel-indiv-order">
                    <div className="skel-chnl-tot-indiv">
                        <span className="skel-omni-indiv-img">
                            <img src={OrderChannel} />
                        </span>
                        <p>
                            <span>Order</span>
                            <span className="font-21" onClick={e => {
                                setIsOrderByDynamicChannelPopupOpen(true);
                            }}>
                                {
                                    order?.length
                                }
                            </span>
                        </p>
                    </div>
                </div>

                <div className="skel-chnl-int-indiv skel-indiv-appointment">
                    <div className="skel-chnl-tot-indiv">
                        <span className="skel-omni-indiv-img">
                            <img src={AppointmentChannel} />
                        </span>
                        <p>
                            <span>Appointment</span>
                            <span className="font-21" onClick={e => {
                                filterAppointmentsByChannel(viewTypes)
                                setIsAppointmentByChannelPopupOpen(true);
                            }}> {totalAppointment && totalAppointment?.length > 0 && totalAppointment?.filter((ele) => ele?.appointment_channel?.toUpperCase() === viewTypes?.toUpperCase())[0]?.count || 0}</span>
                        </p>
                    </div>
                </div>

                <div className="skel-chnl-int-indiv skel-indiv-sales">
                    <div className="skel-chnl-tot-indiv">
                        <span className="skel-omni-indiv-img">
                            <img src={SalesChannel} />
                        </span>
                        <p>
                            <span>Total Sales</span>
                            <span className="font-21">${
                                totalRevenueByChannel && totalRevenueByChannel?.length > 0 && totalRevenueByChannel?.filter((ele) => ele?.channel?.toUpperCase() === viewTypes?.toUpperCase())[0]?.count || 0
                            }</span>
                        </p>
                    </div>
                </div>

                <div className="skel-chnl-int-indiv skel-indiv-avgperformance">
                    <div className="skel-chnl-tot-indiv">
                        <span className="skel-omni-indiv-img">
                            <img src={Averagechannel} />
                        </span>
                        <p>
                            <span>Avg. Performance</span>
                            <span className="font-21">{averagePerformanceByChannel && averagePerformanceByChannel?.length > 0 && averagePerformanceByChannel[0]?.average}%</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="skel-top-indiv-chnl-list-data">
                <div className="skel-overall-info-chnl-indiv skel-prospect-orange">
                    <p>Prospect Generated</p>
                    {console.log('prospect--------->', prospect)}
                    <p className="font-21" onClick={e => {
                        filterProspectByChannel(viewTypes);
                        setIsProspectByChannelPopupOpen(true);
                    }}>
                        {prospect?.filter((ele) => ele?.prospect_channel?.toUpperCase() === viewTypes?.toUpperCase())[0]?.count || 0}
                    </p>
                </div>
                <div className="skel-overall-info-chnl-indiv skel-total-blue">
                    <p>Live Support By</p>
                    {console.log('liveSupportData------->', liveSupportData)}
                    {
                        // liveSupportData && liveSupportData?.length > 0 && liveSupportData?.filter((ele) => ele?.channel_desc?.toUpperCase() === viewTypes?.toUpperCase())?.length > 0 ?

                            liveSupportData?.filter((ele) => ele?.channel_desc?.toUpperCase() === viewTypes?.toUpperCase())?.map((x) => (
                                <p className="font-21" onClick={e => {
                                    filterLiveSupportDataByChannel(x?.channel_desc);
                                    setIsLiveSupportByChannelPopupOpen(true);
                                }}>
                                    {liveSupportData && liveSupportData?.length > 0 && liveSupportData?.filter((ele) => ele?.channel_desc?.toUpperCase() === viewTypes?.toUpperCase())?.length || 0}
                                </p>)
                                )

                            // : <p className="font-21">0</p>
                    }
                </div>
                <div className="skel-overall-info-chnl-indiv skel-lv-support-rose">
                    <p>Total Customers By</p>
                    <p className="font-21">
                        {
                            topCustomersByChannel && topCustomersByChannel?.length > 0 &&
                                topCustomersByChannel?.filter((ele) => ele?.topCustomer_channel?.toUpperCase() === viewTypes?.toUpperCase())?.length > 0 ?

                                topCustomersByChannel?.filter((ele) => ele?.topCustomer_channel?.toUpperCase() === viewTypes?.toUpperCase())?.map((x) => (
                                    <p className="font-21" onClick={e => {
                                        filterTopCustomerByChannel(x?.topCustomer_channel);
                                        setIsTopCustomerByChannelPopupOpen(true);
                                    }}>
                                        {x?.count || 0}
                                    </p>))
                                : <p className="font-21">0</p>
                        }
                    </p>
                </div>
                <div className="skel-overall-info-chnl-indiv-solved skel-issue-solved-blue">
                    <p className="ml-2 brd-right-sect">
                        Issue Resolved By
                    </p>
                    <div className="chnl-bots-h-solved">
                        {Object.keys(issueResolvedWalkin)?.map((x) => (
                            <>
                                <p>
                                    <span>
                                        Bot
                                    </span>
                                    <span className="font-21" onClick={e => {
                                        filterInteractionsByChannelAndBotOrHuman(x, 'BOT');
                                        setIsInteractionByChannelPopupOpen(true);
                                    }}>{issueResolvedWalkin[x]?.bot || 0}</span>
                                </p>
                                <p>
                                    <span>
                                        HUMAN
                                    </span>
                                    <span className="font-21" onClick={e => {
                                        filterInteractionsByChannelAndBotOrHuman(x, 'HUMAN');
                                        setIsInteractionByChannelPopupOpen(true);
                                    }}>{issueResolvedWalkin[x]?.human || 0}</span>
                                </p>
                            </>
                        ))}
                    </div>
                </div>
            </div>
        </>
    )
}

export default HeaderCount;