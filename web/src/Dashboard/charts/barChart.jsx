import React, { useEffect } from "react";
import ReactEcharts from 'echarts-for-react';


const VerticalBar = (props) => {
  let { topChannels } = props.data;
  console.log('topChannels--------->', topChannels)
  // Extract unique channel descriptions
  const channelDescriptions = [...new Set(topChannels.map(item => item.channel_desc))];

  // Prepare the series topChannels
  const seriesData = channelDescriptions.map(channel => {
    const totalCount = topChannels.reduce((acc, item) => {
      if (item.channel_desc === channel) {
        return acc + parseInt(item.total_cnt, 10);
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
      boundaryGap: [0, 0.01]
    },
    yAxis: {
      type: 'category',
      data: channelDescriptions
    },
    series: [
      {
        name: 'Total Orders',
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
      <ReactEcharts option={option} style={{ height: '400px' }}/>
    </>
  );
};

export default VerticalBar;