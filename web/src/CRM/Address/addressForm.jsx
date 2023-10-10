import React, { useState, useEffect } from 'react'
import { useTranslation } from "react-i18next";

const AddrForm = (props) => {
    const { t } = useTranslation();
    const countries = props?.countries
    //const locations = props.locations
    let addressData = props?.data
    let setAddressData = props?.handler
    let title = props?.title;
    const districtLookup = props?.lookups?.districtLookup
    const kampongLookup = props?.lookups?.kampongLookup // kampong is state
    const postCodeLookup = props?.lookups?.postCodeLookup

    const [districtEl, setDistrictEl] = useState([])
    const [stateEl, setStateEl] = useState([])
    const [postCodeEl, setPostCodeEl] = useState([])
    

    const addressElements = props?.lookups?.addressElements

    const addressChangeHandler = props?.lookupsHandler?.addressChangeHandler

    const error = props?.error
    const setError = props?.setError
    const setDetailsValidate = props?.setDetailsValidate
    const detailsValidate = props?.detailsValidate

    useEffect(() => {
        let district = []
        addressElements && addressElements !== null && addressElements !== undefined && addressElements.map((a) => {
            if (addressData?.village !== '' && addressData?.postCode !== '') {
                if (a?.kampong === addressData?.village && a?.postCode === addressData?.postCode) {
                    if (!district.includes(a?.district)) {
                        district.push(a?.district)
                    }
                    return <option key={a.district} value={a.district}>{a.district}</option>
                }
            } else if (addressData?.village !== '') {
                if (a?.kampong === addressData?.village) {
                    if (!district.includes(a?.district)) {
                        district.push(a?.district)
                    }
                }
            } else if (addressData?.postCode !== '') {
                if (a?.postCode === addressData?.postCode) {
                    if (!district.includes(a?.district)) {
                        district.push(a?.district)
                    }
                }
            } else {
                if (!district.includes(a?.district)) {
                    district.push(a?.district)
                }
            }
        })
        setDistrictEl(district)
    }, [addressData?.village, addressData?.postCode]);

    useEffect(() => {
        let kampong = []
        addressElements?.map((a) => {
            if (addressData?.district !== '' && addressData?.postCode !== '') {
                if (a?.district === addressData?.district && a?.postCode === addressData?.postCode) {
                    if (!kampong.includes(a.kampong)) {
                        kampong.push(a.kampong)
                    }
                }
            } else if (addressData?.district !== '') {
                if (a?.district === addressData?.district) {
                    if (!kampong.includes(a.kampong)) {
                        kampong.push(a.kampong)
                    }
                }
            } else if (addressData?.postCode !== '') {
                if (a.postCode === addressData?.postCode) {
                    if (!kampong.includes(a.kampong)) {
                        kampong.push(a.kampong)
                    }
                }
            } else {
                if (!kampong.includes(a?.kampong)) {
                    kampong.push(a.kampong)
                }
            }
        })
        setStateEl(kampong)
    }, [addressData?.district, addressData?.postCode]);

    useEffect(() => {
        let postCode = []
        addressElements?.map((a) => {
            if (addressData?.district !== '' && addressData?.village !== '') {
                if (a?.district === addressData?.district && a?.kampong === addressData?.village) {
                    if (!postCode.includes(a.postCode)) {
                        postCode.push(a.postCode)
                    }
                }
            } else if (addressData?.district !== '') {
                if (a?.district === addressData?.district) {
                    if (!postCode.includes(a.postCode)) {
                        postCode.push(a.postCode)
                    }
                }
            } else if (addressData?.village !== '') {
                if (a?.kampong === addressData?.village) {
                    if (!postCode.includes(a.postCode)) {
                        postCode.push(a.postCode)
                    }
                }
            } else {
                if (!postCode.includes(a?.postCode)) {
                    postCode.push(a.postCode)
                }
            }
        })
        setPostCodeEl(postCode)
    }, [addressData?.district, addressData?.village]);

    return (
        <div className="row ">
            <div className="col-12">
                <div className="p-2">
                    <div className="">
                        <div className="form-row">
                            <div className="col-12 pl-2 bg-light border"><h5 className="text-primary">{props.title && title && title !== null && title !== undefined ? t(title) : t("customer_address")}</h5> </div>
                        </div>
                        <div className="col-12 pr-2 pt-2">
                            <fieldset className="scheduler-border scheduler-box mt-2 bg-white border pb-2 ml-2 mr-2">
                                <form>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="flatHouseUnitNo" className="col-form-label">Flat/House/Unit No/ Block<span>*</span></label>
                                                <input type="text" value={addressData.flatHouseUnitNo} className={`form-control ${(error.flatHouseUnitNo ? "input-error" : "")}`} id="flatHouseUnitNo" placeholder="Flat/House/Unit No"
                                                    maxlength="15"
                                                    onChange={(e) => {
                                                        setError({ ...error, flatHouseUnitNo: '' })
                                                        setAddressData({ ...addressData, flatHouseUnitNo: e.target.value })
                                                    }
                                                    }
                                                />
                                                <span className="errormsg">{error.flatHouseUnitNo ? error.flatHouseUnitNo : ""}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="building" className="col-form-label">Building Name/Others</label>
                                                <input type="text" className={`form-control ${(error.building ? "input-error" : "")}`} value={addressData.building} id="building" placeholder="Building Name/Others"
                                                    maxlength="20"
                                                    onChange={e => {
                                                        setAddressData({ ...addressData, building: e.target.value })
                                                        setError({ ...error, building: '' })
                                                    }} />
                                                <span className="errormsg">{error.building ? error.building : ""}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="simpang" className="col-form-label">Street/Area<span>*</span></label>
                                                <input type="text" value={addressData.street} className={`form-control ${(error.street ? "input-error" : "")}`} id="Street" placeholder="Street"
                                                    maxlength="50"
                                                    onChange={e => {
                                                        setAddressData({ ...addressData, street: e.target.value })
                                                        setError({ ...error, street: '' })
                                                    }} />
                                                <span className="errormsg">{error.street ? error.street : ""}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="cityTown" className="col-form-label">City/Town<span>*</span></label>
                                                <input type="text" value={addressData.cityTown} className={`form-control ${(error.cityTown ? "input-error" : "")}`}
                                                    id="cityTown"
                                                    placeholder="City/Town"
                                                    maxlength="30"
                                                    onChange={e => {
                                                        setAddressData({ ...addressData, cityTown: e.target.value })
                                                        setError({ ...error, cityTown: '' })

                                                    }} />
                                                <span className="errormsg">{error.cityTown ? error.cityTown : ""}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="district" className="col-form-label">District/Province<span>*</span></label>
                                                <select id="district" className={`form-control ${(error.district ? "input-error" : "")}`} value={addressData.district}
                                                    onChange={(e) => {
                                                        setError({ ...error, district: "" })
                                                        setAddressData({ ...addressData, district: e.target.value, districtDesc: e.target.options[e.target.selectedIndex].label  })
                                                    }
                                                    }>
                                                    <option value="">Select District</option>
                                                    {
                                                        districtLookup && districtLookup.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                <span className="errormsg">{error.district ? error.district : ""}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="state" className="col-form-label">State/Region<span>*</span></label>
                                                <select
                                                    value={addressData.state}
                                                    className={`form-control ${(error.state ? "input-error" : "")}`}
                                                    onChange={e => {
                                                        setAddressData({ ...addressData, state: e.target.value, stateDesc: e.target.options[e.target.selectedIndex].label })
                                                        setError({ ...error, state: '' })

                                                    }} >
                                                    <option value="">Select State</option>
                                                    {
                                                        kampongLookup && kampongLookup.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                <span className="errormsg">{error.state ? error.state : ""}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="postCode" className="col-form-label">Post code/Zip Code<span>*</span></label>
                                                <select id="postCode" className={`form-control ${(error.postCode ? "input-error" : "")}`} value={addressData.postCode}
                                                    onChange={(e) => {
                                                        setError({ ...error, postCode: '' })
                                                        setAddressData({ ...addressData, postCode: e.target.value, postCodeDesc: e.target.options[e.target.selectedIndex].label })
                                                    }
                                                    }>
                                                    <option value="">Select Postcode</option>
                                                    {
                                                        postCodeLookup && postCodeLookup.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))
                                                    }
                                                </select>
                                                <span className="errormsg">{error.postCode ? error.postCode : ""}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label htmlFor="country" className="col-form-label">Country<span >*</span></label>
                                                <select id="country" className={`form-control ${(error.country ? "input-error" : "")}`} value={addressData.country}
                                                    onChange={e => { setAddressData({ ...addressData, country: e.target.value, countryDesc: e.target.options[e.target.selectedIndex].label }); setError({ ...error, country: '' }) }}>
                                                    <option value="">Select Country</option>
                                                    {/* <option key="country1" value="BRUNEI DARUSSALAM">Brunei Darussalam</option> */}
                                                    {countries && countries.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))}
                                                </select>
                                                <span className="errormsg">{error.country ? error.country : ""}</span>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </fieldset>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}
export default AddrForm;