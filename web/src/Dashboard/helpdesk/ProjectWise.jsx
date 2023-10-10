import React, { useEffect, useState, useRef } from 'react';
import { properties } from "../../properties";
import { post } from "../../common/util/restUtil";
import { Modal } from 'react-bootstrap';
import DynamicTable from "../../common/table/DynamicTable";
import { ProjectWiseColumns } from "./Columns";
import moment from 'moment'
import { formFilterObject } from '../../common/util/util';

const ProjectWise = (props) => {
    const hasExternalSearch = useRef(false);
    const isTableFirstRender = useRef(true);
    const { searchParams, isParentRefresh, modalStyle } = props?.data;
    const { handleOpenRightModal } = props?.handlers;

    console.log('isParentRefresh-------->', isParentRefresh)
    const [projectWiseData, setProjectWiseData] = useState([]);
    const [filteredProjectsData, setFilteredProjectsData] = useState([]);
    const [projectCounts, setProjectCounts] = useState([]);
    const [isRefresh, setIsRefresh] = useState(false);
    const [show, setShow] = useState(false);
    const tableRef = useRef(true);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(true)
    const [listSearch, setListSearch] = useState([]);
    const [projectName, setProjectName] = useState(null);

    useEffect(() => {
        console.log('filters-------->', filters)
        const requestBody = {
            filters: formFilterObject(filters)
        }
        console.log('requestBody-------->', requestBody)
        setListSearch(requestBody);

        post(properties.HELPDESK_API + '/project-wise', { ...searchParams, ...requestBody })
            .then((response) => {

                setProjectWiseData(response?.data?.rows);
                const projectCounts = {};
                response?.data?.rows?.forEach(item => {
                    const description = item?.projectDesc?.description;
                    if (projectCounts[description]) {
                        projectCounts[description]++;
                    } else {
                        projectCounts[description] = 1;
                    }
                });
                setProjectCounts(projectCounts);
            })
            .catch(error => {
                console.error(error);
            }).finally(() => {
                isTableFirstRender.current = false;
            });
    }, [isRefresh, searchParams, isParentRefresh, currentPage, perPage]);


    const showDetails = (projectName) => {
        console.log('projectName------->', typeof (projectName))
        console.log('projectWiseData------->', projectWiseData)
        setProjectName(projectName);
        if (projectName === 'undefined' || !projectName) {
            const filteredProjectData = projectWiseData?.filter((item) => item?.projectDesc == null || !item?.projectDesc);
            console.log('filteredProjectData--1---->', filteredProjectData)
            setFilteredProjectsData(filteredProjectData)
            setShow(true)
        } else {
            const filteredProjectData = projectWiseData?.filter((item) => item?.projectDesc?.description == projectName);
            console.log('filteredProjectData--2---->', filteredProjectData)
            setFilteredProjectsData(filteredProjectData)
            setShow(true)
        }

    }

    const handleClose = () => {
        setShow(false);
        setFilteredProjectsData([]);
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
                // <div title='View' onClick={() => handleOpenRightModal(row.original?.oHelpdeskId)} className="action-view" data-toggle="modal" data-target="#view-right-modal">{cell?.value}</div>
            )
        }
        if (cell.column.id === "assignedAgentDetails") {
            return (<span>
                {cell?.value?.assignedAgentDetails?.firstName + ' ' + cell?.value?.assignedAgentDetails?.lastName}
            </span>)
        }
        if (cell.column.id === "currUser") {
            return (<span>
                {cell?.value?.firstName + ' ' + cell?.value?.lastName}
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
            <div className="cmmn-skeleton mh-480">
                <div className="card-body">
                    <div className="skel-dashboard-title-base">
                        <span className="skel-header-title"> Project wise Open Helpdesk </span>
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
                    <div id="cardCollpase5cn" className='mt-4'>
                        <table className="table table-hover mb-0 table-centered table-nowrap">
                            <tbody>
                                {Object.entries(projectCounts).map(([description, count]) => (<tr key={description}>
                                    <td>
                                        <h5 className="font-size-14 mb-0 skel-font-sm-bold"> {
                                            description == 'undefined' ? 'Unclassified' : description?.toUpperCase() === "DTWORKS" ? 'dtWorks' : description.charAt(0).toUpperCase() + description.slice(1).toLowerCase()} </h5>
                                    </td>
                                    <td>
                                        <p className="text-dark mb-0 cursor-pointer" onClick={(e) => showDetails(description)}> {count} </p>
                                    </td>
                                </tr>))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Modal show={show} backdrop="static" keyboard={false} onHide={handleClose} style={modalStyle}>
                <Modal.Header>
                    <b>Project Wise Open Helpdesk Details</b>
                    <button type="button" className="close mr-2" keyboard={false} onClick={handleClose}>
                        <span aria-hidden="true">×</span>
                    </button>
                </Modal.Header>
                <Modal.Body>
                    <DynamicTable
                        listSearch={listSearch}
                        listKey={`Project Wise Helpdesk`}
                        row={filteredProjectsData}
                        rowCount={filteredProjectsData?.length}
                        header={ProjectWiseColumns}
                        itemsPerPage={perPage}
                        backendPaging={true}
                        isTableFirstRender={isTableFirstRender}
                        hasExternalSearch={hasExternalSearch}
                        backendCurrentPage={currentPage}
                        exportBtn={exportBtn}
                        url={properties.HELPDESK_API + `/project-wise`}
                        method='POST'
                        handler={{
                            handleCellRender: handleCellRender,
                            handlePageSelect: handlePageSelect,
                            handleItemPerPage: setPerPage,
                            handleCurrentPage: setCurrentPage,
                            handleExportButton: setExportBtn,
                            handleFilters: setFilters
                        }}
                    />
                    {/* {filteredProjectsData?.length > 0 && <DynamicTable
                        listSearch={listSearch}
                        listKey={"Project Wise Helpdesk"}
                        row={filteredProjectsData}
                        rowCount={filteredProjectsData?.length}
                        header={ProjectWiseColumns}
                        fixedHeader={true}
                        itemsPerPage={perPage}
                        isScroll={true}
                        isTableFirstRender={tableRef}
                        backendCurrentPage={currentPage}
                        hasExternalSearch={hasExternalSearch}
                        exportBtn={exportBtn}
                        url={`${properties.HELPDESK_API + '/project-wise', searchParams}`}
                        method='POST'
                        handler={{
                            handleCellRender: handleCellRender,
                            handlePageSelect: handlePageSelect,
                            handleItemPerPage: setPerPage,
                            handleCurrentPage: setCurrentPage,
                            handleFilters: setFilters,
                            handleExportButton: setExportBtn
                        }}
                    />} */}
                </Modal.Body>
            </Modal>
        </div>
    )
}

export default ProjectWise;