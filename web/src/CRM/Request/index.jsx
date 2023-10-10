import React, { useState } from 'react'
import RequestImg from "../../assets/images/request.png";
import RequestTable from './table';

const Request = (props) => {
    const { props: componentProps } = props
    const requestStatus = componentProps?.type;
    const screenAction = componentProps?.screenAction;

    const [selectedTab, setSelectedTab] = useState('my-request');
    const tabs = [
        { id: 'my-request', label: 'My Request' },
        // { id: 'team-request', label: 'Team Request' },
    ];

    return (
        <div className="cnt-wrapper">
            <div className="card-skeleton">
                <div className="customer-skel">
                    <div className="cmmn-skeleton">
                        <div className="row">
                            <div className="skel-configuration-settings">
                                <div className="col-md-9">
                                    <div className="skel-config-top-sect">
                                        <h2>{screenAction}</h2>
                                        <p> Send user mapping or access or any portal related request to portal admin </p>
                                        <span className="skel-step-styl mb-3"> est. 1 minutes{" "} <span className="material-icons skel-config-active-tick"> check_circle </span></span>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <img src={RequestImg} alt="" className="img-fluid" />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="skel-config-base col-xl-12">
                                <div>
                                    {/* <ul className="nav nav-tabs nav-bordered">
                                        {tabs.map((tab, index) => (
                                            <li key={tab.id} className="nav-item" onClick={() => setSelectedTab(tab.id)}>
                                                <a href={`#${tab.id}`} data-toggle="tab" aria-expanded="false" className={`nav-link ${!index ? 'active' : ''}`}> {tab.label} </a>
                                            </li>
                                        ))}
                                    </ul> */}
                                    <div className="tab-content">
                                        {tabs.map((tab, index) => (
                                            <div className={`tab-pane ${!index ? 'show active' : ''}`} key={tab.id} id={tab.id}>
                                                <div className="card-body" id={`datatable_${tab.id}`}>
                                                    <RequestTable 
                                                        requestStatus={requestStatus}
                                                        selectedTab={selectedTab}
                                                        screenAction={screenAction}
                                                    />
                                                </div>
                                            </div>
                                        ))}
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

export default Request