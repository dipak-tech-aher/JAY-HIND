import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { unstable_batchedUpdates } from 'react-dom';
import { get, post } from "../../../common/util/restUtil";
import { properties } from "../../../properties";
import moment from 'moment'
import DynamicTable from "../../../common/table/DynamicTable";
import { PaymentListColumns, HiddenColumns } from "./TabColumns";
import { formatISODateDDMMMYY, formatISODateTime } from '../../../common/util/dateUtil'

function Payment(props) {
  const [payment, setPayment] = useState([])
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState();
  const [currentPage, setCurrentPage] = useState(0);
  const customerDetails = props?.data?.selectedAccount ? props?.data?.selectedAccount : {};
  // console.log('customerDetails---------', props?.data)
  useEffect(() => {
    if (customerDetails && customerDetails?.customerUuid) {
      // console.log('customerDetails?.customerUuid', customerDetails?.customerUuid)
      const requestBody = {
        billRefNo: customerDetails?.customerNo,
        customerUuid: customerDetails?.customerUuid
      }
      post(`${properties.CONTRACT_API}/history?limit=${perPage}&page=${currentPage}`, requestBody).then((resp) => {
            if (Number(resp?.data?.count) > 0) {
                const { rows, count } = resp.data;
                unstable_batchedUpdates(() => {
                  setTotalCount(count);
                  setPayment(rows);
                })
            }
        }).catch((error) => {
          console.log(error)
      }) 
    }
  }, [props, currentPage, perPage]);


  const handleCellRender = (cell, row) => {
    if (cell?.column?.Header === "Created Date") {
      return (<span>{formatISODateTime(cell?.value)}</span>)
    } 
    else if (cell?.column?.Header === "Next Payment") {
      return (<span>{moment(new Date(cell?.value)).add(30, 'day').format('DD-MMM-YYYY')}</span>)
    }
    else {
      return (<span>{!cell?.value ? '-' : cell?.value}</span>)
    }
  }

  const handlePageSelect = (pageNo) => {
    setCurrentPage(pageNo)
  }

  return (
    <>
     {/* {console.log('payment', payment)} */}
      {
        (payment && payment?.length > 0) ?
          <DynamicTable
            row={payment}
            header={PaymentListColumns}
            rowCount={totalCount}
            itemsPerPage={perPage}
            backendPaging={true}
            backendCurrentPage={currentPage}
            hiddenColumns={HiddenColumns}
            handler={{
              handleCellRender: handleCellRender,
              handlePageSelect: handlePageSelect,
              handleItemPerPage: setPerPage,
              handleCurrentPage: setCurrentPage,
            }}
          />
          :
          <span className="msg-txt">No Payment Available</span>
      }
    </>
  );
}

export default Payment;
