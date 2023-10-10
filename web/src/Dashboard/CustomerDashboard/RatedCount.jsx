import { useState, useRef, useEffect } from "react"
import DynamicTable from "../../common/table/DynamicTable"

const RatedCount = (props) => {
    const { headerName } = props.data
    const [agentLookUp, setAgentLookUp] = useState()
    const [selectedAgent, setSelectedAgent] = useState()
    const isFirstRender = useRef(true);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);
    const [exportBtn, setExportBtn] = useState(true)
    const [ratedCoutDetails, setRatedCountDetails] = useState([])

   
    useEffect(() => {
        if (!isFirstRender.current) {
            //call getRatedCount Function
        }
        else {
            isFirstRender.current = false;
        }
    }, [currentPage, perPage])

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleCellRender = (cell, row) => {
        return (
            <span>{cell.value}</span>
        )
    }
   
    return (
        <>
            <div className="col-lg-12">
                <div>
                    <div className="card-body">
                        <div className="modal-header">
                            <h5>{headerName}</h5>
                        </div>
                        <div className="modal-body">
                            <div className="row flex-row-reverse mb-2">

                                <div className="col-4">
                                    <div className="form-group">
                                        <label htmlFor="catalog" className="col-form-label">Select Agent</label>
                                        <select id="catalog" className="form-control">
                                            <option value="Rahim">Rahim</option>
                                            {agentLookUp && agentLookUp.map((e) => (
                                                <option value={e.name}>{e.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <table className="table table-sm table-nowrap">
                                <thead>
                                    <tr>
                                        <th>Agent Name</th>
                                        <th>Count Of Rated</th>
                                        <th>Average Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedAgent && selectedAgent.map((e) => (
                                        <tr>
                                            <td>{e.name}</td>
                                            <td>{e.count}</td>
                                            <td>{e.score}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="card-body" id="datatable">
                              { ratedCoutDetails &&  <DynamicTable
                                    listKey={"Account List"}
                                    row={ratedCoutDetails}
                                    rowCount={totalCount}
                                    header={RatedCountColumns }
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
                                />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default RatedCount


const RatedCountColumns = [
    {
        Header: "Product",
        accessor: "interactionId",
        disableFilters: true,
    },
]