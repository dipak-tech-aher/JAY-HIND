import React from 'react';
import moment from 'moment';
import ChargePreviewTable from './ChargePreviewTable';

const PlanServiceAddonAssetView = (props) => {
    const { viewData, source } = props.data;
    return (
        <>
            {
                source === 'Plan' ?
                    <>
                        <div className="table-responsive">
                            <table className="table table-striped text-center border">
                                <thead>
                                    <tr>
                                        <th scope="col" className="text-white text-left" style={{ backgroundColor: "#60769c" }}>Plan Name</th>
                                        <th scope="col" className="text-white text-left" style={{ backgroundColor: "#0f3780" }}>{viewData?.planName}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row" className="text-left">Service Type</th>
                                        <td className="text-left">{viewData?.serviceTypeDesc?.description}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className="text-left">Start Date </th>
                                        <td className="text-left">{viewData?.startDate ? moment(viewData.startDate).format('DD MMM YYYY') : ""}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className="text-left">End Date</th>
                                        <td className="text-left">{viewData?.endDate ? moment(viewData.endDate).format('DD MMM YYYY') : ""}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className="text-left">Status</th>
                                        <td className="text-left">{viewData?.statusDesc?.description}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <section className="triangle"><h5 id="list-item-1" className="pl-2 pb-1">Plan Property</h5></section>
                        <div className="col-12 p-2">
                            <div className="table-responsive">
                                <table className="table table-bordered table-striped table-hover rowfy">
                                    <thead>
                                        <tr>
                                            <th>Plan Property</th>
                                            <th>Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            !!viewData?.property?.length && viewData.property.map((data, index) => (
                                                <tr key={index}>
                                                    <td><p>{data?.property}</p></td>
                                                    <td><p>{data?.description}</p></td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="table-responsive">
                            <section className="triangle"><h5 id="list-item-1" className="pl-2 pb-1">Charge Details</h5></section>
                        </div>
                        <ChargePreviewTable tableData={viewData?.planCharges} />
                    </>
                    : (
                        <div className="col-12 p-0">
                            {
                                !!viewData?.length ? viewData.map((data, index) => (
                                    <div key={index} className="accordion custom-accordion" id={`custom-accordion-${source.toLowerCase()}-${data[`${source.toLowerCase()}Id`]}`}>

                                        <div className="card mb-0" key={index}>
                                            <div className="card-header border" id={`heading${data[`${source.toLowerCase()}Id`]}`}>
                                                <h5 className="m-0 position-relative text-white">
                                                    <a className="custom-accordion-title text-reset d-block collapsed" data-toggle="collapse" href={`#${source.toLowerCase()}collapse${data[`${source.toLowerCase()}Id`]}`} aria-expanded="false" aria-controls={`#${source.toLowerCase()}collapse${data[`${source.toLowerCase()}Id`]}`}>
                                                        {source} Name {++index}
                                                        <i className="mdi mdi-chevron-down accordion-arrow"></i>
                                                    </a>
                                                </h5>
                                            </div>

                                            <div id={`${source.toLowerCase()}collapse${data[`${source.toLowerCase()}Id`]}`} className="collapse" aria-labelledby={`heading${data[`${source.toLowerCase()}Id`]}`} data-parent={`#custom-accordion-${source.toLowerCase()}-${data[`${source.toLowerCase()}Id`]}`}>
                                                <div className="card-body">
                                                    <div className="table-responsive">
                                                        <table className="table table-striped text-center border">
                                                            <tbody>
                                                                <tr>
                                                                    <th scope="col" className="text-left">{source} Name</th>
                                                                    <th scope="col" className="text-left">{data[`${source.toLowerCase()}Name`]}</th>
                                                                </tr>
                                                                <tr>
                                                                    <th scope="col" className="text-left">{source} Type</th>
                                                                    <th scope="col" className="text-left">{data?.serviceTypeDesc?.description}</th>
                                                                </tr>
                                                                <tr>
                                                                    <th scope="row" className="text-left">Start Date </th>
                                                                    <td className="text-left">{data?.startDate ? moment(data.startDate).format('DD MMM YYYY') : ""}</td>
                                                                </tr>
                                                                <tr>
                                                                    <th scope="row" className="text-left">End Date</th>
                                                                    <td className="text-left">{data?.endDate ? moment(data.endDate).format('DD MMM YYYY') : ""}</td>
                                                                </tr>
                                                                <tr>
                                                                    <th scope="row" className="text-left">Status </th>
                                                                    <td className="text-left">{data?.statusDesc?.description}</td>
                                                                </tr>
                                                                <tr>
                                                                    <th scope="row" className="text-left">Volume Allowed </th>
                                                                    <td className="text-left">{data?.volumeAllowed === 'Y' ? 'Yes' : 'No'}</td>
                                                                </tr>
                                                                <tr>
                                                                    <th scope="row" className="text-left">Multiple Selection</th>
                                                                    <td className="text-left">{data?.multipleSelection === 'Y' ? 'Yes' : 'No'}</td>
                                                                </tr>
                                                                {
                                                                    source === 'Asset' && (
                                                                        <>
                                                                            <tr>
                                                                                <th scope="row" className="text-left">Asset Type</th>
                                                                                <td className="text-left">{data?.assetType}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <th scope="row" className="text-left">Asset Status</th>
                                                                                <td className="text-left">{data?.assetStatus}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <th scope="row" className="text-left">Asset Segment</th>
                                                                                <td className="text-left">{data?.assetSegment}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <th scope="row" className="text-left">Asset Manufacturer</th>
                                                                                <td className="text-left">{data?.assetManufacturer}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <th scope="row" className="text-left">Asset Warranty Period</th>
                                                                                <td className="text-left">{data?.assetWarrantyPeriod}</td>
                                                                            </tr>
                                                                        </>
                                                                    )
                                                                }
                                                                <tr>
                                                                    <th scope="row" className="text-left">Mandatory</th>
                                                                    <td className="text-left">{data?.mandatory === 'Y' ? 'Yes' : 'No'}</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    <section className="triangle"><h5 id="list-item-1" className="pl-2 pb-1">{source} Property</h5></section>
                                                    <div className="col-12 p-2">
                                                        <div className="table-responsive">
                                                            <table className="table table-bordered table-striped table-hover rowfy">
                                                                <thead>
                                                                    <tr>
                                                                        <th>{source} Property</th>
                                                                        <th>Description</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {
                                                                        !!data?.property?.length && data.property.map((propertyData, index) => (
                                                                            <tr key={index}>
                                                                                <td><p>{propertyData?.property}</p></td>
                                                                                <td><p>{propertyData?.description}</p></td>
                                                                            </tr>
                                                                        ))
                                                                    }
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                    <div className="table-responsive">
                                                        <section className="triangle"><h5 id="list-item-1" className="pl-2 pb-1">Charge Details</h5></section>
                                                    </div>
                                                    <ChargePreviewTable tableData={data[`${source.toLowerCase()}Charges`]} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                                    : (
                                        <p class="skel-widget-warning">No records found!!!</p>
                                    )
                            }
                        </div>
                    )
            }
        </>
    )
}

export default PlanServiceAddonAssetView;