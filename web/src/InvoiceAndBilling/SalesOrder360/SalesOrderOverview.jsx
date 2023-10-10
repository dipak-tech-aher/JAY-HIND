import React, { useEffect, useState } from 'react'
import moment from 'moment'
import { unstable_batchedUpdates } from 'react-dom';
import DateRangePicker from 'react-bootstrap-daterangepicker';
import { Link, Element } from 'react-scroll'
import { USNumberFormat } from '../../common/util/util'
import DynamicTable from '../../common/table/DynamicTable'
import { properties } from '../../properties'
import { get, post } from '../../common/util/restUtil'
import * as FileSaver from "file-saver";
import * as XLSX from "xlsx";

import { toast } from 'react-toastify';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const SalesOrderOverview = (props) => {

    const { soData, leftNavCounts, billInputs, refresh } = props.data
    const { setLeftNavCounts, setBillInputs, pageRefresh } = props.handler
    const [salesOrder, setSalesOrder] = useState({})
    const [salesOrderCounts, setSalesOrderCounts] = useState({})
    const [defaultDateRange, setDefaulDateRange] = useState({
        startDate: '',
        endDate: ''
    })
    useEffect(() => {
        
        get(properties.ORDERS_API + '/sales-order-list/' + soData?.customerId + '?soNumber=' + soData?.soNumber + '&soId=' + soData?.soId + '&esb=true')
            .then((response) => {
                if (response?.data) {
                    unstable_batchedUpdates(() => { 
                        if(response?.data[0]?.startDate !== null && response?.data[0]?.endDate !== null) 
                        {
                            setDefaulDateRange({
                                startDate: moment(response?.data[0]?.startDate).format('DD-MM-YYYY'),
                                endDate: moment(response?.data[0]?.endDate).format('DD-MM-YYYY')
                            })
                            setBillInputs({
                                ...billInputs,
                                startDate: response?.data[0]?.startDate,
                                endDate: response?.data[0]?.endDate
                            })
                        } 
                        else 
                        {
                            setDefaulDateRange({
                                startDate: moment(billInputs?.startDate).format('DD-MM-YYYY'),
                                endDate: moment(billInputs?.endDate).format('DD-MM-YYYY')
                            })
                        }
                        setSalesOrder(response?.data[0])
                        if (response?.data[0]?.salesOrderDtl) 
                        {
                            setLeftNavCounts({
                                ...leftNavCounts,
                                productDetails: response?.data[0]?.salesOrderDtl.length
                            })
                        }
                    })
                }
            })
            .catch((error) => {
                console.error(error)
            })
            .finally()
    }, [])

    useEffect(() => {
        const obj = {
            ...billInputs,
            soNumber: soData.soNumber
        }
        if(leftNavCounts?.productDetails !== "") 
        {
            
            post(properties.CUSTOMER_API + '/get-sales-order-count', obj).then((resp) => {
                if (resp.status === 200) {
                    setSalesOrderCounts({
                        ...salesOrderCounts,
                        totalSalesOrder: resp?.data?.totalSalesOrder,
                        totalBilledContract: resp?.data?.totalBilled,
                        totalNrcValue: resp?.data?.totalNrc,
                        totalRcValue: resp?.data?.totalRc,
                        totalBillingContract: resp?.data?.totalBillingContract,
                        totalInvoiceAmount: resp?.data?.totalInvoiceAmt,
                        totalRemainingValue: resp?.data?.totalBalance,
                        totalUsageValue: resp?.data?.totalUsage,
                        totalPaymentAmount: resp?.data?.totalPaymentAmount,
                        totalBillingScheduleCount: resp?.data?.totalBillingScheduleCount || 0,
                        totalBilledCount: resp?.data?.totalBilledCount || 0, 
                        percentageOfCompletion: resp?.data?.percentageOfCompletion || 0
                    })
                } else {
                    toast.error("Error while fetching counts")
                }
            }).catch(error => console.log(error)).finally()
        }
    }, [refresh,defaultDateRange])

    const handleCellRender = (cell, row) => {
        if (["Price Per Unit","Total Product Amount"].includes(cell.column.Header)) {
            return (
                <span>{USNumberFormat(cell.value)}</span>
            )
        }
        else if (cell.column.Header === "Quantity") {
            return (
                <span>{cell.value ? Number(cell.value).toFixed(0) : ''}</span>
            )
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    const handleDateRangeChange = (event, picker) => {
        let startDate = moment(picker.startDate).format('YYYY-MM-DD');
        let endDate = moment(picker.endDate).format('YYYY-MM-DD');
        unstable_batchedUpdates(() => {
            setBillInputs({
                ...billInputs,
                startDate: startDate,
                endDate: endDate
            })
            pageRefresh()
        })
    }

    const exportToCSV = () => {
        
        const fileName = `Product_Details_${moment(new Date()).format('DD MMM YYYY')}`
        const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
        const fileExtension = ".xlsx";
        let tableData = [];
        salesOrder?.salesOrderDtl.forEach(element => {
            let objConstruct = {}
            objConstruct["Sales Order Detail ID"] = element?.soDetId
            objConstruct["Product Name"] = element?.productName
            objConstruct["Product Description"] = element?.description
            objConstruct["Price Per Unit"] = USNumberFormat(element?.pricePerUnit)
            objConstruct["Quantity"] = element?.quantity
            tableData.push(objConstruct);
        })
        
        if (tableData.length !== 0) {
            const ws = XLSX.utils.json_to_sheet(tableData,
            {
                origin: 'A2',                 
                skipHeader: false            
            });
            const wb = {
                Sheets: { data: ws },
                SheetNames: ["data"]
            };

            const excelBuffer = XLSX.write(wb, {
                bookType: "xlsx",
                type: "array"
            });
            const data = new Blob(
                [excelBuffer], { type: fileType }
            );
            FileSaver.saveAs(data, fileName + fileExtension);
        }
        
    };

    return (
        <>
            <div className="row" id="salefilter">
                <section className="triangle col-12 p-1">
                    <div className="row col-12">
                        <div className="col-md-8">
                            <h4 id="list-item-0" className="pl-1"><b>Service ID: {soData?.soNumber}</b></h4>
                        </div>
						<div className="col-md-3 so-field">
							<div className="">
                                {
                                    leftNavCounts?.productDetails && 
                                    <div>
                                        <DateRangePicker
                                            initialSettings={{
                                                startDate: moment(billInputs?.startDate).format('DD-MM-YYYY'), endDate: moment(billInputs?.endDate).format('DD-MM-YYYY'),
                                                linkedCalendars: true, showCustomRangeLabel: true,
                                                showDropdowns: true, alwaysShowCalendars: true,
                                                locale: { format: "DD/MM/YYYY" },
                                                //maxDate: moment(),
                                                opens: 'left',
                                                ranges: {
                                                    'Default Range': [defaultDateRange?.startDate, defaultDateRange?.endDate],
                                                    // 'Today': [moment(), moment()],
                                                    // 'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                                                    // 'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                                                    // 'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                                                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                                                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                                                    'This Year': [moment().startOf('year'), moment().format('DD-MM-YYYY')]
                                                }
                                            }}
                                            onApply={handleDateRangeChange}
                                        >
                                            <input className='input-sm form-control ml-1 cursor-pointer' />
                                        </DateRangePicker>
                                    </div>
                                } 
						    </div>
						</div>
                    </div>
                </section>
            </div>
            <br/>
            <div className="col-md-12 card-box m-0 ">
                <div className="grid-box">
					<div className="row">
			    	    <div className="col-md-4">
							<div className="widget-left">
							    <div className="sale-order-val">
								    <p>Total Service</p>
								    <h2><span className="dollar-icon"></span>{USNumberFormat(salesOrderCounts?.totalSalesOrder)}</h2>
								    <div className="empt-spc"></div>
								    <p>Total Billing Contract</p>
								    <h2><span className="dollar-icon"></span>{USNumberFormat(salesOrderCounts?.totalBillingContract)}</h2>
								</div>
								<div className="billed-cont clearfix">
								    <div className="contract-left">
								        <p>Total Billed Contract</p>
									    <h3>{USNumberFormat(salesOrderCounts?.totalBilledContract)}</h3>
								    </div>
								    <div className="contract-right">
								        <p>Total Remaining Contract</p>
									    <h3>{USNumberFormat(salesOrderCounts?.totalRemainingValue)}</h3>
								    </div>
								</div>
							</div>
						</div>
						<div className="col-md-8">
							<div className="widget-right">
							    <div className="row">
							        <div className="col-md-4">
							            <div className="total-inv">
								            <p>Total Invoice Amount</p>
									        <h2><span className="dollar-icon"></span>{USNumberFormat(salesOrderCounts?.totalInvoiceAmount)}</h2>
								        </div>
								        <div className="total-inv inv-btm">
                                            <p>Total Paid Amount</p>
                                            <h2><span className="dollar-icon"></span>{USNumberFormat(salesOrderCounts?.totalPaymentAmount)}</h2>
                                        </div>
							        </div>
                                    <div className="col-md-4 widget-percen">
                                        <div className="percen-comp">
                                            <p>Percentage of Completion</p>
                                            {/* <div className="chart">
                                                <div className="piechart" style={{animationDelay:"-35s;"}}>
                                                    <div className="pie_content">
                                                        
                                                        <span className="value">{salesOrderCounts?.percentageOfCompletion ? (salesOrderCounts?.percentageOfCompletion).toFixed(1) : 0} %</span> 
                                                    </div>
                                                </div>
                                            </div> */}
                                            <div className="chart pl-3 pt-2">
                                                <div style={{ width: 100, height: 100 }}>
                                                    <CircularProgressbar
                                                        value={salesOrderCounts?.percentageOfCompletion ? (salesOrderCounts?.percentageOfCompletion).toFixed(1) : 0}
                                                        text={`${salesOrderCounts?.percentageOfCompletion ? (salesOrderCounts?.percentageOfCompletion).toFixed(1) : 0}%`}
                                                        styles={buildStyles({
                                                            strokeLinecap: 'butt',
                                                            textSize: '20px',
                                                            pathTransitionDuration: 0.5,
                                                            pathColor: `green`,
                                                            textColor: 'grey',
                                                            trailColor: 'light-grey',
                                                            backgroundColor: 'white',
                                                        })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4 widget-bill">
                                        <div className="bill-count-sec">
                                            <div className="bill-count-top clearfix">
                                                <div className="bil-count-left">
                                                    <h2>{salesOrderCounts?.totalBillingScheduleCount ? salesOrderCounts?.totalBillingScheduleCount : 0 }</h2>
                                                    <p>Total Billing Month Count</p>
                                                </div>
                                                <div className="bil-count-left">
                                                    <h2>{salesOrderCounts?.totalBilledCount ? salesOrderCounts?.totalBilledCount : 0}</h2>
                                                    <p>Total Billed Month Count</p>
                                                </div>
                                            </div>
                                            <div className="bill-count-bottom clearfix">
                                                <div className="total-bill-amt clearfix">
                                                    <p>Total RC Value</p>
                                                    <h3>{USNumberFormat(salesOrderCounts?.totalRcValue)}</h3>
                                                </div>
                                                <div className="total-bill-amt clearfix">
                                                    <p>Total NRC Value</p>
                                                    <h3>{USNumberFormat(salesOrderCounts?.totalNrcValue)}</h3>
                                                </div>
                                                <div className="total-bill-amt clearfix">
                                                    <p>Total Usage Value</p>
                                                    <h3>{USNumberFormat(salesOrderCounts?.totalUsageValue)}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
							    </div>
							</div>
						</div>
					</div>
				</div>
                <div className="col-12">
                    <div className="row pt-1">
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Service ID</label>
                                <p>{salesOrder?.soNumber || '-'} </p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Customer Name</label>
                                <p>{salesOrder?.customerName || '-'}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">PO Number</label>
                                <p>{salesOrder?.poNumber || '-'}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Service Email ID</label>
                                <p>{salesOrder?.emailId || '-'}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Service Contact Number</label>
                                <p>{salesOrder?.contactNo || '-'}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Service Representative Name</label>
                                <p>{salesOrder?.salesRepName || '-'}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Service Created Date</label>
                                <p>{salesOrder?.soCreatedAt ? moment(salesOrder?.soCreatedAt).format('DD-MMM-YYYY hh:mm:ss A') : '-'}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Service Status</label>
                                <p>{salesOrder?.soStatus || '-'}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Service Status Reason</label>
                                <p>{salesOrder?.soStatusReason || '-'}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Service Type</label>
                                <p>{salesOrder?.soTypeDes?.description || '-'}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Contract Duration</label>
                                <p>{salesOrder?.contractDuration || '-'}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Contract Status Reason</label>
                                <p>{salesOrder?.contStatReasonDes?.description || '-'}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Payment Terms</label>
                                <p>{salesOrder?.paymentTermsDes?.description || '-'}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Service Closure Date</label>
                                <p>{salesOrder?.soClosureAt ? moment(salesOrder?.soClosureAt).format('DD-MMM-YYYY hh:mm:ss A') : '-'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-md-12 form-group details bg-grey">
                            <label className="col-form-label pt-0">Service Description</label>
                            <textarea disabled={true} className="form-control mb-2" rows="3" value={salesOrder?.soDescription}></textarea>
                        </div>
                    </div>
                </div>
            </div>
            <Element name="productDetailsSection">
                <div className="row pt-1">
                    <section className="triangle col-12">
                        <div className="row col-12">
                            <div className="col-10">
                                <h4 id="list-item-1">Products Details</h4>
                            </div>
                        </div>
                    </section>
                </div>
                <div className="col-md-12 pl-0 pr-0 card-box m-0 ">
                    {
                        salesOrder?.salesOrderDtl && salesOrder?.salesOrderDtl.length > 0 ?
                            <>
                                <div className="row">								       
                                    <div className="col-12 text-left pt-0">
                                        <button className="btn btn-primary  waves-effect waves-light m-1 float-left"
                                            onClick={exportToCSV}>Export to Excel
                                        </button>
                                    </div>
                                </div>
                                <div className="card p-1">
                                    <DynamicTable
                                        row={salesOrder?.salesOrderDtl}
                                        itemsPerPage={10}
                                        header={SalesOrderDetailColumns}
                                        handler={{
                                            handleCellRender: handleCellRender,
                                        }}
                                    />
                                </div>
                            </>
                            :
                            <span className="msg-txt">No Product Details Available</span>
                    }
                </div>
            </Element>
        </>
    )
}

export default SalesOrderOverview

const SalesOrderDetailColumns = [
    // {
    //     Header: "Sales Order Detail ID",
    //     accessor: "soDetId",
    //     disableFilters: true
    // },
    {
        Header: "Product Name",
        accessor: "productName",
        disableFilters: true
    },
    {
        Header: "Product Description",
        accessor: "description",
        disableFilters: true
    },
    {
        Header: "Price Per Unit",
        accessor: "pricePerUnit",
        disableFilters: true
    },
    {
        Header: "Quantity",
        accessor: "quantity",
        disableFilters: true
    },
    {
        Header: "Total Product Amount",
        accessor: "lineItemTotalAmt",
        disableFilters: true
    }
]