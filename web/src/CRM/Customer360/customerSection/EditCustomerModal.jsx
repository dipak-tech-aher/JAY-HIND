import { useState, useEffect, useRef } from 'react';
import { NumberFormatBase } from 'react-number-format';
import Modal from 'react-modal'
import { string, object } from "yup";
import { toast } from 'react-toastify';

import { get, post, put } from '../../../common/util/restUtil';
import { properties } from '../../../properties';
import BillingDetails from '../BillingDetails';
import AddrForm from '../../Address/addressForm';
import { formatDateForBirthDate } from '../../../common/util/dateUtil';
import { validateEmail } from '../../../common/util/util';

const EditCustomerModal = (props) => {

    const { customerDetails, isOpen } = props?.data
    const { setIsOpen , pageRefresh} = props?.handler 
    const [customerData,setCustomerData] = useState(customerDetails)
    const [customerAddress,setCustomerAddress] = useState(customerDetails?.address[0])  
    const [custIDTypes, setCustIDTypes] = useState([]);
    const [contactTypes, setContactTypes] = useState([]);
    const [customerError,setCustomerError] = useState({})

    const customStyle = {
        content: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            width: '73%',
            maxHeight: '100%'
        }
    }
    const personalCustomerValidationSchema = object().shape({
        title: string().required("Title is required"),
        foreName: string().required("ForeName is required"),
        surName: string().required("SurName is required"),
      
        gender: string().required("Gender is required"),
        email: string().required("Email is required").email("Email is not in correct format"),
        contactType: string().required("Contact type is required"),
        idType: string().required("ID type is required"),
        contactNbr: string().required("Contact Number is required"),
        idNumber: string().required("ID Number is required"),
        dob: string().required("Date of birth is required")
    });
    const businessCustomerValidationSchema = object().shape({
        companyName: string().required("Company Name is required"),
        email: string().required("Email is required").email("Email is not in correct format"),
        contactType: string().required("Contact type is required"),
        contactNbr: string().required("Contact Number is required"),
        registrationNbr: string().required("Registration number is required"),
        registrationDate: string().required("Registration date is required"),
        idType: string().required("ID type is required"),
        idNumber: string().required("ID Number is required"),
     
    });
    const addressValidationSchema = object().shape({
        flatHouseUnitNo: string().required("Flat/House/Unit No is required"),
        street: string().required("Street is required"),
        district: string().required("District is required"),
        cityTown: string().required("City/Town is required"),
        postCode: string().required("Postcode is required"),
        country: string().required("Country is required"),
        state: string().required("State is required")
    });
    const [districtLookup, setDistrictLookup] = useState([{}])
    const [kampongLookup, setKampongLookup] = useState([{}])
    const [postCodeLookup, setPostCodeLookup] = useState([{}])
    const [countries, setCountries] = useState()
    const [addressLookUpRef, setAddressLookUpRef] = useState(null)
    const addressLookup = useRef({})
    useEffect(() => {
        let district = []
        let kampong = []
        let postCode = []
        
        post(properties.BUSINESS_ENTITY_API, [
            "CUSTOMER_ID_TYPE", "CONTACT_TYPE","COUNTRY","STATE","DISTRICT","POSTCODE"
        ])
        .then((response) => {
            if (response.data) {
                    
                    get(properties.ADDRESS_LOOKUP_API)
                        .then((resp) => {
                            if (resp && resp.data) {
                                addressLookup.current = resp.data
                                setAddressLookUpRef(resp.data)
                                for (let e of addressLookup.current) {
                                    if (!district.includes(e.district)) {
                                        district.push(e.district)
                                    }
                                    if (!kampong.includes(e.kampong)) {
                                        kampong.push(e.kampong)
                                    }
                                    if (!postCode.includes(e.postCode)) {
                                        postCode.push(e.postCode)
                                    }
                                }
                            }
                        }).catch((error) => {
                            console.log(error)
                        })
                        .finally()
                setCountries(response.data.COUNTRY)
                setCustIDTypes(response.data["CUSTOMER_ID_TYPE"])
                setContactTypes(response.data["CONTACT_TYPE"])
                setDistrictLookup(response.data.DISTRICT)
                setKampongLookup(response.data.STATE)
                setPostCodeLookup(response.data.POSTCODE)
            }
        })
        .catch(error => {
            console.error(error);
        }).finally()
    }, [])

    const validate = (section, schema, data, holdPrevErrors = false) => {
        try {
            if (section === 'CUSTOMER') {
                holdPrevErrors === false && setCustomerError({})
            }
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                if (section === 'CUSTOMER') {
                    setCustomerError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
            });
            return e;
        }
    };

    const handleSubmit = () => {
        if (customerData?.customerType === 'RESIDENTIAL') {
            const personalError = validate('CUSTOMER', personalCustomerValidationSchema, customerData);
            const addressError = validate('CUSTOMER', addressValidationSchema, customerAddress, true);
            if (personalError || addressError) {
                toast.error("Validation errors found. Please check highlighted fields");
                return false;
            }
        }
        if (customerData?.customerType === 'BUSINESS' || customerData?.customerType === 'GOVERNMENT') {
            const businessError = validate('CUSTOMER', businessCustomerValidationSchema, customerData);
            const addressError = validate('CUSTOMER', addressValidationSchema, customerAddress, true);
            if (businessError || addressError) {
                toast.error("Validation errors found. Please check highlighted fields");
                return false;
            }
        }
        let requestBody = {
            details: {
                idType: customerData?.idType,
                idValue: customerData?.idNumber,
                email: customerData?.email,
                contactType : customerData?.contactType,
                contactNbr : customerData?.contactNbr,
            },
            property: {
                property1: customerData?.property1,
                property2: customerData?.property2,
                property3: customerData?.property3
            },
            address: customerAddress
        }
        
        put(properties.CUSTOMER_API + "/" + customerData?.customerId,requestBody)
        .then((response) => {
            if(response.status === 200)
            {
                toast.success("Customer Updated Successfully")
                setIsOpen(false)
                pageRefresh()
            }
        })
        .catch((error) => {
            console.log(error)
        })
        .finally()
    }

    const handleCancel = () => {
        setCustomerError({})
        setCustomerData({})
        setCustomerAddress({})
        setIsOpen(false)
    }

    return(
        <Modal isOpen={isOpen} contentLabel="" style={customStyle}>
            <div className="addresshadow">
                <div className="modal-dialog">
                    <div className="modal-content border bg-light">
                        <div className="modal-header p-1">
                            <h4 className="modal-title" id="myCenterModalLabel">Edit - {customerData?.customerType === "RESIDENTIAL" ? customerData?.title + " " + customerData?.surName + " " + customerData?.foreName : customerData?.companyName} - {customerData?.crmCustomerNo} </h4>
                            <button type="button" className="close" data-dismiss="modal" aria-hidden="true" onClick={() => {setIsOpen(false)}}>×</button>
                        </div>
                        <div className="modal-body bg-white">
                            <fieldset className="scheduler-border1">
                                <div className="row col-12">
                                    <div className="col-12 pl-1">
                                        <div className="form-row">
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="customerNumber" className="col-form-label">Customer Number <span>*</span></label>
                                                    <input type="text" className="form-control" id="customerNumber" value={customerData?.crmCustomerNo} readonly="true"/>
                                                </div>
                                            </div>
                                            {
                                                customerDetails?.customerType === 'RESIDENTIAL' ?
                                                <>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="title" className="col-form-label">Title <span>*</span></label>
                                                            <input type="text" className="form-control" id="title" value={customerData?.title} readonly="true"/>
                                                            <span className="errormsg">{customerError.title ? customerError.title : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="surName" className="col-form-label">Surname <span>*</span></label>
                                                            <input type="text" className="form-control" id="surName" value={customerData?.surName} readonly="true"/>
                                                            <span className="errormsg">{customerError.surName ? customerError.surName : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="foreName" className="col-form-label">Forename <span>*</span></label>
                                                            <input type="text" className="form-control" id="foreName" value={customerData?.foreName} readonly="true"/>
                                                            <span className="errormsg">{customerError.foreName ? customerError.foreName : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="gender" className="col-form-label">Gender <span>*</span></label>
                                                            <select type="text" className="form-control" id="gender" value={customerData?.gender} readonly="true" disabled
                                                                onChange={(e) => {
                                                                    setCustomerData({...customerData,gender: e.target.value})
                                                                    setCustomerError({...customerError, gender: ""})
                                                                }}
                                                            >
                                                                <option value="">Please Select Gender</option>
                                                                <option value="M">Male</option>
                                                                <option value="F">Female</option>
                                                            </select>
                                                            <span className="errormsg">{customerError.gender ? customerError.gender : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="dob" className="col-form-label">Date of Birth <span>*</span></label>
                                                            <input type="date" className="form-control" id="dob" value={customerData?.dob} readonly="true" disabled
                                                                max={formatDateForBirthDate(new Date())}
                                                                onChange={(e) => {
                                                                    setCustomerData({...customerData,dob:e.target.value})
                                                                    setCustomerError({...customerError, dob:""})
                                                                }}
                                                            />
                                                            <span className="errormsg">{customerError.dob ? customerError.dob : ""}</span>
                                                        </div>
                                                    </div>
                                                </>
                                                :
                                                <>
                                                    <div className="col-md-8">
                                                        <div className="form-group">
                                                            <label htmlFor="companyName" className="col-form-label">Company Name <span>*</span></label>
                                                            <input type="text" className="form-control" id="companyName" value={customerData?.companyName} readonly="true"/>
                                                            <span className="errormsg">{customerError.companyName ? customerError.companyName : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="registeredNbr" className="col-form-label">Registered Number <span>*</span></label>
                                                            <input type="text" className="form-control" id="registeredNbr" value={customerData?.registrationNbr} readonly="true" disabled
                                                                onChange={(e) => {
                                                                    setCustomerData({...customerData, registrationNbr: e.target.value})
                                                                    setCustomerError({...customerError, registrationNbr:""})
                                                                }}
                                                            />
                                                            <span className="errormsg">{customerError.registrationNbr ? customerError.registrationNbr : ""}</span>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-4">
                                                        <div className="form-group">
                                                            <label htmlFor="registrationDate" className="col-form-label">Registered Date <span>*</span></label>
                                                            <input type="date" className="form-control" id="registrationDate" value={customerData?.registrationDate} readonly="true" disabled
                                                                max={formatDateForBirthDate(new Date())}
                                                                onChange={(e) => {
                                                                    setCustomerData({...customerData, registrationDate: e.target.value})
                                                                    setCustomerError({...customerError, registrationDate:""})
                                                                }}
                                                            />
                                                            <span className="errormsg">{customerError.registrationDate ? customerError.registrationDate : ""}</span>
                                                        </div>
                                                    </div>
                                                </>
                                            }
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="idType" className="col-form-label">ID Type <span>*</span></label>
                                                    <select id="idType" className="form-control" value={customerData?.idType}
                                                        onChange={(e) => {
                                                            setCustomerData({...customerData, idType: e.target.value})
                                                            setCustomerError({...customerError, idType:""})
                                                        }}
                                                    >
                                                        <option key={1} value="">Select ID Type</option>
                                                    {
                                                        custIDTypes && custIDTypes.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))                                
                                                    }
                                                    </select>
                                                    <span className="errormsg">{customerError.idType ? customerError.idType : ""}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="idNumber" className="col-form-label">ID Number <span>*</span></label>
                                                    <input type="text" className="form-control" id="idNumber" value={customerData?.idNumber}
                                                        maxLength="20"
                                                        onChange={(e) => {
                                                            setCustomerData({...customerData, idNumber: e.target.value})
                                                            setCustomerError({...customerError, idNumber:""})
                                                        }}
                                                    />
                                                    <span className="errormsg">{customerError.idNumber ? customerError.idNumber : ""}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="email" className="col-form-label">Email <span>*</span></label>
                                                    <input type="email" className="form-control" id="email" value={customerData?.email}
                                                        onKeyPress={(e) => { validateEmail(e) }}
                                                        onChange={(e) => {
                                                            setCustomerData({...customerData, email: e.target.value})
                                                            setCustomerError({...customerError, email:""})
                                                        }}
                                                    />
                                                    <span className="errormsg">{customerError.email ? customerError.email : ""}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="contactType" className="col-form-label">Contact Type <span>*</span></label>
                                                    <select id="contactType" className="form-control" value={customerData?.contactType}
                                                        onChange={(e) => {
                                                            setCustomerData({...customerData, contactType: e.target.value})
                                                            setCustomerError({...customerError, contactType:""})
                                                        }}
                                                    >
                                                        <option key={1} value="">Select Contact Type</option>
                                                    {
                                                        contactTypes && contactTypes.map((e) => (
                                                            <option key={e.code} value={e.code}>{e.description}</option>
                                                        ))                                
                                                    }
                                                    </select>
                                                    <span className="errormsg">{customerError.contactType ? customerError.contactType : ""}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="contactNbr" className="col-form-label">Contact Number <span>*</span></label>
                                                    <NumberFormatBase className="form-control" id="contactNbr" value={customerData?.contactNbr} 
                                                        maxLength="15"
                                                        onChange={(e) => {
                                                            setCustomerData({...customerData, contactNbr: e.target.value})
                                                            setCustomerError({...customerError, contactNbr:""})
                                                        }}
                                                    />
                                                    <span className="errormsg">{customerError.contactNbr ? customerError.contactNbr : ""}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <label htmlFor="isBillable" className="col-form-label">Billable</label>
                                                <fieldset className="question mt-1">
                                                    <input  type="checkbox" id="isBillable"  checked={customerData?.billableDetails?.isCustBillable === "Y" ? true : false} disabled />
                                                    <span className="item-text">{customerData?.billableDetails?.isCustBillable === "Y" ? "Yes" : "No" }</span>
                                                </fieldset>
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            
                                        </div>
                                    </div>
                                </div>
                                {
                                    customerData?.billableDetails?.isCustBillable && customerData.billableDetails?.isCustBillable === 'Y' &&
                                    <div className="row col-12">
                                        <form className="col-12 pt-2">
                                                <div className="pb-2">
                                                    <BillingDetails
                                                        data={{
                                                            billableDetails : customerData?.billableDetails
                                                        }}
                                                    />
                                                </div>
                                        </form>
                                    </div>
                                }
                                {
                                    addressLookUpRef && addressLookUpRef !== null &&
                                        <AddrForm
                                            data={customerAddress}
                                            countries={countries}
                                            lookups={{
                                                districtLookup: districtLookup,
                                                kampongLookup: kampongLookup,
                                                postCodeLookup: postCodeLookup,
                                                addressElements: addressLookUpRef
                                            }}
                                            title={"customer_address"}
                                            error={customerError}
                                            setError={setCustomerError}
                                            handler={setCustomerAddress} 
                                        />
                                }
                                <div className="row col-12">
                                    <form id="address-form" className="col-12">
                                        <div className="form-row pl-2">
                                        <div className="col-12 bg-light border">
                                            <h5 className="text-primary">Customer Property</h5>
                                        </div>
                                        </div>
                                        <div className="form-row col-12">
                                            <div className="col-md-3 pl-2">
                                                <div className="form-group">
                                                <label htmlFor="property1" className="col-form-label">Customer Property 1</label>
                                                <input type="text" className="form-control" id="property1" value={customerData?.property1} placeholder="Please Enter Property 1"
                                                    maxLength="50"
                                                    onChange={(e) => {
                                                        
                                                        setCustomerData({...customerData, property1: e.target.value})
                                                      
                                                    }}
                                                />
                                               
                                                </div>
                                            </div>
                                            <div className="col-md-3 pl-2">
                                                <div className="form-group">
                                                <label htmlFor="property2" className="col-form-label">Customer Property 2</label>
                                                <input type="text" className="form-control" id="property2" value={customerData?.property2} placeholder="Please Enter Property 2"
                                                    maxLength="50"
                                                    onChange={(e) => {
                                                        setCustomerData({...customerData, property2: e.target.value})
                                                        
                                                    }}
                                                />
                                              
                                                </div>
                                            </div>
                                            <div className="col-md-3 pl-2">
                                                <div className="form-group">
                                                <label htmlFor="property3" className="col-form-label">Customer Property 3</label>
                                                <input type="text" className="form-control" id="property3" value={customerData?.property3} placeholder="Please Enter Property 3"
                                                    maxLength="50"
                                                    onChange={(e) => {
                                                        setCustomerData({...customerData, property3: e.target.value})
                                                      
                                                    }}
                                                />
                                             
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </fieldset>
                            <div className="col-12 p-1">
                                <div id="customer-buttons" className="d-flex justify-content-center">
                                    <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" onClick={handleSubmit}>Submit</button>
                                    <button type="button" className="btn btn-primary btn-sm waves-effect waves-light ml-2" onClick={handleCancel}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}
export default EditCustomerModal;