import React, { useEffect, useState, useRef } from 'react'
import moment from 'moment'
import DynamicTable from '../../common/table/DynamicTable'
import { formFilterObject, USNumberFormat } from '../../common/util/util'
import { post } from '../../common/util/restUtil'
import { properties } from '../../properties'
import BillingScheduleModal from './BillingScheduleModal'

import { unstable_batchedUpdates } from 'react-dom'

const BillingSchedule = (props) => {

    const { soData, leftNavCounts, refresh, billInputs } = props.data
    const { setLeftNavCounts } = props.handler
    const [billingScheduleList, setBillingScheduleList] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [billingData, setBillingData] = useState({})
    const isFirstRender = useRef(true);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);
    const [exportBtn, setExportBtn] = useState(false);
    const [listSearch, setListSearch] = useState([]);

    const getBillingScheduleData = () => {
        
        const requestBody = {
            ...soData,
            startDate: billInputs.startDate,
            endDate: billInputs.endDate,
            filters: formFilterObject(filters)
        }
        setListSearch(requestBody)
        post(`${properties.CONTRACT_API}/scheduled-contract?limit=${perPage}&page=${currentPage}`, requestBody)
            .then(resp => {
                const { rows, count } = resp ?.data
                unstable_batchedUpdates(() => {
                    setBillingScheduleList(rows);
                    setTotalCount(count)
                })
                setLeftNavCounts({
                    ...leftNavCounts,
                    billingSchedule: resp ?.data ?.count
                })
            })
            .catch((error) => {
                console.error(error)
            })
            .finally()
    }

    useEffect(() => {
        getBillingScheduleData()
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

    const handleCellClick = (data) => {
        if(data?.invoiceDtl) 
        {
            setBillingData(data.invoiceDtl)
        }
        else 
        {
            const invoiceData = {}
            let invAmt = 0
            invoiceData.invoiceId = null
            invoiceData.customer = [data?.customer]
            invoiceData.billRefNo = data?.billRefNo
            invoiceData.invStartDate = data?.startDate
            invoiceData.invEndDate = data?.endDate
            invoiceData.invDate = null
            invoiceData.dueDate = moment(data?.endDate).clone().endOf('month').format('YYYY-MM-DD')
            invoiceData.invAmt = invAmt
            invoiceData.invOsAmt = invAmt
            invoiceData.invoiceStatus =  data?.status === 'BILLED' ? 'CLOSED' : 'SCHEDULED'

            const invDtl = []
            for(const i of data?.monthlyContractDtl) {
                invDtl.push({
                    monthlyContractDet:  i,
                    invoiceId: null,
                    invStartDate: i?.actualStartDate,
                    invEndDate: i?.actualEndDate,
                    chargeAmt: i?.chargeAmt,
                    creditAdj: i?.creditAdjAmount,
                    debitAdj: i?.debitAdjAmt,
                    invAmt: i?.chargeAmt,
                    invOsAmt: data?.status === 'BILLED' ? null : i?.chargeAmt,
                    invoiceStatus: data?.status === 'BILLED' ? 'CLOSED' : 'SCHEDULED',
                    billRefNo: data?.billRefNo
                })
                invAmt = invAmt + Number(i?.chargeAmt || 0)
            }
            invoiceData.invAmt = invAmt
            invoiceData.invOsAmt = data?.status === 'BILLED' ? null : invAmt
            invoiceData.invoiceDetails = invDtl
            setBillingData(invoiceData)
        }
        setIsOpen(true)
    }

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Invoice Amount") {
            let invAmt = 0
            if(row?.original?.invoiceDtl && row?.original?.invoiceDtl !== null)
            {
                for(const i of row?.original?.invoiceDtl?.invoiceDetails)
                {
                    invAmt = invAmt + Number(i?.chargeAmt || 0)
                }
            }
            else 
            {
                for(const i of row?.original?.monthlyContractDtl) 
                {
                    invAmt = invAmt + Number(i?.chargeAmt || 0)
                }
            }
            return (
                <span>{USNumberFormat(invAmt)}</span>
            )
        }
        else if (cell.column.Header === "ID") {
            let isGenerated = ((row?.original?.invoiceDtl && row?.original?.invoiceDtl?.invoiceId) || row?.original?.status === 'BILLED' ) ? true : false
            // return (
            //     <>
            //     <span className={`tooltip1  status-${['BILLED', 'UNBILLED','PENDING','HOLD'].includes(row?.original?.status) ? 'paid2': row?.original?.status === 'SCHEDULED' ? 'underpaid2' : 'unpaid2' }`}>
            //         <span className=" tooltiptext1">{['BILLED', 'UNBILLED','PENDING','HOLD'].includes(row?.original?.status) ? 'Generated' : row?.original?.status === 'SCHEDULED' ? 'Scheduled' : row?.original?.status}</span>
            //             {['BILLED', 'UNBILLED','PENDING','HOLD'].includes(row?.original?.status) ? 'Generated' : row?.original?.status === 'SCHEDULED' ? 'Scheduled' : row?.original?.status}
            //     </span>
            //     <span className="ml-2 text-secondary cursor-pointer" onClick={() => { handleCellClick(row?.original) }}>{cell.value}</span>
            //     </>
            // )
            return (
                <>
                <span className={`tooltip1  billing-schedule-${isGenerated ? 'generated': isGenerated === false ? 'scheduled' : 'unpaid2' }`}>
                    <span className=" tooltiptext1">{isGenerated ? 'Generated' : isGenerated === false ? 'Scheduled' : row?.original?.status}</span>
                        {isGenerated ? 'Generated' : isGenerated === false ? 'Scheduled' : row?.original?.status}
                </span>
                <span className="ml-2 text-secondary cursor-pointer" onClick={() => { handleCellClick(row?.original) }}>{cell.value}</span>
                </>
            )
        }
        else if (cell.column.Header === "Payment Status") {
            return (
                <>
                    {
                        cell?.value && cell?.value !== null  ? 
                        <span 
                            className={`${['Paid','Generated'].includes(cell.value) ? 'paid': cell.value === 'Overpaid' ? 'upaid' : 'unpaid' }`}>
                            {cell.value}
                        </span>
                        :
                        <span>{cell?.value}</span>
                    }
                </>
                
            )
        }
        else if (["Schedule Start Date", "Schedule End Date", "Due Date"].includes(cell.column.Header)) {
            return (
                <span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>
            )
        }
        if (cell.column.Header === "Customer Name") {
            const name = (row ?.original ?.customer ?.firstName || "") + (row ?.original ?.customer ?.lastName || "")
            return (
                <span>{name}</span>
            )
        }
        if (cell.column.Header === "Invoice Status") {
            let isGenerated = ((row?.original?.invoiceDtl && row?.original?.invoiceDtl?.invoiceId) || row?.original?.status === 'BILLED' ) ? true : false
            const status = isGenerated ? 'Generated' : isGenerated === false ? 'Scheduled' : row?.original?.status
            return (
                <span 
                    className={`billing-${isGenerated ? 'generated': isGenerated === false ? 'scheduled' : 'unpaid' }`}>
                    {status}
                </span>
            )
            // const status = ['BILLED', 'UNBILLED','PENDING','HOLD'].includes(row?.original?.status) ? 'Generated' : row?.original?.status === 'SCHEDULED' ? 'Scheduled' : row?.original?.status
            // return (
            //     <span 
            //         className={`${['BILLED', 'UNBILLED','PENDING','HOLD'].includes(row?.original?.status) ? 'paid': row?.original?.status === 'SCHEDULED' ? 'upaid' : 'unpaid' }`}>
            //         {status}
            //     </span>
            // )
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    return (
        <div className="row mt-1">
            <div className="col-lg-12">
                <div className="search-result-box m-t-30 card-box">
                    {
                        billingScheduleList.length > 0 ?
                            <div className="card p-1">
                                <DynamicTable
                                    listKey={"Billing Schedule"}
                                    listSearch={listSearch}
                                    row={billingScheduleList}
                                    rowCount={totalCount}
                                    header={BillingScheduleColumns}
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
                            <span className="msg-txt">No Billing Schedule Available</span>
                    }
                </div>
                {
                    isOpen &&
                    <BillingScheduleModal
                        data={{
                            isOpen,
                            billingData
                        }}
                        handler={{
                            setIsOpen
                        }}
                    />
                }
            </div>
        </div>
    )
}

export default BillingSchedule

const BillingScheduleColumns = [
    {
        Header: "ID",
        accessor: "monthlyContractId",
        disableFilters: true
    },
    {
        Header: "Customer No",
        accessor: "billRefNo",
        disableFilters: true
    },
    {
        Header: "Customer Name",
        accessor: "customer.firstName",
        disableFilters: true
    },
    {
        Header: "Schedule Start Date",
        accessor: "startDate",
        disableFilters: true
    },
    {
        Header: "Schedule End Date",
        accessor: "endDate",
        disableFilters: true
    },
    {
        Header: "No of Billings",
        accessor: "noOfBillings",
        disableFilters: true
    },
    {
        Header: "Due Date",
        accessor: "nextBillPeriod",
        disableFilters: true
    },
    {
        Header: "Invoice Status",
        accessor: "status",
        disableFilters: true
    },
    {
        Header: "Invoice Amount",
        accessor: "invoiceAmount",
        disableFilters: true
    },
    {
        Header: "Payment Status",
        accessor: "paymentStatus",
        disableFilters: true
    }
]