import React, { useState, useRef, useMemo, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { properties } from "../../../properties";
import { post } from "../../../common/util/restUtil";
import Filter from './Filter';
import { unstable_batchedUpdates } from 'react-dom';
import EChartsComponent from './EChartsComponent';


const BasedOnGroupAppoinment = (props) => {
    const { searchParams } = props?.data
    const [isRefresh, setIsRefresh] = useState(false);
    const [filterParams, setFilterParams] = useState()
    const [yAxisData, setYAxisData] = useState({})

    useEffect(() => {
        fetchData();
    }, [isRefresh, filterParams, searchParams]);

    const fetchData = () => {
        post(properties.APPOINTMENT_API + `/get-based-on-user-group`, { date: new Date(), filterParams, searchParams }).then((response) => {
            console.log('response?.data------->', response?.data);

            const scheduleBus = (response.data?.filter(ele => ele?.o_status === 'AS_SCHED' && ele?.o_user_group === 'UG_BUSINESS')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

            const scheduleCus = (response.data?.filter(ele => ele?.o_status === 'AS_SCHED' && ele?.o_user_group === 'UG_CONSUMER')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

            const unSuccessBus = (response.data?.filter(ele => ele?.o_status === 'AS_COMP_UNSUCCESS' && ele?.o_user_group === 'UG_BUSINESS')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

            const unSuccessCus = (response.data?.filter(ele => ele?.o_status === 'AS_COMP_UNSUCCESS' && ele?.o_user_group === 'UG_CONSUMER')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

            const successBus = (response.data?.filter(ele => ele?.o_status === 'AS_COMP_SUCCESS' && ele?.o_user_group === 'UG_BUSINESS')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

            const successCus = (response.data?.filter(ele => ele?.o_status === 'AS_COMP_SUCCESS' && ele?.o_user_group === 'UG_CONSUMER')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

            const cancelBus = (response.data?.filter(ele => ele?.o_status === 'AS_CANCEL' && ele?.o_user_group === 'UG_BUSINESS')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

            const cancelCus = (response.data?.filter(ele => ele?.o_status === 'AS_CANCEL' && ele?.o_user_group === 'UG_CONSUMER')).reduce((acc, ele) => acc + (Number(ele?.o_t_cnt) || 0), 0) || 0

            const dataCount = {
                schedule: {
                    business: scheduleBus,
                    consumer: scheduleCus
                },
                success: {
                    business: successBus,
                    consumer: successCus
                },
                unSuccess: {
                    business: unSuccessBus,
                    consumer: unSuccessCus
                },
                cancelled: {
                    business: cancelBus,
                    consumer: cancelCus
                }
            }

            setYAxisData(dataCount)
        }).catch((error) => {
            console.log(error)
        })
    };

    const filtration = (e) => {
        setFilterParams({ tran_category_type: e?.target?.value })
    }
    const [entityType, setEntityType] = useState()

    return (
        <>
            <div className="cmmn-skeleton mt-3">
                <div className="skel-dashboard-title-base">
                    <span className="skel-header-title">Based on User Group</span>
                    <div className="skel-dashboards-icons1">
                        <a onClick={() => setIsRefresh(!isRefresh)}><i className="material-icons">refresh</i></a>&nbsp;&nbsp;
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
                        {yAxisData && <EChartsComponent data={{ yAxisData }} />}
                    </div>
                </div>
            </div>
        </>
    )
}

export default BasedOnGroupAppoinment;


