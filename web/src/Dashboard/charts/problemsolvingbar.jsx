import React from 'react';
import ReactEcharts from 'echarts-for-react';

const ProblemsolvingBar = (props) => {
  const { topProblem } = props.data;
  console.log('topProblem----->', topProblem);
  const chartData = topProblem.map(item => ({
    name: item.channel,
    value: parseInt(item.count)
  }));

  const options = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}',
    },
    xAxis: {
      type: 'category',
      data: chartData.map(item => item.name),
      axisLabel: {
        interval: 0,
        rotate: 25,
      },
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: chartData.map(item => item.value),
        type: 'bar',
        label: {
          show: true,
          position: 'inside',
        },
      }
    ]
  };

  return <ReactEcharts option={options} style={{ height: '400px' }} />;
};

export default ProblemsolvingBar;
