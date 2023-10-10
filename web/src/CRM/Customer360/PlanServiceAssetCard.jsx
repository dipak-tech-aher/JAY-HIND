import React, { useEffect, useState } from 'react';
import moment from 'moment';

const PlanServiceAssetCard = ({ data, handleOnManageService, activeService, setActiveService  }) => {

    const [type, setType] = useState('Plan')
    useEffect(() => {
        if (data.hasOwnProperty('assetId')) {
            setType('Asset');
        }
        else if (data.hasOwnProperty('serviceId')) {
            setType('Service');
        }
    }, [data])

    return (
        <div className={"item px-2" + ((activeService && activeService !== null && activeService !== 0 && Number(activeService) === Number(data?.connectionId)) ? "bg-secondary rainbow p-1" : "")}>
            <div className="card border" onClick={() => {setActiveService(data?.connectionId)}}>
                <div className="card-header bg-primary bold text-white">
                    {data[`${type.toLowerCase()}Name`]}
                    <span className={`float-right p-1 badge ${type === 'Plan' ? 'badge-blue' : type === 'Service' ? 'badge-warning' : 'badge-danger'}`}>
                        {type}
                    </span>
                </div>
                <div className="card-body">
                    <div className="row ml-0">
                        <div className="col-12">
                            <div className="row col-12">
                                <div className="col-6">
                                    <label className="col-form-label">Service Type </label>
                                    <p>{data?.serviceTypeDesc?.description}</p>
                                </div>
                                <div className="col-6">
                                    <label className="col-form-label">Status </label>
                                    {/* <p>{data?.status}</p> */}
                                    <p>{data?.connectionStatus}</p>
                                </div>
                            </div>
                            <div className="row col-12 mb-3">
                                <div className="col-6">
                                    <label className="col-form-label">Start Date </label>
                                    {/* <p>{data?.startDate ? moment(data.startDate).format('DD-MM-YYYY') : '-'}</p> */}
                                    <p>{data?.serviceStartDate ? moment(data?.serviceStartDate).format('DD-MM-YYYY') : '-'}</p>
                                </div>
                                <div className="col-6">
                                    <label className="col-form-label">End Date </label>
                                    {/* <p>{data?.endDate ? moment(data.endDate).format('DD-MM-YYYY') : '-'}</p> */}
                                    <p>{data?.serviceStopDate ? moment(data?.serviceStopDate).format('DD-MM-YYYY') : '-'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="col-12 text-center p-1 mb-3">
                            <button type="button" className="btn btn-sm btn-primary p-1" onClick={() => {setActiveService(data?.connectionId); handleOnManageService(data, type)}}>
                                Manage {type}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default PlanServiceAssetCard;