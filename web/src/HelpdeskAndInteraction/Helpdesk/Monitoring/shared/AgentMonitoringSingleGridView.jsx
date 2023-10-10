import React, { useCallback, useEffect, useRef, useState } from "react";
import { unstable_batchedUpdates } from 'react-dom';
import DynamicTable from '../../../../common/table/DynamicTable';
import { MonitoringTableColumns, MonitoringTableHiddenColumns } from './MonitoringTableColumns';

const AgentMonitoringSingleGridView = (props) => {

    const [perPage, setPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [exportBtn, setExportBtn] = useState(false)
    const [currentPage, setCurrentPage] = useState(0);
    const [customerDetails, setCustomerDetails] = useState([]);
    const isTableFirstRender = useRef(true);

    const headerName = props?.data?.headerName;
    const rowData = props?.data?.rowData;

    const getAgentData = useCallback(() => {
        unstable_batchedUpdates(() => {
            setTotalCount(rowData.length);
            setCustomerDetails(rowData);
        })
    });

    useEffect(() => {
        getAgentData();
    }, [getAgentData]);

    const handleCellRender = (cell, row) => {
        return (
            <span>{cell.value}</span>
        )
    }

    const handlePageSelect = (pageNo) => {
        //isFirstRender.current = false
        setCurrentPage(pageNo)
    }

    return (
        <>
            <div className="col-lg-12">
                <div>
                    <div className="card-body">
                        <div className="modal-header">
                            <h5>{headerName}</h5>
                        </div>
                        <div className="card-body" id="datatable">
                            {
                                <DynamicTable
                                    listKey={"Agent List"}
                                    row={customerDetails}
                                    rowCount={totalCount}
                                    header={MonitoringTableColumns}
                                    itemsPerPage={perPage}
                                    // backendPaging={true}
                                    // backendCurrentPage={currentPage}
                                    hiddenColumns={MonitoringTableHiddenColumns}
                                    exportBtn={exportBtn}
                                    handler={{
                                        handleExportButton: setExportBtn,
                                        handleCellRender: handleCellRender,
                                        handlePageSelect: handlePageSelect,
                                        handleItemPerPage: setPerPage,
                                        handleCurrentPage: setCurrentPage,
                                    }
                                    }
                                />
                            }
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}

export default AgentMonitoringSingleGridView;