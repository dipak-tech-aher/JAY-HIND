import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const PieChart = (props) => {
  const chartRef = useRef(null);
  const { severityCounts } = props?.data;
  console.log('severityCodes------>', severityCounts)

  useEffect(() => {
    const chartDom = chartRef.current;
    const myChart = echarts.init(chartDom, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });

    const categories = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const seriesData = {};

    severityCounts.forEach(item => {
      const dayIndex = categories.indexOf(item.oCreatedDay);
      if (dayIndex !== -1) {
        const status = item.oStatus;
        if (!seriesData[status]) {
          seriesData[status] = new Array(categories.length).fill(0);
        }
        seriesData[status][dayIndex] += item.oCnt;
      }
    });

    const series = Object.keys(seriesData).map(status => ({
      type: 'bar',
      data: seriesData[status],
      coordinateSystem: 'polar',
      name: status,
      stack: 'a',
      emphasis: {
        focus: 'series'
      }
    }));

    const option = {
      angleAxis: {},
      radiusAxis: {
        type: 'category',
        data: categories,
        z: 10
      },
      polar: {},
      series: series,
      legend: {
        show: true,
        data: Object.keys(seriesData)
      }
    };

    if (option && typeof option === 'object') {
      myChart.setOption(option);
    }

    window.addEventListener('resize', myChart.resize);

    return () => {
      window.removeEventListener('resize', myChart.resize);
      myChart.dispose();
    };
  }, [props.data.severityCounts]);

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }}></div>;
};

export default PieChart;