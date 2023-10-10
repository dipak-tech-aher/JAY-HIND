import chroma from 'chroma-js';
import { isEmpty, sortBy } from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { statusConstantCode } from '../../AppConstants';
import DynamicTable from '../../common/table/DynamicTable';
import { get, post } from "../../common/util/restUtil";
import { properties } from '../../properties';
import { LoggedInAgentModel } from './ChatAgentPopView';
import ChatDetailsModel from './ChatDetailsModel';
import HelpdeskDetailsModel from './HelpdeskDetailsModel';

const Dashboard = (props) => {

    const autoRefresh = true
    const autoRefreshIntervalRef = useRef();
    const [countRefresh, setCountRefresh] = useState(false)
    const hasExternalSearch = useRef(false);
    const isFirstRender = useRef(true);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(true)
    const isTableFirstRender = useRef(true);

    const [rowCount, setRowCount] = useState()
    const [agentChatSummaryData, setAgentChatSummaryData] = useState()

    const [whatsAppData, setWhatsAppData] = useState()
    const [fbData, setFbData] = useState()
    const [instaData, setInstaData] = useState()
    const [mobileData, setMobileData] = useState()
    const [websiteData, setWebsiteData] = useState()

    const [totalCount, setTotalCount] = useState()
    const [totalQueueData, setTotalQueueData] = useState(0)
    const [totalServingata, setTotalServingata] = useState(0)
    const [totalServedData, setTotalServedData] = useState(0)
    const [totalAbandonedData, setTotalAbandonedData] = useState(0)

    const [currentlyLoggedData, setCurrentlyLoggedData] = useState(0)
    const [chatDurationData, setChatDurationData] = useState()
    const [chatQueueWaitData, setChatQueueWaitData] = useState()
    // const [chatQueueLongData, setChatQueueLongData] = useState()
    // const [chatDurationAvgData, setChatDurationAvgData] = useState()
    // const [chatDurationLongData, setChatDurationLongData] = useState()

    const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'))
    const [currentDateTime, setCurrentDateTime] = useState(moment())
    // const [showChatPerAgentModal, setShowChatPerAgentModal] = useState(false)
    // const [chatPerAgentData, setChatPerAgentData] = useState({})
    const [showLoggedInAgentModal, setShowLoggedInAgentModal] = useState(false)
    const [loggedInAgentData, setLoggedInAgentData] = useState({})

    const [emailData, setEmailData] = useState()
    const [webportalData, setWebportalData] = useState()
    const [helpdeskTotalCount, setHelpdeskTotalCount] = useState()
    const [helpdeskTotalQueueData, setHelpdeskTotalQueueData] = useState()
    const [helpdeskTotalServingata, setHelpdeskTotalServingata] = useState()
    const [helpdeskTotalServedData, setHelpdeskTotalServedData] = useState()

    const [helpdeskQueueWaitData, setHelpdeskQueueWaitData] = useState()
    // const [helpdeskQueueAvgData, setHelpdeskQueueAvgData] = useState()
    // const [helpdeskQueueLongData, setHelpdeskQueueLongData] = useState()

    const [helpdeskRowCount, setHelpdeskRowCount] = useState()
    const [helpdeskSummaryData, setHelpdeskSummaryData] = useState()
    const defaultColor = '#063970'

    const [liveChatSource, setLiveChatSource] = useState([])
    const [selectedChatSource, setSelectedChatSource] = useState([{ label: 'ALL', value: 'ALL', color: defaultColor }])
    const [pageRefreshTime, setPageRefreshTime] = useState(30);
    const [isChecked, setIsChecked] = useState(false);
    const [isPageRefresh, setIsPageRefresh] = useState(false)
    const [lastDataRefreshTime, setLastDataRefreshTime] = useState(moment().format('DD-MM-YYYY HH:mm:ss'))
    const [chatSource, setChatSource] = useState(['ALL'])
    const [ChatDetailsOpen, setChatDetailsOpen] = useState(false)
    const [chatDetails, setChatDetails] = useState({ createdAt: selectedDate })
    const [helpdeskDetailsOpen, setHelpdeskDetailsOpen] = useState(false)
    const [helpdeskDetails, setHelpdeskDetails] = useState({ createdAt: selectedDate })
    const [availableChatSource, setAvailableChatSource] = useState([])
    const [availableHelpdeskSource, setAvailableHelpdeskSource] = useState([])

    useEffect(() => {
        isTableFirstRender.current = true;
        getLivechatSource()
        unstable_batchedUpdates(() => {
            setFilters([])
            setCurrentPage((currentPage) => {
                if (currentPage === 0) {
                    return '0'
                }
                return 0
            });
        })

    }, [])

    const getLivechatSource = useCallback(() => {
        get(`${properties.MASTER_API}/lookup?searchParam=code_type&valueParam=TICKET_CHANNEL,HELPDESK_SOURCE`)
            .then((response) => {
                if (response.data) {
                    let chatSource = response.data?.TICKET_CHANNEL?.filter(e => e.mapping.isLiveChatEnabled === "Y")?.map((ele) => { return { label: ele.description, value: ele?.code, color: chroma.random().hex() } }) || []
                    const avblSource = chatSource.map(a => { return a.value })
                    const avblHelpdeskSource = response.data?.HELPDESK_SOURCE?.map(h => { return h.code })
                    chatSource.push({ label: 'All', value: 'ALL', color: defaultColor })
                    chatSource = sortBy(chatSource, 'value')
                    unstable_batchedUpdates(() => {
                        setLiveChatSource(chatSource)
                        setAvailableChatSource(avblSource)
                        setAvailableHelpdeskSource(avblHelpdeskSource)
                    })
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }, [])

    const handleSubmit = (e) => {
        setCurrentDateTime(moment())
        e.preventDefault();
        isTableFirstRender.current = true;
        unstable_batchedUpdates(() => {
            setFilters([])
            setCurrentPage((currentPage) => {
                if (currentPage === 0) {
                    return '0'
                }
                return 0
            });
        })
    }

    useEffect(() => {
        if (!isFirstRender.current) {
            monitoringDetails()
            agentChatSummary()
            helpdeskMonitoringDetails()
            helpdeskSummary()
        }
        else {
            isFirstRender.current = false;
        }
    }, [currentPage, perPage])

    const monitoringDetails = () => {
        const IncludeAllSource = [
            statusConstantCode.businessEntity.MOBILELIVECHAT,
            statusConstantCode.businessEntity.WHATSAPPLIVECHAT,
            statusConstantCode.businessEntity.FBLIVECHAT,
            statusConstantCode.businessEntity.MOBILEAPP,
            statusConstantCode.businessEntity.LIVECHAT,
            statusConstantCode.businessEntity.INSTAGRAM
        ]
        let count = 0; let queue = 0; let serving = 0; let served = 0; let abandone = 0; let loggedAgents = 0
        post(`${properties.CHAT_API}/chat-monitor-counts${selectedDate === "" ? '' : `?date=${selectedDate}`}`, { chatSource: chatSource.includes('ALL') ? IncludeAllSource : chatSource })
            .then((response) => {
                if (response.data) {
                    //&& response?.data?.chatQueueWaitTime.length > 0 && response?.data?.agentChatDuration.length > 0
                    if (response?.data?.counts.length > 0) {
                        for (const rec of response?.data?.counts) {

                            if (rec.oChatSource === statusConstantCode?.businessEntity?.WHATSAPPLIVECHAT) {
                                const totalCount = Number(rec.chatQueue) + Number(rec.oTotalServedChat) + Number(rec.oAbandonedChat) + Number(rec.oCurrentServingChat)
                                rec.totalCount = totalCount
                                unstable_batchedUpdates(() => {
                                    setWhatsAppData(rec)
                                })
                            } else if (rec.oChatSource === statusConstantCode?.businessEntity?.FBLIVECHAT) {
                                const totalCount = Number(rec.chatQueue) + Number(rec.oTotalServedChat) + Number(rec.oAbandonedChat) + Number(rec.oCurrentServingChat)
                                rec.totalCount = totalCount
                                unstable_batchedUpdates(() => {
                                    setFbData(rec)
                                })
                            } else if (rec.oChatSource === statusConstantCode?.businessEntity?.INSTAGRAM) {
                                const totalCount = Number(rec.chatQueue) + Number(rec.oTotalServedChat) + Number(rec.oAbandonedChat) + Number(rec.oCurrentServingChat)
                                rec.totalCount = totalCount
                                unstable_batchedUpdates(() => {
                                    setInstaData(rec)
                                })
                            } else if (rec.oChatSource === statusConstantCode?.businessEntity?.MOBILELIVECHAT) {
                                const totalCount = Number(rec.chatQueue) + Number(rec.oTotalServedChat) + Number(rec.oAbandonedChat) + Number(rec.oCurrentServingChat)
                                rec.totalCount = totalCount
                                unstable_batchedUpdates(() => {
                                    setMobileData(rec)
                                })
                            } else if (rec.oChatSource === statusConstantCode?.businessEntity?.LIVECHAT) {
                                const totalCount = Number(rec.chatQueue) + Number(rec.oTotalServedChat) + Number(rec.oAbandonedChat) + Number(rec.oCurrentServingChat)
                                rec.totalCount = totalCount
                                unstable_batchedUpdates(() => {
                                    setWebsiteData(rec)
                                })
                            }
                            // count = count + Number(rec.chatQueue) + Number(rec.oTotalServedChat) + Number(rec.oCurrentServingChat) + Number(rec.oAbandonedChat)
                            // queue = queue + Number(rec.chatQueue)
                            // serving = serving + Number(rec.oCurrentServingChat)
                            // served = served + Number(rec.oTotalServedChat)
                            // abandone = abandone + Number(rec.oAbandonedChat)
                            // loggedAgents = Number(response.data.counts1[0].loggedInAgents)
                            loggedAgents = Number(rec?.oLoggedInAgents)
                        }
                        unstable_batchedUpdates(() => {
                            setCurrentlyLoggedData(loggedAgents)
                            setChatQueueWaitData(response?.data?.chatQueueWaitTime?.[0] || [])
                            setChatDurationData(response?.data?.agentChatDuration?.[0] || [])
                            // setChatQueueLongData(response.data.counts1[0].allWaitLongest)
                            // setChatDurationAvgData(response.data.counts1[0].allChatDurationAverage)
                            // setChatDurationLongData(response.data.counts1[0].allChatDurationLongest)
                        })
                    } else {
                        unstable_batchedUpdates(() => {
                            setCurrentlyLoggedData(0)
                            setChatQueueWaitData([])
                            setChatDurationData([])

                        })
                    }
                }
            })
            .catch((error) => {
                console.error(error)
            }).finally()


        post(`${properties.CHAT_API}/all-chat-count${selectedDate === "" ? '' : `?date=${selectedDate}`}`, { chatSource: ['ALL'] })
            .then((resp) => {
                if (resp.data) {
                    for (const rec of resp?.data) {
                        count = count + Number(rec.chatQueue) + Number(rec.oTotalServedChat) + Number(rec.oCurrentServingChat) + Number(rec.oAbandonedChat)
                        queue = queue + Number(rec.chatQueue)
                        serving = serving + Number(rec.oCurrentServingChat)
                        served = served + Number(rec.oTotalServedChat)
                        abandone = abandone + Number(rec.oAbandonedChat)
                    }
                    unstable_batchedUpdates(() => {
                        setTotalCount(count)
                        setTotalQueueData(queue)
                        setTotalServingata(serving)
                        setTotalServedData(served)
                        setTotalAbandonedData(abandone)
                    })
                }
            }).catch((error) => { console.error(error) })
            .finally()
    }

    const agentChatSummary = () => {
        post(`${properties.CHAT_API}/agent-summary${selectedDate === "" ? '' : `?date=${selectedDate}`}&limit=${perPage}&page=${currentPage}`, { chatSource: chatSource })
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        const { count, rows } = resp.data;
                        if (count === "0") {
                            // toast.error("Records Not foundssss");
                        }
                        unstable_batchedUpdates(() => {
                            setRowCount(count)
                            setAgentChatSummaryData(rows);
                        })
                    } else {
                        toast.error("Records Not Found")
                    }
                } else {
                    toast.error("Records Not Found")
                }
            }).catch((error) => {
                console.error(error)
            }).finally(() => {
                isTableFirstRender.current = false;
            });
    }

    const helpdeskMonitoringDetails = () => {
        get(`${properties.HELPDESK_API}/monitor${selectedDate === "" ? '' : `?date=${selectedDate}`}`)
            .then((response) => {
                if (response.data) {
                    let count = 0; let queue = 0; let assigned = 0; let served = 0;
                    //  && response?.data?.helpdeskQueueWaitTime.length > 0
                    if (response?.data?.counts.length > 0) {
                        for (const rec of response?.data?.counts) {
                            if (rec.helpdeskSource === 'E-MAIL') {
                                const totalCount = Number(rec.queue) + Number(rec.served) + Number(rec.assigned)
                                rec.totalCount = totalCount
                                setEmailData(rec)
                            } else if (rec.helpdeskSource === 'WEBPORTAL') {
                                const totalCount = Number(rec.queue) + Number(rec.served) + Number(rec.assigned)
                                rec.totalCount = totalCount
                                setWebportalData(rec)
                            }
                            count = count + Number(rec.queue) + Number(rec.served) + Number(rec.assigned)
                            queue = queue + Number(rec.queue)
                            assigned = assigned + Number(rec.assigned)
                            served = served + Number(rec.served)
                        }
                        unstable_batchedUpdates(() => {
                            setHelpdeskTotalCount(count)
                            setHelpdeskTotalQueueData(queue)
                            setHelpdeskTotalServingata(assigned)
                            setHelpdeskTotalServedData(served)
                            setHelpdeskQueueWaitData(response?.data?.helpdeskQueueWaitTime?.[0] || [])
                            // setHelpdeskQueueAvgData(response.data[0] && response.data[0].waitAverage || 0)
                            // setHelpdeskQueueLongData(response.data[0] && response.data[0].waitLongest || 0)
                        })
                    }
                }
            })
            .catch((error) => {
                console.error(error)
            }).finally()
    }

    const helpdeskSummary = () => {
        get(`${properties.HELPDESK_API}/agent-summary${selectedDate === "" ? '' : `?date=${selectedDate}`}&limit=${perPage}&page=${currentPage}`)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        const { count, rows } = resp.data;
                        if (count === "0") {
                            // toast.error("Records Not foundssss");
                        }
                        unstable_batchedUpdates(() => {
                            setHelpdeskRowCount(count)
                            setHelpdeskSummaryData(rows);
                        })
                    } else {
                        toast.error("Records Not Foundaaaa")
                    }
                } else {
                    toast.error("Records Not Foundssssaaa")
                }
            }).catch((error) => {
                console.error(error)
            }).finally(() => {
                isTableFirstRender.current = false;
            });
    }

    // const refreshData = () => {
    //     setCurrentDateTime(moment())
    //     monitoringDetails()
    //     agentChatSummary()
    //     helpdeskMonitoringDetails()
    //     helpdeskSummary()
    // }

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
            // setPageRefreshTime(!pageRefreshTime);
        })
    }

    const handleClearDateChange = () => {
        unstable_batchedUpdates(() => {
            setSelectedDate(moment(new Date()).format('YYYY-MM-DD'))
            setIsPageRefresh(!isPageRefresh);
            setChatSource(['ALL'])
            setSelectedChatSource([{ label: 'ALL', value: 'ALL', color: defaultColor }])
        })
    }

    // const handleChatPerAgentView = () => {
    //     get(`${properties.CHAT_API}/chat-per-agent`)
    //         .then((response) => {
    //             if (response.data) {
    //                 setChatPerAgentData(response?.data)
    //             }
    //         })
    //         .catch((error) => {
    //             console.error(error)
    //         })

    //     setShowChatPerAgentModal(true)
    // }

    const handleLoggedInAgentView = () => {
        get(`${properties.CHAT_API}/available-chat-agents?date=${selectedDate}`)
            .then((response) => {
                if (response.data) {
                    setLoggedInAgentData(response?.data)
                }
            })
            .catch((error) => {
                console.error(error)
            })

        setShowLoggedInAgentModal(true)
    }

    const handleCellRender = (cell, row) => {

        return (<span>{cell.value ? cell.value : "-"}</span>)
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleChatSourceChange = (selectedOptions) => {
        if (isEmpty(selectedOptions)) {
            unstable_batchedUpdates(() => {
                setSelectedChatSource([{ label: 'ALL', value: 'ALL', color: defaultColor }])
                setChatSource(['ALL'])
            })
        } else {
            const includeAlls = (selectedChatSource && selectedChatSource.filter(e => e.value !== 'ALL')) || []
            const selectedAll = (selectedOptions && selectedOptions.filter(e => e.value === 'ALL')) || []
            if (includeAlls.length > 0 && selectedAll.length > 0) {
                setSelectedChatSource([{ label: 'ALL', value: 'ALL', color: defaultColor }])
                setChatSource(['ALL'])
            } else {
                const Options = selectedOptions && selectedOptions.length > 1 ? selectedOptions.filter(e => e.value !== 'ALL') : selectedOptions
                const sources = Options.map(e => e.value)
                unstable_batchedUpdates(() => {
                    setSelectedChatSource(Options)
                    setChatSource(sources)
                })
            }

        }
    }

    // const dot = (color = 'transparent') => ({
    //     alignItems: 'center',
    //     display: 'flex',
    //     ':before': {
    //         backgroundColor: color,
    //         borderRadius: 10,
    //         content: '" "',
    //         display: 'block',
    //         marginRight: 8,
    //         height: 10,
    //         width: 10,
    //     },
    // });

    const colourStyles = {
        control: (styles) => ({ ...styles, backgroundColor: 'white' }),
        option: (styles, { data, isDisabled, isFocused, isSelected }) => {
            const color = chroma(data?.color || '#fff');
            return {
                ...styles,
                // backgroundColor: isDisabled
                //   ? undefined
                //   : isSelected
                //   ? data.color
                //   : isFocused
                //   ? color.alpha(0.1).css()
                //   : undefined,
                // color: isDisabled
                //     ? '#ccc'
                //     : isSelected
                //         ? chroma.contrast(color, 'white') > 2
                //             ? 'white'
                //             : 'black'
                //         : data.color,
                // cursor: isDisabled ? 'not-allowed' : 'default',

                ':active': {
                    ...styles[':active'],
                    backgroundColor: !isDisabled
                        ? isSelected
                            ? data.color
                            : color.alpha(0.3).css()
                        : undefined,
                },
            };
        },
        multiValue: (styles, { data }) => {
            const color = chroma(data.color);
            return {
                ...styles,
                backgroundColor: color.alpha(0.1).css(),
            };
        },
        multiValueLabel: (styles, { data }) => ({
            ...styles,
            color: data.color,
        }),
        multiValueRemove: (styles, { data }) => ({
            ...styles,
            color: data.color,
            ':hover': {
                backgroundColor: data.color,
                color: 'white',
            },
        })
    };

    const handleAutoRefresh = (event) => {
        if (!pageRefreshTime) {
            toast.error("Refresh Time Is Require!");
            return
        }
        setIsChecked(event.target.checked);
    }

    const handleSetRefreshTime = (e) => {
        unstable_batchedUpdates(() => {
            setIsChecked(false)
            setPageRefreshTime(parseInt(e.target.value));
        })
    }

    useEffect(() => {
        monitoringDetails()
        agentChatSummary()
        helpdeskMonitoringDetails()
        helpdeskSummary()
        const currentTime = moment().format('DD-MM-YYYY HH:mm:ss')
        setLastDataRefreshTime(currentTime)
    }, [isPageRefresh])

    useEffect(() => {
        if (pageRefreshTime && typeof (pageRefreshTime) === 'number') {
            const intervalId = setInterval(() => {
                if (isChecked) {
                    setIsPageRefresh(!isPageRefresh)
                    const currentTime = moment().format('DD-MM-YYYY HH:mm:ss')
                    setLastDataRefreshTime(currentTime)
                }
            }, Number(pageRefreshTime) * 60 * 1000)
            return () => clearInterval(intervalId);
        }

    }, [isChecked])

    const handleChatDetails = (source, type) => {
        setChatDetailsOpen(!ChatDetailsOpen)
        setChatDetails({
            source: source,
            type: type,
            createdAt: selectedDate
        })
    }

    const handleHelpdeskDetails = (source, type) => {
        setHelpdeskDetailsOpen(!helpdeskDetailsOpen)
        setHelpdeskDetails({
            source: source,
            type: type,
            createdAt: selectedDate
        })
    }

    return (
        // <div className="content-page">
        //     <div className="content">
        <>
            <div className="container-fluid pr-1">
                <div className="cnt-wrapper">
                    <div className="row">
                        <div className="col-md-12 cust-pd">
                            {/* <div className="top-breadcrumb cmmn-skeleton col-12">
                                <div className="page-title">
                                    <h4>Chat Agent Monitor</h4>
                                </div>
                            </div> */}
                            <div className="row mt-1 ">
                                <div className="col-lg-12">
                                    <div className="search-result-box m-t-30 card-box bg-light border">
                                        <div id="searchBlock" >
                                            <div className="row">
                                                <div className="col-md-4 mt-3">
                                                    {/* <p className="mb-1 font-weight-bold  mt-3 mt-md-0">Select Channel </p> */}
                                                    <Select
                                                        closeMenuOnSelect={false}
                                                        defaultValue={liveChatSource?.length === 0 ? [] : selectedChatSource}
                                                        value={selectedChatSource}
                                                        options={liveChatSource}
                                                        getOptionLabel={option => `${option.label}`}
                                                        onChange={handleChatSourceChange}
                                                        styles={colourStyles}
                                                        className='custom-select-dropdown'
                                                        isMulti
                                                        isClearable
                                                        name="channel"
                                                    />
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="form-group mt-3">
                                                        {/* <label for="Surname" className="control-label">Date</label> */}
                                                        <input type="date" className="input-sm form-control"
                                                            value={selectedDate}
                                                            max={moment(new Date()).format('YYYY-MM-DD')}
                                                            onChange={(e) => {
                                                                handleDateChange(e)
                                                            }}
                                                            placeholder="Date Range" />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="mt-3">
                                                        <button type="button" className="skel-btn-cancel" onClick={handleClearDateChange}>Clear</button>
                                                        <button type="button" className="skel-btn-submit" onClick={handleSubmit}>
                                                            <i className="fa fa-search mr-1"></i> Search</button>
                                                    </div>
                                                </div>
                                                <div className="form-group pt-3">
                                                    <form className="form-inline">
                                                        <span className="ml-1">Auto Refresh</span>
                                                        <div className="switchToggle ml-1">
                                                            <input id="switch1" type="checkbox" checked={isChecked} onChange={handleAutoRefresh} />
                                                            <label htmlFor="switch1">Toggle</label>
                                                        </div>
                                                        <button type="button" className="ladda-button  btn btn-secondary btn-xs ml-1" dir="ltr" data-style="slide-left" onClick={() => setIsPageRefresh(!isPageRefresh)}>
                                                            <span className="ladda-label"
                                                            ><i className="material-icons">refresh</i>
                                                            </span><span className="ladda-spinner"></span>
                                                        </button>
                                                        <select className="custom-select custom-select-sm ml-1" value={pageRefreshTime} onChange={handleSetRefreshTime} >
                                                            <option value="Set">Set</option>
                                                            <option value={Number(1)}>1 Min</option>
                                                            <option value={Number(5)}>5 Min</option>
                                                            <option value={Number(15)}>15 Min</option>
                                                            <option value={Number(30)}>30 Min</option>
                                                        </select>
                                                    </form>
                                                    <span style={{ fontSize: '12px', paddingLeft: '90px' }}>Last Refreshed : {lastDataRefreshTime}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-2">
                                <div className="row mt-2">
                                    <div className="col-4 pt-2">
                                        <div className="card allchat text-white border lift">
                                            <div className="card-body">
                                                <div className="media">
                                                    <div className="media-body overflow-hidden" onClick={() => { handleChatDetails() }}>
                                                        <p className="font-size-14 mb-2 text-white">All Chat Total</p>
                                                        <h3 className="text-white">{(totalCount && totalCount) || 0}</h3>
                                                    </div>
                                                    <div>
                                                        <i className="mdi mdi-chat-outline font-26"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body border-top py-3">
                                                <div className="row">
                                                    <div className="col-3" onClick={() => { handleChatDetails(null, 'QUEUE') }}>
                                                        <div className="text-center text-white">
                                                            <p className="mb-2 text-white">Queue</p>
                                                            <h4 className="text-white">{(totalQueueData && totalQueueData) || 0}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="col-3" onClick={() => { handleChatDetails(null, 'SERVING') }}>
                                                        <div className="text-center">
                                                            <p className="mb-2 text-white">Serving</p>
                                                            <h4 className="text-white">{(totalServingata && totalServingata) || 0}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="col-3" onClick={() => { handleChatDetails(null, 'SERVED') }}>
                                                        <div className="text-center">
                                                            <p className="mb-2 text-white">Served</p>
                                                            <h4 className="text-white">{totalServedData || 0}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="col-3" onClick={() => { handleChatDetails(null, 'ABOND') }}>
                                                        <div className="text-center">
                                                            <p className="mb-2 text-white">Aband</p>
                                                            <h4 className="text-white">{totalAbandonedData || 0}</h4>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {(chatSource.includes(statusConstantCode.businessEntity.WHATSAPPLIVECHAT) || chatSource.includes('ALL')) && availableChatSource.includes(statusConstantCode.businessEntity.WHATSAPPLIVECHAT) && <div className="col-4 pt-2">
                                        <div className="card happyness text-white border lift">
                                            <div className="card-body">
                                                <div className="media">
                                                    <div className="media-body overflow-hidden" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.WHATSAPPLIVECHAT) }}>
                                                        <p className="text-white font-size-14 mb-2">Whatsapp</p>
                                                        <h3 className="mb-0 text-white">{whatsAppData?.totalCount || 0}</h3>
                                                    </div>
                                                    <div className="text-white">
                                                        <i className="mdi mdi-whatsapp text-white font-26"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body border-top py-3">
                                                <div className="row">
                                                    <div className="col-3">
                                                        <div className="text-center" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.WHATSAPPLIVECHAT, 'QUEUE') }}>
                                                            <p className="mb-2 text-white">Queue</p>
                                                            <h4 className="text-white">{whatsAppData?.chatQueue || 0}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="col-3">
                                                        <div className="text-center" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.WHATSAPPLIVECHAT, 'SERVING') }}>
                                                            <p className="mb-2 text-white">Serving</p>
                                                            <h4 className="text-white">{whatsAppData?.oCurrentServingChat || 0}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="col-3">
                                                        <div className="text-center" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.WHATSAPPLIVECHAT, 'SERVED') }}>
                                                            <p className="mb-2 text-white">Served</p>
                                                            <h4 className="text-white">{whatsAppData?.oTotalServedChat || 0}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="col-3">
                                                        <div className="text-center" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.WHATSAPPLIVECHAT, 'ABOND') }}>
                                                            <p className="mb-2 text-white">Aband</p>
                                                            <h4 className="text-white">{whatsAppData?.oAbandonedChat || 0}</h4>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>}
                                    {(chatSource.includes(statusConstantCode.businessEntity.FBLIVECHAT) || chatSource.includes('ALL')) && availableChatSource.includes(statusConstantCode.businessEntity.FBLIVECHAT) && <div className="col-4 pt-2">
                                        <div className="card sealord border lift">
                                            <div className="card-body">
                                                <div className="media">
                                                    <div className="media-body overflow-hidden" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.FBLIVECHAT) }}>
                                                        <p className="text-white font-size-14 mb-2">Facebook Messenger
                                                        </p>
                                                        <h3 className="mb-0 text-white">{fbData?.totalCount || 0}</h3>
                                                    </div>
                                                    <div className="text-white">
                                                        <i
                                                            className="mdi mdi-facebook-messenger font-26 text-white"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body border-top py-3">
                                                <div className="row">
                                                    <div className="col-3">
                                                        <div className="text-center" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.FBLIVECHAT, 'QUEUE') }}>
                                                            <p className="mb-2 text-white">Queue</p>
                                                            <h4 className="text-white">{fbData?.chatQueue || 0}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="col-3">
                                                        <div className="text-center" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.FBLIVECHAT, 'SERVING') }}>
                                                            <p className="mb-2 text-white">Serving</p>
                                                            <h4 className="text-white">{fbData?.oCurrentServingChat || 0}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="col-3">
                                                        <div className="text-center" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.FBLIVECHAT, 'SERVED') }}>
                                                            <p className="mb-2 text-white">Served</p>
                                                            <h4 className="text-white">{fbData?.oTotalServedChat || 0}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="col-3">
                                                        <div className="text-center" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.FBLIVECHAT, 'ABOND') }}>
                                                            <p className="mb-2 text-white">Aband</p>
                                                            <h4 className="text-white">{fbData?.oAbandonedChat || 0}</h4>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>}
                                    {/* </div>
                                <div className="row mt-3 px-1"> */}
                                    {(chatSource.includes(statusConstantCode.businessEntity.INSTAGRAM) || chatSource.includes('ALL')) && availableChatSource.includes(statusConstantCode.businessEntity.INSTAGRAM) && <div className="col-4 pt-2">
                                        <div className="card insta-chat border lift">
                                            <div className="card-body">
                                                <div className="media">
                                                    <div className="media-body overflow-hidden" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.INSTAGRAM) }}>
                                                        <p className="text-white font-size-12 mb-2">Instagram</p>
                                                        <h3 className="mb-0 text-white">{instaData?.totalCount || 0}</h3>
                                                    </div>
                                                    <div className="text-white">
                                                        <i className="fe-instagram font-26 text-white"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body border-top py-3">
                                                <div className="row">
                                                    <div className="col-3">
                                                        <div className="text-center" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.INSTAGRAM, 'QUEUE') }}>
                                                            <p className="mb-2 text-white">Queue</p>
                                                            <h4 className="text-white">{instaData?.chatQueue || 0}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="col-3">
                                                        <div className="text-center" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.INSTAGRAM, 'SERVING') }}>
                                                            <p className="mb-2 text-white">Serving</p>
                                                            <h4 className="text-white">{instaData?.oCurrentServingChat || 0}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="col-3">
                                                        <div className="text-center" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.INSTAGRAM, 'SERVED') }}>
                                                            <p className="mb-2 text-white">Served</p>
                                                            <h4 className="text-white">{instaData?.oTotalServedChat || 0}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="col-3">
                                                        <div className="text-center" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.INSTAGRAM, 'ABOND') }}>
                                                            <p className="mb-2 text-white">Aband</p>
                                                            <h4 className="text-white">{instaData?.oAbandonedChat || 0}</h4>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>}

                                    {(chatSource.includes(statusConstantCode.businessEntity.MOBILEAPP) || chatSource.includes('ALL')) && availableChatSource.includes(statusConstantCode.businessEntity.MOBILEAPP) && <div className="col-4 pt-2">
                                        <div className="card box-1 border lift">
                                            <div className="card-body">
                                                <div className="media">
                                                    <div className="media-body overflow-hidden" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.MOBILEAPP) }}>
                                                        <p className="font-size-14 mb-2 font-weight-bold text-white">
                                                            Mobile App</p>
                                                        <h3 className="text-white">{mobileData?.totalCount || 0}</h3>
                                                    </div>
                                                    <div>
                                                        <i className="mdi mdi-cellphone font-26 text-white"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body border-top py-3">
                                                <div className="row">
                                                    <div className="col-3">
                                                        <div className="text-center" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.MOBILEAPP, 'QUEUE') }}>
                                                            <p className="mb-2 text-white">Queue</p>
                                                            <h4 className="text-white">{mobileData?.chatQueue || 0}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="col-3">
                                                        <div className="text-center" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.MOBILEAPP, 'SERVING') }}>
                                                            <p className="mb-2 text-white">Serving</p>
                                                            <h4 className="text-white">{mobileData?.oCurrentServingChat || 0}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="col-3">
                                                        <div className="text-center" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.MOBILEAPP, 'SERVED') }}>
                                                            <p className="mb-2 text-white">Served</p>
                                                            <h4 className="text-white">{mobileData?.oTotalServedChat || 0}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="col-3">
                                                        <div className="text-center" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.MOBILEAPP, 'ABOND') }}>
                                                            <p className="mb-2 text-white">Abond</p>
                                                            <h4 className="text-white">{mobileData?.oAbandonedChat || 0}</h4>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>}
                                    {(chatSource.includes(statusConstantCode.businessEntity.LIVECHAT) || chatSource.includes('ALL')) && availableChatSource.includes(statusConstantCode.businessEntity.LIVECHAT) && <div className="col-4 pt-2">
                                        <div className="card box-2 border lift">
                                            <div className="card-body">
                                                <div className="media">
                                                    <div className="media-body overflow-hidden" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.LIVECHAT) }}>
                                                        <p className="font-size-14 mb-2 font-weight-bold text-white">Web Chat Bot

                                                        </p>
                                                        <h3 className="text-white">{websiteData?.totalCount || 0}</h3>
                                                    </div>
                                                    <div>
                                                        <i className="fas fa-robot font-22 text-white"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body border-top py-3">
                                                <div className="row">
                                                    <div className="col-3">
                                                        <div className="text-center" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.LIVECHAT, 'QUEUE') }}>
                                                            <p className="mb-2 text-white">Queue</p>
                                                            <h4 className="text-white">{websiteData?.chatQueue || 0}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="col-3">
                                                        <div className="text-center" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.LIVECHAT, 'SERVING') }}>
                                                            <p className="mb-2 text-white">Serving</p>
                                                            <h4 className="text-white">{websiteData?.oCurrentServingChat || 0}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="col-3">
                                                        <div className="text-center" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.LIVECHAT, 'SERVED') }}>
                                                            <p className="mb-2 text-white">Served</p>
                                                            <h4 className="text-white">{websiteData?.oTotalServedChat || 0}</h4>
                                                        </div>
                                                    </div>
                                                    <div className="col-3">
                                                        <div className="text-center" onClick={() => { handleChatDetails(statusConstantCode.businessEntity.LIVECHAT, 'ABOND') }}>
                                                            <p className="mb-2 text-white">Aband</p>
                                                            <h4 className="text-white">{websiteData?.oAbandonedChat || 0}</h4>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>}
                                    {/* </div>
                                <div className="row mt-3 px-1"> */}
                                    <div className="col-3 pt-2">
                                        <div className="card panelbg6 border lift">
                                            <div className="card-body">
                                                <div className="media">
                                                    <div className="media-body overflow-hidden">
                                                        <p className="font-size-14 font-weight-bold">Currently Logged in Agents (Today)</p>

                                                    </div>
                                                    <div>
                                                        <i className="fas fa-user-tie font-26"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body border-top pt-3 text-center">
                                                {(currentlyLoggedData > 0) ? <h3 onClick={() => handleLoggedInAgentView()}>{currentlyLoggedData || 0}</h3> : <h3>{currentlyLoggedData || 0}</h3>}
                                                <p>Agents</p>
                                                {showLoggedInAgentModal &&
                                                    <LoggedInAgentModel
                                                        data={{
                                                            isOpen: showLoggedInAgentModal,
                                                            loginData: loggedInAgentData
                                                        }}
                                                        handler={{
                                                            setIsOpen: setShowLoggedInAgentModal
                                                        }}
                                                    />
                                                }
                                            </div>

                                        </div>
                                    </div>
                                    <div className="col-4 pt-2">
                                        <div className="card panelbg10 lift border">
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col-10 pt-2"><span className="text-dark font-size-14 font-weight-bold ">Chat Queue Wait Time</span></div>
                                                    <div className="col-2"><i className="mdi mdi-timelapse font-26"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body border-top mt-3 text-center">
                                                {/* <div className="media"> */}
                                                {/* <div className="media-body overflow-hidden"> */}
                                                <div className="row my-3 pt-1 mx-1">
                                                    <div className="col">
                                                        <div className="time-left text-center">
                                                            {/* <h4>{chatQueueDurationData && chatQueueDurationData?.allWaitAverage && (chatQueueDurationData?.allWaitAverage?.days || 0) + "d " + (chatQueueDurationData?.allWaitAverage?.hours || 0) + "h " + (chatQueueDurationData?.allWaitAverage?.minutes || 0) + "m " + (chatQueueDurationData?.allWaitAverage?.seconds || 0) + "s" || "0d 0h 0m 0s"}</h4> */}
                                                            <h4>{(chatQueueWaitData && chatQueueWaitData?.oAvgChatQueueWaitTimeInterval) || "0h:0m:0s"}</h4>
                                                            <p className="p-0">Average</p>
                                                        </div>
                                                    </div>
                                                    <div className="col">
                                                        <div className="time-left text-center">
                                                            <span>
                                                                {/* <h4>{chatQueueDurationData && chatQueueDurationData?.allWaitLongest && (chatQueueDurationData?.allWaitLongest?.days || 0) + "d " + (chatQueueDurationData?.allWaitLongest?.hours || 0) + "h " + (chatQueueDurationData?.allWaitLongest?.minutes || 0) + "m " + (chatQueueDurationData?.allWaitLongest?.seconds || 0) + "s" || "0d 0h 0m 0s"}</h4> */}
                                                                <h4>{(chatQueueWaitData && chatQueueWaitData?.oMaxChatQueueWaitTimeInterval) || "0h:0m:0s"}</h4>
                                                            </span>
                                                            <p className="p-0">Longest</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* </div> */}
                                                {/* </div> */}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-4 pt-2">
                                        <div className="card panelbg10 lift border">
                                            <div className="card-body">
                                                <div className="row">
                                                    <div className="col-10 pt-2"><span className="text-dark font-size-14 font-weight-bold">Agent Chat Duration</span></div>
                                                    <div className="col-2"><i className="mdi mdi-timelapse font-26"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body border-top mt-3 text-center">
                                                <div className="row my-3 pt-1 mx-1">
                                                    <div className="col">
                                                        <div className="time-left text-center">
                                                            {/* <h4>{chatQueueDurationData && chatQueueDurationData?.allChatDurationAverage && (chatQueueDurationData?.allChatDurationAverage?.days || 0) + "d " + (chatQueueDurationData?.allChatDurationAverage?.hours || 0) + "h " + (chatQueueDurationData?.allChatDurationAverage?.minutes || 0) + "m " + (chatQueueDurationData?.allChatDurationAverage?.seconds || 0) + "s" || "0d 0h 0m 0s"}</h4> */}
                                                            <h4>{chatDurationData && chatDurationData?.oAvgChatDurationInterval || "0h:0m:0s"}</h4>
                                                            <p className="p-0">Average</p>
                                                        </div>
                                                    </div>
                                                    <div className="col">
                                                        <div className="time-left text-center">
                                                            <span>
                                                                {/* <h4>{chatQueueDurationData && chatQueueDurationData?.allChatDurationLongest && (chatQueueDurationData?.allChatDurationLongest?.days || 0) + "d " + (chatQueueDurationData?.allChatDurationLongest?.hours || 0) + "h " + (chatQueueDurationData?.allChatDurationLongest?.minutes || 0) + "m " + (chatQueueDurationData?.allChatDurationLongest?.seconds || 0) + "s" || "0d 0h 0m 0s"}</h4> */}
                                                                <h4>{chatDurationData && chatDurationData?.oMaxChatDurationInterval || "0h:0m:0s"}</h4>
                                                            </span>
                                                            <p className="p-0">Longest</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-2">
                    <div className="row px-1">
                    </div>
                </div>
            </div>
            <div className="col-12 p-0 mt-2">
                <div className="col-12 p-0">
                    <div className="col-12 p-0">
                        <div className="card-body">
                            <section className="triangle">
                                <div className="col-12 row">
                                    <div className="col-8">
                                        <h4 id="list-item-1" className="pl-1 my-1 pt-1">Agent Chat Summary
                                        </h4>
                                    </div>
                                </div>
                            </section>
                            <div className="card mb-0">
                                <div className="card-box p-0">
                                    <div className="card">
                                        <div className="card-body">
                                            {agentChatSummaryData && <DynamicTable
                                                listSearch={{ chatSource: chatSource }}
                                                listKey={"Agent Chat Summary"}
                                                url={`${properties.CHAT_API}/agent-summary${selectedDate === "" ? '' : `?date=${selectedDate}`}&excel=true`}
                                                row={agentChatSummaryData}
                                                rowCount={rowCount}
                                                header={agentChatSummaryColumns}
                                                itemsPerPage={perPage}
                                                backendPaging={true}
                                                backendCurrentPage={currentPage}
                                                isTableFirstRender={isTableFirstRender}
                                                hasExternalSearch={hasExternalSearch}
                                                exportBtn={exportBtn}
                                                method='POST'
                                                handler={{
                                                    handleCellRender: handleCellRender,
                                                    handlePageSelect: handlePageSelect,
                                                    handleItemPerPage: setPerPage,
                                                    handleCurrentPage: setCurrentPage,
                                                    handleFilters: setFilters,
                                                    handleExportButton: setExportBtn
                                                }}
                                            />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row mt-2 p-0">
                    <div className="col">
                        <div className="card allchat text-white">
                            <div className="card-body">
                                <div className="media">
                                    <div className="media-body overflow-hidden" onClick={() => { handleHelpdeskDetails() }}>
                                        <p className="font-size-14 mb-2 text-white font-weight-bold">All Helpdesk</p>
                                        <h3 className="mb-0 ">{helpdeskTotalCount || 0}</h3>
                                    </div>
                                    <div>
                                        <i className="mdi mdi-chat-outline font-26"></i>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body border-top py-3">
                                <div className="row">
                                    <div className="col-4">
                                        <div className="text-center text-white" onClick={() => { handleHelpdeskDetails(null, 'QUEUE') }}>
                                            <p className="mb-2 text-white">Queue</p>
                                            <h4>{helpdeskTotalQueueData || 0}</h4>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="text-center" onClick={() => { handleHelpdeskDetails(null, 'SERVING') }}>
                                            <p className="mb-2 text-white">Assigned</p>
                                            <h4>{helpdeskTotalServingata || 0}</h4>
                                        </div>
                                    </div>
                                    <div className="col-4">
                                        <div className="text-center" onClick={() => { handleHelpdeskDetails(null, 'SERVED') }}>
                                            <p className="mb-2 text-white">Served</p>
                                            <h4>{helpdeskTotalServedData || 0}</h4>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                    {availableHelpdeskSource.includes(statusConstantCode.businessEntity.EMAIL) && <div className="col">
                        <div className="card panelbg2 border">
                            <div className="card-body">
                                <div className="media">
                                    <div className="media-body overflow-hidden" onClick={() => { handleHelpdeskDetails(statusConstantCode.businessEntity.EMAIL) }}>
                                        <p className="font-size-14 mb-2 font-weight-bold">Email
                                        </p>
                                        <h3 className="mb-0">{emailData?.totalCount || 0}</h3>
                                    </div>
                                    <div>
                                        <i className="far fa-envelope font-22"></i>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body border-top py-3">
                                <div className="row">
                                    <div className="col-4">
                                        <div className="text-center" onClick={() => { handleHelpdeskDetails(statusConstantCode.businessEntity.EMAIL, 'QUEUE') }}>
                                            <p className="mb-2">Queue</p>
                                            <h4>{emailData?.queue || 0}</h4>
                                        </div>
                                    </div>
                                    <div className="col-4 p-0">
                                        <div className="text-center" onClick={() => { handleHelpdeskDetails(statusConstantCode.businessEntity.EMAIL, 'SERVING') }}>
                                            <p className="mb-2">Assigned</p>
                                            <h4>{emailData?.assigned || 0}</h4>
                                        </div>
                                    </div>
                                    <div className="col-4 p-0">
                                        <div className="text-center" onClick={() => { handleHelpdeskDetails(statusConstantCode.businessEntity.EMAIL, 'SERVED') }}>
                                            <p className="mb-2 ">Served</p>
                                            <h4>{emailData?.served || 0}</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>}
                    {availableHelpdeskSource.includes(statusConstantCode.businessEntity.WEBPORTAL) && <div className="col">
                        <div className="card panelbg4 border">
                            <div className="card-body">
                                <div className="media">
                                    <div className="media-body overflow-hidden" onClick={() => { handleHelpdeskDetails(statusConstantCode.businessEntity.WEBPORTAL) }}>
                                        <p className="font-size-14 mb-2 font-weight-bold">Web Portal

                                        </p>
                                        <h3 className="mb-0">{webportalData?.totalCount || 0}</h3>
                                    </div>
                                    <div>
                                        <i className="mdi mdi-web font-22"></i>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body border-top py-3">
                                <div className="row">
                                    <div className="col-4 p-0">
                                        <div className="text-center" onClick={() => { handleHelpdeskDetails(statusConstantCode.businessEntity.WEBPORTAL, 'QUEUE') }}>
                                            <p className="mb-2">Queue</p>
                                            <h4>{webportalData?.queue || 0}</h4>
                                        </div>
                                    </div>
                                    <div className="col-4 p-0">
                                        <div className="text-center" onClick={() => { handleHelpdeskDetails(statusConstantCode.businessEntity.WEBPORTAL, 'SERVING') }}>
                                            <p className="mb-2">Assigned</p>
                                            <h4>{webportalData?.assigned || 0}</h4>
                                        </div>
                                    </div>
                                    <div className="col-4 p-0">
                                        <div className="text-center" onClick={() => { handleHelpdeskDetails(statusConstantCode.businessEntity.WEBPORTAL, 'SERVED') }}>
                                            <p className="mb-2 ">Served</p>
                                            <h4>{webportalData?.served || 0}</h4>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>}
                    <div className="col">
                        <div className="card panelbg10 border">
                            <div className="card-body">
                                <div className="row">
                                    <div className="col-10 pt-2"><span className="text-dark font-size-14 font-weight-bold">Helpdesk
                                        Queue Wait Time</span></div>
                                    <div className="col-2"><i className="mdi mdi-timelapse font-26"></i>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body border-top mt-3 py-3">
                                <div className="row">
                                    <div className="col">
                                        <div className="time-left text-center">
                                            {/* <h4 className="text-nowrap">{helpdeskQueueWaitData && helpdeskQueueWaitData?.waitAverage && (helpdeskQueueWaitData?.waitAverage?.days || 0) + "d " + (helpdeskQueueWaitData?.waitAverage?.hours || 0) + "h " + (helpdeskQueueWaitData?.waitAverage?.minutes || 0) + "m " + (helpdeskQueueWaitData?.waitAverage?.seconds || 0) + "s" || "0d 0h 0m 0s"}</h4> */}
                                            <h4 className="text-nowrap">{helpdeskQueueWaitData && helpdeskQueueWaitData?.oAvgChatQueueWaitTimeInterval || "0h:0m:0s"}</h4>
                                            <p className="p-0">Average</p>
                                        </div>
                                    </div>
                                    <div className="col">
                                        <div className="time-left text-center">
                                            {/* <span> */}
                                            {/* <h4 className="text-nowrap">{helpdeskQueueWaitData && helpdeskQueueWaitData?.waitLongest && (helpdeskQueueWaitData?.waitLongest?.days || 0) + "d " + (helpdeskQueueWaitData?.waitLongest?.hours || 0) + "h " + (helpdeskQueueWaitData?.waitLongest?.minutes || 0) + "m " + (helpdeskQueueWaitData?.waitLongest?.seconds || 0) + "s" || "0d 0h 0m 0s"}</h4> */}
                                            <h4 className="text-nowrap">{helpdeskQueueWaitData && helpdeskQueueWaitData?.oMaxChatQueueWaitTimeInterval || "0h:0m:0s"}</h4>
                                            {/* </span> */}
                                            <p className="p-0">Longest</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
            <div className="col-12 mt-3 p-0">
                <div className="col-12 p-0">
                    <div className="card-body">
                        <section className="triangle">
                            <div className="col-12 row">
                                <div className="col-8">
                                    <h4 id="list-item-1" className="pl-1 my-1 pt-1">Agent Helpdesk Summary
                                    </h4>
                                </div>
                            </div>
                        </section>
                        <div className="card mb-0">
                            <div className="card-box p-0">
                                <div className="card">
                                    <div className="card-body">
                                        {helpdeskSummaryData && <DynamicTable
                                            // listSearch={listSearch}
                                            listKey={"Agent Helpdesk Summary"}
                                            url={`${properties.HELPDESK_API}/agent-summary${selectedDate === "" ? '' : `?date=${selectedDate}`}&excel=true`}
                                            row={helpdeskSummaryData}
                                            rowCount={rowCount}
                                            header={agentHelpdeskSummaryColumns}
                                            itemsPerPage={perPage}
                                            backendPaging={true}
                                            backendCurrentPage={currentPage}
                                            isTableFirstRender={isTableFirstRender}
                                            hasExternalSearch={hasExternalSearch}
                                            exportBtn={exportBtn}
                                            method='GET'
                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelect,
                                                handleItemPerPage: setPerPage,
                                                handleCurrentPage: setCurrentPage,
                                                handleFilters: setFilters,
                                                handleExportButton: setExportBtn
                                            }}
                                        />
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {
                    ChatDetailsOpen &&
                    <ChatDetailsModel
                        data={{
                            ChatDetailsOpen,
                            chatDetails
                        }}
                        handler={{
                            setChatDetailsOpen
                        }}
                    />
                }
                {
                    helpdeskDetailsOpen &&
                    <HelpdeskDetailsModel
                        data={{
                            helpdeskDetailsOpen,
                            helpdeskDetails
                        }}
                        handler={{
                            setHelpdeskDetailsOpen
                        }}
                    />
                }
            </div>
        </>
        //     </div>
        // </div>
    )
}

