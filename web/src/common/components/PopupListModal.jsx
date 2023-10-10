import React from "react";
import DynamicTable from '../../common/table/DynamicTable';
import moment from 'moment';
import { AppointmentColumns } from "./PopupListModalColumns";


const PopupListModal = (props) => {
    const { isTableFirstRender, hasExternalSearch, list, entityType, count, fixedHeader, itemsPerPage, isScroll, backendCurrentPage, backendPaging, isPopupOpen } = props.data
    const { handlePageSelect, setPerPage, setCurrentPage, setIsPopupOpen } = props.handlers

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
            return (((row.original?.appoint_mode === 'AUDIO_CONF' || row.original?.appoint_mode === 'VIDEO_CONF') && row.original?.status == 'AS_SCHED') ? 
                <a target="_blank" href={row.original?.appoint_mode_value}><button className="skel-btn-submit  btn-video ">
                    <i className="material-icons ml-0">videocam</i>Join</button></a>
                    : <span>{row.original?.status_description}</span>
            )
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    return (
        <div className="modal-dialog modal-lg">
            <div className="modal-content">
                <div className="modal-header">
                    <h4 className="modal-title">{entityType}</h4>
                    <button type="button" className="close" onClick={() => setIsPopupOpen(!isPopupOpen)}>×</button>
                </div>
                <div className="modal-body">
                    <DynamicTable
                        listSearch={[]}
                        listKey={entityType}
                        row={list && list.length > 0 ? list : []}
                        rowCount={count ? count : 0}
                        header={AppointmentColumns}
                        fixedHeader={fixedHeader}
                        itemsPerPage={itemsPerPage}
                        isScroll={isScroll}
                        backendPaging={backendPaging}
                        isTableFirstRender={isTableFirstRender}
                        hasExternalSearch={hasExternalSearch}
                        backendCurrentPage={backendCurrentPage}
                        handler={{
                            handleCellRender: handleCellRender,
                            handlePageSelect: handlePageSelect,
                            handleItemPerPage: setPerPage,
                            handleCurrentPage: setCurrentPage
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default PopupListModal;


