import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const InteractionChartGauge = (props) => {
  
  const chartRef = useRef(null);
  const { score, name ='', height = '400px', width = '100%' } = props?.data
  // console.log('props?.data ', score)

  useEffect(() => {
    const chartDom = chartRef.current;
    const myChart = echarts.init(chartDom, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });
    const option = {
        tooltip: {
            formatter: '{a} <br/>{b} : {c}%'
        },
      series: [{
        type: 'gauge',
        progress: {
          show: true,
          width: 15
        },
        axisLine: {
          lineStyle: {
            width: 15
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          length: 5,
          lineStyle: {
            width: 2,
            color: '#999'
          }
        },
        axisLabel: {
          distance: 25,
          color: '#999',
          fontSize: 10
        },
        anchor: {
          show: true,
          showAbove: true,
          size: 25,
          itemStyle: {
            borderWidth: 10
          }
        },
        title: {
          show: false
        },
        detail: {
          valueAnimation: true,
          fontSize: 12,
          offsetCenter: ['10%', '70%']
        },
        data: [
          {
            value: score,
            name: 'SCORE'
          }
        ]
      }]
    }

    if (option && typeof option === 'object') {
        myChart.setOption(option);
    }
    return () => {
        window.removeEventListener('resize', myChart.resize);
        myChart.dispose();
    };
    }, [props.data])
    return <div ref={chartRef} style={{ width: width, height: height }}></div>;

}

export default InteractionChartGauge;