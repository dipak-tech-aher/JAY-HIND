import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { statusConstantCode } from '../../AppConstants.js'

const NegativeScatterChart = (props) => {
  const chartRef = useRef(null);
  const [emojiList, setEmojiList] = useState([])
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

  const chartDatas = props?.data?.chartData || []
  // console.log('chartData=========================', chartData)
  useEffect(() => {
    const chartData = chartDatas.filter((f) => statusConstantCode.negativeIntxnTypes.includes(f.type)) || []
    const groupByStatement = groupBy(chartData, 'statement')
    // console.log(groupByStatement)
    const statementKeys = Object.keys(groupByStatement)
    const data2 = [], finalData = []
    if (chartData.length > 0) {
      for (const statement of statementKeys) {
        //for(let i = 0; i < 10; i++){
        // console.log(groupByStatement[statement])
        data2.push([groupByStatement[statement][0].percentage, groupByStatement[statement].length, Number(groupByStatement[statement][0].percentage * 100), statement])
        //}
      }

      finalData.push(data2)
      // console.log('finalData ', finalData)
      // const data = [
      //   [ [28604, 77, 100, 'Australia'], 
      //     [31163, 77.4, 100, 'Canada'], 
      //     [1516, 68, 100, 'China'], 
      //     [13670, 74.7, 100, 'Cuba']], 
      //     // [28599, 75, 4986705, 'Finland', 1990], 
      //     // [29476, 77.1, 56943299, 'France', 1990], 
      //     // [31476, 75.4, 78958237, 'Germany', 1990], 
      //     // [28666, 78.1, 254830, 'Iceland', 1990], 
      //     // [1777, 57.7, 870601776, 'India', 1990], 
      //     // [29550, 79.1, 122249285, 'Japan', 1990], 
      //     // [2076, 67.9, 20194354, 'North Korea', 1990], 
      //     // [12087, 72, 42972254, 'South Korea', 1990], 
      //     // [24021, 75.4, 3397534, 'New Zealand', 1990], 
      //     // [43296, 76.8, 4240375, 'Norway', 1990], 
      //     // [10088, 70.8, 38195258, 'Poland', 1990], [19349, 69.6, 147568552, 'Russia', 1990], [10670, 67.3, 53994605, 'Turkey', 1990], [26424, 75.7, 57110117, 'United Kingdom', 1990], [37062, 75.4, 252847810, 'United States', 1990]],
      //   // [[44056, 81.8, 23968973, 'Australia', 2015], [43294, 81.7, 35939927, 'Canada', 2015], [13334, 76.9, 1376048943, 'China', 2015], [21291, 78.5, 11389562, 'Cuba', 2015], [38923, 80.8, 5503457, 'Finland', 2015], [37599, 81.9, 64395345, 'France', 2015], [44053, 81.1, 80688545, 'Germany', 2015], [42182, 82.8, 329425, 'Iceland', 2015], [5903, 66.8, 1311050527, 'India', 2015], [36162, 83.5, 126573481, 'Japan', 2015], [1390, 71.4, 25155317, 'North Korea', 2015], [34644, 80.7, 50293439, 'South Korea', 2015], [34186, 80.6, 4528526, 'New Zealand', 2015], [64304, 81.6, 5210967, 'Norway', 2015], [24787, 77.3, 38611794, 'Poland', 2015], [23038, 73.13, 143456918, 'Russia', 2015], [19360, 76.5, 78665830, 'Turkey', 2015], [38225, 81.4, 64715810, 'United Kingdom', 2015], [53354, 79.1, 321773631, 'United States', 2015]]
      // ];
      // console.log('data ',data)
    }

    const chartDom = chartRef.current;
    const myChart = echarts.init(chartDom, null, {
      renderer: 'canvas',
      useDirtyRect: false
    });
    const option = {
      title: {
        show: finalData?.length === 0,
        textStyle: {
          color: "grey",
          fontSize: 20
        },
        text: "No details are available",
        left: "center",
        top: "center"
      },
      xAxis: {
        name: 'Percentage',
        nameLocation: 'middle',
        show: finalData?.length > 0,
        nameGap: 40,
        splitLine: { show: false },
        type: 'category',
        axisLabel: {
          interval: 0,
          rotate: 30
        },
        min: 0
      },
      yAxis: {
        name: 'Count',
        splitLine: { show: false },
        show: finalData?.length > 0,
        scale: true,
        min: 0,
        nameLocation: 'middle',
        nameGap: 30
      },
      grid: {
        left: 40,
        right: 100
      },
      series: [
        {
          data: finalData[0],
          type: 'scatter',
          symbolSize: function (data) {
            return Math.sqrt(data[2]);
          },
          itemStyle: {
            color: function (params) {
              // Customize the symbol color based on your logic
              // You can return different colors based on the data or conditions
              if (params.data[1] > 3.5) {
                return 'green';
              } if (params.data[1] < 2) {
                return 'red';
              } if (params.data[1] > 2 && params.data[1] < 3.5) {
                return 'blue';
              } else {
                return 'blue';
              }
            },
          },
          emphasis: {
            focus: 'self'
          },
          // labelLayout: function () {
          //   return {
          //     x: myChart.getWidth() - 200,
          //     moveOverlap: 'shiftY'
          //   };
          // },
          // labelLine: {
          //   show: true,
          //   length: 0,
          //   lineStyle: {
          //     color: '#bbb'
          //   }
          // },
          label: {
            show: true,
            formatter: function (param) {
              return param.data[3];
            },
            position: 'center',
            minMargin: 2
          }
        }
      ]
    };
    if (option && typeof option === 'object') {
      myChart.setOption(option);
    }

    window.addEventListener('resize', myChart.resize);

    return () => {
      window.removeEventListener('resize', myChart.resize);
      myChart.dispose();
    };
  }, [chartDatas]);

  return (
    <>
      <div className='row'>
        {
          emojiList.length > 0 && emojiList.map((val, idx) => (
            <div key={idx} className='col-md-3'>
              <h3>{val.symbol}</h3>
              <h3>{val.name}</h3>
            </div>
          ))

        }
      </div>
      <div ref={chartRef} style={{ width: '100%', height: '300px' }}></div>
    </>)
    ;
};

export default NegativeScatterChart;