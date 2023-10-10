import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import axios from 'axios'
import { properties } from '../../../properties';
import moment from 'moment'

const LiveType = (props) => {
    const { searchParams, isParentRefresh } = props?.data

    const [chartData, setChartData] = useState([]);
    const chartRef = useRef(null);
    const [isRefresh, setIsRefresh] = useState(false);

    const getStatusWiseInteraction = () => {
        axios.post(properties.API_ENDPOINT + properties.INTERACTION_API + '/by-type/list', { searchParams: { ...searchParams, fromDate: moment().format('YYYY-MM-DD'), toDate: moment().format('YYYY-MM-DD HH:mm:ss') } }, {
            headers: {
                "Content-Type": "application/json",
                "x-tenant-id": properties.REACT_APP_TENANT_ID,
                authorization: JSON.parse(sessionStorage.getItem("auth")).accessToken
            }
        }).then((resp) => {
            console.log("live type ==> ", resp);
            if (resp?.status == 200) {
                setChartData(resp?.data?.data?.rows ?? [])
            }
        }).catch((error) => console.log(error));
    }

    useEffect(() => {
        const chartDom = chartRef.current;
        const myChart = echarts.init(chartDom, null, {
            renderer: 'canvas',
            useDirtyRect: false
        });

        // Extract unique hours from createdAt timestamps
        const uniqueHours = [...new Set(chartData.map(item => new Date(item.oCreatedAt).getUTCHours()))];

        // Sort the hours in ascending order
        const sortedHours = uniqueHours.sort((a, b) => a - b);

        // Generate xAxisLabels dynamically based on the sorted hours
        const xAxisLabels = sortedHours.map(hour => {
            const formattedHour = String(hour).padStart(2, '0');
            return `${formattedHour}:00`;
        });

        // Create a map to store data for each status
        const typeData = {};

        chartData.forEach(item => {
            const createdAtHour = new Date(item.oCreatedAt).getUTCHours();
            const status = item.oInteractionType;

            if (!typeData[status]) {
                typeData[status] = Array(xAxisLabels.length).fill(0);
            }

            typeData[status][sortedHours.indexOf(createdAtHour)] += 1;
        });

        // Generate series dynamically based on typeData
        const series = Object.keys(typeData).map(status => ({
            name: status,
            type: 'line',
            // smooth: true,
            // stack: 'Total',
            // areaStyle: {},
            // emphasis: {
            //     focus: 'series'
            // },
            data: typeData[status]
        }));

        // Finally, create the dynamic option object
        const option = {
            title: {
                show: chartData.length === 0,
                textStyle: {
                    color: "grey",
                    fontSize: 20
                },
                text: "No live interaction found",
                left: "center",
                top: "center"
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross',
                    label: {
                        backgroundColor: '#6a7985'
                    }
                }
            },
            legend: {
                data: Object.keys(typeData)
            },
            // toolbox: {
            //     feature: {
            //         saveAsImage: {}
            //     }
            // },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    boundaryGap: false,
                    data: xAxisLabels
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: series
        };

        if (option && typeof option === 'object') {
            myChart.setOption(option);
        }

        window.addEventListener('resize', myChart.resize);

        return () => {
            window.removeEventListener('resize', myChart.resize);
            myChart.dispose();
        };
    }, [chartData]);

    useEffect(() => {
        getStatusWiseInteraction();

        const interval = setInterval(() => {
            // getStatusWiseInteraction();
            console.log('Running every 5 seconds');
        }, properties?.LIVESTREAMTIME);
        return () => clearInterval(interval);
    }, [isRefresh, isParentRefresh, searchParams]);

    return (
        <div className="cmmn-skeleton">
            <div className="skel-dashboard-title-base">
                <span className="skel-header-title">Interaction by Type</span>
                <div className="skel-dashboards-icons">
                    <a href="javascript:void(null)" onClick={() => setIsRefresh(!isRefresh)}>
                        <i className="material-icons" >refresh</i>
                    </a>
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-graph-sect mt-4">
                <div ref={chartRef} style={{ height: '418px' }}></div>
            </div>
        </div>
    );
};

export default LiveType;