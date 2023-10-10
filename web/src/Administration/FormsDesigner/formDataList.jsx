import React, { useEffect, useState } from 'react';
import { get } from "../../common/util/restUtil";
import { properties } from "../../properties";
import DynamicTable from '../../common/table/DynamicTable';
import { formatISODateTime } from '../../common/util/dateUtil'

import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

const FormDataList = (props) => {

    const history = useHistory();

    const [formId, setFormId] = useState()

    const [formsListData, setFormsListData] = useState([])

    const [loading, setLoading] = useState(false)

    const [pageSelect, setPageSelect] = useState(1)
    const [perPage, setPerPage] = useState(10)

    useEffect(() => {

        console.log('Use Effect 1')

        if (props.location.state.data.formId) {
            setFormId(props.location.state.data.formId)
        }

    }, [props]);

    useEffect(() => {
        // console.log('Forms List Use Effect')
        if (formId && formId !== null) {
            
            setLoading(true)
            get(properties.FORMS_DATA_API + '/' + formId + '?limit=' + perPage + '&page=' + pageSelect)
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
        }
    }, [formId]);

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
                            history.push(`${process.env.REACT_APP_BASE}/formdata-addedit`, { data: {
                                formId: row.original.formId,
                                submissionId: row.original.submissionId,
                            } 
                        })
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
            <div className="container-fluid pb-2">
                <div className="row">
                    <div className=" col-12">
                        <div className="page-title-box">
                            <h4 className="page-title">Submission Data List</h4>
                        </div>
                    </div>
                </div>
                <div className="form-row col-12 justify-content-center">
                    {
                        (!loading) ?
                            (formsListData && formsListData.rows && formsListData.rows.length > 0) ?
                                <div className="card" style={{ width: '100%' }}>
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
        </>
    )
}

const FormsListColumns = [
    {
        Header: "Submission Id",
        accessor: "submissionId",
        disableFilters: true
    },
    {
        Header: "Form Id",
        accessor: "formId",
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

export default FormDataList;