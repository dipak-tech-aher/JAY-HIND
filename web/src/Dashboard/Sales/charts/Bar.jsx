import React, { useContext, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { salesDashboardContext } from "../../../AppContext";

const Bar = (props) => {
  const { width, height } = props?.chartStyle
  const { getter } = useContext(salesDashboardContext);

  const { annualContractValue } = getter

  const chartRef = useRef(null)
  const myChart = useRef(null)

  useEffect(() => {
    console.log("annualContractValue from bar comp ==> ", annualContractValue)

    myChart.current = echarts.init(chartRef.current, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });

    const option = {
      title: {
        show: annualContractValue?.list?.length === 0 ? true : false,
        textStyle: {
          color: "grey",
          fontSize: 20
        },
        text: "No data available",
        left: "center",
        top: "center"
      },
      height,
      toolbox: {
        feature: {
          saveAsImage: { show: true },
          show: annualContractValue?.list?.length === 0 ? false : true,
        }
      },
      grid: {
        left: '20%',
        right: '5%'
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: (params) => {
          console.log(params);
          return `${params[0]?.axisValueLabel} - $${params[0]?.value}`;
        },
      },
      xAxis: {
        type: 'category',
        data: annualContractValue?.list?.map(x => x.vMonth),
        show: annualContractValue?.list?.length === 0 ? false : true,
      },
      yAxis: {
        type: 'value',
        show: annualContractValue?.list?.length === 0 ? false : true,
      },
      series: [
        {
          data: annualContractValue?.list?.map(x => x.vAvgAcv) || [],
          type: 'bar',
          barWidth: 20,
          showBackground: true,
          backgroundStyle: {
            color: 'rgba(180, 180, 180, 0.2)'
          }
        }
      ]
    }

    if (option && typeof option === 'object') {
      myChart.current.setOption(option);
    }

    const cleanup = () => {
      myChart.current.dispose();
    }

    return cleanup

  }, [annualContractValue])

  return <div ref={chartRef} style={{ width: '95%', height: '400px' }}></div>;

}

export default Bar