import React, { useState, useEffect, useRef, useCallback } from 'react';

import DynamicTable from '../../common/table/DynamicTable'
import { properties } from '../../properties';
import { get, post } from '../../common/util/restUtil';
import { unstable_batchedUpdates } from 'react-dom';
import { CatalogListColumns } from './CatalogColumnList';
import CatalogPreviewModal from './CatalogPreviewModal';
import moment from 'moment'
import { toast } from 'react-toastify';
import { formFilterObject } from '../../common/util/util';

const CatalogList = (props) => {

    const { setIsActive, setLocation, setCatalogData } = props.handler;
    const { catalogData } = props.data;
    const [catalogList, setCatalogList] = useState([])
    const [planList, setPlanList] = useState([])
    const [serviceList, setServiceList] = useState([])
    const [assetList, setAssetList] = useState([])
    const [addonList, setAddonList] = useState([])
    const [chargeList, setChargeList] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [catalogName, setCatalogName] = useState('')

    const [totalCount, setTotalCount] = useState(0);
    const [perPage, setPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [filters, setFilters] = useState([]);
    const [exportBtn, setExportBtn] = useState(true);
    const [listSearch, setListSearch] = useState([]);
    const isTableFirstRender = useRef(true);
    const hasExternalSearch = useRef(false);

    const handlePageSelect = (pageNo) => {
        setCurrentPage(pageNo)
    }

    const getCatalogList = useCallback((name = catalogName) => {
        
        const requestBody = {
            name,
            filters: formFilterObject(filters)
        }
        setListSearch(requestBody);
        post(`${properties.CATALOGUE_API}/search?limit=${perPage}&page=${currentPage}`, requestBody)
            .then((response) => {
                const { count, rows = [] } = response.data;
                if (rows.length === 0) {
                    toast.error("No Records Found")
                    return
                }
                unstable_batchedUpdates(() => {
                    setTotalCount(count);
                    setCatalogList(rows);
                })
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }, [perPage, currentPage])


    useEffect(() => {
        
                post(properties.PLANS_API + "/search?all=true")
                    .then((planResp) => {
                        if (planResp.data.length > 0) {
                            setPlanList(planResp.data)
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    })
                    .finally()
                
                post(properties.CATALOG_SERVICE_API + "/search?all=true")
                    .then((serviceResp) => {
                        if (serviceResp.data.length > 0) {
                            setServiceList(serviceResp.data)
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    })
                    .finally()
                
                get(properties.ASSET_API + '?all=true')
                    .then((assetResp) => {
                        if (assetResp.data.length > 0) {
                            setAssetList(assetResp.data)
                        }
                    }).catch(error => console.log(error))
                    .finally()
                
                get(properties.ADDON_API + '?all=true')
                    .then((addonResp) => {
                        if (addonResp.data.length > 0) {
                            setAddonList(addonResp.data)
                        }
                    }).catch(error => console.log(error))
                    .finally()
                
                get(properties.CHARGE_API + "/search/all")
                    .then((chargeResp) => {
                        if (chargeResp.data.length > 0) {
                            setChargeList(chargeResp.data)
                        }
                    }).catch(error => console.log(error))
                    .finally()
    },[])

    useEffect(() => {
        getCatalogList();
    }, [getCatalogList])


    const handleCatalogOpen = (data) => {
        let catalog = {
            catalogName: data.catalogName,
            serviceType: data?.serviceTypeDesc?.description,
            customerType: data?.customerType,
            startDate: data?.startDate,
            endDate: data?.endDate,
            status: data?.statusDesc?.description,
            plan: {},
            services: [],
            addons: [],
            assets: []
        }

        catalog.plan = planList.find((plan) => Number(plan.planId) === (data?.planMap.filter((plan) => plan?.status === 'ACTIVE')[0].planId))
        catalog.plan?.planCharges.map((chr) => {
            let charge = chargeList.find((charge) => Number(charge?.chargeId) === Number(chr?.chargeId))
            chr["chargeName"] = charge?.chargeName
            chr["chargeType"] = charge?.chargeCat
            chr["chargeTypeDesc"] = charge?.chargeCatDesc?.description
            chr["currency"] = charge?.currency
            chr["currencyDesc"] = charge?.currencyDesc?.description
            chr["changesApplied"] = chr?.changesApplied !== '' ? chr?.changesApplied : 'N'
            return chr
        })

        catalog.services = data?.serviceMap.filter((service) => service?.status === 'ACTIVE')
        let services = []
        catalog.services.map((service) => {
            serviceList.map((sr) => {
                if (Number(sr.serviceId) === Number(service.serviceId)) {
                    let sv = sr
                    sv?.serviceCharges.map((chr) => {
                        let charge = chargeList.find((charge) => Number(charge.chargeId) === Number(chr?.chargeId))
                        chr["chargeName"] = charge?.chargeName
                        chr["chargeType"] = charge?.chargeCat
                        chr["chargeTypeDesc"] = charge?.chargeCatDesc?.description
                        chr["currency"] = charge?.currency
                        chr["currencyDesc"] = charge?.currencyDesc?.description
                        chr["changesApplied"] = chr?.changesApplied !== '' ? chr?.changesApplied : 'N'
                    })
                    sv["mandatory"] = service?.mandatory
                    services.push(sv)
                }
            })
        })
        catalog.services = services

        catalog.addons = data?.addonMap.filter((addon) => addon?.status === 'ACTIVE')
        let addons = []
        catalog.addons.map((addon) => {
            addonList.map((sr) => {
                if (Number(sr.addonId) === Number(addon.addonId)) {
                    let sv = sr
                    sv?.addonCharges.map((chr) => {
                        let charge = chargeList.find((charge) => Number(charge.chargeId) === Number(chr?.chargeId))
                        chr["chargeName"] = charge?.chargeName
                        chr["chargeType"] = charge?.chargeCat
                        chr["chargeTypeDesc"] = charge?.chargeCatDesc?.description
                        chr["currency"] = charge?.currency
                        chr["currencyDesc"] = charge?.currencyDesc?.description
                        chr["changesApplied"] = chr?.changesApplied !== '' ? chr?.changesApplied : 'N'
                    })
                    sv["mandatory"] = addon?.mandatory
                    addons.push(sv)
                }
            })
        })
        catalog.addons = addons

        catalog.assets = data?.assetMap.filter((asset) => asset?.status === 'ACTIVE')
        let assets = []
        catalog.assets.map((asset) => {
            assetList.map((sr) => {
                if (Number(sr.assetId) === Number(asset.assetId)) {
                    let sv = sr
                    sv?.assetCharges.map((chr) => {
                        let charge = chargeList.find((charge) => Number(charge.chargeId) === Number(chr?.chargeId))
                        chr["chargeName"] = charge?.chargeName
                        chr["chargeType"] = charge?.chargeCat
                        chr["chargeTypeDesc"] = charge?.chargeCatDesc?.description
                        chr["currency"] = charge?.currency
                        chr["currencyDesc"] = charge?.currencyDesc?.description
                        chr["changesApplied"] = chr?.changesApplied !== '' ? chr?.changesApplied : 'N'
                    })
                    sv["mandatory"] = asset?.mandatory
                    sv.assetManufacturer = sr?.assetManuDesc?.description
                    sv.assetSegment = sr?.assetSegDesc?.description
                    sv.assetStatus = sr?.assetSegDesc?.description
                    assets.push(sv)
                }
            })
        })
        catalog.assets = assets

        setCatalogData(catalog)
        setIsModalOpen(true)
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Catalog Id") {
            return (<span className="text-secondary cursor-pointer" onClick={() => { handleCatalogOpen(row.original) }}>{cell.value}</span>)
        }
        else if (cell.column.Header === "Service Items") {
            // let activeServices = row?.original?.serviceMap.filter((service) => service?.status === 'ACTIVE')
            // let services = []
            // activeServices.forEach((service) => {
            //     serviceList.forEach((sv) => {
            //         if (Number(service?.serviceId) === Number(sv?.serviceId)) {
            //             services.push(sv?.serviceName)
            //         }
            //     })
            // })
            return (<span>{row?.original?.serviceMap && row?.original?.serviceMap.length > 0 && row?.original?.serviceMap.map((service) => { return service?.serviceDetails && service?.serviceDetails[0]?.serviceName || ''}).toString() || '-'}</span>)
        }
        else if (cell.column.Header === "Asset Items") {
            // let activeAssets = row?.original?.assetMap.filter((asset) => asset?.status === 'ACTIVE')
            // let assets = []
            // activeAssets.forEach((asset) => {
            //     assetList.forEach((sv) => {
            //         if (Number(asset?.assetId) === Number(sv?.assetId)) {
            //             assets.push(sv?.assetName)
            //         }
            //     })
            // })
            return (<span>{row?.original?.assetMap && row?.original?.assetMap.length > 0 && row?.original?.assetMap.map((asset) => { return asset?.assetDetails && asset?.assetDetails[0]?.assetName || ''}).toString() || '-'}</span>)
        }
        else if (cell.column.Header === "Addon Items") {
            // let activeAddons = row?.original?.addonMap.filter((addon) => addon?.status === 'ACTIVE')
            // let addons = []
            // activeAddons.forEach((addon) => {
            //     addonList.forEach((sv) => {
            //         if (Number(addon?.addonId) === Number(sv?.addonId)) {
            //             addons.push(sv?.addonName)
            //         }
            //     })
            // })
            return (<span>{row?.original?.addonMap && row?.original?.addonMap.length > 0 && row?.original?.addonMap.map((addon) => { return addon?.addonDetails && addon?.addonDetails[0]?.addonName || ''}).toString() || '-'}</span>)
        }
        else if (cell.column.Header === "Plan") {
            // let activePlan = row?.original?.planMap.filter((plan) => plan.status === 'ACTIVE')
            // let planName = ""
            // planList.forEach((plan) => {
            //     if (Number(plan?.planId) === Number(activePlan[0]?.planId)) {
            //         planName = plan?.planName
            //     }
            // })
            return (<span>{row?.original?.planMap[0]?.planDetails[0]?.planName}</span>)
        }
        else if (cell.column.Header === "Action") {
            return (
                <button type="button" className="btn btn-labeled btn-primary btn-sm ml-1" onClick={() => handleOnEdit(row)}>
                    <i className="mdi mdi-file-document-edit-outline font10 mr-1" />
                    <small>Edit</small>
                </button>
            )
        }
        else if (['Updated At', 'Created At'].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY hh:mm:ss A') : '-'}</span>)
        }
        else if (['Start Date', 'End Date'].includes(cell.column.Header)) {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : '-'}</span>)
        }
        else if (cell.column.Header === "Created By") {
            return (<span>{row?.original?.createdByName?.firstName + " " + row?.original?.createdByName?.lastName}</span>)
        }
        else if (cell.column.Header === "Updated By") {
            return (<span>{row?.original?.updatedByName?.firstName + " " + row?.original?.updatedByName?.lastName}</span>)
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    const handleOnEdit = (row) => {
        unstable_batchedUpdates(() => {
            setIsActive('create-edit');
            setLocation('edit');
            setCatalogData(row.original)
        })
    }

    const handleOnAddCatalog = () => {
        setIsActive('create-edit');
        setLocation('create');
    }

    const handleOnCatalogNameSearch = () => {
        unstable_batchedUpdates(() => {
            setPerPage((perPage) => {
                if (perPage === 10) {
                    return '10';
                }
                return 10;
            });
            setCurrentPage((currentPage) => {
                if (perPage === 0) {
                    return '0';
                }
                return 0;
            });
        })
    }
    // const handleCatalogSearch = () => {
    //     
    //     post(properties.CATALOGUE_API + '/search', { name: catalogName })
    //         .then((response) => {
    //             if (response?.data?.rows.length > 0) {
    //                 setCatalogList(response?.data?.rows)
    //             }
    //             else {
    //                 toast.error("No Catalog Found")
    //             }
    //         })
    //         .finally()
    // }

    return (
        <div className="row mt-1">
            <div className="col-lg-12">
                <section className="triangle">
                    <div className="row align-items-center">
                        <div className="col max-auto">
                            <h4 id="list-item-1" className="pl-1">Add / Edit Catalog</h4>
                        </div>
                        <div className="col-auto max-auto pad-left">
                            <div className="input-group input-group-sm pr-1 form-inline">
                                <input type="text" className="form-control border-0" placeholder="Search Catalog Name" value={catalogName}
                                    onChange={(e) => { setCatalogName(e.target.value) }}
                                />
                                <div className="input-group-append">
                                    <div className="btn-group" role="group" aria-label="Basic example">
                                        <button className="btn btn-primary btn-sm btn-sm append-button"
                                            onClick={handleOnCatalogNameSearch}
                                        >
                                            <i className="fe-search"></i>
                                        </button>
                                    </div>
                                </div>
                                <button className="btn btn-labeled btn-primary btn-sm ml-1" onClick={handleOnAddCatalog}>
                                    <small className="align-middle">Add Catalog</small>
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
                <div className='mt-1'>
                    {
                        !!catalogList.length &&
                        <DynamicTable
                            listSearch={listSearch}
                            listKey={"Catalog List"}
                            row={catalogList}
                            rowCount={totalCount}
                            header={CatalogListColumns}
                            itemsPerPage={perPage}
                            backendPaging={true}
                            backendCurrentPage={currentPage}
                            isTableFirstRender={isTableFirstRender}
                            hasExternalSearch={hasExternalSearch}
                            exportBtn={exportBtn}
                            handler={{
                                handleCellRender: handleCellRender,
                                handlePageSelect: handlePageSelect,
                                handleItemPerPage: setPerPage,
                                handleCurrentPage: setCurrentPage,
                                handleFilters: setFilters,
                                handleExportButton: setExportBtn
                            }}
                        />
                    }
                </div>
                {
                    isModalOpen &&
                    <CatalogPreviewModal
                        data={{
                            isOpen: isModalOpen,
                            catalogData: catalogData
                        }}
                        handler={{
                            setIsOpen: setIsModalOpen
                        }}
                    />
                }
            </div>
        </div>
    )
}

export default CatalogList;