import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import { get, post } from "../../../common/util/restUtil";
import { properties } from "../../../properties";

import DynamicTable from "../../../common/table/DynamicTable";
import { InteractionListColumns, HiddenColumns } from "./TabColumns";
import { formatISODateDDMMMYY, formatISODateTime } from '../../../common/util/dateUtil'

function Interactions(props) {
    const [interactions, setInteractions] = useState([])
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalCount, setTotalCount] = useState();

    const customerDetails = props?.data?.customerDetails
    useEffect(() => {

        if (customerDetails && customerDetails?.customerUuid) {
            post(`${properties?.INTERACTION_API}/search?limit=${perPage}&page=${currentPage}`, { searchParams: { customerUuid: customerDetails?.customerUuid } })
                .then((resp) => {
                    // console.log('--response-----------', resp?.data)
                    if (resp && resp?.data) {
                        setTotalCount(resp?.data?.count)
                        setInteractions(resp?.data?.rows)
                    } else {
                        toast.error("Failed to fetch complaints - " + resp?.status);
                    }
                }).catch((error) => {
                    console.error(error)
                }).finally();
        }
    }, [customerDetails?.customerUuid, currentPage, perPage]);

    const handleCellRender = (cell, row) => {
        // if (cell.column.Header === "Incident ID") {
        //     return (<span className="text-secondary cursor-pointer">{cell.value}</span>)
        // } else 

        if (cell?.column?.Header === "Created Date") {
            return (<span>{formatISODateTime(cell?.value)}</span>)
        }
        else if (cell?.column?.Header === "Created By") {
            return (<span>{row?.original?.createdBy?.firstName + " " + row?.original?.createdBy?.lastName}</span>)
        }
        /*else if (cell?.column?.Header === "Action") {
            if (row?.original?.woType === "FAULT") {
                return (<button type="button"
                    className="btn btn-outline-primary waves-effect waves-light btn-sm"
                    onClick={() => {

                    }}
                >
                    Workflow History
                </button>
                )
            }
            else {
                return (<span></span>)
            }
        }*/
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
                (interactions && interactions?.length > 0) ?
                    <DynamicTable
                        row={interactions}
                        rowCount={totalCount}
                        itemsPerPage={perPage}
                        backendPaging={true}
                        columnFilter={true}
                        backendCurrentPage={currentPage}
                        hiddenColumns={HiddenColumns}
                        header={InteractionListColumns}
                        handler={{
                            handleCellRender: handleCellRender,
                            handlePageSelect: handlePageSelect,
                            handleItemPerPage: setPerPage,
                            handleCurrentPage: setCurrentPage,
                        }}
                    />
                    :
                    <span className="msg-txt">No Interactions Available</span>
            }
        </>
    );
}

export default Interactions;
