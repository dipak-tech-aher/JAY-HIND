import React, { useEffect, useState, useRef } from 'react'
import { toast } from 'react-toastify';

import DynamicTable from '../../../common/table/DynamicTable'
import { properties } from '../../../properties';
import { get } from '../../../common/util/restUtil';
import moment from 'moment'
import PreviewModal from '../../previewModal'
import ReactSelect from 'react-select'

const AddEditCatalogAddon = (props) => {

    const [data, setData] = useState()
    const [exportBtn, setExportBtn] = useState(false);
    const [addonList, setAddonList] = useState([])
    const [chargeList, setChargeList] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [addonObject, setAddonObject] = useState({
        catalogAddonId: "",
        addonId: "",
        addonCatalogStatus: 'ACTIVE',
        mandatory: 'N'
    })
    const [selectedAddonList, setSelectedAddonList] = useState([])
    const [showHide, setShowHide] = useState(true)
    const addonSelectedList = props.data.addonSelectedList
    const setAddonSelectedList = props.handler.setAddonSelectedList
    const catalogData = props.data.catalogData
    const isCatalogTerminated = props?.data?.isCatalogTerminated 
    const dynamicInfoMsg = useRef('Loading add-on...');

    useEffect(() => {
        
        get(properties.ADDON_API + '?all=true')
            .then((response) => {
                if (response.data) {
                    if (response.data.length === 0) {
                        toast.error("No Records Found")
                        return
                    }
                    let addons = response.data.filter((addon) => (addon.status !== 'INACTIVE' && addon?.serviceType === catalogData?.serviceType))
                    setAddonList(addons);
                    if (!addons.length) {
                        dynamicInfoMsg.current = 'No add-on found with the service type.'
                    }
                    get(properties.CHARGE_API + "/search/all")
                        .then((resp) => {
                            if (resp.data.length > 0) {
                                setChargeList(resp.data)
                            }
                        }).catch(error => console.log(error))
                }
            }).catch(error => console.log(error))
            .finally()

    }, [])

    const getAddonList = async () => {
        
        let addons = []
        addonSelectedList.forEach((addonNode) => {
            addonList && !!addonList.length && addonList.forEach((addon) => {
                if (Number(addon?.addonId) === Number(addonNode?.addonId) && addonNode?.status !== 'INACTIVE') {
                    let addonCopy = {
                        ...addonObject,
                        ...addonNode,
                        ...addon
                    }
                    addons.push(addonCopy)
                }
            })
        })
        
        return addons
    }

    useEffect(async () => {
        
        if (addonSelectedList.length > 0) {
            if (selectedAddonList.length === 0) {
                let addons = await getAddonList()
                setSelectedAddonList(addons)
                setAddonObject({ ...addonObject, addonId: "", catalogAddonId: "" })
                setShowHide(false)
            }
        }
        
    }, [chargeList])

    const handleAdd = () => {
        if (addonObject.addonId === '') {
            toast.error("Please Select a Addon")
            return false
        }
        for (let addon in selectedAddonList) {
            if (Number(selectedAddonList[addon].addonId) === Number(addonObject.addonId)) {
                toast.error("Addon Already Added")
                setAddonObject({ ...addonObject, addonId: "", catalogAddonId: "" })
                return
            }
        }
        addonList && !!addonList.length && addonList.forEach((addon) => {
            if (Number(addon.addonId) === Number(addonObject.addonId)) {
                let addonCopy = {
                    ...addonObject,
                    ...addon
                }
                setAddonSelectedList([...addonSelectedList, {
                    addonId: Number(addon.addonId),
                    catalogAddonId: "",
                    status: 'ACTIVE',
                    mandatory: 'N'
                }])
                setSelectedAddonList([...selectedAddonList, addonCopy])
            }
        })
        setShowHide(false)
        setAddonObject({ ...addonObject, addonId: "", catalogAddonId: "" })
    }

    const handleRemove = (data) => {
        if (data.catalogAddonId !== '') {
            let filteredData = selectedAddonList.filter((addon) => Number(addon.addonId) !== Number(data.addonId))
            setAddonSelectedList(
                addonSelectedList.map((addon) => {
                    if (Number(addon.addonId) === Number(data.addonId)) {
                        addon.status = 'INACTIVE'
                    }
                    return addon
                })
            )
            setShowHide(true)
            setSelectedAddonList(filteredData)
        }
        else {
            let filteredData = selectedAddonList.filter((addon) => Number(addon.addonId) !== Number(data.addonId))
            let filteredData1 = addonSelectedList.filter((addon) => Number(addon.addonId) !== Number(data.addonId))
            setShowHide(true)
            setSelectedAddonList(filteredData)
            setAddonSelectedList(filteredData1)
        }
    }

    const handleMandatoryCheck = (e, data) => {
        setSelectedAddonList(selectedAddonList.map((addon) => {
            if (Number(addon.addonId) === Number(data.addonId)) {
                addon.mandatory = e.target.checked ? 'Y' : 'N'
            }
            return addon;
        }))
        setAddonSelectedList(
            addonSelectedList.map((addon) => {
                if (Number(addon.addonId) === Number(data.addonId)) {
                    addon.mandatory = e.target.checked ? 'Y' : 'N'
                }
                return addon
            })
        )
    }

    const handleCellRender = (cell, row) => {
        if (cell.column.Header === "Addon Id") {
            return (<span className="text-secondary cursor-pointer" onClick={() => { setData(row.original); setIsModalOpen(true) }}>{cell.value}</span>)
        }
        else if (cell.column.Header === "View") {
            return (
                <button type="button" className="btn btn-labeled btn-primary btn-sm ml-1" onClick={() => { setData(row.original); setIsModalOpen(true) }}><i className="mdi mdi-file-document-edit-outline font10 mr-1"></i><small>View</small></button>
            )
        }
        else if (cell.column.Header === "Addon Charge Name") {
            let chargeName = []
            row?.original?.addonCharges.map((charge) => {
                chargeList.map((chargeNode) => {
                    if (Number(charge.chargeId) === Number(chargeNode.chargeId)) {
                        chargeName.push(chargeNode.chargeName)
                    }
                })
            })
            return (<span>{chargeName.toString()}</span>)
        }
        else if (cell.column.Header === "Addon Charge Amount") {
            let chargeAmount = []
            row?.original?.addonCharges.map((charge) => {
                chargeAmount.push(charge.chargeAmount)
            })
            return (<span>{chargeAmount.toString()}</span>)
        }
        else if (cell.column.Header === "Mandatory") {
            return (
                <div className="custom-control custom-checkbox">
                    <input type="checkbox" id={`mandatory${row.original.addonId}`} disabled={isCatalogTerminated} className="custom-control-input " value={cell.value} checked={cell.value === 'Y' ? true : false} onChange={(e) => { handleMandatoryCheck(e, row.original) }} />
                    <label className="custom-control-label cursor-pointer" htmlFor={`mandatory${row.original.addonId}`}></label>
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
                                <div className="col-12 ml-2 pb-2 row" id="addonlist">
                                    {
                                        !!addonList.length ?
                                            <>
                                                <div className="col-md-3 pl-0">
                                                    <div className="form-group">
                                                        <label htmlFor="addonList" className="col-form-label">Search Addon Name</label>
                                                        <ReactSelect
                                                            id='addonList'

                                                            menuPortalTarget={document.body} 
                                                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                            
                                                            placeholder="Select Addon"
                                                            options={addonList && !!addonList.length && addonList.map((addon) => ({ label: addon.addonName, value: addon.addonId }))}
                                                            onChange={(selected) => {
                                                                setAddonObject({ ...addonObject, addonId: selected.value })
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
                                            Add New Addon
                                        </button>
                                    </div>
                                </>
                        }
                        <section>
                            <div className='m-1'>
                                {
                                    !!selectedAddonList.length &&
                                    <DynamicTable
                                        listKey={"Catalog Addon List"}
                                        row={selectedAddonList}
                                        header={addonCatalogTableColumns}
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
                                module: 'Addon'
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

export default AddEditCatalogAddon


const addonCatalogTableColumns = [
    {
        Header: "Addon Id",
        accessor: "addonId",
        disableFilters: true
    },
    {
        Header: "Addon Name",
        accessor: "addonName",
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
        Header: "Addon Charge Name",
        accessor: "addonChargeName",
        disableFilters: true
    },
    {
        Header: "Addon Charge Amount",
        accessor: "addonChargeAmount",
        disableFilters: true
    },
    {
        Header: "Status",
        accessor: "addonCatalogStatus",
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