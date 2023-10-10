import React, { useEffect, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom';
import moment from 'moment'
import { ProductDetailsColumns } from './EditOrder/EditOrderColumns';
import DynamicTable from '../../../common/table/DynamicTable';


const FullfillmentTable = (props) => {

    const complaintData = props.data.complaintData
    const billingContractDetails = props.data.billingContractDetails
    const setBillingContractDetails = props.handler.setBillingContractDetails
    const allowEditFulfilment = props.data.allowEditFulfilment 

    const [fulfilmentData,setFulfilmentData] = useState([])
    const [selectedProductId,setSelectedProductId] = useState('')

    useEffect(() => {
        const list = props?.data?.complaintData?.productDetails || []
        list.map((value) => {
            value.action = 'N'
            return value
        })
        setFulfilmentData(list)
    },[props?.data?.complaintData?.productDetails])

    const handleProductSelection = (e,data) => {
        setFulfilmentData(
            fulfilmentData.map((value) => {
                if (Number(value.identificationNo) === Number(data.identificationNo)) 
                {
                    value.action = e.target.checked === true ? 'Y' : 'N'
                }
                else
                {
                    value.action = 'N'
                }
                return value
            })
        )
        if(e.target.checked === true) 
        {
            setSelectedProductId(data.identificationNo)
        } 
        else {
            setSelectedProductId('')
        }
    }

    const handleStatusChange = (e,data) => {
        setFulfilmentData(
            fulfilmentData.map((value) => {
                if (Number(value.identificationNo) === Number(data.identificationNo)) 
                {
                    value.status = e.target.value
                }
                return value
            })
        )
        setBillingContractDetails(
            billingContractDetails.map((cont) => {
                if(Number(cont.identificationNo) === Number(data.identificationNo))
                {
                    cont.status = e.target.value
                    if(e.target.value === 'COMPLETED')
                    {
                        cont.actualStartDate = moment().format('YYYY-MM-DD')
                        cont.actualEndDate = moment( moment().add(Number(complaintData?.soDet?.contractDuration) - 1,'M').format('YYYY-MM-DD')).endOf('month')
                        cont.nextBillPeriod = cont?.upfrontPayment === 'Y' ? moment().format('YYYY-MM-DD') : moment(moment().add(3,'M').format('YYYY-MM-DD')).startOf('month');
                    } 
                    else 
                    {
                        cont.actualStartDate = null
                        cont.actualEndDate = null
                        cont.nextBillPeriod = null
                    }
                     
                }
                return cont
            })
        )
    }

    const handleCellRender = (cell,row) => {
        if(["Status"].includes(cell.column.Header))
        {
            return (
                <>
                    <select className="form-control" style={{width:"150px"}} value={row.original.status} disabled={Number(selectedProductId) === Number(row.original.identificationNo) ? false : true}
                        onChange={(e) => { handleStatusChange(e,row.original) }}>
                            <option value="COMPLETED">Completed</option>
                            <option value="PENDING">Pending</option>
                    </select>
                </>
                
            )
        }
        else if(["Action"].includes(cell.column.Header))
        {
            return (
                <div style={ allowEditFulfilment ? {} : {backgroundColor: "grey", width:"26px", paddingLeft:"5px", borderRadius:"2px"}} >
                    <div className="custom-control custom-checkbox" >
                        <input type="checkbox" id={`mandatory${row.original.identificationNo}`} 
                            className="custom-control-input "
                            value={cell.value} checked={cell.value === 'Y' ? true : false} 
                            onChange={(e) => { handleProductSelection(e, row.original) }} />
                        <label className="custom-control-label cursor-pointer" htmlFor={`mandatory${row.original.identificationNo}`}></label>
                    </div>
                </div>
            )
        }
        else if(["Delay Variance"].includes(cell.column.Header))
        {
            return (<span>{cell.value ? cell.value + " " + "%" : '-'}</span>)
        }
        return (<span>{cell.value}</span>)
    }

    return (
        <>
            <div className="col-12 mt-2 pb-2">
                {
                    fulfilmentData && fulfilmentData?.length > 0 &&
                        <div className="card">
                            <DynamicTable
                                row={fulfilmentData}
                                itemsPerPage={10}
                                hiddenColumns = {['productId','status']}
                                header={ProductDetailsColumns}
                                handler={{
                                    handleCellRender: handleCellRender,
                                }}
                            />
                        </div>
                    }
            </div>
        </>
    )
}

export default FullfillmentTable