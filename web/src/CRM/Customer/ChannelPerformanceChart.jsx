import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import chroma from "chroma-js";
const ChannelPerformanceChart = (props) => {
  const chartRef = useRef(null);
  const [filteredType, setFilteredType] = useState('currStatusDesc')
  const [filteredValue, setFilteredValue] = useState('Status')
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
    const arr=[]
    
    const xAxisData = new Set()
    chartDataModified.map(x => xAxisData.add(x.channelDescription))
    const obj = {
      name: filteredValue
    }
    let data = [] 
    for (const y of Array.from(yAxisData)) {
      const child = {          
        name: y                 
      }
      let filteredData = [], childData=[]
      for (const x of Array.from(xAxisData)) {
        filteredData = chartDataModified.filter(ch => ch.channelDescription === x && ch[filteredType] === y) //console.log( ch.channleDescription.description , x , ch[filteredType] , y)
        
        childData.push({
          name: x === ''? 'Empty' : x, value: filteredData.length
        })
        
       
      }     
      child.children = childData
      child.itemStyle= {
        color: chroma.random().darken().hex()
      }
      data.push(child)      
    }
    obj.children = data

  seriesData.add(obj)
    // console.log('seriesData===>', Array.from(seriesData))
    // const seriesData=[
    //   {
    //       "name": "currStatusDesc",
    //       "children": [
    //           {
    //               "name": "New",
    //               "children": [
    //                   {
    //                       "name": "Empty",
    //                       "value": 10
    //                 },
    //                 {
    //                   "name": "IVR",
    //                   "value": 10
    //                 },
    //                 {
    //                   "name": "WEB",
    //                   "value": 0
    //               }
    //               ]
    //           },              
    //           {
    //               "name": "Assigned",
    //               "children": [
    //                   {
    //                       "name": "Empty",
    //                       "value": 1
    //                 },
    //                 {
    //                   "name": "IVR",
    //                   "value": 3
    //                 },
    //                 {
    //                   "name": "WEB",
    //                   "value": 0
    //                 }
    //               ]
    //           },              
    //           {
    //               "name": "Cancelled",
    //               "children": [
    //                   {
    //                       "name": "Empty",
    //                       "value": 0
    //                 },
    //                 {
    //                   "name": "IVR",
    //                   "value": 3
    //                 },
    //                 {
    //                   "name": "WEB",
    //                   "value": 2
    //               }
    //               ]
    //           },              
    //           {
    //               "name": "Closed",
    //               "children": [
    //                   {
    //                       "name": "Empty",
    //                       "value": 0
    //                 },
    //                 {
    //                   "name": "IVR",
    //                   "value": 3
    //                 },
    //                 {
    //                   "name": "WEB",
    //                   "value": 0
    //               }
    //               ]
    //           }
    //       ]
    //   }
    // ]
 
  const getLevelOption = ()=> {
      return [
        {
          itemStyle: {
            borderColor: '#777',
            borderWidth: 0,
            gapWidth: 1
          },
          upperLabel: {
            show: false
          }
        },
        {
          itemStyle: {
            borderColor: '#555',
            borderWidth: 5,
            gapWidth: 1
          },
          emphasis: {
            itemStyle: {
              borderColor: '#ddd'
            }
          }
        },
        {
          colorSaturation: [0.35, 0.5],
          itemStyle: {
            borderWidth: 5,
            gapWidth: 1,
            borderColorSaturation: 0.6
          }
        }
      ];
    }
  const option = {
    height: "400px",
    title: {
    },
    tooltip: {    
    },
    label:{
      position: 'insideTopLeft',
      formatter: function (params) {
          // console.log('params ',params)
          let arr = [
            params.name, params.value                                   
          ];                               
          return arr.join(' ');
      }
    },
    series: [
      {
        name: '',
        type: 'treemap',
        visibleMin: 300,
        label: {
          show: true,         
          // formatter: '{b}'
        },
      //   labelLayout: function (params) {
      //     if (params.rect.width < 5 || params.rect.height < 5) {
      //         return {  fontSize: 0  };
      //     }
      //     return {
      //         fontSize: Math.min(Math.sqrt(params.rect.width * params.rect.height) / 10, 20)
      //     };
      //   },
        upperLabel: {
          show: true,
          height: 30      
        },
        itemStyle: {
          borderColor: '#fff'
        },
        levels: getLevelOption(),
        data: Array.from(seriesData)
      }
    ]
    };
    
    const chartDom = chartRef.current;
    const myChart = echarts.init(chartDom, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });
  

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
          <select value={filteredType} onChange={(e) => {
            // console.log(e.target.options[e.target.selectedIndex].label)
            setFilteredType(e.target.value);
            setFilteredValue(e.target.options[e.target.selectedIndex].label)
          }}>
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

export default ChannelPerformanceChart;