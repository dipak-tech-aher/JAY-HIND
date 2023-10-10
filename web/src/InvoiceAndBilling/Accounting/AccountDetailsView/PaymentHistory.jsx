import React, { useEffect, useRef, useState } from 'react'
import moment from 'moment'
import DynamicTable from '../../../common/table/DynamicTable';

import { post } from '../../../common/util/restUtil';
import { properties } from '../../../properties';
import { formFilterObject, USNumberFormat } from '../../../common/util/util';
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';

const PaymentHistory = (props) => {

    const { accountData } = props?.data
    // console.log('-----------------------accountData',accountData)
    const refresh = props?.data?.refresh || false
	const isScroll = props?.data?.isScroll ??  true
    const [paymentHistoryList, setPaymentHistoryList] = useState([])
    const [exportBtn, setExportBtn] = useState(false)
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const isTableFirstRender = useRef(true);


    useEffect(() => {
        getPaymentHistoryData()
    }, [currentPage, perPage/*,refresh*/])

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

    const getPaymentHistoryData = () => {
        const requestBody = {
            customerUuid: accountData.customerUuid,
            filters: formFilterObject(filters)
        }
        // console.log('----------------0000000000000000000000000000000',requestBody )
        post(`${properties.BILLING_API}/paymentHistory?limit=${perPage}&page=${currentPage}`, requestBody)
            .then((response) => {
                const { count, rows } = response.data;
                if (!!rows.length) {
                    unstable_batchedUpdates(() => {
                        setTotalCount(count)
                        setPaymentHistoryList(rows)
                    })
                }
                else
                {
                    if(filters.length)
                    {
                        toast.error('No Records Found')
                    }
                }
            }).catch(error => console.log(error))
            .finally()
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Reference Date") {
            return (
                <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
            )
        }
        else if (cell.column.Header === "Payment Date") {
            return (
                <span>{cell.value ? moment(cell.value).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>
            )
        }
        else if (cell.column.Header === "Customer Name") {
            let name = row?.original?.Customer?.firstName + " " + row?.original?.Customer?.lastName
            return (
                <span>{name}</span>
            )
        }
        else if (cell.column.Header === "Customer Number") {
            let cNo = row?.original?.Customer?.customerNo
            return (
                <span>{cNo}</span>
            )
        }
        else if (cell.column.Header === "Payment Captured By") {
            let name = row?.original?.createdByName.firstName + " " + row?.original?.createdByName?.lastName
            return (
                <span>{name}</span>
            )
        }
        else if (cell.column.Header === "Reference Name" || cell.column.Header === "Reference Number") {
            return (
                <span>{cell.value ? cell.value : '-'}</span>
            )
        }
        else if (cell.column.Header === "Amount Paid") {
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
                    !!paymentHistoryList.length ?
                    <div className="card p-2">
                        <DynamicTable
							isScroll={isScroll}
                            listKey={"Payment History"}
                            row={paymentHistoryList}
                            rowCount={totalCount}
                            header={PaymentHistoryColumns}
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
                    </div>
                    :
                    <span className="msg-txt">No Payment History</span>
                }
            </div>
        </>
    )
}

export default PaymentHistory

export const PaymentHistoryColumns = [
    {
        Header: "Payment Receipt Number",
        accessor: "paymentId",
        disableFilters: true,
        id: 'paymentId'
    },
    {
        Header: "Customer Number",
        accessor: "customerNo",
        disableFilters: true,
        id: 'customerNumber'
    },
    {
        Header: "Customer Name",
        accessor: "customerName",
        disableFilters: true,
        id: 'customerName'
    },
    {
        Header: "Biilable Reference Number",
        accessor: "billRefNo",
        disableFilters: true,
        id: 'billRefNo'
    },
    {
        Header: "Payment Date",
        accessor: "createdAt",
        disableFilters: true,
        id: 'createdAt'
    },
    {
        Header: "Currency",
        accessor: "currencyDesc.description",
        disableFilters: true,
        id: 'currency'
    },
    {
        Header: "Amount Paid",
        accessor: "paymentAmount",
        disableFilters: true,
        id: 'paymentAmount'
    },
    {
        Header: "Payment Captured By",
        accessor: "createdBy",
        disableFilters: true,
        id: 'createdBy'
    },
    {
        Header: "Payment Mode",
        accessor: "paymentModeDesc.description",
        disableFilters: true,
        id: 'paymentMode'
    },
    {
        Header: "Reference Number",
        accessor: "refNo",
        disableFilters: true,
        id: 'refNo'
    },
    {
        Header: "Reference Date",
        accessor: "refDate",
        disableFilters: true,
        id: 'refDate'
    },
    {
        Header: "Reference Name",
        accessor: "refName",
        disableFilters: true,
        id: 'refName'
    }
]