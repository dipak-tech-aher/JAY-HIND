import React, { useContext, useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { isEmpty } from 'lodash'
import { salesDashboardContext } from "../../../AppContext";


const MixLineBar = (props) => {
  const { width, height } = props?.chartStyle
  const { getter } = useContext(salesDashboardContext);

  const { customerLifetimeValue } = getter
  const chartRef = useRef(null)
  const myChart = useRef(null)

  useEffect(() => {
    myChart.current = echarts.init(chartRef.current, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });

    const option = {
      title: {
        show: customerLifetimeValue?.list?.length ? false : true,
        textStyle: {
          color: "grey",
          fontSize: 20
        },
        text: "No data available",
        left: "center",
        top: "center"
      },
      height,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999'
          }
        },
        show: !customerLifetimeValue?.list?.length ? false : true
      },
      toolbox: {
        feature: {
          saveAsImage: { show: true }
        }
      },
      legend: {
        data: ['Customer life time value', 'Customer life span']
      },
      xAxis: [
        {
          type: 'category',
          data: customerLifetimeValue?.list?.map(x => x.vMonth),
          axisPointer: {
            type: 'shadow'
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisLabel: {
            formatter: '{value}'
          },
          axisPointer: {
            snap: true
          }
        },
        {
          type: 'value',
          name: 'Customer Life',
          interval: 10,
          axisLabel: {
            formatter: params => {
              return params.data;
            }
          }
        }
      ],
      series: [
        {
          name: 'Customer life time value',
          type: 'bar',
          tooltip: {
            valueFormatter: function (value) {
              return value + ' ';
            }
          },
          data: customerLifetimeValue?.list?.map(x => x.avgCustomerLifetimeValue) || []
        },
        {
          name: 'Customer life span',
          type: 'line',
          yAxisIndex: 1,
          tooltip: {
            valueFormatter: function (value) {
              return value + ' ';
            }
          },
          data: customerLifetimeValue?.list?.map(x => x.avgCustomerLifespan) || []
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

  }, [customerLifetimeValue])

  return <div ref={chartRef} style={{ width: '95%', height: '400px' }}></div>;

}

export default MixLineBar