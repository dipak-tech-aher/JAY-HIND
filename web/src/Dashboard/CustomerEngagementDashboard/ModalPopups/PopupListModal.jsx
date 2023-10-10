import React, { useState } from "react";
import DynamicTable from '../../../common/table/DynamicTable';
import moment from 'moment';
import { IssueSolvedByColumns, CommonColumns } from "./PopupListModalColumns";

const PopupListModal = (props) => {
    const { list, entityType, count, isPopupOpen } = props.data;
    const { setIsPopupOpen } = props.handlers

    const [perPage, setPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(0)

    const handleCellRender = (cell, row) => {
        if (cell.column.id === "created_at") {
            return (<span>{row.original?.created_at ? moment(row.original?.created_at).format('DD MMM YYYY') : '-'}</span>)
        }
        if (cell.column.id === "registered_date") {
            return (<span>{row?.original?.registered_date ? moment(row.original?.registered_date).format('DD MMM YYYY') : '-'}</span>)
        }
        else {
            return (<span>{cell.value || '-'}</span>)
        }
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
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
                        header={
                            (entityType === 'Order' || entityType === 'Interaction' || entityType === 'Sales') ? CommonColumns
                                : entityType === 'Issues Resolved By' ? IssueSolvedByColumns
                                    : CommonColumns}
                        fixedHeader={true}
                        itemsPerPage={perPage}
                        isScroll={true}
                        backendPaging={false}
                        isTableFirstRender={true}
                        hasExternalSearch={false}
                        backendCurrentPage={currentPage}
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


