import React, { useEffect, useRef, useState, useCallback } from 'react';
import { unstable_batchedUpdates } from 'react-dom';

import DynamicTable from '../../../common/table/DynamicTable';
import { properties } from '../../../properties';
import { post } from '../../../common/util/restUtil';
import moment from 'moment';
import { EvaluationColumns, QualityGuidelinesColumns } from './QAMonitoringColumns';
import ViewEditQAMonitoringModal from './ViewEditQAMonitoringModal';

const QAMonitoring = (props) => {

    const propsState = props?.location?.state;

    const helperValues = {
        EVALUATION: {
            title: 'Evaluation Section',
            tableColumns: EvaluationColumns,
            apiEndpoint: `${properties.QUALITY_MONITORING}/section`
        },
        GUIDELINES: {
            title: 'Quality Guidelines',
            tableColumns: QualityGuidelinesColumns,
            apiEndpoint: `${properties.QUALITY_MONITORING}/guideline`
        }
    }

    const [QAMonitoringList, setQAMonitoringList] = useState([]);
    const [isQAMonitoringListLoading, setIsQAMonitoringListLoading] = useState(false);
    const [isViewEditQAMonitoringOpen, setIsViewEditQAMonitoringOpen] = useState(false);
    const [viewEditData, setViewEditData] = useState();
    const viewScreen = useRef(false);

    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const isTableFirstRender = useRef(true);

    const getQAMonitoringList = () => {
        setIsQAMonitoringListLoading(true);
        
        const requestBody = {
            filters: []
        }
        post(`${helperValues[propsState?.source]['apiEndpoint']}/list?page=${currentPage}&limit=${perPage}`, requestBody)
            .then((response) => {
                const { status, data } = response;
                if (status === 200 && data) {
                    unstable_batchedUpdates(() => {
                        setTotalCount(data?.count);
                        setQAMonitoringList(data?.rows);
                        setIsQAMonitoringListLoading(false);
                    })
                }
            })
            .catch(error => {
                console.error(error);
                setIsQAMonitoringListLoading(false);
            })
            .finally(() => {
                isTableFirstRender.current = true;
                
            })
    }

    useEffect(() => {
        getQAMonitoringList();
    }, [perPage, currentPage])

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleCellRender = (cell, row) => {
        if (["Evaluation Section Id", "Guidelines Id", "Action"].includes(cell.column.Header)) {
            return (
                cell.column.Header === 'Action' ?
                    <button type="button" className="btn btn-outline-primary waves-effect waves-light btn-sm mr-1" onClick={() => handleOnAddEdit(row?.original, 'EDIT')}>
                        <i className="mdi mdi-pencil ml-0 mr-2 font-10 vertical-middle" />
                        Edit
                    </button>
                    :
                    <span className="text-secondary cursor-pointer px-3" onClick={() => handleOnAddEdit(row?.original, 'VIEW')}>{cell.value}</span>
            )
        }
        else if (["Channels"].includes(cell.column.Header)) {
            return (<span>{row?.original?.channel?.map((chnl, idx) => `${chnl?.description}${row?.original?.channel?.length === 1 ? '' : idx % 2 === 0 ? ',' : ''}`)}</span>)
        }
        else {
            return (<span>{cell.value || '-'}</span>)
        }
    }

    const handleOnAddEdit = (row, screen) => {
        if (['EDIT', 'VIEW'].includes(screen)) {
            setViewEditData(row);
        }
        viewScreen.current = screen;
        setIsViewEditQAMonitoringOpen(true);
    }

    const doSoftRefresh = useCallback(() => {
        setCurrentPage((page) => {
            if (page === 0) {
                return '0';
            }
            return 0;
        })
    }, [])

    return (
        <div className='search-result-box m-t-30 card-box p-0'>
            <div className='row mt-1 p-0'>
                <div className="col-12 pr-0">
                    <section className="triangle">
                        <div className="row align-items-center">
                            <div className="col">
                                <h4 id="list-item-1" className="pl-1">Add / Edit {helperValues[propsState?.source]['title']}</h4>
                            </div>
                            <div className="col-auto mx-auto">
                                <button className="btn btn-labeled btn-primary btn-sm ml-1" onClick={() => handleOnAddEdit(undefined, 'ADD')}>
                                    <small>Add New {helperValues[propsState.source]['title']}</small>
                                </button>
                            </div>
                        </div>
                    </section>
                    <div className='autoheight p-2'>
                        <section>
                            {
                                !!QAMonitoringList?.length ? (
                                    <div className='p-2'>
                                        <DynamicTable
                                            row={QAMonitoringList}
                                            header={helperValues[propsState?.source]['tableColumns']}
                                            rowCount={totalCount}
                                            itemsPerPage={perPage}
                                            backendPaging={true}
                                            backendCurrentPage={currentPage}
                                            isTableFirstRender={isTableFirstRender}
                                            handler={{
                                                handleCellRender: handleCellRender,
                                                handlePageSelect: handlePageSelect,
                                                handleItemPerPage: setPerPage,
                                                handleCurrentPage: setCurrentPage
                                            }}
                                        />
                                    </div>
                                )
                                    :
                                    isQAMonitoringListLoading ?
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
            {
                isViewEditQAMonitoringOpen &&
                <ViewEditQAMonitoringModal
                    data={{
                        isOpen: isViewEditQAMonitoringOpen,
                        viewScreen: viewScreen.current,
                        viewEditData,
                        helperValues,
                        source: propsState?.source
                    }}
                    handlers={{
                        setIsOpen: setIsViewEditQAMonitoringOpen,
                        doSoftRefresh
                    }}
                />
            }
        </div>
    )
}

export default QAMonitoring;