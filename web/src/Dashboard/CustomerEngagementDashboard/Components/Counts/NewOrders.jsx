
import React from "react";
const NewOrders = (props) => {
    const { orderCounts } = props.data;
    const { getCountsData } = props.handlers;

    return (
        <div className="card-skel-info">
            <h4>New Orders</h4>
            <div className="dash-skel-top-info">
                <span className="skel-value" onClick={()=>getCountsData('Order')}>{
                    orderCounts === 0 ? 0 : orderCounts[0]?.o_new_cont
                }</span>
                <span className="skel-perc"><i className="material-icons">arrow_drop_up</i> +{
                    orderCounts === 0 ? 0 : Number(orderCounts[0]?.o_growth)?.toFixed(2)
                }%</span>
                <span className="skel-graph"><img src="./assets/images/graph-p.svg" alt="" className="img-fluid" /></span>
            </div>
        </div>
    )
}

export default NewOrders;