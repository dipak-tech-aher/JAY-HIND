import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

const Gauge = (props) => {
    const chartRef = useRef(null);

    const chartData = props?.data?.chartData || []
    // const height = props?.data?.height || '400px'
    // const width = props?.data?.width || '100%'

    const { name ='', height = '400px', width = '100%' } = props?.data


    useEffect(() => {
        const chartDom = chartRef.current;
        const myChart = echarts.init(chartDom, null, {
            renderer: 'canvas',
            useDirtyRect: false
        });

        const option = {
            tooltip: {
                formatter: '{a} <br/>{b} : {c}%'
            },
            series: [
                {
                    name: 'Pressure',
                    type: 'gauge',
                    axisLine: {
                        lineStyle: {
                          width: 30,
                          color: [
                            [0.3, '#20B442'],
                            [0.7, '#E6D208'],
                            [1, '#D90A17']
                          ]
                        }
                      },
                      pointer: {
                        itemStyle: {
                          color: 'inherit'
                        }
                      },
                    //   axisTick: {
                    //     distance: -30,
                    //     length: 8,
                    //     lineStyle: {
                    //       color: '#fff',
                    //       width: 2
                    //     }
                    //   },
                      axisLabel: {
                        color: 'inherit',
                        distance: 40,
                        fontSize: 20
                      },
                      detail: {
                        valueAnimation: true,
                        formatter: '{value}',
                        color: 'inherit'
                      },
                    data: [
                        {
                            value: 50,
                            name: 'SCORE'
                        }
                    ]
                }
            ]
        }

        if (option && typeof option === 'object') {
            myChart.setOption(option);
        }

        setInterval(function () {
            myChart.setOption({
              series: [
                {
                  data: [
                    {
                      value: +(Math.random() * 100).toFixed(2)
                    }
                  ]
                }
              ]
            });
          }, 2000);

        window.addEventListener('resize', myChart.resize);

        return () => {
            window.removeEventListener('resize', myChart.resize);
            myChart.dispose();
        };
    }, [props.data.chartData])
    return <div ref={chartRef} style={{ width: width, height: height }}></div>;

}

export default Gauge;