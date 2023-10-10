import React, { useEffect, useState, useRef } from 'react';
import { properties } from "../../../properties";
import { post } from "../../../common/util/restUtil";
import { Modal } from 'react-bootstrap';
import DynamicTable from "../../../common/table/DynamicTable";
import { AgeingWiseColumns } from "../Columns";
import moment from 'moment'
import Chart from './Chart';

const Ageing = (props) => {
    const { searchParams, isParentRefresh, modalStyle } = props?.data;
    const { handleOpenRightModal } = props?.handlers;
    const [ageingWiseData, setAgeingWiseData] = useState([]);
    const [ageingCounts, setAgeingCounts] = useState([]);
    const [filteredAgeingData, setFilteredAgeingData] = useState([]);
    const [isRefresh, setIsRefresh] = useState(false);
    const [show, setShow] = useState(false);
    const tableRef = useRef(true);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [chartAgeing, setChartAgeing] = useState([]);
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
        post(properties.HELPDESK_API + '/open-helpdesk-by-aging')
            .then((response) => {
                setAgeingWiseData(response?.data);
                const AgeingCounts = {};
                response?.data?.forEach(item => {
                    const description = item?.agingCategory;
                    if (AgeingCounts[description]) {
                        AgeingCounts[description]++;
                    } else {
                        AgeingCounts[description] = 1;
                    }
                });
                setAgeingCounts(AgeingCounts);

                const uniqueRecords = [...new Map(response?.data.map(item => [item['helpdeskNo'], item])).values()];

                const statusGroupedInteraction = groupBy(uniqueRecords, 'agingCategory');

                const xAxisData = []
                const yAxisData = []
                for (var key in statusGroupedInteraction) {
                    if (statusGroupedInteraction.hasOwnProperty(key)) {
                        xAxisData.push(key)
                        if (statusGroupedInteraction[key][0]?.agingCategory === '> 10 days') {
                            yAxisData.push({
                                value: statusGroupedInteraction[key].length,
                                itemStyle: {
                                    color: '#a90000'
                                }
                            })
                        } else {
                            yAxisData.push({
                                value: statusGroupedInteraction[key].length,
                                itemStyle: {
                                    color: '#5c7bd9'
                                }
                            })
                        }
                    }
                }

                setChartAgeing([{ xAxisData, yAxisData }]);
            })
            .catch(error => {
                console.error(error);
            });
    }, [isRefresh, isParentRefresh])

    const showDetails = (agentName) => {
        const filteredAgentData = ageingWiseData?.filter((item) => item?.agingCategory === agentName);
        console.log('filteredAgentData------>', filteredAgentData)
        setFilteredAgeingData(filteredAgentData)
        setShow(true)
    }

    const handleClose = () => {
        setShow(false);
        setFilteredAgeingData([]);
    };


    const handleCellRender = (cell, row) => {
        if (cell.column.id === "createdAt") {
            return (<span>
                {moment(cell.value).format('YYYY-MM-DD')}
            </span>)
        }
        if (cell.column.id === "helpdeskNo") {
            return (
                <a href="javascript:void(null)" onClick={() => handleOpenRightModal(row.original)}>{cell?.value}</a>
            )
        }
        if (cell.column.id === "Ageing") {
            return (<span>
                {moment(row.original?.createdAt).fromNow()}
            </span>)
        }
        if (cell.column.id === "assignedAgentDetails") {
            return (<span>
                {cell?.value?.assignedAgentDetails?.firstName + ' ' + cell?.value?.assignedAgentDetails?.lastName}
            </span>)
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    return (
        <div className="col-md-4">
            <div className="cmmn-skeleton">
                <div className="card-body">
                    <div className="skel-dashboard-title-base">
                        <span className="skel-header-title"> Open Helpdesk by Ageing </span>
                        <div className="skel-dashboards-icons">
                            <span>
                                <i className="material-icons" onClick={() => setIsRefresh(!isRefresh)}>refresh</i>
                            </span>
                            {/* <span>
                                <i className="material-icons"> filter_alt </i>
                            </span> */}
                        </div>
                    </div>
                    <hr className="cmmn-hline" />
                </div>
                <div className="card-body py-0">
                    <div className="row">
                        {Object.entries(ageingCounts).map(([description, count]) => (<div className="col-3" key={description}>
                            <div className="text-center">
                                <p className="mb-2 text-truncate"> {description?.replace(/_/g, ' - ')} </p>
                                <h4 className={description === '> 10 days' ? "text-danger cursor-pointer" : "text-primary cursor-pointer"} onClick={() => showDetails(description)}> {count} </h4>
                            </div>
                        </div>))}
                        <div className="col-12 text-center">
                            <div className="skel-graph-sect mt-4">
                                <Chart data={{ chartData: chartAgeing }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Modal show={show} backdrop="static" keyboard={false} onHide={handleClose} style={modalStyle}>
                <Modal.Header>
                    <b>Open Helpdesk by Ageing</b>
                    <button type="button" className="close mr-2" keyboard={false} onClick={handleClose}>
                        <span aria-hidden="true">×</span>
                    </button>
                </Modal.Header>
                <Modal.Body>
                    <DynamicTable
                        listKey={"Assigned"}
                        row={filteredAgeingData}
                        rowCount={filteredAgeingData?.length}
                        header={AgeingWiseColumns}
                        columnFilter={true}
                        fixedHeader={true}
                        itemsPerPage={perPage}
                        isScroll={true}
                        isTableFirstRender={tableRef}
                        backendCurrentPage={currentPage}
                        handler={{
                            handleCellRender: handleCellRender,
                            handlePageSelect: handlePageSelect,
                            handleItemPerPage: setPerPage,
                            handleCurrentPage: setCurrentPage,
                            handleFilters: setFilters
                        }}
                    />
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default Ageing;