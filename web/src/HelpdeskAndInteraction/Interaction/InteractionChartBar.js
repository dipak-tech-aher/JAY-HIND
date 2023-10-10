import chroma from "chroma-js";
import * as echarts from "echarts";
import React, { useEffect, useRef } from "react";

const InteractionChartBar = (props) => {
  const chartRef = useRef(null);
  // const chartData = props?.data?.chartData || []
  const { chartData = [], popupOpen, popupType } = props?.data;
  const { setPopupOpen, setPopupType } = props?.handler;

  let seriesData = [];
  let xAxisData = [];
  if (chartData.length > 0) {
    xAxisData = chartData.map((e) => e.name);
    seriesData = chartData.map((e) => {
      return {
        value: e.value,
        itemStyle: {
          color: chroma.random().hex(),
        },
      };
    });
  }

  useEffect(() => {
    const chartDom = chartRef.current;
    const myChart = echarts.init(chartDom, null, {
      renderer: "canvas",
      useDirtyRect: false,
    });
    const option = {
      tooltip: {
        trigger: "axis",
      },
      calculable: true,
      xAxis: {
        type: "category",
        data: xAxisData,
        axisLabel: {
          interval: 0,
          rotate: 30,
          fontSize: 8,
        },
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          data: seriesData || [],
          type: "bar",
          label: {
            show: true,
          },
          // markPoint: {
          //   data: [
          //     { type: 'max', name: 'Max' },
          //     { type: 'min', name: 'Min' }
          //   ]
          // }
        },
      ],
    };

    if (option && typeof option === "object") {
      myChart.setOption(option);
    }
    myChart.on("click", (params) => {
      setPopupOpen(true);
      setPopupType(params.name);
    });

    window.addEventListener("resize", myChart.resize);

    return () => {
      window.removeEventListener("resize", myChart.resize);
      myChart.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chartData]);

  return <div ref={chartRef} style={{ width: "100%", height: "400px" }}></div>;
};

export default InteractionChartBar;
