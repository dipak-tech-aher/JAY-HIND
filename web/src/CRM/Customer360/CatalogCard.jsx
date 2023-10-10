import React from 'react';
import moment from 'moment';
import { USNumberFormat } from '../../common/util/util';

const CatalogCard = ({ data, handleOnManageService, activeService, setActiveService }) => {
    return (
        <div className="col-md-6">
            <div className={"item " + ((activeService && activeService !== null && activeService !== 0 && Number(activeService) === Number(data?.connectionId)) ? "bg-secondary rainbow p-1" : "")}>
                <div className="card border" onClick={() => { setActiveService(data?.connectionId) }}>
                    <div className="card-header bg-primary bold text-white">
                        {data.catalogName}
                        <span className="float-right p-1 badge badge-info text-white">
                            Catalog
                        </span>
                    </div>
                    <div className="card-body ">
                        <div className="row ml-0">
                            <div className="col-12">
                                <div className="col-12">
                                    <div className="row pt-1">
                                        <div className="col-4 p-0">
                                            <div className="form-group  p-0 m-0">
                                                <label htmlFor="inputName" className="col-form-label pt-0">Service Type</label>
                                                <p className="p-0">{data?.serviceTypeDesc?.description}</p>
                                            </div>
                                        </div>
                                        <div className="col-4 p-0">
                                            <div className="form-group">
                                                <label htmlFor="inputState" className="col-form-label pt-0">Status</label>
                                                {/* <p className="p-0">{data?.status}</p> */}
                                                <p>{data?.connectionStatus}</p>
                                            </div>
                                        </div>
                                        <div className="col-4 p-0">
                                            <div className="form-group  p-0 m-0">
                                                <label htmlFor="inputName" className="col-form-label pt-0">Total RC</label>
                                                <p>{USNumberFormat(data?.totalRc)}</p>
                                            </div>

                                        </div>
                                        <div className="col-4 p-0">
                                            <div className="form-group">
                                                <label htmlFor="inputState" className="col-form-label pt-0">Total NRC</label>
                                                <p>{USNumberFormat(data?.totalNrc)}</p>
                                            </div>
                                        </div>
                                        <div className="col-4 p-0">
                                            <div className="form-group">
                                                <label htmlFor="inputState" className="col-form-label pt-0">Start Date</label>
                                                {/* <p>{data?.startDate ? moment(data.startDate).format('DD-MM-YYYY') : '-'}</p> */}
                                                <p>{data?.serviceStartDate ? moment(data?.serviceStartDate).format('DD-MM-YYYY') : '-'}</p>
                                            </div>
                                        </div>
                                        <div className="col-4 p-0">
                                            <div className="form-group">
                                                <label htmlFor="inputState" className="col-form-label pt-0">End Date</label>
                                                {/* <p>{data?.endDate ? moment(data.endDate).format('DD-MM-YYYY') : '-'}</p> */}
                                                <p>{data?.serviceStopDate ? moment(data?.serviceStopDate).format('DD-MM-YYYY') : '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className="col-12 text-center p-1">
                                <button type="button" className="btn btn-sm btn-primary p-1" onClick={() => { setActiveService(data?.connectionId); handleOnManageService(data, 'Catalog') }}>Manage Catalogue</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CatalogCard;