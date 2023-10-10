

import React from 'react';
import ReactECharts from 'echarts-for-react';

const TotalChatBar = (props) => {
  const { totalChat } = props.data;

  const chartData = totalChat.map(item => ({
    name: item.be_desc,
    value: parseInt(item.count)
  }));

  const data = {
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

  return <ReactECharts option={data} style={{ height: '400px' }} />;
};

export default TotalChatBar;
