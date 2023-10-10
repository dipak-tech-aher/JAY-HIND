import React from "react";
import { Link } from "react-router-dom";
import Footer from "../common/footer";
import login1 from '../assets/images/login1.jpg';
import login2 from '../assets/images/login2.jpg';
import logoLight from '../assets/images/logo-light.png';

const HomeScreen = () => {

    return (
        <div className="authentication-bg authentication-bg-pattern">
            <div className="account-pages mt-2 mt-3 p-0">
                <img src={login1} alt="" className="img-fluid cmmn-lft-img" />
                <img src={login2} alt="" className="img-fluid cmmn-rht-img" />
                <div className="loginboxshadow bg-white">
                    <div className="row">
                        <div className="col login-form p-0">
                            <div className="card">
                                <div className="card-body p-3">
                                    <div className="text-center m-auto">
                                        <div className="auth-logo">
                                            <Link to="#" className="logo text-center">
                                                <span className="logo-lg">
                                                    <img src={logoLight} alt="" height="50" />
                                                </span>
                                            </Link>
                                        </div>
                                    </div>
                                    <hr className="horz-line"/>
                                    <div className="text-center m-auto">
                                        <h3 className="text-muted mb-4 mt-2">Home Screen</h3>
                                    </div>
                                    <div id="step2">
                                        <fieldset className="scheduler-border">
                                            <h3>You have login in Succesfully. Welcome to dtWorks. Thank you.</h3>
                                        </fieldset>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer/>
        </div >
    );
};

export default HomeScreen;
