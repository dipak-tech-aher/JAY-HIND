import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';


const InteractionChartPie = (props) => {
  const chartRef = useRef(null);
  // const chartData = props?.data?.chartData || []
  // const roseType = props?.data?.roseType

  const { chartData = [], roseType} = props?.data
  // const { setIsSoluationActivityOpen } = props?.handler
  // console.log('charData====', chartData)

  useEffect(() => {
    const chartDom = chartRef.current;
    const myChart = echarts.init(chartDom, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });
    const option = {
      tooltip: {
        trigger: 'item'
      },
      toolbox: {
        show: false,
        feature: {
          saveAsImage: { show: true },
        }
      },
      legend: {
        top: 'bottom',
        show: false
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          roseType: roseType,
          emphasis: {
            label: {
              show: true,
              fontSize: 10,
              fontWeight: 'bold'
            }
          },
          label: {
            show: true
          },
          labelLine: {
            show: true,
            length:10
          },
          data: chartData?.length > 0 ? chartData : []
          // data: [
          //   { value: 1048, name: 'Search Engine' },
          //   { value: 735, name: 'Direct' },
          //   { value: 580, name: 'Email' },
          //   { value: 484, name: 'Union Ads' },
          //   { value: 300, name: 'Video Ads' }
          // ]
        }
      ]
    };

    if (option && typeof option === 'object') {
      myChart.setOption(option);
    }

    // myChart.on('click', (params)=>{
    //   setIsSoluationActivityOpen(true)
    // })

    window.addEventListener('resize', myChart.resize);

    return () => {
      window.removeEventListener('resize', myChart.resize);
      myChart.dispose();
    };
  }, [chartData]);

  return <div ref={chartRef} style={{ width: '280px', height: '150px' }}></div>;
};

export default InteractionChartPie;