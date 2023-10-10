
import React from "react";
const InteractionsByChannels = (props) => {
    const { count } = props.data;
    const { TotalInterctionCount, filterInteractionsByChannel, setIsInteractionByChannelPopupOpen } = props.handlers;

    return (
        <div className="skel-omni-tot-info-by-chnl skel-top-5-perf-base-sect">
            <div className="skel-top-title-icons">
                <span className="skel-heading mb-1">
                    Total Interaction by Channel
                </span>
                <div className="skel-omni-chnl-icons">
                    <a>
                        <i className="material-icons"
                            onClick={() => TotalInterctionCount(true)}>
                            refresh
                        </i>
                    </a>
                </div>
            </div>
            <hr className="cmmn-hline" />
            <ul>
                {count.map((x) => (
                    <li>
                        <span>{x?.intxn_channel}</span>{" "}
                        <span className={
                            x?.intxn_channel === 'Email' ? "skel-count-chnl  skel-omni-chnl-email"
                                : x?.intxn_channel === 'Whatsapp Live Chat' ? "skel-count-chnl skel-omni-chnl-whtapp"
                                : (x?.intxn_channel === 'Walk In' || x?.intxn_channel.toUpperCase() === 'IVR') ? "skel-count-chnl skel-omni-chnl-walkin"
                                    : x?.intxn_channel === 'Instagram' ? "skel-count-chnl skel-omni-chnl-ig"
                                        : x?.intxn_channel === 'Telegram' ? "skel-count-chnl skel-omni-chnl-telg"
                                            : x?.intxn_channel === 'Facebook Live Chat' ? "skel-count-chnl skel-omni-chnl-fb"
                                                : (x?.intxn_channel === 'SelfCare' || x?.intxn_channel === 'Web Selfcare' || x?.intxn_channel === 'Web Application') ? "skel-count-chnl skel-omni-chnl-sc" :
                                                    "skel-count-chnl skel-omni-chnl-whtapp"}
                            onClick={e => {
                                filterInteractionsByChannel(x?.intxn_channel);
                                setIsInteractionByChannelPopupOpen(true);
                            }}
                        >
                            {<>{x.count}</>}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default InteractionsByChannels;