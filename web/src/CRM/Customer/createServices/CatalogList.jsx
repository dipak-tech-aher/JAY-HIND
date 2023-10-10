import React, { useEffect, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { USNumberFormat } from '../../../common/util/util'

const CatalogList = (props) => {

    const { catalogList, selectedCatalog, selectedCatalogCard, filteredData } = props?.data
    const { setSelectedCatalog, setSelectedCatalogCard, setFilteredData } = props?.handler
    const [searchInput,setSearchInput] = useState("")
    

    useEffect(() => {
        unstable_batchedUpdates(() => {
            setFilteredData(catalogList || [])
            setSelectedCatalogCard(selectedCatalog?.catalogId || "")
        })
    },[])

    const handleSelectCatalog = (data) => {
        unstable_batchedUpdates(() => {
            setSelectedCatalogCard(Number(data?.catalogId))
            setSelectedCatalog(data)
        })
    }

    const handleInputChange = (e) => {
        if(e.target.value === '')
        {
            setSearchInput(e.target.value)
            setFilteredData(catalogList)
            return
        }
        unstable_batchedUpdates(() => {
            setSearchInput(e.target.value)
            const filteredList = catalogList.filter((value) => {
                return value?.catalogName.toString().toLowerCase().indexOf(e.target.value.toLowerCase()) >= 0
            })
            setFilteredData(filteredList)
        })
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
                    filteredData && filteredData.length > 0 ?
                    <>
                        {
                            filteredData.map((catalog) => (
                                <button type="button" className="list-group-item list-group-item-action grow p-0">
                                    <div className="col-12 p-0">
                                        <div className="card-box p-0 cardbg">
                                            <div className="col-12 p-0">
                                                <div className="row col-12 p-0">
                                                    <div className="col-12 text-left table-responsive">
                                                        <table className="w-100 table table-border mb-0 height60">
                                                            <tr>
                                                                <td align="center" width="5%" align="center">
                                                                    <input type="radio" id={catalog?.catalogId} name="selectedCatalogCard"
                                                                        checked={(Number(catalog?.catalogId) === Number(selectedCatalogCard))} 
                                                                        onChange={(e) => { handleSelectCatalog(catalog) }}
                                                                    />
                                                                </td>
                                                                <td className="font-14 bold" width="30%">{catalog?.catalogName}</td>
                                                                <td className="font-12 bold" width="30%">Service Type: {catalog?.serviceTypeDesc?.description}</td>
                                                                <td className="font-12 bold" width="15%">Total RC: {USNumberFormat(catalog?.totalRc)}</td>
                                                                <td className="font-12 bold" width="15%">Total NRC: {USNumberFormat(catalog?.totalNrc)}</td>
                                                                <td width="5%" align="center" className='d-none'>
                                                                    <a  data-toggle="modal" data-target="#viewcatelog"><i className="fas fa-info-circle text-danger"></i></a>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </div>
                                                </div>
                                                <hr></hr>
                                                <div /*style={{width:"550px", overflowX:"auto"}}*/>
                                                    <div className="row col-12 bg-gray">
                                                    {
                                                        catalog?.planMap && catalog?.planMap.length > 0 && catalog?.planMap.map((plan) => (
                                                            <div className="col-3 p-1">
                                                                <div className="border p-1 bg-white productbox">
                                                                    <div className="col-12 row p-0">
                                                                        <div className="col-10 text-left p-0">{plan?.planDetails && plan?.planDetails.length > 0 && plan?.planDetails[0]?.planName}</div>
                                                                        <div className="col-2 p-0"> 
                                                                            <span className="float-right badge badge-blue p-1 badgefont">Plan</span>
                                                                        </div>
                                                                    </div>
                                                                    <hr></hr>
                                                                    <div className="row col-12">
                                                                        <div className="col-6 text-left p-0">
                                                                            <small>RC: {USNumberFormat(plan?.totalRc)}</small>
                                                                        </div>
                                                                        <div className="col-6 text-left p-0">
                                                                            <small>NRC: {USNumberFormat(plan?.totalNrc)}</small>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
                                                    {
                                                        catalog?.serviceMap && catalog?.serviceMap.length > 0 && catalog?.serviceMap.map((service) => (
                                                            <div className="col-3 p-1">
                                                                <div className="border p-1 bg-white productbox">
                                                                    <div className="col-12 row p-0">
                                                                        <div className="col-10 text-left p-0">{service?.serviceDetails && service?.serviceDetails.length > 0 && service?.serviceDetails[0]?.serviceName}</div>
                                                                        <div className="col-2 p-0"> 
                                                                            <span className="float-right badge badge-warning p-1 text-dark ">Service</span>
                                                                        </div>
                                                                    </div>
                                                                    <hr></hr>
                                                                    <div className="row col-12">
                                                                        <div className="col-6 text-left p-0">
                                                                            <small>RC: {USNumberFormat(service?.totalRc)}</small>
                                                                        </div>
                                                                        <div className="col-6 text-left p-0">
                                                                            <small>NRC: {USNumberFormat(service?.totalNrc)}</small>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
                                                    {
                                                        catalog?.assetMap && catalog?.assetMap.length > 0 && catalog?.assetMap.map((asset) => (
                                                            <div className="col-3 p-1">
                                                                <div className="border p-1 bg-white productbox">
                                                                    <div className="col-12 row p-0">
                                                                        <div className="col-10 text-left p-0">{asset?.assetDetails && asset?.assetDetails.length > 0 && asset?.assetDetails[0]?.assetName}</div>
                                                                        <div className="col-2 p-0"> 
                                                                            <span className="float-right badge badge-danger p-1 badgefont">Asset</span>
                                                                        </div>
                                                                    </div>
                                                                    <hr></hr>
                                                                    <div className="row col-12">
                                                                        <div className="col-6 text-left p-0">
                                                                            <small>RC: {USNumberFormat(asset?.totalRc)}</small>
                                                                        </div>
                                                                        <div className="col-6 text-left p-0">
                                                                            <small>NRC: {USNumberFormat(asset?.totalNrc)}</small>
                                                                        </div>
                                                                    </div>
                                                                </div> 
                                                            </div> 
                                                        ))
                                                    } 
                                                    {
                                                        catalog?.addonMap && catalog?.addonMap.length > 0 && catalog?.addonMap.map((addon) => (
                                                            <div className="col-3 p-1">
                                                                <div className="border p-1 bg-white productbox">
                                                                    <div className="col-12 row p-0">
                                                                        <div className="col-10 text-left p-0">{addon?.addonDetails && addon?.addonDetails.length > 0 && addon?.addonDetails[0]?.addonName}</div>
                                                                        <div className="col-2 p-0"> 
                                                                            <span className="float-right badge badge-primary p-1 badgefont">Addon</span>
                                                                        </div>
                                                                    </div>
                                                                    <hr></hr>
                                                                    <div className="row col-12">
                                                                        <div className="col-6 text-left p-0">
                                                                            <small>RC: {USNumberFormat(addon?.totalRc)}</small>
                                                                        </div>
                                                                        <div className="col-6 text-left p-0">
                                                                            <small>NRC: {USNumberFormat(addon?.totalNrc)}</small>
                                                                        </div>
                                                                    </div>
                                                                </div> 
                                                            </div> 
                                                        ))
                                                    }
                                                    </div>	
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                
                            ))
                        }
                    </>
                    :
                <span className="msg-txt">No Catalog Available</span>
                }
                </div>
        </div>
    )
}

export default CatalogList