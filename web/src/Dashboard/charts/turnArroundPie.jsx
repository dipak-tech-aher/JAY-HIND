
import React from 'react';
import ReactEcharts from 'echarts-for-react';

const turnArroundPie = (props) => {
  const { turnArround } = props.data;

  const seriesData = [];
  const legendData = [];

  // Prepare series data and legend data
  for (const item of turnArround) {
    seriesData.push({
      name: item.o_chat_source,
      value: item.o_chat_cnt,
      o_avg_handling_time: item.o_avg_handling_time
    });
    legendData.push(item.o_chat_source);
  }

  const option = {
    legend: {},
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        return `${params.data[1]}<br/> Turn Arround Time: ${params.data[0]}`;
      }
    },
    dataset: {
      source: [
        ['avg handling time', 'source', 'chat count'],
        ...seriesData.map(item => [item.o_avg_handling_time, item.name, item.value])
      ]
    },
    xAxis: { type: 'category', axisLabel: {
      interval: 0, // Display all x-axis labels
      rotate: 50 // Rotate x-axis labels for better readability
  } },
    yAxis: { gridIndex: 0 },
    grid: { top: '80%', bottom: '50%', left: '50%', right: '50%' },
    series: [
      {
        type: 'pie',
        id: 'pie',
        radius: '60%',
        center: ['50%', '50%'],
        emphasis: {
          focus: 'self'
        },
        label: {
          formatter: '{b}'
        },
        encode: {
          itemName: 'source',
          value: 'chat count',
          tooltip: 'avg handling time'  // Display o_avg_handling_time on hover
        }
      }
    ]
  };

  return (<>
    <ReactEcharts option={option} style={{ height: '430px', width: '100%' }} />
  </>)
};

export default turnArroundPie;



