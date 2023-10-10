import React, { useState, useEffect } from 'react'
import accountCreation from "../../assets/images/acct-creation.svg";
import { NumberFormatBase } from "react-number-format";
import Select from 'react-select'

const CustomerAccountForm = (props) => {

    const { genderLookup, countries, idTypeLookup, accountData, error, accountAddress, selectedCustomerType,phoneNoPrefix } = props?.data
    const { setAccountData, handleAccountInputChange, handleSameAsCustomerDetailsChange, setAccountAddress } = props?.handler
    const [phoneNumberLength, setPhoneNumberLength] = useState(20);
    const [mappedExtn, setMappedExtn] = useState([])

    useEffect(() => {
        if (accountAddress?.countryCode) {
            const countryData = countries.find((x) => x?.code === accountAddress?.country)
            if (countryData) {
                setPhoneNumberLength(Number(countryData?.mapping?.phoneNolength) || 20)
            }
        }
    }, [props])

    return (
        <div className="cmmn-skeleton skel-cr-cust-form">
            <div className="form-row">
                <div className="col-md-4 skel-cr-lft-sect-img">
                    <div className="skel-step-process"><span>Account Creation</span></div>
                    <img src={accountCreation} alt="" className="img-fluid" width="250" height="250" />
                </div>
                <div className="col-md-8 skel-cr-rht-sect-form">
                    <div className="form-group">
                        <div className="custom-control custom-checkbox">
                            <input type="checkbox" className="custom-control-input" id="isCreateAccount" checked={accountData?.isAccountCreate === 'Y' ? true : false} onChange={(e) => setAccountData({ ...accountData, isAccountCreate: e.target.checked ? 'Y' : 'N' })} />
                            <label className="custom-control-label" htmlFor="isCreateAccount">Create An Account?</label>
                        </div>
                    </div>
                    {/* <p>Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy.</p> */}
                    <hr className="cmmn-hline" />
                    {
                        accountData?.isAccountCreate === 'Y' ?
                            <>
                                <div className="row col-md-12 mt-3 pl-0">
                                    <div className="custom-control custom-checkbox">
                                        <input type="checkbox" className="custom-control-input" id="sameAsCustomerData" checked={accountData?.sameAsCustomerData === 'Y' ? true : false} onChange={(e) => handleSameAsCustomerDetailsChange(e.target.checked)} />
                                        <label className="custom-control-label" htmlFor="sameAsCustomerData">Use Customer Details</label>
                                    </div>
                                </div>
                                <div className="row col-md-12 mt-3 pl-0">
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label htmlFor="firstName" className="control-label">First Name<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <input type="text" id="firstName" className={`form-control ${(error.firstName ? "input-error" : "")}`} value={accountData.firstName} placeholder="Surname"
                                                maxLength="80"
                                                onChange={handleAccountInputChange}
                                            />
                                            <span className="errormsg">{error.firstName ? error.firstName : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label htmlFor="lastName" className="control-label">Last Name<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <input type="text" id="lastName" className={`form-control ${(error.lastName ? "input-error" : "")}`} value={accountData.lastName} placeholder="Forename"
                                                maxLength="40"
                                                onChange={handleAccountInputChange}
                                            />
                                            <span className="errormsg">{error.lastName ? error.lastName : ""}</span>
                                        </div>
                                    </div>
                                    {/* <div className="col-6">
                                                    <div className="form-group">
                                                        <label htmlFor="dob" className="control-label">Date of Birth<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                        <input type="date" id="dob" className={`form-control ${(error.dob ? "input-error" : "")}`} value={accountData.dob} placeholder="Forename"
                                                            onChange={handleAccountInputChange}
                                                        />
                                                        <span className="errormsg">{error.dob ? error.dob : ""}</span>
                                                    </div>
                                                </div> */}
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label htmlFor="gender" className="control-label">Gender<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <select id="gender" className={`form-control ${(error.gender ? "input-error" : "")}`}
                                                value={accountData.gender}
                                                onChange={handleAccountInputChange}
                                            >
                                                <option value="">Select Gender</option>
                                                {
                                                    genderLookup && genderLookup.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                            <span className="errormsg">{error.gender ? error.gender : ""}</span>
                                        </div>
                                    </div>
                                    {
                                        selectedCustomerType !== 'REG' &&
                                        <>
                                            <div className="col-6">
                                                <div className="form-group">
                                                    <label htmlFor="registrationNbr" className="control-label">Registration Number<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                    <input type="text" id="registrationNbr" className={`form-control ${(error.registrationNbr ? "input-error" : "")}`} value={accountData.registrationNbr} placeholder="Surname"
                                                        maxLength="80"
                                                        onChange={handleAccountInputChange}
                                                    />
                                                    <span className="errormsg">{error.registrationNbr ? error.registrationNbr : ""}</span>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="form-group">
                                                    <label htmlFor="registrationDate" className="control-label">Registration Date<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                    <input type="date" id="registrationDate" className={`form-control ${(error.registrationDate ? "input-error" : "")}`} value={accountData.registrationDate} placeholder="Forename"
                                                        onChange={handleAccountInputChange}
                                                    />
                                                    <span className="errormsg">{error.registrationDate ? error.registrationDate : ""}</span>
                                                </div>
                                            </div>
                                        </>
                                    }
                                    {console.log('phoneNumberLength ', phoneNumberLength)}
                                    <div className="col-6">

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
                                                    value={[{ label: accountAddress?.countryCode, value: accountAddress?.countryCode}] || mappedExtn}
                                                    onChange={(e) => {
                                                        setMappedExtn(e)
                                                        let phoneNoLen
                                                        phoneNoPrefix.filter((s) => {
                                                            if (s.value === e.value) {
                                                                phoneNoLen = s.phoneNolength
                                                            }
                                                        })   
                                                        setPhoneNumberLength(phoneNoLen)
                                                        setAccountAddress({ ...accountAddress, countryCode: e.value,  contactNbr: '' })
                                                    }}>
                                                    
                                                </Select>
                                                <NumberFormatBase
                                                    id="contactNbr"
                                                    type="text"
                                                    placeholder="Enter Your Mobile Number"
                                                    className={`form-control  ${(error.contactNbr ? "input-error" : "")}`}
                                                    value={accountData.contactNbr}
                                                    maxLength={phoneNumberLength}
                                                    onChange={handleAccountInputChange}
                                                    style={{ width: "72%" }}
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* <div className="form-group">
                                            <label htmlFor="field-1" className="control-label">Mobile Number<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="form-inline">
                                                <input className="form-control form-inline mr-1" style={{ width: "25%" }} type="text" id="code" value={"+" + accountAddress?.countryCode} disabled />
                                                <NumberFormatBase
                                                    id="contactNbr"
                                                    type="text"
                                                    placeholder="Enter Your Mobile Number"
                                                    className={`form-control  ${(error.contactNbr ? "input-error" : "")}`}
                                                    value={accountData.contactNbr}
                                                    onChange={handleAccountInputChange}
                                                    maxLength={phoneNumberLength}
                                                    style={{ width: "72%" }}
                                                />
                                                <span className="errormsg">{error.contactNbr ? error.contactNbr : ""}</span>
                                            </div>
                                        </div> */}
                                    </div>
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label htmlFor="email" className="control-label">Email <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <input type="email" defaultValue={accountData?.email} className={`form-control ${(error.email ? "input-error" : "")}`} id="email" placeholder="Email"
                                                maxLength="50"
                                                onChange={handleAccountInputChange} />
                                            <span className="errormsg">{error.email ? error.email : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label htmlFor="idType" className="control-label">ID Type<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <select id="idType" className={`form-control ${(error.idType ? "input-error" : "")}`}
                                                value={accountData.idType}
                                                onChange={handleAccountInputChange}
                                            >
                                                <option value="">Select ID Type</option>
                                                {
                                                    idTypeLookup && idTypeLookup.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))
                                                }
                                            </select>
                                            <span className="errormsg">{error.idType ? error.idType : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <div className="form-group">
                                            <label htmlFor="idValue" className="control-label">ID Number<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <input type="text" id="idValue" className={`form-control ${(error.idValue ? "input-error" : "")}`} value={accountData.idValue} placeholder="Forename"
                                                maxLength="40"
                                                onChange={handleAccountInputChange}
                                            />
                                            <span className="errormsg">{error.idValue ? error.idValue : ""}</span>
                                        </div>
                                    </div>
                                </div>
                            </>
                            :
                            <>
                            </>
                    }
                </div>
            </div>
        </div>
    )
}

export default CustomerAccountForm;