import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const LiveBar = (props) => {
    const { chartData } = props?.data
    const { width, height } = props?.chartStyle
    const { fetchAndUpdateSalesGrowth } = props?.handler
    const chartRef = useRef(null)
    const myChart = useRef(null)
    
    useEffect(() => {
        myChart.current = echarts.init(chartRef.current, null, {
            renderer: 'canvas',
            useDirtyRect: false
        });

        const option = {
            width,
            height,
            toolbox: {
                feature: {
                    // dataZoom: {
                    //     yAxisIndex: 'none'
                    // },
                    restore: {},
                    magicType: { show: true, type: ['line', 'bar', 'stack'] },
                    saveAsImage: { show: true }
                }
            },
            // grid: {
            //     top: 20,
            //     bottom: 30,
            //     left: '20%',
            //     right: '5%',

            // },
            xAxis: {
                type: 'category',
                // data: ['Q3-2022', 'Q4-2022', 'Q1-2023', 'Q2-2023']
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    data: chartData,
                    type: 'bar',
                    barWidth: 30,
                    showBackground: true,
                    backgroundStyle: {
                        color: 'rgba(180, 180, 180, 0.2)'
                    }
                }
            ]
        }

        if (option && typeof option === 'object') {
            myChart.current.setOption(option);
        }

        const cleanup = () => {
            clearInterval(dataUpdateInterval);
            myChart.current.dispose();
        }

        const dataUpdateInterval = setInterval(() => {
            fetchAndUpdateSalesGrowth(myChart.current);
        }, 3000); // 30 seconds

        // window.addEventListener('resize', myChart.resize);

        // return () => {
        //     window.removeEventListener('resize', myChart.resize);
        //     myChart.dispose();
        // };
        return cleanup

    }, [])

    return <div ref={chartRef} style={{ width, height }}></div>;
}

export default LiveBar;