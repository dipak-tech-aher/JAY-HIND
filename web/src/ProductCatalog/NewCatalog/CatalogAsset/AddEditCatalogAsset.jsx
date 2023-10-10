import React, { useEffect, useState, useRef } from 'react'
import { toast } from 'react-toastify';

import DynamicTable from '../../../common/table/DynamicTable'
import { properties } from '../../../properties';
import { get } from '../../../common/util/restUtil';
import moment from 'moment'
import PreviewModal from '../../previewModal'
import ReactSelect from 'react-select'

const AddEditCatalogAsset = (props) => {

    const [data, setData] = useState()
    const [exportBtn, setExportBtn] = useState(false);
    const [assetList, setAssetList] = useState([])
    const [chargeList, setChargeList] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [assetObject, setAssetObject] = useState({
        catalogAssetId: "",
        assetId: "",
        assetCatalogStatus: 'ACTIVE',
        mandatory: 'N'
    })
    const [selectedAssetList, setSelectedAssetList] = useState([])
    const [showHide, setShowHide] = useState(true)
    const assetSelectedList = props.data.assetSelectedList
    const setAssetSelectedList = props.handler.setAssetSelectedList
    const catalogData = props.data.catalogData
    const isCatalogTerminated = props?.data?.isCatalogTerminated 
    const dynamicInfoMsg = useRef('Loading assets...');

    useEffect(() => {
        
        get(properties.ASSET_API + '?all=true')
            .then((response) => {
                if (response.data) {
                    if (response.data.length === 0) {
                        toast.error("No Records Found")
                        return
                    }
                    let assets = response.data.filter((asset) => asset.status !== 'INACTIVE' && asset?.serviceType === catalogData?.serviceType);
                    setAssetList(assets);
                    if (!assets.length) {
                        dynamicInfoMsg.current = 'No assets founds with the service type';
                    }
                    get(properties.CHARGE_API + "/search/all")
                        .then((resp) => {
                            if (resp.data.length > 0) {
                                setChargeList(resp.data)
                            }
                        })
                }
            }).catch(error => console.log(error))
            .finally()

    }, [])

    const getAssetList = async () => {
        
        let assets = []
        assetSelectedList.forEach((assetNode) => {
            assetList && !!assetList.length && assetList.forEach((asset) => {
                if (Number(asset?.assetId) === Number(assetNode?.assetId) && assetNode?.status !== 'INACTIVE') {
                    let assetCopy = {
                        ...assetObject,
                        ...assetNode,
                        ...asset
                    }
                    assets.push(assetCopy)
                }
            })
        })
        
        return assets
    }

    useEffect(async () => {
        
        if (assetSelectedList.length > 0) {
            if (selectedAssetList.length === 0) {
                let assets = await getAssetList()
                setSelectedAssetList(assets)
                setAssetObject({ ...assetObject, assetId: "", catalogAssetId: "" })
                setShowHide(false)
            }
        }
        
    }, [chargeList])

    const handleAdd = () => {
        if (assetObject.assetId === '') {
            toast.error("Please Select a Asset")
            return false
        }
        for (let asset in selectedAssetList) {
            if (Number(selectedAssetList[asset].assetId) === Number(assetObject.assetId)) {
                toast.error("Asset Already Added")
                setAssetObject({ ...assetObject, assetId: "", catalogAssetId: "" })
                return
            }
        }
        assetList && !!assetList.length && assetList.forEach((asset) => {
            if (Number(asset.assetId) === Number(assetObject.assetId)) {
                let assetCopy = {
                    ...assetObject,
                    ...asset
                }
                setAssetSelectedList([...assetSelectedList, {
                    assetId: Number(asset.assetId),
                    catalogAssetId: "",
                    status: 'ACTIVE',
                    mandatory: 'N'
                }])
                setSelectedAssetList([...selectedAssetList, assetCopy])
            }
        })
        setShowHide(false)
        setAssetObject({ ...assetObject, assetId: "", catalogAssetId: "" })
    }

    const handleRemove = (data) => {
        if (data.catalogAssetId !== '') {
            let filteredData = selectedAssetList.filter((asset) => Number(asset.assetId) !== Number(data.assetId))
            setAssetSelectedList(
                assetSelectedList.map((asset) => {
                    if (Number(asset.assetId) === Number(data.assetId)) {
                        asset.status = 'INACTIVE'
                    }
                    return asset
                })
            )
            setShowHide(true)
            setSelectedAssetList(filteredData)
        }
        else {
            let filteredData = selectedAssetList.filter((asset) => Number(asset.assetId) !== Number(data.assetId))
            let filteredData1 = assetSelectedList.filter((asset) => Number(asset.assetId) !== Number(data.assetId))
            setShowHide(true)
            setSelectedAssetList(filteredData)
            setAssetSelectedList(filteredData1)
        }
    }

    const handleMandatoryCheck = (e, data) => {
        setSelectedAssetList(
            selectedAssetList.map((asset) => {
                if (Number(asset.assetId) === Number(data.assetId)) {
                    asset.mandatory = e.target.checked ? 'Y' : 'N'
                }
                return asset;
            })
        )
        setAssetSelectedList(
            assetSelectedList.map((asset) => {
                if (Number(asset.assetId) === Number(data.assetId)) {
                    asset.mandatory = e.target.checked ? 'Y' : 'N'
                }
                return asset
            })
        )
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Asset Id") {
            return (<span className="text-secondary cursor-pointer" onClick={() => { setData(row.original); setIsModalOpen(true) }}>{cell.value}</span>)
        }
        else if (cell.column.Header === "View") {
            return (
                <button type="button" className="btn btn-labeled btn-primary btn-sm ml-1" onClick={() => { setData(row.original); setIsModalOpen(true) }}><i className="mdi mdi-file-document-edit-outline font10 mr-1"></i><small>View</small></button>
            )
        }
        else if (cell.column.Header === "Asset Charge Name") {
            let chargeName = []
            row?.original?.assetCharges.map((charge) => {
                chargeList.map((chargeNode) => {
                    if (Number(charge.chargeId) === Number(chargeNode.chargeId)) {
                        chargeName.push(chargeNode.chargeName)
                    }
                })
            })
            return (<span>{chargeName.toString()}</span>)
        }
        else if (cell.column.Header === "Asset Charge Amount") {
            let chargeAmount = []
            row?.original?.assetCharges.map((charge) => {
                chargeAmount.push(charge.chargeAmount)
            })
            return (<span>{chargeAmount.toString()}</span>)
        }
        else if (cell.column.Header === "Mandatory") {
            return (
                <div className="custom-control custom-checkbox">
                    <input type="checkbox" id={`mandatory${row.original.assetId}`} disabled={isCatalogTerminated} className="custom-control-input " value={cell.value} checked={cell.value === 'Y' ? true : false} onChange={(e) => { handleMandatoryCheck(e, row.original) }} />
                    <label className="custom-control-label cursor-pointer" htmlFor={`mandatory${row.original.assetId}`}></label>
                </div>
            )
        }
        else if (cell.column.Header === "Start Date" || cell.column.Header === "End Date") {
            return (<span>{cell.value ? moment(cell.value).format('DD MMM YYYY') : ''}</span>)
        }
        else if (cell.column.Header === "Status") {
            return (<span>{cell.value === 'ACTIVE' ? 'Active' : cell.value === 'INACTIVE' ? 'Inactive' : ''}</span>)
        }
        else if (cell.column.Header === "Remove") {
            return (<button type="button" disabled={isCatalogTerminated} className="btn btn-labeled btn-primary btn-sm" onClick={() => { handleRemove(row.original) }}>-</button>)
        }
        else {
            return (<span>{cell.value}</span>)
        }
    }

    return (
        <>
            <div className="tab-pane" id="basictab2">
                <div className="row">
                    <div className="col-12">
                        {
                            showHide === true ?
                                <div className="col-12 ml-2 pb-2 row" id="assetlist">
                                    {
                                        !!assetList.length ?
                                            <>
                                                <div className="col-md-3 pl-0">
                                                    <div className="form-group">
                                                        <label htmlFor="assetList" className="col-form-label">Search Asset Name</label>
                                                        <ReactSelect
                                                            id='assetList'
                                                            placeholder="Select Asset"

                                                            menuPortalTarget={document.body} 
                                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                            
                                                            options={assetList && !!assetList.length && assetList.map((asset) => ({ label: asset.assetName, value: asset.assetId }))}
                                                            onChange={(selected) => {
                                                                setAssetObject({ ...assetObject, assetId: selected.value })
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-3 pl-0 mt-3 pt-2">
                                                    <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" disabled={isCatalogTerminated}
                                                        onClick={() => { handleAdd() }}
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </>
                                            :
                                            <p className="mx-auto">{dynamicInfoMsg.current}</p>
                                    }
                                </div>
                                :
                                <>
                                    <div className="float-right pb-1 pr-1">
                                        <button type="button" className="btn btn-labeled btn-primary btn-sm " disabled={isCatalogTerminated}
                                            onClick={() => { setShowHide(true) }}
                                        >
                                            Add New Asset
                                        </button>
                                    </div>
                                </>
                        }
                        <section>
                            <div className='m-1'>
                                {
                                    !!selectedAssetList.length &&
                                    <DynamicTable
                                        listKey={"Catalog Asset List"}
                                        row={selectedAssetList}
                                        header={assetCatalogTableColumns}
                                        itemsPerPage={10}
                                        exportBtn={exportBtn}
                                        handler={{
                                            handleCellRender: handleCellRender,
                                            handleExportButton: setExportBtn
                                        }}
                                    />
                                }
                            </div>
                        </section>
                    </div>
                    {
                        isModalOpen &&
                        <PreviewModal
                            data={{
                                isOpen: isModalOpen,
                                data: data,
                                module: 'Asset'
                            }}
                            handler={{
                                setIsOpen: setIsModalOpen
                            }}
                        />
                    }
                </div>
            </div>
        </>
    )
}

export default AddEditCatalogAsset


const assetCatalogTableColumns = [
    {
        Header: "Asset Id",
        accessor: "assetId",
        disableFilters: true
    },
    {
        Header: "Asset Name",
        accessor: "assetName",
        disableFilters: true
    },
    {
        Header: "Service Type",
        accessor: "serviceTypeDesc.description",
        disableFilters: true
    },
    {
        Header: "Start Date",
        accessor: "startDate",
        disableFilters: true
    },
    {
        Header: "End Date",
        accessor: "endDate",
        disableFilters: true
    },
    {
        Header: "Asset Charge Name",
        accessor: "assetChargeName",
        disableFilters: true
    },
    {
        Header: "Asset Charge Amount",
        accessor: "assetChargeAmount",
        disableFilters: true
    },
    {
        Header: "Status",
        accessor: "assetCatalogStatus",
        disableFilters: true
    },
    {
        Header: "Mandatory",
        accessor: "mandatory",
        disableFilters: true
    },
    {
        Header: "View",
        accessor: "view",
        disableFilters: true
    },
    {
        Header: "Remove",
        accessor: "action",
        disableFilters: true
    }
]