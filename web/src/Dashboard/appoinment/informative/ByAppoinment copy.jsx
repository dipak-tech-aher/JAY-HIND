import React, { useState, useRef, useMemo, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { properties } from "../../../properties";
import { post } from "../../../common/util/restUtil";
import Filter from './Filter';
import { unstable_batchedUpdates } from 'react-dom';
import EChartsComponent from './EChartsComponent';


const ByAppoinment = (props) => {

    const [isRefresh, setIsRefresh] = useState(false);
    const [filterParams, setFilterParams] = useState()
    const [cancelCount, setCancelCount] = useState(0)
    const [completedCount, setCompletedCount] = useState(0)
    const [upcomming, setUpcomming] = useState(0)
    const [successFullCount, setSuccessFullCount] = useState(0)
    const [unSuccessFullCount, setUnSuccessFullCount] = useState(0)

    useEffect(() => {
        fetchData();
    }, [isRefresh, filterParams]);

    const fetchData = () => {
        post(properties.APPOINTMENT_API + `/get-upcoming-appoinments?valueParam=AS_SCHED`, { date: new Date(), filterParams }).then((upcomingResp) => {
            if (upcomingResp.status === 200) {
                post(properties.APPOINTMENT_API + `/get-appoinments-by-query?valueParam=AS_CANCEL,AS_COMP_UNSUCCESS,AS_COMP_SUCCESS,`, { date: new Date(), filterParams }).then((allAppt) => {
                    if (allAppt.status === 200) {

                        const successCount = allAppt?.data?.rows && allAppt?.data?.rows?.length && allAppt?.data?.rows?.filter((ele) => ele?.status === 'AS_COMP_SUCCESS')


                        const unSuccessfullCount = allAppt?.data?.rows && allAppt?.data?.rows?.length && allAppt?.data?.rows?.filter((ele) => ele?.status === 'AS_COMP_UNSUCCESS');

                        const closedCount = allAppt?.data?.rows && allAppt?.data?.rows?.length && allAppt?.data?.rows?.filter((ele) => (ele?.status === 'AS_COMP_UNSUCCESS' || ele?.status === 'AS_COMP_SUCCESS'))

                        const cancelCount = allAppt?.data?.rows && allAppt?.data?.rows?.length && allAppt?.data?.rows?.filter((ele) => ele?.status === 'AS_CANCEL')

                        unstable_batchedUpdates(() => {
                            setSuccessFullCount(successCount?.length || 0);
                            setUnSuccessFullCount(unSuccessfullCount?.length || 0);
                            setCompletedCount(closedCount?.length || 0);
                            setUpcomming(upcomingResp?.data?.count || 0);
                            setCancelCount(cancelCount?.length || 0);
                        })
                    }
                }).catch((error) => {
                    console.log(error)
                })
            }
        }).catch((error) => {
            console.log(error)
        })
    };


    const option = {
        tooltip: {
            trigger: 'item'
        },
        legend: {
            top: '5%',
            left: 'center'
        },
        series: [
            {
                name: 'Appointment',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '15',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                label: {
                    position: 'left',
                    alignTo: 'none',
                    bleedMargin: 0
                },
                data: [
                    { value: upcomming, name: 'Scheduled' },
                    { value: completedCount, name: 'Completed' },
                    { value: cancelCount, name: 'Cancelled' },
                    { value: unSuccessFullCount, name: 'UnSuccessfull' },
                    { value: successFullCount, name: 'Successfull' },
                ]
            }
        ]
    };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleResize = () => {

    };

    const filtration = (e) => {
        console.log('val------xx-->', e?.target?.value);
        setFilterParams({ tran_category_type: e?.target?.value })
    }
    const [entityType, setEntityType] = useState()

    return (
        <>
            <div className="cmmn-skeleton mt-3">
                <div className="skel-dashboard-title-base">
                    <span className="skel-header-title">Reports by Appointment</span>
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
                        <EChartsComponent />

                        {/* <ReactECharts
                            option={option}
                            style={{ height: '400px', width: '100%' }}
                            opts={{ renderer: 'canvas', useDirtyRect: false }}
                        /> */}
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

export default ByAppoinment;


