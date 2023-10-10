import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const PieChart = (props) => {
  const chartRef = useRef(null);
  var colorPalette = ['#00b04f', '#ffbf00', '#CCCCCC', '#ff0000'];

  const chartData = props?.data?.chartData || []
  console.log('chartData------->', chartData)
  useEffect(() => {
    const chartDom = chartRef.current;
    const myChart = echarts.init(chartDom, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });
    const option = {
      series: [
        {
          name: 'Nightingale Chart',
          type: 'pie',
          radius: [40, 100],
          center: ['50%', '50%'],
          roseType: 'area',
          color: colorPalette,
          itemStyle: {
            borderRadius: 8
          },
          data: chartData
        }
      ]
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

  return <div ref={chartRef} style={{ width: '100%', height: '200px' }}></div>;
};

export default PieChart;