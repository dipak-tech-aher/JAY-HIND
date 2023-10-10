import React from 'react';
import ReactEcharts from 'echarts-for-react';

const HorizontalBarChart = (props) => {
  let chartData = props.data.chartData;
  const categories = chartData && chartData.length > 0 ? [...new Set(chartData.map(item => item.questionCategory))] : []
  // Prepare the series topChannels
  const seriesData = categories.map(channel => {
    const totalCount = chartData.reduce((acc, item) => {
      if (item.questionCategory === channel) {
        return acc + parseInt(Number(item.fensScore), 10);
      }
      return acc;
    }, 0);

    return {
      value: totalCount,
      name: channel
    };
  });

  const option = {
    title: {
      text: ''
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {},
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      boundaryGap: [0, 0.5],
      min: 0,
      max: 5
    },
    yAxis: {
      type: 'category',
      data: categories
    },
    series: [
      {
        name: 'Score',
        type: 'bar',
        data: seriesData,
        label: {
          show: true,
          position: 'insideRight' // Adjust the position of the label as needed
        }
      }
    ]
  };

  return (
    <>
      <ReactEcharts option={option} style={{ height: '400px', width:'100%' }} />
    </>
  );
};

export default HorizontalBarChart;
