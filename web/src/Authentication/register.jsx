import React, { useState, useEffect, useRef, useContext } from "react";
import { useHistory, Link } from "react-router-dom";
import { properties } from "../properties";
import { get, post } from "../common/util/restUtil";
import { string, object } from "yup";
import logoLight from '../assets/images/newbcaelogo-transparent.png';
import { toast } from "react-toastify";
import { NumberFormatBase } from "react-number-format";
import login2 from '../assets/images/login2.jpg';
import moment from 'moment'
import useEmailAutocomplete from "use-email-autocomplete"
import Select from 'react-select'
import { AppContext } from "../AppContext";
import { isEmpty } from 'lodash';

const validationSchema = object().shape({
    firstName: string().required("Please Enter First Name"),
    lastName: string().required("Please Enter Last Name"),
    dob: string().required("Please Enter DOB"),
    gender: string().required("Please Select Gender"),
    //userType: string().required("Please Select User Type"),
    location: string().required("Please Select Location"),
    country: string().required("Please Select Country"),
    contactNo: string().required("Please Enter Mobile Number"),
    email: string().email("Please Enter Valid Email ID").matches(
        /^[A-Za-z0-9._]+@[A-Za-z0-9.-]+$/,
        "Enter Valid Email ID"
    ).required("Please Enter Email ID")
});

const countryValidationSchema = object().shape({
    country: string().required("Please Select Country")
})

const mobileVerificationValidationSchema = object().shape({
    contactNo: string().required("Please Enter Mobile Number")
});
const mobileOTPValidationSchema = object().shape({
    mobileOTP: string().required("Please Enter Mobile Verification Code")
});

const emailVerificationValidationSchema = object().shape({
    email: string().email("Please Enter Valid Email ID").matches(
        /^[A-Za-z0-9._]+@[A-Za-z0-9.-]+$/,
        "Enter Valid Email ID"
    ).required("Please Enter Email ID")
});
const emailOTPValidationSchema = object().shape({
    emailOTP: string().required("Please Enter Email Verification Code")
});

