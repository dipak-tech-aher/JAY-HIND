import React from 'react';
import ReactECharts from 'echarts-for-react';

const AbandonedBar = (props) => {
  const { abandonedChat } = props.data;

  const chartData = abandonedChat.map(item => ({
    name: item.channel,
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


  // const data = {
  //   tooltip: {
  //     trigger: 'axis',
  //     formatter: '{b}: {c}',
  //   },
  //   xAxis: {
  //     type: 'category',
  //     data: abandonedChat.map(x => x.channel),
  //     axisLabel: {
  //       interval: 0,
  //       rotate: 45,
  //     },
  //   },
  //   yAxis: {
  //     type: 'value',
  //     axisLine: {
  //       show: true,
  //       lineStyle: {
  //         color: '#fff'
  //       }
  //     },
  //     axisTick: {
  //       show: false
  //     },
  //   },
  //   series: [
  //     {
  //       type: 'bar',
  //       data: abandonedChat.map(x => x.count),
  //       itemStyle: {
  //         color: 'rgb(84, 112, 198)'
  //       },
  //       barWidth: '20%', // Adjust the value as per your preference
  //       label: {
  //         show: true,
  //         position: 'inside', // Adjust the position of the label as needed
  //       },
  //     },
  //   ],
  // };

  return <ReactECharts option={data} style={{ height: '400px' }} />;


  // return (
  //   <ReactEcharts
  //     option={chartData}
  //     opts={{ renderer: 'svg' }}
  //     style={{ height: '400px' }} // Adjust the height as per your preference
  //   />
  // );
};

export default AbandonedBar;
