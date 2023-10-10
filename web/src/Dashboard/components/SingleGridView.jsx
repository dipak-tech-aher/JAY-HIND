import React, { useCallback, useEffect, useRef, useState } from "react";
import { unstable_batchedUpdates } from 'react-dom';
import DynamicTable from '../../common/table/DynamicTable';

const SingleGridView = (props) => {

    const [perPage, setPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [exportBtn, setExportBtn] = useState(false)
    const [currentPage, setCurrentPage] = useState(0);
    const [singleGridViewDetails, setSingleGridViewDetails] = useState([]);
    const isTableFirstRender = useRef(true);

    const { headerName, rowData } = props.data


    const getAgentData = useCallback(() => {
        unstable_batchedUpdates(() => {
            setTotalCount(rowData.singleGridView.length);
            setSingleGridViewDetails(rowData.singleGridView.data);
        })
    });

    useEffect(() => {
        getAgentData();
    }, [getAgentData]);

    const handleCellRender = (cell, row) => {
        return (
            <span>{cell.value}</span>
        )
    }

    const handlePageSelect = (pageNo) => {
        //isFirstRender.current = false
        setCurrentPage(pageNo)
    }


    return (
        <>
            <div className="col-lg-12">
                <div>
                    <div className="card-body">
                        <div className="modal-header">
                            <h5>{headerName}</h5>
                        </div>
                        <div className="card-body" id="datatable">
                            {
                                <DynamicTable
                                    listKey={"Agent List"}
                                    row={singleGridViewDetails}
                                    rowCount={totalCount}
                                    header={SingleGridViewColumn}
                                    itemsPerPage={perPage}
                                    // backendPaging={true}
                                    // backendCurrentPage={currentPage}
                                    exportBtn={exportBtn}
                                    handler={{
                                        handleExportButton: setExportBtn,
                                        handleCellRender: handleCellRender,
                                        handlePageSelect: handlePageSelect,
                                        handleItemPerPage: setPerPage,
                                        handleCurrentPage: setCurrentPage,
                                    }
                                    }
                                />
                            }
                        </div>
                    </div>
                </div>
            </div >
        </>
    )
}
export default SingleGridView

const SingleGridViewColumn = [
    {
        Header: "Product",
        accessor: "product",
        disableFilters: true,
    }, {
        Header: "ExSatisfied",
        accessor: "exSatisfied",
        disableFilters: true,
    }, {
        Header: "Satisfied",
        accessor: "satisfied",
        disableFilters: true,
    },
    {
        Header: "Neutral",
        accessor: "neutral",
        disableFilters: true,
    },
    {
        Header: "UnSatisfied",
        accessor: "unSatisfied",
        disableFilters: true,
    },
    {
        Header: "Ex UnSatisfied",
        accessor: "exUnSatisfied",
        disableFilters: true,
    }
]