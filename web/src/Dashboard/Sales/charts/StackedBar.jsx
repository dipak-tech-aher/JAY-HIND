import React, { useContext, useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { salesDashboardContext } from "../../../AppContext";

const StackedBar = (props) => {
  // const { chartData } = props?.data
  // const { fetchAndUpdateSalesData } = props?.handler

  const { width, height } = props?.chartStyle
  const { getter } = useContext(salesDashboardContext);
  const [seriesData, setSeriesData] = useState([])
  const [keys, setKeys] = useState([])

  const { conversionRate } = getter
  const chartRef = useRef(null)
  const myChart = useRef(null)

  useEffect(() => {
    const rate = [
      {
        name: 'Leads',
        type: 'bar',
        barWidth: 25,
        stack: 'Ad',
        emphasis: { focus: 'series' },
        data: conversionRate?.list?.map(element => element?.vCustLeadsPeriod || 0) || []
      },
      {
        name: 'Order',
        type: 'bar',
        barWidth: 25,
        stack: 'Ad',
        emphasis: { focus: 'series' },
        data: conversionRate?.list?.map(element => element?.vConvertedCust || 0) || []
      }
    ]
    const k = conversionRate?.list?.map(element => element?.vMonth?.trim() || '') || []
    setKeys(k)
    setSeriesData(rate);
  }, [conversionRate?.list])

  useEffect(() => {
    myChart.current = echarts.init(chartRef.current, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });

    const option = {
      title: {
        show: seriesData?.length === 0 ? true : false,
        textStyle: {
          color: "grey",
          fontSize: 20
        },
        text: "No data available",
        left: "center",
        top: "center"
      },
      // width,
      height,
      toolbox: {
        feature: {
          // dataZoom: {
          //     yAxisIndex: 'none'
          // },
          // restore: {},
          // magicType: { show: true, type: ['line', 'bar', 'stack'] },
          saveAsImage: { show: true },
          show: seriesData?.length === 0 ? false : true,
        }
      },
      // legend: {
      //   data: keys || []
      // },
      grid: {
        // top:    20,
        // bottom: 30,
        left: '20%',
        right: '5%',

      },
      xAxis: {
        type: 'category',
        data: keys || [],
        show: seriesData?.length === 0 ? false : true,
      },
      yAxis: {
        type: 'value',
        show: seriesData?.length === 0 ? false : true,
      },
      series: seriesData || []
    }

    if (option && typeof option === 'object') {
      myChart.current.setOption(option);
    }

    const cleanup = () => {
      myChart.current.dispose();
    }

    // window.addEventListener('resize', myChart.resize);

    // return () => {
    //     window.removeEventListener('resize', myChart.resize);
    //     myChart.dispose();
    // };
    return cleanup

  }, [seriesData])

  return <div ref={chartRef} style={{ width: '95%', height: '400px' }}></div>;

}

export default StackedBar