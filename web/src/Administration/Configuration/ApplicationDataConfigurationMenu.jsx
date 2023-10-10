import React from 'react';
import { useHistory, } from "react-router-dom";
import image6 from '../../assets/images/app-config.svg';
import image4 from '../../assets/images/business-config.svg';
import image5 from '../../assets/images/mapping-config.svg';
import image2 from '../../assets/images/settings-config.svg';
import image1 from '../../assets/images/store-config.svg';
import image3 from '../../assets/images/user-config.svg';

const ApplicationDataConfigurationMenu = (props) => {
    const { totalCount } = props
    const history = useHistory();

    return (
        <div className="skel-appl-config mb-4">
            <div className="row">
                <div className="col-lg-4 col-md-4 col-xs-12 skel-res-m">
                    <div className="skel-config-steps" onClick={() => {
                        history.push(`${process.env.REACT_APP_BASE}/organisation-management`, { data: { sourceName: "adminOrgHierarchy" } })
                    }}>
                        <span className="material-icons"><img src={image1} alt="" className="img-fluid" /></span>
                        <div className="skel-config-details">
                            <span className="skel-step-styl">Step-1</span>
                            <span className="skel-app-heading">
                                Business Unit
                            </span>
                            <p>Configure your basic site settings.</p>
                            <span className="skel-step-styl mt-3">est. 5 minutes <span className={totalCount?.department > 0 ? "material-icons skel-config-active-tick" : 'material-icons'}>check_circle</span></span>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-md-4 col-xs-12 skel-res-m">
                    <div className="skel-config-steps" onClick={() => history.push(`${process.env.REACT_APP_BASE}/role-management`, { data: { sourceName: "adminRoleList" } })}>
                        <span className="material-icons"><img src={image2} alt="" className="img-fluid" /></span>
                        <div className="skel-config-details">
                            <span className="skel-step-styl">Step-2</span>
                            <span className="skel-app-heading">
                                Roles
                            </span>
                            <p>Configure your basic site settings.</p>
                            <span className="skel-step-styl mt-3">est. 5 minutes <span className={totalCount?.role > 0 ? "material-icons skel-config-active-tick" : 'material-icons'}>check_circle</span></span>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4 col-md-4 col-xs-12 skel-res-m">
                    <div className="skel-config-steps" onClick={() => history.push(`${process.env.REACT_APP_BASE}/user-management`, { data: { sourceName: "userManagement" } })}>
                        <span className="material-icons"><img src={image3} alt="" className="img-fluid" /></span>
                        <div className="skel-config-details">
                            <span className="skel-step-styl">Step-3</span>
                            <span className="skel-app-heading">
                                User
                            </span>
                            <p>Configure your basic site settings.</p>
                            <span className="skel-step-styl mt-3">est. 5 minutes <span className={totalCount?.user > 0 ? "material-icons skel-config-active-tick" : 'material-icons'}>check_circle</span></span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row mt-3">
                <div className="col-lg-4 col-md-4 col-xs-12 skel-res-m">
                    <div className="skel-config-steps" onClick={() => history.push(`${process.env.REACT_APP_BASE}/business-parameter-management`)}>
                        <span className="material-icons"><img src={image4} alt="" className="img-fluid" /></span>
                        <div className="skel-config-details">
                            <span className="skel-step-styl">Step-4</span>
                            <span className="skel-app-heading">
                                Business Masters
                            </span>
                            <p>Configure your basic site settings.</p>
                            <span className="skel-step-styl mt-3">est. 5 minutes <span className={totalCount?.businessEntity > 0 ? "material-icons skel-config-active-tick" : 'material-icons'}>check_circle</span></span>
                        </div>
                    </div>
                </div>
                {/* <div className="col-lg-4 col-md-4 col-xs-12 skel-res-m">
                    <div className="skel-config-steps" onClick={() => history.push(`${process.env.REACT_APP_BASE}/business-parameter-mapping`)}>
                        <span className="material-icons"><img src={image5} alt="" className="img-fluid" /></span>
                        <div className="skel-config-details">
                            <span className="skel-step-styl">Step-5</span>
                            <span className="skel-app-heading">
                                Business Data Mapping
                            </span>
                            <p>Configure your basic site settings.</p>
                            <span className="skel-step-styl mt-3">est. 5 minutes <span className={totalCount?.businessEntity > 0 ? "material-icons skel-config-active-tick" : 'material-icons'}>check_circle</span></span>
                        </div>
                    </div>
                </div> */}
                <div className="col-lg-4 col-md-4 col-xs-12 skel-res-m">
                    <div className="skel-config-steps" onClick={() => history.push(`${process.env.REACT_APP_BASE}/request-statement-list`)}>
                        <span className="material-icons"><img src={image6} alt="" className="img-fluid" /></span>
                        <div className="skel-config-details">
                            <span className="skel-step-txt">Step-5</span>
                            <span className="skel-app-heading">
                                Requested Statement Setup
                            </span>
                            <p>Configure your basic site settings.</p>
                            <span className="skel-step-styl mt-3">est. 5 minutes <span className={totalCount?.request > 0 ? "material-icons skel-config-active-tick" : 'material-icons'}>check_circle</span></span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ApplicationDataConfigurationMenu