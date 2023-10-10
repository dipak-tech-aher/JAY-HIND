import React, { useContext, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { salesDashboardContext } from "../../../AppContext";

const LiveLineChart = (props) => {
    const { getter, handler } = useContext(salesDashboardContext);

    const { salesLiveData } = getter
    const { fetchAndUpdateSalesData } = handler
    const { width, height } = props?.chartStyle
    const chartRef = useRef(null)
    const myChart = useRef(null)

    useEffect(() => {
        // const chartDom = chartRef.current;
        myChart.current = echarts.init(chartRef.current, null, {
            renderer: 'canvas',
            useDirtyRect: false
        });

        const option = {
            // title: {
            //     text: 'Beijing AQI',
            //     left: '1%'
            // },
            // height,
            width: '92%',
            tooltip: {
                trigger: 'axis'
            },
            grid: {
                left: '5%',
                right: '15%',
                bottom: '10%'
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: salesLiveData.map(function (item, index) {
                    return index; // assuming time increases as index
                }),
            },
            yAxis: { type: 'value' },
            toolbox: {
                feature: {
                    // dataZoom: {
                    //     yAxisIndex: 'none'
                    // },
                    // restore: {},
                    saveAsImage: { show: true }
                }
            },
            dataZoom: [{
                start: salesLiveData.length > 20 ? 90 : 30,
                type: "inside"
            }, {
                start: salesLiveData.length > 20 ? 90 : 30
            }],
            //   graphic: [
            //     {
            //         type: 'circle', // Use a circle graphic
            //         position: [salesLiveData[salesLiveData.length - 1], salesLiveData[salesLiveData.length - 1]], // Use position instead of shape
            //         shape: {
            //             r: 4, // Circle radius
            //         },
            //         style: {
            //             fill: 'red', // Circle color
            //         },
            //         z: 100, // Ensure it's above the line chart
            //         // Animation options (you can adjust these values)
            //         animate: {
            //             duration: 1000, // Animation duration
            //             loop: true, // Loop the animation
            //             delay: 10, // Delay before starting
            //         },
            //     },
            // ],
            series: [{
                name: 'Live Data',
                type: 'line',
                // smooth: true,
                symbol: 'none',
                // label: {
                //     show: true,
                //     position: 'top'
                // },
                lineStyle: {
                    width: 1
                },
                data: salesLiveData, // initial empty data
                // areaStyle: {
                //     opacity: 0.8,
                //     color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                //         {
                //             offset: 0,
                //             color: 'rgb(42,42,243)'
                //         },
                //         {
                //             offset: 1,
                //             color: 'rgb(255, 255, 255)'
                //         }
                //     ])
                // },
            }],
        }

        if (option && typeof option === 'object') {
            myChart.current.setOption(option);
        }

        const cleanup = () => {
            clearInterval(dataUpdateInterval);
            myChart.current.dispose();
        };

        const dataUpdateInterval = setInterval(() => {
            fetchAndUpdateSalesData(myChart.current);
        }, 3000); // 30 seconds 3000

        // window.addEventListener('resize', myChart.resize);

        // return () => {
        //     window.removeEventListener('resize', myChart.resize);
        //     myChart.dispose();
        // };
        return cleanup
    }, [])

    return <div ref={chartRef} style={{ width, height }}></div>;
}

export default LiveLineChart;