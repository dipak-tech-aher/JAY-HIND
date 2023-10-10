import React, { useContext, useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { salesDashboardContext } from "../../../AppContext";
import { unstable_batchedUpdates } from 'react-dom';

const Line = (props) => {
    const { width, height } = props?.chartStyle
    const { getter } = useContext(salesDashboardContext);

    const { rententionRate } = getter
    const chartRef = useRef(null)
    const myChart = useRef(null)

    const [seriesData, setSeriesData] = useState([])
    const [keys, setKeys] = useState([])

    useEffect(() => {
        const rate = [{
            name: 'Rentention Rate',
            type: 'line',
            stack: 'Total',
            data: rententionRate?.map(element => element?.vCustRetRate || 0) || []
        }]
        const k = rententionRate?.map(element => element?.vMonth?.trim() || '') || []
        unstable_batchedUpdates(() => {
            setKeys(k)
            setSeriesData(rate)
        })
    }, [rententionRate])

    useEffect(() => {
        myChart.current = echarts.init(chartRef.current, null, {
            renderer: 'canvas',
            useDirtyRect: false
        });

        const option = {
            title: {
                show: seriesData?.length === 0 ? true : false,
                textStyle: {
                    color: "grey",
                    fontSize: 20
                },
                text: "No data available",
                left: "center",
                top: "center"
            },
            animationEasing: 'ElasticOut',
            tooltip: {
                trigger: 'axis',
                show: seriesData?.length === 0 ? false : true
            },
            legend: {
                data: keys || []
            },
            grid: {
                left: '3%',
                right: '6%',
                bottom: '3%',
                containLabel: true
            },
            toolbox: {
                feature: {
                    saveAsImage: { show: true }
                },
                show: seriesData?.length === 0 ? false : true,

            },
            calculable: true,
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: keys || [],
                show: seriesData?.length === 0 ? false : true,
            },
            yAxis: {
                type: 'value'
            },
            series: seriesData || []
        }

        if (option && typeof option === 'object') {
            myChart.current.setOption(option);
        }

        const cleanup = () => {
            myChart.current.dispose();
        }

        return cleanup

    }, [seriesData])

    return <div ref={chartRef} style={{ width, height }}></div>;

}

export default Line;