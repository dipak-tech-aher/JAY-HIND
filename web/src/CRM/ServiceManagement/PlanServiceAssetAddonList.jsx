import React, { useEffect, useState } from 'react' 
import { unstable_batchedUpdates } from 'react-dom'
import { USNumberFormat } from '../../common/util/util'

const PlanServiceAssetAddonList = (props) => {

    const { activeTab, planList, serviceList, assetList, selectedPlan, selectedServiceList, selectedAssetList, selectedPlanCard, filteredData} = props?.data
    const { setSelectedPlan, setSelectedServiceList, setSelectedAssetList, setServiceList, setAssetList, setSelectedPlanCard, setFilteredData } = props?.handler
    
    const [searchInput,setSearchInput] = useState("")

    useEffect(() => {
        unstable_batchedUpdates(() => {
            //setFilteredData(activeTab === 'plan' ? planList : activeTab === 'service' ? serviceList : activeTab === 'asset' ? assetList : planList)
            if(activeTab === 'plan') {
                setFilteredData(planList)
                setSelectedPlanCard(selectedPlan?.planId || "") 
            }
            if(activeTab === 'asset') {
                setFilteredData(
                    assetList.map((asset) => {
                        for(const assetInfo of selectedAssetList) {
                            if(asset?.assetId === assetInfo?.assetId) {
                                asset.isSelected = 'Y'
                            }
                        }
                        return asset
                    })
                )
            }
            if(activeTab === 'service') {
                setFilteredData(
                    serviceList.map((service) => {
                        for(const serviceInfo of selectedServiceList) {
                            if(service?.serviceId === serviceInfo?.serviceId) {
                                service.isSelected = 'Y'
                            }
                        }
                        return service
                    })
                )
            }
        }) 
        
    },[])

    const handleInputChange = (e) => {
        if(e.target.value === '')
        {
            setSearchInput(e.target.value)
            setFilteredData(activeTab === 'plan' ? planList : activeTab === 'service' ? serviceList : activeTab === 'asset' ? assetList : planList)
            return
        }
        unstable_batchedUpdates(() => {
            setSearchInput(e.target.value)
            const filteredList = (activeTab === 'plan' ? planList : activeTab === 'service' ? serviceList : activeTab === 'asset' ? assetList : planList).filter((value) => {
                return (activeTab === 'plan' ? value?.planName.toString().toLowerCase().indexOf(e.target.value.toLowerCase()) >= 0 : activeTab === 'service' ? value?.serviceName.toString().toLowerCase().indexOf(e.target.value.toLowerCase()) >= 0 : activeTab === 'asset' ? value?.assetName.toString().toLowerCase().indexOf(e.target.value.toLowerCase()) >= 0 : value?.planName.toString().toLowerCase().indexOf(e.target.value.toLowerCase()) >= 0) 
            })
            setFilteredData(filteredList)
        })
    }

    const handleSelectCard = (data,e) => {
        if(activeTab === 'plan') {
            unstable_batchedUpdates(() => {
                setSelectedPlanCard(Number(data?.planId))
                setSelectedPlan(data)
            })
        }
        if(activeTab === 'service') {
            setServiceList(
                serviceList.map((service) => {
                    if (Number(service?.serviceId) === Number(data?.serviceId)) {
                        service.isSelected = e.target.checked ? 'Y' : 'N'
                    }
                    return service
                })
            )
            setFilteredData(
                filteredData.map((service) => {
                    if (Number(service?.serviceId) === Number(data?.serviceId)) {
                        service.isSelected = e.target.checked ? 'Y' : 'N'
                    }
                    return service
                })
            )
            if(e.target.checked) {
                setSelectedServiceList([...selectedServiceList,data])
            } else {
                setSelectedServiceList(selectedServiceList.filter((service) => service?.serviceId !== data?.serviceId))
            }
        }
        if(activeTab === 'asset') {
            setAssetList(
                assetList.map((asset) => {
                    if (Number(asset?.assetId) === Number(data?.assetId)) {
                        asset.isSelected = e.target.checked ? 'Y' : 'N'
                    }
                    return asset
                })
            )
            setFilteredData(
                filteredData.map((asset) => {
                    if (Number(asset?.assetId) === Number(data?.assetId)) {
                        asset.isSelected = e.target.checked ? 'Y' : 'N'
                    }
                    return asset
                })
            )
            if(e.target.checked) {
                setSelectedAssetList([...selectedAssetList,data])
            } else {
                setSelectedAssetList(selectedAssetList.filter((asset) => asset?.assetId !== data?.assetId))
            }
        }
    }

    return (
        <div className="list-group">
            <div className="input-group input-group-merge p-2">
                <input type="text" className="form-control height38" placeholder="Search" style={{border: "1px solid #ccc"}}
                    value={searchInput} onChange={handleInputChange}
                />
                <div className="input-group-append">
                    <div className="input-group-text">
                        <i className="mdi mdi-filter-outline"></i>
                    </div>
                </div>
            </div>
            <div style={{height:"400px", overflowY:"auto"}}>
                {
                    // (activeTab === 'plan' ? planList : activeTab === 'service' ? serviceList : activeTab === 'asset' ? assetList : planList)  && (activeTab === 'plan' ? planList : activeTab === 'service' ? serviceList : activeTab === 'asset' ? assetList : planList).length > 0 ?
                    filteredData && filteredData.length > 0 ?
                    <>
                        {
                            // (activeTab === 'plan' ? planList : activeTab === 'service' ? serviceList : activeTab === 'asset' ? assetList : planList) .map((product) => (
                            filteredData.map((product) => (
                                <button type="button" className="list-group-item list-group-item-action grow p-0">
                                    <div className="col-12 p-0">
                                        <div className="card-box p-0 cardbg">
                                            <div className="col-12 p-0">
                                                <div className="row col-12 p-0">
                                                    <div className="col-12 text-left table-responsive">
                                                        <table className="w-100 table table-border mb-0 height60">
                                                            <tr>
                                                                <td align="center" width="5%" align="center">
                                                                    {
                                                                        activeTab === 'plan' ?
                                                                        <input type="radio" id={product?.planId} name="selectedCatalogCard"
                                                                            checked={(Number(product?.planId) === Number(selectedPlanCard))} 
                                                                            onChange={(e) => { handleSelectCard(product,e) }}
                                                                        />
                                                                        :
                                                                        <input type="checkbox" id={`mandatory${activeTab === 'service' ? product?.service : product?.assetId}`} value={product?.isSelected} 
                                                                            checked={product?.isSelected === 'Y' ? true : false}
                                                                            onChange={(e) => { handleSelectCard(product,e) }}
                                                                        />
                                                                    }
                                                                </td>
                                                                <td className="font-14 bold" width="30%">{(activeTab === 'plan' ? product?.planName : activeTab === 'service' ? product?.serviceName : activeTab === 'asset' ? product?.assetName : product?.planName)}</td>
                                                                <td className="font-12 bold" width="30%">Service Type: {product?.serviceTypeDesc?.description}</td>
                                                                <td className="font-12 bold" width="15%">RC: {USNumberFormat(product?.totalRc)}</td>
                                                                <td className="font-12 bold" width="15%">NRC: {USNumberFormat(product?.totalNrc)}</td>
                                                                <td width="5%" align="center" className='d-none'>
                                                                    <a  data-toggle="modal" data-target="#viewplan">
                                                                        <i className="fas fa-info-circle text-danger"></i>
                                                                    </a>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </div>
                                                </div>
                                                <hr></hr>                                                                                 
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))
                        }
                    </>
                    :
                    <span className="msg-txt">No {activeTab === 'plan' ? 'Plan' : activeTab === 'service' ? 'Service' : activeTab === 'asset' ? 'Asset' : 'Plan'} Available</span>
                }
            </div>
        </div>
    )
}

export default PlanServiceAssetAddonList