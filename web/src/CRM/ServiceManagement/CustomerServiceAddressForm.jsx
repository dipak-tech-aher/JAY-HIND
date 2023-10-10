import React from 'react'
import addService from "../../assets/images/add-services.svg";
import CustomerAddressForm from '../Address/CustomerAddressForm';
import { makeFirstLetterLowerOrUppercase } from '../../common/util/util';

const CustomerServiceAddressForm = (props) => {

    const { serviceData, serviceAddress, error, addressLookUpRef, countries, appsConfig } = props?.data
    const { setServiceData, setError, setServiceAddress, setAddressLookUpRef, handleSameAsCustomerServiceAddressDetailsChange } = props?.handler

    return (
        <div className="cmmn-skeleton skel-cr-cust-form">
            <div className="form-row">
                <div className="col-md-2 skel-cr-lft-sect-img">
                    <div className="skel-step-process"><span>Add Service Address</span></div>
                    <img src={addService} alt="" className="img-fluid" width="250" height="250" />
                </div>
                <div className="col-md-10 skel-cr-rht-sect-form">
                    <div className="form-group">
                        <div className="custom-control custom-checkbox">
                            <input type="checkbox" className="custom-control-input" id="isNeedQuoteOnly" checked={serviceData?.isNeedQuoteOnly === 'Y' ? true : false} onChange={(e) => setServiceData({ ...serviceData, isNeedQuoteOnly: e.target.checked ? 'Y' : 'N' })} />
                            <label className="custom-control-label" htmlFor="isNeedQuoteOnly">Need Quote Only</label>
                        </div>
                        <hr className="cmmn-hline" />
                        {
                            serviceData?.isNeedQuoteOnly === 'N' ?
                                <>
                                    <div className="row col-md-12 mt-3 pl-0">
                                        <div className="custom-control custom-checkbox">
                                            <input type="checkbox" className="custom-control-input" id="sameAsCustomerAddress" checked={serviceAddress?.sameAsCustomerAddress === 'Y' ? true : false} onChange={(e) => handleSameAsCustomerServiceAddressDetailsChange(e.target.checked)} />
                                            <label className="custom-control-label" htmlFor="sameAsCustomerAddress">Service address same as {appsConfig && appsConfig.clientFacingName && appsConfig.clientFacingName['Customer'.toLowerCase()] && makeFirstLetterLowerOrUppercase(appsConfig?.clientFacingName['Customer'.toLowerCase()],'lowerCase') || 'customer'} address</label>
                                        </div>
                                    </div>
                                    <div className="row col-md-12 mt-3 pl-0">
                                        {addressLookUpRef && countries &&
                                            <CustomerAddressForm
                                                data={{
                                                    addressData: serviceAddress
                                                }}
                                                countries={countries}
                                                lookups={{
                                                    addressElements: addressLookUpRef
                                                }}
                                                error={error}
                                                setError={setError}
                                                handler={{ setAddressData: setServiceAddress, setAddressLookUpRef }}
                                            />
                                        }
                                    </div>

                                </>
                                :
                                <>
                                </>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CustomerServiceAddressForm;