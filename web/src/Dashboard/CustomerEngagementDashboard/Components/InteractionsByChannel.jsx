
import React, { useEffect } from "react";
import ReactEcharts from 'echarts-for-react';


const InteractionsByChannel = (props) => {
    const { interactionsByChannels } = props?.data;

    const option = {
        tooltip: {
            trigger: 'axis'
        },
        legend: {
            top: '-1%',
            left: 'center'
        },
        xAxis: {
            type: 'category',
            data: interactionsByChannels?.length > 0 && interactionsByChannels.map(item => item.channel),
            axisLabel: {
                interval: 0, // Display all x-axis labels
                rotate: 45 // Rotate x-axis labels for better readability
            }
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: 'Total Interactions',
                type: 'bar',
                itemStyle: {
                    borderRadius: 0,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 10,
                        fontWeight: 'bold'
                    }
                },
                data: interactionsByChannels?.length > 0 && interactionsByChannels.map((item, index) => ({
                    value: item.count,
                    name: item.channel,
                    itemStyle: {
                        color: `rgb(84,112,198)` // Assign different colors based on index
                    }
                }))
            }
        ]
    };

    return (
        <div className="cmmn-skeleton skel-graph-wd col-md-6">
            <span className="skel-header-title">Interactions Created by this channel</span>
            {interactionsByChannels?.length > 0 ? <ReactEcharts option={option} style={{ height: '400px' }} /> : <p style={{ fontSize: "17px", margin: "143px" }}>No Data Found</p>}
        </div>
    )
}

export default InteractionsByChannel;