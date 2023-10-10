import React, { useEffect, useContext, useState, useRef } from "react";
import l1 from "../../../assets/images/l1.png"
import l2 from "../../../assets/images/l2.png"
import l3 from "../../../assets/images/l3.png"
import l4 from "../../../assets/images/l4.png"
import { properties } from "../../../properties";
import { post } from "../../../common/util/restUtil";
import { unstable_batchedUpdates } from 'react-dom';

const Counts = (props) => {
    const { cancelCount,
        completedCount,
        upcomming,
        totalCount,
        successFullCount,
        unSuccessFullCount,
        successCount,
        unSuccessCount,
        searchParams,
        completedCounts 
    } = props.data

    const {
        setCancelCount,
        setCompletedCount,
        setUpcomming,
        setTotalCount,
        setSuccessFullCount,
        setUnSuccessFullCount,
        setSuccessCount,
        setUnSuccessCount,
        setCompletedCounts,
        setAppointmentList,
        setAppointmentListCount,
        setIsAppointmentPopupOpen
    } = props.handlers

    const [upcomingList, setUpcomingList] = useState([])
    const [successList, setSuccessList] = useState([])
    const [unsuccessList, setUnsuccessList] = useState([])
    const [cancelList, setCancelList] = useState([])
    const [completedList, setCompletedList] = useState([])
    const [totalList, setTotalList] = useState([])
    const [successSalesList, setSuccessSalesList] = useState([])
    const [successProblemList, setSuccessProblemList] = useState([])
    const [successFulfilList, setSuccessFulfilmentList] = useState([])
    const [unSuccessSalesList, setUnsuccessSalesList] = useState([])
    const [unSuccessProblemList, setUnsuccessProblemList] = useState([])
    const [unSuccessFulfilList, setUnsuccessFulfilmentList] = useState([])

    useEffect(() => {
        fetchData();
    }, [searchParams]);

    const fetchData = () => {
        post(properties.APPOINTMENT_API + `/get-upcoming-appoinments?valueParam=AS_SCHED`, { date: new Date(), searchParams }).then((upcomingResp) => {
            if (upcomingResp.status === 200) {
                post(properties.APPOINTMENT_API + `/get-appoinments-by-query?valueParam=AS_CANCEL,AS_COMP_UNSUCCESS,AS_COMP_SUCCESS,`, { date: new Date(), searchParams }).then((allAppt) => {
                    if (allAppt.status === 200) {
                        const groups = {
                            sales: ['INTEREST', 'PURCHASE'],
                            problem: ['APPEALS', 'GRIEVANCE'],
                            fullfillment: ['ORDER', 'REQUEST']
                        }
                        const successCount = allAppt?.data?.rows && allAppt?.data?.rows?.length && allAppt?.data?.rows?.filter((ele) => ele?.status === 'AS_COMP_SUCCESS')
                        setUpcomingList(upcomingResp?.data?.rows)
                        setSuccessList(successCount)

                        let salesSuccess = [];
                        let problemSuccess = [];
                        let fullfillmentSuccess = [];
                        successCount && successCount?.length > 0 && successCount?.forEach((ele) => {
                            if (groups.sales.includes(ele.group_type)) {
                                salesSuccess.push(ele)
                            }
                            if (groups.problem.includes(ele.group_type)) {
                                problemSuccess.push(ele)
                            }
                            if (groups.fullfillment.includes(ele.group_type) || groups.fullfillment.includes(ele?.tran_category_type)) {
                                fullfillmentSuccess.push(ele)
                            }
                        });
                        setSuccessSalesList(salesSuccess)
                        setSuccessProblemList(problemSuccess)
                        setSuccessFulfilmentList(fullfillmentSuccess)

                        const unSuccessfullCount = allAppt?.data?.rows && allAppt?.data?.rows?.length && allAppt?.data?.rows?.filter((ele) => ele?.status === 'AS_COMP_UNSUCCESS');
                        setUnsuccessList(unSuccessfullCount)

                        let salesUnSuccess = [];
                        let problemUnSuccess = [];
                        let fullfillmentUnSuccess = [];
                        unSuccessfullCount && unSuccessfullCount?.length > 0 && unSuccessfullCount?.forEach((ele) => {
                            if (groups.sales.includes(ele.group_type)) {
                                salesUnSuccess.push(ele)
                            }
                            if (groups.problem.includes(ele.group_type)) {
                                problemUnSuccess.push(ele)
                            }
                            if (groups.fullfillment.includes(ele.group_type) || groups.fullfillment.includes(ele?.tran_category_type)) {
                                fullfillmentUnSuccess.push(ele)
                            }
                        });

                        setUnsuccessSalesList(salesUnSuccess)
                        setUnsuccessProblemList(problemUnSuccess)
                        setUnsuccessFulfilmentList(fullfillmentUnSuccess)

                        setSuccessCount({
                            sales: salesSuccess.length,
                            problem: problemSuccess.length,
                            fullfillment: fullfillmentSuccess.length
                        })
                        setUnSuccessCount({
                            sales: salesUnSuccess.length,
                            problem: problemUnSuccess.length,
                            fullfillment: fullfillmentUnSuccess.length
                        })
                        setCompletedCounts({
                            sales: salesSuccess.length + salesUnSuccess.length,
                            problem: problemSuccess.length + problemUnSuccess.length,
                            fullfillment: fullfillmentSuccess.length + fullfillmentUnSuccess.length
                        })


                        const closedCount = allAppt?.data?.rows && allAppt?.data?.rows?.length && allAppt?.data?.rows?.filter((ele) => (ele?.status === 'AS_COMP_UNSUCCESS' || ele?.status === 'AS_COMP_SUCCESS'))

                        setCompletedList(closedCount)
                        const cancelCount = allAppt?.data?.rows && allAppt?.data?.rows?.length && allAppt?.data?.rows?.filter((ele) => ele?.status === 'AS_CANCEL')

                        setCancelList(cancelCount)

                        const totalData =[]                         
                        successCount && successCount.filter(e => {
                            totalData.push(e)                            
                        })
                        closedCount && closedCount.filter(e => {
                            totalData.push(e)                            
                        })
                        unSuccessfullCount && unSuccessfullCount.filter(e => {
                            totalData.push(e)                            
                        })
                        cancelCount && cancelCount.filter(e => {
                            totalData.push(e)                            
                        })
                        upcomingResp?.data?.rows && upcomingResp?.data?.rows.filter(e => {
                            totalData.push(e)                            
                        })
                      
                        unstable_batchedUpdates(() => {
                            setSuccessFullCount(successCount?.length || 0);
                            setUnSuccessFullCount(unSuccessfullCount?.length || 0);
                            setCompletedCount(closedCount?.length || 0);
                            setUpcomming(upcomingResp?.data?.count || 0);
                            setCancelCount(cancelCount?.length || 0);
                            setTotalCount((upcomingResp?.data?.count || 0) + (cancelCount?.length || 0) + (successCount?.length || 0) + (unSuccessfullCount?.length || 0))
                            
                            setTotalList(totalData)

                        })
                    }
                }).catch((error) => {
                    console.log(error)
                })
            }
        }).catch((error) => {
            console.log(error)
        })
    };

    return (
        <div className="row mt-2">
            <div className="col-lg-6 col-md-12 col-xs-12">
                <div className="row">
                    <div className="col-md-12">
                        <div className="skel-up-appts">
                            <div className="skel-appt-hist info-h6">
                                <span className="skel-heading-med">Total Appts.</span>
                                <div className="skel-appt-graph mt-3">
                                    <span onClick={e => {
                                        setIsAppointmentPopupOpen(true)
                                        setAppointmentList(totalList)
                                    }}>{totalCount}</span>
                                    <img src={l4} alt="" className="img-fluid" width="100px" height="100px" />
                                </div>
                            </div>

                            <div className="skel-appt-hist info-h1">
                                <span className="skel-heading-med">Upcoming Appts.</span>
                                <div className="skel-appt-graph mt-3">
                                    <span onClick={e=>{
                                        setIsAppointmentPopupOpen(true)
                                        setAppointmentList(upcomingList)
                                        }}>{upcomming}</span>
                                    <img src={l1} alt="" className="img-fluid" width="100px" height="100px" />
                                </div>
                            </div>

                            <div className="skel-appt-hist info-h2">
                                <span className="skel-heading-med">Cancelled Appts.</span>
                                <div className="skel-appt-graph mt-3">
                                    <span onClick={e=>{
                                        setIsAppointmentPopupOpen(true)
                                        setAppointmentList(cancelList)                                    
                                    }}>{cancelCount}</span>
                                    <img src={l2} alt="" className="img-fluid" width="100px" height="100px" />
                                </div>
                            </div>

                            <div className="skel-appt-hist info-h3">
                                <span className="skel-heading-med">Completed Appts.</span>
                                <div className="skel-appt-graph mt-3">
                                    <span onClick={e=>{
                                        setIsAppointmentPopupOpen(true)
                                        setAppointmentList(completedList)                                        
                                        }}>{completedCount}</span>
                                    <img src={l3} alt="" className="img-fluid" width="100px" height="100px" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="col-lg-6 col-md-12 col-xs-12">
                <div className="skel-appt-dashboard-succ-unsucc-data">
                    <div className="skel-successfull-appts-data-base skel-info-h4">
                        <span className="skel-heading-med">Successfull Appts.</span>
                        <div className="skel-appt-graph mb-1 mt-0"><span onClick={e=>{
                                        setAppointmentList(successList)
                                        setIsAppointmentPopupOpen(true)
                            }}>{successFullCount}</span></div>
                        <hr className="cmmn-hline" />
                        <div className="skel-info-successfull-appt">
                            <p><span>Sales</span><span onClick={e=>{
                                        setAppointmentList(successSalesList)
                                        setIsAppointmentPopupOpen(true)
                            }}className="font-lg">{successCount?.sales}</span></p>
                            <p><span>Fullfillment</span><span onClick={e=>{
                                        setAppointmentList(successFulfilList)
                                        setIsAppointmentPopupOpen(true)
                            }}className="font-lg">{successCount?.fullfillment}</span></p>
                            <p><span>Problem Solving</span><span onClick={e=>{
                                        setAppointmentList(successProblemList)
                                        setIsAppointmentPopupOpen(true)
                            }}className="font-lg">{successCount?.problem}</span></p>
                        </div>
                    </div>
                    <div className="skel-successfull-appts-data-base skel-info-h5">
                        <span className="skel-heading-med">Un-Successfull Appts.</span>
                        <div className="skel-appt-graph mb-1 mt-0"><span onClick={e=>{
                                        setAppointmentList(unsuccessList)                            
                                        setIsAppointmentPopupOpen(true)
                            }}>{unSuccessFullCount}</span></div>
                        <hr className="cmmn-hline" />
                        <div className="skel-info-successfull-appt">
                            <p><span>Sales</span><span onClick={e=>{
                                        setAppointmentList(unSuccessSalesList)
                                        setIsAppointmentPopupOpen(true)
                            }}className="font-lg">{unSuccessCount?.sales}</span></p>
                            <p><span>Fullfillment</span><span onClick={e=>{
                                        setAppointmentList(unSuccessFulfilList)
                                        setIsAppointmentPopupOpen(true)
                            }}className="font-lg">{unSuccessCount?.fullfillment}</span></p>
                            <p><span>Problem Solving</span><span onClick={e=>{
                                        setAppointmentList(unSuccessProblemList)
                                        setIsAppointmentPopupOpen(true)
                            }}className="font-lg">{unSuccessCount?.problem}</span></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Counts;


