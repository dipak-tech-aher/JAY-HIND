import React, { useEffect, useState } from 'react'

import { get } from '../../common/util/restUtil'
import { properties } from '../../properties'

const CustomerAddressForm = (props) => {
    const countries = props?.countries
    let addressData = props?.data?.addressData
    let sameAsCustomerAddress = props?.data?.sameAsCustomerAddress
    let setAddressData = props?.handler?.setAddressData
    const error = props?.error
    const setError = props?.setError
    const setAddressLookUpRef = props?.handler?.setAddressLookUpRef
    const [addressElements, setAddressElements]= useState([]) 
    const [postCode, setPostCode] = useState(addressData?.postcode)
    const [postCodeError, setPostCodeError] = useState('')

    const [districtLookup, setDistrictLookup] = useState([])
    const [stateLookup, setStateLookup ]= useState([])
    const [postCodeLookup, setPostCodeLookup] = useState([])
    const [cityLookup, setCityLookup] = useState([])

    console.log('addressData ', addressData)
    useEffect(() => {        
       
            let city = [], district=[], state=[]
        get(properties.ADDRESS_LOOKUP_API)
        .then((resp) => {
            if (resp && resp.data) {
                setAddressElements(resp.data)   
                if(!addressData?.postcode || sameAsCustomerAddress === true){         
                    for (let e of resp.data) {
                        if (e.postCode === addressData?.postcode && e.country === addressData?.country) {
                            if (!district.includes(e.district)) {
                                district.push(e.district)
                            }
                            if (!state.includes(e.state)) {
                                state.push(e.state)
                            }
                            if (!city.includes(e.city)) {
                                city.push(e.city)
                            }
                        }                      
                    }                 
                setDistrictLookup(district)
                setStateLookup(state)
                setCityLookup(city)
            }
        }
        }).catch((error) => {
            console.log(error)
        });
             
         
    }, [sameAsCustomerAddress])

    const handleOnChange=(e)=>{
        const target = e.target
        // console.log(target.id)
        let district = [], state=[], city =[]
        if(target.id === 'country'){            
            addressElements && addressElements !== null && addressElements !== undefined && addressElements.map((a) => {
                if (a?.country === target.value) {
                    if (!district.includes(a?.district)) {
                        district.push(a?.district)
                    }
                    if (!state.includes(a.state)) {
                        state.push(a.state)
                    }
                    if (!city.includes(a.city)) {
                        city.push(a.city)
                    }
                } 
                
                if (addressData.district != ''){
                    setDistrictLookup(district)
                }  
                if (addressData.city != ''){
                    setCityLookup(city)
                }             
            })
            setStateLookup(state)
        }
        if(target.id === 'postcode'){
            addressElements && addressElements !== null && addressElements !== undefined && addressElements.map((a) => {               
                if (a?.postCode ===  target.value) {
                    if (!state.includes(a?.state)) {
                        state.push(a?.state)
                    }
                }              
            })
            setStateLookup(state)
        }
        if(target.id === 'state'){
            addressElements?.map((a) => {
                // console.log(a?.state ,  target.value)
                if (a?.state ===  target.value) {
                    if (!district.includes(a.district)) {
                        district.push(a.district)
                    }
                    if (!city.includes(a?.city)) {
                        city.push(a?.city)
                    }
                }                
            }) 
            setDistrictLookup(district)
            // setCityLookup(city)
        }
        if(target.id === 'district'){
            addressElements?.map((a) => {
                if (a?.district ===  target.value) {                
                    if (!city.includes(a?.city)) {
                        city.push(a?.city)
                    }
                }                
            })
            setCityLookup(city)
        }
    }

    const handleClear=()=>{
        setDistrictLookup([])
        setStateLookup([])
        setCityLookup([])
        setPostCode('')
    }
    useEffect(() => {
        setPostCodeError("");
        if (postCode && postCode.trim() !== "") {
            const delayDebounceFn = setTimeout(() => {          
                get(properties.ADDRESS_LOOKUP_API + '?postCode=' + postCode)
                    .then((resp) => {
                        if (resp && resp.data) {
                            // console.log('address lookup ', resp.data)
                            setAddressLookUpRef(resp.data)
                            if (resp.data.length > 0) {
                                let addData = resp.data[0];
                                const countryData = countries?.find(x => x.code == addData.country);
                                const state = [], district=[], city=[]
                                resp.data.map(m => {                           
                                   if (!state.includes(m.state)) {
                                        state.push(m.state)
                                    }
                                    if (!district.includes(m?.district)) {
                                        district.push(m?.district)
                                    }
                                    if (!city.includes(m?.city)) {
                                        city.push(m?.city)
                                    }
                                })
                                setCityLookup(city)
                                setStateLookup(state)
                                setDistrictLookup(district)
                                
                                setAddressData({
                                    ...addressData,
                                    country: addData.country,
                                    state: addData.state,
                                    district: addData.district,
                                    city: addData.city,
                                    // countryCode: countryData?.mapping?.countryCode
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
            }, 2000)

            return () => clearTimeout(delayDebounceFn)
        }
    }, [postCode])

    const getCountryName = (code) => {
        return countries?.find(x => x.code == code)?.description;
    }
    return (
        <div className="row col-md-12 pl-0">
            <div className="col-md-6">
                <div className="form-group">
                    <label htmlFor="address1" className="col-form-label">Address Line 1 <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                    <input type="text" value={addressData?.address1} className={`form-control ${(error?.address1 ? "input-error" : "")}`} id="address1" placeholder="Flat/House/Unit No"
                        maxLength="100"
                        onChange={(e) => {
                            setError({ ...error, address1: '' })
                            setAddressData({ ...addressData, address1: e.target.value })
                        }}
                    />
                    <span className="errormsg">{error?.address1 ? error?.address1 : ""}</span>
                </div>
            </div>
            <div className="col-md-6">
                <div className="form-group">
                    <label htmlFor="address2" className="col-form-label">Address Line 2 <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                    <input type="text" className={`form-control ${(error?.address2 ? "input-error" : "")}`}
                        value={addressData?.address2} id="address2" placeholder="Street/Road/Junction"
                        maxLength="100"
                        onChange={e => {
                            setAddressData({ ...addressData, address2: e.target.value })
                            setError({ ...error, address2: '' })
                        }} />
                    <span className="errormsg">{error?.address2 ? error?.address2 : ""}</span>
                </div>
            </div>
            <div className="col-md-6">
                <div className="form-group">
                    <label htmlFor="simpang" className="col-form-label">Address Line 3 </label>
                    <input type="text" value={addressData?.address3} className='form-control' id="address3" placeholder="Area/Location"
                        maxLength="100"
                        onChange={e => {
                            setAddressData({ ...addressData, address3: e.target.value })
                        }} />
                </div>
            </div>
            <div className="col-md-6">
                <div className="form-group">
                    <label htmlFor="postcode" className="col-form-label">Post code/Zip Code <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                    <input type="text" value={addressData?.postcode} className={`form-control ${(error?.postcode ? "input-error" : "")}`} id="postcode" placeholder="type to search..."
                        maxLength="10"
                        onChange={e => {
                            setAddressData({ ...addressData, postcode: e.target.value })
                            setPostCode(e.target.value)
                            setError({ ...error, postcode: '' })
                        }} />
                     {/* <select id="postCode" className={`form-control ${(error.postcode ? "input-error" : "")}`} value={addressData.postcode}
                        onChange={(e) => {
                            setError({ ...error, postcode: '' })
                            setAddressData({ ...addressData, postcode: e.target.value, postCodeDesc: e.target.options[e.target.selectedIndex].label })
                        }
                        }>
                        <option value="">Select Postcode</option>
                        {
                            postCodeLookup && postCodeLookup.map((e) => (
                                <option key={e.code} value={e.code}>{e.description}</option>
                            ))
                        }
                    </select> */}
                    <span className="errormsg">{error?.postcode ? error?.postcode : ""}</span>
                    <span className="errormsg">{postCodeError ? postCodeError : ""}</span>
                </div>
            </div>
            <div className="col-md-6">
                <div className="form-group">
                    <label htmlFor="country" className="col-form-label">Country <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                    {/* <input type="text" value={getCountryName(addressData?.country)} className={`form-control ${(error?.country ? "input-error" : "")}`} id="country" placeholder="Country"
                        maxLength="50"
                        onChange={e => {
                            setAddressData({ ...addressData, country: e.target.value })
                            setError({ ...error, country: '' })
                        }} readOnly /> */}
                      <select id="country" className={`form-control ${(error.country ? "input-error" : "")}`} value={addressData.country}
                        onChange={e => { 
                            setAddressData({ ...addressData, country: e.target.value, countryDesc: e.target.options[e.target.selectedIndex].label, postcode: '' }); 
                            setError({ ...error, country: '' })
                            handleClear()
                            handleOnChange(e)
                            }}>
                        <option value="">Select Country</option>
                        {/* <option key="country1" value="BRUNEI DARUSSALAM">Brunei Darussalam</option> */}
                        {countries && countries.map((e) => (
                            <option key={e.code} value={e.code}>{e.description}</option>
                        ))}
                    </select>
                    <span className="errormsg">{error?.country ? error?.country : ""}</span>
                </div>
            </div>
            <div className="col-md-6">
                <div className="form-group">
                    <label htmlFor="state" className="col-form-label">State <span className="text-danger font-20 pl-1 fld-imp">*</span></label>               
                    {/* {console.log('stateLookup ', stateLookup)} */}
                    <select id="state"
                        value={addressData.state}
                        className={`form-control ${(error.state ? "input-error" : "")}`}
                        onChange={e => {
                            setAddressData({ ...addressData, state: e.target.value, stateDesc: e.target.options[e.target.selectedIndex].label })
                            setError({ ...error, state: '' })
                            handleOnChange(e)
                        }} >
                        <option value="">Select State</option>
                        {
                            stateLookup && stateLookup.map((e) => (
                                <option key={e} value={e}>{e}</option>
                            ))
                        }
                    </select>
                    <span className="errormsg">{error?.state ? error?.state : ""}</span>
                </div>
            </div>
            <div className="col-md-6">
                <div className="form-group">
                    <label htmlFor="district" className="col-form-label">District <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                    {/* <input type="text" value={addressData?.district} className={`form-control ${(error?.district ? "input-error" : "")}`} id="district" placeholder="District"
                        maxLength="50"
                        onChange={e => {
                            setAddressData({ ...addressData, district: e.target.value })
                            setError({ ...error, district: '' })
                        }} /> */}
                       <select id="district" className={`form-control ${(error.district ? "input-error" : "")}`} value={addressData.district !== "" ? addressData.district : addressData.districtDesc}
                            onChange={(e) => {
                                setError({ ...error, district: "" })
                                setAddressData({ ...addressData, district: e.target.value, districtDesc: e.target.options[e.target.selectedIndex].label  })
                                handleOnChange(e)
                            }
                            }>
                            <option value="">Select District</option>
                            {
                                districtLookup && districtLookup.map((e) => (
                                    <option key={e} value={e}>{e}</option>
                                ))
                            }
                        </select>
                    <span className="errormsg">{error?.district ? error?.district : ""}</span>
                </div>
            </div>
            <div className="col-md-6">
                <div className="form-group">
                    <label htmlFor="city" className="col-form-label">City <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                    {/* <input type="text" value={addressData?.city} className={`form-control ${(error?.city ? "input-error" : "")}`} id="city" placeholder="City"
                        maxLength="50"
                        onChange={e => {
                            setAddressData({ ...addressData, city: e.target.value })
                            setError({ ...error, city: '' })
                        }}  /> */}
                    <select id="city" className={`form-control ${(error.city ? "input-error" : "")}`} value={addressData.city}
                    onChange={(e) => {
                        setError({ ...error, city: "" })
                        setAddressData({ ...addressData, city: e.target.value })
                    }
                    }>
                    <option value="">Select...</option>
                    {
                        cityLookup && cityLookup.map((e) => (
                            <option key={e} value={e}>{e}</option>
                        ))
                    }
                </select>
                    <span className="errormsg">{error?.city ? error?.city : ""}</span>
                </div>
            </div>
        </div>

    )

}
export default CustomerAddressForm;