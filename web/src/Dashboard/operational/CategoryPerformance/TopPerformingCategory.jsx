import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';


const TopPerformingCategory = (props) => {

    const chartRef = useRef(null);

    const chartData = props?.data?.chartData
    const entity = props?.data?.entity
    const masterLookupData = props?.data?.masterLookupData

    console.log({ entity, masterLookupData })
    const codes = {
        "Interaction Type": "INTERACTION_STATUS",
        "Interaction Category": "INTERACTION_STATUS",
        "Order Type": "ORDER_STATUS",
        "Order Category": "ORDER_STATUS",
    }

    useEffect(() => {

        const chartDom = chartRef.current;
        const myChart = echarts.init(chartDom, null, {
            renderer: 'canvas',
            useDirtyRect: false
        });

        let xAxisData = chartData.length > 0 ? chartData?.[0]?.xAxisData : [];
        if (codes[entity]) {
            console.log({ entity }, codes[entity], masterLookupData[codes[entity]])
            xAxisData = xAxisData.map(x => {
                console.log({ x })
                return masterLookupData[codes[entity]].find(y => y.code == x)?.description ?? x;
            })
        }

        const option = {
            title: {
                show: chartData?.[0]?.xAxisData?.length === 0 ? true : false,
                textStyle: {
                    color: "grey",
                    fontSize: 20
                },
                text: "No data available",
                left: "center",
                top: "center"
            },
            toolbox: {
                // show: true,
                // feature: {
                //     saveAsImage: { show: true },
                //     magicType: { show: true, type: ['line', 'bar'] },
                // }
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
                    data: xAxisData,
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
            series: chartData.length > 0 ? chartData?.[0]?.seriesData : [],

            // [
            //     {
            //         //   name: entity,
            //         type: 'bar',
            //         barGap: 0,
            //         barMaxWidth: 100,
            //         emphasis: {
            //             label: {
            //                 show: true,
            //                 fontSize: '15',
            //                 fontWeight: 'bold'
            //             }
            //         },
            //         label: {
            //             show: true,
            //             position: "insideBottom",
            //             distance: 15,
            //             align: "left",
            //             verticalAlign: "middle",
            //             fontSize: 16,
            //         },
            //         data: chartData.length > 0 ? chartData?.[0]?.seriesData : [],
            //         colorBy: "data"
            //     }
            // ]
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

export default TopPerformingCategory;