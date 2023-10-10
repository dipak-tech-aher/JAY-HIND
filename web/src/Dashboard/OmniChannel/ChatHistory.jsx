import React from "react";
import { Link } from 'react-router-dom';

const ChatHistory = (props) => {
    const { chatHistory } = props?.data
    const { ChatHistorywat } = props?.handlers
    return (
        <div className="row mt-3">
            <div className="col-md-12">
                <div className="cmmn-skeleton">
                    <div className="skel-dashboard-title-base">
                        <span className="skel-header-title">
                            Chat History
                        </span>
                        <div className="skel-dashboards-icons">
                            <a>
                                <i
                                    className="material-icons"
                                    onClick={() => ChatHistorywat(true)}
                                >
                                    refresh
                                </i>
                            </a>
                        </div>
                    </div>
                    <hr className="cmmn-hline" />
                    {chatHistory == "0" ? (
                        <div className="noRecord">
                            <p>NO RECORDS FOUND</p>
                        </div>
                    ) : (

                        chatHistory.map((x) => (
                            <div className="skel-perf-sect-indiv-chat-history">
                                <div className="skel-indiv-track-record no-brd-bttm">
                                    <p>
                                        <span className="skel-rev-lbl">
                                            Total Chats
                                        </span>
                                        <span className="font-lg-size">
                                            {x?.o_chat_cnt}
                                        </span>
                                    </p>
                                </div>
                                <div className="skel-indiv-track-record no-brd-bttm">
                                    <p>
                                        <span className="skel-rev-lbl pb-2">
                                            {x?.o_status} Chats By
                                        </span>
                                    </p>
                                    <hr className="cmmn-hline" />
                                    <div className="skel-abandoned-chat">
                                        <p>
                                            <span className="skel-rev-lbl">
                                                Customer
                                            </span>
                                            <span className="font-lg-size">
                                                {x?.o_abandoned_by_customer}
                                            </span>
                                        </p>
                                        <p>
                                            <span className="skel-rev-lbl">
                                                Business User
                                            </span>
                                            <span className="font-lg-size">
                                                {x?.o_abandoned_by_user}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="skel-indiv-track-record no-brd-bttm">
                                    <p>
                                        <span className="skel-rev-lbl">
                                            Avg. Response Time
                                        </span>
                                        <span className="font-lg-size">
                                            {" "}
                                            {x?.o_avg_frt_time}
                                        </span>
                                    </p>
                                </div>
                                <div className="skel-indiv-track-record no-brd-bttm">
                                    <p>
                                        <span className="skel-rev-lbl">
                                            Avg. Talk Time
                                        </span>
                                        <span className="font-lg-size">
                                            {x?.o_avg_talk_time}
                                        </span>
                                    </p>
                                </div>
                                <div className="skel-indiv-track-record no-brd-bttm no-brd-right">
                                    <p>
                                        <span className="skel-rev-lbl">
                                            TAT
                                        </span>
                                        <span className="font-lg-size">
                                            {x?.o_total_talk_time}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        ))
                    )}

                    <hr className="cmmn-hline" />

                    <div className="skel-refresh-info">
                        <span>
                            <i className="material-icons">refresh</i>{" "}
                            Updated a few seconds ago
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatHistory;