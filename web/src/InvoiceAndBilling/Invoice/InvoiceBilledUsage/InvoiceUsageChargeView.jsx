import React, { useEffect, useState } from 'react'
import { NumberFormatBase } from 'react-number-format';
import DynamicTable from '../../../common/table/DynamicTable'
import { InvoiceUsageChargeColumns } from '../InvoiceSearchColumns'

const InvoiceUsageChargeView = (props) => {

    const { chargeType ,billingUsageList, showChargeTable, invoiceData } = props?.data
    const { setBillingUsageList , handleCellRender, setShowChargeTable} = props?.handler
    const initialValues = {
        fromDate: '',
        toDate: '',
        serviceNumber: ''
    }
    const [searchParams,setSearchParams] = useState(initialValues)
    const [exportBtn, setExportBtn] = useState(false)

    useEffect(() => {
        handleSubmit()
    },[chargeType])

    const handleInputChange = (e) => {
        const target = e.target;
        setSearchParams({
            ...searchParams,
            [target.id]: target.value
        })
    }

    const handleSubmit = () => {
        setTimeout(() => {
        let dummyData = [
            {
                date: '2021-11-20',
                time: '11:15 PM',
                serviceNumber: 	2238600,
                chargeName: 'Broadband charge',
                quantity: '120MB',
                rate: 0.10,
                charges: 10
            },
            {
                date: '2021-11-20',
                time: '11:15 PM',
                serviceNumber: 	2238600,
                chargeName: 'Broadband charge',
                quantity: '120MB',
                rate: 0.10,
                charges: 10
            }
        ]
        setBillingUsageList(dummyData)
        setShowChargeTable(true)
        },1000)
    }

    return (
        <>  
            <div className="col-md-12 card-box m-0 ">
                <div className="row">
                    <div className="col-md-4">
                        <div className="form-group">
                            <label htmlFor="serviceNumber" className="control-label col-form-label">Service Number</label>
                            <NumberFormatBase className="form-control" id="serviceNumber" placeholder="Please Enter Service Number" onChange={handleInputChange} value={searchParams.serviceNumber}/>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-group">
                            <label htmlFor="fromDate" className="control-label col-form-label">From Date</label>
                            <input type="date" className="form-control" id="fromDate" onChange={handleInputChange} value={searchParams.fromDate}/>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-group">
                            <label htmlFor="toDate" className="control-label col-form-label">To Date</label>
                            <input type="date" className="form-control" id="toDate" onChange={handleInputChange} value={searchParams.toDate}/>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <div className="pt-1 pb-1">
                            <div className="text-center">
                                <button className="btn waves-effect waves-light btn-primary" onClick={handleSubmit}><i className="fa fa-search mr-1"></i> Search</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {
                !!billingUsageList.length && showChargeTable &&
                    <DynamicTable
                        listKey={"Invoice List"}
                        row={billingUsageList}
                        itemsPerPage={10}
                        header={InvoiceUsageChargeColumns}
                        exportBtn={exportBtn}
                        handler={{
                            handleCellRender: handleCellRender,
                            handleExportButton: setExportBtn
                        }}
                    />
            }
        </>
    )
}

export default InvoiceUsageChargeView