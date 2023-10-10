import React, { useEffect, useContext, useState, useRef } from "react";
import { properties } from "../../../properties";
import { post } from "../../../common/util/restUtil";
import { AppContext, OpsDashboardContext } from '../../../AppContext';
import moment from 'moment'
import { unstable_batchedUpdates } from 'react-dom';
import FilterComponent from "../../components/FilterComponent";
import DynamicTable from "../../../common/table/DynamicTable";
import { UpcomingAppointmentColumns } from "../Columns";
import ColumnFilterComponent from "../../components/ColumnFilterComponent";
import { toast } from "react-toastify";
import ZoomMtgEmbedded from '@zoomus/websdk/embedded';
import DangerCalSvg from "../../../assets/images/ops/danger-cal.svg"
import EquiSvg from "../../../assets/images/ops/equi.svg"


const UpcomingAppoinments = (props) => {
    // console.log("hii  from upcomig appointments")
    const { auth } = useContext(AppContext)
    const [isRefresh, setIsRefresh] = useState(false);
    const { data, handlers } = useContext(OpsDashboardContext);
    const { meOrMyTeam, viewType, lastDataRefreshTime, searchParams: globalSearchParams, isPageRefresh } = data;
    const { setLastDataRefreshTime } = handlers

    const [queuePageCount, setQueuePageCount] = useState(0);
    const tableRef = useRef(true);
    const hasExternalSearch = useRef(false);
    const [filtering, setFiltering] = useState(false);
    const [filters, setFilters] = useState([]);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [listSearch, setListSearch] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [appointments, setAppointments] = useState([]);
    const [searchParams, setSearchParams] = useState({
        userId: auth?.user?.userId,
        roleId: auth?.currRoleId
    });
    const appointmentsSearchAPI = `${properties.INTERACTION_API}/${meOrMyTeam === 'Me' ? 'get-assigned-appoinments' : 'get-team-assigned-appoinments'}`;

    useEffect(() => {
        setSearchParams({
            ...searchParams,
            ...globalSearchParams
        });
    }, [globalSearchParams])

    const defaultApptOverview = [
        {
            heading: 'Today\'s Appointments',
            data: [
                { code: "AUDIO_CONF", description: "Audio Conference", count: 0 },
                { code: "VIDEO_CONF", description: "Video Conference", count: 0 },
                { code: "CUST_VISIT", description: "Customer Visit", count: 0 },
                { code: "BUS_VISIT", description: "Business Visit", count: 0 },
            ]
        }, {
            heading: 'Upcoming Appointments',
            data: [
                { code: "AUDIO_CONF", description: "Audio Conference", count: 0 },
                { code: "VIDEO_CONF", description: "Video Conference", count: 0 },
                { code: "CUST_VISIT", description: "Customer Visit", count: 0 },
                { code: "BUS_VISIT", description: "Business Visit", count: 0 },
            ]
        }
    ]
    const [appointmentOverview, setAppointmentOverview] = useState(defaultApptOverview)

    const getCount = (arr, value, type) => {
        if (type == 'today') {
            return arr.filter(x => x.appointMode == value && moment(x.appointDate).isSame(moment(), 'day')).length;
        } else {
            return arr.filter(x => x.appointMode == value && moment(x.appointDate).isAfter(moment(), 'day')).length;
        }
    }

    useEffect(() => {
        let searchParamss = {
            ...searchParams,
            type: meOrMyTeam,
            fromDate: new Date(),
            userId: auth?.user?.userId,
            roleId: auth?.currRoleId
        }
        post(`${properties.INTERACTION_API}/get-appointment-overview`, {
            "searchParams": searchParamss,
        }).then((resp) => {
            // console.log("=====> for appointments overview", resp)
            if (resp.status == 200) {
                setAppointmentOverview([
                    {
                        heading: 'Today\'s Appointments',
                        data: [
                            { code: "AUDIO_CONF", description: "Audio Conference", count: getCount(resp.data, 'AUDIO_CONF', 'today') },
                            { code: "VIDEO_CONF", description: "Video Conference", count: getCount(resp.data, 'VIDEO_CONF', 'today') },
                            { code: "CUST_VISIT", description: "Customer Visit", count: getCount(resp.data, 'CUST_VISIT', 'today') },
                            { code: "BUS_VISIT", description: "Business Visit", count: getCount(resp.data, 'BUS_VISIT', 'today') },
                        ]
                    }, {
                        heading: 'Upcoming Appointments',
                        data: [
                            { code: "AUDIO_CONF", description: "Audio Conference", count: getCount(resp.data, 'AUDIO_CONF', 'future') },
                            { code: "VIDEO_CONF", description: "Video Conference", count: getCount(resp.data, 'VIDEO_CONF', 'future') },
                            { code: "CUST_VISIT", description: "Customer Visit", count: getCount(resp.data, 'CUST_VISIT', 'future') },
                            { code: "BUS_VISIT", description: "Business Visit", count: getCount(resp.data, 'BUS_VISIT', 'future') },
                        ]
                    }
                ])
                setTotalCount(resp.data.length);
                setAppointments(resp.data);
                let key = meOrMyTeam === 'Me' ? 'assignedAppointment' : 'assignedToTeamAppointment';
                setLastDataRefreshTime({
                    ...lastDataRefreshTime,
                    [key]: moment().format('DD-MM-YYYY HH:mm:ss')
                });
            } else {
                setAppointmentOverview([...defaultApptOverview]);
                setTotalCount(0);
                setAppointments([]);
            }
        }).catch(err => {
            setAppointmentOverview([...defaultApptOverview]);
            setTotalCount(0);
            setAppointments([]);
        }).finally(() => {
            setFiltering(false);
        });
    }, [isRefresh, meOrMyTeam, searchParams, isPageRefresh])

    const fetchData = async (currentPage, perPage) => {
        let searchParamss = {
            ...searchParams,
            "fromDate": new Date(),
            "limit": null,
            "page": null
        }
        // post(appointmentsSearchAPI, {
        //     "searchParams": searchParamss,
        // }).then((resp) => {
        //     if (resp.data) {
        //         unstable_batchedUpdates(() => {
        //             let count = resp?.data?.count;
        //             let rows = resp?.data?.rows;
        //             if (count) {
        //                 setTotalCount(count);
        //                 const uniqueRecords = [...new Map(rows.map(item => [item['oAppointId'], item])).values()];
        //                 setAppointments([...uniqueRecords]);
        //             } else {
        //                 setTotalCount(0);
        //                 setAppointments([])
        //             }
        //             let key = meOrMyTeam === 'Me' ? 'assignedAppointment' : 'assignedToTeamAppointment';
        //             setLastDataRefreshTime({
        //                 ...lastDataRefreshTime,
        //                 [key]: moment().format('DD-MM-YYYY HH:mm:ss')
        //             });
        //         })
        //     }
        // }).finally(() => {
        //     setFiltering(false);
        // })
    };

    Array.prototype.insert = function (index, ...items) {
        this.splice(index, 0, ...items);
    };

    const [columns, setColumns] = useState(UpcomingAppointmentColumns);

    useEffect(() => {
        if (meOrMyTeam !== "MyTeam") {
            let filteredColumns = UpcomingAppointmentColumns.filter(x => x.id !== 'oCurrUserDesc')
            setColumns([...filteredColumns]);
        }
    }, [meOrMyTeam]);

    useEffect(() => {
        fetchData(currentPage, perPage);
    }, [currentPage, perPage, isRefresh, meOrMyTeam, searchParams, isPageRefresh]);

    useEffect(() => {
        if (filtering) {
            setCurrentPage(0);
            setPerPage(10);
            fetchData(0, 10);
        }
    }, [filtering])

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const capitalizeFirstLetter = (string) => {
        return string?.charAt(0)?.toUpperCase() + string?.slice(1);
    }

    const getSignature = (e) => {
        post(`${properties.APPOINTMENT_API}/get-signature`, {
            appointTxnId: e.target.id
        }).then((resp) => {
            if (resp.status == 200) {
                startMeeting(resp.data)
            }
        }).catch(err => {
            toast.error("Error in opening appointment window")
        });
    }

    const startMeeting = (meetingObj) => {
        const client = ZoomMtgEmbedded.createClient();

        let meetingSDKElement = document.getElementById('meetingSDKElement');

        client.init({
            debug: true,
            zoomAppRoot: meetingSDKElement,
            language: 'en-US',
            customize: {
                meetingInfo: ['topic', 'host', 'mn', 'pwd', 'telPwd', 'invite', 'participant', 'dc', 'enctype'],
                toolbar: {
                    buttons: [
                        {
                            text: 'Custom Button',
                            className: 'CustomButton',
                            onClick: () => {
                                console.log('custom button');
                            }
                        }
                    ]
                }
            }
        });

        client.join(meetingObj)
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.id === "appointTxnId-ID") {
            return (<span>APT0000{cell.value}</span>)
        }
        else if (cell.column.id === "appointMode") {
            return (<span>{row.original?.appointModeDesc?.description}</span>)
        } else if (cell.column.id === "appointModeValue") {
            if (["AUDIO_CONF", "VIDEO_CONF"].includes(row.original?.appointMode)) {
                // return (<button onClick={getSignature} id={row.original.appointTxnId}>Click here</button>)
                return (<a href={cell.value} target="_blank">Click here</a>)
            }
            return (<span>{row.original?.appointModeValueDesc?.description}</span>)
        }
        else if (cell.column.id === "appointStartTime") {
            return (<span>{moment(cell.value, "HH:mm:ss").format("HH:mm")}</span>)
        }
        else if (cell.column.id === "duration") {
            var a = moment(row.original?.appointEndTime, "HH:mm:ss");
            var b = moment(row.original?.appointStartTime, "HH:mm:ss");
            return (<span>{a.diff(b, 'minutes')} mins</span>)
        }
        else if (cell.column.id === "createdAt") {
            return (<span>{moment(row.original?.createdAt).fromNow()}</span>)
        }
        else {
            // console.log(cell.column.id, cell.value)
            return (<span>{cell.value}</span>)
        }
    }

    const [lastUpdatedAt, setLastUpdatedAt] = useState(moment());

    useEffect(() => {
        const interval = setInterval(() => setLastUpdatedAt(moment(meOrMyTeam === 'Me' ? lastDataRefreshTime?.assignedAppointment : lastDataRefreshTime?.assignedToTeamAppointment, "DD-MM-YYYY HH:mm:ss")), 60 * 1000);
        return () => clearInterval(interval);
    }, [lastDataRefreshTime]);

    return (
        <div className="cmmn-skeleton">
            <div className="skel-dashboard-title-base">
                <span className="skel-header-title">Upcoming Appointments ({totalCount})</span>
                <div className="skel-dashboards-icons">
                    {/* <a ><i className="material-icons">fullscreen</i></a> */}
                    <a ><i className="material-icons" onClick={() => setIsRefresh(!isRefresh)}>refresh</i></a>
                    <FilterComponent
                        data={{
                            filtering,
                            componentName: 'APPOINTMENTS'
                        }}
                        handlers={{
                            setSearchParams,
                            setFiltering
                        }}
                    />
                    <ColumnFilterComponent
                        data={{
                            sourceColumns: UpcomingAppointmentColumns
                        }}
                        handlers={{
                            setColumns
                        }}
                    />
                </div>
            </div>
            <hr className="cmmn-hline" />
            {meOrMyTeam === "Me" && (
                <div className="row">
                    <div className="col-md-12">
                        <div className="skel-dashboard-tiles">
                            <div className="skel-tile-sect-appt">
                                <div className="skel-tile-info-appt">
                                    <div className="row mb-2">
                                        {appointmentOverview.length > 0 && appointmentOverview.map((e1, i1) => (
                                            <div key={i1} className="skel-tile-data col-md-6">
                                                <span>{e1?.heading}</span>
                                                <div className="skel-int-tile-appt-info">
                                                    {e1.data.map((e2, i2) => (
                                                            
                                                        <div key={i2} className="skel-tile-info skel-up-appt-info">
                                                            <div className="skel-tile-icon skel-tile-b-color">
                                                                <img alt="" src={EquiSvg} />
                                                            </div>
                                                            <div className="skel-tile-data">
                                                                <p>{e2?.description} </p>
                                                                <span>{e2.count || 0}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="">
                <DynamicTable
                    listSearch={listSearch}
                    listKey={"Assigned Interaction"}
                    row={appointments}
                    rowCount={totalCount}
                    header={columns}
                    fixedHeader={true}
                    // columnFilter={true}
                    customClassName={'table-sticky-header'}
                    itemsPerPage={perPage}
                    isScroll={false}
                    // backendPaging={false}
                    isTableFirstRender={tableRef}
                    // hasExternalSearch={hasExternalSearch}
                    backendCurrentPage={currentPage}
                    url={appointmentsSearchAPI + `?limit=${perPage}&page=${currentPage}`}
                    method='POST'
                    handler={{
                        handleCellRender: handleCellRender,
                        handlePageSelect: handlePageSelect,
                        handleItemPerPage: setPerPage,
                        handleCurrentPage: setCurrentPage,
                        handleFilters: setFilters
                    }}
                />
            </div>
            <hr className="cmmn-hline" />
            <div className="skel-refresh-info">
                <span><i className="material-icons">refresh</i> Updated {moment(lastUpdatedAt).fromNow()}</span>
                <div className="skel-data-records"></div>
            </div>
            {/* Zoom Meeting SDK Component View Rendered Here */}
            <div id="meetingSDKElement"></div>
        </div>
    )
}

export default UpcomingAppoinments;


