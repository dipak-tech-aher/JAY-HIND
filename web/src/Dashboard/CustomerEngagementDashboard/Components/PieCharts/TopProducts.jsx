import React from "react";
import ReactEcharts from 'echarts-for-react';

const TopProducts = (props) => {
    const { topPerformingProducts } = props.data;

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
            data: topPerformingProducts?.length > 0 && topPerformingProducts.map(item => item.prod_desc),
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
                name: 'Total Products',
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
                data: topPerformingProducts?.length > 0 && topPerformingProducts.map((item, index) => ({
                    value: item.total_cnt,
                    name: item.prod_desc,
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
                <span className="skel-header-title">Top 5 Performing Product</span>
                {topPerformingProducts?.length > 0 ? <ReactEcharts option={option} style={{ height: '500px', width: '100%' }} /> : <p style={{ fontSize: "17px", margin: "143px" }}>No Data Found</p>}
            </div>
        </div>
    )
}

export default TopProducts;
