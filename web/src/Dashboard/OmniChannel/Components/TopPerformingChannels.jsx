
import React from "react";
const TopPerformingChannels = (props) => {
    const { topPerforming } = props.data;
    const { getChannelClassName,getChannelIcon } = props.handlers;

    return (

        <div className="skel-omni-all-top-5-chnl mt-2">
            <span className="skel-header-title">Top 5 Performing Channel</span>
            {topPerforming === "0" ? (
                <div className="noRecord">
                    <p>NO RECORDS FOUND</p>
                </div>
            ) : (
                <div className="skel-omni-perf-chnl">
                    {topPerforming && topPerforming.length > 0 && topPerforming.map((x) => (
                        <div className="skel-top-chnl-perf">
                            {x.channel && (
                                <span className={getChannelClassName(x.channel)}>
                                    {getChannelIcon(x.channel)}
                                </span>
                            )}
                            {x.channel && (
                                <>
                                    <p>
                                        <span className="skel-omni-chnl-per">{x.count}</span> of <b>{x.type}</b> created by{" "}
                                        <span className={getChannelClassName(x.channel)}>
                                            {x.channel}
                                        </span>
                                    </p>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default TopPerformingChannels;