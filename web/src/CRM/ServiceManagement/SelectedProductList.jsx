import React, { useEffect, useState } from 'react'
import { unstable_batchedUpdates } from 'react-dom'
import { USNumberFormat } from '../../common/util/util'

const SelectedProductList = (props) => {

    const { selectedCatalog, selectedPlan, selectedServiceList, selectedAssetList } = props.data
    const { handleRemoveProduct } = props?.handler

    const [totalCount,setTotalCount] = useState({
        totalRc: 0,
        totalNrc: 0
    })

    useEffect(() => {
        let totalRc = 0
        let totalNrc = 0
        unstable_batchedUpdates(() => {
            totalRc = (Number(selectedCatalog?.totalRc) || 0) + (Number(selectedPlan?.totalRc) || 0)
            totalNrc = (Number(selectedCatalog?.totalNrc) || 0) + (Number(selectedPlan?.totalNrc) || 0)
            for(const service of selectedServiceList) {
                totalRc = totalRc + (Number(service?.totalRc) || 0)
                totalNrc = totalNrc + (Number(service?.totalNrc) || 0)
            }
            for(const asset of selectedAssetList) {
                totalRc = totalRc + (Number(asset?.totalRc) || 0)
                totalNrc = totalNrc + (Number(asset?.totalNrc) || 0)
            }
           setTotalCount({totalRc: totalRc, totalNrc: totalNrc}) 
        })
    },[selectedCatalog, selectedPlan, selectedServiceList, selectedAssetList])

    return (
        <div className="col">
            <div className="table-responsive bg-white p-0 shadow">
                <table className="table table-bordered table-centered mb-0 border">
                    <thead className="thead-light">
                        <tr>
                            <th width="60%"><h5>Selected Products</h5></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                <div style={{height:"400px", overflowY:"auto"}}>
                                {
                                    selectedCatalog && selectedCatalog?.catalogId &&
                                    <div className="card autoheight mb-0">
                                        <div className="card-header bg-light border">
                                            <div className="card-widgets">
                                                <div style={{cursor:"pointer"}} data-toggle="remove" onClick={() => handleRemoveProduct('catalog',selectedCatalog) }><i className="mdi mdi-close"></i></div>
                                            </div>
                                            <h5 className="card-title mb-0 text-dark">{selectedCatalog?.catalogName}  
                                                <span className="float-right badge badge-info badgefont mr-2 font-12">Catalog</span>
                                            </h5>
                                            <small>Service Type: {selectedCatalog?.serviceTypeDesc?.description}</small>
                                        </div>
                                        <div id="cardCollpase5" className="collapse show">
                                            <div className="card-body">
                                                <div className="row col-12">
                                                    <hr></hr>
                                                    <div className="col-4 text-center">
                                                        <small></small>
                                                    </div>
                                                    <div className="col-4 text-center">
                                                        <small>RC: {USNumberFormat(selectedCatalog?.totalRc)}</small>
                                                    </div>
                                                    <div className="col-4 text-center">
                                                        <small>NRC: {USNumberFormat(selectedCatalog?.totalNrc)}</small>
                                                    </div>
                                                </div> 
                                            </div>
                                        </div>
                                    </div>
                                }
                                {
                                    selectedPlan && selectedPlan?.planId &&
                                    <div className="card autoheight mb-0">
                                        <div className="card-header bg-light border">
                                            <div className="card-widgets">
                                                <div style={{cursor:"pointer"}} data-toggle="remove" onClick={() => handleRemoveProduct('plan',selectedPlan) }><i className="mdi mdi-close"></i></div>
                                            </div>
                                            <h5 className="card-title mb-0 text-dark">{selectedPlan?.planName}
                                                <span className="float-right badge badge-blue badgefont mr-2 font-12">Plan</span>
                                            </h5>
                                            <small>Service Type: {selectedPlan?.serviceTypeDesc?.description}</small>
                                        </div>
                                        <div id="cardCollpase5" className="collapse show">
                                            <div className="card-body">
                                                <div className="row col-12">
                                                <hr></hr>
                                                <div className="col-4 text-center"><small></small>
                                                </div>
                                                <div className="col-4 text-center">
                                                    <small>RC: {USNumberFormat(selectedPlan?.totalRc)}</small>
                                                </div>
                                                <div className="col-4 text-center">
                                                <small>NRC: {USNumberFormat(selectedPlan?.totalNrc)}</small></div>
                                                </div> 
                                            </div>
                                        </div>
                                    </div>
                                }
                                {
                                    selectedServiceList && selectedServiceList.length > 0 && selectedServiceList.map((service) => (
                                        <div className="card autoheight mb-0">
                                            <div className="card-header bg-light border">
                                                <div className="card-widgets">
                                                    <div style={{cursor:"pointer"}} data-toggle="remove" onClick={() => handleRemoveProduct('service',service) }><i className="mdi mdi-close"></i></div>
                                                </div>
                                                <h5 className="card-title mb-0 text-dark">{service?.serviceName} 
                                                    <span className="float-right badge badge-warning badgefont mr-2 font-12 text-dark">Service</span>
                                                </h5>
                                                <small>Service Type: {service?.serviceTypeDesc?.description}</small>
                                            </div>
                                            <div id="cardCollpase5" className="collapse show">
                                                <div className="card-body">
                                                    <div className="row col-12">
                                                        <hr></hr>
                                                        <div className="col-4 text-center">
                                                            <small></small>
                                                        </div>
                                                        <div className="col-4 text-center">
                                                            <small>RC: {USNumberFormat(service?.totalRc)}</small>
                                                        </div>
                                                        <div className="col-4 text-center">
                                                            <small>NRC: {USNumberFormat(service?.totalNrc)}</small>
                                                        </div>
                                                    </div> 
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                                {
                                    selectedAssetList && selectedAssetList.length > 0 && selectedAssetList.map((asset) => (
                                        <div className="card autoheight mb-0">
                                            <div className="card-header bg-light border">
                                                <div className="card-widgets">
                                                    <div style={{cursor:"pointer"}} data-toggle="remove" onClick={() => handleRemoveProduct('asset',asset) }><i className="mdi mdi-close"></i></div>
                                                </div>
                                                <h5 className="card-title mb-0 text-dark">{asset?.assetName}
                                                    <span className="float-right badge badge-danger badgefont mr-2 font-12">Asset</span>
                                                </h5>
                                                <small>Service Type: {asset?.serviceTypeDesc?.description}</small>
                                            </div>
                                                <div id="cardCollpase5" className="collapse show">
                                                    <div className="card-body">
                                                        <div className="row col-12">
                                                            <hr></hr>
                                                            <div className="col-4 text-center">
                                                                <small></small>
                                                            </div>
                                                            <div className="col-4 text-center">
                                                                <small>RC: {USNumberFormat(asset?.totalRc)}</small>
                                                            </div>
                                                            <div className="col-4 text-center">
                                                                <small>NRC: {USNumberFormat(asset?.totalNrc)}</small>
                                                            </div>
                                                        </div> 
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                                </div>
                            </td>
                        </tr>
                        <tr className="bg-secondary">
                            <th scope="row bg-gray">
                                <div className="row col-12">
                                    <div className="col-4 ">Total</div>
                                    <div className="col-4 text-center">RC: {USNumberFormat(totalCount?.totalRc)}</div>
                                    <div className="col-4 text-center">NRC: {USNumberFormat(totalCount?.totalNrc)}</div>
                                </div>
                            </th>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default SelectedProductList