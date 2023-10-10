import React, { useCallback, useEffect, useRef, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom'

import { properties } from '../../properties';
import { get } from "../../common/util/restUtil";
import ChatDoubleCard from './ChatDoubleCard'
import ChatSingleCard from './ChatSingleCard'
import moment from 'moment'

const ChatDashboard = () => {

    const autoRefresh = true
    const autoRefreshIntervalRef = useRef();
    const [countRefresh,setCountRefresh] = useState(false)
    const [chatDashboardData,setChatDashboardData] = useState({})
    const [selectedDate,setSelectedDate] = useState(moment(new Date()).format('DD-MMM-YYYY'))

    useEffect(() => {
        
        get(`${properties.CHAT_API}/monitor${selectedDate === "" ? '':`?date=${selectedDate}`}`) 
        .then((response) => {
            if(response.data)
            {
                setChatDashboardData(response?.data[0])
            }
        })
        .catch((error) => {
            console.log(error)
        })
        .finally()
        
    },[countRefresh])
    
    const setAutoRefreshInterval = useCallback(() => {
        autoRefreshIntervalRef.current = setInterval(() => {
            unstable_batchedUpdates(() => {
                setCountRefresh(!countRefresh);
            })
        }, 30000)
     }, [countRefresh])
  
     useEffect(() => {
        if (autoRefresh)
            setAutoRefreshInterval();
        return () => clearInterval(autoRefreshIntervalRef.current)
    }, [setAutoRefreshInterval, autoRefresh]);

    const handleDateChange = (e) => {
        unstable_batchedUpdates(() => {
            setSelectedDate(e.target.value)
            setCountRefresh(!countRefresh);
        })
    }

    return (
        <div className="row monitor-page">
            <div className="col-lg-12 pl-0">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-md-4"></div>

                    </div>
                    <div className="p-0" data-select2-id="8">
                        <fieldset className="scheduler-border" data-select2-id="7">
                            <div className="row channel-sel">
                                <div className="col-md-3">
                                    <div className="form-group">
                                        <label htmlFor="customerid" className="col-form-label"><h5>Select Channel</h5> </label>
                                        <select id="catalog" className="form-control" onchange="checkcatalog($(this))">
                                            <option value="all-note">ALL</option>
                                            <option value="email-note">Email</option>
                                        </select>
                                       
                                    </div>
                                </div>
                                <div className="col-md-4" data-select2-id="6">
                                    <div className="user-filter" data-select2-id="5">
                                        <form data-select2-id="4">
                                            <div className='form-group'>
                                            <label className="col-form-label"><h5>Select User</h5></label>
                                            <select id="catalog" className="form-control select2 select2-hidden-accessible" onchange="checkcatalog($(this))" date-select2-id="catalog" tabIndex="-1"aria-hidden="true">
                                                <option data-select2-id="2">select</option>
                                                <option value="email-note-user" data-select2-id="13">ilango rajashekaran</option>
                                                <option data-select2-id="14">srinivasan</option>
                                                <option data-select2-id="15">paddy</option>
                                            </select>
                                            </div>
                                            <span className="select2 select2-selection-container--default select2-container--below" dir="ltr" data-select2-id="1">
                                                <span className="selection">
                                                    <span className="select2-selection select2-selection--single" role="combobox" aria-haspopup="true" aria-expanded="false" tabIndex="0" aria-disable="false" aria-labelledby="select2-catalog-container">
                                                        <span className="select2-selection__rendered" id="select2-catalog-container" role="textbox" aria-readonly="true" title="select">select</span>
                                                        <span className="select2-selection__arrow" role="presentation">
                                                            <b role="presentation"></b>
                                                        </span>
                                                    </span>
                                                </span>
                                                <span className="dropdown-wrapper" aria-hidden="true"></span>
                                            </span>
                                        </form>
                                    </div>
                                </div>
                                {/* <div className="col-md-5">
                                    <div className="page-title-right">
                                        <form className="form-inline">
                                            <span className="m1-1">Auto Refresh</span>
                                            <div className="SwitchToggle ml-l">
                                                <input type="checkbox" id="switch1" checked>
                                                    <label htmlFor="switch">
                                                    </label>
                                                </input>
                                            </div>
                                            <button className="ladda-button  btn btn-secondary btn-xs ml-l" dir="ltr">
                                                <span className="ladda-label">
                                                    <i className="mdi mdi-rotate-right md-18"></i>
                                                </span>
                                                <span className="ladda-spinner"></span>
                                            </button>
                                            <select className="custom-select custom-select-sm ml-l">
                                                <option selected>set</option>
                                                <option value="1">5 Min</option>
                                                <option value="1">15 Min</option>
                                                <option value="1">30 Min</option>
                                                <option value="1">off</option>
                                            </select>
                                            <div>
                                                <input type="text" id="range-datepicker" className="input-sm form-control ml-l flatpickr-input" placeholder="Date Range" readonly="readonly"></input>
                                            </div>
                                        </form>
                                    </div>
                                </div> */}
                            </div>
                        </fieldset>
                    </div>
                    
                    <div className="tab-content pt-0">
                    <section className="triangle col-12 pb-0 ml-1 mt-3">
                    <div className="row">
                        <div className="col-10">
                            <div className="page-title-box">
                                <h4 className="page-title">Email</h4>
                            </div>
                        </div>
                        { <div className="col-2 mt-1">
                            <div className="form-group">
                                <input type="date" max={moment(new Date()).format('YYYY-MM-DD')} className="form-control" value={selectedDate} onChange={(e) => handleDateChange(e)}/>
                            </div>
                        </div> }
                    </div>
                    </section>
                    <br></br>
                    <div className="row">
                         <div className="col-xl-12 monitor-sec"> 
                            <div className="row">
                             <div className="col-md-4">
                              <div className="card chat-mon que-sec logged-sec p-2" >
                              <h5 className="header-title">Average Response Time</h5>
                                  <div className="border-top p-1 res-time"></div>
                                  <div className="row">
                                      <div className="col-md-12">
                                          <div className="row">
                                              <div className="col-md-10">
                                            <div className="prg-left">Average Speed Of Answer</div>
                                            </div>
                                            <div className="col-md-2">
                                            <div className="prg-right">0m 0s</div>
                                            </div>
                                          </div>
                                        <div className="progress clearfix">
                                        <div className="progress-bar"></div>
                                        </div>
                                      </div>
                                 </div>
                                 <div className="row">
                                      <div className="col-md-12">
                                          <div className="row">
                                              <div className="col-md-10">
                                            <div className="prg-left">Average Holding Time</div>
                                            </div>
                                            <div className="col-md-2">
                                            <div className="prg-right">0m 0s</div>
                                            </div>
                                          </div>
                                        <div className="progress clearfix">
                                        <div className="progress-bar"></div>
                                        </div>
                                      </div>
                                 </div>
                                 <div className="row">
                                      <div className="col-md-12">
                                          <div className="row">
                                              <div className="col-md-10">
                                            <div className="prg-left">Average Wait Time</div>
                                            </div>
                                            <div className="col-md-2">
                                            <div className="prg-right">0m 0s</div>
                                            </div>
                                          </div>
                                        <div className="progress clearfix">
                                        <div className="progress-bar"></div>
                                        </div>
                                      </div>
                                 </div>
                                 
                               {/* <ChatSingleCard
                               data={{
                              header: "Average Response Time",
                              }}
                             /> */}
                            </div>
                        </div>
                                {<div className="col-md-8">
                                    <div className="card chat-mon que-sec logged-sec">
                                        <div className="row">                                            
                                            <div className="col-md-5">
                                                <ChatSingleCard
                                                    data={{
                                                        header: "Queue",
                                                        icon: "fa fa-indent",
                                                        count: chatDashboardData && chatDashboardData?.queue || 0,
                                                        footer: "Total count"
                                                    }}
                                                />
                                            </div>
                                            <div className="col-md-5">
                                                <ChatSingleCard
                                                    data={{
                                                        header: "Currently Served",
                                                        icon: "fas fa-comment-dots",
                                                        count: chatDashboardData && chatDashboardData?.currentlyServed || 0,
                                                        footer: "Total count"
                                                    }}
                                                />
                                            </div>
                                    </div>
                                </div>
                                </div>}
                        </div>

                                {<div className="row">
                                <div className="col-md-4 p-2">
                                    <ChatDoubleCard
                                        data={{
                                            header: "Wait Time",
                                            icon: "fas fa-clock",
                                            count1: chatDashboardData && chatDashboardData?.waitAverage && (chatDashboardData?.waitAverage?.minutes || 0) + "m " + (chatDashboardData?.waitAverage?.seconds || 0)  + "s" || "0m 0s",
                                            count2: chatDashboardData && chatDashboardData?.waitLongest && (chatDashboardData?.waitLongest?.minutes || 0) + "m " + (chatDashboardData?.waitLongest?.seconds || 0) + "s" || "0m 0s",
                                            footer1: "Average",
                                            footer2: "Longest"
                                        }}
                                    />
                                </div>
                              
                                <div className="col-md-4 p-2">
                                    <ChatDoubleCard
                                        data={{
                                            header: "SLA",
                                            icon: "fas fa-stopwatch",   
                                            count1: chatDashboardData && chatDashboardData?.chatDurationAverage && (chatDashboardData?.chatDurationAverage?.minutes || 0) + "m " + (chatDashboardData?.chatDurationAverage?.seconds || 0) + "s" || "0m 0s",
                                            count2: chatDashboardData && chatDashboardData?.chatDurationLongest && (chatDashboardData?.chatDurationLongest?.minutes || 0) + "m " + (chatDashboardData?.chatDurationLongest?.seconds || 0) + "s" || "0m 0s",
                                            footer1: "SLA %",
                                            footer2: "SLA After Target %"
                                        }}
                                    />
                                </div>
                                { <div className="col-md-4 p-2">
                                    <div className="card chat-mon que-sec logged-sec">
                                                <ChatSingleCard
                                                    data={{
                                                        header: "First Resolution time",
                                                        icon: "fas fa-sign-in-alt",
                                                        count: chatDashboardData && chatDashboardData?.currentlyServed || 0,
                                                        
                                                    }}
                                                />    
                                    </div>
                                </div> }
                            </div> }
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatDashboard