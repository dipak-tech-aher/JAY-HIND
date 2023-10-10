import chroma from "chroma-js";
import * as echarts from 'echarts';
import React, { useEffect, useRef } from 'react';
import {isEmpty} from 'lodash'

const InteractionChartBarStacked = (props) => {
  const chartRef = useRef(null);
  // const chartData = props?.data?.chartData || []
  const { chartData = []} = props?.data
  const { setIsChannelActivityOpen, setChannelActivityType} = props?.handler

  let seriesData = []
  let xAxisData = []
  let yAxisData = []

  if (chartData.length > 0) {
    xAxisData = chartData.map((e) => e.name);  

    // console.log('chartData ', chartData[0])
    yAxisData=(Object.keys(chartData[0].category))

  }

  // console.log('yAxisData ', yAxisData)
  

  for (const y of yAxisData) {
    let data = []
    for (const x of xAxisData) {
     chartData.filter(ch => {
        if(ch.name === x){
           data.push(ch.category[y])
          } 
        })
    }
    // console.log(data)
    const obj = {
      barMaxWidth: 100,
      name: y,
      type: 'bar',
      barGap: 0,
      label: {
        show: true
      },
      emphasis: {
        focus: 'series'
      },
      data: data
    }
    seriesData.push(obj);
 }

  useEffect(() => {
    const chartDom = chartRef.current;
    const myChart = echarts.init(chartDom, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });
    const option = {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: yAxisData
      },
      toolbox: {
        show: isEmpty(seriesData) ? false : true,
        orient: 'vertical',
        left: 'right',
        top: 'center',
        feature: {
          mark: { show: true },
          // dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar', 'stack'] },
          // restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      calculable: true,
      xAxis: {
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
      series: seriesData || [],
    };

    if (option && typeof option === 'object') {
      myChart.setOption(option);

    }
    // myChart.on('click', (params)=>{
    //   setIsChannelActivityOpen(true)
    //   setChannelActivityType(params.name)
    // })
  
    window.addEventListener('resize', myChart.resize);

    return () => {
      window.removeEventListener('resize', myChart.resize);
      myChart.dispose();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData]);

  return (<div ref={chartRef} style={{ width: '100%', height: '270px' }}></div>);
};

export default InteractionChartBarStacked;