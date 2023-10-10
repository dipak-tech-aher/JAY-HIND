import React from 'react'
import accountCreation from "../../assets/images/acct-creation.svg";
import CustomerAddressForm from '../Address/CustomerAddressForm';

const CustomerAccountAddressForm = (props) => {

    const { addressLookUpRef, countries, accountData, error, accountAddress } = props?.data
    const { setError, setAccountAddress, setAddressLookUpRef, handleSameAsCustomerAddressDetailsChange } = props?.handler

    return (
        <div className="cmmn-skeleton skel-cr-cust-form">
            <div className="form-row">
                <div className="col-md-2 skel-cr-lft-sect-img">
                    <div className="skel-step-process"><span>Account Creation</span></div>
                    <img src={accountCreation} alt="" className="img-fluid" width="250" height="250" />
                </div>
                <div className="col-md-10 skel-cr-rht-sect-form">
                    {/* <p>Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy.</p> */}
                    <hr className="cmmn-hline" />
                    {
                        accountData?.isAccountCreate === 'Y' ?
                            <>
                                <div className="row col-md-12 mt-3 pl-0">
                                    <div className="custom-control custom-checkbox">
                                        <input type="checkbox" className="custom-control-input" id="sameAsCustomerAddress" checked={accountAddress?.sameAsCustomerAddress === 'Y' ? true : false} onChange={(e) => handleSameAsCustomerAddressDetailsChange(e.target.checked)} />
                                        <label className="custom-control-label" htmlFor="sameAsCustomerAddress">Billing address same as customer address</label>
                                    </div>
                                </div>
                                <div className="row col-md-12 mt-3 pl-0">
                                    {addressLookUpRef && countries &&
                                        <CustomerAddressForm
                                            data={{
                                                addressData: accountAddress
                                            }}
                                            countries={countries}
                                            lookups={{
                                                addressElements: addressLookUpRef
                                            }}
                                            error={error}
                                            setError={setError}
                                            handler={{ setAddressData: setAccountAddress, setAddressLookUpRef }}
                                        />
                                    }
                                </div>

                            </>
                            :
                            <></>
                    }
                </div>
            </div>
        </div>
    )
}

export default CustomerAccountAddressForm;