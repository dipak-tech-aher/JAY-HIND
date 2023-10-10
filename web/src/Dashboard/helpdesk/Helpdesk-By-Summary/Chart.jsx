import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const Chart = (props) => {
  const chartRef = useRef(null);

  const chartData = props?.data?.chartData || []
  console.log('chartData-----x summary-->', chartData);

  useEffect(() => {
    const chartDom = chartRef.current;
    const myChart = echarts.init(chartDom, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });
    const xAxisData = [...new Set(chartData.map(item => item?.oPriority))];
    const priorities = [...new Set(chartData.map(item => item?.oPriority))];
    const statuses = [...new Set(chartData.map(item => item?.oStatus))];

    const series = statuses.map(status => {
      const data = priorities.map(priority => {
        const matchingItem = chartData.find(item => item.oStatus === status && item.oPriority === priority);
        return matchingItem ? matchingItem.oCnt : 0;
      });

      return {
        name: status,
        type: 'bar',
        stack: 'total',
        label: {
          show: true
        },
        emphasis: {
          focus: 'series'
        },
        data: data
      };
    });

    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}<br/>{a}: {c}'
      },
      // toolbox: {
      //   show: !chartData?.[0]?.xAxisData ? false : true,
      //   feature: {
      //     saveAsImage: { show: true },
      //     magicType: { show: true, type: ['line', 'bar'] },
      //   }
      // },
      legend: {},
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: xAxisData.map(x => x ? x : 'Unclassified')
      },
      yAxis: {
        type: 'value'
      },
      series: series
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

export default Chart;