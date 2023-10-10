import React, { useState } from 'react';
import AddressDetailsFormView from '../../../Address/AddressDetailsFormView';
import DetailsCommonTable from './DetailsCommonTable';
import moment from 'moment';
import useDropDownArea from '../../../../common/header/useDropDownArea';

const DetailsTabPane = (props) => {

    const [display, setDisplay] = useDropDownArea('active-status');

    const { manageServiceRef } = props.data;

    const type = manageServiceRef.current?.source ? manageServiceRef.current.source : '';
    return (
        <div className="card border">
            <section className="triangle col-12 p-0">
                <div className="row col-12">
                    <h5 id="list-item-2" className="pl-1">Service Details</h5>
                </div>
            </section>
            <div className="container-fluid">
                <div className="pt-2">
                    <div className="row col-12">
                    <div className="col-3">
                            <div className="form-group  p-0 m-0">
                                <label htmlFor="inputName" className="col-form-label">Service No</label>
                                <p>{manageServiceRef.current.serviceNo}</p>
                            </div>
                        </div>
                        <div className="col-3">
                            <div className="form-group  p-0 m-0">
                                <label htmlFor="inputName" className="col-form-label">Service Name</label>
                                <p>{manageServiceRef.current.serviceName}</p>
                            </div>
                        </div>
                        <div className="col-3">
                            <div className="form-group">
                                <label htmlFor="inputState" className="col-form-label">Service Type</label>
                                <p>{manageServiceRef.current?.srvcTypeDesc?.description}</p>
                            </div>
                        </div>
                        <div className="col-3">
                            <div className="form-group">
                                <label htmlFor="inputState" className="col-form-label">Service Created on</label>
                                <p>{manageServiceRef.current?.createdAt ? moment(manageServiceRef.current?.createdAt).format('DD-MM-YYYY') : '-'}</p>
                            </div>
                        </div>
                        <div className="col-2">
                            <div className="form-group">
                                <label htmlFor="inputState" className="col-form-label">Service Status &nbsp;</label>

                                <span id="active-status" className={`dropdown ${display && "show"}`} >
                                    <span className="badge badge-outline-success font-17 text-capitalize" aria-expanded="false">
                                        {manageServiceRef.current?.serviceStatus?.description.toLowerCase()}
                                        <i className="ml-0  font-17 text-primary mdi mdi-arrow-down-drop-circle-outline cursor-pointer d-none" onClick={() => { setDisplay(!display) }} />
                                    </span>

                                    <div className={`dropdown-menu dropdown-menu-right dropdown ${display && "show"}`} >
                                        <div className="card" style={{ minWidth: "200px" }}>
                                            <div className="card-body border">
                                                <form id="bar-unbar-form">
                                                    <div className="d-flex flex-column justify-content-center mt-0">
                                                        <label className="col-form-label p-0">Change to Inactive</label>
                                                        <select id="reason" className="form-control">

                                                            <option>Inactive Reason</option>
                                                            <option>Reason 1</option>
                                                            <option>Reason 2</option>
                                                        </select>
                                                    </div>
                                                    <div className="mt-2 d-flex flex-row justify-content-center">
                                                        <button type="button" className="btn btn-outline-secondary waves-effect waves-light btn-sm">Cancel</button>
                                                        <button type=" button" className="btn btn-outline-primary text-primary btn-sm  waves-effect waves-light ml-2">Active</button>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </span>
                            </div>

                        </div>
                        <div className="col-3">
                            <div className="form-group">
                                <label htmlFor="inputState" className="col-form-label">Service Start Date</label>
                                <p>{manageServiceRef.current?.activationDate ? moment(manageServiceRef.current?.activationDate).format('DD-MM-YYYY') : '-'}</p>
                            </div>
                        </div>
                        <div className="col-3">
                            <div className="form-group">
                                <label htmlFor="inputState" className="col-form-label">Service End Date</label>
                                <p>{manageServiceRef.current?.expiryDate ? moment(manageServiceRef.current?.expiryDate).format('DD-MM-YYYY') : '-'}</p>
                            </div>
                        </div>
                        <div className="col-3">
                            <div className="form-group">
                                <label htmlFor="inputState" className="col-form-label">Service Created by</label>
                                <p>{manageServiceRef.current?.createdByName?.firstName} {manageServiceRef.current?.createdByName?.lastName}</p>
                            </div>
                        </div>
                    </div>
                    {
                       
                           
                            (
                                <>
                                    {
                                        manageServiceRef.current?.productDetails  && //manageServiceRef.current?.productDetails.map((plan) => (
                                            <>
                                                <div className="row col-12 p-0">
                                                    <div className="col-12 pl-2 bg-light border"><h5 className="text-primary">Product</h5> </div>
                                                </div>
                                                <DetailsCommonTable tableRow={manageServiceRef.current?.productDetails} type={type} />
                                            </>
                                        //))
                                    }                                    
                                </>
                            )
                    }
                </div>
                <AddressDetailsFormView
                    data={{
                        title: "Installation Address",
                        addressData: manageServiceRef.current?.serviceAddress
                    }}
                />
                {/* <div className="row col-12 p-0">
                    <div className="row col-12 p-0 mt-2">
                        <div className="col-12 bg-light border pl-2"><h5 className="text-primary">Service Property</h5> </div>
                    </div>
                    <div className="row col-12">
                        <div className="col-md-3">
                            <div className="form-group  p-0 m-0">
                                <label htmlFor="inputName" className="col-form-label">Service Property 1</label>
                                <p>{manageServiceRef.current?.properties?.property1}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="inputName" className="col-form-label">Service Property 2</label>
                                <p>{manageServiceRef.current?.properties?.property2}</p>
                            </div>
                        </div>
                        <div className="col-md-3">
                            <div className="form-group">
                                <label htmlFor="inputName" className="col-form-label">Service Property 3</label>
                                <p>{manageServiceRef.current?.properties?.property3}</p>
                            </div>
                        </div>
                    </div>
                </div> */}
            </div>
        </div>
    )
}

export default DetailsTabPane;