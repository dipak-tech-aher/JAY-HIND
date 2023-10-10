import React, { useEffect, useState, useRef } from 'react';
import { properties } from "../../../properties";
import moment from 'moment'
import Chart from './Chart';
import axios from 'axios'

const ByProject = (props) => {
    const { API_ENDPOINT } = properties
    const { searchParams, isParentRefresh } = props?.data;
    console.log('searchParams-----ByProject--->', searchParams)
    const [chartOption, setChartOption] = useState({});
    const [byProjectData, setByProjectData] = useState([]);
    const [isRefresh, setIsRefresh] = useState(false);

    const getProjectWiseHelpdesk = (searchParams) => {
        console.log('searchParams-----x---------->', searchParams)
        axios.post(API_ENDPOINT + properties.HELPDESK_API + '/project-wise', { ...searchParams, fromDate: moment().format('YYYY-MM-DD'), toDate: moment().format('YYYY-MM-DD HH:mm:ss') }, {
            headers: {
                "Content-Type": "application/json",
                "x-tenant-id": properties.REACT_APP_TENANT_ID,
                authorization: JSON.parse(sessionStorage.getItem("auth")).accessToken
            }
        }).then((response) => {

            const respData = response?.data?.data?.rows;
            setByProjectData(respData);
            const projectCounts = {};
            respData?.forEach(item => {
                const description = item?.projectDesc?.description;
                if (projectCounts[description]) {
                    projectCounts[description]++;
                } else {
                    projectCounts[description] = 1;
                }
            });

            const series = Object.keys(projectCounts).map(description => {
                return {
                    name: description,
                    type: 'line',
                    stack: 'Total',
                    data: [],
                };
            });

            let projectCount = 0;
            series.forEach(serie => {
                const description = serie.name;
                const data = response?.data?.data?.rows.map(item => {

                    const createdAt = moment(item.createdAt).format('hh:mm:ss a');
                    const descriptionItem = item?.projectDesc?.description;

                    if (descriptionItem === description) {
                        projectCount++;
                    } else {
                        projectCount = 0;
                    }
                    return descriptionItem === description ? projectCount : 0;
                });
                serie.data = data;
            });

            const option = {
                title: {
                    show: !respData?.length > 0 ? true : false,
                    textStyle: {
                        color: "grey",
                        fontSize: 20
                    },
                    text: "No data available",
                    left: "center",
                    top: "center"
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    data: Object.keys(projectCounts)
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                // toolbox: {
                //     feature: {
                //         saveAsImage: {}
                //     }
                // },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: [...new Set(respData.map(item => moment(item.createdAt).format('hh:mm:ss a')))].sort((a, b) => {
                        return moment(a, 'hh:mm:ss a').diff(moment(b, 'hh:mm:ss a'));
                    }),
                    rotate: 70
                },
                yAxis: {
                    type: 'value'
                },
                series: series
            };

            setChartOption(option)
        }).catch(error => {
            console.error(error);
        });
    }

    useEffect(() => {
        getProjectWiseHelpdesk(searchParams);
    }, [isRefresh, isParentRefresh, searchParams])

    useEffect(() => {
        const interval = setInterval(() => {
            getProjectWiseHelpdesk(searchParams);
            console.log('Running every 5 seconds');
        }, properties?.LIVESTREAMTIME);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="cmmn-skeleton">
            <div className="skel-dashboard-title-base">
                <span className="skel-header-title"> Helpdesk by Projects </span>
                <div className="skel-dashboards-icons">
                    <span onClick={() => setIsRefresh(!isRefresh)}>
                        <i className="material-icons">refresh</i>
                    </span>
                    {/* <span>
                        <i className="material-icons">filter_alt</i>
                    </span> */}
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-graph-sect mt-4">
                <Chart data={{ chartOption }} />
            </div>
        </div>
    )
}

export default ByProject;