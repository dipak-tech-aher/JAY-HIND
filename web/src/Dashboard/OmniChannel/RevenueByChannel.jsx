import React from "react";
import { Link } from 'react-router-dom';

const RevenueByChannel = (props) => {
    const { revenue, viewType } = props?.data;
    console.log('revenue------>', revenue)
    let viewTypes = viewType;
    switch (viewTypes) {
        case "WHATSAPP-LIVECHAT":
            viewTypes = 'Whatsapp Live Chat';
            break;
        case ("FB-LIVECHAT" || 'Facebook Live Chat'):
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
    const revenueData = revenue?.filter((ele) => ele?.oOrderChannel === viewTypes)
    const { Revenuechannelwat } = props?.handlers
    return (
        <div className="col-md-5">
            <div className="cmmn-skeleton">
                <div className="skel-dashboard-title-base">
                    <span className="skel-header-title">
                        Revenue By Channels
                    </span>
                    <div className="skel-dashboards-icons">
                        <a>
                            <i className="material-icons"
                                onClick={() => Revenuechannelwat(true)} >
                                refresh
                            </i>
                        </a>
                    </div>
                </div>
                <hr className="cmmn-hline" />
                <div className="skel-perf-sect-group">
                    <div className="skel-rev-chnl-by-list">
                        <div className="skel-rev-chnl-top-sect">
                            <span className="txt-clr-whatsapp text-center font-38 txt-clr-facebook">
                                <i className={
                                    
                                    (revenue[0]?.oOrderChannel === 'Email' || viewType==='EMAIL') ? "fas fa-envelope"
                                        
                                    : (revenue[0]?.oOrderChannel === 'Whatsapp Live Chat' || viewType==='WHATSAPP-LIVECHAT') ? "fab fa-whatsapp"
                                            
                                    : (revenue[0]?.oOrderChannel === 'SelfCare' || viewType === 'SELFCARE') ? "fas fa-globe"
                                                
                                    : (revenue[0]?.oOrderChannel === 'Mobile APP' || viewType==='MOBILEAPP') ? "fas fa-mobile-alt"
                                                    
                                    : (revenue[0]?.oOrderChannel === 'Facebook Live Chat' || viewType==='FB-LIVECHAT' || viewType==='Facebook Live Chat') ? "fab fa-facebook"
                                                    
                                    : (revenue[0]?.oOrderChannel === 'Telegram' || viewType==='TELEGRAM') ? "fab fa-telegram"

                                    : (revenue[0]?.oOrderChannel === 'Instagram' || viewType==='INSTAGRAM') ? "fab fa-instagram"

                                                        : ""}></i>
                            </span>
                            <p className="ml-2">
                                <span>Monthly</span>
                                <span className="font-lg-size">
                                    {" "}
                                    ${revenueData[0]?.oMonthlyAvg || 0}
                                </span>
                            </p>
                        </div>
                        <hr className="cmmn-hline" />
                        <div className="skel-rev-prev-td-info">
                            <div className="skel-rev-pre-month">
                                <span className="skel-rev-lbl">
                                    Prev. Month
                                </span>
                                <p className="ml-2">
                                    <span className="font-lg-size">
                                        {" "}
                                        ${revenueData[0]?.oPrevMonthAvg || 0}
                                    </span>
                                </p>

                            </div>
                            <div className="skel-rev-pre-month">
                                <span className="skel-rev-lbl">
                                    Today
                                </span>
                                <span className="font-lg-size">
                                    {" "}
                                    ${revenueData[0]?.oDailySales || 0}
                                </span>
                                <span className="skel-rev-per-data txt-clr-whatsapp">

                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="total-revenue-indiv">
                        <div className="skel-rev-pre-month">
                            <span className="skel-rev-lbl">
                                Total Revenue
                            </span>
                            <span className="font-lg-size">${revenueData[0]?.oAmount || 0}</span>
                            <span className="skel-rev-per-data txt-clr-whatsapp">
                            </span>
                        </div>
                    </div>
                </div>

                <hr className="cmmn-hline" />

                <div className="skel-refresh-info">
                    <span>
                        <i className="material-icons">refresh</i>{" "}
                        Updated a few seconds ago
                    </span>
                </div>
            </div>
        </div>
    )
}

export default RevenueByChannel;