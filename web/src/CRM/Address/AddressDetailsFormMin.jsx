import React, { useEffect, useState } from 'react'
import { useTranslation } from "react-i18next";

import { get } from '../../common/util/restUtil'
import { properties } from '../../properties'

const AddressDetailsEditableMin = (props) => {
    const { t } = useTranslation(); let title = props?.title;
    const countries = props?.countries
    let addressData = props?.data?.addressData
    let setAddressData = props?.handler?.setAddressData
    const error = props?.error
    const setError = props?.setError
    const setAddressLookUpRef = props?.handler?.setAddressLookUpRef
    const [postCode, setPostCode] = useState('')
    const [postCodeError, setPostCodeError] = useState('')

    useEffect(() => {
        console.log("from useeffect", addressData)
    }, [addressData])

    useEffect(() => {
        setPostCodeError("");
        if (postCode && postCode.trim() != "") {
            const delayDebounceFn = setTimeout(() => {
                
                get(properties.ADDRESS_LOOKUP_API + '?postCode=' + postCode)
                    .then((resp) => {
                        if (resp && resp.data) {
                            setAddressLookUpRef(resp.data)
                            if (resp.data.length > 0) {
                                let addData = resp.data[0];
                                const countryData = countries?.find(x => x.code == addData.country);
                                setAddressData({
                                    ...addressData,
                                    country: addData.country,
                                    state: addData.state,
                                    district: addData.district,
                                    city: addData.city,
                                    countryCode: countryData?.mapping?.countryCode
                                });
                                setError({ ...{} });
                            } else {
                                setPostCodeError("Postcode details not available");
                                setAddressData({
                                    ...addressData,
                                    country: "",
                                    state: "",
                                    district: "",
                                    city: ""
                                });
                            }
                        }
                    }).catch((error) => {
                        console.log(error)
                    })
                    .finally()
            }, 1000)

            return () => clearTimeout(delayDebounceFn)
        }
    }, [postCode])

    const getCountryName = (code) => {
        return countries?.find(x => x.code == code)?.description;
    }

    return (
        <div className="row form-outline">
            <h5>{props.title && title && title !== null && title !== undefined ? t(title) : t("customer_address")}</h5>
            <div className="col-md-12">
                <fieldset className="form-modal-group">
                    <form>
                        {/* <div className="form-row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="address1" className="col-form-label">Address Line 1 <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <input type="text" value={addressData?.address1} className={`form-control ${(error.address1 ? "input-error" : "")}`} id="address1" placeholder="Flat/House/Unit No"
                                        maxLength="15"
                                        onChange={(e) => {
                                            setError({ ...error, address1: '' })
                                            setAddressData({ ...addressData, address1: e.target.value })
                                        }}
                                    />
                                    <span className="errormsg">{error.address1 ? error.address1 : ""}</span>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="address2" className="col-form-label">Address Line 2 <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <input type="text" className={`form-control ${(error.address2 ? "input-error" : "")}`}
                                        value={addressData?.address2} id="address2" placeholder="Street/Road/Junction"
                                        maxLength="20"
                                        onChange={e => {
                                            setAddressData({ ...addressData, address2: e.target.value })
                                            setError({ ...error, address2: '' })
                                        }} />
                                    <span className="errormsg">{error.address2 ? error.address2 : ""}</span>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="simpang" className="col-form-label">Address Line 3 <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <input type="text" value={addressData?.address3} className={`form-control ${(error.address3 ? "input-error" : "")}`} id="address3" placeholder="Area/Location"
                                        maxLength="50"
                                        onChange={e => {
                                            setAddressData({ ...addressData, address3: e.target.value })
                                            setError({ ...error, address3: '' })
                                        }} />
                                    <span className="errormsg">{error.address3 ? error.address3 : ""}</span>
                                </div>
                            </div>
                        </div> */}
                        <div className="row">
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="postcode" className="col-form-label">Post code/Zip Code <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <input type="text" value={addressData?.postcode} className={`form-control ${(error.postcode ? "input-error" : "")}`} id="postcode" placeholder="type to search..."
                                        maxLength="50"
                                        onChange={e => {
                                            setAddressData({ ...addressData, postcode: e.target.value })
                                            setPostCode(e.target.value)
                                            setError({ ...error, postcode: '' })
                                        }} />
                                    <span className="errormsg">{error.postcode ? error.postcode : ""}</span>
                                    <span className="errormsg">{postCodeError ? postCodeError : ""}</span>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="country" className="col-form-label">Country <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <input type="text" value={getCountryName(addressData?.country)} className={`form-control ${(error.country ? "input-error" : "")}`} id="country" placeholder="Country"
                                        maxLength="50"
                                        onChange={e => {
                                            setAddressData({ ...addressData, country: e.target.value })
                                            setError({ ...error, country: '' })
                                        }} readOnly />
                                    <span className="errormsg">{error.country ? error.country : ""}</span>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="state" className="col-form-label">State <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <input type="text" value={addressData?.state} className={`form-control ${(error.state ? "input-error" : "")}`} id="state" placeholder="State"
                                        maxLength="50"
                                        onChange={e => {
                                            setAddressData({ ...addressData, state: e.target.value })
                                            setError({ ...error, state: '' })
                                        }} readOnly />
                                    <span className="errormsg">{error.state ? error.state : ""}</span>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="district" className="col-form-label">District <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <input type="text" value={addressData?.district} className={`form-control ${(error.district ? "input-error" : "")}`} id="district" placeholder="District"
                                        maxLength="50"
                                        onChange={e => {
                                            setAddressData({ ...addressData, district: e.target.value })
                                            setError({ ...error, district: '' })
                                        }} readOnly />
                                    <span className="errormsg">{error.district ? error.district : ""}</span>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group">
                                    <label htmlFor="city" className="col-form-label">City <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    <input type="text" value={addressData?.city} className={`form-control ${(error.city ? "input-error" : "")}`} id="city" placeholder="City"
                                        maxLength="50"
                                        onChange={e => {
                                            setAddressData({ ...addressData, city: e.target.value })
                                            setError({ ...error, city: '' })
                                        }} readOnly />
                                    <span className="errormsg">{error.city ? error.city : ""}</span>
                                </div>
                            </div>
                        </div>
                    </form>
                </fieldset>
            </div>
        </div>

    )

}
export default AddressDetailsEditableMin;