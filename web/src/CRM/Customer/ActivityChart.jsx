import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

const ActivityChart = (props) => {
  const chartRef = useRef(null);
  const [filteredType, setFilteredType] = useState('currStatusDesc')
  const groupBy = (items, key) => items.reduce(
    (result, item) => ({
      ...result,
      [item[key]]: [
        ...(result[item[key]] || []),
        item,
      ],
    }),
    {},
  );

  const chartData = props?.data?.chartData || []

  // console.log('chartData====', chartData)
const entityTypes = [{
    label: "Status",
    value: "currStatusDesc"
}, {
    label: "Service Category",
    value: "categoryDescription"
}, {
    label: 'Interaction/Order Category',
    value: "tranCategoryDesc"
}, {
    label: 'Interaction/Order Type',
    value: "tranTypeDesc"
}, {
    label: 'Service Type',
    value: 'serviceTypeDesc'
}, {
    label: 'Priority',
    value: 'priorityDesc'
    }]
  
  useEffect(() => {
   
    const chartDataModified = chartData.map(x => ({
      ...x, tranTypeDesc: x.srType?.description ? x.srType?.description : x.orderTypeDesc?.description || '', tranCategoryDesc: x.intxnCategoryDesc?.description || ''
      ,categoryDescription: x.categoryDescription?.description || '', serviceTypeDesc: x.serviceTypeDesc?.description || ''
      , currStatusDesc: x.currStatusDesc?.description ? x.currStatusDesc?.description : x.orderStatusDesc?.description || '', priorityDesc: x.priorityDescription?.description || ''
      ,channelDescription: x.channleDescription?.description? x.channleDescription?.description : x.orderChannelDesc?.description || ''
    }))
     
    let yAxisData, groupBymode
    
    groupBymode= groupBy(chartDataModified, filteredType)
    yAxisData = Object.keys(groupBymode);

    // console.log(yAxisData)
    
    const legend = yAxisData;
    //const yAxisData = [];
    const seriesData = new Set();
    
    
    const xAxisData = new Set()
    chartDataModified.map(x => xAxisData.add(x.channelDescription))

    for (const y of Array.from(yAxisData)) {
      let data = [] 
      let filteredData = [] 
      for (const x of Array.from(xAxisData)) {
        filteredData = chartDataModified.filter(ch => ch.channelDescription === x && ch[filteredType] === y) //console.log( ch.channleDescription.description , x , ch[filteredType] , y)
      // console.log('filteredData====>', filteredData)
        
       data.push(filteredData.length === 0 ? '' : filteredData.length)
      }     
      const obj = {
        barMaxWidth: 100,
        name: y,
        type: 'bar',
        barGap: 0,
        label: {
          show: true
        },
        emphasis: {
          focus: 'series'
        },
        data: data
      }
      seriesData.add(obj);
   }
    // console.log('seriesData===>', seriesData)

    const chartDom = chartRef.current;
    const myChart = echarts.init(chartDom, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: legend
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        left: 'right',
        top: 'center',
        feature: {
          mark: { show: true },
          dataView: { show: true, readOnly: false },
          magicType: { show: true, type: ['line', 'bar', 'stack'] },
          restore: { show: true },
          saveAsImage: { show: true }
        }
      },
      xAxis: [
        {
          type: 'category',
          axisTick: { show: false },
          data: Array.from(xAxisData),
          axisLabel: {
            interval: 0,
            rotate: 30 
          }
        }
      ],
      yAxis: [
        {
          type: 'value'
        }
      ],
      series: Array.from(seriesData)
    };

    if (option && typeof option === 'object') {
      myChart.setOption(option);
    }

    window.addEventListener('resize', myChart.resize);

    return () => {
      window.removeEventListener('resize', myChart.resize);
      myChart.dispose();
    };
  }, [chartData, filteredType]);

  return (
    <>
      <div className='col-md-4' style={{float: 'right', position: 'relative', display: 'inline-block',  top: '-2em'}}>
        <div className="form-group" style={{zIndex: '1', position: 'absolute'}}>
          <select value={filteredType} onChange={(e) => { setFilteredType(e.target.value) }}>
            {
              entityTypes.map(k => (
                <option value={k.value}>{ k.label }</option>
              ))
            }
        </select>
        </div>
      </div>
    <div ref={chartRef} style={{ width: '100%', height: '350px' }}></div>
    </>)
    ;
};

export default ActivityChart;