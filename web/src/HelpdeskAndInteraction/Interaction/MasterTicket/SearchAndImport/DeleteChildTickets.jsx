import moment from "moment";
import { useCallback } from "react";
import { useEffect } from "react";
import { useRef, useState } from "react"
import { unstable_batchedUpdates } from "react-dom";
import { toast } from "react-toastify";

import DynamicTable from "../../../../common/table/DynamicTable"
import { properties } from "../../../../properties";
import { get } from "../../../../common/util/restUtil";

const DeleteChildTickets = (props) => {
    const { masterTicketId, deleteChildTicketIdList } = props?.data
    const { setDeleteChildTicketIdList } = props?.handler
    const [childTicketData, setChildTicketData] = useState([])
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(false)
    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);
    const [totalCount, setTotalCount] = useState(0);


    const getChildTicketDetails = useCallback(() => {
        if (masterTicketId !== null && masterTicketId !== undefined) {
            
            get(`${properties.INTERACTION_API}/child-tickets/${masterTicketId}?limit=${perPage}&page=${currentPage}`)
                .then((response) => {
                    if (response) {
                        const { count, rows } = response?.data
                        if (Number(count) > 0) {
                            unstable_batchedUpdates(() => {
                                setTotalCount(count)
                                setChildTicketData(rows)
                            })
                        } else {
                            toast.error("Records not Found")
                        }
                    }
                })
                .catch(error => {
                    console.error(error)
                })
                .finally()
        }
    })

    useEffect(() => {
        getChildTicketDetails()
    }, [currentPage, perPage])

    const handleOnSelectChecked = (e, row) => {
        const { target } = e;
        setDeleteChildTicketIdList((prevState) => {
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
    }


    const handleCellRender = (cell, row) => {
        if (["Updated At", "Created On"].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>)
        }
        else if (cell.column.Header === "Select") {
            return (
                <div className="custom-control custom-checkbox">

                    <input type="checkbox" id={`mappedTemplated${row?.original?.intxnId}`} className="custom-control-input" checked={deleteChildTicketIdList?.some((i) => i.intxnId === row?.original?.intxnId)} onChange={(e) => { handleOnSelectChecked(e, row.original) }} />
                    <label className="custom-control-label cursor-pointer" htmlFor={`mappedTemplated${row?.original?.intxnId}`}></label>
                </div>
            )
        }
        else {
            return (<span>{cell.value ? cell.value : '-'}</span>)
        }
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    return (
        <>
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

        </>
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
export default DeleteChildTickets