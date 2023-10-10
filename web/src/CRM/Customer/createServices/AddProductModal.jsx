import React, { useEffect, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import Modal from 'react-modal'
import { toast } from 'react-toastify'
import CatalogList from './CatalogList'
import PlanServiceAssetAddonList from './PlanServiceAssetAddonList'
import SelectedProductList from './SelectedProductList'

const AddProductModal = (props) => {

    const { isOpen, selectedCatalog, selectedPlan, selectedAssetList, selectedServiceList, catalogList, planList, serviceList, assetList } = props?.data
    const { setIsOpen, setSelectedCatalog, setSelectedPlan, setSelectedServiceList, setSelectedAssetList, setServiceList, setAssetList } = props?.handler

    const [oldSelectedProducts, setOldSelectedProducts] = useState({
        oldSelectedCatalog: {},
        oldSelectedPlan: {},
        oldSelectedAssetList: [],
        oldSelectedServiceList: []
    })
    useEffect(() => {
        unstable_batchedUpdates(() => {
            setOldSelectedProducts({
                oldSelectedCatalog: selectedCatalog || {},
                oldSelectedPlan: selectedPlan || {},
                oldSelectedAssetList: selectedAssetList || [],
                oldSelectedServiceList: selectedServiceList || {}
            })
        })
    }, [])
    //const [activeTab, setActiveTab] = useState('catalog')
    const [activeTab, setActiveTab] = useState('catalog')
    const [selectedCatalogCard, setSelectedCatalogCard] = useState("")
    const [selectedPlanCard, setSelectedPlanCard] = useState("")
    const [filteredData, setFilteredData] = useState(catalogList || [])

    const customStyles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.75)'
        },
        content: {
            position: 'absolute',
            top: '10px',
            left: '-40px',
            right: '-40px',
            bottom: '10px',
            border: '1px solid #ccc',
            background: '#fff',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            borderRadius: '4px',
            outline: 'none',
            padding: '10px'
        }
    }

    const handleTabChange = (tabName) => {
        unstable_batchedUpdates(() => {
            setActiveTab(tabName)
        })
    }

    const handleRemoveProduct = (tabName, data) => {
        if (tabName === 'catalog') {
            unstable_batchedUpdates(() => {
                setSelectedCatalogCard("")
                setSelectedCatalog({})
            })
        }
        if (tabName === 'plan') {
            unstable_batchedUpdates(() => {
                setSelectedPlanCard("")
                setSelectedPlan({})
            })
        }
        if (tabName === 'service') {
            unstable_batchedUpdates(() => {
                setServiceList(
                    serviceList.map((service) => {
                        if (Number(service?.serviceId) === Number(data?.serviceId)) {
                            service.isSelected = 'N'
                        }
                        return service
                    })
                )
                setFilteredData(
                    filteredData.map((service) => {
                        if (Number(service?.serviceId) === Number(data?.serviceId)) {
                            service.isSelected = 'N'
                        }
                        return service
                    })
                )
                setSelectedServiceList(selectedServiceList.filter((service) => service?.serviceId !== data?.serviceId))
            })
        }
        if (tabName === 'asset') {
            unstable_batchedUpdates(() => {
                setAssetList(
                    assetList.map((asset) => {
                        if (Number(asset?.assetId) === Number(data?.assetId)) {
                            asset.isSelected = 'N'
                        }
                        return asset
                    })
                )
                setFilteredData(
                    filteredData.map((asset) => {
                        if (Number(asset?.assetId) === Number(data?.assetId)) {
                            asset.isSelected = 'N'
                        }
                        return asset
                    })
                )
                setSelectedAssetList(selectedAssetList.filter((asset) => asset?.assetId !== data?.assetId))
            })
        }
    }

    const handleCancel = () => {
        unstable_batchedUpdates(() => {
            if (oldSelectedProducts?.oldSelectedAssetList.length > 0) {
                setAssetList(
                    assetList.map((asset) => {
                        for (const assetInfo of oldSelectedProducts?.oldSelectedAssetList) {
                            if (asset?.assetId === assetInfo?.assetId) {
                                asset.isSelected = 'N'
                            }
                        }
                        return asset
                    })
                )
            } else {
                setAssetList(
                    assetList.map((asset) => {
                        asset.isSelected = 'N'
                        return asset
                    })
                )
            }
            if (oldSelectedProducts?.oldSelectedServiceList.length > 0) {
                setServiceList(
                    serviceList.map((service) => {
                        for (const serviceInfo of oldSelectedProducts?.oldSelectedServiceList) {
                            if (service?.serviceId === serviceInfo?.serviceId) {
                                service.isSelected = 'N'
                            }
                        }
                        return service
                    })
                )
            } else {
                setServiceList(
                    serviceList.map((service) => {
                        service.isSelected = 'N'
                        return service
                    })
                )
            }
            setSelectedCatalog(oldSelectedProducts?.oldSelectedCatalog)
            setSelectedPlan(oldSelectedProducts?.oldSelectedPlan)
            setSelectedServiceList(oldSelectedProducts?.oldSelectedServiceList)
            setSelectedAssetList(oldSelectedProducts?.oldSelectedAssetList)
            setIsOpen(false)
        })
    }

    const handleSaveAndClose = () => {
        if (!selectedCatalog?.catalogId && !selectedPlan?.planId && selectedServiceList.length === 0 && selectedAssetList.length === 0) {
            toast.error('Please select at least a Catalog/Plan/Service/Asset')
            return
        }
        setIsOpen(false)
    }

    return (
        <Modal isOpen={isOpen} contentLabel="Add Product Modal" style={customStyles}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title" id="fullWidthModalLabel">Add Products</h4>
                        <button type="button" className="close" onClick={handleCancel}>×</button>
                    </div>
                    <div className="modal-body bg-secondary">
                        <div className="col-12">
                            <div className="row">
                                <div className="col-7">
                                    <div className="card p-0">
                                        <div className="card-body">
                                            <div className="col-xl-12 p-0">
                                                <div className="card-box p-0">
                                                    <ul className="nav nav-tabs">
                                                        <li className="nav-item">
                                                            <a href="#catalog" data-toggle="tab" aria-expanded="false" className={`nav-link ${activeTab === 'catalog' ? 'active' : ''}`} onClick={() => { handleTabChange('catalog') }}>
                                                                Catalog
                                                            </a>
                                                        </li>
                                                        <li className="nav-item">
                                                            <a href="#plan" data-toggle="tab" aria-expanded="true" className={`nav-link ${activeTab === 'plan' ? 'active' : ''}`} onClick={() => { handleTabChange('plan') }}>
                                                                Plan
                                                            </a>
                                                        </li>
                                                        <li className="nav-item">
                                                            <a href="#service" data-toggle="tab" aria-expanded="false" className={`nav-link ${activeTab === 'service' ? 'active' : ''}`} onClick={() => { handleTabChange('service') }}>
                                                                Services
                                                            </a>
                                                        </li>
                                                        <li className="nav-item">
                                                            <a href="#asset" data-toggle="tab" aria-expanded="false" className={`nav-link ${activeTab === 'asset' ? 'active' : ''}`} onClick={() => { handleTabChange('asset') }}>
                                                                Assets
                                                            </a>
                                                        </li>
                                                    </ul>
                                                    <div className="tab-content pt-0">
                                                        <div className={`tab-pane ${activeTab === 'catalog' ? 'active' : ''}`} id="catalog">
                                                            {
                                                                activeTab === 'catalog' &&
                                                                <CatalogList
                                                                    data={{
                                                                        catalogList,
                                                                        selectedCatalog,
                                                                        selectedCatalogCard,
                                                                        filteredData
                                                                    }}
                                                                    handler={{
                                                                        setSelectedCatalog,
                                                                        setSelectedCatalogCard,
                                                                        setFilteredData
                                                                    }}
                                                                />
                                                            }
                                                        </div>
                                                        <div className={`tab-pane ${activeTab === 'plan' ? 'active' : ''}`} id="plan">
                                                            {
                                                                activeTab === 'plan' &&
                                                                <PlanServiceAssetAddonList
                                                                    data={{
                                                                        activeTab,
                                                                        planList,
                                                                        serviceList,
                                                                        assetList,
                                                                        selectedPlan,
                                                                        selectedServiceList,
                                                                        selectedAssetList,
                                                                        selectedPlanCard,
                                                                        filteredData
                                                                    }}
                                                                    handler={{
                                                                        setSelectedPlan,
                                                                        setSelectedServiceList,
                                                                        setSelectedAssetList,
                                                                        setServiceList,
                                                                        setAssetList,
                                                                        setSelectedPlanCard,
                                                                        setFilteredData
                                                                    }}
                                                                />
                                                            }
                                                        </div>
                                                        <div className={`tab-pane ${activeTab === 'service' ? 'active' : ''}`} id="service">
                                                            {
                                                                activeTab === 'service' &&
                                                                <PlanServiceAssetAddonList
                                                                    data={{
                                                                        activeTab,
                                                                        planList,
                                                                        serviceList,
                                                                        assetList,
                                                                        selectedPlan,
                                                                        selectedServiceList,
                                                                        selectedAssetList,
                                                                        selectedPlanCard,
                                                                        filteredData
                                                                    }}
                                                                    handler={{
                                                                        setSelectedPlan,
                                                                        setSelectedServiceList,
                                                                        setSelectedAssetList,
                                                                        setServiceList,
                                                                        setAssetList,
                                                                        setSelectedPlanCard,
                                                                        setFilteredData
                                                                    }}
                                                                />
                                                            }
                                                        </div>
                                                        <div className={`tab-pane ${activeTab === 'asset' ? 'active' : ''}`} id="asset">
                                                            {
                                                                activeTab === 'asset' &&
                                                                <PlanServiceAssetAddonList
                                                                    data={{
                                                                        activeTab,
                                                                        planList,
                                                                        serviceList,
                                                                        assetList,
                                                                        selectedPlan,
                                                                        selectedServiceList,
                                                                        selectedAssetList,
                                                                        selectedPlanCard,
                                                                        filteredData
                                                                    }}
                                                                    handler={{
                                                                        setSelectedPlan,
                                                                        setSelectedServiceList,
                                                                        setSelectedAssetList,
                                                                        setServiceList,
                                                                        setAssetList,
                                                                        setSelectedPlanCard,
                                                                        setFilteredData
                                                                    }}
                                                                />
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-1 text-center" style={{ maxWidth: "45px" }}>
                                    <a ><i className="fas fa-arrow-circle-right text-primary" style={{ fontSize: "30px", paddingTop: "220px" }}></i></a>
                                </div>
                                <SelectedProductList
                                    data={{
                                        selectedCatalog,
                                        selectedPlan,
                                        selectedServiceList,
                                        selectedAssetList
                                    }}
                                    handler={{
                                        handleRemoveProduct
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer d-flex justify-content-center">
                        <button type="button" className="btn btn-primary" onClick={handleSaveAndClose}>Save and Close</button>
                        <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={handleCancel}>Cancel</button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default AddProductModal