import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import { get, post } from "../../../common/util/restUtil";
import { properties } from "../../../properties";

import DynamicTable from "../../../common/table/DynamicTable";
import { WorkOrdersListColumns, HiddenColumns } from "./TabColumns";
import { formatISODateDDMMMYY, formatISODateTime } from '../../../common/util/dateUtil'

function WorkOrders(props) {
  const [workOrders, setWorkOrders] = useState([])
  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState();

  const customerDetails = props?.data?.customerDetails;

  useEffect(() => {
    if (customerDetails && customerDetails?.customerUuid) {
      post(`${properties?.ORDER_API}/search?limit=${perPage}&page=${currentPage}`, { searchParams: { customerId: customerDetails?.customerId } })
        .then((resp) => {

          if (resp && resp?.data) {
            setTotalCount(resp?.data?.count)
            setWorkOrders(resp?.data?.row)
          } else {
            toast.error("Failed to fetch WorkOrders - " + resp?.status);
          }
        }).catch((error) => {
          console.log(error)
        }).finally();
    }
  }, [customerDetails?.customerUuid, currentPage, perPage]);

  const handleCellRender = (cell, row) => {
    if (cell?.column?.Header === "Created Date") {
      return (<span>{formatISODateTime(cell?.value)}</span>)
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
      {
        (workOrders && workOrders?.length > 0) ?
          <DynamicTable
            row={workOrders}
            rowCount={totalCount}
            itemsPerPage={perPage}
            backendPaging={true}
            backendCurrentPage={currentPage}
            header={WorkOrdersListColumns}
            hiddenColumns={HiddenColumns}
            handler={{
              handleCellRender: handleCellRender,
              handlePageSelect: handlePageSelect,
              handleItemPerPage: setPerPage,
              handleCurrentPage: setCurrentPage,
            }}
          />
          :
          <span className="msg-txt">No WorkOrders Available</span>
      }
    </>
  );
}

export default WorkOrders;
