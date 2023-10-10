import React from 'react';
import ReactEcharts from 'echarts-for-react';
import { useEffect } from 'react';
import { useState } from 'react';

const StackedHorizontalBar = (props) => {
    let chartData = props.data.chartData;
    const [seriesData, setSeriesData] = useState([])

    useEffect(() => {
        const data = chartData?.service?.map((e) => ({
            name: e.name, type: 'bar',
            stack: 'total',
            label: { show: true },
            emphasis: { focus: 'series' },
            data: e?.data
        }))
        setSeriesData(data)
    }, [chartData])

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                // Use axis to trigger tooltip
                type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
            }
        },
        toolbar: {
            show: true,
            orient: "horizontal",
            feature: {
                dataView: { readOnly: false }
            }
        },
        legend: {
            show: false
        },
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
            data: chartData?.yAxis || []
        },
        series: seriesData
        //  [
        //     {
        //         name: 'S',
        //         type: 'bar',
        //         stack: 'total',
        //         label: {
        //             show: true
        //         },
        //         emphasis: {
        //             focus: 'series'
        //         },
        //         data: [0, 0, 2, 0]
        //     },
        //     {
        //         name: 'N',
        //         type: 'bar',
        //         stack: 'total',
        //         label: {
        //             show: true
        //         },
        //         emphasis: {
        //             focus: 'series'
        //         },
        //         data: [7, 2, 9, 10]
        //     }, {
        //         name: 'E',
        //         type: 'bar',
        //         stack: 'total',
        //         label: {
        //             show: true
        //         },
        //         emphasis: {
        //             focus: 'series'
        //         },
        //         data: [7, 14, 27, 16]
        //     }, {
        //         name: 'F',
        //         type: 'bar',
        //         stack: 'total',
        //         label: {
        //             show: true
        //         },
        //         emphasis: {
        //             focus: 'series'
        //         },
        //         data: [28, 27, 8, 19]
        //     },
        //     {
        //         name: 'M',
        //         type: 'bar',
        //         stack: 'total',
        //         label: {
        //             show: true
        //         },
        //         emphasis: {
        //             focus: 'series'
        //         },
        //         data: [4, 3, 0, 1]
        //     }
        // ]
    }

    return (
        <>
            <ReactEcharts option={option} style={{ height: '400px', width: '80%' }} />
        </>
    );

}

export default StackedHorizontalBar