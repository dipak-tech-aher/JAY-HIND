import React from "react";

const QuickLinks = () => {
    return (
        <div className="col-md-2">
            <div className="skel-op-dashboard-lft-base cmmn-skeleton">
                <span className="skel-header-title">Quick Links</span>
                <ul className="skel-qk-lnks">
                    <li><a >New Interaction</a></li>
                    <li><a >Open Interaction</a></li>
                    <li><a >Closed Interaction</a></li>
                    <li><a >New Orders</a></li>
                    <li><a >Open Orders</a></li>
                    <li><a >Closed Orders</a></li>
                    <li><a >Upcoming Appointments</a></li>
                    <li><a >Performance Activity</a></li>
                    <li><a >Recent Activity</a></li>
                </ul>
            </div>
        </div>
    )
}

export default QuickLinks;