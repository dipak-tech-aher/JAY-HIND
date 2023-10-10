
import React from "react";
const Sales = (props) => {
    const { salesCounts } = props.data;
    const { getCountsData } = props.handlers;

    return (
        <div className="card-skel-info">
            <h4>No of Sales</h4>
            <div className="dash-skel-top-info">
                <span className="skel-value" onClick={()=>getCountsData('Sales')}>{salesCounts === 0 ? 0 : salesCounts[0]?.o_new_cont}</span>
                <span className="skel-perc"><i className="material-icons">arrow_drop_up</i> +{
                    salesCounts === 0 ? 0 : Number(salesCounts[0]?.o_growth)?.toFixed(2)}%</span>
                <span className="skel-graph"><img src="./assets/images/graph-g.svg" alt="" className="img-fluid" /></span>
            </div>
        </div>
    )
}

export default Sales;