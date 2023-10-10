import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';


const TopPerformance = (props) => {

    const chartRef = useRef(null);

    const chartData = props?.data?.chartData
    const entity = props?.data?.entity

    useEffect(() => {

        const chartDom = chartRef.current;
        const myChart = echarts.init(chartDom, null, {
            renderer: 'canvas',
            useDirtyRect: false
        });

        const option = {
            title: {
                show: chartData?.[0]?.xAxisData?.length === 0,
                textStyle: {
                    color: "grey",
                    fontSize: 20
                },
                text: "No data available",
                left: "center",
                top: "center"
            },
            toolbox: {
                show: chartData?.[0]?.xAxisData?.length === 0 ? false : true,
                feature: {
                    saveAsImage: { show: true },
                    magicType: { show: true, type: ['line', 'bar'] },
                }
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            xAxis: [
                {
                    type: 'category',
                    axisTick: { show: true },
                    data: chartData.length > 0 ? chartData[0]?.xAxisData : [],
                    show: chartData?.[0]?.xAxisData?.length === 0 ? false : true,
                    axisLabel: {
                        interval: 0,
                        width: "90",
                        overflow: "break",
                    }
                }
            ],
            legend: {
                top: 'bottom'
            },
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: [
                {
                    type: 'bar',
                    colorBy: 'data',
                    barGap: 0,
                    barMaxWidth: 100,
                    emphasis: {
                        focus: 'series'
                    },
                    label: {
                        show: true,
                        position: "insideBottom",
                        distance: 15,
                        align: "left",
                        verticalAlign: "middle",
                        fontSize: 16,
                    },
                    data: chartData.length > 0 ? chartData[0]?.yAxisData : []
                }
            ]
        };

        if (option && typeof option === 'object') {
            myChart.setOption(option);
        }

        window.addEventListener('resize', myChart.resize);

        return () => {
            window.removeEventListener('resize', myChart.resize);
            myChart.dispose();
        };
    }, [props.data.chartData]);

    return <div ref={chartRef} style={{ width: '100%', height: '400px' }}></div>;

};

export default TopPerformance;