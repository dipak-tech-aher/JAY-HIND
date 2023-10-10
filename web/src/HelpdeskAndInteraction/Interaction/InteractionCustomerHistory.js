import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';


const InteractionCustomerHistory = (props) => {
  const chartRef = useRef(null)
  // const chartData = props?.data?.chartData

  const {isCustomerActivityOpen, chartData = []} = props?.data
  const { setIsCustomerActivityOpen} = props?.handler

  let seriesData = []
  let xAxisData = []
  if (chartData.length > 0) {
    xAxisData = chartData.map((e) => e.name);
    seriesData = chartData.map((e) => {
      return {
        value: e.value,
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
      xAxis: {
        type: 'category',
        boundaryGap: false,
        show: chartData.length === 0 ? false : true,
        data: xAxisData || []
        // data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      tooltip: {
        trigger: 'axis'
      },
      yAxis: {
        type: 'value',
        interval: 20
      },
      label:{
        show: true
      },
      series: [
        {
          // data: [820, 932, 901, 934, 1290, 1330, 1320],
          data: seriesData,
          // showSymbol: false,
          barWidth: '20%',
          type: 'bar',
          smooth: true,
          label: {
            show: true,
            position: 'top'
          }
        }
      ]
    };

    if (option && typeof option === 'object') {
      myChart.setOption(option);
    }

    myChart.getZr().on('click', (params)=>{
      setIsCustomerActivityOpen(true)
    })

    window.addEventListener('resize', myChart.resize);

    return () => {
      window.removeEventListener('resize', myChart.resize);
      myChart.dispose();
    };
  }, [chartData]);

  return <div ref={chartRef} style={{ width: '100%', height: '300px' }}></div>;
};

export default InteractionCustomerHistory;