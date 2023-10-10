import * as echarts from 'echarts';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { salesDashboardContext } from "../../../AppContext";

const PieHalfDonut = (props) => {
    // const { chartData } = props?.data
    // const { fetchAndUpdateSalesData } = props?.handler
    const { getter } = useContext(salesDashboardContext);
    const { width, height } = props?.chartStyle
    const { channelSales } = getter

    const chartRef = useRef(null)
    const myChart = useRef(null)
    const [seriesData, setSeriesData] = useState([])


    useEffect(() => {
        const modifiedData = channelSales?.list?.length > 0 ? channelSales?.list.map(c => { return { value: c.vTotalSalesCnt, name: c.vChannel } }) : []
        const lastValue = modifiedData?.length > 0 ? modifiedData.reduce((acc, i) => acc + Number(i.value), 0) : 0
        if (lastValue) {
            modifiedData.push({
                // make an record to fill the bottom 50%
                value: lastValue,
                itemStyle: {
                    // stop the chart from rendering this piece
                    color: 'none',
                    decal: {
                        symbol: 'none'
                    }
                },
                label: {
                    show: false
                }
            })
        }
        setSeriesData(modifiedData)
    }, [channelSales?.list])

    useEffect(() => {
        // const chartDom = chartRef.current;
        myChart.current = echarts.init(chartRef.current, null, {
            renderer: 'canvas',
            useDirtyRect: false
        });

        const option = {
            title: {
                show: seriesData?.length > 0 ? false : true,
                textStyle: {
                    color: "grey",
                    fontSize: 20
                },
                text: "No data available",
                left: "center",
                top: "center"
            },
            width,
            height,
            tooltip: {
                trigger: 'item'
            },
            legend: {
                top: '2%',
                left: 'center',
                // doesn't perfectly work with our tricks, disable it
                selectedMode: false,
                show: seriesData?.length > 0 ? true : false,
            },
            series: seriesData?.length > 0 ? [
                {
                    // name: 'Access From',
                    type: 'pie',
                    grid: {
                        top: 20,
                        bottom: 10,
                        left: '20%',
                        right: '5%',

                    },
                    radius: ['40%', '70%'],
                    center: ['50%', '70%'],
                    // adjust the start angle
                    startAngle: 180,
                    show: seriesData?.length > 0 ? true : false,
                    label: {
                        show: seriesData?.length > 0 ? true : false,
                        formatter(param) {
                            // correct the percentage
                            return param.name + ' (' + param.percent * 2 + '%)';
                        }
                    },
                    data: seriesData || []

                    // [
                    //     { value: 1048, name: 'Channel 1' },
                    //     { value: 735, name: 'Channel 2' },
                    //     { value: 580, name: 'Channel 3' },
                    //     { value: 484, name: 'Channel 4' },
                    //     { value: 300, name: 'Channel 5' },
                    // {
                    //     // make an record to fill the bottom 50%
                    //     value: 1048 + 735 + 580 + 484 + 300,
                    //     itemStyle: {
                    //         // stop the chart from rendering this piece
                    //         color: 'none',
                    //         decal: {
                    //             symbol: 'none'
                    //         }
                    //     },
                    //     label: {
                    //         show: false
                    //     }
                    // }
                    // ]
                }
            ] : []
        }

        if (option && typeof option === 'object') {
            myChart.current.setOption(option);
        }

        const cleanup = () => {
            myChart.current.dispose();
        };


        // window.addEventListener('resize', myChart.resize);

        // return () => {
        //     window.removeEventListener('resize', myChart.resize);
        //     myChart.dispose();
        // };
        return cleanup
    }, [seriesData])

    return <div ref={chartRef} style={{ width, height }}></div>;

}

export default PieHalfDonut