import React from 'react'
import { USNumberFormat } from '../../common/util/util'

const SelectedCatalogCard = (props) => {

    const { selectedCatalog } = props?.data
    
    return (
        <div className="table-responsive bg-white p-0 shadow">
            <table className="table table-bordered table-centered mb-0 border">
                <thead className="thead-light">
                    <tr>
                        <th width="60%"><h5>Selected Products</h5></th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {
                            selectedCatalog && selectedCatalog?.catalogId && 
                            <td  style={{height:"200px",verticalAlign:"top !important", overflowY:"auto"}} className="bg-secondary">
                                <div className="col-12 row p-0">
                                    <div className="col-12 p-0">
                                        <div className="card autoheight m-2">
                                            <div className="card-header bg-light border">
                                                <div className="card-widgets">
                                                </div>
                                                <h5 className="card-title mb-0 text-dark pb-1">{selectedCatalog?.catalogName}
                                                    <span className="float-right badge badge-info badgefont mr-2 font-12">Catalog</span>
                                                </h5>
                                                <div className="row col-12">
                                                    <div className="col pl-0">
                                                        <small>Service Type: {selectedCatalog?.serviceTypeDesc?.description}</small>
                                                    </div>
                                                    <div className="col">
                                                        Total RC: {USNumberFormat(selectedCatalog?.totalRc)}
                                                    </div>
                                                    <div className="col">
                                                        Total NRC: {USNumberFormat(selectedCatalog?.totalNrc)}
                                                    </div>
                                                </div>
                                                <div id="cardCollpase5" className="collapse show">
                                                    <div className="card-body">
                                                        <div className="row col-12">
                                                            <hr></hr>
                                                            <div className="row col-12 bg-gray"> 
                                                                {
                                                                    selectedCatalog?.planMap && selectedCatalog?.planMap.length > 0 && selectedCatalog?.planMap.map((plan) => (
                                                                        <div className="col-3 p-1">
                                                                            <div className="border p-2 bg-white">
                                                                                <div className="col-12 row p-0">
                                                                                    <div className="col-10 text-left p-0">
                                                                                        {plan?.planDetails && plan?.planDetails.length > 0 && plan?.planDetails[0]?.planName}
                                                                                    </div>
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
                                                                    selectedCatalog?.serviceMap && selectedCatalog?.serviceMap.length > 0 && selectedCatalog?.serviceMap.map((service) => (
                                                                        <div className="col-3 p-1">
                                                                            <div className="border p-2 bg-white">
                                                                                <div className="col-12 row p-0">
                                                                                    <div className="col-10 text-left p-0">
                                                                                        {service?.serviceDetails && service?.serviceDetails.length > 0 && service?.serviceDetails[0]?.serviceName}
                                                                                    </div>
                                                                                    <div className="col-2 p-0"> 
                                                                                        <span className="float-right badge badge-warning p-1 badgefont text-dark">Service</span>
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
                                                                    selectedCatalog?.assetMap && selectedCatalog?.assetMap.length > 0 && selectedCatalog?.assetMap.map((asset) => (
                                                                        <div className="col-3 p-1">
                                                                            <div className="border p-2 bg-white">
                                                                                <div className="col-12 row p-0">
                                                                                    <div className="col-10 text-left p-0">
                                                                                        {asset?.assetDetails && asset?.assetDetails.length > 0 && asset?.assetDetails[0]?.assetName}
                                                                                    </div>
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
                                                                    selectedCatalog?.addonMap && selectedCatalog?.addonMap.length > 0 && selectedCatalog?.addonMap.map((addon) => (
                                                                        <div className="col-3 p-1">
                                                                            <div className="border p-2 bg-white">
                                                                                <div className="col-12 row p-0">
                                                                                    <div className="col-10 text-left p-0">
                                                                                        {addon?.addonDetails && addon?.addonDetails.length > 0 && addon?.addonDetails[0]?.addonName}
                                                                                    </div>
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
                                        </div>
                                    </div>
                                </div>
                            </td>
                        }
                    </tr>
                </tbody>
            </table>
        </div>                   
    )
} 

export default SelectedCatalogCard