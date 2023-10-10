import React, { useState, useCallback, useEffect, useContext } from "react";
import moment from 'moment';
import DateRangePicker from 'react-bootstrap-daterangepicker';

import { properties } from "../properties";
import { get, post } from "../common/util/restUtil";
import { AppContext } from "../AppContext";
import Snippet from "./components/snippet";
import VerticalBarChart from "./components/VerticalBarChart";
import PieChart from "./components/PieChart";
import HorizontalBarChart from "./components/HorizontalBarChart";
import { unstable_batchedUpdates } from "react-dom";

const CustomerDashboard = () => {
  let { auth, setAuth } = useContext(AppContext);
  const [refresh, setRefresh] = useState(auth && auth.dashboardData && auth.dashboardData.refresh);
  const [dateRange, setDateRange] = useState({
    startDate: moment().subtract(90, 'day').format('DD-MM-YYYY'),
    endDate: moment().format('DD-MM-YYYY')
  });
  const [hideChart, setHideChart] = useState({
    openTicket: "show",
    closedTicket: "show",
    Queue: "show",
    adandonedTicket: "show",
    currentlyServed: "show",
    averageWaitTime: "show",
    averageResponseTime: "show",
    sla: "show",
    ratedCall: "show",
    unratesCall: "show",
    firstContactResoluation: "show",
    AbandonedRate: "show",
    ageingHelpdesk: "show",
    loggedInAgent: "show",
    chatPerAgent: "show",
    attendedChat: "show",
  })
  const [openTicketCount, setOpenTicketCount] = useState()
  const [closedTicketCount, setClosedTickeetCount] = useState()
  const [queue, setQueue] = useState()
  const [adandonedTicket, setAdandonedTicket] = useState()
  const [currentlyServed, setCurrentlyServed] = useState()
  const [averageWaitTime, setAverageWaitTime] = useState()
  const [averageResponseTime, setAverageResponseTime] = useState()
  const [sla, setSla] = useState()
  const [ratedCallCount, setRatedCallCount] = useState()
  const [unratesCallCount, setUnRatedCallCount] = useState()
  const [firstContactResolution, setFirstContactResolution] = useState()
  const [AbandonedRate, setAbandonedRate] = useState()
  const [ageingHelpdesk, setAgeingHelpdesk] = useState()
  const [loggedInAgent, setLoggedInAgent] = useState()
  const [chartPerAgent, setChartPerAgent] = useState()
  const [attendedChat, setAttendedChat] = useState()
  const [agentLookUp, setAgentLookUp] = useState()


  const handleDateRangeChange = (event, picker) => {
    let startDate = moment(picker.startDate).format('DD-MM-YYYY');
    let endDate = moment(picker.endDate).format('DD-MM-YYYY');
    const dateDifference = moment(endDate, 'DD-MM-YYYY').diff(moment(startDate, 'DD-MM-YYYY'), 'days')
    if (dateDifference > 90) {
      setHideChart({
        ...hideChart, openOpportunities: "hide", chrunRate: "hide", targetVsArchievement: "hide",
        wonvsLost: "hide", ZeroCross: "hide", uniqueSale: "hide", customerChrun: "hide", netPromoterScrore: "hide"
      })
    }
    else {
      setHideChart({
        ...hideChart
      })

    }
    setDateRange({ startDate: startDate, endDate: endDate });
  };

  const getDashBoardData = useCallback(() => {
    //  
    let startDate = dateRange.startDate.split("-").reverse().join("-");
    let endDate = dateRange.endDate.split("-").reverse().join("-");

    //getSnipped Details
    
    post(properties.DASHBOARD_API + "/customerDashboard", { startDate: startDate, endDate: endDate }).then((resp) => {
      if (resp.data) {
        const data = resp.data[0]
        unstable_batchedUpdates(() => {
          setOpenTicketCount(data.openedtickets)
          setClosedTickeetCount(data.closedtickets)
          setQueue(data.queue)
          setAdandonedTicket(data.abandonedtickets)
          setCurrentlyServed(data.currentlyserved)
          setAverageWaitTime(data.averagewaittime)
          setAverageResponseTime(data.averageresponsetime)
        })
      }
    }).catch((error) => {
      console.log(error)
  }).finally()


    //First Contact Resolution
    
    let fcrXAxisData = []
    let fcrbarChartData = []
    let fcrLineChartdata = []
    post(properties.DASHBOARD_API + "/customerFcrchart", { startDate: startDate, endDate: endDate }).then((resp) => {
      if (resp.data) {
        for (let e of resp.data.rows) {
          fcrXAxisData.push(e.month)
          fcrbarChartData.push(e.count)
        }
        for (let d of fcrXAxisData) {
          const checksales = (obj) => {
            if (obj.month === d) {
              return true
            } else { return false }
          };

          if (resp.data.target.some(checksales)) {
            const target = resp.data.target.filter(c => c.month = d)
            fcrLineChartdata.push(target[0].target)
          }
          else {
            fcrLineChartdata.push(0)
          }
        }
        setFirstContactResolution({
          fcrPercentage: "0",
          fcrXAxisData,
          seriesData: {
            fcrbarChartData,
            fcrLineChartdata
          }
        })
      }
    }).catch((error) => {
      console.log(error)
  }).finally()

    //AbandonedRate
    //
    let AbandonedRatePercentage = ""
    let AbandonedRateData = []
    // post(properties.DASHBOARD_API + "",{ startDate: startDate, endDate: endDate }).then((resp)=>{
    //     if(resp.data){

    //     }
    // }).finally()

    //Ageing Helpdesk Ticket
    
    let ticketCount = {}
    let ageingTicketXaxisData = []
    let ageingTicketSeriesData = []
    post(properties.DASHBOARD_API + "/customerDashboardAgingChart",{ startDate: startDate, endDate: endDate }).then((resp)=>{
        if(resp.data){
          for (let e of resp.data.ageingTicketDays){
            if(e.days === "90 DAYS"){
              ticketCount= {
                ...ticketCount, NinetyDays:e.count
              }
            }
            else if(e.days === "60 DAYS"){
              ticketCount= {
                ...ticketCount, sixtyDays:e.count
              }
            }
            else if(e.days === "30 DAYS"){
              ticketCount= {
                ...ticketCount, thrityDays:e.count
              }
            }
          }

          for (let d of resp.data.ageingTicketChart){
            ageingTicketXaxisData.push(d.source)
            ageingTicketSeriesData.push(d.count)
          }


          setAgeingHelpdesk({
            ticketCount,
            ageingTicketXaxisData,
            ageingTicketSeriesData
          })

        }
    }).catch((error) => {
      console.log(error)
  }).finally()

    //Logged In Agent
    //
    let agentCount = ""
    let agentSeriesData = []
    // post(properties.DASHBOARD_API+ "", { startDate: startDate, endDate: endDate }).then((resp)=>{
    //     if(resp.data){

    //     }
    // }).finally()

    //Chart per Agent
    
    let chatDetails = {}
    let chatXaxisData = []
    let chatbarChartData = []
    let chatlineChartData = []
    post(properties.DASHBOARD_API+"/customerChatPerAgent",{ startDate: startDate, endDate: endDate }).then((resp)=>{
        if(resp.data){
          for(let e of resp.data.rows){
            chatbarChartData.push(e.count)
            chatXaxisData.push(e.description)
          }
        }
        setChartPerAgent({
          chatDetails,
          seriesData: {
            chatXaxisData,
            chatbarChartData,
            chatlineChartData
          }
        })
    }).catch((error) => {
      console.log(error)
  }).finally()

    //Attended Chart
    let attendedChatCount = 0
    let receivedChatData = []
    let attendedChatData = []
    let UnattendedChatData = []
    let attendedChatXaxisData = []
    post(properties.DASHBOARD_API+"/customerDashboardAttendedChatChart",{ startDate: startDate, endDate: endDate }).then((resp)=>{
        if(resp.data){
          for(let t of resp.data){
            attendedChatXaxisData.push(t.source)
            receivedChatData.push(t.received)
            attendedChatData.push(t.attended)
            UnattendedChatData.push(t.unAttended)
            attendedChatCount= Number(attendedChatCount)+Number(t.attended)
          }
        }
        setAttendedChat({
          attendedChatCount,
          attendedChatXaxisData,
          seriesData: {
            receivedChatData,
            attendedChatData,
            UnattendedChatData
          }
        })
    }).catch((error) => {
      console.log(error)
  }).finally()

    unstable_batchedUpdates(() => {

      setAbandonedRate({
        AbandonedRatePercentage,
        AbandonedRateData
      })
     
      setLoggedInAgent({
        agentCount,
        agentSeriesData
      })
    })
  }, [dateRange])

  useEffect(() => {
    getDashBoardData();
  }, [getDashBoardData, refresh]);

  //sampleData
  const pieData = [
    { value: 29, name: 'March' },
    { value: 23, name: 'April' },
    { value: 18, name: 'May' },

  ]

  return (
    <>
      <div>
        <div className="content-page pr-0">
          <div className="content">

            <div className="row">
              <div className="row col-12">
                <div className="col">
                  <h5 className="page-title pt-0 pl-2">Customer Dashboard</h5>
                </div>
                <div className="col-3 pt-2">
                  <div className="form-group">
                    Last updated :<span className="text-dark"> 01 Jun 2022:14.30</span></div>
                </div>
                <div className="col-4 pt-1">
                  <div className="form-group form-inline">
                    Date Range
                    <DateRangePicker
                      initialSettings={{
                        startDate: moment().subtract(90, 'day').toDate(), endDate: moment(),
                        linkedCalendars: true, showCustomRangeLabel: true,
                        showDropdowns: true, alwaysShowCalendars: true,
                        locale: { format: "DD/MM/YYYY" },
                        maxDate: moment(),
                        opens: 'left'
                      }}
                      onApply={handleDateRangeChange}
                    >
                      <input className='form-control border-0 ml-1 pl-3 cursor-pointer' />
                    </DateRangePicker>
                  </div>
                </div>

                <div className="col pt-2">
                  MIS <i className="mdi mdi-chevron-right"></i> Customer dashboard
                </div>

              </div>
            </div>

            <div className="row p-0">
              <div className="tab-content p-0 col-12">
                <div className="tab-pane show active" id="home1">
                  <header className="page-header-dark bg-gradient-primary-to-secondary3 pb-10 mheight">
                    <div className="container-xl px-4">
                      <div className="page-header-content pt-4">
                        <div className="row align-items-center justify-content-between">
                          <div className="col-auto mt-1">
                            <h2 className="page-header-title text-white">
                              Customer Dashboard
                            </h2>

                          </div>
                        </div>
                      </div>
                    </div>
                  </header>
                  <div className="pt-2">
                    <div className="row my-n10 px-3">
                      {hideChart.openTicket === "show" && <Snippet data={{
                        count: openTicketCount || 0,
                        title: "Open Ticket Count",
                        viewDetails: true,
                        classDetails: "col-2 mb-4 wow slideInLeft",
                        type: "TICKETCOUNT"

                      }}
                      />}
                      {hideChart.closedTicket === "show" && <Snippet data={{
                        count: closedTicketCount || 0,
                        title: "Closed Ticket Count",
                        viewDetails: true,
                        classDetails: "col-2 mb-4 wow slideInLeft",
                        type: "CLOSEDTICKETCOUNT"

                      }}
                      />}
                      {hideChart.Queue === "show" && <Snippet data={{
                        count: queue || 0,
                        title: "Queue",
                        viewDetails: false,
                        classDetails: "col-2 mb-4 wow slideInLeft"

                      }}
                      />} {hideChart.adandonedTicket === "show" && <Snippet data={{
                        count: adandonedTicket || 0,
                        title: "Abandoned Ticket",
                        viewDetails: true,
                        classDetails: "col-2 mb-4 wow slideInLeft",
                        type: "ADANDONEDTICKET"

                      }}
                      />} {hideChart.currentlyServed === "show" && <Snippet data={{
                        count: currentlyServed || 0,
                        title: "Currently Served",
                        viewDetails: true,
                        classDetails: "col-2 mb-4 wow slideInLeft",
                        type: "CURRENTLYSERVED"

                      }}
                      />} {hideChart.averageWaitTime === "show" && <Snippet data={{
                        count: averageWaitTime + " Min" || 0 + " Min",
                        title: "Average Wait Time",
                        viewDetails: true,
                        classDetails: "col-2 mb-4 wow slideInLeft",
                        type: "AVERAGEWAITTIME"
                      }}
                      />}
                    </div>
                  </div>
                  <div className="pt-5">
                    <div className="row px-3">
                      {hideChart.averageResponseTime === "show" && <Snippet data={{
                        count: averageResponseTime + " Min" || 0 + " Min",
                        title: "Average Response Time",
                        viewDetails: true,
                        classDetails: "col-3 mb-2",
                        type: "AVERAGERESPONSETIME"
                      }}
                      />}
                      {hideChart.sla === "show" && <Snippet data={{
                        count: sla || 0 + " %",
                        title: "SLA",
                        viewDetails: false,
                        classDetails: "col-3 mb-2"
                      }}
                      />}
                      {hideChart.ratedCall === "show" && <Snippet data={{
                        count: ratedCallCount || 0,
                        title: "Rated Call Count",
                        viewDetails: true,
                        classDetails: "col-3 mb-2",
                        type: "RATEDCOUNT"
                      }}
                      />}
                      {hideChart.unratesCall === "show" && <Snippet data={{
                        count: unratesCallCount || 0,
                        title: "Unrated Call Count",
                        viewDetails: true,
                        classDetails: "col-3 mb-2",
                        type: "UNRATEDCOUNT"
                      }}
                      />}
                    </div>
                  </div>
                  <div className="row ">
                  </div>
                  <div className="mt-1">
                    <div className="col-12">
                      <div className="search-result-box  p-0">
                        <div className="autoheight p-1">
                          <h4 className="pl-2">Key Metrics</h4>
                          <div className="row pl-2">
                            {hideChart.firstContactResoluation === "show" && <div className="col-6 pt-2" style={{ "minHeight": "340px" }}>
                              <div className="card autoheight wow fadeInUp">
                                <div className="card-body text-center">
                                  <h5 className="header-title mb-2 text-center">First Contact Resolution (FCR)</h5>
                                  <div className="col-12 text-center pt-1">
                                    {firstContactResolution && <> <h2 className="text-center card-value">{firstContactResolution.fcrPercentage || 0}%</h2>
                                     <VerticalBarChart
                                        data={
                                          {
                                            height: "340px",
                                            xAxisData: [
                                              {
                                                type: 'category',
                                                data: firstContactResolution.fcrXAxisData || [],
                                                axisPointer: {
                                                  type: 'shadow'
                                                }
                                              }
                                            ],
                                            yAxisData: [
                                              {
                                                type: 'value',
                                                name: '',
                                                min: 0,
                                                max: 100,
                                                interval: 50,
                                                axisLabel: {
                                                  formatter: ''
                                                }
                                              },
                                              {
                                                type: 'value',
                                                name: 'Count',
                                                min: 0,
                                                max: 100,
                                                interval: 50,
                                                axisLabel: {
                                                  formatter: '{value}% '
                                                }
                                              }
                                            ],
                                            seriesData: [
                                              {
                                                name: 'FCR ',
                                                type: 'bar',
                                                tooltip: {
                                                  valueFormatter: function (value) {
                                                    return value + '% Count ';
                                                  }
                                                },
                                                data: firstContactResolution.seriesData.fcrbarChartData || []
                                              },

                                              {
                                                name: 'Target',
                                                type: 'line',
                                                yAxisIndex: 1,
                                                tooltip: {
                                                  valueFormatter: function (value) {
                                                    return value + ' ';
                                                  }
                                                },
                                                data: firstContactResolution.seriesData.fcrLineChartdata || []
                                              }

                                            ],
                                            toolbox: {}
                                          }
                                        }
                                      /></>}
                                  </div>
                                </div>
                              </div>
                            </div>}
                            {hideChart.AbandonedRate === "show" && <div className="col-6 pt-2" style={{ "minHeight": "340px" }}>
                              <div className="card autoheight">
                                <div className="card-body text-center">
                                  <h5 className="header-title mb-2 text-center">Abandoned Rate</h5>
                                  <div className="col-12 text-center pt-1">
                                    {<>  <h2 className="text-center card-value">{AbandonedRate?.AbandonedRatePercentage || 0}%</h2>
                                      <div>
                                        <PieChart
                                          data={{
                                            legend: {
                                              left: 'center',
                                              top: 'bottom'
                                            },
                                            seriesData: [
                                              {
                                                name: 'Source Channel',
                                                type: 'pie',
                                                radius: [30, 110],
                                                roseType: 'area',
                                                data: AbandonedRate?.AbandonedRateData || []
                                              }
                                            ]
                                          }}
                                        />
                                      </div></>}
                                  </div>
                                </div>
                              </div>
                            </div>}

                            {hideChart.ageingHelpdesk === "show" && <div className="col-6 pt-2" style={{ "minHeight": "340px" }}>
                              <div className="card autoheight">
                                <div className="card-body">
                                  <h5 className="header-title text-center">Action Performed At Helpdesk Ticket</h5>
                                  {ageingHelpdesk && <> <div className="col-12 text-center pt-1">
                                    <div className="row">
                                      <div className="col">30 Days<h2 className="text-center card-value">{ageingHelpdesk.ticketCount.thrityDays || 0}
                                      </h2>
                                      </div>
                                      <div className="col">60 Days<h2 className="text-center card-value">{ageingHelpdesk.ticketCount.sixtyDays || 0}
                                      </h2>
                                      </div>
                                      <div className="col">90 Days<h2 className="text-center card-value">{ageingHelpdesk.ticketCount.NinetyDays || 0}
                                      </h2>
                                      </div>
                                    </div>
                                  </div>
                                    <VerticalBarChart
                                      data={
                                        {
                                          height: "340px",
                                          xAxisData: [
                                            {
                                              type: 'category',
                                              data: ageingHelpdesk.ageingTicketXaxisData || []
                                            }
                                          ],
                                          yAxisData: [
                                            {
                                              type: 'value'
                                            }
                                          ],
                                          seriesData: [
                                            {
                                              name: 'Action Performed At',
                                              type: 'bar',
                                              label: {
                                                show: true
                                              },
                                              data: ageingHelpdesk.ageingTicketSeriesData || []
                                            }
                                          ],
                                          toolbox: {}
                                        }}
                                    /> </>}
                                </div>
                              </div>
                            </div>}

                            {hideChart.loggedInAgent === "show" && <div className="col-6 pt-2" style={{ "minHeight": "340px" }}>
                              <div className="card" style={{ "height": "430px" }}>
                                <div className="card-body text-center">
                                  <h5 className="header-title mb-2 text-left">Logged In Agent</h5>
                                  <p className="text-center">Today</p>
                                  {loggedInAgent && <><h2 className="text-center card-value">{loggedInAgent.agentCount || 0}</h2>
                                    <div className="col-12 text-center pt-2">
                                      <PieChart
                                        data={{
                                          // legend:{
                                          //     orient: 'horizontal',
                                          //     data: ['Email', 'Live Chat', 'Social Media']
                                          // },
                                          legend: {
                                            left: 'center',
                                            top: 'bottom'
                                          },
                                          seriesData: [
                                            {
                                              name: 'Points',
                                              type: 'pie',
                                              radius: ['50%', '70%'],
                                              avoidLabelOverlap: false,
                                              label: {
                                                show: false,
                                                position: 'center'
                                              },
                                              emphasis: {
                                                label: {
                                                  show: true,
                                                  fontSize: '30',
                                                  fontWeight: 'bold'
                                                }
                                              },
                                              labelLine: {
                                                show: true
                                              },
                                              data: loggedInAgent.agentSeriesData || []
                                            }
                                          ]
                                        }}
                                      />
                                    </div></>}
                                </div>
                              </div>
                            </div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {hideChart.chatPerAgent === "show" && <div className="col-12 pt-2">
                    <div className="card autoheight">
                      <div className="card-body text-center">

                        <h5 className="header-title mb-2 text-center">Chat Per Agent
                        </h5>
                        <div className="col-12 text-center pt-2 px-2">

                          {chartPerAgent && <>  <div className="row bg-light p-2">
                            <div className="col text-left"><label htmlFor="customerTitle" className="col-form-label">Select Agent</label>
                              <select id="country"
                                className="form-control">
                                <option>Select Agent</option>
                                <option selected="">Agent 1</option>
                                <option>Agent 2</option>
                                <option>Agent 3</option>
                              </select></div>
                            <div className="col">Hours Logged in<h2 className="text-center card-value">{chartPerAgent.chatDetails.hoursLogged || 0} Hrs</h2>
                            </div>
                            <div className="col">Last Serves<h2 className="text-center card-value">{chartPerAgent.chatDetails.lastServes || 0} Min Ago</h2>
                            </div>
                            <div className="col">Chat Served<h2 className="text-center card-value">{chartPerAgent.chatDetails.chartServed || 0}</h2>
                            </div>
                            <div className="col">Satisfied<h2 className="text-center card-value">{chartPerAgent.chatDetails.satisfied || 0} %</h2>
                            </div>
                          </div>

                            <div className="pt-2">
                              <VerticalBarChart
                                data={
                                  {
                                    height: "340px",
                                    xAxisData: [
                                      {
                                        type: 'category',
                                        data: chartPerAgent.seriesData.chatXaxisData || [],
                                        axisPointer: {
                                          type: 'shadow'
                                        }
                                      }
                                    ],
                                    yAxisData: [
                                      {
                                        type: 'value',
                                        name: '',
                                        min: 0,
                                        max: 300,
                                        interval: 50,
                                        axisLabel: {
                                          formatter: ''
                                        }
                                      },
                                      {
                                        type: 'value',
                                        name: 'Chats',
                                        min: 0,
                                        max: 300,
                                        interval: 50,
                                        axisLabel: {
                                          formatter: '{value} '
                                        }
                                      }
                                    ],
                                    seriesData: [
                                      {
                                        name: 'Chats',
                                        type: 'bar',
                                        tooltip: {
                                          valueFormatter: function (value) {
                                            return value + ' Chats';
                                          }
                                        },
                                        data: chartPerAgent.seriesData.chatbarChartData || []
                                      },

                                      {
                                        name: 'Satisfaction',
                                        type: 'line',
                                        yAxisIndex: 1,
                                        tooltip: {
                                          valueFormatter: function (value) {
                                            return value + ' ';
                                          }
                                        },
                                        data: chartPerAgent.seriesData.chatlineChartData || []
                                      }
                                    ],
                                    toolbox: {}
                                  }}
                              />
                            </div></>}
                        </div>
                      </div>
                    </div>
                  </div>}
                  {hideChart.attendedChat === "show" && <div className="col-12 px-1 pt-2">
                    <div className="card autoheight">
                      <div className="card-body" dir="ltr">
                        <h5 className="header-title mb-2 text-center">Attended Chat</h5>
                        <div className="col-12 text-center">
                          {attendedChat && <> <h2 className="text-center card-value">{attendedChat.attendedChatCount || 0}</h2>
                           {console.log('attendedChat', attendedChat)}
                            <HorizontalBarChart
                              data={{
                                yAxisData: [
                                  {
                                    type: 'category',
                                    axisTick: {
                                      show: false
                                    },
                                    data: attendedChat.attendedChatXaxisData || []
                                  }
                                ],
                                seriesData: [
                                  {
                                    name: 'Received',
                                    type: 'bar',
                                    label: {
                                      show: true,
                                      position: 'inside'
                                    },
                                    emphasis: {
                                      focus: 'series'
                                    },
                                    data: attendedChat.seriesData.receivedChatData || []
                                  },
                                  {
                                    name: 'Attended',
                                    type: 'bar',
                                    stack: 'Total',
                                    label: {
                                      show: true
                                    },
                                    emphasis: {
                                      focus: 'series'
                                    },
                                    data: attendedChat.seriesData.attendedChatData || []
                                  },
                                  {
                                    name: 'Unattended',
                                    type: 'bar',
                                    stack: 'Total',
                                    label: {
                                      show: true,
                                      position: 'left'
                                    },
                                    emphasis: {
                                      focus: 'series'
                                    },
                                    data: attendedChat.seriesData.UnattendedChatData || []
                                  }
                                ],
                                tooltip: {
                                  trigger: 'axis',
                                  axisPointer: {
                                    type: 'shadow'
                                  }
                                },
                                xAxisData: [
                                  {
                                    type: 'value'
                                  }
                                ],
                                legend: {
                                  data: ['Received', 'Unattended', 'Attended']
                                }
                              }}

                            /></>}
                        </div>
                      </div>
                    </div>
                  </div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )

}
export default CustomerDashboard