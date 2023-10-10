
import React from "react";
const Counts = (props) => {
    const { countsData } = props.data;

    return (
        <div className="skel-dash-four">
            <div className="card-skel-info">
                <h4>New Orders</h4>
                <div className="dash-skel-top-info">
                    <span className="skel-value">{
                        countsData?.orderCounts === 0 ? 0 : countsData?.orderCounts[0]?.o_new_cont
                    }</span>
                    <span className="skel-perc"><i className="material-icons">arrow_drop_up</i> +{
                        countsData?.orderCounts === 0 ? 0 : Number(countsData?.orderCounts[0]?.o_growth)?.toFixed(2)
                    }%</span>
                    <span className="skel-graph"><img src="./assets/images/graph-p.svg" alt="" className="img-fluid" /></span>
                </div>
            </div>
            <div className="card-skel-info">
                <h4>New Interactions</h4>
                <div className="dash-skel-top-info">
                    <span className="skel-value">{countsData?.interactionCounts === 0 ? 0 : countsData?.interactionCounts[0]?.o_new_cont}</span>
                    <span className="skel-perc"><i className="material-icons">arrow_drop_up</i> +{countsData?.interactionCounts === 0 ? 0 : Number(countsData?.interactionCounts[0]?.o_growth)?.toFixed(2)}%</span>
                    <span className="skel-graph"><img src="./assets/images/graph-y.svg" alt="" className="img-fluid" /></span>
                </div>
            </div>
            <div className="card-skel-info">
                <h4>No of Sales</h4>
                <div className="dash-skel-top-info">
                    <span className="skel-value">{countsData?.salesCounts === 0 ? 0 : countsData?.interactionCounts[0]?.o_new_cont}</span>
                    <span className="skel-perc"><i className="material-icons">arrow_drop_up</i> +{
                        countsData?.salesCounts === 0 ? 0 : Number(countsData?.interactionCounts[0]?.o_growth)?.toFixed(2)}%</span>
                    <span className="skel-graph"><img src="./assets/images/graph-g.svg" alt="" className="img-fluid" /></span>
                </div>
            </div>
        </div>
    )
}

export default Counts;