import React, { useState, useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { get, post } from "../../common/util/restUtil";
import { properties } from '../../properties';
import PositiveUpArrow from "../../assets/images/positive-up-arrow.svg";
import moment from 'moment';
import { CloseButton, Modal } from 'react-bootstrap';
import DynamicTable from '../../common/table/DynamicTable';
import { groupBy } from '../../common/util/util';
import { history } from '../../common/util/history';

const Overview = (props) => {
    const { searchParams, isParentRefresh } = props?.data
    const [isRefresh, setIsRefresh] = useState(false);
    const [priorityData, setPriorityData] = useState([]);
    const [statusData, setStatusData] = useState([]);
    const [statusListData, setStatusListData] = useState([]);
    const [priorityStatusData, setPriorityStatusData] = useState([]);
    const [filterType, setFilterType] = useState(null);
    const chartRef = useRef(null);
    const [tableData, setTableData] = useState([]);
    const [avgData, setAvgData] = useState([]);
    const [wipTabs, setWipTabs] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isWipTblOpen, setIsWipTblOpen] = useState(false);
    const [columns, setColums] = useState([
        {
            Header: "Interaction No",
            accessor: "oIntxnNo",
            disableFilters: true,
            id: "oIntxnNo"
        },
        // {
        //     Header: "Customer Name",
        //     accessor: "oCustomerName",
        //     disableFilters: true,
        // },
        {
            Header: "Interaction Category",
            accessor: "oInteractionCategory",
            disableFilters: true,
        },
        {
            Header: "Interaction Type",
            accessor: "oInteractionType",
            disableFilters: true,
        },
        {
            Header: "Service Category",
            accessor: "oServiceCategory",
            disableFilters: true,
        },
        {
            Header: "Service Type",
            accessor: "oServiceType",
            disableFilters: true,
        },
        {
            Header: "Priority",
            accessor: "oPriority",
            disableFilters: true,
        },
        {
            Header: "Project",
            accessor: "oProject",
            disableFilters: true,
        },
        {
            Header: "Status",
            accessor: "oStatus",
            disableFilters: true,
        },
        {
            Header: "Channel",
            accessor: "oChannel",
            disableFilters: true,
        },
        {
            Header: "Current User",
            accessor: "oCurrUserDesc",
            id: "oCurrUser",
            disableFilters: true,
        },
        {
            Header: "Created User",
            accessor: "oCreatedUser",
            disableFilters: true,
        },
        {
            Header: "Created At",
            accessor: "oCreatedAt",
            disableFilters: true,
            id: "oCreatedAt"
        }
    ]);

    const fetchInteractionDetail = (intxnNo) => {
        get(`${properties.INTERACTION_API}/search?q=${intxnNo}`).then((resp) => {
            if (resp.status === 200) {
                const response = resp.data?.[0];
                const data = {
                    ...response,
                    sourceName: 'customer360'
                }
                if (response.customerUuid) {
                    sessionStorage.setItem("customerUuid", response.customerUuid)
                    sessionStorage.setItem("customerIds", response.customerId)
                }
                history.push(`${process.env.REACT_APP_BASE}/interaction360`, { data })
            } else {
                //
            }
        }).catch(error => {
            console.log(error);
        });
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.id === "oIntxnNo") {
            return (<span onClick={() => fetchInteractionDetail(cell.value)} style={{ cursor: 'pointer', color: 'rgb(80, 154, 222)' }}>{cell.value}</span>);
        }
        if (cell.column.id === "oCurrUser") {
            return (<span>{cell.value ?? "Others"}</span>);
        } else if (cell.column.id === "oCreatedAt") {
            return (<span>{moment(cell.value).format("DD-MM-YYYY hh:mm:ss")}</span>)
        }
        return (<span>{cell.value}</span>)
    }

    const getUniqueRecords = (rows, uniqueKey) => [...new Map(rows.map(item => [item[uniqueKey], item])).values()];

    const getStatusWiseData = (status) => {
        setSelectedStatus(status)
        if (filterType) {
            let searchPayload = { ...searchParams, category: filterType }
            searchPayload.status = [{ "label": "", "value": status }]
            post(properties.INTERACTION_API + "/interaction-by-priority-status-wise-list", { searchParams: searchPayload }).then((resp) => {
                if (resp?.status == 200) {
                    let records = getUniqueRecords(resp?.data?.rows?.filter((ele) => !["NEW", "CANCELLED", "CLOSED"].includes(ele?.oStatusCode)) ?? [], 'oIntxnNo');
                    records.sort((a, b) => {
                        return a.oIntxnId - b.oIntxnId;
                    });
                    setTableData(records)
                }
            }).catch((error) => console.log(error));
            return
        } else {
            const filteredStatusData = statusListData?.filter((ele) => !["NEW", "CANCELLED", "CLOSED"].includes(ele?.oStatusCode))
            console.log('filteredStatusData------->', filteredStatusData)
            let records = getUniqueRecords(filteredStatusData?.filter((ele) => ele?.oStatusCode === status), 'oIntxnNo');
            records.sort((a, b) => {
                return a.oIntxnId - b.oIntxnId;
            });
            setTableData(records)
        }
    }

    const [selectedStatus, setSelectedStatus] = useState();
    const countWipStatusClicked = (item) => {
        if (filterType) {
            if (item?.length > 0) {
                const filteredStatus = item?.map((ele) => ele?.oStatusCode);
                const uniqueArray = [...new Set(filteredStatus)];
                const tabs = priorityStatusData?.filter((ele) => !["NEW", "CANCELLED", "CLOSED"].includes(ele?.oStatusCode)).map((ele) => {
                    return { code: ele?.oStatusCode, description: ele?.oStatusDesc }
                })
                setWipTabs(Array.from(new Set(tabs.map(JSON.stringify))).map(JSON.parse))
                getStatusWiseData(uniqueArray[0]);
                setIsWipTblOpen({ ...isWipTblOpen, view: true });
                return
            }
        } else {
            console.log('item------------>', item)
            const filteredStatusData = statusListData?.filter((ele) => !["NEW", "CANCELLED", "CLOSED"].includes(ele?.oStatusCode))
            console.log('filteredStatusData------->', filteredStatusData)
            // filteredStatusData?.map((ele)=>ele?.)
            const tabs = filteredStatusData?.map((ele) => {
                return { code: ele?.oStatusCode, description: ele?.oStatus }
            })
            let wips = Array.from(new Set(tabs.map(JSON.stringify))).map(JSON.parse);
            setWipTabs(wips)
            setSelectedStatus(wips?.[0]?.code);
            let records = getUniqueRecords(filteredStatusData, 'oIntxnNo');
            records.sort((a, b) => {
                return a.oIntxnId - b.oIntxnId;
            });
            setTableData(records)
            setIsWipTblOpen({ ...isWipTblOpen, view: true });
        }
    }

    const countClicked = (item, type) => {
        if (type === 'Priority') {
            if (filterType) {
                let searchPayload = { ...searchParams, category: filterType }
                searchPayload.priority = [{ "label": "", "value": item[0]?.oIntxnPriorityCode }]
                post(properties.INTERACTION_API + "/interaction-by-priority-status-wise-list", { searchParams: searchPayload }).then((resp) => {
                    if (resp?.status == 200) {
                        let records = getUniqueRecords(resp?.data?.rows ?? [], 'oIntxnNo');
                        // let records = getUniqueRecords(resp?.data?.rows?.filter(x => ["NEW", "WIP", "CLOSED"].includes(x.oStatusCode)) ?? [], 'oIntxnNo');

                        records.sort((a, b) => {
                            return b.oIntxnId - a.oIntxnId;
                        });
                        setTableData(records)
                        setIsOpen({ ...isOpen, view: true });
                    }
                }).catch((error) => console.log(error));
                return
            } else {
                let searchPayload = { ...searchParams, category: 'LIST' }
                searchPayload.priority = [{ "label": "", "value": item?.oPriorityCode }]
                post(properties.INTERACTION_API + "/by-priority", { searchParams: searchPayload }).then((resp) => {
                    if (resp?.status == 200) {
                        let records = getUniqueRecords(resp?.data?.rows ?? [], 'oIntxnNo');
                        records.sort((a, b) => {
                            return b.oIntxnId - a.oIntxnId;
                        });
                        setTableData(records)
                        setIsOpen({ ...isOpen, view: true });
                    }
                }).catch((error) => console.log(error));
                return
            }
        }

        if (item !== "All" && !filterType) {
            const filteredStatusData = statusListData?.filter((ele) => ele?.oStatusCode === item?.oStatusCode)
            let records = getUniqueRecords(filteredStatusData, 'oIntxnNo');
            records.sort((a, b) => {
                return b.oIntxnId - a.oIntxnId;
            });
            setTableData(records)
            setIsOpen({ ...isOpen, view: true });
            return
        } else {
            if (filterType) {
                let searchPayload = { ...searchParams, category: filterType }
                if (item !== "All") {
                    searchPayload.status = [{ "label": "", "value": item[0]?.oStatusCode }]
                }
                post(properties.INTERACTION_API + "/interaction-by-priority-status-wise-list", { searchParams: searchPayload }).then((resp) => {
                    if (resp?.status == 200) {
                        let records = getUniqueRecords(resp?.data?.rows ?? [], 'oIntxnNo');
                        // let records = getUniqueRecords(resp?.data?.rows?.filter(x => ["NEW", "WIP", "CLOSED"].includes(x.oStatusCode)) ?? [], 'oIntxnNo');
                        records.sort((a, b) => {
                            return b.oIntxnId - a.oIntxnId;
                        });
                        setTableData(records)
                        setIsOpen({ ...isOpen, view: true });
                    }
                }).catch((error) => console.log(error));
                return
            } else {
                let records = getUniqueRecords(statusListData, 'oIntxnNo');
                records.sort((a, b) => {
                    return b.oIntxnId - a.oIntxnId;
                });
                setTableData(records)
                setIsOpen({ ...isOpen, view: true });
            }
        }
    }

    useEffect(() => {
        post(properties.INTERACTION_API + "/interaction-avg-wise", { searchParams }).then((resp) => {
            if (resp?.status == 200) {
                setAvgData(resp?.data?.rows ?? [])
            }
        }).catch((error) => console.log(error));
        post(properties.INTERACTION_API + "/by-priority", { searchParams }).then((resp) => {
            if (resp?.status == 200) {
                setPriorityData(resp?.data?.rows ?? [])
            }
        }).catch((error) => console.log(error));
        post(properties.INTERACTION_API + "/by-status/count", { searchParams }).then((resp) => {
            if (resp?.status == 200) {
                setStatusData(resp?.data?.rows ?? [])
                // setStatusData(resp?.data?.rows?.filter(x => ["NEW", "WIP", "CLOSED"].includes(x.oStatusCode)) ?? [])
            }
        }).catch((error) => console.log(error));
        post(properties.INTERACTION_API + "/by-status/list", { searchParams }).then((resp) => {
            if (resp?.status == 200) {
                setStatusListData(resp?.data?.rows ?? [])
                // setStatusListData(resp?.data?.rows?.filter(x => ["NEW", "WIP", "CLOSED"].includes(x.oStatusCode)) ?? [])
            }
        }).catch((error) => console.log(error));
    }, [isRefresh, searchParams, isParentRefresh])

    useEffect(() => {
        const chartDom = chartRef.current;
        const myChart = echarts.init(chartDom, null, {
            renderer: 'canvas',
            useDirtyRect: false
        });

        if (filterType === '1D' || filterType === '1W' || filterType === '1Y' || filterType === 'YTD' || filterType === 'ALL') {
            console.log('priorityStatusData----1D--->', priorityStatusData);
            const groupedData = groupBy(priorityStatusData, "oTimeWise");
            const xAxisLabels = Object.keys(groupedData);
            xAxisLabels.sort(function (a, b) {
                return new Date(`${a}`) - new Date(`${b}`);
            });
            console.log("xAxisLabels xxx==> ", xAxisLabels);

            const xAxisData = [];
            for (let index = 0; index < xAxisLabels.length; index++) {
                const item = groupedData[xAxisLabels[index]];
                xAxisData.push({
                    value: Number(item?.length ?? 0),
                    meta: {
                        createdAt: xAxisLabels[index],
                        statusData: [Object.fromEntries(Object.entries(groupedData[xAxisLabels[index]].reduce((acc, { oStatusDesc }) => (acc[oStatusDesc] = (acc[oStatusDesc] || 0) + 1, acc), {})))]
                    }
                })
            }

            const option = {
                title: {
                    show: priorityStatusData.length === 0,
                    textStyle: {
                        color: "grey",
                        fontSize: 20
                    },
                    text: "No interactions found",
                    left: "center",
                    top: "center"
                },
                tooltip: {
                    trigger: "axis",
                    formatter: function (params) {
                        if (params[0]?.data?.meta?.statusData) {
                            const statusCounts = params[0].data.meta.statusData[0];
                            const total = Object.values(statusCounts).reduce((acc, val) => acc + val, 0);
                            const statusEntries = Object.entries(statusCounts).map(([key, value]) => `${key}: ${value}`);
                            let htmlContent = "";
                            statusEntries.forEach((element) => {
                                htmlContent += `<li><i class="fas fa-male text-info mx-2"></i>${element}</li>`
                            })
                            return `
                            <div class="container">
                            <div class="row">
                                <div class="col-12 col-md-6">
                                <ul class="list-group">
                                <li><i class="fas fa-male text-info mx-2"></i>Total Interation: ${total}</li>
                                <hr/>
                                    ` + htmlContent + `
                                </ul>
                                </div>
                            </div>
                            </div>
                            `;
                        }
                        return "";
                    }
                },
                xAxis: {
                    type: 'category',
                    data: xAxisLabels
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        data: xAxisData,
                        type: 'line',
                        smooth: true,
                        color: '#1C64F2',
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 1,
                                    color: 'rgba(28,100,242,0)'
                                },
                                {
                                    offset: 0,
                                    color: 'rgba(28,100,241,0.4)'
                                }
                            ])
                        }
                    }
                ]
            };

            if (option && typeof option === 'object') {
                myChart.setOption(option);
            }
        } else {
            const groupedData = groupBy(statusListData.map(x => ({ ...x, oCreatedAt: moment(x.oCreatedAt).format("DD MMM") })), "oCreatedAt");
            const xAxisLabels = Object.keys(groupedData);
            xAxisLabels.sort(function (a, b) {
                return new Date(`${a}`) - new Date(`${b}`);
            });
            // console.log("xAxisLabels ==> ", xAxisLabels);

            const xAxisData = [];
            for (let index = 0; index < xAxisLabels.length; index++) {
                const item = groupedData[xAxisLabels[index]];
                xAxisData.push({
                    value: Number(item?.length ?? 0),
                    meta: {
                        createdAt: xAxisLabels[index],
                        statusData: [Object.fromEntries(Object.entries(groupedData[xAxisLabels[index]].reduce((acc, { oStatus }) => (acc[oStatus] = (acc[oStatus] || 0) + 1, acc), {})))]
                    }
                })
            }

            const option = {
                title: {
                    show: statusData.length === 0,
                    textStyle: {
                        color: "grey",
                        fontSize: 20
                    },
                    text: "No interactions found",
                    left: "center",
                    top: "center"
                },
                tooltip: {
                    trigger: "axis",
                    formatter: function (params) {
                        if (params[0]?.data?.meta?.statusData) {
                            const statusCounts = params[0].data.meta.statusData[0];
                            const total = Object.values(statusCounts).reduce((acc, val) => acc + val, 0);
                            const statusEntries = Object.entries(statusCounts).map(([key, value]) => `${key}: ${value}`);
                            let htmlContent = "";
                            statusEntries.forEach((element) => {
                                htmlContent += `<li><i class="fas fa-male text-info mx-2"></i>${element}</li>`
                            })
                            return `
                            <div class="container">
                            <div class="row">
                                <div class="col-12 col-md-6">
                                <ul class="list-group">
                                <li><i class="fas fa-male text-info mx-2"></i>Total Interation: ${total}</li>
                                <hr/>
                                    ` + htmlContent + `
                                </ul>
                                </div>
                            </div>
                            </div>
                            `;
                        }
                        return "";
                    }
                },
                xAxis: {
                    type: 'category',
                    data: xAxisLabels
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        data: xAxisData,
                        type: 'line',
                        smooth: true,
                        color: '#1C64F2',
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                {
                                    offset: 1,
                                    color: 'rgba(28,100,242,0)'
                                },
                                {
                                    offset: 0,
                                    color: 'rgba(28,100,241,0.4)'
                                }
                            ])
                        }
                    }
                ]
            };
            if (option && typeof option === 'object') {
                myChart.setOption(option);
            }
        }

        window.addEventListener('resize', myChart.resize);

        return () => {
            window.removeEventListener('resize', myChart.resize);
            myChart.dispose();
        };
    }, [statusListData, priorityStatusData, filterType]);

    const colorClasses = {
        status: {
            WIP: "#FF9E45",
            CANCELLED: "rgb(0, 143, 251)",
            CLOSED: "#D85454",
            PEND: "rgb(119, 93, 208)",
            REASSIGNED: "rgb(0, 227, 150)",
            REJECT: "rgba(254, 176, 25, 0.85)",
            NEW: "#509ADE",
            ASSIGNED: "rgba(119, 93, 100, 0.85)",
            APPROVED: "rgba(119, 200, 208, 0.85)"
        },
        priority: {
            PRTYLOW: "#509ADE",
            PRTYHGH: "#D85454",
            PRTYMED: "#FF9E45"
        }
    }

    const getStatusCard = (status, label) => {
        if (filterType) {
            if (status === "WIP") {
                console.log('priorityStatusData-------->', priorityStatusData)
                const item = priorityStatusData.filter(x => !["NEW", "CANCELLED", "CLOSED"].includes(x.oStatusCode));
                return (
                    <div className={`skel-kpi-box sk-int-total-cr`} style={{ backgroundColor: colorClasses['status'][status] }}>
                        <span>{label}</span>
                        <span className="font-bold cursor-pointer" onClick={() => countWipStatusClicked(item)}>
                            {item?.reduce((accumulator, object) => {
                                return accumulator + Number(object?.oIntxnCnt) ?? 0;
                            }, 0)}
                        </span>
                    </div>
                )
            } else {
                const item = priorityStatusData.filter(x => x.oStatusCode == status);
                return (
                    <div className={`skel-kpi-box sk-int-total-cr`} style={{ backgroundColor: colorClasses['status'][status] }}>
                        <span>{label}</span>
                        <span className="font-bold cursor-pointer" onClick={() => countClicked(item)}>
                            {item?.reduce((accumulator, object) => {
                                return accumulator + Number(object?.oIntxnCnt) ?? 0;
                            }, 0)}
                        </span>
                    </div>
                )
            }
        } else {
            if (status === "WIP") {
                const item = statusData.filter((x) => !["NEW", "CANCELLED", "CLOSED"].includes(x.oStatusCode));
                return (
                    <div className={`skel-kpi-box sk-int-total-cr`} style={{ backgroundColor: colorClasses['status'][status] }}>
                        <span>{label}</span>
                        <span className="font-bold cursor-pointer" onClick={() => countWipStatusClicked(item)}>  {item?.reduce((accumulator, object) => {
                            return accumulator + Number(object?.oIntxnCount) ?? 0;
                        }, 0)} </span>
                    </div>
                )
            } else {
                const item = statusData.find(x => x.oStatusCode === status);
                return (
                    <div className={`skel-kpi-box sk-int-total-cr`} style={{ backgroundColor: colorClasses['status'][status] }}>
                        <span>{label}</span>
                        <span className="font-bold cursor-pointer" onClick={() => countClicked(item)}> {item?.oIntxnCount ?? 0} </span>
                    </div>
                )
            }
        }
    }

    const getTotalInteractionCard = (status, label) => {
        if (filterType) {
            return (
                <>
                    <span>Total Interaction</span>
                    <span className="font-bold cursor-pointer" onClick={() => countClicked('All')}>
                        {priorityStatusData?.reduce((accumulator, object) => {
                            return accumulator + Number(object?.oIntxnCnt) ?? 0;
                        }, 0)}
                    </span>
                </>
            )
        } else {
            return (
                <>
                    <span>Total Interaction</span>
                    <span className="font-bold cursor-pointer" onClick={() => countClicked('All')}>
                        {statusData?.filter(x => x.oStatusCode != 'CANCELLED')?.reduce((accumulator, object) => {
                            return accumulator + Number(object?.oIntxnCount) ?? 0;
                        }, 0)}
                    </span>
                </>
            )
        }
    }

    const getPriorityCard = (priority, label) => {
        if (filterType) {
            const item = priorityStatusData.filter(x => x.oIntxnPriorityCode == priority);
            return (
                <div className="skel-lvl">
                    <span className="skel-sm-heading">{label}</span>
                    <span className="skel-pr-high cursor-pointer" style={{ backgroundColor: colorClasses['priority'][priority] }} onClick={() => countClicked(item, 'Priority')}>
                        {item?.reduce((accumulator, object) => {
                            return accumulator + Number(object?.oIntxnCnt) ?? 0;
                        }, 0)}
                    </span>
                </div>
            )
        } else {
            const item = priorityData.find(x => x.oPriorityCode == priority);
            return (
                <div className="skel-lvl">
                    <span className="skel-sm-heading">{label}</span>
                    <span className="skel-pr-high cursor-pointer" style={{ backgroundColor: colorClasses['priority'][priority] }} onClick={() => countClicked(item, 'Priority')}>{
                        item?.oIntxnCount ?? 0}</span>
                </div>
            )
        }
    }

    const filterBySpan = (span) => {
        post(properties.INTERACTION_API + "/interaction-by-priority-status-wise", { searchParams: { ...searchParams, category: span } }).then((resp) => {
            if (resp?.status == 200) {
                setFilterType(span);
                setPriorityStatusData(resp?.data?.rows ?? [])
                // setPriorityStatusData(resp?.data?.rows?.filter(x => ["NEW", "WIP", "CLOSED"].includes(x.oStatusCode)) ?? [])
            }
        }).catch((error) => console.log(error));
    }

    return (
        <div className="cmmn-skeleton">
            <div className="skel-dashboard-title-base">
                <span className="skel-header-title"> Overview </span>
                <div className="skel-dashboards-icons">
                    <a href="javascript:void(null)" onClick={() => setIsRefresh(!isRefresh)}>
                        <i className="material-icons" >refresh</i>
                    </a>
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-kpi-metrics-overview mt-4">
                <div className="row">
                    <div className="col-md-3 col-sm-6 col-xs-12">
                        <div className="skel-kpi-box sk-int-total-int">
                            {getTotalInteractionCard("TOTAL", "Total Interaction")}
                        </div>
                    </div>
                    <div className="col-md-3 col-sm-6 col-xs-12">
                        {getStatusCard("NEW", "Open Interaction")}
                    </div>
                    <div className="col-md-3 col-sm-6 col-xs-12">
                        {getStatusCard("WIP", "Work in progress")}
                    </div>
                    <div className="col-md-3 col-sm-6 col-xs-12">
                        {getStatusCard("CLOSED", "Closed Interaction")}
                    </div>
                </div>
                <div className="row mt-3">
                    <div className="col-md-6">
                        <div className="skel-avg-info"> (Avg. Interaction by last month)<span className="font-bold pl-2 pr-0"> {avgData?.length ? avgData[0]?.oAvgCnt : ''} </span>
                            <p className="skel-graph-positive mt-0 mb-0">
                                <img src={PositiveUpArrow} className="img-fluid mr-1" />
                                <span>{avgData?.length ? avgData[0]?.oDifference : 0}%</span>
                            </p>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <ul className="skel-date-filter">
                            <li onClick={() => filterBySpan('1D')}>
                                <span className="cursor-pointer">1D</span>
                            </li>
                            <li onClick={() => filterBySpan('1W')}>
                                <span className="cursor-pointer">1W</span>
                            </li>
                            <li onClick={() => filterBySpan('1M')}>
                                <span className="cursor-pointer">1M</span>
                            </li>
                            <li onClick={() => filterBySpan('1Y')}>
                                <span className="cursor-pointer">1Y</span>
                            </li>
                            <li onClick={() => filterBySpan('YTD')}>
                                <span className="cursor-pointer"> YTD </span>
                            </li>
                            <li onClick={() => filterBySpan('ALL')}>
                                <span className="cursor-pointer"> ALL </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="skel-graph-sect">
                <div width="100%">
                    <div ref={chartRef} style={{ height: '375px' }}></div>
                </div>
            </div>
            <div className="skel-priority-lvl">
                {getPriorityCard("PRTYHGH", "High")}
                {getPriorityCard("PRTYMED", "Medium")}
                {getPriorityCard("PRTYLOW", "Low")}
            </div>
            <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={isOpen.view} onHide={() => setIsOpen({ ...isOpen, view: false })} dialogClassName="wsc-cust-mdl-temp-prev">
                <Modal.Header>
                    <Modal.Title><h5 className="modal-title">Interaction by Status</h5></Modal.Title>
                    <CloseButton onClick={() => setIsOpen({ ...isOpen, view: false })} style={{ backgroundColor: 'transparent', fontWeight: 700, color: '#373737', fontSize: '1.5rem' }}>
                        <span>×</span>
                    </CloseButton>
                </Modal.Header>
                <Modal.Body>
                    <div className="col-lg-12 col-md-12 col-xs-12">
                        <DynamicTable
                            row={tableData ?? []}
                            itemsPerPage={10}
                            header={columns}
                            columnFilter={true}
                            handler={{
                                handleCellRender: handleCellRender,
                            }}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ display: 'block' }}>
                    <div className="skel-btn-center-cmmn">
                        <button type="button" className="skel-btn-cancel" onClick={() => setIsOpen({ ...isOpen, view: false })}>Close</button>
                    </div>
                </Modal.Footer>
            </Modal>

            <Modal size="lg" aria-labelledby="contained-modal-title-vcenter" centered show={isWipTblOpen.view} onHide={() => setIsWipTblOpen({ ...isWipTblOpen, view: false })} dialogClassName="wsc-cust-mdl-temp-prev">
                <Modal.Header>
                    <Modal.Title><h5 className="modal-title">Interaction by Status</h5></Modal.Title>
                    <CloseButton onClick={() => setIsWipTblOpen({ ...isWipTblOpen, view: false })} style={{ backgroundColor: 'transparent', fontWeight: 700, color: '#373737', fontSize: '1.5rem' }}>
                        <span>×</span>
                    </CloseButton>
                </Modal.Header>
                <Modal.Body>
                    <div className="col-lg-12 col-md-12 col-xs-12">
                        <div className="tabbable" style={{ overflowX: "auto" }}>
                            <ul className="nav nav-tabs mb-2" id="myTab" role="tablist" >
                                {wipTabs?.length > 0 && wipTabs?.map((ele) => (
                                    <li className="nav-item" key={ele.code}>
                                        <a
                                            className={`nav-link ${ele?.code === wipTabs?.[0]?.code && 'active'}`}
                                            id="me-tab"
                                            data-toggle="tab"
                                            role="tab"
                                            aria-controls="me"
                                            aria-selected="true"
                                            onClick={() => getStatusWiseData(ele.code)}
                                        >
                                            {ele.description}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <DynamicTable
                            row={tableData?.filter(x => x.oStatusCode == selectedStatus) ?? []}
                            itemsPerPage={10}
                            header={columns}
                            columnFilter={true}
                            handler={{
                                handleCellRender: handleCellRender,
                            }}
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer style={{ display: 'block' }}>
                    <div className="skel-btn-center-cmmn">
                        <button type="button" className="skel-btn-cancel" onClick={() => setIsWipTblOpen({ ...isWipTblOpen, view: false })}>Close</button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div >
    );
};

export default Overview;