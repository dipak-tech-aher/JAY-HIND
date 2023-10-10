import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useParams } from "react-router";
import { toast } from "react-toastify";

import InlineSpinner from '../../common/inline-spinner';
import { get, post } from "../../common/util/restUtil";
import { properties } from "../../properties";

import DynamicTable from "../../common/table/DynamicTable";
import { ComplaintListColumns, ComplaintHiddenColumns } from "./InteractionColumns";
import { formatISODateDDMMMYY, formatISODateTime } from '../../common/util/dateUtil'

function InteractionList(props) {

  const leftNavCounts = props.handler.leftNavCounts
  const setLeftNavCounts = props.handler.setLeftNavCounts
  const refreshList = props.data.refreshList
  const refreshComplaint = props.data.refreshComplaint
  const isScroll = props?.data?.isScroll
  const customerDetails = props.data.customerDetails
  const selectedAccount = props.data.selectedAccount
  const activeService = props.data.activeService

  let value = ""

  const history = useHistory();
  const [workFlowData, setWorkFlowData] = useState()
  const [isOpen, setIsOpen] = useState(false)
  const [complaints, setComplaints] = useState([])
  const [inlineSpinnerData, setInlineSpinnerData] = useState({ state: false, message: '' })

  useEffect(() => {
    console.log('--------here---------',customerDetails,'--selectedAccount',selectedAccount)
    if (customerDetails && customerDetails.customerId && selectedAccount && selectedAccount.accountNo
      && activeService) {
      setInlineSpinnerData({ state: true, message: 'Loading complaints...please wait...' })
      let limit=10
      let page=0
      post(`${properties.INTERACTION_API}/search?limit=${limit}&page=${page}`,{searchParams:{customerUuid:selectedAccount?.customerUuid}})
        .then((resp) => {
          console.log('--response-----------',resp?.data)
          if (resp && resp.data) {
            let complaint = resp?.data.filter((item) => item.intxnType === "REQCOMP")
            setComplaints(complaint)
            setLeftNavCounts({ ...leftNavCounts, cmpCount: complaint.length })
          } else {
            toast.error("Failed to fetch complaints - " + resp.status);
          }
          setInlineSpinnerData({ state: false, message: '' })
        }).catch(error => {
          console.error(error);
      }).finally();
    }
  }, [customerDetails, refreshComplaint, selectedAccount, activeService]);


  const handleLinkClick = (e, rowData) => {
    const { intxnId, Connection, accountDetails, srType, woType } = rowData;
    const { accountId } = accountDetails;
    const { description } = srType;
    history.push(`${process.env.REACT_APP_BASE}/edit-${description.toLowerCase()}`, {
      data: {
        customerId: customerDetails.customerId,
        serviceId: Connection.connectionId,
        interactionId: intxnId,
        accountId,
        type: description.toLowerCase(),
        woType,
        isAdjustmentOrRefund: false
      }
    })
  }

  const handleCellRender = (cell, row) => {
    if (cell.column.Header === "Incident ID") {
      return (<span className="text-secondary cursor-pointer" onClick={(e) => handleLinkClick(e, row.original)}>{cell.value}</span>)
    } else if (cell.column.Header === "Created Date") {
      return (<span>{formatISODateTime(cell.value)}</span>)
    }
    else if (cell.column.Header === "Created By") {
      return (<span>{row.original.userId.firstName + " " + row.original.userId.lastName}</span>)
    }
    else if (cell.column.Header === "Action") {
      if (row.original.woType === "FAULT") {
        return (<button type="button"
          className="btn btn-outline-primary waves-effect waves-light btn-sm"
          onClick={() => {
            setIsOpen(true);
            setWorkFlowData(row.original);
          }}
        >
          Workflow History
        </button>
        )
      }
      else {
        return (<span></span>)
      }
    }
    else {
      return (<span>{cell.value}</span>)
    }
  }

  return (
    <>
      {
        (complaints && complaints.length > 0) ?
          <DynamicTable
            isScroll={isScroll}
            row={complaints}
            header={ComplaintListColumns}
            columnFilter={true}
            hiddenColumns={ComplaintHiddenColumns}
            itemsPerPage={10}
            handler={{
              handleCellRender: handleCellRender,
              handleLinkClick: handleLinkClick
            }}
          />
          :
          <span className="msg-txt">No Interactions Available</span>
      }
    </>
  );
}

export default InteractionList;
