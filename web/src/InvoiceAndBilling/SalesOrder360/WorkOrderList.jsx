import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

import { properties } from '../../properties'
import { get } from '../../common/util/restUtil'
import { useHistory } from "react-router-dom";
import { formatISODateTime } from '../../common/util/dateUtil'
import DynamicTable from '../../common/table/DynamicTable'

const WorkOrderList = (props) => {

    const [workOrderList,setWorkOrderList] = useState([])
    const leftNavCounts = props.handler.leftNavCounts
    const setLeftNavCounts = props.handler.setLeftNavCounts
    const customerDetails = props.data.customerDetails
    const history = useHistory();

    useEffect(() => {
        
        get(properties.SERVICE_REQUEST_LIST_BY_CUSTOMER + '/' + customerDetails.customerId +
        '?intxn-type=REQWO&account-id=' + customerDetails.accountId + '&service-id=' + null + '&so-id=' + customerDetails.soId)
        .then((resp) => {
          if (resp && resp.data) {
            let serviceRequest = resp.data.filter((item) => item.intxnType === "REQWO")
            setWorkOrderList(serviceRequest)
            setLeftNavCounts({ ...leftNavCounts, srCount: serviceRequest.length })
          } else {
            toast.error("Failed to fetch Service Requests - " + resp.status);
          }
        })
        .catch((error) => {
            console.error(error)
        })
        .finally()
    },[])

    const handleLinkClick = (e, rowData) => {
        const { intxnId, Connection, accountDetails, srType} = rowData;
        const { accountId } = accountDetails;
        //const isAdjustmentOrRefund = ['Adjustment', 'Refund'].includes(workOrderType.description) ? true : ['Fault'].includes(workOrderType.description) && intxnType === 'REQSR' ? true : false;
        history.push(`${process.env.REACT_APP_BASE}/edit-work-order`, {
          data: {
            customerId: customerDetails.customerId,
            serviceId: Connection?.connectionId || null,
            interactionId: intxnId,
            accountId,
            type: 'order',
            woType: rowData.woType,
            isAdjustmentOrRefund: false,
            row: rowData
          }
        })
      }
    
      const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Work Order Number") {
          return (<span className="text-secondary cursor-pointer" onClick={(e) => handleLinkClick(e, row.original)}>{cell.value}</span>)
        } else if (cell.column.Header === "Created Date") {
          return (<span>{formatISODateTime(cell.value)}</span>)
        }
        else if (cell.column.Header === "Created By") {
          return (<span>{row.original.userId.firstName + " " + row.original.userId.lastName}</span>)
        }
        else {
          return (<span>{cell.value}</span>)
        }
      }

    return(
        <>
            {
                (workOrderList && workOrderList.length > 0) ?
                <DynamicTable
                    row={workOrderList}
                    header={WorkOrderColumns}
                    itemsPerPage={10}
                    handler={{
                    handleCellRender: handleCellRender,
                    handleLinkClick: handleLinkClick
                    }}
                />
                :
                <span className="msg-txt">No Work Orders Available</span>
            }
        </>
    )
}

export default WorkOrderList

export const WorkOrderColumns = [
  {
      Header : "Work Order Number",
      accessor : "intxnId",
      disableFilters : true
  },
  {
      Header : "Type",
      accessor : "srType.description",
      disableFilters : true
  },
  {
      Header : "Work Order Type",
      accessor : "workOrderType.description",
      disableFilters : true
  },
  {
      Header : "Created Date",
      accessor : "createdAt",
      disableFilters : true
  },
  {
      Header : "Created By",
      accessor : "userId.userId",
      disableFilters : true
  },
  {
      Header : "Current Status",
      accessor : "currStatusDesc.description",
      disableFilters : true
  }
]