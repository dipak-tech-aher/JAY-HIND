import React, { useEffect, useRef, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { toast } from 'react-toastify'
import { Link } from 'react-router-dom';
import { properties } from '../../../properties'
import { post } from '../../../common/util/restUtil'
import moment from 'moment'
import { formFilterObject } from '../../../common/util/util'
import DynamicTable from '../../../common/table/DynamicTable'
import AddEditEmailSmsTemplate from './AddEditEmailSmsTemplate';

const EmailSmsTemplateList = () => {

    const [emailSmsTemplateList,setEmailSmsTemplateList] = useState([])
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(false)
    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);
    const [listSearch, setListSearch] = useState([]);
    const [isAddEditModalOpen,setIsAddEditModalOpen] = useState(false)
    const [emailSmsTemplateData,setEmailSmsTemplateData] = useState({})
    const [isEdit, setIsEdit] = useState(false);

    useEffect(() => {
        
        const requestBody = {
            filters: formFilterObject(filters)
        }
        setListSearch(requestBody)
        post(`${properties.EMAIL_TEMPLATE_API}/list?limit=${perPage}&page=${currentPage}`, requestBody)
        .then((response) => {
            if(response.data)
            {
                const { rows, count} = response.data
                if(Number(response.data.count) > 0)
                {
                    unstable_batchedUpdates(() => {
                        setTotalCount(count)
                        setEmailSmsTemplateList(rows);
                    })
                }
                else
                {
                    toast.error("Records Not Found")
                    setFilters([]);
                }
            }
        }).catch((error) => {
            console.log(error)
        })
        .finally()

    },[currentPage, perPage, isAddEditModalOpen])

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Action") {
            return (<button type="button" className="btn btn-labeled btn-primary btn-sm" onClick={() => {handleEditTemplate(row.original)}}> Edit</button>);
        }
        else if (['Updated At','Created At'].includes(cell.column.Header)) {
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

    const handleAddTemplate = () => {
        setIsEdit(false)
        setIsAddEditModalOpen(true)
    }

    const handleEditTemplate = (data) => {
        setIsEdit(true)
        setEmailSmsTemplateData(data)
        setIsAddEditModalOpen(true)
    }

    return(
        <>
            <div className="row">
                <div className="col-12">
                    <div className="page-title-box">
                        <h4 className="page-title">Email / SMS Template</h4>
                    </div>
                </div>
            </div>
            <div className="card-box p-0 border">
                <div className="col-12 pr-0">
                    <section className="triangle">
                        <div className="col-md-12 row">
                            <div className="col-md-8">
                                <h4 id="list-item-1" className="pl-2">Created Email / SMS Template</h4>
                            </div>
                            <div className="col-md-4">
                                <span style={{float:"right"}}>
                                    <button type="button" className="btn btn-labeled btn-primary btn-sm mt-1" onClick={handleAddTemplate}>
                                        <small>Add New Email / SMS Template</small>
                                    </button>
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
                <div className="card-body p-2">
                    {
                        !!emailSmsTemplateList.length &&
                            <div className="card">
                                <div className="card-body" id="datatable">
                                    <DynamicTable
                                        listSearch={listSearch}
                                        listKey={"Email/Sms Template List"}
                                        row={emailSmsTemplateList}
                                        rowCount={totalCount}
                                        header={EmailSmsTemplateListColumsn}                                                        
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
                    <Link className="btn btn-sm waves-effect waves-light btn-primary" to={`${process.env.REACT_APP_BASE}/admin-dashboard`} >Back to Admin Dashboard</Link>
                </div>
                {
                    isAddEditModalOpen &&
                    <AddEditEmailSmsTemplate 
                        data={{
                            isOpen: isAddEditModalOpen,
                            emailSmsTemplateData: emailSmsTemplateData,
                            isEdit
                        }}
                        handler={{
                            setIsOpen: setIsAddEditModalOpen
                        }}
                    />
                }
            </div>
        </>
    )
}

export default EmailSmsTemplateList

const EmailSmsTemplateListColumsn = [
    {
        Header: "Template Id",
        accessor: 'templateId',
        disableFilters: true,
        id: "templateId",
    },
    {
        Header: "Template Type",
        accessor: 'templateType',
        disableFilters: true,
        id: "templateType",
    },
    {
        Header: "Locale",
        accessor: 'locale',
        disableFilters: true,
        id: "locale",
    },
    {
        Header: "Template Name",
        accessor: 'templateName',
        disableFilters: true,
        id: "templateName",
    },
    {
        Header: "Subject",
        accessor: 'subject',
        disableFilters: true,
        id: "subject",
    },
    {
        Header: "Template Status",
        accessor: 'statusDesc.description',
        disableFilters: true,
        id: "templateStatus",
    },
    {
        Header: "Action",
        accessor: 'action',
        disableFilters: true,
        id: "action",
    }
]