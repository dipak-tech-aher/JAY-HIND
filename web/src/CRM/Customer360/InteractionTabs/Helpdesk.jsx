import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import { get, post } from "../../../common/util/restUtil";
import { properties } from "../../../properties";

import DynamicTable from "../../../common/table/DynamicTable";
import { HelpdeskListColumns, HiddenColumns } from "./TabColumns";
import { formatISODateDDMMMYY, formatISODateTime } from '../../../common/util/dateUtil'

function Helpdesk(props) {
  const [helpdesk, setHelpdesk] = useState([])
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState();
  const [currentPage, setCurrentPage] = useState(0);
  const customerDetails = props.data.customerDetails;
  // console.log('customerDetails---------', customerDetails)
  useEffect(() => {
    if (customerDetails && customerDetails?.customerId) {
      post(`${properties.HELPDESK_API}/search?limit=${perPage}&page=${currentPage}`, { profileId: customerDetails?.customerId, userCategoryValue: customerDetails?.customerNo })
        .then((resp) => {
          if (resp && resp.data) {
            setTotalCount(resp.data.count)
            setHelpdesk(resp.data.rows)
          } else {
            toast.error("Failed to fetch helpdesk - " + resp.status);
          }
        }).catch((error) => {
          console.error(error)
        })
        .finally();
    }
  }, [customerDetails.customerId, currentPage, perPage]);


  const handleCellRender = (cell, row) => {
    if (cell.column.Header === "Created Date") {
      return (<span>{formatISODateTime(cell.value)}</span>)
    }
    else {
      return (<span>{!cell.value ? '-' : cell.value}</span>)
    }
  }

  const handlePageSelect = (pageNo) => {
    setCurrentPage(pageNo)
  }

  return (
    <>

      {
        (helpdesk && helpdesk.length > 0) ?
          <DynamicTable
            row={helpdesk}
            header={HelpdeskListColumns}
            rowCount={totalCount}
            itemsPerPage={perPage}
            backendPaging={true}
            columnFilter={true}
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
          <p className='skel-widget-warning'>No Records Found!!!</p>
      }
    </>
  );
}

export default Helpdesk;
