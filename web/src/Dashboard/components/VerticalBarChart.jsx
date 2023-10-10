import ReactEcharts from "echarts-for-react";
import React from 'react';


const VerticalBarChart = (props) => {

    const { xAxisData, seriesData, toolbox, height , yAxisData } = props.data

    return (
        <>
            {xAxisData.length > 0 && seriesData.length > 0 ? <ReactEcharts style={{ "height": height }}
                option={{
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            type: 'shadow'
                        }
                    },
                    toolbox: toolbox,
                    legend: {},
                    grid: {
                        left: '0%',
                        right: '0%',
                        bottom: '2%',
                        containLabel: true
                    },
                    xAxis: xAxisData,
                    yAxis: yAxisData,
                    series: seriesData
                }}
            /> :
                <>No record Found for Vertical Chart</>
            }
        </>
    )
}

export default VerticalBarChart