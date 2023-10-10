import React, { useState, useRef, useMemo, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { properties } from "../../../properties";
import { post } from "../../../common/util/restUtil";

const CustomerSatisfaction = (props) => {
    const [isRefresh, setIsRefresh] = useState(false)

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await post(`${properties.APPOINTMENT_API}/get-appoinment-events`, { date: new Date() });
                if (response.data && response.data.length > 0) {
                } else {
                }
            } catch (error) {
                console.log(error);
            }
        };
        fetchEvents();
    }, []);
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
            }
        },
        legend: {},
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value'
        },
        yAxis: {
            type: 'category',
            data: ['Product 1', 'Product 2', 'Product 3']
        },
        series: [
            {
                name: 'Satisfied',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                emphasis: {
                    focus: 'series'
                },
                data: [100, 130, 50]
            },
            {
                name: 'Extremely Satisfied',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                emphasis: {
                    focus: 'series'
                },
                data: [560, 710, 80]
            },
            {
                name: 'Neutral',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                emphasis: {
                    focus: 'series'
                },
                data: [100, 40, 70]
            },
            {
                name: 'Unsatisfied',
                type: 'bar',
                stack: 'total',
                label: {
                    show: true
                },
                emphasis: {
                    focus: 'series'
                },
                data: [200, 20, 100]
            },
            {
                name: 'Extremely Unsatisfied',
                type: 'bar',
                barWidth: '30',
                stack: 'total',
                label: {
                    show: true
                },
                emphasis: {
                    focus: 'series'
                },
                data: [40, 100, 700]
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
        CustomerSatisfaction.resize();
    };

    return (
        <>
            <div className="cmmn-skeleton mt-3">
                <div className="skel-dashboard-title-base">
                    <span className="skel-header-title">Reports by Customer Satisfaction</span>
                    <div className="skel-dashboards-icons">
                        
                        <a href="#"><i className="material-icons">refresh</i></a>
                        <a href="#"><i className="material-icons">filter_alt</i></a>
                    </div>
                </div>
                <hr className="cmmn-hline" />
                <div className="skel-perf-sect">
                    <div className="skel-perf-graph">
                        <ReactECharts
                            option={option}
                            style={{ height: '400px', width: '100%' }}
                            opts={{ renderer: 'canvas', useDirtyRect: false }}
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

export default CustomerSatisfaction;