const Register = (props) => {
    const history = useHistory();
    const { email, onChange: handleEmailChange, bind } = useEmailAutocomplete()
    const [error, setError] = useState({});
    const [mobileEnter, setMobileEnter] = useState(false);
    const [mobileVerified, setMobileVerified] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [VerifyEmail, setVerifyEmail] = useState(false);
    const [userCreated, setUserCreated] = useState(false);
    const [locations, setLocations] = useState([])
    const [countries, setCountries] = useState()
    const [userTypes, setUserTypes] = useState([])
    const [genderList, setGenderList] = useState([])
    const [mappedCountry, setMappedCountry] = useState([])
    const [mappedLocation, setMappedLocation] = useState([])
    const [selectedCountryCode, setSelectedCountryCode] = useState("00");
    const [phoneNumberLength, setPhoneNumberLength] = useState(20);
    const [disable1, setDisable1] = useState(false)
    const [disable2, setDisable2] = useState(false)
    const [isMobileFieldsEditable, setIsMobileFieldsEditable] = useState(false)
    const [isEmailFieldsEditable, setIsEmailFieldsEditable] = useState(false)
    const entityRef = useRef()
    const [appsConfig, setAppsConfig] = useState({})
    const [minutes, setMinutes] = useState(1);
    const [seconds, setSeconds] = useState(0);

    const [emailMinutes, setEmailMinutes] = useState(1);
    const [emailSeconds, setEmailSeconds] = useState(0);
    let { appConfig } = useContext(AppContext);

    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        dob: "",
        gender: "",
        userType: "",
        location: "LC2",
        country: "",
        contactNo: "",
        mobileOTP: "",
        email: "",
        emailOTP: "",
        extn: ""
    })

    useEffect(() => {
        const interval = setInterval(() => {
            if (seconds > 0) {
                setSeconds(seconds - 1);
            }

            if (seconds === 0) {
                if (minutes === 0) {
                    clearInterval(interval);
                } else {
                    setSeconds(59);
                    setMinutes(minutes - 1);
                }
            }
        }, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [seconds]);

    useEffect(() => {
        const emailInterval = setInterval(() => {
            if (emailSeconds > 0) {
                setEmailSeconds(emailSeconds - 1);
            }

            if (emailSeconds === 0) {
                if (emailMinutes === 0) {
                    clearInterval(emailInterval);
                } else {
                    setEmailSeconds(59);
                    setEmailMinutes(emailMinutes - 1);
                }
            }
        }, 1000);

        return () => {
            clearInterval(emailInterval);
        };
    }, [emailSeconds]);

    useEffect(() => {
        get(properties.MASTER_API + '/lookup?searchParam=code_type&valueParam=COUNTRY,USER_GROUP,LOCATION,GENDER').then((resp) => {
            if (resp.data) {
                entityRef.current = resp.data

                //setCountries(resp.data.COUNTRY || [])
                //setUserTypes(resp.data.USER_GROUP || [])
                setGenderList(resp.data.GENDER || [])
                setCountries(resp.data.COUNTRY.map(e => (
                    {
                        label: e.description,
                        value: e.code,
                        mapping: e.mapping,
                        id: 'country'
                    }
                )))
            }
            else {
                toast.error("Error while fetching address details")
            }
        }).catch((error) => {
            console.log(error)
        })
            .finally()
    }, []);

    const validate = (schema, form) => {
        try {
            schema.validateSync(form, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    const handleSubmit = () => {
        let verificationError
        let error = validate(validationSchema, form)
        let mobileOTPError = validate(mobileOTPValidationSchema, form);
        let emailOTPError = validate(emailOTPValidationSchema, form);

        if (error) {
            toast.error("Oops, looks like you have not provided all mandatory fields")
            return;
        } else if (emailVerified === false) {
            if (emailOTPError) {
                verificationError = true
                toast.error("Please Verify Email")
                return;
            }
        } else if (mobileVerified === false) {
            if (mobileOTPError) {
                verificationError = true
                toast.error("Please Verify Mobile Number")
                return;
            }
        }
        if (String(form.contactNo || 0).length !== phoneNumberLength) {
            toast.error("Oops, Provided mobile number is invalid or not complete, request to provide correct mobile number")
            return;
        }

        let dobYears = moment().diff(form.dob, 'years', false);
        if (dobYears < 18) {
            toast.error("Date of birth must be greater than or equal to 18 years");
            return;
        }
        
        const requestBody = form
        delete requestBody.mobileOTP
        delete requestBody.emailOTP

        requestBody.userType = "UT_BUSINESS";
        requestBody.userGroup = "UG_BUSINESS";
        requestBody.userSource = "US_WEBAPP";

        post(properties.AUTH_API + "/register", requestBody).then((resp) => {
            if (resp.status === 200) {
                toast.success("Congrats, User Registration is successful, kindly proceed to signin page")
                setUserCreated(true)
            }
            else {
                toast.error("Error while creating user")
            }
        }).catch((error) => {
            console.log(error)
        }).finally()
    }

    const handleCancel = () => {
        setForm({
            ...form,
            firstName: "",
            lastName: "",
            dob: "",
            gender: "",
            userGroup: "UG_BUSINESS",
            country: "",
            location: "",
            contactNo: "",
            mobileOTP: "",
            email: "",
            emailOTP: "",
            extn: ""
        })
        setVerifyEmail(false)
        setEmailVerified(false)
        setMobileVerified(false)
        setMobileEnter(false)
        history.push(`${process.env.REACT_APP_BASE}}`)
    }

    const MobileVerification = () => {
        let countryError = validate(countryValidationSchema, form);
        let mobileError = validate(mobileVerificationValidationSchema, form);
        console.log("countryError =====> ", countryError)
        console.log("mobileError ============> ", mobileError)
        if (countryError || mobileError) {
            return;
        }

        if (String(form.contactNo || 0).length !== phoneNumberLength) {
            toast.error("Oops, Provided mobile number is invalid or not complete, request to provide correct mobile number")
            return;
        }

        let obj = {
            reference: form.contactNo,
            firstName: form.firstName,
            extn: form.extn
        }

        post(properties.AUTH_API + "/send-otp" + "?type=mobile&source=REGISTER&userGroup=UG_BUSINESS", obj).then((resp) => {
            console.log(resp)
            if (resp.status === 200) {
                setDisable1(true);
                setMobileEnter(true)
                setIsMobileFieldsEditable(true)
                setMinutes(parseInt(appsConfig?.otpExpirationDuration?.email_sms));
                setSeconds(false);
                setTimeout(() => {
                    setSeconds(0);
                }, 20);
                toast.success("OTP sent successfully.")
            }
            else {
                toast.error(resp.message || "Error while sending OTP")
                history.push(`${process.env.REACT_APP_BASE}/user/login`)
            }
        }).catch((error) => {
            console.log(error)
        }).finally()
    }

    const verifyMobileOTP = () => {
        if (validate(mobileOTPValidationSchema, form)) {
            return;
        }

        get(properties.AUTH_API + "/verify-otp/" + form.contactNo + "?type=mobile&otp=" + form.mobileOTP).then((resp) => {
            if (resp.status) {
                if (resp.status === 200) {
                    toast.success("Mobile number verified.")
                    setMobileVerified(true)
                    setMobileEnter(false)
                }
                else {
                    toast.error("Please enter correct OTP")
                }
            } else {
                toast.error("Error while fetching OTP")
            }
        }).catch((error) => {
            console.log(error)
        }).finally()
    }

    const EmailVerification = async () => {
        let emailError = validate(emailVerificationValidationSchema, form)
        if (emailError) {
            return;
        }
        let obj = {
            reference: form.email,
            firstName: form.firstName,
        }

        post(properties.AUTH_API + "/send-otp" + "?type=email&source=REGISTER", obj).then((resp) => {
            if (resp.status === 200) {
                setDisable2(true);
                setVerifyEmail(true)
                setIsEmailFieldsEditable(true)
                setEmailMinutes(parseInt(appsConfig?.otpExpirationDuration?.email_sms));
                setEmailSeconds(false);
                setTimeout(() => {
                    setEmailSeconds(0);
                }, 20);
                toast.success("OTP sent successfully.")
            } else {
                toast.error("Error while sending OTP")
            }
        }).catch((error) => {
            console.log(error)
        }).finally()
    }

    const verifyEmailOTP = () => {
        if (validate(emailOTPValidationSchema, form)) {
            return;
        }

        get(properties.AUTH_API + "/verify-otp/" + form.email + "?type=email&otp=" + form.emailOTP).then((resp) => {
            if (resp.status) {
                if (resp.status === 200) {
                    toast.success("Email verified.")
                    setEmailVerified(true)
                    setVerifyEmail(false)
                }
                else {
                    toast.error("Please enter correct OTP")
                }
            } else {
                toast.error("Error while fetching OTP")
            }
        }).catch((error) => {
            console.log(error)
        }).finally()
    }

    const handleOnChangeDropDown = (val) => {
        if (val.id === 'country') {
            const locationList = entityRef.current.LOCATION.filter(e => e.mapping?.country?.toLowerCase() === val.value?.toLowerCase())
            setLocations(locationList.map(e => (
                {
                    label: e.description,
                    value: e.code,
                    mapping: e.mapping,
                    id: 'location'
                }
            )))
        }
    }

    useEffect(() => {
        // if (!isEmpty(appConfig)) {
        //     setAppsConfig(appConfig);
        //     setMinutes(parseInt(appConfig?.otpExpirationDuration?.email_sms));
        //     setEmailMinutes(parseInt(appConfig?.otpExpirationDuration?.email_sms));
        // } else {
            get(properties.MASTER_API + '/get-app-config')
                .then((resp) => {
                    if (resp?.status === 200) {
                        setAppsConfig(resp?.data);
                        setMinutes(parseInt(resp?.data?.otpExpirationDuration?.email_sms));
                        setEmailMinutes(parseInt(resp?.data?.otpExpirationDuration?.email_sms));
                        sessionStorage.setItem("appConfig", JSON.stringify(resp?.data));
                    }
                }).catch((error) => { console.log(error) })
                .finally()
        // }
    }, [])

    return (
        <div className="login-layout-main authentication-bg authentication-bg-pattern">
            <div className="bg-layer">
                {/* <img src={login2} alt="" className="img-fluid cmmn-lft-img" /> */}
                {/* <img src={login2} alt="" className="img-fluid cmmn-rht-img" /> */}
                <div className="header-main">
                    <div className="row">
                        <div className="col login-form">
                            <div className="card">
                                <div className="card-body p-3">
                                    <div className="text-center m-auto">
                                        <div className="auth-logo">
                                            <Link to="#" className="logo text-center">
                                                <span className="logo-lg">
                                                    <img src={appsConfig?.appLogo} alt="" height="50" />
                                                </span>
                                            </Link>
                                        </div>
                                    </div>
                                    <hr className="horz-line" />
                                    <div className="text-center m-auto">
                                        <h3 className="text-muted mb-4 mt-2">Sign Up</h3>
                                    </div>
                                    <>{userCreated === false ?
                                        <div className="scheduler-border">
                                            <div className="form-group mb-2">
                                                <label className="col-form-label">First Name <span className="text-danger font-20 pl-1 fld-imp">*</span> <i className="help-text">(min 3 characters)</i></label>
                                                <div className="input-group input-group-merge">
                                                    <input className={`form-control ${(error.firstName ? "input-error" : "")}`} placeholder="Enter Your First Name"
                                                        type="text"
                                                        maxLength={40}
                                                        onChange={(e) => {
                                                            setForm({
                                                                ...form,
                                                                firstName: e.target.value,
                                                            });
                                                            setError({ ...error, firstName: "" })
                                                        }} />
                                                    {error.firstName ? <span className="errormsg">{error.firstName}</span> : ""}
                                                </div>
                                            </div>
                                            <div className="form-group mb-2">
                                                <label className="col-form-label" >Last Name <span className="text-danger font-20 pl-1 fld-imp">*</span> <i className="help-text">(min 1 characters)</i></label>
                                                <div className="input-group input-group-merge">
                                                    <input className={`form-control ${(error.lastName ? "input-error" : "")}`} placeholder="Enter Your Last Name"
                                                        type="text"
                                                        maxLength={80}
                                                        onChange={(e) => {
                                                            setForm({
                                                                ...form,
                                                                lastName: e.target.value,
                                                            });
                                                            setError({ ...error, lastName: "" })
                                                        }} />
                                                    {error.lastName ? <span className="errormsg">{error.lastName}</span> : ""}
                                                </div>
                                            </div>
                                            <div className="form-group mb-2">
                                                <label className="col-form-label" >DOB <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                <div className="input-group input-group-merge">
                                                    <input className={`form-control ${(error.dob ? "input-error" : "")}`} placeholder="Enter Your DOB"
                                                        type="date"
                                                        max={moment(new Date()).subtract(18, "years").format('YYYY-MM-DD')}
                                                        onChange={(e) => {
                                                            setForm({
                                                                ...form,
                                                                dob: e.target.value,
                                                            });
                                                            setError({ ...error, dob: "" })
                                                        }} />
                                                    {error.dob ? <span className="errormsg">{error.dob}</span> : ""}
                                                </div>
                                            </div>
                                            <div className="form-group mb-2">
                                                <label className="col-form-label">Gender <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                <select id="example-select"
                                                    className={`form-control ${(error.gender ? "error-border" : "")}`} onChange={(e) => {
                                                        setForm({ ...form, gender: e.target.value });
                                                        setError({ ...error, gender: "" })
                                                    }} >
                                                    <option value="">Select Gender</option>
                                                    {genderList.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))}
                                                </select>
                                                {error.gender ? <span className="errormsg">{error.gender}</span> : ""}
                                            </div>
                                            {/* <div className="form-group mb-2">
                                                <label className="col-form-label" >User Type <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                <select className={`form-control ${(error.userType ? "error-border" : "")}`}
                                                    onChange={(e) => {
                                                        setForm({ ...form, userType: e.target.value });
                                                        setError({ ...error, userType: "" })
                                                    }}>
                                                    <option value="">Select User Type</option>
                                                    {userTypes.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))}
                                                </select>
                                                {error.userType ? <span className="errormsg">{error.userType}</span> : ""}
                                            </div> */}

                                            <div className="form-group mb-2">
                                                <label className="col-form-label" >Country <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                <Select
                                                    id="country"

                                                    menuPortalTarget={document.body}
                                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}

                                                    options={countries}
                                                    isMulti={false}
                                                    value={mappedCountry}
                                                    onChange={(e) => {
                                                        setMappedCountry(e)
                                                        let countryData = {}
                                                        countries.filter((s) => {
                                                            if (s.value === e.value) {
                                                                countryData = s
                                                            }
                                                        })
                                                        if (countryData) {
                                                            setForm({ ...form, country: e.value, extn: countryData?.mapping?.countryCode || '00' });
                                                            setSelectedCountryCode(countryData?.mapping?.countryCode || '00')
                                                            setPhoneNumberLength(Number(countryData?.mapping?.phoneNolength) || 20)
                                                            setError({ ...error, country: "" })
                                                            setMappedLocation(null);
                                                            handleOnChangeDropDown(e)
                                                        }
                                                    }}>
                                                    {/* <option value="">Select Country</option>
                                                {countries && countries.map((e) => (
                                                    <option key={e.code} value={e.code}>{e.description}</option>
                                                ))} */}
                                                </Select>
                                                {error.country ? <span className="errormsg">{error.country}</span> : ""}
                                            </div>

                                            <div className="form-group mb-2">
                                                <label className="col-form-label" >Location <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                <Select
                                                    id="location"
                                                    menuPortalTarget={document.body}
                                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                                    options={locations}
                                                    isMulti={false}
                                                    value={mappedLocation}
                                                    onChange={(e) => {
                                                        setMappedLocation(e)
                                                        setForm({ ...form, location: e.value });
                                                        setError({ ...error, location: "" })

                                                    }}>
                                                    {/* <option value="">Select Country</option>
                                                    {countries && countries.map((e) => (
                                                        <option key={e.code} value={e.code}>{e.description}</option>
                                                    ))} */}
                                                </Select>
                                                {error.location ? <span className="errormsg">{error.location}</span> : ""}
                                            </div>
                                            {
                                                mobileVerified === true ?
                                                    ""
                                                    :
                                                    <div className="form-group verific-btn btn-width">
                                                        <label className="col-form-label" >Mobile <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                        <div className="input-group input-group-merge ">
                                                            <input className="form-control form-inline mr-1 col-md-2" type="text" value={"+" + selectedCountryCode} disabled="true" />
                                                            <NumberFormatBase disabled={isMobileFieldsEditable} className={`form-control ${(error.contactNo ? "input-error" : "")} col-md-9`}
                                                                placeholder="Enter Your Mobile Number"
                                                                type="text"
                                                                maxLength={phoneNumberLength}
                                                                onChange={(e) => {
                                                                    setForm({
                                                                        ...form,
                                                                        contactNo: e.target.value,
                                                                    });
                                                                    setError({ ...error, contactNo: "" })
                                                                }} />&nbsp;&nbsp;
                                                            <button className="btn waves-effect waves-light btn-secondary"
                                                                onClick={(e) => {
                                                                    MobileVerification();
                                                                }}
                                                                disabled={disable1}>Verify Mobile</button>
                                                            {error.contactNo ? <span className="errormsg">{error.contactNo}</span> : ""}
                                                        </div>
                                                    </div>
                                            }
                                            {
                                                mobileEnter === true ?
                                                    <div className="form-group verific-btn  btn-width">
                                                        <label className="col-form-label" >Please Enter Mobile Verification OTP <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                        <span className="float-right pt-1" >
                                                            {
                                                                seconds > 0 || minutes > 0 ? (
                                                                    <>
                                                                        Time Remaining: {minutes < 10 ? `0${minutes}` : minutes}: {seconds < 10 ? `0${seconds}` : seconds}
                                                                    </>
                                                                ) : (
                                                                    <>Didn't receive code?</>
                                                                )
                                                            }
                                                            <small className="pl-1 cursor-pointer"
                                                                onClick={() => { if (!(seconds > 0 || minutes > 0)) MobileVerification() }}>
                                                                <a style={seconds > 0 || minutes > 0 ? { color: 'grey' } : {}}>Resend OTP</a>
                                                            </small>
                                                        </span>
                                                        <div className="input-group input-group-merge ">
                                                            <NumberFormatBase className={`form-control ${(error.mobileOTP ? "input-error" : "")} col-md-9`} placeholder="Enter Mobile OTP"

                                                                onChange={(e) => {
                                                                    setForm({ ...form, mobileOTP: e.target.value })
                                                                    setError({ ...error, mobileOTP: "" })
                                                                }} />&nbsp;&nbsp;
                                                            <button className="btn waves-effect waves-light btn-secondary" onClick={verifyMobileOTP}>Submit OTP</button>
                                                            {error.mobileOTP ? <span className="errormsg">{error.mobileOTP}</span> : ""}
                                                        </div>
                                                    </div>
                                                    :
                                                    ""
                                            }
                                            {
                                                mobileVerified === true ?
                                                    <div className="form-group pt-2">
                                                        <span className="col-form-label">Mobile : </span><span>{"+" + form.extn + form.contactNo} &nbsp;<span className="badge badge-outline-green" > Verified</span></span>
                                                    </div>
                                                    :
                                                    ""
                                            }
                                            {
                                                emailVerified === true ? "" :
                                                    <div className="form-group verific-btn">
                                                        <label className="col-form-label" >Email <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                        <div className="input-group input-group-merge">
                                                            <input disabled={isEmailFieldsEditable} className={`form-control ${(error.email ? "input-error" : "")} col-md-9`}
                                                                placeholder="Enter Your Email ID"
                                                                type="text"
                                                                {...bind}
                                                                onChange={(e) => {
                                                                    handleEmailChange(e)
                                                                    setForm({
                                                                        ...form,
                                                                        email: email.address,
                                                                    });
                                                                    setError({ ...error, email: "" })
                                                                }} />&nbsp;&nbsp;
                                                            <button className="btn waves-effect waves-light btn-secondary" disabled={disable2}
                                                                onClick={(e) => { EmailVerification() }}>
                                                                Verify Email
                                                            </button>
                                                            {error.email ? <span className="errormsg">{error.email}</span> : ""}
                                                        </div>
                                                    </div>
                                            }
                                            {
                                                VerifyEmail === true ?
                                                    <div className="form-group verific-btn">
                                                        <label className="col-form-label">Please Enter Email Verification OTP <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                        <span className="float-right pt-1" >
                                                            {
                                                                emailSeconds > 0 || emailMinutes > 0 ? (
                                                                    <>
                                                                        Time Remaining: {emailMinutes < 10 ? `0${emailMinutes}` : emailMinutes}: {emailSeconds < 10 ? `0${emailSeconds}` : emailSeconds}
                                                                    </>
                                                                ) : (
                                                                    <>Didn't receive code?</>
                                                                )
                                                            }
                                                            <small className="pl-1 cursor-pointer"
                                                                onClick={() => { if (!(emailSeconds > 0 || emailMinutes > 0)) EmailVerification() }}>
                                                                <a style={emailSeconds > 0 || emailMinutes > 0 ? { color: 'grey' } : {}}>Resend OTP</a>
                                                            </small>
                                                        </span>
                                                        <div className="input-group input-group-merge ">
                                                            <NumberFormatBase className={`form-control ${(error.emailOTP ? "input-error" : "")} col-md-9`} placeholder="Enter Email OTP"

                                                                onChange={(e) => {
                                                                    setForm({ ...form, emailOTP: e.target.value })
                                                                    setError({ ...error, emailOTP: "" })
                                                                }} />&nbsp;&nbsp;
                                                            <button className="btn waves-effect waves-light btn-secondary" onClick={verifyEmailOTP}>Submit OTP</button>
                                                            {error.emailOTP ? <span className="errormsg">{error.emailOTP}</span> : ""}
                                                        </div>
                                                    </div>
                                                    :
                                                    ""
                                            }
                                            {
                                                emailVerified === true ?
                                                    <div className="form-group">
                                                        <span className="col-form-label">Email : </span><span>{form.email} &nbsp;<span className="badge badge-outline-green"> Verified</span></span>
                                                    </div>
                                                    :
                                                    ""
                                            }
                                            <div className="form-group mb-0 text-center pt-1">
                                                <button className="btn btn-primary btn-block" onClick={(e) => handleSubmit(e)} >Submit</button>&nbsp;
                                            </div>
                                        </div> :
                                        <fieldset className="scheduler-border">
                                            <div className="form-group pt-2">
                                                <p> Thank you. Your registeration is completed successfully. Admin will send you login credentials to your registered email id soon.</p>
                                            </div>
                                        </fieldset>}
                                        <div className="col-12 text-center reg-lnk"><p>If you already have an account? <Link className="col-md-12" to={`{${process.env.REACT_APP_BASE}/user/login}`}>Sign In Here</Link></p></div>
                                    </>
                                </div>
                            </div>
                        </div>
                    </div >
                </div >
            </div >
            <footer className="footer ftr-login footer-alt text-dark">
                Copyright ©<script>document.write(new Date().getFullYear())</script> Bahwan CyberTek. All rights reserved.
            </footer>
        </div >
    );
}
export default Register;
