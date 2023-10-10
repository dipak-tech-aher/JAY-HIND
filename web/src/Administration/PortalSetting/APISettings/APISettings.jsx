import React, { useState, useEffect, useRef } from 'react';

import DynamicTable from '../../../common/table/DynamicTable'
import { properties } from '../../../properties';
import { post } from '../../../common/util/restUtil';
import { unstable_batchedUpdates } from 'react-dom';
import moment from 'moment'
import { toast } from 'react-toastify';
import { formFilterObject } from '../../../common/util/util';
import ApiListColumns from './ApiListColumns'
import { Link } from 'react-router-dom';
import AddEditApiTemplate from './AddEditApiTemplate'

const APISettings = () => {

    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(false);
    const [apiListData, setApiListData] = useState([])
    const [apilist, setApiList] = useState()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);
    const [listSearch, setListSearch] = useState([]);
    const [isEdit, setIsEdit] = useState(false);
    const [isViewOnly, setIsViewOnly] = useState(false)


    useEffect(() => {
        //  
        const requestBody = {
            filters: formFilterObject(filters)
        }
        setListSearch(requestBody)
        // post(`${properties.}/?limit=${perPage}&page=${currentPage}`, requestBody)
        //     .then((response) => {
        //         if (response.data) {
        //             const { rows, count } = response.data
        //             if (Number(response.data.count) > 0) {
        //                 unstable_batchedUpdates(() => {
        //                     setTotalCount(count)
        //                     setApiListData(rows);
        //                 })
        //             }
        //             else {
        //                 toast.error("Records Not Found")
        //                 setFilters([]);
        //             }
        //         }
        //     })
        //     .finally()

    }, [currentPage, perPage, isModalOpen])

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleAddNewApi = () => {
        unstable_batchedUpdates(() => {
            setIsModalOpen(true)
            setIsEdit(false)
        })
    }

    /**
     * The function is called when a user clicks on a button in a table row. The function sets the state
     * of the component to open a modal and sets the state of the component to edit mode.
     */
    const handleOnEdit = (row) => {
        unstable_batchedUpdates(() => {
            setApiList(row)
            setIsModalOpen(true)
            setIsEdit(true)
        })
    }

    /**
     * When the user clicks on the View button, the modal opens and the user can view the data.
     */
    const handleOnView = (rows) => {
        unstable_batchedUpdates(() => {
            setApiList(rows)
            setIsModalOpen(true)
            setIsViewOnly(true)
        })
    }

    /* A function that is used to render the cell of the table. */
    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Action") {
            return (<button type="button" className="btn btn-labeled btn-primary btn-sm" onClick={() => { handleOnEdit(row.original) }}> Edit</button>);
        }
        else if (cell.column.Header === "API Name") {
            return (<span onClick={() => { handleOnView(row.original) }}>{cell.value}</span>)
        }
        else if (['Updated At', 'Created At'].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>);
        }
        else if (['Created By'].includes(cell.column.Header)) {
            let name = (row?.original?.createdByName?.firstName || "") + " " + (row?.original?.createdByName?.lastName || "")
            return (<span>{name}</span>);
        }
        else if (['Updated By'].includes(cell.column.Header)) {
            let name = (row?.original?.updatedByName?.firstName || "") + " " + (row?.original?.updatedByName?.lastName || "")
            return (<span>{name}</span>);
        }
        return (<span>{cell.value}</span>);
    }

    return (
        <>
            <div className="row">
                <div className="col-12">
                    <div className="page-title-box">
                        <h4 className="page-title">API</h4>
                    </div>
                </div>
            </div>
            <div className="card-box p-0 border">
                <div className="col-12 pr-0">
                    <section className="triangle">
                        <div className="col-md-12 row">
                            <div className="col-md-8">
                                <h4 id="list-item-1" className="pl-2">Created API</h4>
                            </div>
                            <div className="col-md-4">
                                <span style={{ float: "right" }}>
                                    <button type="button" className="btn btn-labeled btn-primary btn-sm mt-1" onClick={handleAddNewApi}>
                                        <small>Add New API</small>
                                    </button>
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
                <div className="card-body p-2">
                    {
                        !!apiListData.length &&
                        <div className="card">
                            <div className="card-body" id="datatable">
                                <DynamicTable
                                    listSearch={listSearch}
                                    listKey={"API Template List"}
                                    row={apiListData}
                                    rowCount={totalCount}
                                    header={ApiListColumns}
                                    itemsPerPage={perPage}
                                    backendPaging={true}
                                    backendCurrentPage={currentPage}
                                    isTableFirstRender={isTableFirstRender}
                                    hasExternalSearch={hasExternalSearch}
                                    exportBtn={exportBtn}
                                    handler={{
                                        handleCellRender: handleCellRender,
                                        handlePageSelect: handlePageSelect,
                                        handleItemPerPage: setPerPage,
                                        handleCurrentPage: setCurrentPage,
                                        handleFilters: setFilters,
                                        handleExportButton: setExportBtn
                                    }}
                                />
                            </div>
                        </div>
                    }
                </div>
                <div className="col-md-12 text-center p-2">
                    <Link className="btn btn-sm waves-effect waves-light btn-primary" to={`${process.env.REACT_APP_BASE}/portal-settings`} >Back to Admin Dashboard</Link>
                </div>
                {
                    isModalOpen &&
                    <AddEditApiTemplate
                        data={{
                            isOpen: isModalOpen,
                            apiList: apilist,
                            isEdit,
                            isViewOnly
                        }}
                        handler={{
                            setIsOpen: setIsModalOpen
                        }}
                    />
                }
            </div>
        </>
    )
}
export default APISettings;