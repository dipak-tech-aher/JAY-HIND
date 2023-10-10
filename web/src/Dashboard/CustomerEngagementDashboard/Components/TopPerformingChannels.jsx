
import React from "react";
const TopPerformingChannels = (props) => {
    const { topPerforming } = props.data
    return (
        <div className="skel-channel-top">
            <span className="skel-b-title">Top 5 channels by performance</span>
            {topPerforming?.map((ele) => {
                return <div className="card-channel-skel">
                    <span className="skel-title">Email</span>
                    <span className="skel-value">62k</span>
                    <span className="skel-perc"><i className="material-icons">arrow_drop_up</i> +31.5%</span>
                </div>
            })}
        </div>
    )
}

export default TopPerformingChannels;