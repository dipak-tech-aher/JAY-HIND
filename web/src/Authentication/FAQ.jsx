/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext, useEffect, useState } from 'react'
import { Link } from "react-router-dom";
// import logoLight from '../assets/images/logo-light.png';
import Footer from "../common/footer";
import { AppContext } from "../AppContext";
import { properties } from '../properties';
import { get } from '../common/util/restUtil';
import { isEmpty } from 'lodash';

const FAQ = () => {

    let { appConfig } = useContext(AppContext);
    const [appsConfig, setAppsConfig] = useState({})

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
        <div className="authentication-bg authentication-bg-pattern">
            <div className="faq-login mt-0 p-2">
                <div className="faq-header-logo">
                    <a className="logo">
                        <span className="logo-lg">
                            <img src={appsConfig?.appLogo} alt="" height="50" />
                        </span>
                    </a>
                    {/* <a className="logo text-center">
                        <span className="logo-lg">
                            <img src="./assets/images/placeholder.png" alt="" height="50"/>
                        </span>
                    </a> */}
                </div>
                <Link to={`${process.env.REACT_APP_BASE}/user/login`} className="skel-btn-cancel">Back</Link>
            </div>
            <div className="faq-manin-cnt">
                <h3 className="text-muted mb-4 mt-2">Frequently asked questions</h3>
                <div className="accordion" id="faq">
                    {appsConfig && appsConfig?.appFaq && appsConfig?.appFaq.length > 0 && appsConfig?.appFaq.map((f, i) => (
                        <div key={'idx_' + i} id={'idx_' + i} className="card">
                            <div className="card-header" id="faqhead1">
                                <a className="btn btn-header-link" data-toggle="collapse" data-target="#faq1"
                                    aria-expanded="true" aria-controls="faq1">{f?.faqAnswer}</a>
                            </div>

                            <div id="faq1" className="collapse show" aria-labelledby="faqhead1" data-parent="#faq">
                                <div className="card-body">
                                    {f?.faqQuestion}
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* <div className="card">
                    <div className="card-header" id="faqhead2">
                        <a className="btn btn-header-link collapsed" data-toggle="collapse" data-target="#faq2"
                        aria-expanded="true" aria-controls="faq2">I forgot my Username. How do I obtain it?</a>
                    </div>

                    <div id="faq2" className="collapse" aria-labelledby="faqhead2" data-parent="#faq">
                        <div className="card-body">
                            <a >Click here</a> to have your password e-mailed to you. If you experience difficulty, you may also contact ASQ.
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header" id="faqhead3">
                        <a  className="btn btn-header-link collapsed" data-toggle="collapse" data-target="#faq3"
                        aria-expanded="true" aria-controls="faq3">I’m a new visitor to ASQ. How do I login?</a>
                    </div>

                    <div id="faq3" className="collapse" aria-labelledby="faqhead3" data-parent="#faq">
                        <div className="card-body">
                            As you explore ASQ web sites you may encounter content that is only accessible to ASQ Members and registered visitors. Should you encounter this type of content, a login screen displays and you need to create an account. Upon completing the registration process you will be able to login using the email and password you entered during account creation. For return visits enter your Username and Password in the login box, which is located throughout the ASQ site.
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header" id="faqhead4">
                        <a  className="btn btn-header-link collapsed" data-toggle="collapse" data-target="#faq4"
                        aria-expanded="true" aria-controls="faq4">I’m a member of ASQ. How do I login?</a>
                    </div>

                    <div id="faq4" className="collapse" aria-labelledby="faqhead4" data-parent="#faq">
                        <div className="card-body">
                            The first time you login, enter your Username and Password in the login box which is located throughout the ASQ site. If you cannot remember your Username or Password use the Forgot Username or Forgot Password links to receive a reset email to your primary email address with ASQ.
                        </div>
                    </div>
                </div>
                <div className="card">
                    <div className="card-header" id="faqhead5">
                        <a  className="btn btn-header-link collapsed" data-toggle="collapse" data-target="#faq5"
                        aria-expanded="true" aria-controls="faq5">What can I access when I login?</a>
                    </div>

                    <div id="faq5" className="collapse" aria-labelledby="faqhead5" data-parent="#faq">
                        <div className="card-body">
                            Different types of visitors have different levels of access to our materials.
                            <ul className="faq-ul">
                                <li>Registered Visitors can see and access a wide variety of articles and PDFs from ASQ. They won’t see materials restricted to members, such as articles from our magazines and journals.</li>
                                <li>Subscribers can see what registered visitors can see, as well as articles from the journals or magazines to which they subscribe.</li>
                                <li>Members can access even more materials from our journals and magazines, as well as a much larger archive of quality tools and resources.</li>
                            </ul>                            
                        </div>
                    </div>
                </div> */}
                </div>
            </div>
            <Footer></Footer>
        </div>
    )
}

export default FAQ