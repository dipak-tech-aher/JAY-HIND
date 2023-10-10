
import React from "react";
const OrdersByChannels = (props) => {
    const { orderCount } = props.data;
    const { TotalOrder, filterOrdersByChannel, setIsOrderByChannelPopupOpen } = props.handlers;

    return (
        <div className="skel-omni-tot-info-by-chnl skel-top-5-perf-base-sect">
            <div className="skel-top-title-icons">
                <span className="skel-heading mb-1">
                    Total Order by Channel
                </span>
                <div className="skel-omni-chnl-icons">
                    <a>
                        <i
                            className="material-icons"
                            onClick={() => TotalOrder(true)}
                        >
                            refresh
                        </i>
                    </a>

                </div>
            </div>

            <hr className="cmmn-hline" />
            <ul>
                {orderCount.map((x) => (
                    <li>
                        <span>{x?.order_channel}</span>{" "}
                        <span className={x?.order_channel === 'Email' ? "skel-count-chnl  skel-omni-chnl-email"
                            : x?.order_channel === 'Whatsapp Live Chat' ? "skel-count-chnl skel-omni-chnl-whtapp"
                                : (x?.order_channel === 'Walk In' || x?.order_channel.toUpperCase() === 'IVR') ? "skel-count-chnl skel-omni-chnl-walkin"
                                    : x?.order_channel === 'Instagram' ? "skel-count-chnl skel-omni-chnl-ig"
                                        : x?.order_channel === 'Telegram' ? "skel-count-chnl skel-omni-chnl-telg"
                                            : x?.order_channel === 'Facebook Live Chat' ? "skel-count-chnl skel-omni-chnl-fb"
                                                : (x?.order_channel === 'SelfCare' || x?.order_channel === 'Web Selfcare' || x?.order_channel === 'Web Application') ? "skel-count-chnl skel-omni-chnl-sc" :
                                                    "skel-count-chnl skel-omni-chnl-whtapp"}
                            onClick={e => {
                                filterOrdersByChannel(x?.order_channel);
                                setIsOrderByChannelPopupOpen(true);
                            }}
                        >
                            <>{x?.count}</>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default OrdersByChannels;