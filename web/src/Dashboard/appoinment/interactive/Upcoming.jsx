import React, { useEffect, useRef, useState } from "react";
import DynamicTable from '../../../common/table/DynamicTable';
import { properties } from "../../../properties";
import { unstable_batchedUpdates } from 'react-dom';
import moment from 'moment';
import { post } from "../../../common/util/restUtil";
import { upcomingColumns } from "./Columns/columns";
import ReAssignModal from "./ReAssignModal";
import Filter from "../informative/Filter";

const Upcoming = (props) => {
    const { selectedCustomer, isUpcomingRefresh, statusReason, searchParams, isOpen } = props.data
    const { setSelectedInteraction, setSelectedOrder, setSelectedEntityType, setSelectedCustomer, setIsUpcomingRefresh } = props.handlers
    const [totalCount, setTotalCount] = useState(0)
    const [appoinments, setAppoinments] = useState([])
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [isPopOpen, setIsPopOpen] = useState(false);
    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);
    const [filterParams, setFilterParams] = useState()

    const filtration = (e) => {
        console.log('val-------->', e?.target?.value);
        setFilterParams({ tran_category_type: e?.target?.value })
    }

    useEffect(() => {
        fetchData();
    }, [currentPage, perPage, isUpcomingRefresh, searchParams, filterParams]);

    const fetchData = () => {
        post(properties.APPOINTMENT_API + `/get-upcoming-appoinments?page=${currentPage}&limit=${perPage}&valueParam=AS_SCHED`, { date: new Date(), searchParams, filterParams }).then((resp) => {
            if (resp) {
                console.log('resp?.data?.rows ', resp?.data?.rows)
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
        if (cell.column.id === "createdAt") {
            return (<span>{moment(row.original?.created_at).format('DD MMM YYYY')}</span>)
        }
        if (cell.column.id === "appointmentDate") {
            return (<span>{moment(row.original?.appoint_date).format('DD MMM YYYY')}</span>)
        }
        if (cell.column.id === "appointStartTime") {
            return (<p className="skel-time"><i className="material-icons">schedule</i> {row.original?.appoint_start_time + ' - ' + row.original?.appoint_end_time}</p>
            )
        }
        if (cell.column.id === "appointModeValue") {
            return ((row.original?.appoint_mode === 'AUDIO_CONF') ? <a target="_blank" href={row.original?.appoint_mode_value}><button className="skel-btn-submit btn-mic"><i
                className="material-icons ml-0">videocam</i>Join</button></a>
                : (row.original?.appoint_mode === 'VIDEO_CONF') ? <a target="_blank" href={row.original?.appoint_mode_value}><button className="skel-btn-submit  btn-video "><i
                    className="material-icons ml-0">videocam</i>Join</button></a>
                    : <span>{row.original?.status_description}</span>
            )
        } else if (cell.column.id === "Action") {
            return (
                <>
                    <div className="d-flex">
                        <button id="reAssignBtn" className="skel-btn-submit"
                            data-target="#reassignModal"
                            data-toggle="modal" onClick={() => handlePopUpModal(row.original)}>ReAssign</button>
                        <button id="viewRightInteractionModal" className="skel-btn-submit" onClick={() => handleOpenRightModal(row.original)} data-toggle="modal" data-target="#view-right-modal">View</button>
                    </div>
                </>
            )
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    const handleOpenRightModal = (ele) => {
        if (ele?.tran_category_type === 'INTERACTION') {
            console.log('heere----------')
            setSelectedInteraction([ele]);
            setSelectedEntityType('Interaction')
        } else {
            setSelectedOrder([ele]);
            setSelectedEntityType('Order')
        }
    }

    const handlePopUpModal = (ele) => {
        setIsPopOpen(true);
        setSelectedCustomer(ele)
    }

    const [entityType, setEntityType] = useState()

    return (

        <div className="cmmn-skeleton mt-3">
            {!isOpen && <div className="skel-dashboard-title-base">
                <span className="skel-header-title">Upcoming Appointments ({totalCount})</span>
                <div className="skel-dashboards-icons">
                    <a><i className="material-icons" onClick={() => setIsUpcomingRefresh(!isUpcomingRefresh)}>refresh</i></a> &nbsp;&nbsp;&nbsp;&nbsp;
                    <Filter
                        data={{ entityType }}
                        handlers={{
                            filtration,
                            setEntityType
                        }}
                    />
                </div>
            </div>}
            <hr className="cmmn-hline" />
            <div className="">
                <DynamicTable
                    listSearch={[]}
                    listKey={"Upcoming appoinments"}
                    row={appoinments}
                    rowCount={totalCount}
                    header={upcomingColumns}
                    fixedHeader={false}
                    itemsPerPage={perPage}
                    isScroll={true}
                    backendPaging={true}
                    isTableFirstRender={isTableFirstRender}
                    hasExternalSearch={hasExternalSearch}
                    backendCurrentPage={currentPage}
                    url={properties.APPOINTMENT_API + `/upcoming-appoinments?page=${currentPage}&limit=${perPage}`}
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
            {
                isPopOpen && <ReAssignModal data={{ selectedCustomer, isOpen: isPopOpen, isUpcomingRefresh, statusReason }} handlers={{ setIsOpen: setIsPopOpen, setIsUpcomingRefresh }} />
            }

        </div>

    )
}

export default Upcoming;


