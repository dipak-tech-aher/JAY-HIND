import React, { useState, useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { properties } from "../properties";
import { post , remove} from "../common/util/restUtil";
import { AppContext } from "../AppContext";
import { string, object } from "yup";
import { toast } from "react-toastify";
import { Tooltip }  from "react-tooltip";

const validationSchema = object().shape({
    oldPassword: string().required("Please Enter Current Password"),
    password: string().required("Please Enter New Password"),
    confirmPassword: string().required("Please Confirm New Password"),
});

const ChangePassword = (props) => {
    const history = useHistory();

    const [error, setError] = useState({});
    const [apiMessage, setApiMessage] = useState();
    const [showPassword1, setShowPassword1] = useState(false)
    const [showPassword2, setShowPassword2] = useState(false)
    const [showPassword3, setShowPassword3] = useState(false)
    let { auth, setAuth } = useContext(AppContext);

    const [newPassword, setNewPassword] = useState({
        password: "",
        confirmPassword: "",
        email: "",
        oldPassword: ""
    })

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
            email: "",
            oldPassword: ""
        });
        setShowPassword1(false);
        setShowPassword2(false);
        setShowPassword3(false);
        history.push(`${process.env.REACT_APP_BASE}}`);
    }

    const changePassword = () => {
        setApiMessage("");
        const error = validate(validationSchema, newPassword);
        if (error) return;

        if (newPassword.password !== newPassword.confirmPassword) {
            toast.error("Oops, Provided password doesn't match");
        } else if (newPassword.password == newPassword.oldPassword || newPassword.confirmPassword == newPassword.oldPassword) {
            toast.error("Your new password cannot be the same as old password");
        } else if (newPassword.password === newPassword.confirmPassword) {
            var pass = newPassword.password;
            var reg = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})"); //Minimum eight characters, at least one letter, one number and one special character:
            var test = reg.test(pass);
            console.log(newPassword)
            let obj = {
                email: props?.data?.email,
                oldPassword: newPassword.oldPassword,
                password: newPassword.password,
                confirmPassword: newPassword.confirmPassword,
                forceChangePwd: false,
            }
            if (test) {
                post(properties.AUTH_API + "/reset-password", obj)
                    .then((resp) => {
                        if (resp.status === 200) {
                            toast.success("You have successfully changed password, Redirecting you to login page", { autoclose: 12000 })
                            
                            setTimeout(() => {
                                remove(properties.AUTH_API + "/logout/" + props?.data?.userId)
                                .then((resp) => {
                                    if (resp.status === 200) {
                                        setAuth({});
                                        sessionStorage.clear()
                                        localStorage.clear();
                                    }
                                }).catch((error) => {
                                    console.log(error)
                                })
                                .finally();
                            }, 3000)
                        }
                        else {
                            toast.error("Error while creating Password")
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
        <>
            <div className="adv-srh-sect" id="change-pass">
                <div lass="col-md-4">
                    <div className="row">
                        <div className="col-4 pt-2">
                            <div className="form-group">
                                <label htmlFor="field-2" className="control-label">Current Password&nbsp;<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                                <div className="input-group input-group-merge">
                                    <input className={`form-control ${(error.oldPassword ? "input-error" : "")}`}
                                        placeholder="Please Enter Current Password"
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
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4 pt-2">
                            <div className="form-group">
                                <span className="float-right "><svg data-tip id="registerTip" data-htmlFor="registerTip" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-alert-octagon icon-dual"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></span>
                                <label className="control-label" >New Password &nbsp;<span className="text-danger font-20 pl-1 fld-imp">*</span></label>

                                <Tooltip anchorId="registerTip" place="top" effect="float" textColor="white">
                                    Hint for Strong Password<hr /><br></br>
                                    Must be atleast 8 characters long<br></br>
                                    Should Contain both lower and upper case<br></br>
                                    Should Contain Number<br></br>
                                    Should Contain Special Characters Such as !@#&$
                                </Tooltip>
                                <div className="input-group input-group-merge">
                                    <input
                                        className={`form-control ${(error.password ? "input-error" : "")}`}
                                        placeholder="Please Enter New Password"
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
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-4 pt-2">
                            <div className="form-group">
                                <span className="float-right "><svg data-tip id="confPass" data-htmlFor="confPass" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-alert-octagon icon-dual"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"></polygon><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></span>
                                <label className="control-label" >Confirm Password &nbsp;<span className="text-danger font-20 pl-1 fld-imp">*</span></label>

                                <Tooltip anchorId="confPass" place="top" effect="float" textColor="white">
                                    Hint for Strong Password<hr /><br></br>
                                    Must be atleast 8 characters long<br></br>
                                    Should Contain both lower and upper case<br></br>
                                    Should Contain Number<br></br>
                                    Should Contain Special Characters Such as !@#&$
                                </Tooltip>
                                <div className="input-group input-group-merge">
                                    <input
                                        className={`form-control ${(error.confirmPassword ? "input-error" : "")}`}
                                        type={showPassword3 === false ? "password" : "text"}
                                        placeholder="Please Enter Confrim New Password"
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
                        </div>

                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <div className="prof-btn">
                            <div className="text-center">
                                <button type="button" className="skel-btn-submit" onClick={changePassword}>Update</button>&nbsp;
                                <button type="button" className="skel-btn-cancel" onClick={handelcancel}>Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>

    )
};

export default ChangePassword;
