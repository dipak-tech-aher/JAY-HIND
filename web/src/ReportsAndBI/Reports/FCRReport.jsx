import React, { useEffect, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';

import DynamicTable from '../../common/table/DynamicTable';
import { properties } from '../../properties';
import { formatISODateDDMMMYY } from "../../common/util/dateUtil";
import { post, get } from '../../common/util/restUtil';
import { formFilterObject } from '../../common/util/util';
import { FCRColumns, FCRHiddenColumns } from './FCRColumns';

const FCRRport =(props)=>{

    const initialValues = {
        interactionID: "",
        interactionType: "",
        problemType: "",
        serviceType:"",
        compliance:"",
        role:"",
        dateFrom: "",
        dateTo: "",
        reportType: "FCR"
    }

    const [searchInputs, setSearchInputs] = useState(initialValues);
    const [displayForm, setDisplayForm] = useState(true);
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

    const [interactionTypeLookup, setInteractionTypeLookup] = useState([]);
    const [problemTypeLookup, setProblemTypeLookup] = useState([]);
    const [serviceTypeLookup, setServiceTypeLookup] = useState([]);
    const [roleLookup, setRoleLookup] = useState([])

    useEffect(() => {
        post(properties.BUSINESS_ENTITY_API, ['INTXN_TYPE','PROBLEM_CODE','PROD_TYPE'
        ])
            .then((response) => {
                if (response.data) {
                    let lookupData = response.data;
                    setInteractionTypeLookup(lookupData['INTXN_TYPE']);
                    setProblemTypeLookup(lookupData['PROBLEM_CODE']);
                    setServiceTypeLookup(lookupData['PROD_TYPE']);
                }
            }).catch(error => console.log(error))
            get(properties.ROLE_API)
            .then((response)=>{
                if(response.data){
                    let role=[]
                    for(let e of response.data){
                        if(e.roleName!== null && e.roleName!== undefined){
                            role.push(e)
                        }
                    }
                    setRoleLookup(role)
                }
            }).catch(error => console.log(error))
    }, [])

    useEffect(() => {
        if (!isFirstRender.current) {
            getLoginDetails();
        }
        else {
            isFirstRender.current = false;
        }
    }, [currentPage, perPage])

    const getLoginDetails = () => {
        
        const requestBody = {
            "searchType": "ADV_SEARCH",
            ...searchInputs,
            filters: formFilterObject(filters)
        }
        setListSearch(requestBody);
        post(`${properties.REPORTS_API}/fcrSearch?limit=${perPage}&page=${currentPage}`, searchInputs)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        const { count, rows } = resp.data;
                        unstable_batchedUpdates(() => {
                            setTotalCount(count)
                            setSearchData(rows);
                        })
                        if (count<1){
                            toast.error("No Records Found")}
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

    const handleInputChange = (e) => {
        const target = e.target;
        setSearchInputs({
            ...searchInputs,
            [target.id]: target.value
        })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        isTableFirstRender.current = true;
        unstable_batchedUpdates(() => {
            setFilters([])
            setCurrentPage((currentPage) => {
                if (currentPage === 0) {
                    return '0'
                }
                return 0
            });
        })
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

    const handleOnCellActionsOrLink = (event, rowData, header) => {

    }

    return (
        <div className="card pt-1">
            <div className="container-fluid">
                <div className="form-row pb-2">
                    <div className="col-12">
                        <section className="triangle">
                            <div className="col-12 row">
                                <div className="col-12"><h4 className="pl-3">FCR Report</h4></div>
                            </div>
                        </section>
                    </div>
                </div>
                <div className="border p-2">
                    <div className="col-12 p-2">
                        <div className="bg-light border pr-0 p-0 row"><div className="col"><h5 className="text-primary pl-2 pt-1">Search</h5></div>
                            <div className="col pt-1">
                                <div className="d-flex justify-content-end">
                                    <h6 className="cursor-pointer" style={{ color: "#142cb1", float: "right" }} onClick={() => { setDisplayForm(!displayForm) }}>{displayForm ? "Hide Search" : "Show Search"}</h6>
                                </div>
                            </div>
                        </div>
                        <div id="searchBlock" className="modal-body p-2 d-block">
                            {
                                displayForm && (
                                    <form onSubmit={handleSubmit}>
                                        <div className="search-result-box p-0">
                                            <div className="autoheight p-1">
                                                <section>
                                                    <div className="form-row pb-2 col-12">
                                                        <div className="col-3">
                                                            <div className="form-group">
                                                                <label htmlFor="interactionID" className="control-label">Interaction ID</label>
                                                                <input
                                                                    value={searchInputs.interactionID}
                                                                    onKeyPress={(e) => {
                                                                        if (e.key === "Enter") {
                                                                            handleSubmit(e)
                                                                        };
                                                                    }}
                                                                    onChange={handleInputChange}
                                                                    type="text"
                                                                    className="form-control"
                                                                    id="interactionID"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-3">
                                                            <div className="form-group">
                                                                <label htmlFor="interactionType" className="control-label">Interaction Type</label>
                                                                <select className="form-control" id="interactionType" value={searchInputs.interactionType} onChange={handleInputChange}>
                                                                    <option value="">Select Interaction Type</option>
                                                                    {
                                                                        interactionTypeLookup && interactionTypeLookup.map((e) => (
                                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                                        ))
                                                                    }
                                                                </select>
                                                            </div>
                                                        </div>
                                                      
                                                        <div className="col-3">
                                                            <div className="form-group">
                                                                <label htmlFor="problemType" className="control-label">Problem Type</label>
                                                                <select className="form-control" id="problemType" value={searchInputs.problemType} onChange={handleInputChange}>
                                                                    <option value="">Select Problem Type</option>
                                                                    {
                                                                        problemTypeLookup && problemTypeLookup.map((e) => (
                                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                                        ))
                                                                    }
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-3">
                                                            <div className="form-group">
                                                                <label htmlFor="serviceType" className="control-label">Service Type</label>
                                                                <select className="form-control" id="serviceType" value={searchInputs.serviceType} onChange={handleInputChange}>
                                                                    <option value="">Select Service Type</option>
                                                                    {
                                                                        serviceTypeLookup && serviceTypeLookup.map((e) => (
                                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                                        ))
                                                                    }
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-3">
                                                            <div className="form-group">
                                                                <label htmlFor="role" className="control-label">Role</label>
                                                                <select className="form-control" id="role" value={searchInputs.role} onChange={handleInputChange}>
                                                                    <option value="">Select Role</option>
                                                                    {
                                                                        roleLookup && roleLookup.map((e) => (
                                                                            <option key={e.roleId} value={e.roleDesc}>{e.roleDesc}</option>
                                                                        ))
                                                                    }
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-3">
                                                            <div className="form-group">
                                                                <label htmlFor="compliance" className="control-label">Compliance Type</label>
                                                                <select className="form-control" id="compliance" value={searchInputs.Compliance} onChange={handleInputChange}>
                                                                <option value="">Select Compliance Type</option>
                                                                    <option key="Compliance" value="Compliance">Compliance</option>
                                                                    <option key="Non-Compliance" value="Non-Compliance">Non-Compliance</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-3">
                                                            <div className="form-group">
                                                                <label htmlFor="dateFrom" className="control-label">Date From</label>
                                                                <input type="date" id="dateFrom" className="form-control"
                                                                    value={searchInputs.dateFrom}
                                                                    onKeyPress={(e) => {
                                                                        if (e.key === "Enter") {
                                                                            handleSubmit(e)
                                                                        };
                                                                    }}
                                                                    onChange={handleInputChange}
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-3">
                                                            <div className="form-group">
                                                                <label htmlFor="dateTo" className="control-label">Date To</label>
                                                                <input type="date" id="dateTo" className="form-control"
                                                                    value={searchInputs.dateTo}
                                                                    onKeyPress={(e) => {
                                                                        if (e.key === "Enter") {
                                                                            handleSubmit(e)
                                                                        };
                                                                    }}
                                                                    onChange={handleInputChange}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12 text-center mt-2">
                                                        <button type="submit" className="btn btn-primary waves-effect waves- mr-2" >Search</button>
                                                        <button type="button" className="btn btn-secondary waves-effect waves-light" onClick={() => { setSearchInputs(initialValues); setSearchData([]); }}>Clear</button>
                                                    </div>
                                                </section>
                                            </div>
                                        </div>
                                    </form>
                                )
                            }
                        </div>
                    </div>
                </div>
                {
                    // !!searchData.length &&
                    <div className="row mt-2">
                        <div className="col-lg-12">
                            {
                                (searchData && searchData.length>0) ?
                                <div className="card">
                                    <div className="card-body" id="datatable">
                                        <div style={{}}>
                                            <DynamicTable
                                                listSearch={listSearch}
                                                listKey={"FCR Report"}
                                                row={searchData}
                                                rowCount={totalCount}
                                                header={FCRColumns}
                                                itemsPerPage={perPage}
                                                backendPaging={true}
                                                backendCurrentPage={currentPage}
                                                hiddenColumns={FCRHiddenColumns}
                                                isTableFirstRender={isTableFirstRender}
                                                hasExternalSearch={hasExternalSearch}
                                                exportBtn={exportBtn}
                                                url={properties.REPORTS_API + '/fcrSearch'}
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
                                </div>
                                :
                                <span className="msg-txt">No Record Available</span>
                            }
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}

export default FCRRport