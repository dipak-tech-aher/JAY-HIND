import React, { useState } from 'react'
import moment from 'moment'
import DynamicTable from '../../../../../common/table/DynamicTable'
import AddressPreview from '../../../CustomerAddressPreview'
import { ProductDetailsColumns } from './../EditOrderColumns'

const SalesOrderDetails = (props) => {

    const { complaintData, customerData } = props.data
    const productDetailsList = complaintData?.productDetails || []

    const handleCellRender = (cell, row) => {
        return (<span>{cell.value}</span>)
    }

    return (
        <div className="mt-2">
            <div className="row pl-2">
                <div className="col-12">
                    <div className="row pt-1">
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Service ID</label>
                                <p>{complaintData?.soDet?.soNumber || '-'} </p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Customer Name</label>
                                <p>{complaintData?.soDet?.customerName || '-'}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Service Email ID</label>
                                <p>{complaintData?.soDet?.emailId || '-'}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Service Contact Number</label>
                                <p>{complaintData?.soDet?.contactNo || '-'}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Service Representative Name</label>
                                <p>{complaintData?.soDet?.salesRepName || '-'}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Service Created Date</label>
                                <p>{complaintData?.soDet?.soCreatedAt ? moment(complaintData?.soDet?.soCreatedAt).format('DD-MMM-YYYY hh:mm:ss A') : '-'}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Service Status</label>
                                {/* <p>{complaintData?.soDet?.soStatusDes?.description || '-'}</p> */}
                                <p>{complaintData?.soDet?.soStatus || '-'}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Service Status Reason</label>
                                {/* <p>{complaintData?.soDet?.soStatReasonDes?.description || '-'}</p> */}
                                <p>{complaintData?.soDet?.soStatusReason || '-'}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Service Type</label>
                                <p>{complaintData?.soDet?.soTypeDes?.description || '-'}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Contract Duration</label>
                                <p>{complaintData?.soDet?.contractDuration || '-'}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Contract Status Reason</label>
                                <p>{complaintData?.soDet?.contStatReasonDes?.description || '-'}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Payment Terms</label>
                                <p>{complaintData?.soDet?.paymentTermsDes?.description || '-'}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="ticketNo" className="col-form-label">Service Closure Date</label>
                                <p>{complaintData?.soDet?.soClosureAt ? moment(complaintData?.soDet?.soClosureAt).format('DD-MMM-YYYY hh:mm:ss A') : '-'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-md-12 form-group details bg-grey">
                            <label className="col-form-label pt-0">Service Description</label>
                            <textarea disabled={true} className="form-control mb-2" rows="3" value={complaintData?.soDet?.soDescription}></textarea>
                        </div>
                    </div>
                    {
                        (customerData?.billingAddress) ?
                            <AddressPreview
                                data={{
                                    title: "billing_address",
                                    addressData: customerData?.billingAddress || {}
                                }}
                            />
                            :
                            <></>
                    }
                    <div className="col-12 pl-2 bg-light border mt-2">
                        <h5 className="text-primary">Products Details</h5>
                    </div>
                    <div className="col-md-12 pl-0 pr-0 card-box m-0 ">
                        {
                            productDetailsList && productDetailsList?.length > 0 &&
                            <div className="card p-1">
                                <DynamicTable
                                    row={productDetailsList}
                                    itemsPerPage={10}
                                    header={ProductDetailsColumns}
                                    hiddenColumns = {['productStatus','action']}
                                    handler={{
                                        handleCellRender: handleCellRender,
                                    }}
                                />
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SalesOrderDetails