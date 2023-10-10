import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const EChartsComponent = (props) => {
  const { yAxisData } = props?.data;
  const chartRef = useRef(null);

  useEffect(() => {
    const myChart = echarts.init(chartRef.current);
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {},
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      yAxis: {
        type: 'value'
      },
      xAxis: {
        type: 'category',
        data: ['Scheduled', 'Successful', 'Unsuccessful', 'Cancelled']
      },
      series: [
        {
          name: 'Business',
          type: 'bar',
          stack: 'total',
          label: {
            show: true
          },
          emphasis: {
            focus: 'series'
          },
          data: [yAxisData?.schedule?.business, yAxisData?.success?.business, yAxisData?.unSuccess?.business, yAxisData?.cancelled?.business]
        },
        {
          name: 'Consumer',
          type: 'bar',
          stack: 'total',
          label: {
            show: true
          },
          emphasis: {
            focus: 'series'
          },
          data: [yAxisData?.schedule?.consumer, yAxisData?.success?.consumer, yAxisData?.unSuccess?.consumer, yAxisData?.cancelled?.consumer]
        }
      ]
    };


    option && myChart.setOption(option);

    return () => {
      myChart.dispose(); // Dispose the chart when the component is unmounted
    };
  }, [props]);

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }}></div>;
};

export default EChartsComponent;
