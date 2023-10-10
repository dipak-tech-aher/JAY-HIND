import React, { useEffect, useRef, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { toast } from 'react-toastify';

import DynamicTable from '../../common/table/DynamicTable';
import { properties } from '../../properties';
import { formatISODateDDMMMYY } from "../../common/util/dateUtil";
import { post } from '../../common/util/restUtil';
import { formFilterObject } from '../../common/util/util';
import { FCRMISColumns, FCRMISHiddenColumns } from './fcrMisColumns';

const FCRMISReport =()=>{


    const initialValues = {
        reportType: "FCR MIS"
    }

    const [searchInputs, setSearchInputs] = useState(initialValues);
    //  const [displayForm, setDisplayForm] = useState(true);
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

    useEffect(() => {
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
    }, [])

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
        post(`${properties.REPORTS_API}/fcrMisReport?limit=${perPage}&page=${currentPage}`, searchInputs)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        const { count, rows } = resp.data;
                        const { message } = resp
                        toast.success(message);
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

        <div className="card pt-1">
            <div className="container-fluid">
                <div className="form-row pb-2">
                    <div className="col-12">
                        <section className="triangle">
                            <div className="col-12 row">
                                <div className="col-12"><h4 className="pl-3">FCR MIS Report</h4></div>
                            </div>
                        </section>
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
                                                listKey={"FCR MIS Report"}
                                                row={searchData}
                                                rowCount={totalCount}
                                                header={FCRMISColumns}
                                                itemsPerPage={perPage}
                                                backendPaging={true}
                                                backendCurrentPage={currentPage}
                                                hiddenColumns={FCRMISHiddenColumns}
                                                isTableFirstRender={isTableFirstRender}
                                                hasExternalSearch={hasExternalSearch}
                                                exportBtn={exportBtn}
                                                url={properties.REPORTS_API + '/fcrMisReport'}
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
    )
}

export default FCRMISReport;