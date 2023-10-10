
import React from 'react';
import ReactEcharts from 'echarts-for-react';

const averageHandlingPie = (props) => {
  const { averageHandling } = props.data;

  const seriesData = [];
  const legendData = [];

  // Prepare series data and legend data
  for (const item of averageHandling) {
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
      formatter: function(params) {
        return `${params.data[1]}<br/> Average Handling Time: ${params.data[0]}`;
      }
    },
    dataset: {
      source: [
        ['avg handling time', 'source', 'chat count'],
        ...seriesData.map(item => [item.o_avg_handling_time, item.name, item.value])
      ]
    },
    xAxis: { type: 'category' },
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
  
  
  // const data = {
  //   labels: averageHandling.map(x => x?.o_chat_source),
  //   datasets: [
  //     {
  //       label: 'Interaction',
  //       data: averageHandling.map(x => x?.o_chat_cnt),
  //       backgroundColor: [
  //         'rgba(54, 162, 235, 0.2)',
  //         'rgb(255, 160, 122)'
  //       ],
  //       borderColor: [
  //         'rgba(54, 162, 235, 1)',
  //         'rgb(255, 160, 122)'
  //       ],
  //       borderWidth: 1,
  //       width: 40
  //     },
  //   ],
  // };

  // const options = {
  //   type: 'pie',
  //   data: data,
  //   plugins: {
  //     tooltip: {
  //       callbacks: {
  //         label: function(context) {
  //           const label = context.label;
  //           const chatCount = context.parsed.y;
  //           const avgHandlingTime = averageHandling[context.dataIndex]?.o_avg_handling_time;

  //           return `Avg Handling Time: ${avgHandlingTime}`;
  //         }
  //       }
  //     }
  //   }
  // };



  return (<>
    <ReactEcharts option={option} style={{ height: '430px', width: '100%' }} />
    {/* <Pie data={data} options={options} /> */}
  </>)
};

export default averageHandlingPie;



