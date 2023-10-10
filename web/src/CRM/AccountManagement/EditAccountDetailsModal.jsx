import React, { useState, useEffect, useRef } from 'react';
import Modal from 'react-modal';

import AddressDetailsForm from '../Address/AddressDetailsForm';
import { properties } from '../../properties';
import { get, post, put } from '../../common/util/restUtil';
import { RegularModalCustomStyles, validateEmail } from '../../common/util/util';
import BillingDetails from '../Customer360/BillingDetails';
import { string, object } from "yup";
import { toast } from 'react-toastify';
import { unstable_batchedUpdates } from 'react-dom';
import AddressDetailsEditable from '../Address/AddressDetailsFormMin';

const accountValidationSchema = object().shape({
    emailId: string().required("Email is required").email("Email is not in correct format"),
    mobileNo: string().required("Contact Number is required"),
    address1: string().required("Address Line 1 is required"),
    address2: string().required("Address Line 2 is required"),
    city: string().required("City is required"),
    postcode: string().required("Postcode is required"),
    country: string().required("Country is required"),
    state: string().required("State is required")
});

const EditAccountDetailsModal = (props) => {

    const { isEditAccountDetailsOpen, accountDetails, billableDetails } = props.data;
    console.log('accountDetails------------>',accountDetails)
    const { setIsEditAccountDetailsOpen, pageRefresh } = props.handlers;
    const [accountAddress, setAccountAddress] = useState(accountDetails?.accountAddress[0])  
    const [accountData,setAccountData] = useState(accountDetails)
   

    const addressLookup = useRef();
    const [addressLookUpRef, setAddressLookUpRef] = useState(null)
    const [districtLookup, setDistrictLookup] = useState([{}])
    const [countries, setCountries] = useState()
    const [accountDetailsError, setAccountDetailsError] = useState({});

    useEffect(() => {

        
        get(properties.MASTER_API+'/lookup?searchParam=code_type&valueParam=COUNTRY,DISTRICT,CUSTOMER_ID_TYPE')
        .then((response) => {
            if (response.data) {
                    
                    get(properties.ADDRESS_LOOKUP_API)
                        .then((resp) => {
                            if (resp && resp.data) {
                                addressLookup.current = resp.data
                                setAddressLookUpRef(resp.data)                                
                            }
                        }).catch((error) => {
                            console.log(error)
                        })
                        .finally()
                setCountries(response.data.COUNTRY)
                setDistrictLookup(response.data.DISTRICT)
            }
        })
        .catch(error => {
            console.error(error);
        }).finally()
    }, [])

    const handleOnAccountDetailsInputsChange = (e) => {
        const { target } = e;
        setAccountData({
            ...accountData,
            [target.id] : target.value
        })
        setAccountDetailsError({...accountDetailsError, [target.id]:""})
    }

    const validate = (section, schema, data) => {
        try {
            setAccountDetailsError({})
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setAccountDetailsError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    const handleOnSubmit = () => {
        const validateData={
            emailId: accountData?.emailId ? accountData?.emailId : accountData?.accountContact[0]?.emailId,
            mobileNo: accountData?.mobileNo ? accountData?.mobileNo : accountData?.accountContact[0]?.mobileNo,
            address1: accountAddress?.address1,
            address2: accountAddress?.address2,
            country: accountAddress?.country,
            postcode: accountAddress?.postcode,
            state: accountAddress?.state,
            city: accountAddress?.city,
           }

        if (validate('', accountValidationSchema, validateData)) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        
        delete accountAddress.status
        //delete accountData?.accountContact[0].status
        //delete accountData?.accountContact[0].statusDesc
        // console.log('countries===>', countries.filter(e=>e.code === accountAddress?.country)[0].mapping.countryCode)

        let requestBody = {
            details: {
                firstName: accountData?.firstName,
                lastName: accountData?.lastName,
                action: 'UPDATE',
                idType: accountData?.idType,
                idValue: accountData?.idValue,           
            },
            contact: {
                isPrimary: accountData?.isPrimary || true,
                contactType: accountData?.contactType ? accountData?.contactType : accountData?.accountContact[0].contactType,
                contactNo: accountData?.contactNo ? accountData?.contactNo : accountData?.accountContact[0]?.contactNo,
                firstName: accountData?.firstName,
                lastName: accountData?.lastName,
                emailId: accountData?.emailId ? accountData?.emailId : accountData?.accountContact[0]?.emailId,
                mobilePrefix: countries.filter(e=>e.code === accountAddress?.country)[0].mapping.countryCode,
                mobileNo : accountData?.mobileNo ? accountData?.mobileNo : accountData?.accountContact[0]?.mobileNo,
            },
            address: {
                addressNo: accountAddress?.addressNo,
                addressType: accountAddress?.addressType,
                address1: accountAddress?.address1,
                address2: accountAddress?.address2,
                address3: accountAddress?.address3,
                city: accountAddress?.city,
                district: accountAddress?.district,
                state: accountAddress?.state,
                postcode: accountAddress?.postcode,
                country: accountAddress?.country,
                isPrimary: accountAddress?.isPrimary || true,
            }
        }
        requestBody = Object.entries(requestBody).reduce((a,[k,v]) => (v ? (a[k]=v, a) : a), {})

        put(`${properties.ACCOUNT_DETAILS_API}/update/${accountData.accountUuid}`, requestBody)
            .then((response) => {
                const { status, message } = response;
                if (status === 200) {
                    toast.success(message);
                    setIsEditAccountDetailsOpen(false)
                    pageRefresh()
                }
            })
            .catch(error => {
                console.error(error);
            })
            .finally()
    }

    const handleOnCancel = () => {
        setIsEditAccountDetailsOpen(false);
    }
    const makeEnable = (e)=>{
        if(e==='mobileNo'){
            document.getElementById('mobileN').style.display = "none"
            document.getElementById('mobileNo').style.display = "block"
        }
        if(e==='emailId'){
            document.getElementById('emailI').style.display = "none"
            document.getElementById('emailId').style.display = "block"
        }
    }

    return (
        <Modal isOpen={isEditAccountDetailsOpen} contentLabel="Worflow History Modal" style={RegularModalCustomStyles}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header p-1">
                        <h4 className="modal-title">Edit Account Details</h4>
                        <button type="button" className="close" onClick={() => setIsEditAccountDetailsOpen(false)}>×</button>
                    </div>
                    <div className="modal-body bg-white">
                        <fieldset className="scheduler-border1">
                            <div className="row col-12">
                                <div className="col-md-12">
                                    <form>
                                        <div className="col-12 bg-light border mt-2"><h5 className="text-primary pl-2">Account Details </h5> </div>
                                        <div className="form-row">
                                            <div className="col-md-8">
                                                <div className="form-group">
                                                    <label htmlFor="customerTitle" className="col-form-label">Account Name</label>
                                                    <p>{accountData?.firstName +' '+accountData?.lastName}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="col-12 bg-light border">
                                                <h5 className="text-primary">Account Contact Details</h5>
                                            </div>                                            
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="lastName" className="col-form-label">First Name </label>
                                                    <input type="text" maxLength="40" className="form-control" id="firstName" onChange={handleOnAccountDetailsInputsChange} value={accountData?.firstName} />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="firstName" className="col-form-label">Last Name </label>
                                                    <input type="text" maxLength="80" className="form-control" id="lastName" onChange={handleOnAccountDetailsInputsChange} value={accountData?.lastName} />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="emailId" className="col-form-label">Email
                                                    </label>
                                                    <input onClick={(evnt) => makeEnable('emailId')}  type="email" className="form-control" onKeyPress={(e) => { validateEmail(e) }} 
                                                    id="emailI" onChange={handleOnAccountDetailsInputsChange} 
                                                    value={accountData?.accountContact[0]?.emailId}  style={{display:"block"}} />

                                                    <input type="email" className="form-control" onKeyPress={(e) => { validateEmail(e) }} 
                                                    id="emailId" onChange={handleOnAccountDetailsInputsChange} 
                                                    value={accountData?.emailId} style={{display:"none"}} />
                                                </div>
                                                <span className="errormsg">{accountDetailsError.emailId ? accountDetailsError.emailId : ""}</span>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="mobileNo" className="col-form-label">Mobile Number
                                                    </label>
                                                    <input type="text" className="form-control" id="mobileN" maxLength="15" 
                                                    onChange={handleOnAccountDetailsInputsChange} value={accountData?.accountContact[0]?.mobileNo} style={{display:"block"}} onClick={(evnt) => makeEnable('mobileNo')} />
                                                    
                                                    <input style={{display:"none"}} type="text" className="form-control" id="mobileNo" maxLength="15" 
                                                    onChange={handleOnAccountDetailsInputsChange} value={accountData?.mobileNo} />
                                                </div>
                                                <span className="errormsg">{accountDetailsError.mobileNo ? accountDetailsError.mobileNo : ""}</span>
                                            </div>
                                        </div>
                                        <div className="row mt-2">
                                            {
                                                billableDetails && billableDetails !== undefined && billableDetails !== null && billableDetails?.isCustBillable && billableDetails?.isCustBillable === 'N' &&
                                                <div className="pb-2">
                                                    <BillingDetails
                                                        data={{
                                                            billableDetails: billableDetails
                                                        }}
                                                    />
                                                </div>
                                            }
                                        </div>
                                    </form>
                                </div>
                            </div>
                            <div className="row p-2">
                                <div className="col-12">
                                    {
                                        //addressLookUpRef && addressLookUpRef !== null &&
                                        <AddressDetailsEditable
                                            data={{                                                
                                                addressData: accountAddress
                                            }}
                                            countries={countries}
                                            lookups={{
                                                addressElements: addressLookUpRef
                                            }}
                                            title={"Account Address"}
                                            error={accountDetailsError}
                                            setError={setAccountDetailsError}                                            
                                            handler={
                                                {
                                                    setAddressData: setAccountAddress
                                                }
                                            }
                                        />
                                    }
                                </div>                               
                            </div>
                        </fieldset>
                        <div className="col-12 p-1">
                            <div id="customer-buttons" className="d-flex justify-content-center">
                                
                                <button type="button" className="skel-btn-cancel" data-dismiss="modal" onClick={handleOnCancel}>Cancel</button>
                                <button type="button" className="skel-btn-submit" onClick={handleOnSubmit}>Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export default EditAccountDetailsModal;