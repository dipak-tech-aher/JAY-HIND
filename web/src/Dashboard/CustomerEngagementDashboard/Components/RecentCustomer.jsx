
import React, { useCallback, useEffect, useState, useContext, useRef } from "react";
import { RecentCustomersColumns } from "./Tables/TableColumns";
import DynamicTable from '../../../common/table/DynamicTable';

const RecentCustomer = (props) => {
    const [listPerPage, setListPerPage] = useState(10)
    const [currentPage, setCurrentPage] = useState(0)
    const { recentCustomers } = props?.data;
    const count = recentCustomers?.length;
    const handleCellRender = (cell, row) => {
        if (cell.column.id === "customer_photo") {
            return (<img src={row.original?.customer_photo} />)
        }
        else {
            return (<span>{cell.value || '-'}</span>)
        }
    }
    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }
    return (
        <div className="customer-skel-left">
            <div className="form-row m-0">
                <DynamicTable
                    listSearch={[]}
                    listKey='Recent Customers'
                    row={recentCustomers && recentCustomers.length > 0 ? recentCustomers : []}
                    rowCount={count ? count : 0}
                    header={RecentCustomersColumns}
                    fixedHeader={true}
                    itemsPerPage={listPerPage}
                    isScroll={true}
                    backendPaging={false}
                    isTableFirstRender={false}
                    hasExternalSearch={false}
                    backendCurrentPage={currentPage}
                    handler={{
                        handleCellRender: handleCellRender,
                        handlePageSelect: handlePageSelect,
                        handleItemPerPage: setListPerPage,
                        handleCurrentPage: setCurrentPage
                    }}
                />
                {/* <div className="col-md-12 cmmn-skeleton">
                    <span className="skel-header-title">Recent Customers</span>
                    <div className="skel-rec-customer">
                        <span><img src="./assets/images/profile.png" width="30" height="30" /></span>
                        <span className="skel-customer-name">
                            John
                        </span>
                        <span className="skel-customer-type yl-type">
                            Business
                        </span>
                        <span className="skel-customer-plan">
                            Plan A- bundle package
                        </span>
                        <span className="skel-customer-email">
                            john@testmail.com
                        </span>
                    </div>
                    <div className="skel-rec-customer">
                        <span><img src="./assets/images/profile.png" width="30" height="30" /></span>
                        <span className="skel-customer-name">
                            John
                        </span>
                        <span className="skel-customer-type gr-type">
                            Residential
                        </span>
                        <span className="skel-customer-plan">
                            Plan A- bundle package
                        </span>
                        <span className="skel-customer-email">
                            john@testmail.com
                        </span>
                    </div>
                    <div className="skel-rec-customer">
                        <span><img src="./assets/images/profile.png" width="30" height="30" /></span>
                        <span className="skel-customer-name">
                            John
                        </span>
                        <span className="skel-customer-type cmmn-type">
                            Business
                        </span>
                        <span className="skel-customer-plan">
                            Plan A- bundle package
                        </span>
                        <span className="skel-customer-email">
                            john@testmail.com
                        </span>
                    </div>
                    <div className="skel-rec-customer">
                        <span><img src="./assets/images/profile.png" width="30" height="30" /></span>
                        <span className="skel-customer-name">
                            John
                        </span>
                        <span className="skel-customer-type yl-type">
                            Business
                        </span>
                        <span className="skel-customer-plan">
                            Plan A- bundle package
                        </span>
                        <span className="skel-customer-email">
                            john@testmail.com
                        </span>
                    </div>
                    <div className="skel-rec-customer">
                        <span><img src="./assets/images/profile.png" width="30" height="30" /></span>
                        <span className="skel-customer-name">
                            John
                        </span>
                        <span className="skel-customer-type gr-type">
                            Residential
                        </span>
                        <span className="skel-customer-plan">
                            Plan A- bundle package
                        </span>
                        <span className="skel-customer-email">
                            john@testmail.com
                        </span>
                    </div>

                </div> */}
            </div>
        </div>
    )
}

export default RecentCustomer;