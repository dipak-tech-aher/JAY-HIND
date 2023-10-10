import React from "react";
import DynamicTable from '../../../common/table/DynamicTable';
import moment from 'moment';

const PopupListModal = (props) => {
    const { isTableFirstRender, hasExternalSearch, list, entityType, count, fixedHeader, itemsPerPage, isScroll, backendCurrentPage, backendPaging, isPopupOpen, headerColumn } = props.data;
    const { handlePageSelect, setPerPage, setCurrentPage, setIsPopupOpen } = props.handlers

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
                        header={headerColumn}
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


