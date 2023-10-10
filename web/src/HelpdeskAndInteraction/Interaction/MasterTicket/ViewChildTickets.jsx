import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import { unstable_batchedUpdates } from "react-dom";
import { toast } from "react-toastify";
import DynamicTable from "../../../common/table/DynamicTable";
import { properties } from "../../../properties";
import { get } from "../../../common/util/restUtil";

const ViewChildTickets = (props) => {
    const { masterTicketData } = props.data
    const [tableRowData, setTableRowData] = useState()
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [viewcurrentPage, setViewCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(false)
    const [listSearch, setListSearch] = useState([]);
    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);

    const getChildTicketDetails = useCallback(() => {
        if (masterTicketData?.mstIntxnId !== '' && masterTicketData?.mstIntxnId !== undefined) {
            
            get(`${properties.INTERACTION_API}/child-tickets/${masterTicketData?.mstIntxnId}?limit=${perPage}&page=${viewcurrentPage}`)
                .then((response) => {
                    if (response) {
                        const { count, rows } = response?.data
                        if (Number(count) > 0) {
                            unstable_batchedUpdates(() => {
                                setTotalCount(count)
                                setTableRowData(rows)
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
    }, [viewcurrentPage, perPage])

    const handleCellRender = (cell, row) => {
        if (["Updated At", "Created On"].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>)
        }
        else {
            return (<span>{cell.value ? cell.value : '-'}</span>)

        }
    }

    const handlePageSelect = (pageNo) => {
        setViewCurrentPage(pageNo)
    }

    return (
        <>
            <div className="row mt-2 pr-2">
                <div className="col-lg-12">
                    {(tableRowData && tableRowData?.length > 0) ?
                        <div>
                            <DynamicTable
                                // listSearch={listSearch}
                                listKey={"Child Ticket List"}
                                row={tableRowData}
                                rowCount={totalCount}
                                header={ChildTicketListColumns}
                                itemsPerPage={perPage}
                                backendPaging={true}
                                backendCurrentPage={viewcurrentPage}
                                isTableFirstRender={isTableFirstRender}
                                hasExternalSearch={hasExternalSearch}
                                exportBtn={exportBtn}
                                handler={{
                                    handleCellRender: handleCellRender,
                                    handlePageSelect: handlePageSelect,
                                    handleItemPerPage: setPerPage,
                                    handleCurrentPage: setViewCurrentPage,
                                    handleExportButton: setExportBtn
                                }}
                            />
                        </div> :
                        <p className="p-1" style={{ textAlign: "center" }}>No Record Found</p>
                    }
                </div>
            </div>
        </>
    )
}
const ChildTicketListColumns = [
    {
        Header: "Ticket Number",
        accessor: "intxnId",
        disableFilters: true,
        id: "intxnID"
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
        Header: "Problem Code",
        accessor: "problemCodeDescription.description",
        disableFilters: true,
        id: "probelmCode"
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
    },
]

export default ViewChildTickets