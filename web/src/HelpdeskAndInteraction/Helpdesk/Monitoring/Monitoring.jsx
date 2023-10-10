import 'bootstrap-daterangepicker/daterangepicker.css';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from "react";
import DateRangePicker from 'react-bootstrap-daterangepicker';
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';

import { properties } from '../../../properties';
import { get } from '../../../common/util/restUtil';
import HelpDeskMonitoring from './HelpDeskMonitoring';
import InteractionMonitoring from './InteractionMonitoring';


const Monitoring = () => {
    // const [monitoringMenu, setMonitoringMenu] = useState([{ title: "HelpDesk", id: "HelpDesk" }, { title: "Interaction", id: "Interaction" }]);
    const monitoringMenu = [{
        title: "HelpDesk", id: "HelpDesk"
    }, {
        title: "Interaction", id: "Interaction"
    }];
    const [channel, setChannel] = useState([{ title: "ALL", id: "ALL" }]);
    const [isActive, setIsActive] = useState(monitoringMenu[0].id);
    const [selectedUser, setSelectedUser] = useState(" ");
    const [timer, setTimer] = useState(5)
    const [userList, setUserList] = useState([]);
    const autoRefreshIntervalRef = useRef();
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refresh, setRefresh] = useState(false);
    const showtab = (selectedMenuId) => { setIsActive(selectedMenuId) };
    const [dateRange, setDateRange] = useState({
        startDate: moment().subtract(1, 'day').format('DD-MM-YYYY'),
        endDate: moment().format('DD-MM-YYYY')
    });

    // onChange Channel User API Call
    const getUserList = useCallback((source = channel[0].id) => {
        
        get(`${properties.GET_MONITORING_API}/users?source=${source}`)
            .then((response) => {
                const rows = response.data
                if (rows.lenght === 0) {
                    toast.error("No Records Found")
                    return
                }
                setUserList(rows);
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }, [channel]);

    useEffect(() => {
        getUserList()
    }, [getUserList]);

    const handleDateRangeChange = (event, picker) => {
        let startDate = moment(picker.startDate).format('DD-MM-YYYY');
        let endDate = moment(picker.endDate).format('DD-MM-YYYY');
        setDateRange({ startDate: startDate, endDate: endDate });
    };

    const handleAutoRefreshChange = () => {
        unstable_batchedUpdates(() => {
            setAutoRefresh(!autoRefresh);
            setRefresh(!refresh);
        })
    };

    const setAutoRefreshInterval = useCallback(() => {
        autoRefreshIntervalRef.current = setInterval(() => {
            setRefresh(!refresh);
        }, `${timer * 60000}`)
    }, [timer, refresh]);

    useEffect(() => {
        if (autoRefresh)
            setAutoRefreshInterval();
        return () => clearInterval(autoRefreshIntervalRef.current)
    }, [setAutoRefreshInterval, autoRefresh]);

    const handleTimerChange = (e) => {
        setTimer(Number(e.target.value));
    };

    const manualRefresh = () => {
        setRefresh(!refresh);
    };

    return (
        <div className="content-page monitor-page">
            <div className="content">
                <div className="row">
                    <div className="col-12">
                        <div className="container-fluid">
                            <div className="monitor-box">

                                <div className="p-2">
                                    <fieldset className="scheduler-border">
                                        <div className="row channel-sel"  >
                                            {/* Channel DropDown */}
                                            <div className="col-md-3" style={{ maxWidth: "27%" }}>
                                                <div className="form-group">
                                                    <label htmlFor="customerid" className="col-form-label">Select Channel</label>
                                                    <select id="catalog" className="form-control" onChange={(e) => {
                                                        setChannel([{ title: e.target.value, id: e.target.value }])
                                                    }}>
                                                        <option value="ALL">All</option>
                                                        <option value="EMAIL">Email</option>
                                                        <option value="LIVECHAT">Live Chat</option>
                                                    </select>

                                                </div>
                                            </div>
                                            {/* User Drop Down */}
                                            <div className="col-md-3" style={{ maxWidth: "27%" }}>
                                                <div className="user-filter">
                                                    <label className="col-form-label">Select User</label>
                                                    <select id="catalog" className="form-control select2" onChange={(e) => {
                                                        setSelectedUser(e.target.value)
                                                    }}>
                                                        <option value=" ">Select User</option>
                                                        {userList && userList.map((e) => (
                                                            <option key={e.userId} value={e.userId}>{e.firstName}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            {/* Refresh Component*/}
                                            <div className="col-md-5">
                                                <div className="page-title-right">
                                                    <div className="form-inline">
                                                        <span className="ml-1">Auto Refresh</span>
                                                        <div className="switchToggle ml-1">
                                                            <input type="checkbox" id="autoRefresh" checked={autoRefresh} onChange={handleAutoRefreshChange} />
                                                            <label htmlFor="autoRefresh">Toggle</label>
                                                        </div>
                                                        <button className="ladda-button  btn btn-secondary btn-xs ml-1" dir="ltr" data-style="slide-left" onClick={manualRefresh}>
                                                            <span className="ladda-label"><i className="mdi mdi-rotate-right md-18">
                                                            </i>
                                                            </span>
                                                            <span className="ladda-spinner"></span>
                                                        </button>
                                                        <select className="custom-select custom-select-sm ml-1" value={timer} onChange={handleTimerChange}>
                                                            <option value="5">5 Min</option>
                                                            <option value="15">15 Min</option>
                                                            <option value="30">30 Min</option>
                                                        </select>
                                                        <DateRangePicker
                                                            initialSettings={{
                                                                startDate: moment().subtract(1, 'day').toDate(), endDate: moment(),
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
                                            </div>
                                        </div>
                                    </fieldset>
                                </div>
                            {/* Navigation Bar */}
                            <div className="tab-content pt-0">
                                <div className='row'>
                                <ul className="nav nav-tabs">
                                    {monitoringMenu.map((menu, i) => (
                                        <li key={i} className="nav-item" style={{paddingLeft:"10px"}}>
                                            <a id="monitoringList" onClick={() => showtab(menu.id)} to="#" data-toggle="tab" aria-expanded="true" className={"nav-link" + (isActive === menu.id ? ' active' : '')}>{menu.title}</a>
                                        </li>
                                    ))}
                                </ul>
                                </div>
                                {/* <div className="col-12 admin-user"> */}
                                    {(() => {
                                        switch (isActive) {
                                            case monitoringMenu[0].id:
                                                return <HelpDeskMonitoring
                                                    handler={{
                                                        selectedChannel: channel,
                                                        selectedUser: selectedUser,
                                                        selectedDateRange: dateRange,
                                                        Refresh: refresh
                                                    }} />;
                                            case monitoringMenu[1].id:
                                                return <InteractionMonitoring
                                                    handler={{
                                                        selectedChannel: channel,
                                                        selectedUser: selectedUser,
                                                        selectedDateRange: dateRange,
                                                        Refresh: refresh
                                                    }} />;
                                            default:
                                                return (<HelpDeskMonitoring
                                                    handler={{
                                                        selectedChannel: channel,
                                                        selectedUser: selectedUser,
                                                        selectedDateRange: dateRange,
                                                        Refresh: refresh
                                                    }} />);
                                        }
                                    })()}
                                {/* </div> */}
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Monitoring;