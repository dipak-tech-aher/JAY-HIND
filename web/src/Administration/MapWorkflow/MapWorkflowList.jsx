/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import DynamicTable from '../../common/table/DynamicTable';
import { MappedWorkflowListColumns } from './AddEditMapWorkflowColumns';
import moment from 'moment';

import { post, put } from '../../common/util/restUtil';
import { properties } from '../../properties';
import { Link } from 'react-router-dom';
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';
import { formFilterObject } from '../../common/util/util';

const MapWorkflowList = (props) => {

    const [mappedWorkflowList, setMappedWorkflowList] = useState([]);
    const [selectedMappedWorkflowIdList, setSelectedMappedWorkflowIdList] = useState([]);
    const [isMappedWorkflowListLoading, setIsMappedWorkflowListLoading] = useState(false);
    const [exportBtn, setExportBtn] = useState(true)
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const isTableFirstRender = useRef(true);
    const [templateName, setTemplateName] = useState()

    const getMappedWorkflowList = useCallback((name = templateName) => {
        setIsMappedWorkflowListLoading(true);
        

        const requestBody = {
            mappingName: name
        }

        post(`${properties.WORKFLOW_DEFN_API}/mapped-workflow-list?page=${currentPage}&limit=${perPage}`, requestBody)
            .then((response) => {
                const { status, data } = response;
                if (status === 200 && data) {
                    unstable_batchedUpdates(() => {
                        setTotalCount(data?.count);
                        setMappedWorkflowList(data?.rows);
                        setIsMappedWorkflowListLoading(false);
                    })
                }
            })
            .catch(error => {
                console.error(error);
                setIsMappedWorkflowListLoading(false);
            })
            .finally(() => {
                isTableFirstRender.current = true;
                
            })
    })

    useEffect(() => {
        getMappedWorkflowList();
    }, [perPage, currentPage])

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Select") {
            return (
                <div className="custom-control custom-checkbox">
                    <input type="checkbox" id={`mappedTemplated${row?.original?.mappingId}`} className="custom-control-input" checked={selectedMappedWorkflowIdList?.some((mappingId) => mappingId === row?.original?.mappingId)} onChange={(e) => { handleOnSelectChecked(e, row.original) }} />
                    <label className="custom-control-label cursor-pointer" htmlFor={`mappedTemplated${row?.original?.mappingId}`}></label>
                </div>
            )
        }
        else if (["Created Date"].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>)
        }
        else if (cell.column.Header === "Created By") {
            return (<span>{row?.original?.createdByName?.firstName || ''} {row?.original?.createdByName?.lastName || ''}</span>)
        }
        else if (cell.column.Header === "Action") {
            return (
                <button type="button" className="btn btn-outline-primary waves-effect waves-light btn-sm mr-1" onClick={() => handleOnEdit(row?.original)}>
                    <i className="mdi mdi-pencil  ml-0 mr-2 font-10 vertical-middle" />
                    Edit
                </button>
            )
        }
        else {
            return (<span>{cell.value || '-'}</span>)
        }
    }

    const handleOnEdit = (row) => {
        props.history.push(`${process.env.REACT_APP_BASE}/map-workflow-template`, {
            source: 'Edit',
            data: row
        })
    }

    const handleOnDelete = () => {
        
        const requestBody = {
            delete: selectedMappedWorkflowIdList
        }
        put(`${properties.WORKFLOW_DEFN_API}/update/mapped-workflow`, requestBody)
            .then((response) => {
                const { status, message } = response;
                if (status === 200) {
                    unstable_batchedUpdates(() => {
                        toast.success(message);
                        setSelectedMappedWorkflowIdList([]);
                        setCurrentPage((currentPage) => {
                            if (currentPage === 0) {
                                return '0';
                            }
                            return 0;
                        })
                    })
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

    const handleOnSelectChecked = (e, row) => {
        const { target } = e;
        setSelectedMappedWorkflowIdList((prevState) => {
            let ids;
            if (target.checked) {
                ids = [...prevState, row?.mappingId]
            }
            else {
                ids = prevState?.filter((mappingId) => mappingId !== row?.mappingId)
            }
            return ids;
        })

    }

    const handleOnTemplateNameSearch = () => {
        unstable_batchedUpdates(() => {
            setPerPage((perPage) => {
                if (perPage === 10) {
                    return '10';
                }
                return 10;
            });
            setCurrentPage((currentPage) => {
                if (perPage === 0) {
                    return '0';
                }
                return 0;
            });
        })
    }

    return (
        <div className='search-result-box m-t-30 card-box p-0'>
            <div className='row mt-1 p-0'>
                <div className="col-12 pr-0">
                    <section className="triangle">
                        <div className="row align-items-center">
                            <div className="col">
                                <h4 id="list-item-1" className="pl-1">Mapped Workflow Template List</h4>
                            </div>
                            <div className="col-auto max-auto pad-left">
                                <div className="input-group input-group-sm pr-1 form-inline">
                                    <input type="text" className="form-control border-0" placeholder="Search Workflow Template" value={templateName}
                                        onChange={(e) => { setTemplateName(e.target.value) }} />
                                    <div className="input-group-append">
                                        <div className="btn-group" role="group" aria-label="Basic example">
                                            <button className="btn btn-primary btn-sm btn-sm append-button" onClick={handleOnTemplateNameSearch}>
                                                <i className="fe-search"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-auto mx-auto">
                                        <Link className="btn btn-labeled btn-primary btn-sm ml-1" to={{ pathname: `${process.env.REACT_APP_BASE}/map-workflow-template`, state: { source: 'Search' } }}>
                                            <small>Map New Workflow Template</small>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <div className='autoheight p-2'>
                        <section>
                            {
                                !!mappedWorkflowList?.length ? (
                                    <div className='p-2'>

                                        <div className="row pb-2">
                                            <button type="button" disabled={!selectedMappedWorkflowIdList.length} className="btn btn-outline-primary waves-effect waves-light btn-sm mr-1" onClick={handleOnDelete}>
                                                <i className="mdi mdi-trash-can  ml-0 mr-2 font-10 vertical-middle" />
                                                Delete
                                            </button>
                                        </div>
                                        <DynamicTable
                                            listKey={"Mapped Workflow Template"}
                                            row={mappedWorkflowList}
                                            header={MappedWorkflowListColumns}
                                            rowCount={totalCount}
                                            itemsPerPage={perPage}
                                            backendPaging={true}
                                            backendCurrentPage={currentPage}
                                            isTableFirstRender={isTableFirstRender}
                                            exportBtn={exportBtn}
                                            url={`${properties.WORKFLOW_DEFN_API}/mapped-workflow-list`}
                                            method={'POST'}
                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelect,
                                                handleItemPerPage: setPerPage,
                                                handleCurrentPage: setCurrentPage,
                                                handleExportButton: setExportBtn
                                            }}
                                        />
                                    </div>
                                )
                                    :
                                    isMappedWorkflowListLoading ?
                                        (
                                            <h5 className='text-center'>Loading....</h5>
                                        )
                                        : (
                                            <p class="skel-widget-warning">No records found!!!</p>
                                        )
                            }
                        </section>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MapWorkflowList;