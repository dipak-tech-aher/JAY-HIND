import React, { useCallback, useEffect, useState, useContext } from "react";
import Footer from "../common/footer";
import LeftTab from "./leftTab"
import Filter from "./filter";
import Interactions from "./interactions";
import InteractionsChart from "./interactionsChart";
import { properties } from "../properties";
import { post } from "../common/util/restUtil";

import TopFive from "./TopFive";
import ServiceAndComplaintCard from "./ServiceAndComplaintCard";
import ChatCard from "./chatCard";
import { AppContext } from "../AppContext";
// import ChatImg from '../assets/images/live-chat-on-website.jpg'
import { useHistory } from "react-router-dom";

const Dashboard = () => {
  const history = useHistory();
  let { auth, setAuth } = useContext(AppContext);
  const [refresh, setRefresh] = useState(auth && auth.dashboardData && auth.dashboardData.refresh);
  const [autoRefresh, setAutoRefresh] = useState(auth && auth.dashboardData && auth.dashboardData.autoRefresh);
  const [timer, setTimer] = useState(auth && auth.dashboardData && auth.dashboardData.timer);
  const [interactionCountData, setInteractionCountData] = useState({
    serviceRequestCount: {
      total: 0,
      open: 0,
      assigned: 0,
      failed: 0,
      closed: 0
    },
    complaintsCount: {
      total: 0,
      open: 0,
      assigned: 0,
      failed: 0,
      closed: 0
    },
    workOrderCount: {
      open: 0,
      assigned: 0,
      failed: 0,
      closed: 0,
      total: 0
    }
  })

  // const [chartData, setChartData] = useState({
  //   broadBandGraph: [],
  //   mobileGraph: []
  // });

  // const [openByServiceType, setOpenByServiceType] = useState([]);
  const [topFive, setTopFive] = useState([]);

  const [selfDept, setSelfDept] = useState(auth && auth.dashboardData && auth.dashboardData.selfDept);

  const [dateRange, setDateRange] = useState(
    {
      startDate: auth && auth.dashboardData && auth.dashboardData.startDate,
      endDate: auth && auth.dashboardData && auth.dashboardData.endDate,
    });
  const [chatCountHistory, setChatCountHistory] = useState({});
  const [todoPageCount, setTodoPageCount] = useState(0);

  const getDashBoardData = useCallback(() => {
   
    // let serviceRequestCount = {
    //   open: 0,
    //   assigned: 0,
    //   failed: 0,
    //   closed: 0,
    //   total: 0
    // }
    // let complaintsCount = {
    //   open: 0,
    //   assigned: 0,
    //   failed: 0,
    //   closed: 0,
    //   total: 0
    // }
    // let workOrderCount = {
    //   open: 0,
    //   assigned: 0,
    //   failed: 0,
    //   closed: 0,
    //   total: 0
    // }
    // let chatCount = {
    //   new: 0,
    //   assigned: 0,
    //   closed: 0,
    //   total: 0
    // }
    // let startDate = dateRange.startDate.split("-").reverse().join("-");
    // let endDate = dateRange.endDate.split("-").reverse().join("-");
    /****enable once API is ready */
    // 
    // post(properties.SERVICE_TYPE_COUNT, { selfDept: selfDept, startDate: startDate, endDate: endDate })
    //   .then((resp) => {
    //     if (resp.data && resp.data.count) {
    //       resp.data.count.forEach((value) => {
    //         if (value.intxnTypeDesc === "Complaint" || value.intxnTypeDesc === "Inquiry") {
    //           if (value.currStatus === "NEW") {
    //             complaintsCount.open += parseInt(value.count);
    //             complaintsCount.total += parseInt(value.count);
    //           }
    //           else if (value.currStatus === "CLOSED") {
    //             complaintsCount.closed += parseInt(value.count);
    //             complaintsCount.total += parseInt(value.count);
    //           }
    //           else if (value.currStatus === "FAILED") {
    //             complaintsCount.failed += parseInt(value.count);
    //             complaintsCount.total += parseInt(value.count);
    //           }
    //           else {
    //             complaintsCount.assigned += parseInt(value.count);
    //             complaintsCount.total += parseInt(value.count);
    //           }
    //         }
    //         else if (value.intxnTypeDesc === "Service Request") {
    //           if (value.currStatus === "NEW") {
    //             serviceRequestCount.open += parseInt(value.count);
    //             serviceRequestCount.total += parseInt(value.count);
    //           }
    //           else if (value.currStatus === "CLOSED") {
    //             serviceRequestCount.closed += parseInt(value.count);
    //             serviceRequestCount.total += parseInt(value.count);
    //           }
    //           else if (value.currStatus === "FAILED") {
    //             serviceRequestCount.failed += parseInt(value.count);
    //             serviceRequestCount.total += parseInt(value.count);
    //           }
    //           else {
    //             serviceRequestCount.assigned += parseInt(value.count);
    //             serviceRequestCount.total += parseInt(value.count);
    //           }
    //         }
    //         else if (value.intxnTypeDesc === "Work Order") {
    //           if (value.currStatus === "NEW" || value.currStatus === "PENDING") {
    //             workOrderCount.open += parseInt(value.count);
    //             workOrderCount.total += parseInt(value.count);
    //           }
    //           else if (value.currStatus === "CLOSED") {
    //             workOrderCount.closed += parseInt(value.count);
    //             workOrderCount.total += parseInt(value.count);
    //           }
    //           else if (value.currStatus === "FAILED") {
    //             workOrderCount.failed += parseInt(value.count);
    //             workOrderCount.total += parseInt(value.count);
    //           }
    //           else {
    //             workOrderCount.assigned += parseInt(value.count);
    //             workOrderCount.total += parseInt(value.count);
    //           }
    //         }
    //       });
    //       //Fetch Chat status count 
    //       post(`${properties.CHAT_API}/count`,
    //         {agent: auth.user.firstName+auth.user.lastName, 
    //         selfDept:selfDept, 
    //         chatFromDate: startDate, 
    //         chatToDate: endDate
    //       })
    //       .then((resp) => {
    //         if (resp.data) {
    //             if (resp.status === 200) {
    //                 //console.log('resp.data:::',resp.data)
    //                 resp.data.forEach(data => {                    
    //                     //setNewCount((data.status === 'New' ? data.count : ''))    
    //                     //setAssigned((data.status === 'Assigned' ? data.count : ''))             
    //                     //setClosed((data.status === 'Closed' ? data.count : ''))
    //                     //console.log('data in loop::',data)
    //                     if(data.status === 'NEW')
    //                       //chatCount["new"] = (data.status === 'New' ? data.count : 0)
    //                       chatCount.new = data.count 
    //                     else if(data.status === 'ASSIGNED')
    //                       //chatCount["assigned"] = (data.status === 'Assigned' ? data.count : 0)
    //                       chatCount.assigned = data.count 
    //                     else if(data.status === 'CLOSED')
    //                       //chatCount["closed"] = (data.status === 'Closed' ? data.count : 0)
    //                       chatCount.closed = data.count 

    //                     //console.log('chatCount in loop::',chatCount)
    //                   });
    //                   chatCount.total = Number(chatCount.new)+Number(chatCount.assigned)+Number(chatCount.closed)
    //                   //console.log('chatCount.total:::',chatCount.total)
    //                   //console.log(' final chatCount:::',chatCount)
    //                   setChatCountHistory(chatCount)

    //             } else {
    //               console.log("Failed to create - " + resp.status);                    
    //             }
    //         } else {
    //           console.log("Uexpected error ocurred " + resp.statusCode);                
    //         }
    //       }).finally();
    //       setInteractionCountData({ serviceRequestCount, complaintsCount, workOrderCount })
    //       setChartData({
    //         broadBandGraph: resp.data.broadBandGraph,
    //         mobileGraph: resp.data.mobileGraph
    //       })
    //       setOpenByServiceType(resp.data.openByServiceType)
    //       setTopFive(resp.data.top5)
    //     }
    //   })
    //   .finally();
  }, [selfDept, dateRange])

  useEffect(() => {
    getDashBoardData();
  }, [getDashBoardData, refresh]);

  const handleAuthChange = (dashboardData) => {
    setAuth({ ...auth, dashboardData })
  }
  // const openChatBox = (value) => {
  //   let landingPage
  //   if (value === 'user-chat') {
  //     landingPage = `${process.env.REACT_APP_BASE}/user-chat`
  //   }
  //   else {
  //     landingPage = `${process.env.REACT_APP_BASE}/agent-chat`
  //   }
  //   history.push(landingPage, {
  //     customerType: value
  //   });
  // }

  return (
    <>
      <div className="row">
        <div className="col-12">

        </div>
      </div>
      <div className="row">
        <LeftTab
          refresh={refresh}
          {...interactionCountData}
          dateRange={dateRange}
          todoPageCount={todoPageCount}
          setTodoPageCount={setTodoPageCount}
          selfDept={selfDept}
        />
        <div className="col-lg-9 pl-0 dashboard-right">
          <div className="container-fluid">
            <Filter
              refresh={refresh}
              setRefresh={setRefresh}
              data={{
                selfDept: selfDept,
                dateRange,
                autoRefresh,
                timer,
                sourceName:"Dashboard"
              }}
              handlers={{
                setSelfDept: setSelfDept,
                setDateRange,
                setTodoPageCount,
                setAutoRefresh,
                setTimer,
                handleAuthChange
              }} />
            <div className="row pad-all">
              <div className="col-xl-12">
                <div className="row">
                  <ServiceAndComplaintCard refresh={refresh} data={interactionCountData.workOrderCount} type="Work Order" selfDept={selfDept} dateRange={dateRange} />
                  <ServiceAndComplaintCard refresh={refresh} data={interactionCountData.serviceRequestCount} type="Service Request" selfDept={selfDept} dateRange={dateRange} />
                  <ServiceAndComplaintCard refresh={refresh} data={interactionCountData.complaintsCount} type="Complaints" selfDept={selfDept} dateRange={dateRange} />
                  {/* <ServiceAndComplaintCard refresh={refresh} data={interactionCountData.complaintsCount} type="Complaints" selfDept={selfDept} dateRange={dateRange} /> */}
                  {
                    auth.currRoleId && (auth.chatRoleId === 2 || auth.currRoleId === 1) ? 
                    <ChatCard refresh={refresh} agent={auth.user.userId} selfDept={selfDept} data={chatCountHistory} dateRange={dateRange}/>
                    : ''
                  }
                  {/* <SlaDetail sladata={serviceRequestData}></SlaDetail>
                  <SlaDetail sladata={complaintsInquiryData}></SlaDetail> */}
                  {/* <Interactions
                    refresh={refresh}
                    data={{
                      openByServiceType
                    }}
                  /> */}
                </div>
              </div>
            </div>
            <div className="row pad-all">
              {/* <InteractionsChart
                refresh={refresh}
                data={{
                  chartData
                }}
              /> */}
              <TopFive
                refresh={refresh}
                data={{
                  topFive: topFive.sort((a, b) => Number(b.count) - Number(a.count)).slice(0, 5)
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer></Footer>
    </>
  );
}

export default Dashboard;
