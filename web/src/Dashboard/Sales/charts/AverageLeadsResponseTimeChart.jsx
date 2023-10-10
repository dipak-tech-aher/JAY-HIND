import React, { useContext, useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { salesDashboardContext } from "../../../AppContext";
import { unstable_batchedUpdates } from 'react-dom';

const AverageLeadsResponseTimeChart = (props) => {
    const { width, height } = props?.chartStyle
    const { getter } = useContext(salesDashboardContext);

    const { avgLeadsRespTime } = getter
    const chartRef = useRef(null)
    const myChart = useRef(null)

    useEffect(() => {
        myChart.current = echarts.init(chartRef.current, null, {
            renderer: 'canvas',
            useDirtyRect: false
        });

        const option = {
            tooltip: {
                trigger: 'axis',
                show: avgLeadsRespTime?.length === 0 ? false : true
            },
            legend: {
                data: ['Average response count', 'Average response time']
            },
            xAxis: {
                type: 'category',
                data: avgLeadsRespTime?.map(x => x.vMonth)
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: 'Average response count',
                    type: 'bar',
                    tooltip: {
                        valueFormatter: function (value) {
                            return value + ' ';
                        }
                    },
                    data: avgLeadsRespTime?.map(x => x.vCnt) || []
                },
                {
                    name: 'Average response time',
                    type: 'line',
                    tooltip: {
                        valueFormatter: function (value) {
                            return value + ' ';
                        }
                    },
                    data: avgLeadsRespTime?.map(x => x.vAvgChatQueueWaitTimeInterval) || []
                }
            ]
        }

        if (option && typeof option === 'object') {
            myChart.current.setOption(option);
        }

        const cleanup = () => {
            myChart.current.dispose();
        }

        return cleanup

    }, [avgLeadsRespTime])

    return <div ref={chartRef} style={{ width, height }}></div>;

}

export default AverageLeadsResponseTimeChart;