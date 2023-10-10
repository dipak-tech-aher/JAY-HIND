import React, { useEffect, useState } from 'react';
import { get } from "../../common/util/restUtil";
import { properties } from "../../properties";
import DynamicTable from '../../common/table/DynamicTable';
import { formatISODateTime } from '../../common/util/dateUtil'

import { toast } from "react-toastify";

const FormsList = (props) => {

    const setIsOpen = props.handler.setIsOpen
    const openForm = props.handler.openForm

    const [formsListData, setFormsListData] = useState([])

    const [loading, setLoading] = useState(false)

    const [pageSelect, setPageSelect] = useState(1)
    const [perPage, setPerPage] = useState(10)

    useEffect(() => {
        // console.log('Forms List Use Effect')
        
        setLoading(true)
        get(properties.FORMS_DEFN_API + '?limit=' + perPage + '&page=' + pageSelect)
            .then((resp) => {
                if (resp && resp.status === 200 && resp.data) {
                    setFormsListData({ rows: resp.data.rows, count: resp.data.count })
                } else {
                    if (resp && resp.status) {
                        toast.error("Error fetching Form Definitions - " + resp.status + ', ' + resp.message);
                    } else {
                        toast.error("Unexpected error fetching Form Definitions");
                    }
                }
            }).catch((error) => {
                console.log(error)
            }).finally(() => {
                setLoading(false)
                
            });
    }, []);

    const handlePageSelect = (pageNo) => {
        setPageSelect(pageNo)
    }

    const handleOnPerPageChange = (perPage) => {
        setPerPage(perPage)
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.id === 'action') {
            return (
                <button type="button" className="btn btn-sm btn-primary p-1" 
                    onClick={(e) => {
                        openForm(e, row.original.formId)
                        setIsOpen(false)
                    }}
                >
                    Edit
                </button>
            )
        } else {
            return (<span>{cell.value}</span>)
        }
    }

    const setRowData = () => {

    }

    const setData = () => {

    }

    return (
        <>
            <div className="modal-dialog" style={{ margin: "1rem", height: "100%" }}>
                <div className="modal-content" style={{ height: "100%" }}>
                    <div className="modal-header">
                        <h4 className="modal-title" id="myCenterModalLabel">Forms List</h4>
                        <button type="button" className="close" onClick={() => setIsOpen(false)}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                  
                    <div className="modal-body">
                        <div className="form-row col-12 justify-content-center">
                            {
                                (!loading) ?
                                    (formsListData && formsListData.rows && formsListData.rows.length > 0) ?
                                        <div className="card" style={{width: '100%'}}>
                                            <div className="card-body" id="datatable">
                                                <DynamicTable
                                                    row={formsListData.rows}
                                                    rowCount={formsListData.count}
                                                    header={FormsListColumns}
                                                    handleRow={setData}
                                                    itemsPerPage={perPage}
                                                    hiddenColumns={FormsListHiddenColumns}
                                                    backendPaging={true}
                                                    backendCurrentPage={pageSelect}
                                                    handler={{
                                                        handleCellRender: handleCellRender,
                                                        handlePageSelect: handlePageSelect,
                                                        handleItemPerPage: handleOnPerPageChange,
                                                        handleCurrentPage: setPageSelect
                                                    }}
                                                />
                                            </div>
                                        </div >
                                        :
                                        <p><strong>No Forms defined yet</strong></p>
                                    :
                                    <p><strong>Loading data...please wait.</strong></p>

                            }
                        </div>
                    </div>
                    <div className="modal-footer d-flex mt-2 justify-content-center">
                        <button className="btn btn-secondary" onClick={() => setIsOpen(false)} type="button">Close</button>
                    </div>
                </div>
            </div>
        </>
    )
}

const FormsListColumns = [
    {
        Header: "Form Id",
        accessor: "formId",
        disableFilters: true
    },
    {
        Header: "Form Name",
        accessor: "formName",
        disableFilters: true
    },
    {
        Header: "Status",
        accessor: "statusDesc.description",
        disableFilters: true
    },
    {
        Header: "StatusCode",
        accessor: "status",
        disableFilters: true
    },
    {
        Header: "Updated By",
        accessor: "updatedByName.firstName",
        disableFilters: true
    },
    {
        Header: "Updated By Id",
        accessor: "updatedBy",
        disableFilters: true
    },
    {
        Header: "Action",
        accessor: "action",
        disableFilters: true
    }
]

const FormsListHiddenColumns = ['status', 'updatedBy']

export default FormsList;