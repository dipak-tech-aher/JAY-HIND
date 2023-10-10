import React from 'react'
import { useHistory } from "react-router-dom";

const ConfigurationSettings = () => {

    const history = useHistory();
    return (
        <div className="cnt-wrapper">
            <div className="card-skeleton">
                <div className="customer-skel">
                    <div className="cmmn-skeleton">
                        <div className="row">
                            <div className="skel-configuration-settings">
                                <div className="col-md-8">
                                    <div className="skel-config-top-sect">
                                        <h2>Configure your store setup</h2>
                                        <p>Follow the setup wizard that will guide you through the remaining steps to complete the configuration setup.</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <img src="./assets/images/store.svg" alt="" className="img-fluid" />
                                </div>
                            </div>
                        </div>
                        <div className="row mb-4">
                            <div className="skel-config-info-layout skel-main-configure-screen">
                                <div className="skel-config-data">
                                    <span className="skel-config-icon"><i className="material-icons">settings</i></span>
                                    <div className="skel-config-cnt">
                                        <span className="skel-config-heading">System Parameter</span>
                                        <p>Setup the System Parameters.</p>
                                    </div>
                                    <div className="skel-config-btn">
                                        <button type="button" className="skel-btn-submit" onClick={() => history.push(`${process.env.REACT_APP_BASE}/system-parameters`)}>Setup</button>
                                    </div>
                                </div>
                                <div className="skel-config-data">
                                    <span className="skel-config-icon skel-config-purple"><i className="material-icons">settings</i></span>
                                    <div className="skel-config-cnt">
                                        <span className="skel-config-heading">Application Data Configuration</span>
                                        <p>Configure the Application Data.</p>
                                    </div>
                                    <div className="skel-config-btn">
                                        <button type="button" className="skel-btn-submit" onClick={() => history.push(`${process.env.REACT_APP_BASE}/application-data-configuration`)}>Configure</button>
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

export default ConfigurationSettings