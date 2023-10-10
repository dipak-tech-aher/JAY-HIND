/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify';

import DynamicTable from '../../common/table/DynamicTable';
import { properties } from '../../properties';
import { get, post } from '../../common/util/restUtil';
import { unstable_batchedUpdates } from 'react-dom';
import { formFilterObject } from '../../common/util/util';
import ProductColumns from './productColumns';

const ProductReport = (props) => {

    const initialValues = {
        productType: "",
        productName: "",
        productServiceType: "",
        productStatus: ""
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

    const [productTypeLookup, setProductTypeLookup] = useState([]);
    const [productNameLookup, setProductNameLookup] = useState([]);
    const [productServiceTypeLookup, setProductServiceTypeLookup] = useState([]);
    const [productNameServiceLookup, setProductNameServiceLookup] = useState([]);
    const [productStatusLookup, setProductStatusLookup] = useState([]);

    const [planLookup, setPlanLookup] = useState([]);
    const [serviceLookup, setServiceLookup] = useState([]);
    const [assetLookup, setAssetLookup] = useState([]);
    const [addOnLookup, setAddOnLookup] = useState([]);

    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);

    useEffect(() => {
        let lookupData = '';
        post(properties.BUSINESS_ENTITY_API, ['PRODUCT_TYPE', 'STATUS', 'PRODUCT_NAME', 'PROD_CAT_TYPE'])
            .then((response) => {
                if (response.data) {
                    lookupData = response.data;
                    console.log('response.data:::', response.data)
                    setProductTypeLookup(lookupData['PRODUCT_TYPE']);
                    setProductNameLookup(lookupData['PRODUCT_NAME']);
                    setProductServiceTypeLookup(lookupData['PROD_CAT_TYPE']);
                    setProductStatusLookup(lookupData['STATUS']);
                }
            }).catch(error => console.log(error))

        get(properties.PRODUCT_LOOKUP_API).then((response) => {
            if (response.data) {
                lookupData = response.data;
                setPlanLookup(lookupData['planLookup']);
                setServiceLookup(lookupData['serviceLookup']);
                setAssetLookup(lookupData['assetLookup']);
                setAddOnLookup(lookupData['addOnLookup']);
                console.log('response.data:::', response.data)
            }
        }).catch(error => console.log(error))
    }, [])

    useEffect(() => {
        if (!isFirstRender.current) {
            search();
        }
        else {
            isFirstRender.current = false;
        }
    }, [currentPage, perPage])

    const search = () => {
        
        const requestBody = {
            "searchType": "ADV_SEARCH",
            ...searchInputs,
            filters: formFilterObject(filters)
        }
        setListSearch(requestBody);
        //setSearchInputs(initialValues)
        post(`${properties.REPORTS_API}/productSearch?limit=${perPage}&page=${currentPage}`, searchInputs)
            .then((resp) => {
                if (resp.data) {
                    if (resp.status === 200) {
                        const { count, rows } = resp.data;
                        unstable_batchedUpdates(() => {
                            setTotalCount(count)
                            setSearchData(rows);
                        })
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
        const target = e.target
        setSearchInputs({
            ...searchInputs,
            [target.id]: target.value
        })
        if (e.target.value === 'PT_PLAN_MST')
            setProductNameServiceLookup(planLookup)
        else if (e.target.value === 'PT_SERVICE_MST')
            setProductNameServiceLookup(serviceLookup)
        else if (e.target.value === 'PT_ASSET_MST')
            setProductNameServiceLookup(assetLookup)
        else if (e.target.value === 'PT_ADDON_MST')
            setProductNameServiceLookup(addOnLookup)
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
        return (<span>{cell.value}</span>);
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
                                <div className="col-12"><h4 className="pl-3">Product Report</h4></div>
                            </div>
                        </section>
                    </div>
                </div>
                <div className="border p-2">
                    <div className="col-12 p-2">
                        <div className="bg-light border pr-0 p-0 row"><div className="col"><h5 className="text-primary pl-2 pt-1">Search</h5></div>
                            <div className="col pt-1">
                                <div className="d-flex justify-content-end">
                                    <h6 className="cursor-pointer" style={{ color: "#163C82", float: "right" }} onClick={() => { setDisplayForm(!displayForm) }}>{displayForm ? "Hide Search" : "Show Search"}</h6>
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
                                                                <label htmlFor="serviceNumber" className="control-label">Product Type</label>
                                                                <select className="form-control" id="productType" value={searchInputs.productType} onChange={handleInputChange}>
                                                                    <option value="">Select Product Type</option>
                                                                    {
                                                                        productTypeLookup && productTypeLookup.map((e) => (
                                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                                        ))
                                                                    }
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-3">
                                                            <div className="form-group">
                                                                <label htmlFor="serviceNumber" className="control-label">Product Name</label>
                                                                <select className="form-control" id="productName" value={searchInputs.productName} onChange={handleInputChange}>
                                                                    <option value="">Select Product Name</option>
                                                                    {
                                                                        productNameServiceLookup && productNameServiceLookup.map((e) => (
                                                                            e.addonName ? <option key={e.addonName} value={e.addonName}>{e.addonName}</option> :
                                                                                e.assetName ? <option key={e.assetName} value={e.assetName}>{e.assetName}</option> :
                                                                                    e.planName ? <option key={e.planName} value={e.planName}>{e.planName}</option> :
                                                                                        e.serviceName ? <option key={e.serviceName} value={e.serviceName}>{e.serviceName}</option> : ''
                                                                        ))
                                                                    }
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-3">
                                                            <div className="form-group">
                                                                <label htmlFor="productServiceType" className="control-label">Product Service Type</label>
                                                                <select className="form-control" id="productServiceType" value={searchInputs.productServiceType} onChange={handleInputChange}>
                                                                    <option value="">Select Product Service Type</option>
                                                                    {
                                                                        productNameServiceLookup && productNameServiceLookup.map((e) => (
                                                                            <option key={e.serviceType} value={e.serviceType}>{e.serviceType}</option>
                                                                        ))
                                                                    }
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-3">
                                                            <div className="form-group">
                                                                <label htmlFor="productStatus" className="control-label">Product Status</label>
                                                                <select className="form-control" id="productStatus" value={searchInputs.productStatus} onChange={handleInputChange}>
                                                                    <option value="">Select Product Status</option>
                                                                    {
                                                                        productStatusLookup && productStatusLookup.map((e) => (
                                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                                        ))
                                                                    }
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="col-3">



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
                    !!searchData.length &&
                    <div className="row mt-2">
                        <div className="col-lg-12">
                            {
                                !!searchData.length &&
                                <div className="card">
                                    <div className="card-body" id="datatable">
                                        <div style={{}}>
                                            <DynamicTable
                                                listSearch={listSearch}
                                                listKey={"Product Report"}
                                                row={searchData}
                                                rowCount={totalCount}
                                                header={ProductColumns}
                                                itemsPerPage={perPage}
                                                backendPaging={true}
                                                backendCurrentPage={currentPage}
                                                isTableFirstRender={isTableFirstRender}
                                                hasExternalSearch={hasExternalSearch}
                                                exportBtn={exportBtn}
                                                url={properties.REPORTS_API + '/productSearch'}
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
                            }
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}

export default ProductReport;