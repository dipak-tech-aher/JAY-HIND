
import React, { useEffect, useRef, useState, useContext } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';

import DynamicTable from '../../common/table/DynamicTable';
import { properties } from '../../properties';
import { formatISODateDDMMMYY } from "../../common/util/dateUtil";
import { post, get } from '../../common/util/restUtil';
import { formFilterObject } from '../../common/util/util';
import { FollowInteractionColumns } from './followupColumns';
import { AppContext } from '../../AppContext';

const FollowupInteractionDtl = (props) => {
    const { frequency } = props.data.getInteractionDetails;
    const { auth } = useContext(AppContext)

    const initialValues = {
        frequency: frequency,
        entity: "",
        reportType: "Follow Interaction"
    }
    const [interactionsearchInputs, setInteractionSearchInputs] = useState(initialValues);
    //  const [displayForm, setDisplayForm] = useState(true);
    const [interactionlistSearch, setInteractionListSearch] = useState([]);
    const [interactionsearchData, setInteractionSearchData] = useState([]);

    const isFirstRender = useRef(true);
    const [interactiontotalCount, setInteractionTotalCount] = useState(0);
    const [interactionperPage, setInteractionPerPage] = useState(10);
    const [interactioncurrentPage, setInteractionCurrentPage] = useState(0);
    const [interactionfilters, setInteractionFilters] = useState([]);
    const [interactionexportBtn, setInteractionExportBtn] = useState(true)
    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);
    const [isEntityIsOu,setIsEntityIsOu] = useState({
        entityType:""
    })

    useEffect(() => {
        get(properties.ENTITY_LOOkUP_API)
            .then((response) => {
                if (response.data) {
                    let isEntityIsOu = false
                    for (let e of response.data) {
                        if (e.unitId === auth.currDeptId) {
                            if (e.unitType === 'OU') {
                                isEntityIsOu = true
                            }
                            else {
                                isEntityIsOu = false
                            }
                        }
                    }
                    if (isEntityIsOu) {
                        unstable_batchedUpdates(()=>{
                            setInteractionSearchInputs({
                                ...interactionsearchInputs,
                                entity: ""
    
                            });
                            setIsEntityIsOu({...isEntityIsOu,entityType:"OU"})
                        })
                       
                    }
                    else {
                        unstable_batchedUpdates(()=>{
                            setInteractionSearchInputs({
                                ...interactionsearchInputs,
                                entity: auth && auth.currDeptDesc
    
                            });
                            setIsEntityIsOu({...isEntityIsOu,entityType:"DEPT"})
                        })
                       
                    }

                }
            }).catch(error => console.log(error));


    }, [])

    useEffect(() => {
        if (interactionsearchInputs.entity !== "" && interactionsearchInputs.entity !== undefined && isEntityIsOu.entityType === "DEPT" ) {
            // getFollowDetails();
            isTableFirstRender.current = true;
            unstable_batchedUpdates(() => {
                setInteractionFilters([])
                setInteractionCurrentPage((currentPage) => {
                    if (currentPage === 0) {
                        return '0'
                    }
                    return 0
                });
            })
        }
        else if(isEntityIsOu.entityType === "OU") {
               // getFollowDetails();
               isTableFirstRender.current = true;
               unstable_batchedUpdates(() => {
                   setInteractionFilters([])
                   setInteractionCurrentPage((currentPage) => {
                       if (currentPage === 0) {
                           return '0'
                       }
                       return 0
                   });
               })
        }
    }, [interactionsearchInputs])

    useEffect(() => {
        if (!isFirstRender.current) {
            getFollowDetails();
        }
        else {
            isFirstRender.current = false;
        }
    }, [interactioncurrentPage, interactionperPage, frequency])

    const getFollowDetails = () => {
        
        const requestBody = {
            ...interactionsearchInputs,
            frequency: frequency,
            filters: formFilterObject(interactionfilters)
        }
        setInteractionListSearch(requestBody);
        post(`${properties.REPORTS_API}/followUpInteraction?limit=${interactionperPage}&page=${interactioncurrentPage}`, requestBody)
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

    // const handleInputChange = (e) => {
    //     const target = e.target;
    //     setInteractionSearchInputs({
    //         ...interactionsearchInputs,
    //         [target.id]: target.value
    //     })
    // }

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
                (interactionsearchData && interactionsearchData.length > 0) ?
                    <div className="card-body" id="datatable">
                        <div style={{}}>
                            <DynamicTable
                                listSearch={interactionlistSearch}
                                listKey={"FollowUp Interaction"}
                                row={interactionsearchData}
                                rowCount={interactiontotalCount}
                                header={FollowInteractionColumns}
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
                    :
                    <span className="msg-txt">No Record Available</span>
            }

        </>
    )

}

export default FollowupInteractionDtl;