import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { properties } from '../../../properties';
import moment from 'moment'
import axios from 'axios'


const LiveCustomerWise = (props) => {
    const { searchParams, isParentRefresh } = props?.data

    const [chartData, setChartData] = useState([]);
    const [isRefresh, setIsRefresh] = useState(false);

    const chartRef = useRef(null);
    const search = { ...searchParams, fromDate: moment().format('YYYY-MM-DD'), toDate: moment().format('YYYY-MM-DD HH:mm:ss'), categoryType: 'Internal', category: 'LIST' }

    const getCustomerWiseData = () => {
        axios.post(properties?.API_ENDPOINT + properties.INTERACTION_API + '/live-customer-wise', { searchParams: search }, {
            headers: {
                "Content-Type": "application/json",
                "x-tenant-id": properties.REACT_APP_TENANT_ID,
                authorization: JSON.parse(sessionStorage.getItem("auth")).accessToken
            }
        }).then((resp) => {
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


        // Extract unique hours from oCreatedAt timestamps
        const uniqueHours = [...new Set(chartData.map(item => new Date(item.oCreatedAt).getUTCHours()))];

        // Sort the hours in ascending order
        const sortedHours = uniqueHours.sort((a, b) => a - b);

        // Generate xAxisLabels dynamically based on the sorted hours
        const xAxisLabels = sortedHours.map(hour => {
            const formattedHour = String(hour).padStart(2, '0');
            return `${formattedHour}:00`;
        });

        // Create a map to store data for each customer type
        const customerTypeData = {};

        chartData.forEach(item => {
            const createdAtHour = new Date(item.oCreatedAt).getUTCHours();
            const customerType = item.oCustomerType;

            if (!customerTypeData[customerType]) {
                customerTypeData[customerType] = Array(xAxisLabels.length).fill(0);
            }

            customerTypeData[customerType][sortedHours.indexOf(createdAtHour)] += 1;
        });

        console.log('Object.keys(customerTypeData)------->', Object.keys(customerTypeData))
        // Generate series dynamically based on customerTypeData
        const series = Object.keys(customerTypeData).map(customerType => ({
            name: `${customerType} Customer`,
            type: 'line',
            data: customerTypeData[customerType]
        }));

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
                data: Object.keys(customerTypeData)?.map((ele)=>ele+' '+'Customer')
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
        const interval = setInterval(() => {
            getCustomerWiseData();
            console.log('Running every 5 seconds');
        }, properties?.LIVESTREAMTIME);
        return () => clearInterval(interval);
    }, [isRefresh, isParentRefresh, searchParams]);

    return (
        <div className="cmmn-skeleton">
            <div className="skel-dashboard-title-base">
                <span className="skel-header-title"> Customer wise Interactions </span>
                <div className="skel-dashboards-icons">
                    <a href="javascript:void(null)" onClick={() => setIsRefresh(!isRefresh)}>
                        <i className="material-icons" >refresh</i>
                    </a>
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-graph-sect mt-4">
                <div ref={chartRef} style={{ height: '400px' }}></div>
            </div>
        </div>
    );
};

export default LiveCustomerWise;