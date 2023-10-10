import React, { useState, useRef, useMemo, useEffect } from 'react';
import ReactEcharts from "echarts-for-react";
import { properties } from "../../../properties";
import { post, get } from "../../../common/util/restUtil";
import Filter from './Filter';

const History = (props) => {

    const [isRefresh, setIsRefresh] = useState(false)
    const [appoinmentData, setAppoinmentData] = useState([])
    const [filterParams, setFilterParams] = useState()

    const filtration = (e) => {
        console.log('val-------->', e?.target?.value);
        setFilterParams({ tran_category_type: e?.target?.value })
    }

    const fetchEvents = async () => {
        try {
            post(properties.APPOINTMENT_API + '/appoinment-history', filterParams).then((response) => {
                if (response.data) {
                    console.log('response.data----->', response?.data?.rows);
                    setAppoinmentData(response.data.rows);
                }
            }).catch((error) => {
                console.log(error)
            })
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [isRefresh, filterParams]);


    const option = {
        height: "640px",
        xAxisData: [
            {
                type: 'category',
                data: [
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December',
                ],
                axisLabel: {
                    interval: 0, // Display all labels
                    rotate: 45, // Rotate the labels for better visibility
                },
            }
        ],
        yAxisData: [
            {
                type: 'value'
            }
        ],
        seriesData: [
            {
                name: "Customer Visit",
                type: 'bar',
                label: {
                    show: true
                },
                data: [
                    appoinmentData.filter((ele) => ele?.appoint_mode === "CUST_VISIT" && ele?.month.trim() === "January")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "CUST_VISIT" && ele?.month.trim() === "February")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "CUST_VISIT" && ele?.month.trim() === "March")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "CUST_VISIT" && ele?.month.trim() === "April")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "CUST_VISIT" && ele?.month.trim() === "May")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "CUST_VISIT" && ele?.month.trim() === "June")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "CUST_VISIT" && ele?.month.trim() === "July")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "CUST_VISIT" && ele?.month.trim() === "August")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "CUST_VISIT" && ele?.month.trim() === "September")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "CUST_VISIT" && ele?.month.trim() === "October")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "CUST_VISIT" && ele?.month.trim() === "November")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "CUST_VISIT" && ele?.month.trim() === "December")[0]?.count]
            },
            {
                name: "Business Visit",
                type: 'bar',
                label: {
                    show: true
                },
                data: [
                    appoinmentData.filter((ele) => ele?.appoint_mode === "BUS_VISIT" && ele?.month.trim() === "January")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "BUS_VISIT" && ele?.month.trim() === "February")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "BUS_VISIT" && ele?.month.trim() === "March")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "BUS_VISIT" && ele?.month.trim() === "April")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "BUS_VISIT" && ele?.month.trim() === "May")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "BUS_VISIT" && ele?.month.trim() === "June")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "BUS_VISIT" && ele?.month.trim() === "July")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "BUS_VISIT" && ele?.month.trim() === "August")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "BUS_VISIT" && ele?.month.trim() === "September")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "BUS_VISIT" && ele?.month.trim() === "October")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "BUS_VISIT" && ele?.month.trim() === "November")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "BUS_VISIT" && ele?.month.trim() === "December")[0]?.count
                ]
            },
            {
                name: "Audio Conference",
                type: 'bar',
                label: {
                    show: true
                },
                data: [
                    appoinmentData.filter((ele) => ele?.appoint_mode === "AUDIO_CONF" && ele?.month.trim() === "January")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "AUDIO_CONF" && ele?.month.trim() === "February")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "AUDIO_CONF" && ele?.month.trim() === "March")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "AUDIO_CONF" && ele?.month.trim() === "April")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "AUDIO_CONF" && ele?.month.trim() === "May")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "AUDIO_CONF" && ele?.month.trim() === "June")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "AUDIO_CONF" && ele?.month.trim() === "July")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "AUDIO_CONF" && ele?.month.trim() === "August")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "AUDIO_CONF" && ele?.month.trim() === "September")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "AUDIO_CONF" && ele?.month.trim() === "October")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "AUDIO_CONF" && ele?.month.trim() === "November")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "AUDIO_CONF" && ele?.month.trim() === "December")[0]?.count
                ]
            },
            {
                name: "Video Conference",
                type: 'bar',
                label: {
                    show: true
                },
                data: [
                    appoinmentData.filter((ele) => ele?.appoint_mode === "VIDEO_CONF" && ele?.month.trim() === "January")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "VIDEO_CONF" && ele?.month.trim() === "February")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "VIDEO_CONF" && ele?.month.trim() === "March")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "VIDEO_CONF" && ele?.month.trim() === "April")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "VIDEO_CONF" && ele?.month.trim() === "May")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "VIDEO_CONF" && ele?.month.trim() === "June")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "VIDEO_CONF" && ele?.month.trim() === "July")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "VIDEO_CONF" && ele?.month.trim() === "August")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "VIDEO_CONF" && ele?.month.trim() === "September")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "VIDEO_CONF" && ele?.month.trim() === "October")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "VIDEO_CONF" && ele?.month.trim() === "November")[0]?.count,
                    appoinmentData.filter((ele) => ele?.appoint_mode === "VIDEO_CONF" && ele?.month.trim() === "December")[0]?.count
                ]
            }],
        toolbox: {
            show: false,
            feature: {
                dataView: { show: true, readOnly: false },
                magicType: { show: true, type: ['line', 'bar'] },
                restore: { show: true },
                saveAsImage: { show: true }
            }
        }

    }



    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleResize = () => {
    };

    const [entityType, setEntityType] = useState()


    return (
        <>
            <div className="cmmn-skeleton mt-3">
                <div className="skel-dashboard-title-base">
                    <span className="skel-header-title">Appointments History</span>
                    <div className="skel-dashboards-icons1">
                        <a onClick={() => setIsRefresh(!isRefresh)}><i className="material-icons">refresh</i></a>&nbsp;&nbsp;
                        <Filter
                        data={{ entityType }}
                        handlers={{
                            filtration,
                            setEntityType
                        }}
                    />
                    </div>
                </div>
                <hr className="cmmn-hline" />
                <div className="skel-perf-sect">
                    <div className="skel-perf-graph">
                        <ReactEcharts style={{ "height": option?.height }}
                            option={{
                                tooltip: {
                                    trigger: 'axis',
                                    axisPointer: {
                                        type: 'shadow'
                                    }
                                },
                                toolbox: option?.toolbox,
                                legend: {},
                                grid: {
                                    left: '0%',
                                    right: '0%',
                                    bottom: '2%',
                                    containLabel: true
                                },
                                xAxis: option?.xAxisData,
                                yAxis: option?.yAxisData,
                                series: option?.seriesData
                            }}
                        />
                    </div>
                </div>
                <hr className="cmmn-hline" />
                <div className="skel-refresh-info">
                    <span><i className="material-icons">refresh</i> Updated 5 mins ago</span>
                </div>
            </div>


        </>
    )
}

export default History;


