import React, { useContext, useEffect, useState } from "react";
import ChartComponent from "./ChartComponent";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import Dropdown from 'react-bootstrap/Dropdown';
import FilterComponent from "../../components/FilterComponent";
import { OpsDashboardContext, AppContext } from "../../../AppContext";
import { properties } from "../../../properties";
import { unstable_batchedUpdates } from "react-dom";
import moment from "moment";
import { post } from "../../../common/util/restUtil";
import { isEmpty } from 'lodash'
import ReactSelect from "react-select";


const entityTypes = [
    {
        label: "Appointment Type",
        value: "oAppointTypeDesc"
    }, {
        label: 'Entity Type',
        value: "oTranCategoryTypeDesc"
    },
    {
        label: "User group",
        value: "oUserGroupDesc"
    }]

const AppoinmentHistory = (props) => {
    const { auth } = useContext(AppContext)
    const [isRefresh, setIsRefresh] = useState(false);

    const { data, handlers } = useContext(OpsDashboardContext);
    const { meOrMyTeam, viewType, lastDataRefreshTime, currentTime, searchParams: globalSearchParams, isPageRefresh } = data;
    const { setLastDataRefreshTime, setCurrentTime } = handlers
    const [filtering, setFiltering] = useState(false);
    const [searchParams, setSearchParams] = useState({
        userId: auth?.user?.userId,
        roleId: auth?.currRoleId,
        // fromDate: moment().startOf('month').format("YYYY-MM-DD"),
        // toDate: moment().endOf('month').format("YYYY-MM-DD")
    });
    const [entityType, setEntityType] = useState('oAppointTypeDesc')

    const [appointments, setAppointments] = useState([]);
    const [lastUpdatedAt, setLastUpdatedAt] = useState(moment());

    const appointmentsSearchAPI = `${properties.INTERACTION_API}/${meOrMyTeam === 'Me' ? 'get-assigned-appoinments' : 'get-team-assigned-appoinments'}`;

    const fetchData = async () => {
        let searchParamss = {
            ...searchParams,
        }

        if (meOrMyTeam == 'Me' && (searchParamss?.roleId || searchParamss?.departmentId)) {
            delete searchParamss?.roleId
            delete searchParamss?.departmentId
        }

        post(appointmentsSearchAPI, {
            "searchParams": searchParamss,
        }).then((resp) => {
            if (resp.data) {
                unstable_batchedUpdates(() => {
                    let count = resp?.data?.count;
                    let rows = resp?.data?.rows;
                    if (count) {

                        // let yAxisData = rows.map(r => {
                        //     return {                     
                        //         value: r.count,
                        //         itemStyle: {
                        //             color: '#CB4335' // chroma.random().darken().hex()
                        //         }
                        //     }
                        // })
                        const uniqueRecords = [...new Map(rows.map(item => [item['oAppointTxnId'], item])).values()];

                        const statusGrouped = groupBy(uniqueRecords, entityType);
                        let yAxisData = Object.keys(statusGrouped);
                        const legend = yAxisData;
                        const scheduledRecords = uniqueRecords.map(f => {
                            if (['AS_CANCEL', 'AS_COMP_UNSUCCESS', 'AS_COMP_SUCCESS', 'AS_SCHED'].includes(f.oStatus)) {
                                return {
                                    ...f,
                                    oStatusDesc: 'Scheduled'
                                }

                            }
                        })

                        const upComingRecords = uniqueRecords.filter(f => {
                            if (['AS_SCHED'].includes(f.oStatus) && new Date(f.oAppointDate) > new Date()) {
                                return {
                                    ...f,
                                    oStatusDesc: 'Upcoming'
                                }
                            }
                        })

                        const finalRecords = [
                            ...scheduledRecords,
                            ...uniqueRecords,
                            ...upComingRecords,
                        ]

                        // console.log('finalRecords ', finalRecords)  

                        const xAxisData = new Set([...finalRecords.map(n => n.oStatusDesc)])
                        // const legend = new Set([...finalRecords.map(n => n.oAppointTypeDesc)])
                        const seriesData = new Set()

                        for (const l of Array.from(legend)) {
                            let data = []

                            for (const x of Array.from(xAxisData)) {
                                let filteredData = []
                                finalRecords.filter(ch => {
                                    if (ch.oStatusDesc === x && ch[entityType] === l) {
                                        filteredData.push(ch)
                                    }
                                })
                                data.push(filteredData.length === 0 ? '' : filteredData.length)
                            }

                            const obj = {
                                barMaxWidth: 100,
                                name: l,
                                type: 'bar',
                                barGap: 0,
                                emphasis: {
                                    label: {
                                        show: true,
                                        fontSize: '15',
                                        fontWeight: 'bold'
                                    }
                                },
                                label: {
                                    show: true,
                                    position: "insideBottom",
                                    distance: 15,
                                    align: "left",
                                    verticalAlign: "middle",
                                    fontSize: 16,
                                },
                                data: data
                            }
                            seriesData.add(obj);
                        }
                        setAppointments([{ yAxisData, xAxisData: Array.from(xAxisData), legend: Array.from(legend), seriesData: Array.from(seriesData) }])

                    } else {
                        setAppointments([])
                    }
                })
            }
            unstable_batchedUpdates(() => {
                if (meOrMyTeam === 'Me') {
                    setLastDataRefreshTime({ ...lastDataRefreshTime, appoinmentHistory: moment().format('DD-MM-YYYY HH:mm:ss') })
                } else {
                    setLastDataRefreshTime({ ...lastDataRefreshTime, appoinmentHistoryTeam: moment().format('DD-MM-YYYY HH:mm:ss') })
                }
            })
        }).catch((error) => {
            console.log(error)
        }).finally(() => {
            setFiltering(false);
        })
    }

    useEffect(() => {
        fetchData();
    }, [isRefresh, meOrMyTeam, entityType, isPageRefresh]);

    useEffect(() => {
        if (filtering) {

            fetchData();
        }
    }, [filtering])

    const groupBy = (items, key) => items.reduce(
        (result, item) => ({
            ...result,
            [item[key]]: [
                ...(result[item[key]] || []),
                item,
            ],
        }),
        {},
    );

    useEffect(() => {
        const interval = setInterval(() => setLastUpdatedAt(moment(meOrMyTeam === 'Me' ? lastDataRefreshTime?.appoinmentHistory : lastDataRefreshTime?.appoinmentHistoryTeam, "DD-MM-YYYY HH:mm:ss")), 60 * 1000);
        return () => clearInterval(interval);
    }, [lastDataRefreshTime]);

    return (
        <div className="cmmn-skeleton">
            <div className="skel-dashboard-title-base">
                <span className="skel-header-title">Appointments Corner</span>
                <ReactSelect
                    className="skel-cust-graph-select"
                    placeholder="Search..."
                    options={entityTypes}

                    menuPortalTarget={document.body}
                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                    value={entityType ? entityTypes.find(c => c.value === entityType) : null}
                    onChange={(val) => setEntityType(val.value)}
                />
                <div className="skel-dashboards-icons">

                    {/* <a ><i className="material-icons">fullscreen</i></a> */}
                    <a ><i className="material-icons" onClick={() => setIsRefresh(!isRefresh)}>refresh</i></a>
                    {/* <FilterComponent
                        data={{
                            filtering,
                            componentName: 'APPOINTMENTS'
                        }}
                        handlers={{
                            setSearchParams,
                            setFiltering
                        }}
                    /> */}
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-perf-sect">
                <div className="skel-perf-graph">
                    <ChartComponent
                        data={{
                            chartData: appointments
                        }}
                    />
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-refresh-info">
                <span><i className="material-icons">refresh</i> Updated {moment(lastUpdatedAt).fromNow()}</span>
                <div className="skel-data-records"></div>
            </div>
        </div>
    )
}

export default AppoinmentHistory;