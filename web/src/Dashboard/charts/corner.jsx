import React from 'react';
import ReactECharts from 'echarts-for-react';

const Corner = (props) => {
  const { corner } = props.data;

  const countByEntityType = {};

  corner?.forEach(entity => {
    const entityType = entity.entity_type;
    if (countByEntityType.hasOwnProperty(entityType)) {
      countByEntityType[entityType]++;
    } else {
      countByEntityType[entityType] = 1;
    }
  });

  const output = Object.keys(countByEntityType).map(key => {
    return {
      count: countByEntityType[key].toString(),
      type: key
    };
  });

  const data = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c}',
    },
    xAxis: {
      type: 'category',
      data: output.map(x => x?.type),
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        label: {
          show: true,
          position: 'inside',
        },
        name: 'Interaction',
        type: 'bar',
        data: output.map(x => x?.count),
        itemStyle: {
          color: 'rgb(84, 112, 198)',
        },
        barWidth: '20%',
      },
    ],
  };

  return (
    <>
      <ReactECharts option={data} style={{ height: '400px' }} />
    </>
  );
};

export default Corner;
