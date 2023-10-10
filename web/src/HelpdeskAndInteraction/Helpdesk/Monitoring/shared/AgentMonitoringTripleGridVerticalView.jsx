import React, { useCallback, useEffect, useRef, useState} from "react";
import DynamicTable from '../../../../common/table/DynamicTable';
import { MonitoringTableColumns, MonitoringTableHiddenColumns } from './MonitoringTableColumns';
import { unstable_batchedUpdates } from 'react-dom';


const AgentMonitoringTripleGridView = (props) => {

    const [monitoringGirdTabMenu, setMonitoringGirdTabMenu] = useState([{ title: "30 Days", id: "30Days" },{ title: "60 Days", id: "60Days" },{ title: "90 Days", id: "90Days" }])
    const [isActive ,setIsActive] = useState("30Days")
    const [exportBtn, setExportBtn] = useState(false)
    
    const [firstTabDetails, setFirstTabDetails] = useState([]);
    const [firstTabPerPage, setFirstTabPerPage] = useState(10);
    const [firstTabTotalCount, setFirstTabTotalCount] = useState(0);
    const [firstTabCurrentPage, setFirstTabCurrentPage] = useState(0);

    const [secondTabDetails, setSecondTabDetails] = useState([]);
    const [secondTabPerPage, setSecondTabPerPage] = useState(10);
    const [secondTabTotalCount, setSecondTabTotalCount] = useState(0);
    const [secondTabCurrentPage, setSecondTabCurrentPage] = useState(0);

    const [thirdTabDetails, setThirdTabDetails] = useState([]);
    const [thirdTabPerPage, setThirdTabPerPage] = useState(10);
    const [thirdTabTotalCount, setThirdTabTotalCount] = useState(0);
    const [thirdTabCurrentPage, setThirdTabCurrentPage] = useState(0);
    
    const isTableFirstRender = useRef(true);

    const headerName = props?.data?.headerName;
    const rowData = props?.data?.rowData;
    const showtab = (selectedMenuId) => { setIsActive(selectedMenuId) }


    const getFirstTabData = useCallback(() => {
        unstable_batchedUpdates(() => {
            setFirstTabTotalCount(rowData.length);
            setFirstTabDetails(rowData);
        })
    });

    useEffect(() => {
        getFirstTabData();
    }, [getFirstTabData]);

    const getSecondTabData = useCallback(() => {
        unstable_batchedUpdates(() => {
            setSecondTabTotalCount(rowData.length);
            setSecondTabDetails(rowData);
        })
    });

    useEffect(() => {
        getSecondTabData();
    }, [getSecondTabData]);

    const getThirdTabData = useCallback(() => {
        unstable_batchedUpdates(() => {
            setThirdTabTotalCount(rowData.length);
            setThirdTabDetails(rowData);
        })
    });

    useEffect(() => {
        getThirdTabData();
    }, [getThirdTabData]);



    const handleCellRender = (cell, row) => {
        return (
            <span>{cell.value}</span>
        )
    }

    const handleFirstTabPageSelect = (pageNo) => {
        //isFirstRender.current = false
        setFirstTabCurrentPage(pageNo)
    }

    const handleSecondTabPageSelect = (pageNo) => {
        //isFirstRender.current = false
        setSecondTabCurrentPage(pageNo)
    }

    const handleThirdTabPageSelect = (pageNo) => {
        //isFirstRender.current = false
        setThirdTabCurrentPage(pageNo)
    }

    return (
        <>
            <div className="col-lg-12">
                <div>
                    <div className="card-body">
                        <div className="modal-header">
                            <h5>{headerName}</h5>
                        </div>
                        <div className="card-box">
                            <ul className="nav nav-tabs">
                                {monitoringGirdTabMenu.map((menu, i) => (
                                    <li key={i} className="nav-item">
                                        <a id="monitoringGridTabList" onClick={() => showtab(menu.id)} to="#" data-toggle="tab" aria-expanded="true" className={"nav-link" + (isActive === menu.id ? ' active' : '')}>{menu.title}</a>
                                    </li>
                                ))}
                            </ul>
                            <div className="col-12 admin-user">
                                {(() => {
                                    switch (isActive) {
                                        case monitoringGirdTabMenu[0].id:
                                            return ( <div className="card-body" id="datatable">
                                            {
                                                <DynamicTable
                                                    listKey={"Agent List"}
                                                    row={firstTabDetails}
                                                    rowCount={firstTabTotalCount}
                                                    header={MonitoringTableColumns}
                                                    itemsPerPage={firstTabPerPage}
                                                    // backendPaging={true}
                                                    // backendCurrentPage={firstTabCurrentPage}
                                                    hiddenColumns={MonitoringTableHiddenColumns}
                                                    exportBtn={exportBtn}
                                                    handler={{
                                                        handleExportButton: exportBtn,
                                                        handleCellRender: handleCellRender,
                                                        handlePageSelect: handleFirstTabPageSelect,
                                                        handleItemPerPage: firstTabPerPage,
                                                        handleCurrentPage: firstTabCurrentPage
                                                    }
                                                    }
                                                />
                                            }
                                        </div>);
                                        case monitoringGirdTabMenu[1].id:
                                            return (<div className="card-body" id="datatable">
                                            {
                                                <DynamicTable
                                                    listKey={"Agent List"}
                                                    row={secondTabDetails}
                                                    rowCount={secondTabTotalCount}
                                                    header={MonitoringTableColumns}
                                                    itemsPerPage={secondTabPerPage}
                                                    // backendPaging={true}
                                                    // backendCurrentPage={firstTabCurrentPage}
                                                    hiddenColumns={MonitoringTableHiddenColumns}
                                                    exportBtn={exportBtn}
                                                    handler={{
                                                        handleExportButton: exportBtn,
                                                        handleCellRender: handleCellRender,
                                                        handlePageSelect: handleSecondTabPageSelect,
                                                        handleItemPerPage: secondTabPerPage,
                                                        handleCurrentPage: secondTabCurrentPage
                                                    }
                                                    }
                                                />
                                            }
                                        </div>);
                                        case monitoringGirdTabMenu[2].id:
                                            return (<div className="card-body" id="datatable">
                                            {
                                                <DynamicTable
                                                    listKey={"Agent List"}
                                                    row={thirdTabDetails}
                                                    rowCount={thirdTabTotalCount}
                                                    header={MonitoringTableColumns}
                                                    itemsPerPage={thirdTabPerPage}
                                                    // backendPaging={true}
                                                    // backendCurrentPage={firstTabCurrentPage}
                                                    hiddenColumns={MonitoringTableHiddenColumns}
                                                    exportBtn={exportBtn}
                                                    handler={{
                                                        handleExportButton: exportBtn,
                                                        handleCellRender: handleCellRender,
                                                        handlePageSelect: handleThirdTabPageSelect,
                                                        handleItemPerPage: thirdTabPerPage,
                                                        handleCurrentPage: thirdTabCurrentPage
                                                    }
                                                    }
                                                />
                                            }
                                        </div>);
                                        default:
                                            return (<div className="card-body" id="datatable">
                                            {
                                                <DynamicTable
                                                    listKey={"Agent List"}
                                                    row={firstTabDetails}
                                                    rowCount={firstTabTotalCount}
                                                    header={MonitoringTableColumns}
                                                    itemsPerPage={firstTabPerPage}
                                                    // backendPaging={true}
                                                    // backendCurrentPage={firstTabCurrentPage}
                                                    hiddenColumns={MonitoringTableHiddenColumns}
                                                    exportBtn={exportBtn}
                                                    handler={{
                                                        handleExportButton: setExportBtn,
                                                        handleCellRender: handleCellRender,
                                                        handlePageSelect: handleFirstTabPageSelect,
                                                        handleItemPerPage: setFirstTabPerPage,
                                                        handleCurrentPage: setFirstTabCurrentPage,
                                                    }
                                                    }
                                                />
                                            }
                                        </div>)
                                        ;
                                    }
                                })()}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

        </>
    )

}

export default AgentMonitoringTripleGridView;