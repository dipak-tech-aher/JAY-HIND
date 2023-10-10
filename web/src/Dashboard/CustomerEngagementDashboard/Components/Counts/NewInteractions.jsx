
import React from "react";
const NewInteractions = (props) => {
    const { interactionCounts, isCountDataPopupOpen } = props.data;
    const { getCountsData, setIsCountDataPopupOpen } = props.handlers;


    return (
        <div className="card-skel-info">
            <h4>New Interactions</h4>
            <div className="dash-skel-top-info">
                <span className="skel-value" onClick={()=>getCountsData('Interaction')}>{interactionCounts === 0 ? 0 : interactionCounts[0]?.o_new_cont}</span>
                <span className="skel-perc"><i className="material-icons">arrow_drop_up</i> +{interactionCounts === 0 ? 0 : Number(interactionCounts[0]?.o_growth)?.toFixed(2)}%</span>
                <span className="skel-graph"><img src="./assets/images/graph-y.svg" alt="" className="img-fluid" /></span>
            </div>
        </div>
    )
}

export default NewInteractions;