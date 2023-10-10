import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const Chart = (props) => {
  const chartRef = useRef(null);

  const chartOption = props?.data?.chartOption || []

  useEffect(() => {    
    const chartDom = chartRef.current;
    const myChart = echarts.init(chartDom, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });

    if (chartOption && typeof chartOption === 'object') {
      myChart.setOption(chartOption);
    }

    window.addEventListener('resize', myChart.resize);

    return () => {
      window.removeEventListener('resize', myChart.resize);
      myChart.dispose();
    };
  }, [props.data.chartOption]);

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }}></div>;
};

export default Chart;