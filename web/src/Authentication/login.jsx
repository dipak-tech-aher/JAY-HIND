import { isEmpty } from 'lodash';
import moment from 'moment';
import React, { useContext, useEffect, useState } from "react";
import Captcha from 'react-google-recaptcha';
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from 'sweetalert2';
import { object, string } from "yup";
import { AppContext } from "../AppContext";
import appleLogo from '../assets/images/Apple-icon.svg';
import googleLogo from '../assets/images/Google_icon.svg';
import windowsLogo from '../assets/images/windows-icon.svg';
import { get, post, remove } from "../common/util/restUtil";
import { properties } from "../properties";

const validationSchema = object().shape({
  loginId: string("Please Enter Valid User ID").required("Please Enter User ID"),
  password: string().required("Please Enter Password"),
});

const emailValidationSchema = object().shape({
  loginId: string().email("Please Enter Valid Email ID").matches(
    /^[A-Za-z0-9._]+@[A-Za-z0-9.-]+$/,
    "Enter Valid Email ID"
  ).required("Please Enter Email ID"),
  password: string().required("Please Enter Password"),
});

const Login = () => {
  const { t } = useTranslation();
  const [showPassword, setShowPassword] = useState(false)
  const history = useHistory();
  const [userCred, setUserCred] = useState({ loginId: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState({});
  const [apiMessage, setApiMessage] = useState();
  const [validCaptcha, setValidCaptcha] = useState(false);
  const [showHelpMenu, setShowHelpMenu] = useState(false)
  const [appsConfig, setAppsConfig] = useState({})

  let { auth, setAuth, appConfig } = useContext(AppContext);

  useEffect(() => {
    const remember = localStorage.getItem('rememberMe') === 'true';
    const user = remember ? localStorage.getItem('user') : '';
    const password = remember ? localStorage.getItem('password') : '';
    setUserCred({ ...userCred, loginId: user, password: password })
    setRememberMe(remember)
    if (auth && auth.accessToken && auth.user && auth.accessToken !== '') {
      history.push(`${process.env.REACT_APP_BASE}/}`);
    }
  }, [auth]);

  const validate = (schema) => {
    try {
      schema.validateSync(userCred, { abortEarly: false });
    } catch (e) {
      e.inner.forEach((err) => {
        setError((prevState) => {
          return { ...prevState, [err.params.path]: err.message };
        });
      });
      return e;
    }
  };

  const [style, setStyle] = useState("cont");

  const changeStyle = () => {
    setStyle("cont2");
  };

  const verifyCaptcha = (res) => {
    console.log(res, 'captcaha')
    setValidCaptcha(res ? true : false);
  }
  const login = () => {
    let dashboardData = {
      refresh: false,
      autoRefresh: false,
      timer: 5,
      selfDept: 'self',
      startDate: moment().startOf('year').format('DD-MM-YYYY'),
      endDate: moment().format('DD-MM-YYYY'),
    }
    let helpDeskSettings = {
      refresh: false,
      autoRefresh: false,
      timer: 1,
      startDate: moment().startOf('year').format('DD-MM-YYYY'),
      endDate: moment().format('DD-MM-YYYY'),
    }
    setApiMessage("");
    let error
    if (userCred.loginId.includes('@')) {
      error = validate(emailValidationSchema);
    } else {
      error = validate(validationSchema);
    }
    // if(userCred.loginId.includes('@') || userCred.loginId.includes('.')  || userCred.loginId.includes('.com') || (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/).test(userCred.loginId)) {
    //   error = validate(emailValidationSchema);
    // } else {
    //   error = validate(validationSchema);
    // }
    if (error) return;

    if (validCaptcha === true) {

      userCred['channel'] = properties.CHANNEL.UAM_WEB;


      post(properties.AUTH_API + "/login", userCred)
        .then((resp) => {
          if (resp.data) {
            if (resp.data.anotherSession) {
              Swal.fire({
                text: "Another session of dtWorks is already active, You can only run one session at a time with your login. Choose Logout to terminate the existing session !",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, Logout !',
                allowOutsideClick: false
              }).then((result) => {
                if (result.isConfirmed) {
                  remove(properties.AUTH_API + "/logout/" + resp.data.userId)
                  login();
                }
              })
            }
            if (resp.data.status === 'TEMP') {
              history.push(`${process.env.REACT_APP_BASE}/user/change-password/` + resp.data.inviteToken, { data: resp.data });
              toast.error("Please reset your password")
            }
            if (resp.data && resp.data.challengeName === "NEW_PASSWORD_REQUIRED") {
              history.push("/user/forceChangePassword/" + resp.data.loginId + "/" + resp.data.session);
            } else {
              let loginData = resp.data;
              loginData["dashboardData"] = dashboardData
              loginData["helpDeskData"] = helpDeskSettings
              loginData["helpDeskInteractionData"] = helpDeskSettings
              setAuth(loginData);
              sessionStorage.setItem("auth", JSON.stringify(loginData));
              localStorage.setItem("accessToken", resp.data.accessToken);
              localStorage.setItem('rememberMe', rememberMe);
              localStorage.setItem('user', rememberMe ? userCred.loginId : '');
              localStorage.setItem('password', rememberMe ? userCred.password : '')
            }
          } else {
            console.log(resp.message, 'hiii');
            setApiMessage(resp.message);
          }
        }).catch((error) => {
          console.log(error)
        })
        .finally();
    } else {
      toast.error("You missed to click the captcha")
      return;
    }

  };

  useEffect(() => {
    // if (!isEmpty(appConfig)) {
    //   setAppsConfig(appConfig)
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
    <>
      <div className="login-layout-main authentication-bg authentication-bg-pattern">
        <div className="bg-layer account-pages p-0">
          {/* <img src={login1} alt="" className="img-fluid cmmn-lft-img"/> */}
          {/* <img src={login2} alt="" className="img-fluid cmmn-rht-img"/> */}
          <div className="header-main">
            <div className="col login-form p-0">
              <div className="card">
                <div className="card-body p-3">
                  <div className="text-center m-auto">
                    <div className="auth-logo">
                      <Link to="#" className="logo text-center">
                        <span className="logo-lg skel-login-sect">
                          <img src={appsConfig?.appLogo} alt="" height="50" className='img-fluid' />
                        </span>
                      </Link>
                    </div>
                  </div>
                  <hr className="cmmn-hline" />
                  <div className="text-center m-auto">
                    <h3 className="text-muted mb-4 mt-2">Sign In</h3>
                  </div>
                  <div action="#">

                    <div className="form-group mb-2">
                      <label htmlFor="loginId" className="col-form-label">Email ID/User ID<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                      <input
                        className={`form-control ${(error.loginId ? "input-error" : "")}`}
                        type="loginId"
                        placeholder="Enter Your Email/User ID"
                        data-test="loginId"
                        value={userCred.loginId}
                        onChange={(e) => {
                          setUserCred({ ...userCred, loginId: e.target.value });
                          setError({ ...error, loginId: '' })
                        }}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") login();
                        }}
                      />
                      {error.loginId ? <span className="errormsg">{error.loginId}</span> : ""}
                    </div>

                    <div className="form-group mb-2">
                      <label htmlFor="password" className="col-form-label">Password<span className="text-danger font-20 pl-1 fld-imp">*</span></label>
                      <div className="input-group input-group-merge">
                        <input
                          className={`form-control ${(error.password ? "input-error" : "")}`}
                          type={showPassword === false ? "password" : "text"}
                          placeholder="Enter Your Password"
                          data-test="password"
                          value={userCred.password}
                          onChange={(e) => {
                            setUserCred({
                              ...userCred,
                              password: e.target.value,
                            });
                            setError({ ...error, password: '' })
                          }}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") login();
                          }}
                        />
                        <div className={`input-group-append ${showPassword === false ? "" : "show-password"}`} data-password="false" onClick={() => setShowPassword(!showPassword)}>
                          <div className="input-group-text" style={showPassword === false ? { cursor: "pointer" } : { backgroundColor: "", cursor: "pointer" }}>
                            <span className="password-eye font-12"></span>
                          </div>
                        </div>
                        {error.password ? <span className="errormsg">{error.password}</span> : ""}
                      </div>
                    </div>

                    <div className="form-group mb-2 captcha"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") login();
                      }}
                    >
                      <Captcha sitekey={'6LdzapwdAAAAAAyO0js4SHNxfL0hogzYzr47tkjE'} onChange={verifyCaptcha} />
                    </div>

                    <div className="form-group mb-2">
                      <div className="custom-control custom-checkbox">
                        <input type="checkbox" value={rememberMe} checked={rememberMe} onChange={(e) => { setRememberMe(e.target.checked) }} className="custom-control-input" id="checkbox-signin" />
                        <label className="custom-control-label" htmlFor="checkbox-signin">Remember Me</label>
                      </div>
                    </div>

                    <div className="form-group mb-0 text-center">
                      <button className="btn btn-primary btn-block" type="button" data-test="login" onClick={login}>
                        Log In
                      </button>
                    </div>
                    {apiMessage !== "" ? <p className="error-msg">{apiMessage}</p> : ""}

                    <div className="scl-option d-none">
                      <div className="choice-opt"><span>OR</span></div>
                      <a className="scl-signin">
                        <div className="sn-g">
                          <img src={googleLogo} alt="Google" className="img-fluid" />
                          <span>Sign in with Google</span>
                        </div>
                      </a>
                      <a className="scl-signin">
                        <div className="sn-g">
                          <img src={windowsLogo} alt="Windows" className="img-fluid" />
                          <span>Sign in with Microsoft</span>
                        </div>
                      </a>
                      <a className="scl-signin">
                        <div className="sn-g">
                          <img src={appleLogo} alt="Apple" className="img-fluid" />
                          <span>Sign in with Apple</span>
                        </div>
                      </a>
                    </div>
                    <div className="bg-gray mt-2 reg-lnk" >
                      <p className="toggl-flip" onClick={() => setShowHelpMenu(!showHelpMenu)}>Need help with your account?</p>
                      {
                        showHelpMenu &&
                        <div className="lst-lnks">
                          <Link to={`${process.env.REACT_APP_BASE}/user/register`} data-test="register" >Register new user</Link>
                          <Link to={`${process.env.REACT_APP_BASE}/user/forgotpassword`} data-test="forgotPass">Forgot Password?</Link>
                          <Link to={`${process.env.REACT_APP_BASE}/user/faq`} data-test="forgotPass">FAQs?</Link>
                        </div>
                      }
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
      </div>
    </>
  );
};

export default Login;
