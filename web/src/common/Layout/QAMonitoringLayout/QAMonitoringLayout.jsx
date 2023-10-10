import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { post } from '../../../common/util/restUtil';
import { properties } from '../../../properties';

const QAMonitoringLayout = (props) => {
    const urlName = props?.match?.url
    const screenName = props.location?.state?.source;
    const [quickLinks, setQuickLinks] = useState([{}])
    const [isQuickLinkEnabled, setIsQuickLinkEnabled] = useState(true)

    useEffect(() => {
        const requestBody = {
            screenName: "Portal Settings",
            moduleName: "Admin"
        }
        
        post(properties.MAINMENU_API + '/getQuickLinks', requestBody)
            .then((response) => {
                setQuickLinks(response.data[0].links.qualityMonitoring)
            })
            .catch((error) => {
                console.log("error", error)
            })
            .finally()
    }, [])

    return (
        <div className='col-12 pl-2'>
            <div className="row">
                <div className="col-10">
                    <div className="page-title-box">
                        <h4 className="page-title text-capitalize">Helpdesk Quality {screenName?.toLowerCase()}</h4>
                    </div>
                </div>
                <div className="form-inline">
                    <span className="ml-1" >Quick Link</span>
                    <div className="switchToggle ml-1">
                        <input type="checkbox" id="quickLink" checked={isQuickLinkEnabled} onChange={() => {
                            setIsQuickLinkEnabled(!isQuickLinkEnabled)
                        }} />
                        <label htmlFor="quickLink">Toggle</label>
                    </div>
                </div>
            </div>
            <div className='row mt-1'>
                <div className={isQuickLinkEnabled ?'col-10':'col-12'}>
                    {props.children}
                </div>
              {isQuickLinkEnabled &&  <div className="col-2">
                    <div className="card p-2">
                        <div className="title-box show">
                            <h5 className="menu-title">Quick Links</h5>
                            <ul className="nav flex-column">
                                {
                                    quickLinks && quickLinks.map((e) => (
                                        <li className="nav-item">
                                            <Link className={`nav-link list-group-item list-group-item-action ${urlName.includes(e.includes) ? 'active' : ''}`} to={{ pathname: `${process.env.REACT_APP_BASE}`+e.url, state: { source: e.source} }}>{e.name}</Link>                                        
                                            </li>
                                    ))

                                }
                                {/* <li className="nav-item">
                                    <Link className={`nav-link list-group-item list-group-item-action ${urlName.includes('evaluation') ? 'active' : ''}`} to={{ pathname: `${process.env.REACT_APP_BASE}/portal-settings/quality-monitoring/evaluation`, state: { source: 'EVALUATION' } }}>Evaluation Sections</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className={`nav-link list-group-item list-group-item-action ${urlName.includes('guidelines') ? 'active' : ''}`} to={{ pathname: `${process.env.REACT_APP_BASE}/portal-settings/quality-monitoring/guidelines`, state: { source: 'GUIDELINES' } }}>Quality Guidelines</Link>
                                </li> */}
                            </ul>
                        </div>
                    </div>
                </div>}
            </div>
        </div>
    )
}

export default QAMonitoringLayout;