import React from 'react'
import { USNumberFormat } from '../../../common/util/util'

const SelectedPlanServiceAssetAddonCard = (props) => {

    const { selectedPlan, selectedServiceList, selectedAssetList } = props?.data

    return (
        <>
            <div className="col-12 pt-0 pr-0 mt-2">
                <div className=" bg-light border p-0 m-0">
                    <h5 className="text-primary pl-2">Plan, Service and Asset</h5> 
                </div>
            </div>
            <div className="table-responsive bg-white pt-0 shadow">
                <table className="table table-bordered table-centered mb-0 border">
                    <tr className="bg-secondary">
                        <th scope="row">
                            <div className="row col-12 pt-0">
                                {
                                    selectedPlan && selectedPlan?.planId && 
                                    <div className="col-4 p-0">
                                        <div className="card autoheight m-2">
                                            <div className="card-header bg-light border">
                                                <div className="card-widgets">
                                                </div>
                                                <h5 className="card-title mb-0 text-dark pb-1">{selectedPlan?.planName}
                                                    <span className="float-right badge badge-blue badgefont mr-2 font-12">Plan</span>
                                                </h5>
                                                <small>Service Type: {selectedPlan?.serviceTypeDesc?.description}</small>
                                            </div>
                                            <div id="cardCollpase5" className="collapse show">
                                                <div className="card-body">
                                                    <div className="row col-12">
                                                        <hr></hr>
                                                        <div className="col-4 text-center">
                                                            <small></small>
                                                        </div>
                                                        <div className="col-4 text-center">
                                                            <small>RC: {USNumberFormat(selectedPlan?.totalRc)}</small>
                                                        </div>
                                                        <div className="col-4 text-center">
                                                            <small>NRC: {USNumberFormat(selectedPlan?.totalNrc)}</small>
                                                        </div>
                                                    </div> 
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                }
                                {
                                    selectedServiceList && selectedServiceList?.length > 0 && selectedServiceList.map((service) => (
                                        <div className="col-4 p-0">
                                            <div className="card autoheight m-2">
                                                <div className="card-header bg-light border">
                                                    <div className="card-widgets">   
                                                    </div>
                                                    <h5 className="card-title mb-0 text-dark pb-1">{service?.serviceName} 
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
                                        </div>
                                    ))
                                }
                                {
                                    selectedAssetList && selectedAssetList?.length > 0 && selectedAssetList.map((asset) => (
                                        <div className="col-4 p-0">
                                            <div className="card autoheight m-2">
                                                <div className="card-header bg-light border">
                                                    <div className="card-widgets">
                                                    </div>
                                                    <h5 className="card-title mb-0 text-dark pb-1">{asset?.assetName}
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
                                        </div>
                                    ))
                                }
                                
                            </div>
                        </th>
                    </tr>
                </table>
            </div>	
        </>
    )
} 

export default SelectedPlanServiceAssetAddonCard