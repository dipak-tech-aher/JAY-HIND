import { isEmpty } from 'lodash'
import moment from "moment"
import { useEffect, useRef, useState } from "react"
import { unstable_batchedUpdates } from "react-dom"
import Modal from "react-modal"
import DynamicTable from "../../common/table/DynamicTable"
import { post } from "../../common/util/restUtil"
import { removeEmptyKey } from "../../common/util/util"
import { properties } from "../../properties"

const HelpdeskDetailsModel = (props) => {
    const [helpDeskDetailsInfo, setHelpdeskDetailsInfo] = useState([])
    const [total, setTotal] = useState(0)
    const [currentPage, setCurrentPage] = useState(0)
    const [perPage, setPerPage] = useState(10)
    const [exportBtn, setExportBtn] = useState(true)
    const [filters, setFilters] = useState([])
    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);
    const [listSearch, setListSearch] = useState([])

    const customStyles = {
        content: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '80%',
            maxHeight: '90%',
            // height: 'auto'  /**Srini commented this as the height of pop up should not be changed. Please discuss before touching */
        }
    }

    const { helpdeskDetailsOpen, helpdeskDetails } = props.data;
    const { setHelpdeskDetailsOpen } = props.handler;

    useEffect(() => {
        if (!isEmpty(helpdeskDetails)) {
            const requestBody = removeEmptyKey(helpdeskDetails);
            setListSearch(requestBody)
            post(`${properties.HELPDESK_API}/helpdesk-details?limit=${perPage}&page=${currentPage}`, requestBody)
                .then((res) => {
                    if (res.status === 200 && res.data?.count > 0) {
                        const { rows, count } = res.data
                        unstable_batchedUpdates(() => {
                            setHelpdeskDetailsInfo(rows)
                            setTotal(count)
                        })
                    } else {
                        unstable_batchedUpdates(() => {
                            setHelpdeskDetailsInfo([])
                            setTotal(0)
                        })
                    }
                }).catch((err) => {
                    console.error(err);
                })
        }
    }, [helpdeskDetails, currentPage, perPage])

    const handleCellRender = (cell, row) => {
        if (["Created At"].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>)
        } else if (["Content"].includes(cell.column.Header)) {
            return (<span style={{ whiteSpace: "inherit" }}>{cell.value ? cell.value : "-"}</span>)
        }
        else {
            return (<span>{cell.value ? cell.value : "-"}</span>)
        }
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    return (
        <>
            <Modal isOpen={helpdeskDetailsOpen} contentLabel="Modal" style={customStyles}>
                <div className="modal-center" id="helpdeskModal" tabindex="-1" role="dialog" aria-labelledby="helpdeskModal" aria-hidden="true"        >
                    <div className="chat-his">
                        <div className="modal-content">
                            <div className="modal-header mt-2 mb-1">
                                <h4 className="modal-title">Chat Details</h4>
                                <button type="button" className="close pl-2" onClick={() => setHelpdeskDetailsOpen(false)}>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                        </div>
                        <div className="modal-body">
                            <div className="">
                                {helpDeskDetailsInfo && <DynamicTable
                                    listSearch={listSearch}
                                    listKey={"Helpdesk Details"}
                                    url={`${properties.HELPDESK_API}/helpdesk-details?limit=${perPage}&page=${currentPage}`}
                                    row={helpDeskDetailsInfo}
                                    rowCount={total}
                                    header={chatDetailsColumns}
                                    itemsPerPage={perPage}
                                    backendPaging={true}
                                    backendCurrentPage={currentPage}
                                    isTableFirstRender={isTableFirstRender}
                                    hasExternalSearch={hasExternalSearch}
                                    exportBtn={exportBtn}
                                    method='POST'
                                    handler={{
                                        handleCellRender: handleCellRender,
                                        handlePageSelect: handlePageSelect,
                                        handleItemPerPage: setPerPage,
                                        handleCurrentPage: setCurrentPage,
                                        handleFilters: setFilters,
                                        handleExportButton: setExportBtn
                                    }}
                                />
                                }
                            </div>
                        </div>
                    </div >
                </div>
            </Modal >
        </>
    )
}

export default HelpdeskDetailsModel;

const chatDetailsColumns = [{
    Header: "ID",
    accessor: "helpdeskNo",
    disableFilters: true,
    id: "helpdeskNo"
},
{
    Header: "Status",
    accessor: "statusDesc.description",
    disableFilters: true,
    id: "statusDesc"
}, {
    Header: "Source",
    accessor: "helpdeskSourceDesc.description",
    disableFilters: true,
    id: "helpdeskSourceDesc"
}, {
    Header: "Email Id",
    accessor: "mailId",
    disableFilters: true,
    id: "mailId"
}, {
    Header: "Subject",
    accessor: "helpdeskSubject",
    disableFilters: true,
    id: "helpdeskSubject"
}, {
    Header: "Content",
    accessor: "helpdeskContent",
    disableFilters: true,
    id: "helpdeskContent"
},
{
    Header: "Created At",
    accessor: "createdAt",
    disableFilters: true,
    id: "createdAt"
}

]