import chroma from "chroma-js";
import * as echarts from 'echarts';
import React, { useEffect, useRef } from 'react';

const InteractionChannelActivity = (props) => {
  const chartRef = useRef(null);
  // const chartData = props?.data?.chartData || []
  const { chartData = []} = props?.data
  const { setIsChannelActivityOpen, setChannelActivityType} = props?.handler

  let seriesData = []
  let xAxisData = []
  if (chartData.length > 0) {
    xAxisData = chartData.map((e) => e.name);
    seriesData = chartData.map((e) => {
      return {
        value: e.value,
        itemStyle: {
          color: chroma.random().hex()
        }
      }
    })
  }

  useEffect(() => {
    const chartDom = chartRef.current;
    const myChart = echarts.init(chartDom, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });
    const option = {
      title: {
        show: chartData.length === 0 ? true : false,
        textStyle: {
          color: "grey",
          fontSize: 20
        },
        text: "No data available",
        left: "center",
        top: "center"
      },
      tooltip: {
        trigger: 'axis'
      },
      calculable: true,
      xAxis: {
        show: chartData.length === 0 ? false : true,
        type: 'category',
        data: xAxisData,
         axisLabel: {
            interval: 0,
            rotate: 30 
          }
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: seriesData || [],
          type: 'bar',
          barWidth: '20%',
          label:{
            show: true
          }
          // markPoint: {
          //   data: [
          //     { type: 'max', name: 'Max' },
          //     { type: 'min', name: 'Min' }
          //   ]
          // }
        }
      ]
    };

    if (option && typeof option === 'object') {
      myChart.setOption(option);

    }
    myChart.on('click', (params)=>{
      setIsChannelActivityOpen(true)
      setChannelActivityType(params.name)
    })
  
    window.addEventListener('resize', myChart.resize);

    return () => {
      window.removeEventListener('resize', myChart.resize);
      myChart.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData]);

  return (<div ref={chartRef} style={{ width: '100%', height: '270px' }}></div>);
};

export default InteractionChannelActivity;