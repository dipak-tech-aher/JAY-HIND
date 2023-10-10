import React, { useState, useEffect, useRef } from 'react';
import ReactApexChart from 'react-apexcharts';
import { post } from "../../common/util/restUtil";
import { properties } from '../../properties';
import LastRefreshTime from './LastRefreshTime';

const LocationWise = (props) => {
    const { searchParams, isParentRefresh } = props?.data
    const [chartData, setChartData] = useState([]);
    const [isRefresh, setIsRefresh] = useState(false);

    useEffect(() => {
        post(properties.INTERACTION_API + "/location-wise", { searchParams }).then((resp) => {
            if (resp?.status == 200) {
                setChartData(resp?.data?.rows ?? [])
            }
        }).catch((error) => console.log(error));
    }, [isRefresh, searchParams, isParentRefresh])

    const apexComponent = () => {
        const options = {
            chart: {
                id: 'location-wise',
                height: 300,
                type: 'radar',
            },
            dataLabels: {
                enabled: true
            },
            plotOptions: {
                radar: {
                    size: 100,
                    polygons: {
                        strokeColors: '#e9e9e9',
                        fill: {
                            colors: ['#f8f8f8', '#fff']
                        }
                    }
                }
            },
            title: {
                text: ''
            },
            colors: ['#FF4560'],
            markers: {
                size: 4,
                colors: ['#fff'],
                strokeColor: '#FF4560',
                strokeWidth: 2,
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val
                    }
                }
            },
            xaxis: {
                categories: chartData?.map((ele) => ele?.oDistrict)
            },
            yaxis: {
                tickAmount: 7,
                labels: {
                    formatter: function (val, i) {
                        if (i % 2 === 0) {
                            return val
                        } else {
                            return ''
                        }
                    }
                }
            }
        };

        const series = [{
            name: 'count',
            data: chartData?.map((ele) => ele?.oIntxnCnt)
        }];

        return (
            <div>
                <div id="chart">
                    <ReactApexChart options={options} series={series} type="radar" height={365} />
                </div>
                <div id="html-dist"></div>
            </div>
        );
    }

    return (
        <div className="cmmn-skeleton">
            <div className="skel-dashboard-title-base">
                <span className="skel-header-title"> Location wise Interactions </span>
                <div className="skel-dashboards-icons">
                    <a href="javascript:void(null)" onClick={() => setIsRefresh(!isRefresh)}>
                        <i className="material-icons">refresh</i>
                    </a>
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-graph-sect mt-2">
                {/* <div ref={chartRef} style={{ height: '336px' }}></div> */}
                {apexComponent()}
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-refresh-info">
                <LastRefreshTime data={{ isRefresh, componentName: 'LocationWise' }} />
            </div>
        </div>
    );
};

export default LocationWise;