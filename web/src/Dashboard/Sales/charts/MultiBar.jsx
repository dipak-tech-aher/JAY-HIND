import React, { useContext, useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { salesDashboardContext } from "../../../AppContext";
import { isEmpty } from 'lodash'

const MultiBar = (props) => {
    const { getter } = useContext(salesDashboardContext);
    const { width, height } = props?.chartStyle
    const { locationBasedSales } = getter

    const chartRef = useRef(null)
    const myChart = useRef(null)
    const [seriesData, setSeriesData] = useState([])
    const [keys, setKeys] = useState([])

    useEffect(() => {
        const keyInfo = []
        if (locationBasedSales && !isEmpty(locationBasedSales)) {
            const transformedData = Object.keys(locationBasedSales).map(key => {
                keyInfo.push(key)
                const districtData = locationBasedSales[key];
                const dataValues = districtData.map(item => Number(item.vTotalSalesCnt));
                // console.log("districtData ===> ", districtData);
                return {
                    name: key,
                    type: 'bar',
                    barGap: 0,
                    label: {
                        show: true,
                        position: app?.config.position,
                        distance: app?.config.distance,
                        align: app?.config.align,
                        verticalAlign: app?.config.verticalAlign,
                        rotate: app?.config.rotate,
                        formatter: function (d) {
                            return districtData[d.componentIndex]?.['vProductName'];
                        },
                        fontSize: 16
                    },
                    emphasis: {
                        focus: 'series'
                    },
                    data: dataValues
                };
            });
            setSeriesData(transformedData)
            setKeys(keyInfo)
        }
    }, [locationBasedSales])

    let posList = [
        'left', 'right', 'top', 'bottom',
        'inside',
        'insideTop', 'insideLeft', 'insideRight', 'insideBottom',
        'insideTopLeft', 'insideTopRight', 'insideBottomLeft', 'insideBottomRight'
    ]

    let app = {
        configParameters: {
            rotate: {
                min: -90,
                max: 90
            },
            align: {
                options: {
                    left: 'left',
                    center: 'center',
                    right: 'right'
                }
            },
            verticalAlign: {
                options: {
                    top: 'top',
                    middle: 'middle',
                    bottom: 'bottom'
                }
            },
            position: {
                options: posList.reduce(function (map, pos) {
                    map[pos] = pos;
                    return map;
                }, {})
            },
            distance: {
                min: 0,
                max: 100
            }
        },
        config: {
            rotate: 90,
            align: 'left',
            verticalAlign: 'middle',
            position: 'insideBottom',
            distance: 15
        }
    }

    useEffect(() => {
        myChart.current = echarts.init(chartRef.current, null, {
            renderer: 'canvas',
            useDirtyRect: false
        });
        // console.log("seriesData ===> ", seriesData);
        const option = {
            tooltip: {
                trigger: 'item',
                axisPointer: {
                    type: 'cross'
                },
                formatter: function (params) {
                    let productName = locationBasedSales[seriesData[params?.seriesIndex]?.name]?.[params.dataIndex]?.vProductName;
                    let saleCount = locationBasedSales[seriesData[params?.seriesIndex]?.name]?.[params.dataIndex]?.vTotalSalesCnt??0;
                    return `${productName} - ${saleCount}`;
                }
            },
            toolbox: {
                show: true,
                orient: 'vertical',
                left: 'right',
                top: 'center',
                feature: {
                    mark: { show: true },
                    dataView: { show: true, readOnly: false },
                    magicType: { show: true, type: ['line', 'bar', 'stack', 'tiled'] },
                    restore: { show: true },
                    saveAsImage: { show: true }
                }
            },
            xAxis: [
                {
                    type: 'category',
                    axisTick: { show: false },
                    data: keys || []
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: seriesData || []
        }

        if (option && typeof option === 'object') {
            myChart.current.setOption(option);
        }

        const cleanup = () => {
            myChart.current.dispose();
        }

        return cleanup

    }, [seriesData])

    return <div ref={chartRef} style={{ width, height }}></div>;
}
export default MultiBar;