export default Dashboard


const agentChatSummaryColumns = [
    {
        Header: "Agent Name",
        accessor: "oUserName",
        disableFilters: true,
        id: "agentName",
    },
    {
        Header: "Agent User ID",
        accessor: "oLoginId",
        disableFilters: true,
        id: "loginid",
    },
    {
        Header: "Currently Serving Chat",
        accessor: "oCurrentServingChat",
        disableFilters: true,
        id: "currentlyServing"
    },
    {
        Header: "Total Served Chat Today",
        accessor: "oTotalServedChat",
        disableFilters: true,
        id: "currentlyServed"
    },
    {
        Header: "Average FRT",
        accessor: "oAvgFirstResponseTimeInterval",
        disableFilters: true,
        id: "averageFRT"
    },
    {
        Header: "Average Chat Duration",
        accessor: "oAvgChatDurationInterval",
        disableFilters: true,
        id: "chatDurationAverage"
    },
    {
        Header: "Longest Chat Duration",
        accessor: "oMaxChatDurationInterval",
        disableFilters: true,
        id: "chatDurationLongest"
    }
]

const agentHelpdeskSummaryColumns = [
    {
        Header: "Agent Name",
        accessor: "oUserName",
        disableFilters: true,
        id: "agentName",
    },
    {
        Header: "Agent User ID",
        accessor: "oLoginId",
        disableFilters: true,
        id: "loginid",
    },
    {
        Header: "Currently Serving Helpdesk",
        accessor: "oCurrentServingChat",
        disableFilters: true,
        id: "currentlyServingChat"
    },
    {
        Header: "Total Served Helpdesk Today",
        accessor: "oTotalServedChat",
        disableFilters: true,
        id: "totalServedChat"
    },
    {
        Header: "Average FRT",
        accessor: "oAvgFirstResponseTimeInterval",
        disableFilters: true,
        id: "averageFRT"
    }
]