import React, { useContext, useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { salesDashboardContext } from "../../../AppContext";
import { unstable_batchedUpdates } from 'react-dom';

const CustomerChurnRateChart = (props) => {
    const { width, height } = props?.chartStyle
    const { getter } = useContext(salesDashboardContext);

    const { customerChurnRate } = getter
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
                show: customerChurnRate?.list?.length === 0 ? false : true
            },
            xAxis: {
                type: 'category',
                data: customerChurnRate?.list?.map(x => x.vCustChurnRate)
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    data: customerChurnRate?.list?.map(x => x.vCustChurnRate),
                    type: 'line'
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

    }, [customerChurnRate])

    return <div ref={chartRef} style={{ width, height }}></div>;

}

export default CustomerChurnRateChart;