import React, { useEffect } from 'react';
import * as echarts from 'echarts';


const Performance = (props) => {

  const chartData = props?.data?.chartData || []
  useEffect(() => {
    const dom = document.getElementById('container');
    const myChart = echarts.init(dom, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: { show: true }
        }
      },
      xAxis: [
        {
          type: 'category',
          data: chartData.length > 0 ? chartData[0].keys : []
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: [
        {
          name: 'orders',
          type: 'bar',
          stack: 'Ad',
          label: {
            show: true
          },
          data: chartData.length > 0 ? chartData[0].orders : []
        }, {
          name: 'Interactions',
          type: 'bar',
          label: {
            show: true
          },
          data: chartData.length > 0 ? chartData[0].interactions : []
        }
      ]
    };

    myChart.setOption(option);

    window.addEventListener('resize', () => {
      myChart.resize();
    });

    return () => {
      window.removeEventListener('resize', () => {
        myChart.resize();
      });
    }
  }, []);

  return (
    <div id="container" style={{ width: '100%', height: 400 }}></div>
  );
};

export default Performance;