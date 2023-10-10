import React, { useEffect, useRef, useState } from 'react'
import moment from 'moment'
import DynamicTable from '../../../common/table/DynamicTable';
import AdjustmentView from './AdjustmentView';
import { post } from '../../../common/util/restUtil';
import { properties } from '../../../properties';

import { formFilterObject, USNumberFormat } from '../../../common/util/util';
import { unstable_batchedUpdates } from 'react-dom';

const AdjustmentHistory = (props) => {

    const accountData = props?.data?.data
    const isScroll = props?.data?.isScroll ??  true
    const refresh = props?.data?.refresh || false
    const [adjustmentHistoryList, setAdjustmentHistoryList] = useState([])
    const [exportBtn, setExportBtn] = useState(false)
    const [isAdjustmentViewOpen, setIsAdjustmentViewOpen] = useState(false)
    const [adjustmentData, setAdjustmentData] = useState([])
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const isTableFirstRender = useRef(true);

    useEffect(() => {
        getAdjustmentHistoryData()
    }, [currentPage, perPage/*, refresh*/])

    useEffect(() => {
        unstable_batchedUpdates(() => {
            setPerPage(10);
            setCurrentPage((currentPage) => {
                if (currentPage === 0) {
                    return '0'
                }
                return 0
            });
        })
    }, [refresh])

    const getAdjustmentHistoryData = () => {
        const body={
            limit: perPage,
            page: currentPage,
            all:false,
            filter:{
                billRefNo:accountData[0]?.billRefNo
            },
            filters: formFilterObject(filters)
        }
        
        
        post(`${properties.ADJUSTMENT_API}/list?limit=${perPage}&page=${currentPage}`, body)
            .then((response) => {
                if (response.data) {
                    setTotalCount(response?.data?.count)
                    setAdjustmentHistoryList(response?.data?.rows)
                }
            })
            .catch((error) => {
                console.log(error)
            })
            .finally()
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleCellRender = (cell, row) => {

        if (cell.column.Header === "Adjustment Period") {
            return (
                <span>{moment(cell.value).format('DD MMM YYYY')}</span>
            )
        }
        else if (cell.column.Header === "Modified On") {
            return (
                <span>{moment(cell.value).format('DD MMM YYYY hh:mm:ss A')}</span>
            )
        }
        else if (cell.column.Header === "Adjustment Number") {
            return (
                <>
                    {
                        isAdjustmentViewOpen === false ?
                            <span className="text-secondary cursor-pointer"
                                onClick={() => {
                                    setAdjustmentData([row?.original])
                                    setIsAdjustmentViewOpen(true)
                                }}
                            >
                                {cell.value}
                            </span>
                            :
                            <span>{cell.value}</span>
                    }
                </>

            )
        }
        else if (cell.column.Header === "Total Adjustment Amount" || cell.column.Header === "Charge Amount" || cell.column.Header === "Adjustment Amount") {
            return (
                <span>{USNumberFormat(cell.value)}</span>
            )
        }
        else {
            return (
                <span>{cell.value}</span>
            )
        }
    }

    return (
        <>
            <div className="col-md-12 card-box m-0">
                {
                    
                    !!adjustmentHistoryList.length ?
                    <div className="card p-2">
                        <DynamicTable
                            listKey={"Adjustment History"}
                            isScroll={isScroll}
                            row={adjustmentHistoryList}
                            rowCount={totalCount}
                            header={AdjustmentHistoryColumns}
                            hiddenColumns={AdjustmentHistoryHiddenColumns}
                            itemsPerPage={perPage}
                            backendPaging={true}
                            backendCurrentPage={currentPage}
                            isTableFirstRender={isTableFirstRender}
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
                        {/* <DynamicTable
                            listKey={"Adjustment History"}
                            row={adjustmentHistoryList}
                            header={AdjustmentHistoryColumns}
                            hiddenColumns={AdjustmentHistoryHiddenColumns}
                            itemsPerPage={10}
                            exportBtn={exportBtn}
                            handler={{
                                handleCellRender: handleCellRender,
                                handleExportButton: setExportBtn
                            }}
                        /> */}
                    </div>
                    :
                    <span className="msg-txt">No Adjustment History Available</span>
                }
                {
                    isAdjustmentViewOpen &&
                    <AdjustmentView
                        data={{
                            adjustmentData: adjustmentData,
                            isOpen: isAdjustmentViewOpen,
                            AdjustmentHistoryColumns: AdjustmentHistoryColumns
                        }}
                        handler={{
                            setIsOpen: setIsAdjustmentViewOpen,
                            handleCellRender: handleCellRender
                        }}
                    />
                }
            </div>
        </>
    )
}

export default AdjustmentHistory

export const AdjustmentHistoryHiddenColumns = ["serviceNumber", "chargeName", "chargeType", "chargeAmount", "adjAmount"]

export const AdjustmentHistoryColumns = [
    {
        Header: "Adjustment Number",
        accessor: "adjustmentId",
        disableFilters: false,
        id: 'adjustmentNo'
    },
    {
        Header: "Adjustment Period",
        accessor: "adjustmentPeriod",
        disableFilters: true,
        id: 'adjustmentPeriod'
    },
    {
        Header: "Adjustment Category",
        accessor: "adjustmentCat",
        disableFilters: false,
        id: 'adjustmentCategory'
    },
    {
        Header: "Adjustment Type",
        accessor: "adjustmentTypeDesc",
        disableFilters: false,
        id: 'adjustmentType'
    },
    {
        Header: "Biilable Reference Number",
        accessor: "billRefNo",
        disableFilters: false,
        id: 'billRefNo'
    },
    {
        Header: "Contract ID",
        accessor: "contractId",
        disableFilters: false,
        id: 'contractId'
    },
    {
        Header: "Contract Name",
        accessor: "contractName",
        disableFilters: false,
        id: 'contractName'
    },
    {
        Header: "Total Adjustment Amount",
        accessor: "totalAdjAmount",
        disableFilters: true,
    },
    {
        Header: "Status",
        accessor: "statusDesc",
        disableFilters: true,
    },
    {
        Header: "Reason",
        accessor: "reason",
        disableFilters: true,
    },
    {
        Header: "Remarks",
        accessor: "remarks",
        disableFilters: true,
    },
    {
        Header: "Modified By",
        accessor: "modifiedBy",
        disableFilters: true,
    },
    {
        Header: "Modified On",
        accessor: "modifiedOn",
        disableFilters: true,
    },
    {
        Header: "Service Number",
        accessor: "serviceNumber",
        disableFilters: false,
        id: "serviceNumber"
    },
    {
        Header: "Charge Name",
        accessor: "chargeName",
        disableFilters: true,
    },
    {
        Header: "Charge Type",
        accessor: "chargeType",
        disableFilters: true,
    },
    {
        Header: "Charge Amount",
        accessor: "chargeAmount",
        disableFilters: true,
    },
    {
        Header: "Adjustment Amount",
        accessor: "adjAmount",
        disableFilters: true,
    }
]