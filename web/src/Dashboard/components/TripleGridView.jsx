/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useEffect, useState } from "react";
import { unstable_batchedUpdates } from 'react-dom';
import AgentTable from "./AgentTable";
import ChannelTable from "./ChannelTable";
import DemographicTable from "./DemographicTable";
import { agentTabColums, channelTabColumns, demographicTabColums } from './TripleGridViewColumns';
const TripleGridView = (props) => {
    const [tabMenu, setTabMenu] = useState(
        [{ title: "Channel", id: "channel" },
        { title: "Demographic", id: "demographic" },
        { title: "Agent", id: "agent" }])

    const [isActive, setIsActive] = useState("channel")
    const [exportBtn, setExportBtn] = useState(true)

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
    const { headerName, rowData, url, method, requestBody } = props.data


    const showtab = (selectedMenuId) => {
        setIsActive(selectedMenuId)
    }

    const getFirstTabData = useCallback(() => {
        unstable_batchedUpdates(() => {
            setFirstTabTotalCount(rowData?.channel?.length || 0);
            setFirstTabDetails(rowData?.channel?.data);
        })
    });

    useEffect(() => {
        getFirstTabData();
    }, [getFirstTabData]);

    const getSecondTabData = useCallback(() => {
        unstable_batchedUpdates(() => {
            setSecondTabTotalCount(rowData?.demographic?.length || 0);
            setSecondTabDetails(rowData?.demographic?.data);
        })
    });

    useEffect(() => {
        getSecondTabData();
    }, [getSecondTabData]);

    const getThirdTabData = useCallback(() => {
        unstable_batchedUpdates(() => {
            setThirdTabTotalCount(rowData?.agent?.length || 0);
            setThirdTabDetails(rowData?.agent?.data);
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
                                {tabMenu.map((menu, i) => (
                                    <li key={i} className="nav-item">
                                        <a id="TabList" onClick={() => showtab(menu.id)} to="#" data-toggle="tab" aria-expanded="true" className={"nav-link" + (isActive === menu.id ? ' active' : '')}>{menu.title}</a>
                                    </li>
                                ))}
                            </ul>
                            <div className="col-12 admin-user">
                                {(() => {
                                    switch (isActive) {

                                        case tabMenu[0].id:
                                            return (<div className="card-body" id="datatable">
                                                {
                                                    firstTabDetails && <ChannelTable
                                                        data={{
                                                            listKey: "Channel List",
                                                            row: firstTabDetails,
                                                            rowCount: firstTabTotalCount,
                                                            header: channelTabColumns,
                                                            itemsPerPage: firstTabPerPage,
                                                            exportBtn: exportBtn,
                                                            handleExportButton: setExportBtn,
                                                            url: url,
                                                            requestBody: requestBody,
                                                            method: method,
                                                            handleCellRender: handleCellRender,
                                                            handlePageSelect: handleFirstTabPageSelect,
                                                            handleItemPerPage: setFirstTabPerPage,
                                                            handleCurrentPage: setFirstTabCurrentPage
                                                        }}
                                                    />
                                                }
                                            </div>);
                                        case tabMenu[1].id:
                                            return (<div className="card-body" id="datatable">
                                                {
                                                    secondTabDetails && <DemographicTable
                                                        data={{
                                                            listKey: "Demographic List",
                                                            row: secondTabDetails,
                                                            rowCount: secondTabTotalCount,
                                                            header: demographicTabColums,
                                                            itemsPerPage: secondTabPerPage,
                                                            exportBtn: exportBtn,
                                                            handleExportButton: setExportBtn,
                                                            url: url,
                                                            requestBody: requestBody,
                                                            method: method,
                                                            handleCellRender: handleCellRender,
                                                            handlePageSelect: handleSecondTabPageSelect,
                                                            handleItemPerPage: setSecondTabPerPage,
                                                            handleCurrentPage: setSecondTabCurrentPage
                                                        }}
                                                    />
                                                }
                                            </div>);
                                        case tabMenu[2].id:
                                            return (<div className="card-body" id="datatable">
                                                {
                                                    thirdTabDetails && <AgentTable
                                                        data={{
                                                            listKey: "Agent List",
                                                            row: thirdTabDetails,
                                                            rowCount: thirdTabTotalCount,
                                                            header: agentTabColums,
                                                            itemsPerPage: thirdTabPerPage,
                                                            exportBtn: exportBtn,
                                                            handleExportButton: setExportBtn,
                                                            url: url,
                                                            requestBody: requestBody,
                                                            method: method,
                                                            handleCellRender: handleCellRender,
                                                            handlePageSelect: handleThirdTabPageSelect,
                                                            handleItemPerPage: setThirdTabPerPage,
                                                            handleCurrentPage: setThirdTabCurrentPage
                                                        }}
                                                    />
                                                }
                                            </div>);
                                        default:
                                            return (<div className="card-body" id="datatable">
                                                {
                                                    firstTabDetails && <ChannelTable
                                                        data={{
                                                            listKey: "Channel List",
                                                            row: firstTabDetails,
                                                            rowCount: firstTabTotalCount,
                                                            header: channelTabColumns,
                                                            itemsPerPage: firstTabPerPage,
                                                            exportBtn: exportBtn,
                                                            handleExportButton: setExportBtn,
                                                            url: url,
                                                            requestBody: requestBody,
                                                            method: method,
                                                            handleCellRender: handleCellRender,
                                                            handlePageSelect: handleFirstTabPageSelect,
                                                            handleItemPerPage: setFirstTabPerPage,
                                                            handleCurrentPage: setFirstTabCurrentPage
                                                        }}
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
export default TripleGridView