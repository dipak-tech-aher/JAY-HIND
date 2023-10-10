import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../../../AppContext";
import { get, put, post } from "../../../common/util/restUtil";
import { properties } from "../../../properties";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { NumberFormatBase } from "react-number-format";
import { string, object } from "yup";

const validationSchema = object().shape({
    firstName: string().required("First Name is required"),
    lastName: string().required("Last Name is required"),
    country: string().required("Country is required"),
    loc: string().required("Location is required"),
    gender: string().required("Gender is required"),
    userType: string().required("User Type is required")
});

const emailValidationSchema = object().shape({
    email: string().email("Please Enter Valid Email ID").matches(
        /^[A-Za-z0-9._]+@[A-Za-z0-9.-]+$/,
        "Enter Valid Email ID"
    ).required("Please Enter Email ID")
});
const emailOTPValidationSchema = object().shape({
    emailOTP: string().required("Please Enter Email OTP")
});

const mobileValidationSchema = object().shape({
    contactNo: string().required("Contact No is required")
});

const mobileOTPValidationSchema = object().shape({
    mobileOTP: string().required("Please Enter Mobile Verification Code")
});

const EditProfile = (props) => {
    let { auth, setAuth } = useContext(AppContext);
    const history = useHistory();
    const setState = props.setState
    const state = props.state
    const data = props.data
    const [userData, setUserData] = useState(props.data);
    const [showOTP, setShowOTP] = React.useState(false)
    const [verficationCode, setVerficationCode] = React.useState(false)
    const [error, setError] = useState({});
    const [mobileVerified, setMobileVerified] = useState(true);
    const [editMobile, setEditMobile] = useState(false);
    const [editEmail, setEditEmail] = useState(false);
    const [emailVerified, setEmailVerified] = useState(true);
    const [showCountry, setShowCountry] = useState(false);
    const locations = props.locations
    const countries = props.countries
    const userTypes = props.userTypes
    const genderList = props.genderList
    const phoneNumberLength = props.phoneNumberLength
    const setPhoneNumberLength = props.setPhoneNumberLength
    const selectedCountryCode = props.selectedCountryCode
    const setSelectedCountryCode = props.setSelectedCountryCode
    const [disable1, setDisable1] = useState(false)
    const [disable2, setDisable2] = useState(false)
    const [minutes, setMinutes] = useState(1);
    const [seconds, setSeconds] = useState(30);

    const [emailMinutes, setEmailMinutes] = useState(1);
    const [emailSeconds, setEmailSeconds] = useState(30);

    useEffect(() => {
        setUserData(props.data)
    }, [props.data])

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


    const handleOTP = () => {
        if (validate(mobileValidationSchema, userData)) {
            return;
        }
        if (!userData.country) {
            toast.error("Please Provide Country for Mobile Verification")
            return;
        }
        if (String(userData.contactNo || 0).length !== phoneNumberLength) {
            toast.error("Oops, Provided mobile number is invalid or not complete, request to provide correct mobile number")
            return;
        }
        let obj = {
            reference: userData.contactNo,
            firstName: userData.firstName,
            extn: userData.extn
        }

        post(properties.AUTH_API + "/send-otp" + "?type=mobile&source=EDITPROFILE", obj).then((resp) => {
            if (resp.status === 200) {
                setEditMobile(true);
                setDisable1(true);
                setShowOTP(true)
                setMinutes(1);
                setSeconds(30);
                toast.success("OTP sent successfully.");
            } else {
                toast.error("Error while sending OTP");
            }
        }).catch((error) => {
            console.log(error)
        }).finally()
    }

    const handleVerficationCode = () => {
        if (validate(emailValidationSchema, userData)) {
            return;
        }
        let obj = {
            reference: userData.email,
            firstName: userData.firstName,
        }

        post(properties.AUTH_API + "/send-otp" + "?type=email&source=EDITPROFILE", obj).then((resp) => {
            if (resp.status === 200) {
                setEditEmail(true);
                setDisable2(true);
                setVerficationCode(true)
                setEmailMinutes(1);
                setEmailSeconds(30);
                toast.success("OTP sent successfully.");
            } else {
                toast.error("Error while sending OTP");
            }
        }).catch((error) => {
            console.log(error)
        }).finally()
    }

    const handleSubmit = () => {
        if (String(userData.contactNo || 0).length !== phoneNumberLength) {
            toast.error("Oops, Provided mobile number is invalid or not complete, request to provide correct mobile number")
            return;
        }
        if (mobileVerified === false) {
            toast.error("Please Verify Mobile Number.");
            return;
        }
        if (emailVerified === false) {
            toast.error("Please Verify Email ID");
            return;
        }
        let error = validate(validationSchema, userData)
        let mobileError = validate(mobileValidationSchema, userData)
        let emailError = validate(emailValidationSchema, userData)
        if (error || mobileError || emailError) {
            return;
        }
        if (editMobile === true) {
            toast.error("Please Verify Mobile Number.");
            return;
        }
        if (editEmail === true) {
            setError({ ...error, mobileOTP: "Please Enter Email OTP" });
            toast.error("Please Verify Email ID");
            return;
        }
        setMobileVerified(true);
        setEmailVerified(true);
        const reqBody = userData
        // delete reqBody.loginid
        delete reqBody.photo
        delete reqBody.mobileOTP
        delete reqBody.emailOTP
        delete reqBody.statusDesc
        delete reqBody.userGroupDesc
        delete reqBody.managerDetail
        delete reqBody.genderDesc

        put(properties.USER_API + "/update/" + auth.user.userId, { ...reqBody, biAccess: reqBody.biAccess ? 'Y' : 'N' })
            .then((resp) => {
                if (resp.status === 200) {
                    setAuth(prevState => ({
                        ...prevState, user: {
                            ...prevState.user, country: userData.country, firstName: userData.firstName, lastName: userData.lastName,
                            loc: userData.loc, contactNo: userData.contactNo, gender: userData.gender, email: userData.email,
                            userType: userData.userType, extn: userData.extn
                        }
                    }))
                    setState(!state)
                    toast.success("User updated successfully.");
                } else {
                    toast.error("Error while updating user.");
                }
            }).catch((error) => {
                console.log(error)
            })
            .finally()
    }

    const verifyMobileOTP = () => {
        if (validate(mobileOTPValidationSchema, data)) {
            return;
        }

        get(properties.AUTH_API + "/verify-otp/" + userData.contactNo + "?type=mobile&otp=" + userData.mobileOTP).then((resp) => {
            if (resp.status) {
                if (resp.status === 200) {
                    setMobileVerified(true);
                    setShowOTP(false);
                    setEditMobile(false);
                    setShowCountry(false)
                    setDisable1(false);
                    toast.success("Mobile number verified.");
                }
                else {
                    toast.error("Please enter correct OTP");
                }
            } else {
                toast.error("Error while fetching OTP");
            }
        }).catch((error) => {
            console.log(error)
        }).finally()
    }

    const verifyEmailOTP = () => {
        if (validate(emailOTPValidationSchema, data)) {
            return;
        }

        get(properties.AUTH_API + "/verify-otp/" + userData.email + "?type=email&otp=" + userData.emailOTP).then((resp) => {
            if (resp.status) {
                if (resp.status === 200) {
                    toast.success("Email verified.");
                    setEmailVerified(true);
                    setEditEmail(false);
                    setVerficationCode(false);
                    setDisable2(false);
                }
                else {
                    toast.error("Please enter correct OTP");
                }

            } else {
                toast.error("Error while fetching OTP");
            }
        }).catch((error) => {
            console.log(error)
        }).finally()

    }
    const handleEditMobile = () => {
        setShowCountry(true);
        setMobileVerified(false);

    }
    const handleEditEmail = () => {
        setEmailVerified(false);
    }
    const handleCancel = () => {
        history.push(`${process.env.REACT_APP_BASE}}`);
    }

    return (
        <>
            <div id="searchBlock12" style={{ display: "block" }}>
                <div className="row pt-2">
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="field-2" className="control-label">First Name <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                            <input type="text"
                                className={`form-control pb-2 ${(error.firstName ? "input-error" : "")}`}
                                placeholder="Enter First Name"
                                maxLength={40}
                                onChange={(e) => {
                                    data.firstName = e.target.value;
                                    setUserData({ ...userData, firstName: e.target.value })
                                    setError({ ...error, firstName: "" })
                                }}
                                value={userData.firstName} />
                            {error.firstName ? <span className="errormsg">{error.firstName}</span> : ""}
                            <br />
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="field-2" className="control-label">Last Name <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                            <input type="text"
                                className={`form-control pb-2 ${(error.lastName ? "input-error" : "")}`}
                                placeholder="Enter Last Name"
                                maxLength={80}
                                onChange={(e) => {
                                    data.lastName = e.target.value;
                                    setUserData({ ...userData, lastName: e.target.value })
                                    setError({ ...error, lastName: "" })
                                }}
                                value={userData.lastName} />
                            {error.lastName ? <span className="errormsg">{error.lastName}</span> : ""}
                            <br />
                        </div>

                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <div className="form-group">
                            <label htmlFor="field-2" className="control-label">Country <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                            <select
                                className={`form-control ${(error.country ? "input-error" : "")}`}
                                disabled={showCountry === false ? true : false}
                                value={userData.country}
                                required
                                onChange={(e) => {
                                    let countryData
                                    countryData = countries.find((s) => s.code === e.target.value)
                                    data.country = e.target.value;
                                    data.extn = countryData?.mapping?.countryCode
                                    setUserData({ ...userData, country: e.target.value, extn: countryData?.mapping?.countryCode || '00' })
                                    setError({ ...error, country: "" })
                                    setSelectedCountryCode(countryData?.mapping?.countryCode || '00')
                                    setPhoneNumberLength(Number(countryData?.mapping?.phoneNolength) || 20)
                                }}>
                                <option value="">Please Select Country</option>
                                {countries && countries.map((e) => (
                                    <option key={e.code} value={e.code}>{e.description}</option>
                                ))}
                            </select>
                            {error.country ? <span className="errormsg">{error.country}</span> : ""}
                        </div>
                    </div>
                    <div className="col-6">
                        {
                            mobileVerified === false ?
                                <div className="form-group">
                                    <label className="control-label">Mobile (update require OTP) <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                    {
                                        disable1 === true ?
                                            <span className="float-right" >
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
                                                    onClick={() => { if (!(seconds > 0 || minutes > 0)) handleOTP() }}>
                                                    <a style={seconds > 0 || minutes > 0 ? { color: 'grey' } : {}}>Resend OTP</a>
                                                </small>
                                            </span>
                                            :
                                            ""
                                    }
                                    <div className="input-group input-group-merge">
                                        <input className="form-control form-inline mr-1 col-md-2" type="text"
                                            value={"+" + selectedCountryCode} disabled="true" />
                                        <NumberFormatBase
                                            type="text"
                                            maxLength={phoneNumberLength}
                                            placeholder="Enter Mobile Number"
                                            className={`form-control pb-2 col-md-9  ${(error.contactNo ? "input-error" : "")}`}
                                            value={userData.contactNo}
                                            onChange={(e) => {
                                                data.contactNo = e.target.value;
                                                setUserData({ ...userData, contactNo: e.target.value })
                                                setError({ ...error, contactNo: "" })
                                            }}
                                        />
                                        &nbsp;&nbsp;
                                        <button className="btn btn-secondary" disabled={disable1} onClick={handleOTP}>Verify Mobile</button><br />
                                        {error.contactNo ? <span className="errormsg">{error.contactNo}</span> : ""}
                                    </div><br />

                                    {showOTP ?

                                        <div className="input-group input-group-merge ">
                                            <input className={`form-control ${(error.mobileOTP ? "input-error" : "")} `} placeholder="Enter Mobile OTP"
                                                type="text"
                                                onChange={(e) => {
                                                    data.mobileOTP = e.target.value;
                                                    setUserData({ ...userData, mobileOTP: e.target.value })
                                                    setError({ ...error, mobileOTP: "" })
                                                }} />&nbsp;&nbsp;
                                            <button className="btn btn-secondary" onClick={verifyMobileOTP}>Submit OTP</button>
                                            {error.mobileOTP ? <span className="errormsg">{error.mobileOTP}</span> : ""}
                                        </div>
                                        :
                                        <></>
                                    }
                                </div> :
                                <></>
                        }

                        {
                            mobileVerified === true ?
                                <div className="form-group">
                                    <label className="control-label">Mobile :</label>
                                    <span>&nbsp;<span className="badge badge-outline-green cursor-pointer">Verified</span></span>
                                    <span><span className="float-right pt-0 cursor-pointer" ><small className="text-danger" onClick={handleEditMobile}>Edit</small></span></span>
                                    <div className="input-group input-group-merge ">
                                        <input className="form-control form-inline mr-1 col-md-3" type="text" value={"+" + selectedCountryCode} disabled="true" />
                                        <input
                                            type="text"
                                            maxLength={phoneNumberLength}
                                            readOnly="true"
                                            className="form-control pb-2 col-md-9"
                                            value={userData.contactNo} /><br />
                                    </div>
                                </div>
                                :
                                <></>
                        }
                    </div>
                </div>
                <div className="row">
                    <div className="col-6 pt-1">
                        <div className="form-group">
                            <label className="control-label">Location <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                            <select
                                className={`form-control ${(error.loc ? "input-error" : "")}`}
                                id="example-select"
                                value={userData.loc}
                                required
                                onChange={(e) => {
                                    data.loc = e.target.value;
                                    setUserData({ ...userData, loc: e.target.value })
                                    setError({ ...error, loc: "" })
                                }}>
                                <option value="">Please Select Location</option>
                                {locations && locations.map((e) => (
                                    <option key={e.code} value={e.code}>{e.description}</option>
                                ))}
                            </select>
                            {error.loc ? <span className="errormsg">{error.loc}</span> : ""}
                        </div>
                    </div>
                    <div className="col-6">
                        {
                            emailVerified === false ?
                                <div className="form-group pt-1">
                                    <label htmlFor="field-2" className="control-label">Email (update require Email Verification) <span className="text-danger font-20 pl-1 fld-imp">*</span> </label>
                                    {
                                        disable2 === true ?
                                            <span className="float-right" >
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
                                                    onClick={() => { if (!(emailSeconds > 0 || emailMinutes > 0)) handleVerficationCode() }}>
                                                    <a style={emailSeconds > 0 || emailMinutes > 0 ? { color: 'grey' } : {}}>Resend OTP</a>
                                                </small>
                                            </span>
                                            :
                                            ""
                                    }
                                    <div className="input-group input-group-merge">
                                        <input type="text"
                                            className={`form-control pb-1 ${(error.email ? "input-error" : "")}`}
                                            placeholder="Enter Email"
                                            value={userData.email}
                                            onChange={(e) => {
                                                data.email = e.target.value;
                                                setError({ ...error, email: "" })
                                                setUserData({ ...userData, email: e.target.value })
                                                setError({ ...error, email: "" })
                                            }}
                                        />&nbsp;&nbsp;
                                        <button disabled={disable2} className="btn btn-secondary" onClick={handleVerficationCode}>Verify Email</button>
                                        {error.email ? <span className="errormsg">{error.email}</span> : ""}
                                    </div>
                                    <br />
                                    {verficationCode === true ?
                                        <div className="input-group input-group-merge ">
                                            <input className={`form-control ${(error.emailOTP ? "input-error" : "")}`}
                                                placeholder="Enter Email OTP"
                                                type="text"
                                                onChange={(e) => {
                                                    data.emailOTP = e.target.value;
                                                    setUserData({ ...userData, emailOTP: e.target.value })
                                                    setError({ ...error, emailOTP: "" })
                                                }}
                                            />&nbsp;&nbsp;
                                            <button className="btn btn-secondary" onClick={verifyEmailOTP}>Submit OTP</button>
                                            {error.emailOTP ? <span className="errormsg">{error.emailOTP}</span> : ""}
                                        </div>
                                        :
                                        <></>
                                    }
                                </div>
                                :
                                <></>
                        }
                        {
                            emailVerified === true ?
                                <div className="form-group pt-1">
                                    <label className="control-label">Email :</label>
                                    <span>&nbsp;<span className="badge badge-outline-green cursor-pointer">Verified</span></span>
                                    <span><span className="float-right cursor-pointer" ><small className="text-danger" onClick={handleEditEmail}>Edit</small></span></span>
                                    <input type="text"
                                        className="form-control mt-1"
                                        readOnly="true"
                                        value={userData.email}
                                    />
                                </div>
                                :
                                <></>
                        }
                    </div>
                </div>
                <div className="row">
                    <div className="col-6 pt-1">
                        <div className="form-group">
                            <label className="control-label">Gender <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                            <select id="example-select"
                                value={userData.gender}
                                className={`form-control ${(error.gender ? "input-error" : "")}`}
                                onChange={(e) => {
                                    data.gender = e.target.value;
                                    setUserData({ ...userData, gender: e.target.value });
                                    setError({ ...error, gender: "" })
                                }} >
                                <option value="">Please Select Gender</option>
                                {genderList && genderList.map((e) => (
                                    <option key={e.code} value={e.code}>{e.description}</option>
                                ))}
                            </select>
                            {error.gender ? <span className="errormsg">{error.gender}</span> : ""}
                        </div>
                    </div>
                    <div className="col-6 ">
                        <div className="form-group pt-1">
                            <label htmlFor="field-2" className="control-label">User Group <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                            <p className="form-control">{userData?.userGroupDesc?.description}</p>
                        </div>
                    </div>
                    <div className="col-6 ">
                        <div className="form-group pt-1">
                            <label htmlFor="field-2" className="control-label">User Type <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                            <select className={`form-control ${(error.userType ? "input-error" : "")}`} required
                                value={userData.userType}
                                disabled={true}
                                onChange={(e) => {
                                    data.userType = e.target.value;
                                    setUserData({ ...userData, userType: e.target.value })
                                    setError({ ...error, userType: "" })
                                }}>
                                <option value="">Select...</option>
                                {userTypes && userTypes.map((e) => (
                                    <option key={e.code} value={e.code}>{e.description}</option>
                                ))}
                            </select>
                            {error.userType ? <span className="errormsg">{error.userType}</span> : ""}
                        </div>
                    </div>
                    <div className="col-6 ">
                        <div className="form-group pt-1">
                            <label htmlFor="field-2" className="control-label">Manager <span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                            <p className="form-control">{userData?.managerDetail ? (userData?.managerDetail?.firstName + " " + userData?.managerDetail?.lastName) : ''}</p>
                        </div>
                    </div>
                    <div className="col-12">
                        <div className="form-group pt-1">
                            {userData?.userSkills?.length > 0 && (
                                <React.Fragment>
                                    <label>Skills: </label>
                                    <ul>
                                        {userData?.userSkills?.map((skill, idx) => (
                                            <li key={idx}>{`${idx + 1}.)`} {skill.skillDesc}</li>
                                        ))}
                                    </ul>
                                </React.Fragment>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-12">
                    <div className="prof-btn">
                        <div className="text-center">
                            <button type="button" className="skel-btn-submit" onClick={handleSubmit}>Update</button>&nbsp;
                            <button type="button" className="skel-btn-cancel" onClick={handleCancel}>Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export default EditProfile;
