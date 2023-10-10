import ReactEcharts from "echarts-for-react";
import React from 'react';

const PieChart = (props) => {

    const { seriesData, legend } = props.data

    return (
        <ReactEcharts style={{ "height": "340%" }}
            option={{
                tooltip: {
                    trigger: 'item'
                },
                legend: legend,
                series: seriesData

            }}
        />
    )

}

export default PieChart