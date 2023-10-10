import moment from "moment";
import React, { useCallback, useContext, useEffect, useState } from "react";
import ReactSelect from "react-select";
import { OpsDashboardContext } from "../../../AppContext";
import { post } from "../../../common/util/restUtil";
import { properties } from "../../../properties";
import AvatarImg from "../../../assets/images/Avatar2.jpg";
import Trophy from "../../../assets/images/trophy.svg";
import Trophyb from "../../../assets/images/trophy-b.svg";
import Trophys from "../../../assets/images/trophy-s.svg";
import { statusConstantCode } from '../../../AppConstants'

const AgentPerformance = (props) => {
    const { source, agentPerformance,  } = props?.data
    // const [isRefresh, setIsRefresh] = useState(false);
    // const [filtering, setFiltering] = useState(false);
    const { data } = useContext(OpsDashboardContext)
    const { meOrMyTeam, searchParams } = data
    const { setAgentPerformance } = props?.handlers 
    // const { setLastDataRefreshTime, setCurrentTime } = handlers;
    // const [searchParams, setSearchParams] = useState({
    //     entityName: "Interaction",
    //     fromDate: moment().startOf('month').format("YYYY-MM-DD"),
    //     toDate: moment().endOf('month').format("YYYY-MM-DD"),
    //     limit: 5
    // });
    // const [agentPerformance, setAgentPerformance] = useState([
    //     {
    //         firstName: 'w', lastName: 'a', alias: 'alias', profile: '', rating: 5.0
    //     }, {
    //         firstName: 'd', lastName: 's', alias: 'alias', profile: '', rating: 4.0
    //     }, {
    //         firstName: 't', lastName: 'c', alias: 'alias', profile: '', rating: 3.0
    //     }, {
    //         firstName: 'h', lastName: 'v', alias: 'alias', profile: '', rating: 2.0
    //     }, {
    //         firstName: 'n', lastName: 'b', alias: 'alias', profile: '', rating: 1.0
    //     }
    // ])

    // const getinformativeDetails = useCallback(() => {
    //     const performanceAPI = `${properties.INTERACTION_API}/${source === statusConstantCode.entityCategory.INTERACTION
    //         ? 'get-top-performance'
    //         : source === statusConstantCode.entityCategory.ORDER
    //             ? 'get-top-performance'
    //             : source === statusConstantCode.entityCategory.APPOINTMENT
    //                 ? 'get-top-performance'
    //                 : 'get-top-performance'
    //         }`
    //     let searchParamss = {
    //             "userId": 8,
    //         ...searchParams,
    //     }
    //     post(performanceAPI, {
    //         "searchParams": searchParamss,
    //     }).then((res) => {
    //         if (res?.data) {
    //             const { rows } = res?.data
    //             setAgentPerformance(rows)
    //         }
    //     }).catch((error) => {
    //         console.log(error)

    //     }).finally()
    // }, [searchParams])

    // useEffect(() => {
    //     getinformativeDetails()
    // }, [/*isRefresh*/, meOrMyTeam, getinformativeDetails]);

    // useEffect(() => {
    //     if (filtering) {
    //         getinformativeDetails()
    //     }
    // }, [filtering, getinformativeDetails])


    return (
        <>
            <div className={`skel-top-5-perf-base-sect ${source === statusConstantCode?.entityCategory?.INTERACTION
                ? 'sk-i-bg'
                : source === statusConstantCode?.entityCategory?.APPOINTMENT
                    ? 'sk-a-bg'
                    : 'sk-o-bg'
                }`}>
                <span className="skel-header-title">{source === statusConstantCode?.entityCategory?.INTERACTION
                    ? 'By Interaction'
                    : source === statusConstantCode?.entityCategory?.APPOINTMENT
                        ? 'By Appointment'
                        : 'By Order'
                }</span>
                <div className="skel-top-5-perf-view-sect">
                    {
                        agentPerformance && agentPerformance?.length > 0 ? agentPerformance.map((e, i) => (

                            <div className={`skel-top-5-data ${i === 0 ? 'skel-t-perf-color' : i === 1 ? 'skel-b-perf-color' : i === 2 ? 'skel-s-perf-color' : ''}`}>
                                {
                                    e?.profile
                                        ? <div className="skel-top-5-avatar">
                                            <img src={e?.profile || AvatarImg} className="img-fluid" alt="" />
                                        </div>
                                        :
                                        <div className="skel-top-5-avatar circle-av-purple">
                                            <span>{e?.firstName ? e?.firstName.charAt(0).toUpperCase() : ''}{e?.lastName ? e?.lastName.charAt(0).toUpperCase() : ''}</span>
                                        </div>
                                }
                                <div className="skel-top-5-details"> <span className="skel-heading">{`${(e?.firstName || '')} ${(e?.lastName || '')}`}</span> <span>{e?.alias ? e.alias : ''}</span> </div>
                                <div className="skel-perf-ratings"> {e?.rating ? e?.rating : 0.0} </div>
                                <img src={i === 0 ? Trophy : i === 1 ? Trophyb : i === 2 ? Trophys : ''} className="img-fluid skel-trophy-img" alt="" />
                            </div>
                        )) :
                            <span className="skel-widget-warning">No Record Found</span>
                    }
                </div>
            </div>
        </>
    )

}



export default AgentPerformance;