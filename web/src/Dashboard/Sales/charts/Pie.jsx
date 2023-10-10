import * as echarts from 'echarts';
import React, { useContext, useEffect, useRef } from 'react';
import { salesDashboardContext } from "../../../AppContext";

const Pie = (props) => {
    const { getter } = useContext(salesDashboardContext);
    const { width, height } = props?.chartStyle;

    const { dealsByAge } = getter
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
            tooltip: {
                trigger: 'item'
            },
            legend: {
                left: 'center',
                selectedMode: true
            },
            series: [
                {
                    name: 'Access From',
                    type: 'pie',
                    selectedMode: "multiple",
                    label: {
                        show: true,
                        formatter(param) {
                            let message = param.data.metaData.vDiffDays == "0" ? `${param.data.value} for today` : `${param.data.value} more than ${param.data.value} days`
                            return param.name + ' (' + message + ')';
                        }
                    },
                    radius: [20, 140],
                    roseType: 'area',
                    itemStyle: {
                        borderRadius: 5
                    },
                    data: dealsByAge.map(x => ({ value: x.vDealsCount, name: x.vOrderChannel, metaData: { vDiffDays: x.vDiffDays } }))
                }
            ]
        }

        if (option && typeof option === 'object') {
            myChart.current.setOption(option);
        }

        const cleanup = () => {
            myChart.current.dispose();
        };

        return cleanup
    }, [dealsByAge])

    return <div ref={chartRef} style={{ width, height }}></div>;

}

export default Pie