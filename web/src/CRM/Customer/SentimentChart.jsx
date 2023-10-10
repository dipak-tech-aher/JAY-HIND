import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';

const SentimentChart = (props) => {
  const chartRef = useRef(null);
  const {setIssetimentPopupOpen, setSentimentFilter} = props?.handlers
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

  const chartData = props?.data?.chartData || []
  // console.log('chartData=========================', chartData)
  useEffect(() => {
    const legend = new Set()
    const legendName = []
    chartData[0]?.emojiList?.forEach(f => legend.add(f.symbol));
    chartData[0]?.emojiList?.forEach(f => legendName.push({ symbol: f.symbol, name: f.name }));
    // console.log(legend)

    const uniquelegendName = Object.values(legendName.reduce((acc, obj) => {
      acc[obj.name] = obj;
      return acc;
    }, {}));

    setEmojiList(uniquelegendName)


    const yAxisData = Object.keys(groupBy(chartData, 'emotion'));
    // console.log(yAxisData)

    const seriesData = new Set();


    const xAxisData = new Set()
    chartData.map(x => xAxisData.add(x.monthYear))
    for (const y of Array.from(legend)) {
      let data = []
      let filteredData = []
      for (const x of Array.from(xAxisData)) {
        filteredData = chartData.filter(ch => ch.monthYear === x && ch.emotion === y) //console.log( ch.channleDescription.description , x , ch[filteredType] , y)
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
      title: {
        show: chartData?.length === 0,
        textStyle: {
          color: "grey",
          fontSize: 20
        },
        text: "No details are available",
        left: "center",
        top: "center"
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: Array.from(legend)
      },
      toolbox: {
        // show: true,
        orient: 'vertical',
        left: 'right',
        top: 'center',
        show: chartData?.length > 0,
        feature: {
          mark: { show: true },
          dataView: { show: false, readOnly: false },
          magicType: { show: true, type: ['bar', 'stack'] },
          restore: { show: false },
          saveAsImage: { show: true, name: 'Customer Sentiment' }
        }
      },
      xAxis: [
        {
          type: 'category',
          show: chartData?.length > 0,
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
          type: 'value',
          show: chartData?.length > 0
        }
      ],
      series: Array.from(seriesData)
    };

    if (option && typeof option === 'object') {
      myChart.setOption(option);
    }

    myChart.on('click', (params) => {
      setSentimentFilter({ monthYear: params?.name, emotion: params?.seriesName })
      setIssetimentPopupOpen(true)
      console.log('params ---------->', params)
    })

    window.addEventListener('resize', myChart.resize);

    return () => {
      window.removeEventListener('resize', myChart.resize);
      myChart.dispose();
    };
  }, [chartData]);

  return (
    <>
      <div className='row'>
        {
          emojiList.length > 0 && emojiList.map((val, idx) => (
            <div key={idx} className='col-md-3'>
              <h3>{val.symbol}</h3>
              <h6 className='text-center'>{val.name}</h6>
            </div>
          ))

        }
      </div>
      <div ref={chartRef} style={{ width: '100%', height: '300px' }}></div>
    </>)
    ;
};

export default SentimentChart;