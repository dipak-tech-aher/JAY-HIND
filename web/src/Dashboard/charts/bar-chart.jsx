import React from 'react';
import ReactEcharts from 'echarts-for-react';
import * as echarts from 'echarts';

const Vertical = (props) => {
  const {  category } = props.data;

  const data = {
    labels: category.map(x => x.category),
    datasets: [
      {
        name: 'Interaction',
        type: 'bar',
        data: category.map(x => x.count),
        itemStyle: {
          color: 'rgb(84,112,198)',
        },
        label: {
          show: true,
          position: 'inside',
        },
        barWidth: '20%',
      },
    ],
  };

  const option = {
    tooltip: {
      trigger: 'axis',
    },
    xAxis: {
      type: 'category',
      data: data.labels,
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}',
      },
    },
    series: data.datasets,
  };

  return (
    <ReactEcharts option={option} echarts={echarts} style={{ height: '400px' }} />
  );
};

export default Vertical;
