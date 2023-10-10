
import React, { useState, useEffect, useContext } from "react";
import { useHistory, Link } from "react-router-dom";
import { properties } from "../properties";
import { get, post } from "../common/util/restUtil";
import { string, object } from "yup";
import { useTranslation } from "react-i18next";
import logoLight from '../assets/images/logo-light.png';
import { toast } from "react-toastify";
import { isEmpty } from 'lodash';
import { AppContext } from "../AppContext";
import { Tooltip } from "react-tooltip";
import login2 from '../assets/images/login2.jpg';
import "react-tooltip/dist/react-tooltip.css";

const validationSchema = object().shape({
    oldPassword: string().required("Please Enter Temporary Password"),
    password: string().required("Please Enter New Password"),
    confirmPassword: string().required("Please Confirm New Password"),
});


const FirstTimeChangePassword = (props) => {

    const { t } = useTranslation();
    const history = useHistory();
    const [data, setData] = useState()
    const [error, setError] = useState({});
    const [apiMessage, setApiMessage] = useState();
    const [showPassword1, setShowPassword1] = useState(false)
    const [showPassword2, setShowPassword2] = useState(false)
    const [showPassword3, setShowPassword3] = useState(false)
    const [appsConfig, setAppsConfig] = useState({})
    let { auth, setAuth, appConfig } = useContext(AppContext);

    const [newPassword, setNewPassword] = useState({
        password: "",
        confirmPassword: "",
        email: "",
        oldPassword: "",
        forceChangePwd: true
    })

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

    useEffect(() => {
        get(properties.AUTH_API + "/token/" + props.match.params.forgotpasswordtoken).then(resp => {
            if (resp.data) {
                setData(resp.data)
                // setForm({ ...form, email: resp.data.email })
                // setUser(resp.data)
            }
        }).catch((error) => {
            setTimeout(() => {
                history.push(`${process.env.REACT_APP_BASE}/user/login`)
            }, 3000);
        }).finally()
    }, []);

    const validate = () => {
        try {
            validationSchema.validateSync(newPassword, { abortEarly: false });
        } catch (e) {
            e.inner.forEach((err) => {
                setError((prevState) => {
                    return { ...prevState, [err.params.path]: err.message };
                });
            });
            return e;
        }
    };
    const handelcancel = () => {
        setNewPassword({
            ...newPassword,
            password: "",
            confirmPassword: "",
            // email: "",
            oldPassword: ""
        });
    }

    const changePassword = () => {
        setApiMessage("");
        const error = validate(validationSchema, newPassword);
        if (error) return;

        if (newPassword.password !== newPassword.confirmPassword) {
            toast.error("Oops, Provided password doesn't match");
        } else if (newPassword.password == newPassword.oldPassword || newPassword.confirmPassword == newPassword.oldPassword) {
            toast.error("Your temporary password cannot be your new password");
        } else if (newPassword.password === newPassword.confirmPassword) {
            var pass = newPassword.password;
            var reg = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})"); //Minimum eight characters, at least one letter, one number and one special character:
            var test = reg.test(pass);
            setNewPassword({ ...newPassword, email: data.email })
            let obj = {
                password: newPassword.password,
                confirmPassword: newPassword.confirmPassword,
                email: data.email,
                oldPassword: newPassword.oldPassword,
                forceChangePwd: true
            }
            if (test) {
                post(properties.AUTH_API + "/reset-password", obj)
                    .then((resp) => {

                        if (resp.status === 200) {
                            toast.success("You have successfully changed password, Redirecting you to login page", { autoclose: 5000 })
                            setTimeout(() => {
                                setAuth({});
                                history.push(`${process.env.REACT_APP_BASE}/user/login`)
                            }, 5000);

                        }
                        else {
                            toast.error("Error while creating password")
                        }
                    }).catch((error) => {
                        console.log(error)
                    }).finally()
            }
            else {
                toast.error("Password must be at least 8 characters long and contains at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 special character");
            }
        }
    }

    return (
        <div className="authentication-bg authentication-bg-pattern">
            <div className="account-pages mt-2 pt-2 col-md-10 offset-md-1">
                <img src={login2} alt="" className="img-fluid cmmn-lft-img" />
                <img src={login2} alt="" className="img-fluid cmmn-rht-img" />
                <div className="loginboxshadow">
                    <div className="row">
                        <div className="col login-form p-0">
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
                                        <h3 className="text-muted mb-4 mt-2">Change Password</h3>
                                    </div>
                                    <p className="bold p-2">You need to update your password because this is the first time you are sigining in with temporary password.</p>
                                    <div >
                                        {data &&
                                            <div className="form-group col-12 row pl-2">
                                                <div className="col-12">
                                                    <span className="col-form-label">Email Address:  : </span><span>{data.email}</span>
                                                </div>
                                                <div className="col-12">
                                                    <span className="col-form-label">User ID : </span><span>{data.loginId}</span>
                                                </div>
                                            </div>
                                        }
                                        <br />
                                        <div className="form-group pt-2">
                                            <label htmlFor="field-2" className="col-form-label">Temporary Password<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <div className="input-group input-group-merge">
                                                <input className={`form-control ${(error.oldPassword ? "input-error" : "")}`}
                                                    placeholder="Enter Your Password"
                                                    type={showPassword1 === false ? "password" : "text"}
                                                    value={newPassword.oldPassword}
                                                    onChange={(e) => {
                                                        setNewPassword({
                                                            ...newPassword,
                                                            oldPassword: e.target.value,
                                                        });
                                                        setError({ ...error, oldPassword: '' })
                                                    }} />
                                                <div className={`input-group-append ${showPassword1 === false ? "" : "show-password"}`} data-password="false" onClick={() => setShowPassword1(!showPassword1)}>
                                                    <div className="input-group-text" style={showPassword1 === false ? { cursor: "pointer" } : { backgroundColor: "", cursor: "pointer" }}>
                                                        <span className="password-eye font-12"></span>
                                                    </div>
                                                </div>
                                                {error.oldPassword ? <span className="errormsg">{error.oldPassword}</span> : ""}
                                            </div>
                                        </div>

                                        <div className="form-group pt-2">
                                            <span className="float-right "><svg data-tip id="registerTip" data-htmlFor="registerTip" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-alert-octagon icon-dual"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></span>
                                            <label htmlFor="field-2" className="col-form-label">New Password<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <Tooltip anchorId="registerTip" place="top" effect="float" textColor="white">
                                                Hint for Strong Password<hr /><br></br>
                                                Must be atleast 8 characters long<br></br>
                                                Contain both lower and upper case<br></br>
                                                Contain Number<br></br>
                                                Contain Special Characters Such as !@#&$
                                            </Tooltip>
                                            <div className="input-group input-group-merge">
                                                <input
                                                    className={`form-control ${(error.password ? "input-error" : "")}`}
                                                    placeholder="Enter Your Password"
                                                    type={showPassword2 === false ? "password" : "text"}
                                                    value={newPassword.password}
                                                    onChange={(e) => {
                                                        setNewPassword({
                                                            ...newPassword,
                                                            password: e.target.value,
                                                        });
                                                        setError({ ...error, password: '' })
                                                    }} />
                                                <div className={`input-group-append ${showPassword2 === false ? "" : "show-password"}`} data-password="false" onClick={() => setShowPassword2(!showPassword2)}>
                                                    <div className="input-group-text" style={showPassword2 === false ? { cursor: "pointer" } : { backgroundColor: "", cursor: "pointer" }}>
                                                        <span className="password-eye font-12"></span>
                                                    </div>
                                                </div>
                                                {error.password ? <span className="errormsg">{error.password}</span> : ""}
                                            </div>
                                        </div>

                                        <div className="form-group pt-2">
                                            <span className="float-right "><svg data-tip id="passwordTip" data-htmlFor="passwordTip" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-alert-octagon icon-dual"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></span>
                                            <label htmlFor="field-2" className="col-form-label">Confirm New Password<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                            <Tooltip anchorId="passwordTip" place="top" effect="float" textColor="white">
                                                Hint for Strong Password<hr /><br></br>
                                                Must be atleast 8 characters long<br></br>
                                                Contain both lower and upper case<br></br>
                                                Contain Number<br></br>
                                                Contain Special Characters Such as !@#&$
                                            </Tooltip>
                                            <div className="input-group input-group-merge">
                                                <input
                                                    className={`form-control ${(error.confirmPassword ? "input-error" : "")}`}
                                                    type={showPassword3 === false ? "password" : "text"}
                                                    placeholder="Enter Your Password"
                                                    value={newPassword.confirmPassword}
                                                    onChange={(e) => {
                                                        setNewPassword({
                                                            ...newPassword,
                                                            confirmPassword: e.target.value,
                                                        });
                                                        setError({ ...error, confirmPassword: '' })
                                                    }}
                                                />
                                                <div className={`input-group-append ${showPassword3 === false ? "" : "show-password"}`} data-password="false" onClick={() => setShowPassword3(!showPassword3)}>
                                                    <div className="input-group-text" style={showPassword3 === false ? { cursor: "pointer" } : { backgroundColor: "", cursor: "pointer" }}>
                                                        <span className="password-eye font-12"></span>
                                                    </div>
                                                </div>
                                                {error.confirmPassword ? <span className="errormsg">{error.confirmPassword}</span> : ""}
                                            </div>
                                        </div>
                                        <div className="form-group mb-0 text-center pt-2">
                                            <button className="btn btn-primary btn-block" type="button" onClick={changePassword}>Change Password </button>
                                        </div>
                                        <div className="col-12 text-center reg-lnk fgt-pwd mt-2">
                                            <p><Link to={`${process.env.REACT_APP_BASE}/user/login`}>Go to Sign In</Link></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div >
                </div >
            </div >
            <footer className="footer ftr-login footer-alt text-dark mt-3">
                Copyright ©<script>document.write(new Date().getFullYear())</script> Bahwan CyberTek. All rights reserved.
            </footer>
        </div >
    );
}
export default FirstTimeChangePassword;
