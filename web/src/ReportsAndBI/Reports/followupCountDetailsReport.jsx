import React, { useEffect, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';

import DynamicTable from '../../common/table/DynamicTable';
import { properties } from '../../properties';
import { formatISODateDDMMMYY } from "../../common/util/dateUtil";
import { post } from '../../common/util/restUtil';
import { formFilterObject } from '../../common/util/util';
import { FollowupCountInteractionColumns } from './followupCountColumns';

const FollowupCountDetailsReport = (props) => {
    const { interactionsearchInputs, interactionsearchData, interactiontotalCount } = props.data;
    const { setInteractionSearchData, setInteractionTotalCount } = props.handler
    const  entity = props.data.ticketEntity && props.data?.ticketEntity.entity
    //  const [displayForm, setDisplayForm] = useState(true);
    const [interactionlistSearch, setInteractionListSearch] = useState([]);
    const isFirstRender = useRef(true);
    const [interactionperPage, setInteractionPerPage] = useState(10);
    const [interactioncurrentPage, setInteractionCurrentPage] = useState(0);
    const [interactionfilters, setInteractionFilters] = useState([]);
    const [interactionexportBtn, setInteractionExportBtn] = useState(true)
    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);

    // useEffect(() => {
    //     isTableFirstRender.current = true;
    //     unstable_batchedUpdates(() => {
    //         setInteractionFilters([])
    //         setInteractionCurrentPage((currentPage) => {
    //             if (currentPage === 0) {
    //                 return '0'
    //             }
    //             return 0
    //         });
    //     })
    // }, [])

    useEffect(() => {
        if (!isFirstRender.current) {
            if (entity) {
                getFollowDetails();
            }
        }
        else {
            isFirstRender.current = false;
        }
    }, [interactioncurrentPage, interactionperPage, entity])

    const getFollowDetails = () => {
        
        const requestBody = {
            ...interactionsearchInputs,
            entity: entity,
            filters: formFilterObject(interactionfilters)
        }
        setInteractionListSearch(requestBody);
        post(`${properties.REPORTS_API}/followupCountDetails?limit=${interactionperPage}&page=${interactioncurrentPage}`, requestBody)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        const { count, rows } = resp.data;
                        unstable_batchedUpdates(() => {
                            setInteractionTotalCount(count)
                            setInteractionSearchData(rows);
                        })
                        if (count < 1) {
                            toast.error("No Records Found")
                        }
                    } else {
                        setInteractionSearchData([])
                        toast.error("Records Not Found")
                    }
                } else {
                    setInteractionSearchData([])
                    toast.error("Records Not Found")
                }
            }).catch(error => console.log(error)).finally(() => {
                
                isTableFirstRender.current = false;
            });
    }
    const handlePageSelect = (pageNo) => {
        setInteractionCurrentPage(pageNo)
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Created On") {
            return (
                <span>{cell.value ? formatISODateDDMMMYY(cell.value) : '-'}</span>
            )
        }
        else
            return (<span>{cell.value}</span>)
    }

    return (

        <>
            {
                (interactionsearchData && interactionsearchData.length > 0) &&
                <div className="card-body" id="datatable">
                    <div style={{}}>
                        <DynamicTable
                            listSearch={interactionlistSearch}
                            listKey={"FollowUp Interaction"}
                            row={interactionsearchData}
                            rowCount={interactiontotalCount}
                            header={FollowupCountInteractionColumns}
                            itemsPerPage={interactionperPage}
                            backendPaging={true}
                            backendCurrentPage={interactioncurrentPage}
                            isTableFirstRender={isTableFirstRender}
                            hasExternalSearch={hasExternalSearch}
                            exportBtn={interactionexportBtn}
                            url={properties.REPORTS_API + '/followUpInteraction'}
                            method={'POST'}
                            handler={{
                                handleCellRender: handleCellRender,
                                handlePageSelect: handlePageSelect,
                                handleItemPerPage: setInteractionPerPage,
                                handleCurrentPage: setInteractionCurrentPage,
                                handleFilters: setInteractionFilters,
                                handleExportButton: setInteractionExportBtn
                            }}
                        />
                    </div>
                </div>
            }

        </>
    )
}
export default FollowupCountDetailsReport