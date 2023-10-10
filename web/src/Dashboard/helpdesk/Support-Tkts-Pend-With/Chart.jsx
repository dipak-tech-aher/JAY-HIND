import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const Chart = (props) => {
  const chartRef = useRef(null);

  const chartData = props?.data?.chartData || []
  console.log('chartData----xxzzz--->', chartData)
  useEffect(() => {
    const seriesData = Object.entries(chartData).map(([name, value]) => {
      return {
        value, name: name == 'null' ? "Unclassfied" : name?.toUpperCase() === "DTWORKS" ? 'dtWorks' : name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
      }
    });
    const chartDom = chartRef.current;
    const myChart = echarts.init(chartDom, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b} : {d}%'
      },
      legend: {
        bottom: 10,
        left: 'center',
        data: seriesData.map(item => item.name)
      },
      series: [
        {
          type: 'pie',
          radius: '65%',
          center: ['50%', '50%'],
          selectedMode: 'single',
          data: seriesData,
          labelLine: {
            show: false
          },
          label: {
            show: true,
            position: 'inside',
            formatter: '{d}%'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
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

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }}></div>;
};

export default Chart;