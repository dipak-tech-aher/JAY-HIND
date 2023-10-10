
import React from "react";
import ReactEcharts from 'echarts-for-react';

const TopGrevience = (props) => {
    const { topChannelsByGrevience } = props?.data;

    // Pie chart code commented
    // const option = {
    //     tooltip: {
    //         trigger: 'item'
    //     },
    //     legend: {
    //         top: '-1%',
    //         left: 'center'
    //     },
    //     series: [
    //         {
    //             name: '',
    //             type: 'pie',
    //             radius: ['40%', '70%'],
    //             avoidLabelOverlap: false, // Enable avoidLabelOverlap
    //             itemStyle: {
    //                 borderRadius: 10,
    //                 borderColor: '#fff',
    //                 borderWidth: 2
    //             },
    //             label: {
    //                 show: false,
    //                 position: 'outside', // Adjust label position to 'outside'
    //                 formatter: '{b}: {c}'
    //             },
    //             emphasis: {
    //                 label: {
    //                     show: false,
    //                     fontSize: 10,
    //                     fontWeight: 'bold'
    //                 }
    //             },
    //             labelLine: {
    //                 show: false // Show label lines
    //             },
    //             data: topChannelsByGrevience?.length > 0 && topChannelsByGrevience.map(item => {
    //                 return {
    //                     value: item.total_cnt,
    //                     name: item.channel_desc
    //                 };
    //             })
    //         }
    //     ]
    // };

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
            data: topChannelsByGrevience?.length > 0 && topChannelsByGrevience.map(item => item.channel_desc),
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
                name: 'Total Grevience',
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
                data: topChannelsByGrevience?.length > 0 && topChannelsByGrevience.map((item, index) => ({
                    value: item.total_cnt,
                    name: item.channel_desc,
                    itemStyle: {
                        color: `rgb(84,112,198)` // Assign different colors based on index
                    }
                }))
            }
        ]
    };

    return (
        <div className="col-md-4 pl-0">
            <div className="cmmn-skeleton">
                <span className="skel-header-title">Top 5 Channels by Grievance</span>
                {topChannelsByGrevience?.length > 0 ? < ReactEcharts option={option} style={{ height: '500px', width: '100%' }} /> : <p style={{ fontSize: "17px", margin: "143px" }}>No Data Found</p>}
            </div>
        </div>
    )

}

export default TopGrevience;