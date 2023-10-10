import React, { useState, useRef, useMemo, useEffect } from 'react';
import ReactEcharts from "echarts-for-react";
import { properties } from "../../../properties";
import { post, get } from "../../../common/util/restUtil";
import Filter from './Filter';
import chroma from "chroma-js";

const ByType = (props) => {
    const { searchParams } = props.data
    const [isRefresh, setIsRefresh] = useState(false)
    const [appoinmentData, setAppoinmentData] = useState([])
    const [dataCount, setDataCount] = useState([])
    const [filterParams, setFilterParams] = useState()

    const filtration = (e) => {
        // console.log('val-------->', e?.target?.value);
        setFilterParams({ tran_category_type: e?.target?.value })
    }

    const fetchEvents = async () => {
        try {
            post(properties.APPOINTMENT_API + '/get-based-on-type', { filterParams, searchParams }).then((response) => {
                if (response.data) {
                  console.log('response.data ', response.data)
                    setAppoinmentData(response.data);

                    const scheduleCustVisit = (response.data?.filter(ele => ['AS_SCHED', 'AS_COMP_UNSUCCESS', 'AS_COMP_SUCCESS', 'AS_CANCEL'].includes(ele?.o_status) && ele?.o_appoint_type === 'CUST_VISIT')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

                    const scheduleBusVisit = (response.data?.filter(ele => ['AS_SCHED', 'AS_COMP_UNSUCCESS', 'AS_COMP_SUCCESS', 'AS_CANCEL'].includes(ele?.o_status) && ele?.o_appoint_type === 'BUS_VISIT')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

                    const scheduleAudioConf = (response.data?.filter(ele => ['AS_SCHED', 'AS_COMP_UNSUCCESS', 'AS_COMP_SUCCESS', 'AS_CANCEL'].includes(ele?.o_status) && ele?.o_appoint_type === 'AUDIO_CONF')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

                    const scheduleVideoConf = (response.data?.filter(ele => ['AS_SCHED', 'AS_COMP_UNSUCCESS', 'AS_COMP_SUCCESS', 'AS_CANCEL'].includes(ele?.o_status) && ele?.o_appoint_type === 'VIDEO_CONF')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

                    const unSuccessCustVisit = (response.data?.filter(ele => ele?.o_status === 'AS_COMP_UNSUCCESS' && ele?.o_appoint_type === 'CUST_VISIT')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

                    const unSuccessBusVisit = (response.data?.filter(ele => ele?.o_status === 'AS_COMP_UNSUCCESS' && ele?.o_appoint_type === 'BUS_VISIT')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

                    const unSuccessAudioConf = (response.data?.filter(ele => ele?.o_status === 'AS_COMP_UNSUCCESS' && ele?.o_appoint_type === 'AUDIO_CONF')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

                    const unSuccessVideoConf = (response.data?.filter(ele => ele?.o_status === 'AS_COMP_UNSUCCESS' && ele?.o_appoint_type === 'VIDEO_CONF')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

                    const successCustVisit = (response.data?.filter(ele => ele?.o_status === 'AS_COMP_SUCCESS' && ele?.o_appoint_type === 'CUST_VISIT')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

                    const successBusVisit = (response.data?.filter(ele => ele?.o_status === 'AS_COMP_SUCCESS' && ele?.o_appoint_type === 'BUS_VISIT')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

                    const successAudioConf = (response.data?.filter(ele => ele?.o_status === 'AS_COMP_SUCCESS' && ele?.o_appoint_type === 'AUDIO_CONF')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

                    const successVideoConf = (response.data?.filter(ele => ele?.o_status === 'AS_COMP_SUCCESS' && ele?.o_appoint_type === 'VIDEO_CONF')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

                    const cancelCustVisit = (response.data?.filter(ele => ele?.o_status === 'AS_CANCEL' && ele?.o_appoint_type === 'CUST_VISIT')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

                    const cancelBusVisit = (response.data?.filter(ele => ele?.o_status === 'AS_CANCEL' && ele?.o_appoint_type === 'BUS_VISIT')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

                    const cancelAudioConf = (response.data?.filter(ele => ele?.o_status === 'AS_CANCEL' && ele?.o_appoint_type === 'AUDIO_CONF')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

                    const cancelVideoConf = (response.data?.filter(ele => ele?.o_status === 'AS_CANCEL' && ele?.o_appoint_type === 'VIDEO_CONF')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

                    const upcomingCustVisit = (response.data?.filter(ele => ele?.o_status === 'AS_SCHED' && ele?.o_appoint_type === 'CUST_VISIT')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

                    const upcomingBusVisit = (response.data?.filter(ele => ele?.o_status === 'AS_SCHED' && ele?.o_appoint_type === 'BUS_VISIT')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

                    const upcomingAudioConf = (response.data?.filter(ele => ele?.o_status === 'AS_SCHED' && ele?.o_appoint_type === 'AUDIO_CONF')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

                    const upcomingVideoConf = (response.data?.filter(ele => ele?.o_status === 'AS_SCHED' && ele?.o_appoint_type === 'VIDEO_CONF')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

                    const dataCount = {
                        schedule: {
                            custVisit: scheduleCustVisit,
                            busVisit: scheduleBusVisit,
                            audioConf: scheduleAudioConf,
                            videoConf: scheduleVideoConf
                        },
                        success: {
                            custVisit: successCustVisit,
                            busVisit: successBusVisit,
                            audioConf: successAudioConf,
                            videoConf: successVideoConf
                        },
                        unSuccess: {
                            custVisit: unSuccessCustVisit,
                            busVisit: unSuccessBusVisit,
                            audioConf: unSuccessAudioConf,
                            videoConf: unSuccessVideoConf
                        },
                        cancelled: {
                            custVisit: cancelCustVisit,
                            busVisit: cancelBusVisit,
                            audioConf: cancelAudioConf,
                            videoConf: cancelVideoConf
                        },
                        upComing: {
                            custVisit: upcomingCustVisit,
                            busVisit: upcomingBusVisit,
                            audioConf: upcomingAudioConf,
                            videoConf: upcomingVideoConf
                        }
                    }
                    // console.log('dataCount--------->', dataCount)
                    setDataCount(dataCount)
                }
            }).catch((error) => {
              console.log(error)
          })
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [isRefresh, filterParams, searchParams]);

    const seriesData = [
        {
            name: "Type",
            children:[
                {
                    name: "Customer Visit",                    
                    children: [
                        { name: 'Scheduled', value: dataCount.schedule?.custVisit },
                        { name: 'Success', value: dataCount.success?.custVisit },
                        { name: 'Unsuccess', value: dataCount.unSuccess?.custVisit },
                        { name: 'Cancelled', value: dataCount.cancelled?.custVisit },
                        { name: 'Upcoming', value: dataCount.upComing?.custVisit }
                ],
                itemStyle: {
                  color: chroma.random().darken().hex()
                }
                },
                {
                    name: "Business Visit",                   
                    children: [
                        { name: 'Scheduled', value: dataCount.schedule?.busVisit },
                        { name: 'Success', value: dataCount.success?.busVisit },
                        { name: 'Unsuccess', value: dataCount.unSuccess?.busVisit },
                        { name: 'Cancelled', value: dataCount.cancelled?.busVisit },
                        { name: 'Upcoming', value: dataCount.upComing?.busVisit }
                    ],
                    itemStyle: {
                      color: chroma.random().darken().hex()
                    }
                },
                {
                    name: "Audio conference",                    
                    children: [
                        { name: 'Scheduled', value: dataCount.schedule?.audioConf },
                        { name: 'Success', value: dataCount.success?.audioConf },
                        { name: 'Unsuccess', value: dataCount.unSuccess?.audioConf },
                        { name: 'Cancelled', value: dataCount.cancelled?.audioConf },
                        { name: 'Upcoming', value: dataCount.upComing?.audioConf }
                    ],
                    itemStyle: {
                      color: chroma.random().darken().hex()
                    }
                },
                {
                    name: "Video Conference",                   
                    children: [
                        { name: 'Scheduled', value: dataCount.schedule?.videoConf },
                        { name: 'Success', value: dataCount.success?.videoConf },
                        { name: 'Unsuccess', value: dataCount.unSuccess?.videoConf },
                        { name: 'Cancelled', value: dataCount.cancelled?.videoConf },
                        { name: 'Upcoming', value: dataCount.upComing?.videoConf }
                    ],
                    itemStyle: {
                      color: chroma.random().darken().hex()
                    }
                }
            ]
        }
        
    ]

    // const option = {
    //     height: "640px",
    //     xAxisData: [
    //         {
    //             type: 'category',
    //             data: ['Scheduled', 'Success', 'Unsuccess', 'Cancelled', 'Upcoming'],
    //             axisLabel: {
    //                 interval: 0,
    //                 rotate: 45,
    //             },
    //         }
    //     ],
    //     yAxisData: [
    //         {
    //             type: 'value'
    //         }
    //     ],
    //     seriesData: seriesData,
    //     toolbox: {
    //         show: false,
    //         feature: {
    //             dataView: { show: true, readOnly: false },
    //             magicType: { show: true, type: ['line', 'bar'] },
    //             restore: { show: true },
    //             saveAsImage: { show: true }
    //         }
    //     }
    // };

    useEffect(() => {
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleResize = () => {
    };
    
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
    const [entityType, setEntityType] = useState()

    return (
        <div className="cmmn-skeleton mt-3">
            <div className="skel-dashboard-title-base">
                <span className="skel-header-title">Based on Appointment Type</span>
                <div className="skel-dashboards-icons1">
                    <a onClick={() => setIsRefresh(!isRefresh)}><i className="material-icons">refresh</i></a>
                    &nbsp;&nbsp;
                    <Filter
                        data={{ entityType }}
                        handlers={{
                            filtration,
                            setEntityType
                        }}
                    />
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-perf-sect">
                <div className="skel-perf-graph">
                    <ReactEcharts style={{ "height": '640px' }}
                        // option={{
                        //     tooltip: {
                        //         trigger: 'axis',
                        //         axisPointer: {
                        //             type: 'shadow'
                        //         }
                        //     },
                        //     toolbox: option?.toolbox,
                        //     legend: {},
                        //     grid: {
                        //         left: '0%',
                        //         right: '0%',
                        //         bottom: '2%',
                        //         containLabel: true
                        //     },
                        //     xAxis: option?.xAxisData,
                        //     yAxis: option?.yAxisData,
                        //     series: option?.seriesData
                        // }}
                        option={{
                            title: {
                              show: appoinmentData.length === 0,
                              textStyle: {
                                  color: "grey",
                                  fontSize: 20
                              },
                              text: "No data available",
                              left: "center",
                              top: "center"
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
                              },
                          },

                          series: [
                            {
                              name: '',
                              type: 'treemap',
                              visibleMin: 300,
                              label: {
                                show: true,
                              },                    
                              upperLabel: {
                                show: true,
                                height: 30
                              },
                              itemStyle: {
                                borderColor: '#fff'
                              },
                              levels: appoinmentData.length > 0 ? getLevelOption():[],
                              data: appoinmentData.length > 0 ? seriesData: []
                            }
                          ]
                        }}
                    />
                </div>
            </div>
            {/* <hr className="cmmn-hline" />
            <div className="skel-refresh-info">
                <span><i className="material-icons">refresh</i> Updated 5 mins ago</span>
            </div> */}
        </div>
    )
}

export default ByType;


/**const data = [{
        name: 'Root',
        children: [
          {
            name: 'Category 1',
            children: [
              { name: 'Item 1', value: 10 },
              { name: 'Item 2', value: 20 },
              { name: 'Item 3', value: 15 },
            ],
          },
          {
            name: 'Category 2',
            children: [
              { name: 'Item 4', value: 18 },
              { name: 'Item 5', value: 12 },
            ],
          },
          {
            name: 'Category 3',
            children: [
              { name: 'Item 6', value: 25 },
              { name: 'Item 7', value: 30 },
              { name: 'Item 8', value: 22 },
            ],
          },
        ],
      }] */