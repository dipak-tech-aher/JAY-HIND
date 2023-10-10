import ReactEcharts from "echarts-for-react";
import React from 'react';


const HorizontalBarChart = (props) => {
    const { yAxisData, seriesData, tooltip, legend ,xAxisData } = props.data

    return (
        <>
            {
             <ReactEcharts
                    option={{
                        tooltip: tooltip,
                        toolbox: {},
                        legend: legend,
                        grid: {
                            left: '3%',
                            right: '4%',
                            bottom: '3%',
                            containLabel: true
                        },
                        xAxis: xAxisData,
                        yAxis: yAxisData,
                        series: seriesData
                    }}
                />
            }
        </>
    )


}

export default HorizontalBarChart;