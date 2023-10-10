import React, { useEffect, useRef, useState, useContext } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';

import DynamicTable from '../../common/table/DynamicTable';
import { properties } from '../../properties';
import { formatISODateDDMMMYY } from "../../common/util/dateUtil";
import { post, get } from '../../common/util/restUtil';
import { formFilterObject } from '../../common/util/util';
import { FollowupColumns } from './followupColumns';
import FollowupInteractionDtl from './FollowupInteractionDtl';
import { AppContext } from '../../AppContext';

const FollowupReport = (props) => {

    const { auth } = useContext(AppContext)

    const initialValues = {
        frequency: "",
        entity: "",
        reportType: "FollowUp"
    }

    const [searchInputs, setSearchInputs] = useState(initialValues);
    // const [displayForm, setDisplayForm] = useState(true);
    const [listSearch, setListSearch] = useState([]);
    const [searchData, setSearchData] = useState([]);

    const isFirstRender = useRef(true);
    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(true)
    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);
    const [getInteractionDetails, setGetInteractionDetails] = useState(initialValues)
    const [isEntityIsOu,setIsEntityIsOu] = useState({
        entityType:""
    })

    useEffect(()=>{
        get(properties.ENTITY_LOOkUP_API)
            .then((response) => {
                if (response.data) {
                    let isEntity = false
                    for (let e of response.data) {
                        if (e.unitId === auth.currDeptId) {
                            if (e.unitType === 'OU') {
                                isEntity= true
                            }
                            else {
                                isEntity= false
                              
                            }
                        }
                    }
                    if (isEntity){
                        unstable_batchedUpdates(()=>{
                            setIsEntityIsOu({...isEntityIsOu,entityType:"OU"})
                            setSearchInputs({
                                ...searchInputs,
                                entity: ""
                            });
                        })
                    }
                    else{
                        unstable_batchedUpdates(()=>{
                            setSearchInputs({
                                ...searchInputs,
                                entity: auth && auth.currDeptId
    
                            });
                            setIsEntityIsOu({...isEntityIsOu,entityType:"DEPT"})
                        });
                      
                    }  
                }
            }).catch(error => console.log(error));
           
    },[])

    useEffect(()=>{
        if (searchInputs.entityType!=="" && isEntityIsOu.entityType!== undefined && isEntityIsOu.entityType!== ""){
            isTableFirstRender.current = true;
            getFollowDetails();
        } 
    },[isEntityIsOu])

    useEffect(() => {
        if (!isFirstRender.current) {
            getFollowDetails();
        }
        else {
            isFirstRender.current = false;
        }
    }, [currentPage, perPage])


    const getFollowDetails = () => {
        
        const requestBody = {
            "searchType": "ADV_SEARCH",
            ...searchInputs,
            filters: formFilterObject(filters)
        }
        setListSearch(requestBody);
        post(`${properties.REPORTS_API}/followUp?limit=${perPage}&page=${currentPage}`, searchInputs)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        const { count, rows } = resp.data;
                        const { message } = resp
                       // toast.success(message);
                    
                        unstable_batchedUpdates(() => {
                            setTotalCount(count)
                            if(isEntityIsOu.entityType === "OU"){
                                let frequencyData=[]
                                for (let e of rows){
                                    let frequencyCount=0
                                    for(let d of rows){ 
                                        if(e.follow_up_frequency === d.follow_up_frequency){
                                         frequencyCount+=Number(d.ticket_count)
                                        }
                                    }
                                    frequencyData.push({follow_up_frequency:e.follow_up_frequency,ticket_count:frequencyCount})
                                }
                                frequencyData= [...new Map(frequencyData.map(item => [item["follow_up_frequency"], item])).values()]
                                setSearchData(frequencyData);
                            }
                            else{
                                setSearchData(rows);
                            }
                        })
                        if (count < 1) {
                            toast.error("No Records Found")
                        }
                    } else {
                        setSearchData([])
                        toast.error("Records Not Found")
                    }
                } else {
                    setSearchData([])
                    toast.error("Records Not Found")
                }
            }).catch(error => console.log(error)).finally(() => {
                
                isTableFirstRender.current = false;
            });
    }
    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    // const handleInputChange = (e) => {
    //     const target = e.target;
    //     setSearchInputs({
    //         ...searchInputs,
    //         [target.id]: target.value
    //     })
    // }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Created On") {
            return (
                <span>{cell.value ? formatISODateDDMMMYY(cell.value) : '-'}</span>
            )
        }
        else if (cell.column.Header === "Followup Frequency") {
            return (
                <span className="text-secondary" style={{ cursor: 'pointer' }} onClick={() => handleOnEdit(row)}>{cell.value}</span>
            )
        }
        else
            return (<span>{cell.value}</span>)
    }

    const handleOnEdit = (row) => {
        setGetInteractionDetails(
            {
                ...getInteractionDetails,
                frequency: row.original.follow_up_frequency
            }
        )
    }

    return (

        <div className="card pt-1">
            <div className="container-fluid">
                <div className="form-row pb-2">
                    <div className="col-12">
                        <section className="triangle">
                            <div className="col-12 row">
                                <div className="col-12"><h4 className="pl-3">FollowUp Report</h4></div>
                            </div>
                        </section>
                    </div>
                </div>
                {
                    // !!searchData.length &&
                    <div className="row mt-2">
                        <div className="col-lg-12">
                            {
                                (searchData && searchData.length > 0) ?
                                    <div className="card">
                                        <div className="card-body" id="datatable">
                                            <div style={{}}>
                                                <DynamicTable
                                                    listSearch={listSearch}
                                                    listKey={"FollowUp Report"}
                                                    row={searchData}
                                                    rowCount={totalCount}
                                                    header={FollowupColumns}
                                                    itemsPerPage={perPage}
                                                    backendPaging={true}
                                                    backendCurrentPage={currentPage}
                                                    isTableFirstRender={isTableFirstRender}
                                                    hasExternalSearch={hasExternalSearch}
                                                    exportBtn={exportBtn}
                                                    url={properties.REPORTS_API + '/followUp'}
                                                    method={'POST'}
                                                    handler={{
                                                        handleCellRender: handleCellRender,
                                                        handlePageSelect: handlePageSelect,
                                                        handleItemPerPage: setPerPage,
                                                        handleCurrentPage: setCurrentPage,
                                                        handleFilters: setFilters,
                                                        handleExportButton: setExportBtn
                                                    }}
                                                />
                                            </div>
                                        </div>
                                      {getInteractionDetails.frequency!==""&&getInteractionDetails.frequency!==undefined &&  <>
                                        <div className="form-row m-2">
                                            <div className="col-12 pl-2 bg-light border">
                                                <h5 className="text-primary">Interaction Details</h5>
                                            </div>
                                        </div>
                                        <FollowupInteractionDtl
                                            data={{
                                                getInteractionDetails
                                            }}
                                        ></FollowupInteractionDtl>
                                        </>}
                                    </div>
                                    :
                                    <span className="msg-txt">No Record Available</span>
                            }
                        </div>
                    </div>
                }
            </div>
        </div>
    )
}

export default FollowupReport;