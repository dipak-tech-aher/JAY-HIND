import React, { useCallback, useEffect, useState } from "react";
import Modal from 'react-modal';
import { toast } from 'react-toastify';

import { properties } from '../../../properties';
import { post } from "../../../common/util/restUtil";
import { RegularModalCustomStyles } from '../../../common/util/util';
import AgentMonitoringSingleView from './shared/AgentMonitoringSingleGridView';
import AgentMonitoringTripleGridView from './shared/AgentMonitoringTripleGridView';
import MonitoringDoubleCard from "./shared/MonitoringDoubleCard";
import MonitoringSingleCard from "./shared/MonitoringSingleCard";
import MonitoringTripleCard from "./shared/MonitoringTripleCard";


const EmailMonitoring = (props) => {

    const [emailMonitoringData, setEmailMonitoringData] = useState();
    const [singleCardGridView, setSingleCardGridView] = useState(false);
    const [tripleCardGridView, setTripleCardGridView] = useState(false);
    const { channel, userId, startDate, endDate, refresh } = props?.data;

    const getEmailMontingList = useCallback(() => {
        
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
                setEmailMonitoringData(response.data)
            })
            .catch((error) => {
                console.error(error);
            })
            .finally()
    }, [channel, userId, startDate, endDate, refresh]);

    useEffect(() => {
        getEmailMontingList()
    }, [getEmailMontingList])

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
                            <h4 className="pl-1">Email</h4>
                            {/* </div> */}
                        </div>
                    </div> 
                </section>
                    {/* <br></br> */}
                {/* First Row Card */}
                {/* <div className="row">
                    <div className="col-xl-12 monitor-sec">
                        <div className="row"> */}

                            <div className="col-md-4 p-1">
                                <div className="card mb-0">
                                    <div className="p-1">
                                        {/* <div className="card chat-mon que-sec logged-sec p-2" > */}
                                        <div className="media">
                                            <div className="media-body overflow-hidden">
                                                <h5 className="header-title">Average Response Time</h5>
                                                {/* <div className="border-top p-1 res-time">
                                    </div> */}
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
                                                    <div className="prg-right">{(emailMonitoringData && emailMonitoringData?.avgResponseTime && ((emailMonitoringData?.avgResponseTime?.speedOfAnswer).split(':'))[0] + 'm ' + ((emailMonitoringData?.avgResponseTime?.speedOfAnswer).split(':'))[1] + 's') || "0m 0s"}</div>
                                                    </div>
                                                </div>
                                                <div className="progress clearfix">
                                                    <div className="progress-bar" style={{ width: "10%" }} ></div>
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="row">
                                                <div className="col-md-8">
                                                    <div className="prg-left">Average Holding Time</div>
                                                    </div>
                                                    <div className="col-md-3">
                                                    <div className="prg-right">{(emailMonitoringData && emailMonitoringData?.avgResponseTime && ((emailMonitoringData?.avgResponseTime?.holdingTime).split(':'))[0] + 'm ' + ((emailMonitoringData?.avgResponseTime?.holdingTime).split(':'))[1] + 's') || "0m 0s"}</div>
                                                    </div>
                                                </div>
                                                <div className="progress clearfix">
                                                    <div className="progress-bar" style={{ width: "30%" }} ></div>
                                                </div>
                                            </div>
                                            <div className="col-md-12">
                                                <div className="row">
                                                <div className="col-md-8">
                                                    <div className="prg-left">Average Wait Time</div>
                                                    </div>
                                                    <div className="col-md-3">
                                                    <div className="prg-right" >{(emailMonitoringData && emailMonitoringData?.avgResponseTime && ((emailMonitoringData?.avgResponseTime?.waitTime).split(':'))[0] + 'm ' + ((emailMonitoringData?.avgResponseTime?.waitTime).split(':'))[1] + 's') || "0m 0s"}</div>
                                                    </div>
                                                </div>
                                                <div className="progress clearfix">
                                                    <div className="progress-bar" style={{ width: "60%" }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* </div> */}
                                </div>
                            </div>

                            <div className="col-md-8 p-1">
                                <div className="card chat-mon logged-sec"> {/* que-sec */}
                                    <div className="row">
                                        <div className="col-md-5">
                                            < MonitoringSingleCard handler={{
                                                handleonClickView: singleCardGridViewHandler
                                            }}
                                                data={{
                                                    header: "Queue",
                                                    icon: "fa fa-indent",
                                                    count: (emailMonitoringData && emailMonitoringData?.queue) || "0",
                                                    footer: "Total count",
                                                    onClickFlag: true,
                                                    cardStyle: true
                                                }} 
                                            />
                                        </div>
                                        <div className="col-md-5">
                                            <MonitoringSingleCard handler={{
                                                handleonClickView: singleCardGridViewHandler
                                            }}
                                                data={{
                                                    header: "Currently Served",
                                                    icon: "fas fa-comment-dots",
                                                    count: (emailMonitoringData && emailMonitoringData?.currentlyServed) || "0",
                                                    footer: "Total count",
                                                    onClickFlag: true,
                                                    cardStyle: true
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {/* </div>
                    </div>
                </div> */}
                {/* Second Row Card */}
                {/* <div className="row"> */}
                    <div className="col-md-4 p-1">
                        <MonitoringDoubleCard handler={{
                            handleonClickView: singleCardGridViewHandler
                        }}
                            data={{ 
                                header: "Wait Time",
                                icon: "fas fa-clock",
                                count1: (emailMonitoringData && emailMonitoringData?.waitTime && ((emailMonitoringData?.waitTime?.average).split(':'))[0] + 'm ' + ((emailMonitoringData?.waitTime?.average).split(':'))[1] + 's') || "0m 0s",
                                count2: (emailMonitoringData && emailMonitoringData?.waitTime && ((emailMonitoringData?.waitTime?.longest).split(':'))[0] + 'm ' + ((emailMonitoringData?.waitTime?.longest).split(':'))[1] + 's') || "0m 0s",
                                footer1: "Average",
                                footer2: "Longest",
                                onClickFlag: false
                            }}
                        />
                    </div>
                    <div className="col-md-4 p-1">
                        <MonitoringDoubleCard handler={{
                            handleonClickView: singleCardGridViewHandler
                        }}
                            data={{
                                header: "SLA",
                                icon: "fas fa-handshake",
                                count1: (emailMonitoringData && emailMonitoringData?.sla && emailMonitoringData?.sla?.sla) || "0",
                                count2: (emailMonitoringData && emailMonitoringData?.sla && emailMonitoringData?.sla?.slaAfter) || "0",
                                footer1: "SLA %",
                                footer2: "SLA After Target %",
                                onClickFlag: false
                            }}
                        />
                    </div>
                    <div className="col-md-4 p-1">
                        <MonitoringSingleCard handler={{
                            handleonClickView: singleCardGridViewHandler
                        }}
                            data={{
                                header: "First Resolution Time",
                                icon: "fas fa-clock",
                                count: (emailMonitoringData && emailMonitoringData?.firstResolutionTime) || "0",
                                footer: "",
                                onClickFlag: false,
                                cardStyle: false

                            }}
                        />
                    </div>
                {/* </div> */}
                {/* Third Row Card */}
                {/* <div className="row"> */}
                    <div className="col-md-4 p-1">
                        <MonitoringTripleCard handler={{
                            handleonClickView: tripleCardGridViewHandler
                        }}
                            data={{
                                header: "Aging",
                                icon: "fa fa-envelope",
                                count1: (emailMonitoringData && emailMonitoringData?.aging && (emailMonitoringData?.aging["30Days"])) || 0,
                                count2: (emailMonitoringData && emailMonitoringData?.aging && (emailMonitoringData?.aging["18Days"])) || 0,
                                count3: (emailMonitoringData && emailMonitoringData?.aging && (emailMonitoringData?.aging["90Days"])) || 0,
                                footer1: "30 Days",
                                footer2: "60 Days",
                                footer3: "90 Days",
                                onClickFlag: true
                            }}
                        />
                    </div>
                </div>
            {/* </div> */}
        </>
    )

}

export default EmailMonitoring