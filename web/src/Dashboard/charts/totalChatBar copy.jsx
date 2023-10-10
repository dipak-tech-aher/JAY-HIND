import React from 'react';
import ReactECharts from 'echarts-for-react';

// import { Bar } from 'react-chartjs-2';
// import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { useState } from "react";

// ChartJS.register(BarElement,
//   CategoryScale, LinearScale
// )

const totalChatBar = (props) => {
  const { totalChat } = props.data;
  console.log('totalChat---------->', totalChat)
  // const data = {
  //   labels: totalChat.map(x => x.be_desc),

  //   datasets: [
  //     {
  //       label: 'Chat',
  //       data: totalChat.map(x => x.count),
  //       backgroundColor: [
  //         'rgba(54, 162, 235, 0.2)'
  //       ],
  //       borderColor: [
  //         'rgba(54, 162, 235, 1)'
  //       ],
  //       borderWidth: 1,
  //       barPercentage: 0.4, // Adjust the value as per your preference
  //       categoryPercentage: 0.5,
  //     },
  //   ],
  // };

  // const options = {
  //   scales: {
  //     yAxes: [
  //       {
  //         ticks: {
  //           beginAtZero: true,

  //         },
  //         stroke: {
  //           show: true,
  //           width: 1,
  //           colors: ['#fff']
  //         },
  //       },
  //     ],
  //   },
  // };

  const sourceData = totalChat.reduce((result, chat) => {
    const { chat_source, created_at, count } = chat;
    const date = new Date(created_at).toISOString().split('T')[0];

    if (!result[date]) {
      result[date] = { date };
    }

    result[date][chat_source] = parseInt(count);

    return result;
  }, {});

  const chartData = Object.values(sourceData).map((data) => Object.values(data));
  const chatSources = Array.from(new Set(totalChat.map((chat) => chat.chat_source)));

  const option = {
    legend: {},
    tooltip: {},
    dataset: {
      source: [['date', ...chatSources], ...chartData]
    },
    xAxis: {
      type: 'category',
      axisLabel: {
        interval: 0 // Display all labels on the x-axis
      }
    },
    yAxis: {},
    series: chatSources.map(() => ({ type: 'bar' }))
  };


  return (<>
    {/* <Bar data={data} options={options} /> */}
    <ReactECharts option={option} style={{ height: '400px' }} />
  </>)
};

export default totalChatBar;