import React, { useState, useEffect } from 'react'
import { NumberFormatBase } from "react-number-format";
import contactInfo from "../../assets/images/cnt-info.svg";
import CustomerAddressForm from '../Address/CustomerAddressForm';
import { toast } from 'react-toastify'
import AddressMap from '../Address/AddressMap';
import Select from 'react-select'
import LeafletControlGeocoder from '../Address/LeafletControlGeocoder';

const CustomerContactForm = (props) => {

    const { isActiveTab, isSameasCustomerAddress, customerData, customerAddress, customerContactAddressError, error, addressLookUpRef, countries, addressString, contactPreferenceLookup, selectedContactPreferences, phoneNoPrefix, phoneNumberLength } = props?.data
    const { setIsActiveTab, setError, setCustomerAddress, setAddressLookUpRef, setAddressString, fetchCountryList, setSelectedContactPreferences, setPhoneNumberLength  } = props?.handler
    const [currentLocationData, setCurrentLocationData] = useState({})
    const [latitude, setLatitude] = useState()
    const [longitude, setLongitude] = useState()
    const [mappedExtn, setMappedExtn] = useState([])
    
    // useEffect(() => {
        
    //     const success = (position) => {
    //         const lat = position.coords.latitude;
    //         const long = position.coords.longitude;
    //         console.log('lat ', lat)
    //         setLatitude(lat)
    //         setLongitude(long)
    //         const geolocationUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${long}&localityLanguage=en`
    //         fetch(geolocationUrl)
    //             .then((res) => res.json())
    //             .then((data) => { setIsActiveTab('MAP'); setCurrentLocationData(data) })
    //     }
    //     const error = () => {
    //         toast.error('Unable to fetch location')
    //     }
    //     navigator.geolocation.getCurrentPosition(success, error)
    // }, [])

    useEffect(() => {
        // console.log(customerAddress?.contactPreferences)
        contactPreferenceLookup.filter(f=> customerAddress?.contactPreferences && customerAddress?.contactPreferences?.includes(f.value)).map(v=>(
            setSelectedContactPreferences([{label: v.label, value: v.value}])
        )) 
        // if (customerAddress?.countryCode) {
        //     const countryData = countries.find((x) => x?.code === customerAddress?.country)
        //     if (countryData) {
        //         console.log('countryData==>', countryData)
        //         setPhoneNumberLength(Number(countryData?.mapping?.phoneNolength))
        //     }
        // }
        if (customerContactAddressError) {
            setIsActiveTab('FORM');
        }
    }, [])

    const handleChange = (selectedOptions) => {
        // console.log('selectedOptions',selectedOptions)
        setSelectedContactPreferences(selectedOptions)
    }

    return (
        <div className="cmmn-skeleton skel-cr-cust-form">
            <div className="form-row">
                <div className="col-md-2 skel-cr-lft-sect-img"> {/*col-md-4 skel-cr-lft-sect-img*/}
                    <div className="skel-step-process"><span>Contact Information</span></div>
                    <img src={contactInfo} alt="" className="img-fluid" width="250" height="250" />
                </div>                
                <div className="col-md-10">{/*col-md-8 skel-cr-rht-sect-form */}
                    <div className="row col-md-12 pl-0 pb-2">
                        <div className="tabbable-responsive pl-1">
                            <div className="tabbable">
                                <ul className="nav nav-tabs" id="myTab" role="tablist">
                                    <li className="nav-item">
                                        <a className={(isActiveTab === 'MAP') ? 'nav-link active' : 'nav-link'} id="work-flow-history" data-toggle="tab" href="#cpwd" role="tab" aria-controls="work-flow-history" aria-selected="false"
                                            onClick={() => { setIsActiveTab('MAP') }}
                                        >Address Map</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className={(isActiveTab === 'FORM') ? 'nav-link active' : 'nav-link'} id="lead-details" data-toggle="tab" href="#mprofile" role="tab" aria-controls="lead-details" aria-selected="true"
                                            onClick={() => { setIsActiveTab('FORM') }}
                                        >Address Form</a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        {/* <button onClick={handleGetCurrentLocation} className="btn waves-effect waves-light btn-primary next action-button" >Use Current Location</button>      */}
                    </div>
                    <div className="row col-md-12 pl-0">
                        {countries && isActiveTab === 'FORM' &&
                            <CustomerAddressForm
                                data={{
                                    addressData: customerAddress,
                                    addressString,
                                    sameAsCustomerAddress: isSameasCustomerAddress
                                }}
                                countries={countries}
                                lookups={{
                                    addressElements: addressLookUpRef
                                }}
                                error={error}
                                setError={setError}
                                handler={{
                                    setAddressData: setCustomerAddress,
                                    setAddressLookUpRef
                                }}
                            />
                        }
                    </div>
                    {isActiveTab === 'MAP' &&
                        <LeafletControlGeocoder
                            data={{
                                addressData: customerAddress,
                                latitude,
                                longitude,
                                countries
                            }}
                            lookups={{
                                addressElements: addressLookUpRef
                            }}
                            error={error}
                            setError={setError}
                            handler={{
                                setAddressData: setCustomerAddress,
                                setAddressLookUpRef,
                                setAddressString,
                                fetchCountryList
                            }}
                        />
                    }
                    <hr className="cmmn-hline pt-2"></hr>
                    <div className="row mt-1 col-md-12">
                        <div className="col-xl-7 col-lg-12 col-md-12 col-xs-12">
                            <div className="form-group">
                                <label htmlFor="field-1" className="control-label">Mobile Number<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                <div className="form-inline">
                                    {/* <input className="form-control form-inline mr-1" style={{ width: "25%" }} type="text" id="code" value={"+" + customerAddress?.countryCode} disabled /> */}
                                    <Select
                                        id="extn"
                                        menuPortalTarget={document.body} 
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}                                        
                                        options={phoneNoPrefix}
                                        isMulti={false}
                                        className='w-18-per'
                                        value={[{ label: customerAddress?.countryCode, value: customerAddress?.countryCode}] || mappedExtn}
                                        onChange={(e) => {
                                            setMappedExtn(e)
                                            let phoneNoLen
                                            phoneNoPrefix.filter((s) => {
                                                if (s.value === e.value) {
                                                    phoneNoLen = s.phoneNolength
                                                }
                                            })
                                            
                                     
                                            setPhoneNumberLength(phoneNoLen)
                                            setCustomerAddress({ ...customerAddress, countryCode: e.value,  contactNbr: '' })
                                            setError({ ...error, extn: "" })
                                        }}>
                                        
                                    </Select>
                                    <NumberFormatBase
                                        type="text"
                                        placeholder="Enter Your Mobile Number"
                                        className={`form-control  ${(error.contactNbr ? "input-error" : "")}`}
                                        value={customerAddress.contactNbr}
                                        maxLength={phoneNumberLength}
                                        onChange={(e) => {
                                            setError({ ...error, contactNbr: '' })
                                            setCustomerAddress({ ...customerAddress, contactNbr: e.target.value })
                                        }}
                                        style={{ width: "78%" }}
                                    />
                                    <span className="errormsg">{error.contactNbr ? error.contactNbr : ""}</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-xl-6 col-lg-12 col-md-12 col-xs-12">
                            <div className="form-group">
                                <label htmlFor="email" className="control-label">Email <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                <input type="email" defaultValue={customerAddress?.email} className={`form-control mr-1${(error.email ? "input-error" : "")}`} id="email" placeholder="Email"
                                    maxLength="50"
                                    onChange={(e) => {
                                        if (e.target.value.match(/^[A-Za-z0-9._]+@[A-Za-z0-9.-]+$/)) {
                                            setError({ ...error, email: '' })
                                            setCustomerAddress({ ...customerAddress, email: e.target.value })
                                        } else {
                                            setError({ ...error, email: 'Please enter valid email id' })
                                        }
                                    }} />
                                <span className="errormsg">{error.email ? error.email : ""}</span>
                            </div>
                        </div>
                        <div className="col-xl-6 col-lg-12 col-md-12 col-xs-12">
                            <div className="form-group">
                                <label htmlFor="contactPreferences" className="control-label">Contact Preference <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                <Select
                                    placeholder="Select Contact Preference"
                                    components={{
                                        IndicatorSeparator: () => null
                                    }}
                                    isMulti
                                    defaultValue={selectedContactPreferences.length === 0 ? [] : selectedContactPreferences}
                                    closeMenuOnSelect={true}
                                    value={selectedContactPreferences}
                                    options={contactPreferenceLookup}
                                    getOptionLabel={option => `${option.label || ''}`}
                                    onChange={handleChange}
                                    name="state"

                                    menuPortalTarget={document.body} 
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    
                                />  
                                <span className="errormsg">{error.contactPreferences ? error.contactPreferences : ""}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CustomerContactForm;