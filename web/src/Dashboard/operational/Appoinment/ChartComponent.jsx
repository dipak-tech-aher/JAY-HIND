import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { isEmpty } from 'lodash'

const ChartComponent = (props) => {
    const chartRef = useRef(null);

    const chartData = props?.data?.chartData || []
    // console.log('chartData ', chartData)
    useEffect(() => {
        // const chartInstance = echarts.init(chartRef.current);

        const chartDom = chartRef.current;
        const chartInstance = echarts.init(chartDom, null, {
            renderer: 'canvas',
            useDirtyRect: false
        });


        //let seriesData = []
        // if (!isEmpty(chartData)) {
        //   for (let e in chartData) {
        //     if (e !== "date") {
        //       seriesData.push({
        //         name: e,
        //         type: e === "total" ? 'line' : 'bar',
        //         barMaxWidth: 100,
        //         label: {
        //           show: true
        //         },
        //         data: chartData[e]
        //       })
        //     }
        //   }
        // }
        console.log('chartData?.[0]?.xAxisData----------->', chartData)
        console.log('chartData?.[0]?.xAxisData?.length----------->', chartData?.[0]?.xAxisData?.length)
        const option = {
            title: {
                show: (chartData?.[0]?.xAxisData?.length === 0 || !chartData?.[0]?.xAxisData) ? true : false,
                textStyle: {
                    color: "grey",
                    fontSize: 20
                },
                text: "No data available",
                left: "center",
                top: "center"
            },
            toolbox: {
                show: true,
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
            legend: {
                data: chartData?.[0]?.legend || []
            },
            xAxis: [
                {
                    type: 'category',
                    show: chartData?.[0]?.xAxisData?.length === 0 ? false : true,
                    axisTick: { show: true },
                    data: chartData.length > 0 ? chartData?.[0]?.xAxisData : [],
                    axisLabel: {
                        interval: 0,
                        width: "90",
                        overflow: "break",
                    }
                }
            ],
            // legend: {
            //     show: true
            // },
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: chartData.length > 0 ? chartData?.[0]?.seriesData : []
        };

        // const option = {
        //   legend: {
        //     show: false
        //   },
        //   title: {
        //     show: chartData?.length === 0 ? true : false,
        //     textStyle: {
        //       color: "grey",
        //       fontSize: 20
        //     },
        //     text: "No data available",
        //     left: "center",
        //     top: "center"
        //   },
        //   toolbox: {
        //     show: chartData?.length === 0 ? false : true,
        //     feature: {
        //       saveAsImage: { show: true }
        //     }
        //   },
        //   tooltip: {
        //     trigger: 'axis',
        //     axisPointer: {
        //       type: 'shadow'
        //     }
        //   },
        //   dataset: {
        //     source: chartData
        //   },
        //   xAxis: [
        //     {
        //       type: 'category',
        //       show: chartData?.length === 0 ? false : true,
        //       axisTick: { show: true },
        //       data: chartData?.data || [],
        //       axisLabel: {
        //         interval: 0,
        //         width: "90",
        //         overflow: "break",
        //       }
        //     }
        //   ],
        //   yAxis: [
        //     {
        //       type: 'value',
        //       // label:{
        //       //   show: true
        //       // }
        //       // name: 'Appointment'
        //     },
        //     {
        //       type: 'value',
        //       // name: 'total'
        //     }
        //   ],
        //   series: seriesData || []
        // };

        if (option && typeof option === 'object') {
            chartInstance.setOption(option);
        }

        window.addEventListener('resize', chartInstance.resize);

        return () => {
            window.removeEventListener('resize', chartInstance.resize);
            chartInstance.dispose();
        };
    }, [props.data.chartData]);

    return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};

export default ChartComponent;