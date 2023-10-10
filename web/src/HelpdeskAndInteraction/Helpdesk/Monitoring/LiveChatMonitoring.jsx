import React, { useCallback, useEffect, useState } from "react";
import MonitoringDoubleCard from "./shared/MonitoringDoubleCard";
import MonitoringSingleCard from "./shared/MonitoringSingleCard";
import MonitoringTripleCard from "./shared/MonitoringTripleCard";
import Modal from 'react-modal';
import { toast } from 'react-toastify';

import { properties } from '../../../properties';
import { post } from "../../../common/util/restUtil";
import { RegularModalCustomStyles } from '../../../common/util/util';
import AgentMonitoringSingleView from './shared/AgentMonitoringSingleGridView';
import AgentMonitoringTripleGridView from './shared/AgentMonitoringTripleGridView';
import MonitoringTripleVerticalCard from './shared/MonitoringTripleVerticalCard';

const LiveChatMonitoring = (props) => {

    const [livechatMonitoringData, setLivechatMonitoringData] = useState();
    const [singleCardGridView, setSingleCardGridView] = useState(false);
    const [tripleCardGridView, setTripleCardGridView] = useState(false);
    const { channel, userId, startDate, endDate, refresh } = props?.data;

    const getLivechatMontingList = useCallback(() => {
        
        const requestBody = {
            "source": channel,
            "userId": userId,
            "startDate": startDate,
            "endDate": endDate
        }
        post(`${properties.GET_MONITORING_API}`, requestBody)
            .then((response) => {
                if (response.data.length === 0) {
                    toast.error("No Records Found")
                }
                setLivechatMonitoringData(response.data)
            })
            .catch((error) => {
                console.error(error);
            })
            .finally()
    }, [channel, userId, startDate, endDate, refresh]);

    useEffect(() => {
        getLivechatMontingList()
    }, [getLivechatMontingList])

    // Card Handler
    const singleCardGridViewHandler = (props) => {
        setSingleCardGridView({
            display: true,
            headerName: props,
        })
    };

    const tripleCardGridViewHandler = (props) => {
        setTripleCardGridView({
            display: true,
            headerName: props,
        })
    };

    const rowData = [
        {
            customerid: "hello",
            customerName: "Mubashar H. Khokhar",
            customerEmail: "Mubashar@gmail.com",
            contactNumber: "ert",
            source: "Email"
        },
        {
            customerid: "hello",
            customerName: "Mubashar H. Khokhar",
            customerEmail: "Mubashar@gmail.com",
            contactNumber: "ert",
            source: "Email"
        },
        {
            customerid: "hello",
            customerName: "Mubashar H. Khokhar",
            customerEmail: "Mubashar@gmail.com",
            contactNumber: "ert",
            source: "Email"
        },
        {
            customerid: "hello",
            customerName: "Mubashar H. Khokhar",
            customerEmail: "Mubashar@gmail.com",
            contactNumber: "ert",
            source: "Email"
        },
        {
            customerid: "hello",
            customerName: "Mubashar H. Khokhar",
            customerEmail: "Mubashar@gmail.com",
            contactNumber: "ert",
            source: "Email"
        },
        {
            customerid: "hello",
            customerName: "Mubashar H. Khokhar",
            customerEmail: "Mubashar@gmail.com",
            contactNumber: "ert",
            source: "Email"
        },
        {
            customerid: "hello",
            customerName: "Mubashar H. Khokhar",
            customerEmail: "Mubashar@gmail.com",
            contactNumber: "ert",
            source: "Email"
        },
        {
            customerid: "hello",
            customerName: "Mubashar H. Khokhar",
            customerEmail: "Mubashar@gmail.com",
            contactNumber: "ert",
            source: "Email"
        },
        {
            customerid: "hello",
            customerName: "Mubashar H. Khokhar",
            customerEmail: "Mubashar@gmail.com",
            contactNumber: "ert",
            source: "Email"
        },
        {
            customerid: "hello",
            customerName: "Mubashar H. Khokhar",
            customerEmail: "Mubashar@gmail.com",
            contactNumber: "ert",
            source: "Email"
        },
        {
            customerid: "hello",
            customerName: "Mubashar H. Khokhar",
            customerEmail: "Mubashar@gmail.com",
            contactNumber: "ert",
            source: "Email"
        },
        {
            customerid: "hello",
            customerName: "Mubashar H. Khokhar",
            customerEmail: "Mubashar@gmail.com",
            contactNumber: "ert",
            source: "Email"
        }

    ]

    return (
        <>
            {(singleCardGridView.display) ?

                <Modal style={RegularModalCustomStyles} isOpen={singleCardGridView.display}>
                    <AgentMonitoringSingleView data={{ headerName: singleCardGridView.headerName, rowData: rowData }} />
                    <button className="close-btn" onClick={() => setSingleCardGridView({ ...singleCardGridView, display: false })} >&times;</button>
                </Modal>
                : <></>}
            {
                (tripleCardGridView.display) ?
                    <Modal style={RegularModalCustomStyles} isOpen={tripleCardGridView.display}>
                        <AgentMonitoringTripleGridView data={{ headerName: tripleCardGridView.headerName, rowData: rowData }} />
                        <button className="close-btn" onClick={() => setTripleCardGridView({ ...tripleCardGridView, display: false })} >&times;</button>
                    </Modal>
                    : <></>
            }
            <div className="row pl-2 pr-2">
                <section className="triangle col-12 pb-0 ml-1 mt-3">
                    <div className="row col-12">
                        <div className="col-10">
                            {/* <div className="page-title-box"> */}
                            <h4 className="pl-1">Live Chat</h4>
                            {/* </div> */}
                        </div>
                    </div>
                </section>
                {/* <br></br> */}
                {/* <div className="row"> */}

                {/* <div className="row">
                <div className="col-xl-12 monitor-sec">
                    <div className="row"> */}
                <div className="col-md-8 p-1">
                    <div className="card chat-mon logged-sec">
                        <div className="row">
                            <div className="col-md-4">
                                < MonitoringSingleCard handler={{
                                    handleonClickView: singleCardGridViewHandler
                                }}
                                    data={{
                                        header: "Queue",
                                        icon: "fa fa-indent",
                                        count: (livechatMonitoringData && livechatMonitoringData?.queue) || "0",
                                        footer: "Total count",
                                        onClickFlag: true,
                                        cardStyle: true
                                    }}
                                />
                            </div>
                            <div className="col-md-4">
                                <MonitoringSingleCard handler={{
                                    handleonClickView: singleCardGridViewHandler
                                }}
                                    data={{
                                        header: "Currently Served",
                                        icon: "fas fa-comment-dots",
                                        count: (livechatMonitoringData && livechatMonitoringData?.currentlyServed) || "0",
                                        footer: "Total count",
                                        onClickFlag: true,
                                        cardStyle: true
                                    }}
                                />
                            </div>
                            <div className="col-md-4">
                                <MonitoringSingleCard handler={{
                                    handleonClickView: singleCardGridViewHandler
                                }}
                                    data={{
                                        header: "Abandoned Interaction",
                                        icon: "fas fa-comment-dots",
                                        count: (livechatMonitoringData && livechatMonitoringData?.abandonedInteraction) || "0",
                                        footer: "Total count",
                                        onClickFlag: true,
                                        cardStyle: true
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 p-1">
                    <div className="card mb-0" >
                        <div className="p-1">
                            <div className="media">
                                <div className="media-body overflow-hidden">
                                    <h5 className="header-title">Average Response Time</h5>
                                </div>
                            </div>
                        </div>
                        <div className="border-top p-1 res-time">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="row">
                                        <div className="col-md-8">
                                            <div className="prg-left">Average Speed Of Answer</div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="prg-right">{(livechatMonitoringData && livechatMonitoringData?.avgResponseTime && ((livechatMonitoringData?.avgResponseTime?.speedOfAnswer).split(':'))[0] + 'm ' + ((livechatMonitoringData?.avgResponseTime?.speedOfAnswer).split(':'))[1] + 's') || "0m 0s"}</div>
                                        </div>
                                    </div>
                                    <div className="progress clearfix">
                                        <div className="progress-bar" style={{ width: "10%" }}></div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="row">
                                        <div className="col-md-8">
                                            <div className="prg-left">Average Holding Time</div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="prg-right">{(livechatMonitoringData && livechatMonitoringData?.avgResponseTime && ((livechatMonitoringData?.avgResponseTime?.holdingTime).split(':'))[0] + 'm ' + ((livechatMonitoringData?.avgResponseTime?.holdingTime).split(':'))[1] + 's') || "0m 0s"}</div>
                                        </div>
                                    </div>
                                    <div className="progress clearfix">
                                        <div className="progress-bar" style={{ width: "10%" }} ></div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="row">
                                        <div className="col-md-8">
                                            <div className="prg-left">Average Wait Time</div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="prg-right">{(livechatMonitoringData && livechatMonitoringData?.avgResponseTime && ((livechatMonitoringData?.avgResponseTime?.waitTime).split(':'))[0] + 'm ' + ((livechatMonitoringData?.avgResponseTime?.waitTime).split(':'))[1] + 's') || "0m 0s"}</div>
                                        </div>
                                    </div>
                                    <div className="progress clearfix">
                                        <div className="progress-bar" style={{ width: "40%" }}></div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                {/* </div>
                </div>
            </div> */}
                {/* <div className="row"> */}
                <div className="col-md-4 p-1">
                    <MonitoringDoubleCard
                        data={{
                            header: "Wait Time",
                            icon: "fas fa-clock",
                            count1: (livechatMonitoringData && livechatMonitoringData?.waitTime && ((livechatMonitoringData?.waitTime?.average).split(':'))[0] + 'm ' + ((livechatMonitoringData?.waitTime?.average).split(':'))[1] + 's') || "0m 0s",
                            count2: (livechatMonitoringData && livechatMonitoringData?.waitTime && ((livechatMonitoringData?.waitTime?.longest).split(':'))[0] + 'm ' + ((livechatMonitoringData?.waitTime?.longest).split(':'))[1] + 's') || "0m 0s",
                            footer1: "Average",
                            footer2: "Longest",
                            onClickFlag: false
                        }}
                    />
                </div>
                <div className="col-md-4 p-2">
                    <MonitoringDoubleCard
                        data={{
                            header: "Chat Duration",
                            icon: "fas fa-stopwatch",
                            count1: (livechatMonitoringData && livechatMonitoringData?.waitTime && ((livechatMonitoringData?.waitTime?.longest).split(':'))[0] + 'm ' + ((livechatMonitoringData?.waitTime?.longest).split(':'))[1] + 's') || "0m 0s",
                            count2: (livechatMonitoringData && livechatMonitoringData?.waitTime && ((livechatMonitoringData?.waitTime?.longest).split(':'))[0] + 'm ' + ((livechatMonitoringData?.waitTime?.longest).split(':'))[1] + 's') || "0m 0s",
                            footer1: "Average",
                            footer2: "Longest",
                            onClickFlag: false
                        }}
                    />
                </div>
                <div className="col-md-4 p-2">
                    <MonitoringDoubleCard
                        data={{
                            header: "Chat Per Agent",
                            icon: "fas fa-comment-alt",
                            count1: (livechatMonitoringData && livechatMonitoringData?.waitTime && ((livechatMonitoringData?.waitTime?.longest).split(':'))[0] + '.' + ((livechatMonitoringData?.waitTime?.longest).split(':'))[1]) || "0.0",
                            count2: (livechatMonitoringData && livechatMonitoringData?.waitTime && ((livechatMonitoringData?.waitTime?.longest).split(':'))[0] + '.' + ((livechatMonitoringData?.waitTime?.longest).split(':'))[1]) || "0.0",
                            footer1: "Logged In",
                            footer2: "Online",
                            onClickFlag: false

                        }}
                    />
                </div>
                {/* </div> */}
                {/* <div className="row"> */}
                <div className="col-md-4 p-1">
                    <MonitoringDoubleCard
                        data={{
                            header: "SLA",
                            icon: "fas fa-comment-alt",
                            count1: (livechatMonitoringData && livechatMonitoringData?.sla && livechatMonitoringData?.sla?.sla) || "0",
                            count2: (livechatMonitoringData && livechatMonitoringData?.sla && livechatMonitoringData?.sla?.slaAfter) || "0",
                            footer1: "SLA %",
                            footer2: "SLA After Target %",
                            onClickFlag: false

                        }}
                    />
                </div>
                <div className="col-md-3 p-1">
                    <MonitoringSingleCard handler={{
                        handleonClickView: singleCardGridViewHandler
                    }}
                        data={{
                            header: "First Resolution Time",
                            icon: "fas fa-clock",
                            count: (livechatMonitoringData && livechatMonitoringData?.firstResolutionTime) || "0",
                            footer: "",
                            onClickFlag: true,
                            cardStyle: false
                        }}
                    />
                </div>
                <div className="col-md-2 p-1">
                    <MonitoringSingleCard handler={{
                        handleonClickView: singleCardGridViewHandler
                    }}
                        data={{
                            header: "Abandoned Rate",
                            icon: "fas fa-phone-volume",
                            count: (livechatMonitoringData && livechatMonitoringData?.abandonedRate) || "0",
                            footer: "",
                            onClickFlag: false,
                            cardStyle: false
                        }}
                    />
                </div>
                <div className="col-md-2 p-1">
                    <MonitoringSingleCard
                        handler={{
                            handleonClickView: singleCardGridViewHandler
                        }}
                        data={{
                            header: "Logged In",
                            icon: "fas fa-sign-in-alt",
                            count: (livechatMonitoringData && livechatMonitoringData?.loggedIn) || "0",
                            footer: "Agents",
                            onClickFlag: true,
                            cardStyle: false

                        }}
                    />
                </div>
                {/* </div> */}
                {/* <div className="row"> */}
                <div className="col-md-3 p-1">
                    <MonitoringTripleVerticalCard handler={{
                        handleonClickView: tripleCardGridViewHandler
                    }}
                        data={{
                            header: "Status",
                            icon: "fas fa-clock",
                            count1: "0",
                            count2: "0",
                            count3: "0",
                            footer1: "",
                            footer2: "",
                            footer3: "",
                            onClickFlag: false
                        }}
                    />
                </div>
                <div className="col-md-4 p-1">
                    <MonitoringTripleCard handler={{
                        handleonClickView: tripleCardGridViewHandler
                    }}
                        data={{
                            header: "Aging",
                            icon: "fa fa-envelope",
                            count1: (livechatMonitoringData && livechatMonitoringData?.aging && (livechatMonitoringData?.aging["30Days"])) || 0,
                            count2: (livechatMonitoringData && livechatMonitoringData?.aging && (livechatMonitoringData?.aging["18Days"])) || 0,
                            count3: (livechatMonitoringData && livechatMonitoringData?.aging && (livechatMonitoringData?.aging["90Days"])) || 0,
                            footer1: "Average",
                            footer2: "Longest",
                            footer3: "Longest",
                            onClickFlag: true
                        }}
                    />
                </div>

                {/* </div> */}
                {/* </div> */}
                {/* </div> */}
            </div>
        </>
    )
}

export default LiveChatMonitoring;