import React, { useContext, useEffect, useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { properties } from "../properties";
import { post, get} from "../common/util/restUtil";
import { string, object } from "yup";
import logoLight from '../assets/images/newbcaelogo-transparent.png';
import Captcha from 'react-google-recaptcha'
import { toast } from "react-toastify";
import { email } from "../common/util/validateUtil";
import login1 from '../assets/images/login1.jpg';
import login2 from '../assets/images/login2.jpg';
import { AppContext } from "../AppContext";
import { isEmpty } from 'lodash';

const LoginToForgot = () => {
    const history = useHistory();
    const [userCred, setUserCred] = useState({ loginId: "", lastName: "", dob: "" });
    const [error, setError] = useState({});
    const [apiMessage, setApiMessage] = useState();
    const [validCaptcha, setValidCaptcha] = useState(false);
    const [valid, setValid] = useState({ email: true })
    const [selectionType, setSelectionType] = useState('EMAILID')
    const [appsConfig, setAppsConfig] = useState({})
    let { auth, appConfig } = useContext(AppContext);

    const validationSchema = object().shape({
        loginId: selectionType === 'EMAILID' ? string().email("Please Enter Valid Email ID").matches(
            /^[A-Za-z0-9._]+@[A-Za-z0-9.-]+$/,
            "Please Enter Valid Email ID"
        ).required("Please Enter Email ID") : string("Please Enter Valid User ID").required("Please Enter User ID"),
        lastName: selectionType === 'USERID' ? string().required("Please Enter Last Name") : string().nullable(true),
        dob: selectionType === 'USERID' ? string().required("Please Enter DOB") : string().nullable(true)
    });

    const verifyCaptcha = (res) => {
        setValidCaptcha(res ? true : false)
    }

    const validate = () => {
        try {
            validationSchema.validateSync(userCred, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };

    const partialMask = s => s.replace(
        /(?<=^[^@]+)[^@](?=[^@])|(?<=@[^.]+)[^.](?=[^.])/g,
        m => '*'.repeat(m.length)
    );

    const handleSubmit = () => {
        setApiMessage("");
        const error = validate(validationSchema, userCred);
        if (error) return;
        if (validCaptcha === false) {
            toast.error("You missed to click the captcha");
            return;
        }
        if (validCaptcha === true) {

            post(properties.AUTH_API + "/send-forgot-password", userCred)
                .then((resp) => {
                    if (resp.status === 200) {
                        toast.success(`Temporary password has been shared to registered ${selectionType == 'EMAILID' ? 'email' : 'user id'} (${partialMask(userCred.loginId)})`, { autoclose: 3000 })
                        setTimeout(() => {
                            history.push(`${process.env.REACT_APP_BASE}/user/login`)
                        }, 3000);
                    } else {
                        toast.error("Error while changing password")
                        setTimeout(() => {
                            history.push(`${process.env.REACT_APP_BASE}/user/login`)
                        }, 5000);
                    }
                }).catch((error) => {
                    console.log(error)
                })
                .finally();
        }
    };

    const handleCancel = () => {
        setUserCred({ loginId: "", lastName: "", dob: "" })
    }

    const handleTypeChange = (type) => {
        setUserCred({ loginId: "", lastName: "", dob: "" })
        setError({})
        setSelectionType(type);
        if (type === 'USERID') {
            setValid({ email: true });
        }
    }

    useEffect(() => {
        // if (!isEmpty(appConfig)) {
        //     setAppsConfig(appConfig)
        // } else {
            get(properties.MASTER_API + '/get-app-config')
                .then((resp) => {
                    if (resp?.status === 200) {
                        setAppsConfig(resp?.data)
                        sessionStorage.setItem("appConfig", JSON.stringify(resp?.data));
                    }
                }).catch((error) => { console.log(error) })
                .finally()
        // }
    }, [])

    return (
        <div className="login-layout-main authentication-bg authentication-bg-pattern">

            <div className="bg-layer account-pages p-0">
                {/* <img src={login2} alt="" className="img-fluid cmmn-lft-img" /> */}
                {/* <img src={login2} alt="" className="img-fluid cmmn-rht-img" /> */}
                {/* loginboxshadow bg-white */}
                <div className="header-main">
                    <div className="row">
                        <div className="col login-form">
                            <div className="card">
                                <div className="card-body p-3">
                                    <div className="text-center m-auto">
                                        <div className="auth-logo">
                                            <Link to="#" className="logo text-center">
                                                <span className="logo-lg">
                                                    <img src={appsConfig?.appLogo } alt="" height="50" />
                                                </span>
                                            </Link>
                                        </div>
                                    </div>
                                    <hr className="horz-line" />
                                    <div className="text-center m-auto">
                                        <h3 className="text-muted mb-4 mt-2">Forgot Password</h3>
                                    </div>
                                    <>
                                        <div className="scheduler-border">
                                            <div className="myradio">
                                                <input type="radio" name="myRadio" id="Email" className="myradio__input" checked={selectionType === 'EMAILID' ? true : false} onChange={() => handleTypeChange('EMAILID')} value={selectionType} />
                                                <label htmlFor="Email" className="myradio__label">Email ID</label>
                                            </div>
                                            <div className="myradio">
                                                <input type="radio" name="myRadio" id="UserID" className="myradio__input" checked={selectionType === 'USERID' ? true : false} onChange={() => handleTypeChange('USERID')} value={selectionType} />
                                                <label htmlFor="UserID" className="myradio__label">User ID</label>
                                            </div>

                                            {
                                                selectionType === 'EMAILID' ?
                                                    <div className="form-group mb-2">
                                                        <label htmlFor="emailaddress" className="col-form-label">Email ID<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                        <input
                                                            className={`form-control ${(error.loginId ? "input-error" : "")}`}
                                                            type="text"
                                                            placeholder="Enter Your Email ID"
                                                            data-test="email"
                                                            value={userCred.loginId}
                                                            onChange={(e) => {
                                                                setUserCred({ ...userCred, loginId: e.target.value });
                                                                setError({ ...error, loginId: '' })
                                                                let result1 = email(e.target.value)
                                                                setValid({ email: result1 });
                                                            }}
                                                            onKeyPress={(e) => {
                                                                if (e.key === "Enter") handleSubmit();
                                                            }}
                                                        />
                                                        <span className="errormsg">{error.loginId || !valid.email ? !valid.email && !error.loginId ? "" : error.loginId ? error.loginId : "Email is not in correct format" : ""}</span>
                                                    </div>
                                                    :
                                                    <>
                                                        <div className="form-group mb-2">
                                                            <label htmlFor="userId" className="col-form-label">User ID<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                            <input
                                                                className={`form-control ${(error.loginId ? "input-error" : "")}`}
                                                                type="text"
                                                                placeholder="Enter Your User ID"
                                                                data-test="text"
                                                                value={userCred.loginId}
                                                                onChange={(e) => {
                                                                    setUserCred({ ...userCred, loginId: e.target.value });
                                                                    setError({ ...error, loginId: '' })
                                                                }}
                                                                onKeyPress={(e) => {
                                                                    if (e.key === "Enter") handleSubmit();
                                                                }}
                                                            />
                                                            <span className="errormsg">{error.loginId ? <span className="errormsg">{error.loginId}</span> : ""}</span>
                                                        </div>
                                                        <div className="form-group mb-2">
                                                            <label htmlFor="lastName" className="col-form-label">Last Name<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                            <input
                                                                className={`form-control ${(error.lastName ? "input-error" : "")}`}
                                                                type="text"
                                                                placeholder="Enter Your Last Name"
                                                                data-test="lastName"
                                                                value={userCred.lastName}
                                                                onChange={(e) => {
                                                                    const regEx = /^[A-Za-z]+$/;
                                                                    if (e.target.value.match(regEx)) {
                                                                        setUserCred({ ...userCred, lastName: e.target.value });
                                                                        setError({ ...error, lastName: '' })
                                                                    }
                                                                }}
                                                                onKeyPress={(e) => {
                                                                    if (e.key === "Enter") handleSubmit();
                                                                }}
                                                            />
                                                            <span className="errormsg">{error.lastName ? <span className="errormsg">{error.lastName}</span> : ""}</span>
                                                        </div>
                                                        <div className="form-group mb-2">
                                                            <label htmlFor="dob" className="col-form-label">DOB<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                                            <input
                                                                className={`form-control ${(error.dob ? "input-error" : "")}`}
                                                                type="date"
                                                                placeholder="Enter Your DOB"
                                                                data-test="dob"
                                                                value={userCred.dob}
                                                                onChange={(e) => {
                                                                    setUserCred({ ...userCred, dob: e.target.value });
                                                                    setError({ ...error, dob: '' })
                                                                }}
                                                                onKeyPress={(e) => {
                                                                    if (e.key === "Enter") handleSubmit();
                                                                }}
                                                            />
                                                            <span className="errormsg">{error.dob ? <span className="errormsg">{error.dob}</span> : ""}</span>
                                                        </div>
                                                    </>
                                            }
                                            <div className="form-group mb-2 captcha"
                                                onKeyPress={(e) => {
                                                    if (e.key === "Enter") handleSubmit();
                                                }}
                                                tabIndex="0">
                                                <Captcha
                                                    sitekey={'6LdzapwdAAAAAAyO0js4SHNxfL0hogzYzr47tkjE'}
                                                    onChange={verifyCaptcha}
                                                />
                                            </div>
                                            <div className="col-12 row mb-2 pr-0">
                                                <div className="col-12 text-center">
                                                    <button className="ml-2 btn btn-primary waves-effect waves-light btn-block" type="button" onClick={handleSubmit}>Submit</button>
                                                    <button className="ml-2 btn btn-primary btn-clear btn-block mt-2" type="button" onClick={handleCancel}>Clear</button>
                                                </div>
                                            </div>
                                            {apiMessage !== "" ? <p className="error-msg">{apiMessage}</p> : ""}
                                        </div>
                                    </>
                                    <div id="step2">
                                        <fieldset className="scheduler-border d-none">
                                            <h3>Reset password request has been received. Administrator will send your new temporary login password to your registered email. Thank you.</h3>
                                        </fieldset>
                                    </div>
                                    <div className="col-12 text-center reg-lnk fgt-pwd">
                                        <p><Link to={`${process.env.REACT_APP_BASE}/user/login`}>Back to Sign In</Link></p>
                                        <p>Still having an issue? Contact <a href="mailto:bcaeappsupport@bahwancybertek.com">bcaeappsupport@bahwancybertek.com</a></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <footer className="footer ftr-login footer-alt text-dark">
                Copyright ©<script>document.write(new Date().getFullYear())</script> Bahwan CyberTek. All rights reserved.
            </footer>
        </div >
    );
};

export default LoginToForgot;
