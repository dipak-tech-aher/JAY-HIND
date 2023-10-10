import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

const ChannelActivityChart = (props) => {
  const chartRef = useRef(null);
  const [filteredType, setFilteredType] = useState('tranTypeDesc')
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
  
  const removeDuplicates = (arr) => {
      const valuesSoFar = Object.create(null);
      let currentObject;
      const list = [];
      for (let i = 0; i < arr.length; ++i) {
        currentObject = arr[i];
        const objectKey = JSON.stringify(currentObject);
        if (!valuesSoFar[objectKey]) {
          list.push(currentObject);
        }
        valuesSoFar[objectKey] = true;
      }
    
      // console.log("list", list);
      return list;
  };
  
  useEffect(() => {
   
    const chartDataModified = chartData.map(x => ({
      ...x, tranTypeDesc: x.srType?.description ? x.srType?.description : x.orderTypeDesc?.description || '', tranCategoryDesc: x.intxnCategoryDesc?.description || ''
      ,categoryDescription: x.categoryDescription?.description || '', serviceTypeDesc: x.serviceTypeDesc?.description || ''
      , currStatusDesc: x.currStatusDesc?.description ? x.currStatusDesc?.description : x.orderStatusDesc?.description || '', priorityDesc: x.priorityDescription?.description || ''
      ,channelDescription: x.channleDescription?.description? x.channleDescription?.description : x.orderChannelDesc?.description || ''
    }))
     
    let yAxisData, groupBymode
    
    groupBymode = groupBy(chartDataModified, filteredType)
    
    // console.log(groupBymode)

    yAxisData = Object.keys(groupBymode);

    // console.log(yAxisData)
    
    
    //const yAxisData = [];
    const seriesData = [];   
    const xAxisData = new Set()
    chartDataModified.map(x => xAxisData.add(x.channelDescription))
    let totData, totArr = []
    
    for (const y of Array.from(xAxisData)) {
      let data = [] 
      let filteredData = [] 
      for (const x of Array.from(yAxisData)) {
        filteredData = chartDataModified.filter(ch => ch.channelDescription === y && ch[filteredType] === x)
      // console.log('filteredData====>', filteredData)
        
        data.push({ name: x, value: filteredData.length })
      }
      // console.log('data  ', data)      
      const sumByCategory = data.reduce((acc, obj) => {
        if (acc[obj.name]) {
          acc[obj.name] += obj.value;
        } else {
          acc[obj.name] = obj.value;
        }
        return acc;
      }, {});
      const catKeys = Object.keys(sumByCategory)
      for (const key of catKeys) {
        // console.log('sumByCategory[key] ', sumByCategory[key])
        totData = {
          channel: y === '' ? 'Invalid' : y,
          name: key,
          value: sumByCategory[key]
        }
        totArr.push(totData) 
      }      
    }
    
    // console.log('totArr===>', totArr)
    const finalArr=[]
    for (const d of totArr) {
      const obj = {
        val: 0
      }
      if (['Interest', 'Purchase'].includes(d.name)) {
        obj.val = obj.val + d.value
        obj.name = 'Sales'
        obj.channel = d.channel  
      }
      if (['Appeals', 'Grievance'].includes(d.name)) {
        obj.val= obj.val + d.value
        obj.name= 'Disinterest'
        obj.channel = d.channel 
      }
      if (['General'].includes(d.name)) {
        obj.val= obj.val + d.value
        obj.name= 'Neutral'
        obj.channel = d.channel  
      }
      if (['Suggestion','Feedback','Recommendation'].includes(d.name)) {
        obj.val= obj.val + d.value
        obj.name= 'Feedback'
        obj.channel = d.channel  
      }
      if (['Request'].includes(d.name)) {
        obj.val= obj.val + d.value
        obj.name= 'Request'
        obj.channel = d.channel
      }
      finalArr.push(obj)
    }
    // console.log(finalArr)

    for (const f of finalArr) {
      const obj = {
        channel: f.channel,
        name: f.name,
        value: Math.round((f.val / chartDataModified.length) * 100,0)
      }  
      seriesData.push(obj)
    }
  
    const legend = Object.keys(groupBy(seriesData, 'name'));
  //  console.log('seriesData ', seriesData)
    let finalSeriesData = []
    
    for (const d of seriesData) {
      let data = []    
      for (const x of Array.from(xAxisData)) {
        let val=0
        seriesData.filter(ch => {
          // console.log(ch)
          if (ch.name === d.name && ch.channel === (x === '' ? 'Invalid' : x)) {
            // console.log(ch.value)
            val += Number(ch.value)
          }
        })
        
        data.push(val)
      }
      // console.log('data====>', data)

      const obj = {
        barMaxWidth: 100,
        name: d.name,
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
      finalSeriesData.push(obj);
    }
    finalSeriesData = removeDuplicates(finalSeriesData)
    // console.log('finalSeriesData ', finalSeriesData)
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
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      // toolbox: {
      //   show: true,
      //   orient: 'vertical',
      //   left: 'right',
      //   top: 'center',
      //   feature: {
      //     mark: { show: true },
      //     dataView: { show: true, readOnly: false },
      //     magicType: { show: true, type: ['line', 'bar', 'stack'] },
      //     restore: { show: true },
      //     saveAsImage: { show: true }
      //   }
      // },
      xAxis: 
        {
          type: 'value',
        //   axisTick: { show: false },
        //   data: Array.from(xAxisData),
        //   axisLabel: {
        //     interval: 0,
        //     rotate: 30 
        //   }
        }
      ,
      yAxis: [
        {
          type: 'category',
          data: Array.from(xAxisData),
        }
      ],
      series: finalSeriesData
    };

    if (option && typeof option === 'object') {
      myChart.setOption(option);
    }

    window.addEventListener('resize', myChart.resize);

    return () => {
      window.removeEventListener('resize', myChart.resize);
      myChart.dispose();
    };
  }, [chartData]);

  return (
    <>
      {/* <div className='col-md-4' style={{float: 'right', position: 'relative', display: 'inline-block',  top: '-2em'}}>
        <div className="form-group" style={{zIndex: '1', position: 'absolute'}}>
          <select value={filteredType} onChange={(e) => { setFilteredType(e.target.value) }}>
            {
              entityTypes.map(k => (
                <option value={k.value}>{ k.label }</option>
              ))
            }
        </select>
        </div>
      </div> */}
    <div ref={chartRef} style={{ width: '100%', height: '350px' }}></div>
    </>)
    ;
};

export default ChannelActivityChart;