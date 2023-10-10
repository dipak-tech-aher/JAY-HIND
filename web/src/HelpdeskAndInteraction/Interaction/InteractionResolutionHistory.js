import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import chroma from "chroma-js";

const InteractionResolutionHistory = (props) => {
  const chartRef = useRef(null);
  // const chartData = props?.data?.chartData || []
  // const roseType = props?.data?.roseType

  const {isSoluationActivityOpen, chartData = [], roseType} = props?.data
  const { setIsSoluationActivityOpen } = props?.handler
  
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
    // const option = {
    //   tooltip: {
    //     trigger: 'item'
    //   },
    //   toolbox: {
    //     show: false,
    //     feature: {
    //       saveAsImage: { show: true },
    //     }
    //   },
    //   legend: {
    //     top: 'bottom',
    //     show: false
    //   },
    //   series: [
    //     {
    //       type: 'pie',
    //       radius: ['40%', '70%'],
    //       avoidLabelOverlap: false,
    //       roseType: roseType,
    //       emphasis: {
    //         label: {
    //           show: true,
    //           fontSize: 10,
    //           fontWeight: 'bold'
    //         }
    //       },
    //       label: {
    //         show: true
    //       },
    //       labelLine: {
    //         show: true,
    //         length:10
    //       },
    //       data: chartData?.length > 0 ? chartData : []
    //       // data: [
    //       //   { value: 1048, name: 'Search Engine' },
    //       //   { value: 735, name: 'Direct' },
    //       //   { value: 580, name: 'Email' },
    //       //   { value: 484, name: 'Union Ads' },
    //       //   { value: 300, name: 'Video Ads' }
    //       // ]
    //     }
    //   ]
    // };
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
      setIsSoluationActivityOpen(true)
    })

    window.addEventListener('resize', myChart.resize);

    return () => {
      window.removeEventListener('resize', myChart.resize);
      myChart.dispose();
    };
  }, [chartData]);

  return <div ref={chartRef} style={{ width: '100%', height: '300px' }}></div>;
};

export default InteractionResolutionHistory;