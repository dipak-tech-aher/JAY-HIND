import moment from 'moment';
import React, { useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';
import { object, string } from 'yup';

import DynamicTable from '../../../../common/table/DynamicTable';
import { properties } from '../../../../properties';
import { post } from '../../../../common/util/restUtil';

const SearchChildTickets = (props) => {
    const { servcieTypeLookup, problemCodeLookup, interactionLookup, childTicketData, totalCount, selectedMappedChildTicketIdList, templateUploadCounts } = props?.data
    const { setChildTicketData, setTotalCount, setSelectedMappedChildTicketIdList, handleProcessChildTicket, setTemplateUploadCounts } = props?.handler
    const [perPage, setPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(0)
    const [filters, setFilters] = useState([])
    const [exportBtn, setExportBtn] = useState(false)
    const [listSearch, setListSearch] = useState([])
    const isTableFirstRender = useRef(true)
    const hasExternalSearch = useRef(false)
    const [searchTickets, setSearchTickets] = useState({
        description: "",
        serviceType: "",
        problemCode: "",
        status: "",
        startDate: "",
        endDate: ""
    })
    const [searchTicketsError, setSearchTicketsError] = useState()

    const handleOnChange = (e) => {
        const { target } = e;
        unstable_batchedUpdates(() => {
            setSearchTickets({
                ...searchTickets,
                [target.id]: target.value
            })

            setSearchTicketsError({
                ...searchTicketsError,
                [target.id]: ""
            })
        })
    }

    const validationSchema = object().shape({
        description: string().required("Problem Description is required"),
        serviceType: string().required("Service Type is required"),
        problemCode: string().required("Problem Code is required"),
    });



    /**
    * If the schema is invalid, set the error state to the error message.
    * @returns The error object.
    */
    const validate = (schema, data) => {
        try {
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setSearchTicketsError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    const handleSubmit = () => {
        let error = validate(validationSchema, searchTickets);
        if (error) {
            toast.error("Validation errors found. Please check all fields");
            return false
        }
        
        const requestBody = {
            ...searchTickets,
            status: searchTickets.statusCode
        }
        post(`${properties.INTERACTION_API}/search-child-tickets?limit=10&page=0`, requestBody)
            .then((resp) => {
                if (resp.data) {
                    if (resp.data.count === 0) {
                        toast.error('No Record Found')
                    }
                    unstable_batchedUpdates(() => {
                        setTotalCount(resp.data.count)
                        setChildTicketData(resp.data.rows)
                        setSelectedMappedChildTicketIdList([])
                    })
                }
            }).catch(error => console.log(error)).finally()
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleOnSelectChecked = (e, row) => {
        const { target } = e;
        setSelectedMappedChildTicketIdList((prevState) => {
            let ids;
            if (target.checked) {
                ids = [...prevState, {
                    intxnId: row?.intxnId, accountId: row?.accountDetails?.accountId,
                    accountName: row?.accountDetails?.accountName, problemCode: row?.problemCodeDescription?.description, status: row?.currStatusDesc.description
                }]
            }
            else {
                ids = prevState?.filter((i) => i.intxnId !== row?.intxnId)
            }
            return ids;
        })
        setTemplateUploadCounts({
            ...templateUploadCounts,
            total: target.checked ? selectedMappedChildTicketIdList?.length + 1 : selectedMappedChildTicketIdList?.length - 1,
            failed: 0, success: 0
        })

    }

    const handleCellRender = (cell, row) => {
        if (["Updated At", "Created On"].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>)
        }
        else if (cell.column.Header === "Select") {
            return (
                <div className="custom-control custom-checkbox">
                    <input type="checkbox" id={`mappedTemplated${row?.original?.intxnId}`} className="custom-control-input" checked={selectedMappedChildTicketIdList?.some((i) => i.intxnId === row?.original?.intxnId)} onChange={(e) => { handleOnSelectChecked(e, row.original) }} />
                    <label className="custom-control-label cursor-pointer" htmlFor={`mappedTemplated${row?.original?.intxnId}`}></label>
                </div>
            )
        }
        else {
            return (<span>{cell.value ? cell.value : '-'}</span>)
        }
    }

    return (
        <div>
            <div className="form-group radio-content" data-radio="none" style={{ display: "block" }}>
                <div className="row col-12">
                    <div className="col-md-4">
                        <div className="form-group">
                            <label htmlFor="description" className="col-form-label">Problem Description or Keyword<span className="text-danger">*</span></label>
                            <input type="text" id="description" name="description" value={searchTickets?.description} className={`form-control ${searchTicketsError?.description && "error-border"}`} placeholder=" Problem Detail" onChange={handleOnChange}></input>
                            <span className="errormsg">{searchTicketsError?.description ? searchTicketsError?.description : ""}</span>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-group">
                            <label htmlFor="serviceType" className="col-form-label">Service Type <span className="text-danger">*</span></label>
                            <select className={`form-control ${searchTicketsError?.serviceType && "error-border"}`} value={searchTickets?.serviceType} id="serviceType" name="serviceType" onChange={handleOnChange}>
                                <option>Select Service Type</option>
                                {
                                    servcieTypeLookup && servcieTypeLookup.map((e) => (
                                        <option key={e.code} value={e.code} data-object={JSON.stringify(e)}>{e.description}</option>
                                    ))
                                }
                            </select>
                            <span className="errormsg">{searchTicketsError?.serviceType ? searchTicketsError?.serviceType : ""}</span>

                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-group">
                            <label htmlFor="Surname" className="col-form-label">Problem Code <span className="text-danger">*</span></label>
                            <select id="problemCode" name="problemCode" value={searchTickets?.problemCode} className={`form-control ${searchTicketsError?.problemCode && "error-border"}`} onChange={handleOnChange}>
                                <option>Select Problem Code</option>
                                {
                                    problemCodeLookup && problemCodeLookup.map((e) => (
                                        <option key={e.code} value={e.code} data-object={JSON.stringify(e)}>{e.description}</option>
                                    ))
                                }
                            </select>
                            <span className="errormsg">{searchTicketsError?.problemCode ? searchTicketsError?.problemCode : ""}</span>

                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-group">
                            <label htmlFor="statusCode" className="col-form-label">Status </label>
                            <select id="statusCode" name="statusCode" value={searchTickets?.statusCode} className="form-control" onChange={handleOnChange}>
                                <option>Select Status</option>
                                {
                                    interactionLookup && interactionLookup.map((e) => (
                                        <option key={e.code} value={e.code} data-object={JSON.stringify(e)}>{e.description}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-group">
                            <label htmlFor="startDate" className="col-form-label">Ticket from date </label>
                            <input type="date" id="startDate" value={searchTickets?.startDate} name="startDate" className="form-control" onChange={handleOnChange}></input>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-group">
                            <label htmlFor="endDate" className="col-form-label">Ticket to date </label>
                            <input type="date" id="endDate" value={searchTickets?.endDate} name="endDate" className="form-control" onChange={handleOnChange}></input>

                        </div>
                    </div>
                </div>
                <div className="col-12 text-center pt-2" id="planlist">
                    <button type="button" className="btn waves-effect waves-light btn-primary mr-2" onClick={handleSubmit}>Search</button>
                </div>
            </div>
            <div className="row mt-2 pr-2 pt-2">
                <div className="col-lg-12">
                    {
                        (childTicketData && childTicketData?.length > 0) &&
                        <div className="card">

                            <div>
                                <DynamicTable
                                    listKey={"Child Ticket List"}
                                    row={childTicketData}
                                    rowCount={totalCount}
                                    header={ChildTicketListColumns}
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
            </div>
            <div className="text-center pt-2">
                <button className="btn btn- btn-sm btn-primary text-center" onClick={handleProcessChildTicket}><i className="mdi mdi-plus mr-1"></i>Process Selected Ticket as Child Ticket</button>
            </div>
        </div>
    )
}


const ChildTicketListColumns = [
    {
        Header: "Select"
    },
    {
        Header: "Ticket Number",
        accessor: "intxnId",
        disableFilters: true,
        id: "intxnID"
    },
    {
        Header: "Problem Code",
        accessor: "problemCodeDescription.description",
        disableFilters: true,
        id: "probelmCode"
    },
    {
        Header: "Account ID",
        accessor: "accountDetails.accountId",
        disableFilters: true,
        id: "accountID"
    },
    {
        Header: "Account Name",
        accessor: "accountDetails.accountName",
        disableFilters: true,
        id: "accountName"
    },
    {
        Header: "Created On",
        accessor: "createdAt",
        disableFilters: true,
        id: "createdAt"
    },
    {
        Header: "Status",
        accessor: "currStatusDesc.description",
        disableFilters: true,
        id: "status"
    }
]
export default SearchChildTickets