import React, { useEffect, useState } from "react";
import DynamicTable from '../../../common/table/DynamicTable';
import { properties } from "../../../properties";
import { unstable_batchedUpdates } from 'react-dom';
import moment from 'moment';

import { post } from "../../../common/util/restUtil";
import { ClosedHistoryColumns } from "./Columns/columns";
import Filter from "../informative/Filter";

const ClosedHistory = (props) => {
    const { searchParams } = props?.data
    const [isRefresh, setIsRefresh] = useState(false);
    const [totalCount, setTotalCount] = useState(0)
    const [appoinments, setAppoinments] = useState([])
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filterParams, setFilterParams] = useState()

    const filtration = (e) => {
        console.log('val-------->', e?.target?.value);
        setFilterParams({ tran_category_type: e?.target?.value })
    }

    useEffect(() => {
        fetchData();
    }, [currentPage, perPage, isRefresh, searchParams, filterParams]);

    const fetchData = () => {
        post(properties.APPOINTMENT_API + `/get-closed-appoinments?page=${currentPage}&limit=${perPage}&valueParam=AS_COMP_SUCCESS,AS_COMP_UNSUCCESS`, { date: new Date(), searchParams, filterParams }).then((resp) => {
            if (resp) {
                unstable_batchedUpdates(() => {
                    setTotalCount(resp?.data?.count || 0);
                    setAppoinments(resp?.data?.rows || []);
                })
            }
        }).catch((error) => {
            console.log(error)
        })
    };

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.id === "CustomerName") {
            return (<span>{row.original?.first_name + ' ' + row.original?.last_name}</span>)
        }
        if (cell.column.id === "updatedAt") {
            return (<span>{moment(row.original?.updated_at).format('DD MMM YYYY')}</span>)
        }
        if (cell.column.id === "appointmentDate") {
            return (<span>{moment(row.original?.appoint_date).format('DD MMM YYYY')}</span>)
        }
        if (cell.column.id === "appointStartTime") {
            return (<p className="skel-time"><i className="material-icons">schedule</i> {row.original?.appoint_start_time + ' - ' + row.original?.appoint_end_time}</p>
            )
        }
        if (cell.column.id === "appoinmentDuration") {
            const time1 = new Date('May 3, 2023 ' + row.original?.appoint_end_time + '');
            const time2 = new Date('May 3, 2023 ' + row.original?.appoint_start_time + '');
            const diffInMilliseconds = time1 - time2;

            const diffInSeconds = diffInMilliseconds / 1000;
            const minutes = Math.floor(diffInSeconds / 60);
            const seconds = diffInSeconds % 60;
            return (<span>{minutes + ' mins ' + seconds + ' secs'}</span>)
        }
        if (cell.column.id === "appoinmentModeDesc") {
            return (<p className="skel-time"><i className="material-icons">schedule</i> {row.original?.appoint_start_time + ' - ' + row.original?.appoint_end_time}</p>
            )
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }
    const [entityType, setEntityType] = useState()

    return (

        <div className="cmmn-skeleton mt-3">
            <div className="skel-dashboard-title-base">
                <span className="skel-header-title">Closed Appointment History ({totalCount})</span>
                <div className="skel-dashboards-icons">
                    <a ><i className="material-icons" onClick={() => setIsRefresh(!isRefresh)}>refresh</i></a>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <Filter
                        data={{ entityType }}
                        handlers={{
                            filtration,
                            setEntityType
                        }}
                    />
                </div>
            </div>
            <hr className="cmmn-hline" />
            <div className="">
                <DynamicTable
                    listSearch={[]}
                    listKey={"ClosedHistory appoinments"}
                    row={appoinments}
                    rowCount={totalCount}
                    header={ClosedHistoryColumns}
                    fixedHeader={false}
                    itemsPerPage={perPage}
                    isScroll={true}
                    backendPaging={true}
                    // isTableFirstRender={tableRef}
                    // hasExternalSearch={hasExternalSearch}
                    backendCurrentPage={currentPage}
                    url={properties.APPOINTMENT_API + `/ClosedHistory-appoinments?page=${currentPage}&limit=${perPage}`}
                    method='POST'
                    handler={{
                        handleCellRender: handleCellRender,
                        handlePageSelect: handlePageSelect,
                        handleItemPerPage: setPerPage,
                        handleCurrentPage: setCurrentPage
                    }}
                />
            </div>
            {/* <hr className="cmmn-hline" />
            <div className="skel-refresh-info">
                <span><i className="material-icons">refresh</i> Updated 5 mins ago</span>
                <div className="skel-data-records">
                    <span>Total {totalCount} records</span>
                </div>
            </div> */}
        </div>
    )
}

export default ClosedHistory;


