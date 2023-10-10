import React, { useEffect, useState, useRef } from 'react';
import Switch from "react-switch";
import { post, get, put } from "../../common/util/restUtil";
import { history } from '../../common/util/history';
import { properties } from "../../properties";
import DynamicTable from '../../common/table/DynamicTable';
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';
import { formFilterObject } from '../../common/util/util';
import AddEditRequestStatement from './AddEditRequestStatement';
import { ref } from 'yup';

const RequestStatementList = (props) => {
    const [requestStatementList, setRequestStatementList] = useState({})
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState({});
    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);
    const [listSearch, setListSearch] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [exportBtn, setExportBtn] = useState(true);
    const [filters, setFilters] = useState([]);
    const [refresh,setRefresh] = useState(false)
    const requestStatementSearchAPI = `${properties.KNOWLEDGE_API}/list`

    useEffect(() => {
        const requestBody = {
            filters: formFilterObject(filters)
        }
        setListSearch(requestBody);
        post(requestStatementSearchAPI + `?limit=${perPage}&page=${currentPage}`, requestBody).then(resp => {
            if (resp.data) {
                if (resp.status === 200) {
                    const { count, rows } = resp.data;
                    if (resp.data.count === 0) {
                        toast.error("Records Not found");
                        setFilters([]);
                    } else {
                        unstable_batchedUpdates(() => {
                            setTotalCount(count)
                            setRequestStatementList(rows);
                        })
                    }
                }
            }
        }).catch((error) => {
            console.log(error)
        }).finally(() => {
            isTableFirstRender.current = false;
        });
    }, [currentPage, perPage, refresh]);

    const handleCreateStatement = () => {
        setData({
            mode: 'CREATE'
        })
        setIsOpen(true)
    }

    const handleEditStatement = (data) => {
        setData({
            mode: 'EDIT',
            ...data
        })
        setIsOpen(true)
    }

    const switchChange = (data) => {
        const reqBody = {
            ...data,
            status: data.status === 'AC' ? 'TEMP' : 'AC'
        }
        delete reqBody.requestId
        put(properties.KNOWLEDGE_API + "/edit-request-statement/" + data.requestId, reqBody)
        .then((resp) => {
            if (resp) {
                if (resp.status === 200) {
                    toast.success(resp.message);
                    softRefresh()
                } else {
                    toast.error(resp.message);
                }
            }
        }).catch((error) => {
            console.log(error)
        }).finally();
    };

    const softRefresh = () => {
        setRefresh(!refresh)
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Status") {
            return (<Switch onChange={(e) => switchChange(row.original)} checked={cell.value === 'AC' ? true : false} />)
        }
        else if (cell.column.Header === "Edit") {
            return (
                <button type="button" onClick={() => handleEditStatement(row.original)} className="skel-btn-submit" data-toggle="modal" data-target="#search-modal-editservice"><span><i className="mdi mdi-file-document-edit-outline font20"></i></span>Edit</button >
            )
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const columns = [
        {
            Header: "ID",
            accessor: "requestId",
            disableFilters: true,
        },
        {
            Header: "Interaction Statement",
            accessor: "requestStatement",
            disableFilters: true,
        },
        {
            Header: "Interaction Category",
            accessor: "intxnCategoryDesc.description",
            disableFilters: true,
        },
        {
            Header: "Interaction Type",
            accessor: "intxnTypeDesc.description",
            disableFilters: true,
        },
        {
            Header: "Service Category",
            accessor: "serviceCategoryDesc.description",
            disableFilters: true,
        },
        {
            Header: "Service Type",
            accessor: "serviceTypeDesc.description",
            disableFilters: true,
        },
        {
            Header: "Problem Cause",
            accessor: "intxnCauseDesc.description",
            disableFilters: true,
        },
        {
            Header: "Priority",
            accessor: "priorityCodeDesc.description",
            disableFilters: true,
        },
        {
            Header: "Interaction Resolution",
            accessor: "intxnResolutionDesc.description",
            disableFilters: true,
        },
        {
            Header: "Status",
            accessor: "status",
            disableFilters: true,
        },
        {
            Header: "Edit",
            accessor: "action",
            disableFilters: true,
        }
    ]

    return (
        <div className="cnt-wrapper">
            <div className="card-skeleton">
                <div className="customer-skel">
                    <div className="cmmn-skeleton">
                        <div className="">
                            <div className="row" id="datatable">
                                <div className="col-lg-12">
                                    <div className="card-body">
                                        <div className="card">
                                            <div className="card-body" id="datatable">
                                                {
                                                    !!requestStatementList.length &&
                                                    <DynamicTable
                                                        listSearch={listSearch}
                                                        listKey={"Request Statement List"}
                                                        row={requestStatementList}
                                                        rowCount={totalCount}
                                                        header={columns}
                                                        itemsPerPage={perPage}
                                                        backendPaging={true}
                                                        isTableFirstRender={isTableFirstRender}
                                                        hasExternalSearch={hasExternalSearch}
                                                        backendCurrentPage={currentPage}
                                                        exportBtn={exportBtn}
                                                        url={requestStatementSearchAPI + `?limit=${totalCount}&page=0`}
                                                        method='POST'
                                                        handler={{
                                                            handleCellRender: handleCellRender,
                                                            handlePageSelect: handlePageSelect,
                                                            handleItemPerPage: setPerPage,
                                                            handleCurrentPage: setCurrentPage,
                                                            handleExportButton: setExportBtn,
                                                            handleFilters: setFilters
                                                        }}
                                                        customButtons={(
                                                            <button onClick={handleCreateStatement} type="button" className="skel-btn-submit">
                                                                Add Statement
                                                            </button>
                                                        )}
                                                        bulkUpload={(
                                                            <button className="skel-btn-orange mr-1" onClick={() => history.push(`${process.env.REACT_APP_BASE}/create-bulk-upload`)}>
                                                                Bulk Upload
                                                            </button>
                                                        )}
                                                    />
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div >
                                {
                                    isOpen &&
                                    <AddEditRequestStatement
                                        data={{
                                            isOpen,
                                            data,
                                        }}
                                        handler={{
                                            setIsOpen,
                                            softRefresh
                                        }}
                                    />
                                }
                            </div >
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestStatementList;
