import React, { useEffect, useState } from 'react'
import { useHistory } from "react-router-dom";
import CustomerAddressForm from '../../CRM/Address/CustomerAddressForm';
import { properties } from '../../properties';
import { hideSpinner, showSpinner } from '../spinner';
import { get } from '../util/restUtil';
import { string, object } from "yup";
import { toast } from "react-toastify";
import avatarPlaceholder from '../../assets/images/profile-placeholder.png'

const BusinessConfig = () => {

    const history = useHistory();
    const [businessConfigData, setBusinessConfigData] = useState({
        businessName: "",
        legalFirstName: "",
        legalMiddleName: "",
        legalLastName: "",
        category: "",
        contactNoPre: "",
        contactNo: "",
        emailId: "",
        ein: "",
        pan: "",
        gst: "",
        businessUrl: "",
        accountHolderName: "",
        ifscCode: "",
        accountNo: ""
    })

    const [businessAddress, setBusinessAddress] = useState({
        address1: '',
        address2: '',
        address3: '',
        district: '',
        state: '',
        city: '',
        country: '',
        postcode: '',
        countryCode: ''
    })
    const [error, setError] = useState({})
    const [addressLookUpRef, setAddressLookUpRef] = useState(null)
    const [addressError, setAddressError] = useState(null)
    const [countries,setCountries] = useState([])
    const [categories,setCategories] = useState([])
    const [file, setFile] = useState(avatarPlaceholder)
    const [fileObject, setFileObject] = useState({})

    const validationSchema = object().shape({
        businessName: string().required("Business Name is required"),
        legalFirstName: string().required("Legal First Name is required"),
        legalMiddleName: string().required("Legal Middle Name is required"),
        legalLastName: string().required("Legal Last Name is required"),
        category: string().required("Category is required"),
        contactNo: string().required("ContactNo is required"),
        emailId: string().email("Please Enter Valid Email ID").required("Please Enter Email ID"),
        ein: string().required("EIN is required"),
        pan: string().required("PAN is required"),
        gst: string().required("GST is required"),
        businessUrl: string().required("Business URL is required"),
        accountHolderName: string().required("Account Holder Name is required"),
        ifscCode: string().required("IFSC Code is required"),
        accountNo: string().required("Account No is required")
    });

    const customerAddressValidationSchema = object().shape({
        address1: string().required("Address 1 is required"),
        address2: string().required("Address 2 is required"),
        district: string().required("District is required"),
        city: string().required("City/Town is required"),
        postcode: string().required("Postcode is required"),
        country: string().required("Country is required"),
        state: string().required("State is required"),
    });

    const validate = (section, schema, data, holdPrevErrors = false) => {
        try {
            if (section === 'DETAILS') {
                holdPrevErrors === false && setError({})
            }
            if (section === 'ADDRESS') {
                holdPrevErrors === false && setAddressError({})
            }
            schema.validateSync(data, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                if (section === 'DETAILS') {
                    setError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
                if (section === 'ADDRESS') {
                    setAddressError((prevState) => {
                        return { ...prevState, [err.params.path]: err.message };
                    });
                }
            });
            return e;
        }
    };

    useEffect(() => {
        showSpinner()
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=COUNTRY,CUSTOMER_CATEGORY')
            .then((response) => {
                if (response.data) {
                    setCountries(response.data.COUNTRY || [])
                    setCategories(response.data.CUSTOMER_CATEGORY || [])
                }
            })
            .catch(error => {
                console.error(error);
            }).finally(hideSpinner)
    }, [])

    const convertBase64 = (e) => {
        console.log('e......>', e)
        if (!e || !e.target || !e.target.files || e.target.files.length === 0) {
            return Promise.reject(new Error('Invalid input'));
        }

        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(e.target.files[0]);

            fileReader.onload = () => {
                const result = fileReader.result;
                resolve(result);
            };

            fileReader.onerror = (error) => {
                reject(error);
            };
        })
            .catch((error) => {
                console.error('Error loading file:', error);
                return null;
            });
    };

    const handleChangeStatus = async (e) => {
        let image = await convertBase64(e);
        setFile(image)
        setFileObject(e?.target?.files[0])

    }

    const handleCancel = () => {
        history.push(`${process.env.REACT_APP_BASE}`);
    }

    const handleInputChange = (e) => {
        const { target } = e
        setBusinessConfigData({
            ...businessConfigData,
            [target.id]: target.value
        })
        setError({
            ...error,
            [target.id]: ""
        })
    }

    const handleSubmit = () => {
        const error = validate('DETAILS', validationSchema, businessConfigData);
        const error1 = validate('ADDRESS', customerAddressValidationSchema, businessAddress, true);
        if (error || error1) {
            toast.error("Validation errors found. Please check highlighted fields");
            return false;
        }
        const requestBody = {
            businessConfig: {
                ...businessConfigData,
                contactNoPre: businessAddress?.countryCode,
                addressDetails: businessAddress
            }
        }
        console.log('requestBody',requestBody)
    }

    return (
        <div className="cnt-wrapper">
            <div className="card-skeleton">
                <div className="customer-skel">
                    <div className="cmmn-skeleton">
                        <div className="skel-config-base">
                            <div className="skel-config-data">
                                <div className="row p-3">
                                    <div className="col-md-3">
                                        <div className="text-center">
                                            <img className="mb-2" id="img" src={file} width="150px" height="150px" style={{ objectFit: "cover" }}>
                                            </img>
                                        </div>
                                        <input type="file"
                                            accept="image/*"
                                            name="image-upload"
                                            id="input"
                                            style={{ display: "none" }}
                                            onChange={(e) => handleChangeStatus(e)}
                                        />
                                        <div style={{ marginTop: "1rem", display: "flex", justifyContent: "center" }} className="button_outer">
                                            <label style={{
                                                margin: "auto",
                                                padding: "10px",
                                                color: "white",
                                                textJustify: "auto",
                                                textAlign: "center",
                                                cursor: "pointer",

                                            }} htmlFor="input" className="btn_upload">

                                                Upload Image
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-md-9">
                                        <div className="row">
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="businessName" className="control-label">Business Name <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                    <input type="text" className={`form-control ${(error.businessName ? "input-error" : "")}`} value={businessConfigData.businessName} id="businessName" placeholder="Enter Business Name" onChange={handleInputChange}/>
                                                    <span className="errormsg">{error.businessName ? error.businessName : ""}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="legalFirstName" className="control-label">Legal First Name <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                    <input type="text" className={`form-control ${(error.legalFirstName ? "input-error" : "")}`} value={businessConfigData.legalFirstName} id="legalFirstName" placeholder="Enter Legal First Name" onChange={handleInputChange}/>
                                                    <span className="errormsg">{error.legalFirstName ? error.legalFirstName : ""}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="legalMiddleName" className="control-label">Legal Middle Name <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                    <input type="text" className={`form-control ${(error.legalMiddleName ? "input-error" : "")}`} value={businessConfigData.legalMiddleName} id="legalMiddleName" placeholder="Enter Legal Middle Name" onChange={handleInputChange}/>
                                                    <span className="errormsg">{error.legalMiddleName ? error.legalMiddleName : ""}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="legalLastName" className="control-label">Legal Last Name <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                    <input type="text" className={`form-control ${(error.legalLastName ? "input-error" : "")}`} value={businessConfigData.legalLastName} id="legalLastName" placeholder="Enter Legal Last Name" onChange={handleInputChange}/>
                                                    <span className="errormsg">{error.legalLastName ? error.legalLastName : ""}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="category" className="control-label">Category <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                    <div className="custselect">
                                                        <select value={businessConfigData.category} id="category" className={`form-control ${(error.category ? "input-error" : "")}`} onChange={handleInputChange}>
                                                            <option key="category" value="">Select Category</option>
                                                            {
                                                                categories && categories.map((e) => (
                                                                    <option key={e.code} value={e.code}>{e.description}</option>
                                                                ))
                                                            }
                                                        </select>
                                                        <span className="errormsg">{error.category ? error.category : ""}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <label htmlFor="contactNo" className="control-label">Contact No <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                <div className="form-inline">
                                                    <input className="form-control form-inline mr-1" style={{ width: "24%" }} type="text" id="code" value={`+${businessAddress?.countryCode || ""}`} />
                                                    <input type="text" className={`form-control ${(error.contactNo ? "input-error" : "")}`} style={{ width: "72%" }} value={businessConfigData.contactNo} id="contactNo" placeholder="Enter Contact Number" onChange={handleInputChange}/>
                                                    <span className="errormsg">{error.contactNo ? error.contactNo : ""}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="emailId" className="control-label">Email ID <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                    <input type="email" className={`form-control ${(error.emailId ? "input-error" : "")}`} value={businessConfigData.emailId} id="emailId" placeholder="Enter Email ID" onChange={handleInputChange}/>
                                                    <span className="errormsg">{error.emailId ? error.emailId : ""}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="ein" className="control-label">EIN <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                    <input type="text" className={`form-control ${(error.ein ? "input-error" : "")}`} value={businessConfigData.ein} id="ein" placeholder="Enter EIN" onChange={handleInputChange}/>
                                                    <span className="errormsg">{error.ein ? error.ein : ""}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="pan" className="control-label">PAN <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                    <input type="text" className={`form-control ${(error.pan ? "input-error" : "")}`} value={businessConfigData.pan} id="pan" placeholder="Enter PAN" onChange={handleInputChange}/>
                                                    <span className="errormsg">{error.pan ? error.pan : ""}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="gst" className="control-label">GST <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                    <input type="text" className={`form-control ${(error.gst ? "input-error" : "")}`} value={businessConfigData.gst} id="gst" placeholder="Enter GST" onChange={handleInputChange}/>
                                                    <span className="errormsg">{error.gst ? error.gst : ""}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="businessUrl" className="control-label">Business URL <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                    <input type="text" className={`form-control ${(error.businessUrl ? "input-error" : "")}`} value={businessConfigData.businessUrl} id="businessUrl" placeholder="Enter Business URL" onChange={handleInputChange}/>
                                                    <span className="errormsg">{error.businessUrl ? error.businessUrl : ""}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <hr className="cmmn-hline" />
                                    <CustomerAddressForm
                                        data={{
                                            addressData: businessAddress,
                                            addressString: ""
                                        }}
                                        countries={countries}
                                        lookups={{
                                            addressElements: addressLookUpRef
                                        }}
                                        error={addressError}
                                        setError={setAddressError}
                                        handler={{
                                            setAddressData: setBusinessAddress,
                                            setAddressLookUpRef
                                        }}
                                    />    
                                    <hr className="cmmn-hline" />        
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label htmlFor="accountHolderName" className="control-label">Account Holder Name <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <input type="text" className={`form-control ${(error.accountHolderName ? "input-error" : "")}`} value={businessConfigData.accountHolderName} id="accountHolderName" placeholder="Enter Account Holder Name" onChange={handleInputChange} />
                                            <span className="errormsg">{error.accountHolderName ? error.accountHolderName : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label htmlFor="ifscCode" className="control-label">IFSC Code <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <input type="text" className={`form-control ${(error.ifscCode ? "input-error" : "")}`} value={businessConfigData.ifscCode} id="ifscCode" placeholder="Enter IFSC Code" onChange={handleInputChange} />
                                            <span className="errormsg">{error.ifscCode ? error.ifscCode : ""}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="form-group">
                                            <label htmlFor="accountNo" className="control-label">Account No <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <input type="text" className={`form-control ${(error.accountNo ? "input-error" : "")}`} value={businessConfigData.accountNo} id="accountNo" placeholder="Enter Account No" onChange={handleInputChange} />
                                            <span className="errormsg">{error.accountNo ? error.accountNo : ""}</span>
                                        </div>
                                    </div>
                                    <hr className="cmmn-hline" />
                                    <div className="col-md-12 text-center mt-3">
                                        <button type="button" className="skel-btn-cancel" onClick={handleCancel}>Cancel</button>
                                        <button type="button" className="skel-btn-submit" onClick={handleSubmit}>Submit</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BusinessConfig